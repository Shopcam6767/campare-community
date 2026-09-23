"use client";

import { useActionState, useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  confirmSandboxTopup,
  createSandboxTopup,
  checkTopupStatus,
  type WalletState,
} from "@/app/wallet/actions";
import SubmitButton from "@/components/auth/submit-button";

const initial: WalletState = {};

export default function TopupForm() {
  const [state, action] = useActionState(createSandboxTopup, initial);
  const [result, setResult] = useState<WalletState>({});
  const [isConfirming, setIsConfirming] = useState(false);
  const [showDevPanel, setShowDevPanel] = useState(false);
  const [timeLeft, setTimeLeft] = useState(900); // 15 mins (900s)

  const active = result.topupId ? result : state;

  // นาฬิกานับถอยหลัง 15 นาที
  useEffect(() => {
    if (!active.topupId || result.paid) return;
    setTimeLeft(900);
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [active.topupId, result.paid]);

  // ระบบ Auto-Polling: ตรวจจับเงินเข้าอัตโนมัติทุก ๆ 2.5 วินาที
  useEffect(() => {
    if (!active.topupId || result.paid) return;

    const poller = setInterval(async () => {
      try {
        const latest = await checkTopupStatus(active.topupId!);
        if (latest.paid) {
          setResult(latest);
        }
      } catch {
        // ละเว้น error ชั่วคราวระหว่าง polling
      }
    }, 2500);

    return () => clearInterval(poller);
  }, [active.topupId, result.paid]);

  async function confirm() {
    if (!active.topupId) return;
    setIsConfirming(true);
    try {
      setResult(await confirmSandboxTopup(active.topupId));
    } finally {
      setIsConfirming(false);
    }
  }

  function handleReset() {
    setResult({});
    window.location.reload();
  }

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const secs = (seconds % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  };

  if (result.paid) {
    return (
      <div className="rounded-card border border-emerald-200 bg-emerald-50/80 p-5 text-center dark:border-emerald-900/60 dark:bg-emerald-950/30">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/60 dark:text-emerald-400">
          <svg className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="mt-3 text-base font-bold text-emerald-800 dark:text-emerald-300">
          เติมเงิน {result.amount?.toLocaleString("th-TH")} บาทสำเร็จ!
        </p>
        <p className="mt-1 text-xs text-emerald-700/80 dark:text-emerald-400/80">
          Ref: {result.reference} · ยอดเงินเข้าบัญชี Shopcam Wallet เรียบร้อยแล้ว
        </p>
        <button
          type="button"
          onClick={handleReset}
          className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-emerald-300 bg-white px-4 py-2 text-xs font-semibold text-emerald-800 shadow-xs transition hover:bg-emerald-50 dark:border-emerald-800 dark:bg-zinc-900 dark:text-emerald-300"
        >
          เติมเงินเพิ่มอีกครั้ง
        </button>
      </div>
    );
  }

  if (active.topupId) {
    const qrValue = active.qrPayload || `KBANK|${active.reference}|${active.amount}`;

    return (
      <div className="rounded-card border border-brand-200 bg-brand-50/60 p-5 text-center dark:border-brand-900/60 dark:bg-brand-950/20">
        {/* PromptPay Style QR Card */}
        <div className="mx-auto max-w-[260px] overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-md dark:border-zinc-700">
          {/* Thai QR Banner */}
          <div className="bg-[#003d7c] px-3 py-2 text-white">
            <p className="text-[10px] font-semibold tracking-wider">THAI QR PAYMENT</p>
            <p className="text-xs font-bold">พร้อมเพย์ (PromptPay)</p>
          </div>

          <div className="flex flex-col items-center p-4">
            <div className="rounded-xl border border-zinc-100 bg-white p-2">
              <QRCodeSVG value={qrValue} size={180} level="M" includeMargin={false} />
            </div>
            <p className="mt-2 text-xs font-semibold text-zinc-800">
              จำนวนเงิน {active.amount?.toLocaleString("th-TH", { minimumFractionDigits: 2 })} บาท
            </p>
          </div>

          <div className="border-t border-zinc-100 bg-zinc-50 px-3 py-2 text-[11px] text-zinc-500">
            KBank PromptPay Sandbox
          </div>
        </div>

        {/* Source Badge */}
        <div className="mt-3 flex items-center justify-center gap-1.5 text-xs">
          {active.isRealKBankSandbox ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 font-medium text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              เชื่อมต่อ KBank OpenAPI Sandbox
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 font-medium text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
              <span className="size-1.5 rounded-full bg-amber-500" />
              EMVCo PromptPay Sandbox
            </span>
          )}
        </div>

        <p className="mt-2 text-sm font-semibold">
          Ref: <span className="font-mono text-xs">{active.reference}</span>
        </p>

        <p className="mt-1 text-xs text-ink-500">
          หมดอายุใน: <span className="font-mono font-bold text-rose-600 dark:text-rose-400">{formatTimer(timeLeft)}</span>
        </p>

        {/* Real-time Status Indicator (หน้าจอที่ลูกค้าเห็น) */}
        <div className="mt-4 flex items-center justify-center gap-2.5 rounded-xl border border-ink-100 bg-surface/90 px-4 py-3 shadow-xs">
          <span className="relative flex size-2.5">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex size-2.5 rounded-full bg-emerald-500" />
          </span>
          <div className="text-left">
            <p className="text-xs font-semibold text-ink-900">กำลังรอการชำระเงินจาก K PLUS...</p>
            <p className="text-[11px] text-ink-500">ระบบจะอัปเดตยอดเงินอัตโนมัติทันทีเมื่อชำระเสร็จ</p>
          </div>
        </div>

        {/* ปุ่มยกเลิกของลูกค้า */}
        <div className="mt-3">
          <button
            type="button"
            onClick={handleReset}
            className="w-full rounded-lg border border-ink-200 bg-surface px-4 py-2 text-xs font-medium text-ink-600 transition hover:bg-ink-50"
          >
            ยกเลิก / เปลี่ยนจำนวนเงิน
          </button>
        </div>

        {/* Developer Test Panel (กล่องเครื่องมือทดสอบสำหรับอาจารย์/ผู้พรีเซนต์) */}
        <div className="mt-5 border-t border-ink-200/60 pt-3 text-left">
          <button
            type="button"
            onClick={() => setShowDevPanel((prev) => !prev)}
            className="flex w-full items-center justify-between text-[11px] font-medium text-ink-500 transition hover:text-ink-800"
          >
            <span className="flex items-center gap-1.5">
              <span>🛠️</span>
              <span>Developer Test Panel (สำหรับพรีเซนต์/ผู้ตรวจ)</span>
            </span>
            <span className="text-xs">{showDevPanel ? "▲ ยุบเก็บ" : "▼ ขยาย"}</span>
          </button>

          {showDevPanel && (
            <div className="mt-2.5 rounded-lg border border-dashed border-brand-300 bg-brand-50/50 p-3 text-xs dark:border-brand-800/80 dark:bg-brand-950/40">
              <p className="text-[11px] leading-relaxed text-ink-600 dark:text-ink-400">
                ในระบบจริง ธนาคารกสิกรไทยจะส่ง Webhook มายืนยันยอดเงินอัตโนมัติ ในการทดสอบโครงงานนี้
                คุณสามารถกดจำลองสัญญาณ Webhook เพื่อทดสอบการตรวจจับอัตโนมัติของหน้าเว็บได้:
              </p>
              <button
                type="button"
                onClick={confirm}
                disabled={isConfirming}
                className="mt-2.5 flex w-full items-center justify-center gap-2 rounded-md bg-zinc-900 px-3 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
              >
                <span>⚡</span>
                <span>
                  {isConfirming ? "กำลังส่งสัญญาณ..." : "จำลองสัญญาณ Webhook จาก KBank (Simulate Payment)"}
                </span>
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-3">
      <label className="block text-sm font-medium" htmlFor="amount">
        จำนวนเงิน (บาท)
      </label>
      <div className="relative">
        <input
          id="amount"
          name="amount"
          type="number"
          min="10"
          max="50000"
          step="0.01"
          required
          placeholder="เช่น 500"
          className="w-full rounded-lg border border-ink-200 bg-surface px-3 py-2.5 outline-none focus:border-brand-400"
        />
        <span className="pointer-events-none absolute right-3 top-2.5 text-sm text-ink-400">฿</span>
      </div>

      <div className="flex gap-2">
        {[100, 300, 500, 1000].map((preset) => (
          <button
            key={preset}
            type="button"
            onClick={() => {
              const input = document.getElementById("amount") as HTMLInputElement;
              if (input) input.value = String(preset);
            }}
            className="flex-1 rounded-md border border-ink-200 bg-surface py-1 text-xs font-medium text-ink-700 transition hover:border-brand-300 hover:bg-brand-50"
          >
            +{preset}
          </button>
        ))}
      </div>

      {state.error && <p className="text-sm text-red-700">{state.error}</p>}
      <SubmitButton pendingText="กำลังสร้าง QR กสิกร…">สร้าง KBank PromptPay QR</SubmitButton>
    </form>
  );
}


