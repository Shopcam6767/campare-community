-- =====================================================================
-- 0015_review_verified_purchase.sql
-- บังคับว่าผู้ที่จะเขียนรีวิวหรือให้คะแนนสินค้า ต้องมีประวัติการซื้อสินค้านั้นจริง
-- (สถานะคำสั่งซื้อเป็น paid, shipped หรือ completed)
-- =====================================================================

-- ฟังก์ชันตรวจสอบว่าผู้ใช้เคยซื้อสินค้าชิ้นนี้จริงหรือไม่
create or replace function public.has_purchased_product(p_product_id uuid, p_user_id uuid)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1
    from order_items oi
    join orders o on o.id = oi.order_id
    where oi.product_id = p_product_id
      and o.buyer_id = p_user_id
      and o.status in ('paid', 'shipped', 'completed')
  );
$$;

-- ปรับปรุง RLS Policy ของตาราง reviews สำหรับ INSERT
drop policy if exists "user writes own review" on reviews;
create policy "user writes own review"
  on reviews for insert
  with check (
    author_id = auth.uid()
    and (public.is_admin() or public.has_purchased_product(product_id, auth.uid()))
  );

-- ปรับปรุง RLS Policy ของตาราง reviews สำหรับ UPDATE
drop policy if exists "user edits own review" on reviews;
create policy "user edits own review"
  on reviews for update
  using (
    (author_id = auth.uid() and (public.is_admin() or public.has_purchased_product(product_id, auth.uid())))
    or public.is_admin()
  )
  with check (
    (author_id = auth.uid() and (public.is_admin() or public.has_purchased_product(product_id, auth.uid())))
    or public.is_admin()
  );
