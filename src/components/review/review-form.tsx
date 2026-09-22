"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { submitReview, type FormState } from "@/app/reviews/actions";
import SubmitButton from "@/components/auth/submit-button";
import type { Review } from "@/lib/types";

const initial: FormState = {};

const field =
  "mt-1 w-full rounded-lg border border-ink-200 px-3 py-2.5 text-sm outline-none focus:border-brand-400";

export default function ReviewForm({
  productId,
  slug,
  signedIn,
  hasPurchased = false,
  existing,
}: {
  productId: string;
  slug: string;
  signedIn: boolean;
  hasPurchased?: boolean;
  existing?: Review | null;
}) {
  const [state, formAction] = useActionState(submitReview, initial);
  const [rating, setRating] = useState(existing?.rating ?? 0);
  const [hover, setHover] = useState(0);
  const [open, setOpen] = useState(false);

  if (!signedIn) {
    return (
      <div className="rounded-card border border-dashed border-ink-200 px-4 py-8 text-center">
        <p className="text-sm text-ink-500">
          อยากรีวิวรุ่นนี้? เข้าสู่ระบบก่อนนะ
        </p>
        <Link
          href={`/login?next=/product/${slug}`}
          className="mt-3 inline-block rounded-lg bg-brand-400 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-500"
        >
          เข้าสู่ระบบ
        </Link>
      </div>
    );
  }

  // อนุญาตให้รีวิวได้เฉพาะผู้ที่เคยซื้อ หรือมีรีวิวเดิมอยู่แล้ว
  if (!hasPurchased && !existing) {
    return (
      <div className="rounded-card border border-ink-200 bg-ink-50/50 p-6 text-center">
        <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-ink-100 text-xl">
          🛍️
        </div>
        <h3 className="font-semibold text-ink-800">
          ให้ดาวและรีวิวได้เฉพาะผู้ที่เคยสั่งซื้อสินค้ารุ่นนี้เท่านั้น
        </h3>
        <p className="mx-auto mt-1.5 max-w-md text-xs leading-relaxed text-ink-500">
          ระบบเปิดให้รีวิวเฉพาะผู้ใช้ที่สั่งซื้อสินค้ารุ่นนี้สำเร็จ เพื่อให้คะแนนและรีวิวมีความน่าเชื่อถือและสะท้อนประสบการณ์จากผู้ใช้งานจริง
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <a
            href="#listings"
            className="rounded-lg border border-ink-200 bg-surface px-4 py-2 text-xs font-semibold text-ink-700 transition hover:border-brand-300 hover:text-brand-600"
          >
            ดูประกาศขายมือสองของรุ่นนี้
          </a>
          <Link
            href="/profile?tab=purchase"
            className="rounded-lg border border-ink-200 bg-surface px-4 py-2 text-xs font-semibold text-ink-700 transition hover:border-brand-300 hover:text-brand-600"
          >
            ตรวจสอบประวัติการซื้อของคุณ
          </Link>
        </div>
      </div>
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full rounded-card border border-dashed border-brand-300 bg-brand-50/20 px-4 py-6 text-sm font-medium text-brand-700 transition hover:bg-brand-50 hover:text-brand-800"
      >
        <div className="flex flex-wrap items-center justify-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-800">
            <svg className="size-3.5 fill-current" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            ผู้ซื้อที่ยืนยันแล้ว
          </span>
          <span>{existing ? "แก้ไขรีวิวของฉัน" : "+ เขียนรีวิวและให้คะแนนรุ่นนี้"}</span>
        </div>
      </button>
    );
  }

  return (
    <form
      action={formAction}
      className="space-y-4 rounded-card border border-ink-100 p-5"
    >
      <input type="hidden" name="product_id" value={productId} />
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="rating" value={rating} />

      <div className="flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2 text-xs font-medium text-green-800">
        <svg className="size-4 shrink-0 fill-current" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
            clipRule="evenodd"
          />
        </svg>
        <span>
          <strong>ผู้ซื้อที่ได้รับการยืนยัน:</strong> คุณเคยสั่งซื้อสินค้ารุ่นนี้แล้ว สามารถให้คะแนนดาวและรีวิวประสบการณ์การใช้งานได้
        </span>
      </div>

      <div>
        <p className="text-sm font-medium">ให้คะแนน</p>
        <div className="mt-1 flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              onMouseEnter={() => setHover(n)}
              onMouseLeave={() => setHover(0)}
              aria-label={`${n} ดาว`}
              className={
                "text-2xl leading-none transition " +
                ((hover || rating) >= n ? "text-brand-400" : "text-ink-200")
              }
            >
              ★
            </button>
          ))}
          <span className="ml-2 text-sm text-ink-500">
            {rating ? `${rating}/5` : "ยังไม่ได้เลือก"}
          </span>
        </div>
      </div>

      <div>
        <label htmlFor="title" className="text-sm font-medium">
          หัวข้อ
        </label>
        <input
          id="title"
          name="title"
          maxLength={120}
          defaultValue={existing?.title ?? ""}
          className={field}
          placeholder="เช่น ใช้มา 6 เดือน คุ้มเกินราคา"
        />
      </div>

      <div>
        <label htmlFor="body" className="text-sm font-medium">
          รายละเอียด <span className="text-red-500">*</span>
        </label>
        <textarea
          id="body"
          name="body"
          rows={5}
          required
          minLength={10}
          defaultValue={existing?.body ?? ""}
          className={field}
          placeholder="ใช้ถ่ายอะไร ชอบตรงไหน ไม่ชอบตรงไหน เทียบกับตัวที่เคยใช้เป็นยังไง"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="pros" className="text-sm font-medium text-green-700">
            ข้อดี
          </label>
          <textarea
            id="pros"
            name="pros"
            rows={4}
            defaultValue={existing?.pros?.join("\n") ?? ""}
            className={field}
            placeholder={"บรรทัดละข้อ\nโฟกัสไว\nแบตอึด"}
          />
        </div>
        <div>
          <label htmlFor="cons" className="text-sm font-medium text-red-700">
            ข้อเสีย
          </label>
          <textarea
            id="cons"
            name="cons"
            rows={4}
            defaultValue={existing?.cons?.join("\n") ?? ""}
            className={field}
            placeholder={"บรรทัดละข้อ\nเมนูงง\nร้อนเวลาอัดวิดีโอนาน"}
          />
        </div>
      </div>

      {state.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}
      {state.message && (
        <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
          {state.message}
        </p>
      )}

      <div className="flex gap-3">
        <SubmitButton pendingText="กำลังบันทึก…">
          {existing ? "อัปเดตรีวิว" : "ส่งรีวิว"}
        </SubmitButton>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-lg border border-ink-200 px-5 py-2.5 text-sm font-medium text-ink-600 hover:border-ink-300"
        >
          ยกเลิก
        </button>
      </div>
    </form>
  );
}
