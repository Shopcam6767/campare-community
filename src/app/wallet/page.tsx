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
  return <div className="mx-auto max-w-3xl px-4 py-8">
    <h1 className="text-2xl font-bold">กระเป๋าเงิน Shopcam</h1>
    <p className="mt-1 text-sm text-amber-700">โหมดสำหรับโครงงาน: KBank PromptPay Sandbox ไม่มีการตัดเงินจริง</p>
    <div className="mt-6 grid gap-6 md:grid-cols-2">
      <section className="rounded-card bg-ink-900 p-6 text-white"><p className="text-sm text-ink-300">ยอดเงินคงเหลือ</p><p className="mt-2 text-3xl font-bold">{formatPrice(balance)}</p><p className="mt-3 text-xs text-ink-300">เงินเข้ากระเป๋าจะมี ledger อ้างอิงทุกครั้ง</p></section>
      <section className="rounded-card border border-ink-100 p-6"><h2 className="font-bold">เติมเงินด้วย KBank</h2><p className="mt-1 text-xs text-ink-500">สร้างรายการ แล้วทดสอบการจ่ายผ่าน QR Simulator ของ KBank</p><div className="mt-4"><TopupForm /></div></section>
    </div>
    <section className="mt-8"><h2 className="font-bold">รายการล่าสุด</h2><div className="mt-3 divide-y rounded-card border border-ink-100">{(entries ?? []).length ? entries!.map((entry) => <div key={entry.id} className="flex items-center justify-between p-4 text-sm"><div><p className="font-medium">{entry.note ?? entry.entry_type}</p><p className="text-xs text-ink-500">{new Date(entry.created_at).toLocaleString("th-TH")}</p></div><span className={Number(entry.amount) > 0 ? "font-semibold text-green-600" : "font-semibold text-red-600"}>{Number(entry.amount) > 0 ? "+" : ""}{formatPrice(Number(entry.amount))}</span></div>) : <p className="p-4 text-sm text-ink-500">ยังไม่มีรายการ</p>}</div></section>
  </div>;
}
