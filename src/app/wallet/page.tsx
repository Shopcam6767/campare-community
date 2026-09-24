import { redirect } from "next/navigation";
import type { Metadata } from "next";
import TopupForm from "@/components/wallet/topup-form";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/queries";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { formatPrice } from "@/lib/format";

export const metadata: Metadata = { title: "กระเป๋าเงิน" };

export default async function WalletPage() {
  if (!isSupabaseConfigured) return <div className="mx-auto max-w-xl px-4 py-16 text-center">หน้านี้ต้องเชื่อม Supabase ก่อน</div>;
  const session = await getCurrentUser();
  if (!session) redirect("/login?next=/wallet");
  const supabase = await createClient();
  const [{ data: account }, { data: entries }] = await Promise.all([
    supabase.from("wallet_accounts").select("available_balance").eq("user_id", session.user.id).maybeSingle(),
    supabase.from("wallet_ledger").select("id, entry_type, amount, note, created_at").order("created_at", { ascending: false }).limit(10),
  ]);
  const balance = Number(account?.available_balance ?? 0);
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-bold">กระเป๋าเงิน Shopcam</h1>
      <p className="mt-1 text-sm text-amber-700 dark:text-amber-400">
        โหมดสำหรับโครงงาน: KBank PromptPay Sandbox ไม่มีการตัดเงินจริง
      </p>
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <section className="relative overflow-hidden rounded-card border border-zinc-800 bg-[#16161b] p-6 text-white shadow-sm dark:border-[#2f2f3d] dark:bg-[#1e1e26]">
          <div className="pointer-events-none absolute -right-6 -top-6 size-32 rounded-full bg-brand-500/10 blur-2xl" />
          <div className="relative flex h-full flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-zinc-300">ยอดเงินคงเหลือ</span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-medium text-zinc-200 backdrop-blur-xs dark:bg-brand-500/15 dark:text-brand-300">
                  <svg className="size-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  Shopcam Pay
                </span>
              </div>
              <p className="mt-3 text-3xl font-extrabold tracking-tight text-white">
                {formatPrice(balance)}
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-xs text-zinc-400">
              <svg className="size-3.5 shrink-0 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span>เงินเข้ากระเป๋าจะมี ledger อ้างอิงทุกครั้ง</span>
            </div>
          </div>
        </section>
        <section className="rounded-card border border-ink-100 bg-surface p-6">
          <h2 className="font-bold">เติมเงินด้วย KBank</h2>
          <p className="mt-1 text-xs text-ink-500">สร้างรายการ แล้วทดสอบการจ่ายผ่าน QR Simulator ของ KBank</p>
          <div className="mt-4">
            <TopupForm />
          </div>
        </section>
      </div>
      <section className="mt-8">
        <h2 className="font-bold">รายการล่าสุด</h2>
        <div className="mt-3 divide-y divide-ink-100 rounded-card border border-ink-100 bg-surface">
          {(entries ?? []).length ? (
            entries!.map((entry) => (
              <div key={entry.id} className="flex items-center justify-between p-4 text-sm">
                <div>
                  <p className="font-medium">{entry.note ?? entry.entry_type}</p>
                  <p className="text-xs text-ink-500">{new Date(entry.created_at).toLocaleString("th-TH")}</p>
                </div>
                <span
                  className={
                    Number(entry.amount) > 0
                      ? "font-semibold text-emerald-600 dark:text-emerald-400"
                      : "font-semibold text-rose-600 dark:text-rose-400"
                  }
                >
                  {Number(entry.amount) > 0 ? "+" : ""}
                  {formatPrice(Number(entry.amount))}
                </span>
              </div>
            ))
          ) : (
            <p className="p-4 text-sm text-ink-500">ยังไม่มีรายการ</p>
          )}
        </div>
      </section>
    </div>
  );
}
