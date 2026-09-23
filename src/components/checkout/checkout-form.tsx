"use client";

import { useActionState, useState } from "react";
import { placeOrder, type CheckoutState } from "@/app/checkout/actions";
import SubmitButton from "@/components/auth/submit-button";
import AddressFields from "@/components/checkout/address-fields";
import { EMPTY_ADDRESS, type ThaiAddress } from "@/lib/thai-address";

const initial: CheckoutState = {};

const METHODS = [
  { value: "mobile_banking", label: "Mobile Banking", icon: "📱", note: "โอนผ่านแอปธนาคาร" },
  { value: "cash", label: "เงินสด", icon: "💵", note: "ชำระตอนนัดรับ" },
  { value: "credit_debit_card", label: "บัตรเครดิต/เดบิต", icon: "💳", note: "Visa · Mastercard" },
  { value: "coin", label: "Shopcam Coin", icon: "🪙", note: "เหรียญในระบบ" },
] as const;

export default function CheckoutForm() {
  const [state, formAction] = useActionState(placeOrder, initial);
  const [method, setMethod] = useState<string>("mobile_banking");
  const [ship, setShip] = useState<ThaiAddress>(EMPTY_ADDRESS);
  const [bill, setBill] = useState<ThaiAddress>(EMPTY_ADDRESS);
  const [sameBilling, setSameBilling] = useState(true);

  return (
    <form action={formAction} className="space-y-8">
      <input type="hidden" name="payment_method" value={method} />

      <section>
        <h2 className="font-bold">วิธีชำระเงิน</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {METHODS.map((m) => (
            <button
              key={m.value}
              type="button"
              onClick={() => setMethod(m.value)}
              aria-pressed={method === m.value}
              className={
                "flex items-start gap-3 rounded-card border p-4 text-left transition " +
                (method === m.value
                  ? "border-brand-400 bg-brand-50 ring-1 ring-brand-200"
                  : "border-ink-200 hover:border-brand-300")
              }
            >
              <span className="text-2xl leading-none">{m.icon}</span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold">{m.label}</span>
                <span className="block text-xs text-ink-500">{m.note}</span>
              </span>
              <span
                className={
                  "ml-auto mt-1 grid size-4 shrink-0 place-items-center rounded-full border " +
                  (method === m.value
                    ? "border-brand-400 bg-brand-400"
                    : "border-ink-300")
                }
              >
                {method === m.value && (
                  <span className="size-1.5 rounded-full bg-white" />
                )}
              </span>
            </button>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-bold">ที่อยู่จัดส่ง</h2>
        <div className="mt-3 rounded-card border border-ink-100 p-4 sm:p-5">
          <AddressFields prefix="ship_" value={ship} onChange={setShip} />

          <label className="mt-5 flex cursor-pointer items-center gap-2 text-sm text-ink-600">
            <input
              type="checkbox"
              name="same_billing"
              checked={sameBilling}
              onChange={(e) => setSameBilling(e.target.checked)}
              className="size-4 accent-brand-400"
            />
            ที่อยู่จัดส่งและที่อยู่สำหรับออกใบเสร็จเหมือนกัน
          </label>
        </div>
      </section>

      {!sameBilling && (
        <section>
          <h2 className="font-bold">ที่อยู่สำหรับออกใบเสร็จ</h2>
          <div className="mt-3 rounded-card border border-ink-100 p-4 sm:p-5">
            <AddressFields prefix="bill_" value={bill} onChange={setBill} />
          </div>
        </section>
      )}

      {state.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <SubmitButton pendingText="กำลังยืนยันคำสั่งซื้อ…">
        ยืนยันคำสั่งซื้อ
      </SubmitButton>
    </form>
  );
}
