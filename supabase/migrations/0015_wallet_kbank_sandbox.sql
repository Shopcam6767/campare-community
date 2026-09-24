-- Wallet ledger for the university demo. Money is represented in satang (numeric(12,2)).
-- Never update wallet_accounts directly from the client; all balance movements use RPCs below.

do $$
begin
  if not exists (select 1 from pg_type where typname = 'wallet_topup_status') then
    create type wallet_topup_status as enum ('pending', 'paid', 'expired', 'failed');
  end if;
  if not exists (select 1 from pg_type where typname = 'wallet_entry_type') then
    create type wallet_entry_type as enum ('topup', 'purchase', 'refund', 'seller_hold', 'seller_payout');
  end if;
end $$;

create table if not exists wallet_accounts (
  user_id uuid primary key references profiles(id) on delete cascade,
  available_balance numeric(12,2) not null default 0 check (available_balance >= 0),
  updated_at timestamptz not null default now()
);

create table if not exists wallet_topups (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  provider text not null default 'kbank_sandbox',
  provider_reference text not null unique,
  amount numeric(12,2) not null check (amount > 0 and amount <= 50000),
  status wallet_topup_status not null default 'pending',
  qr_payload text,
  expires_at timestamptz not null default now() + interval '15 minutes',
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists wallet_ledger (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete restrict,
  entry_type wallet_entry_type not null,
  amount numeric(12,2) not null check (amount <> 0),
  reference_type text not null,
  reference_id uuid,
  note text,
  created_at timestamptz not null default now(),
  unique (reference_type, reference_id, user_id, entry_type)
);

create index if not exists wallet_topups_user_created_idx on wallet_topups (user_id, created_at desc);
create index if not exists wallet_ledger_user_created_idx on wallet_ledger (user_id, created_at desc);

alter table wallet_accounts enable row level security;
alter table wallet_topups enable row level security;
alter table wallet_ledger enable row level security;

drop policy if exists "users read own wallet account" on wallet_accounts;
create policy "users read own wallet account" on wallet_accounts for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "users read own topups" on wallet_topups;
create policy "users read own topups" on wallet_topups for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "users read own wallet ledger" on wallet_ledger;
create policy "users read own wallet ledger" on wallet_ledger for select to authenticated
  using ((select auth.uid()) = user_id);

-- Creates only a pending payment intent. A client cannot select its own paid status or balance.
create or replace function public.create_kbank_sandbox_topup(p_amount numeric)
returns wallet_topups
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_topup wallet_topups;
begin
  if v_user_id is null then raise exception 'Authentication required'; end if;
  if p_amount is null or p_amount <= 0 or p_amount > 50000 or p_amount <> round(p_amount, 2) then
    raise exception 'Invalid top-up amount';
  end if;

  insert into wallet_accounts (user_id) values (v_user_id) on conflict (user_id) do nothing;
  insert into wallet_topups (user_id, provider_reference, amount)
  values (v_user_id, 'KBS-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 12)), p_amount)
  returning * into v_topup;
  return v_topup;
end;
$$;

-- Sandbox-only confirmation. Production must revoke this function and call a verified KBank webhook instead.
create or replace function public.confirm_kbank_sandbox_topup(p_topup_id uuid)
returns wallet_topups
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_topup wallet_topups;
begin
  if v_user_id is null then raise exception 'Authentication required'; end if;
  select * into v_topup from wallet_topups
    where id = p_topup_id and user_id = v_user_id for update;
  if not found then raise exception 'Top-up not found'; end if;
  if v_topup.status <> 'pending' then return v_topup; end if;
  if v_topup.expires_at <= now() then
    update wallet_topups set status = 'expired' where id = v_topup.id returning * into v_topup;
    return v_topup;
  end if;

  update wallet_topups set status = 'paid', paid_at = now() where id = v_topup.id returning * into v_topup;
  update wallet_accounts set available_balance = available_balance + v_topup.amount, updated_at = now()
    where user_id = v_user_id;
  insert into wallet_ledger (user_id, entry_type, amount, reference_type, reference_id, note)
    values (v_user_id, 'topup', v_topup.amount, 'wallet_topup', v_topup.id, 'KBank sandbox QR payment');
  return v_topup;
end;
$$;

revoke all on function public.create_kbank_sandbox_topup(numeric) from public;
revoke all on function public.confirm_kbank_sandbox_topup(uuid) from public;
grant execute on function public.create_kbank_sandbox_topup(numeric) to authenticated;
grant execute on function public.confirm_kbank_sandbox_topup(uuid) to authenticated;
