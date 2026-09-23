"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type WalletState = { error?: string; topupId?: string; reference?: string; amount?: number; paid?: boolean };

export async function createSandboxTopup(_previous: WalletState, formData: FormData): Promise<WalletState> {
  const amount = Number(formData.get("amount"));
  if (!Number.isFinite(amount) || amount < 10 || amount > 50000) {
    return { error: "ระบุจำนวนเงินตั้งแต่ 10 ถึง 50,000 บาท" };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "กรุณาเข้าสู่ระบบก่อนเติมเงิน" };
  const { data, error } = await supabase.rpc("create_kbank_sandbox_topup", { p_amount: amount });
  if (error || !data) return { error: `สร้างรายการเติมเงินไม่สำเร็จ: ${error?.message ?? "ไม่ทราบสาเหตุ"}` };
  return { topupId: data.id, reference: data.provider_reference, amount: Number(data.amount) };
}

export async function confirmSandboxTopup(topupId: string): Promise<WalletState> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("confirm_kbank_sandbox_topup", { p_topup_id: topupId });
  if (error || !data) return { error: `ยืนยันรายการไม่สำเร็จ: ${error?.message ?? "ไม่ทราบสาเหตุ"}` };
  revalidatePath("/wallet");
  revalidatePath("/", "layout");
  return { paid: data.status === "paid", reference: data.provider_reference, amount: Number(data.amount) };
}
