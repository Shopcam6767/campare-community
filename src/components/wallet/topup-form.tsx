"use client";

import { useActionState, useState } from "react";
import { confirmSandboxTopup, createSandboxTopup, type WalletState } from "@/app/wallet/actions";
import SubmitButton from "@/components/auth/submit-button";

const initial: WalletState = {};

export default function TopupForm() {
  const [state, action] = useActionState(createSandboxTopup, initial);
  const [result, setResult] = useState<WalletState>({});
  const active = result.topupId ? result : state;

  async function confirm() {
    if (!active.topupId) return;
    setResult(await confirmSandboxTopup(active.topupId));
  }

  if (result.paid) return <p className="rounded-lg bg-green-50 p-4 text-sm text-green-700">เติมเงิน {result.amount?.toLocaleString("th-TH")} บาทสำเร็จแล้ว (KBank sandbox)</p>;
  if (active.topupId) return (
    <div className="rounded-card border border-brand-200 bg-brand-50 p-5 text-center">
      <div className="mx-auto grid size-48 place-items-center rounded-xl bg-white p-4 shadow-sm">
        <div className="grid size-full place-items-center border-8 border-dashed border-ink-800 text-center text-xs font-bold tracking-wider text-ink-700">K+<br />SANDBOX<br />QR</div>
      </div>
      <p className="mt-4 font-semibold">PromptPay QR (Sandbox)</p>
      <p className="mt-1 text-sm text-ink-600">{active.amount?.toLocaleString("th-TH")} บาท · Ref: {active.reference}</p>
      <p className="mt-2 text-xs text-ink-500">เปิด KBank QR Simulator แล้วค้นหาเลขอ้างอิงนี้เพื่อจำลองการสแกนและการชำระเงิน</p>
      <button type="button" onClick={confirm} className="mt-4 rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-600">ยืนยันผลจาก Sandbox</button>
    </div>
  );

  return <form action={action} className="space-y-3">
    <label className="block text-sm font-medium" htmlFor="amount">จำนวนเงิน (บาท)</label>
    <input id="amount" name="amount" type="number" min="10" max="50000" step="0.01" required placeholder="เช่น 500" className="w-full rounded-lg border border-ink-200 px-3 py-2.5 outline-none focus:border-brand-400" />
    {state.error && <p className="text-sm text-red-700">{state.error}</p>}
    <SubmitButton pendingText="กำลังสร้าง QR…">สร้าง KBank Sandbox QR</SubmitButton>
  </form>;
}
