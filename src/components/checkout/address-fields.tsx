"use client";

import type { ReactNode } from "react";
import { THAI_PROVINCES, type ThaiAddress } from "@/lib/thai-address";

/**
 * ช่องกรอกที่อยู่แบบแยกช่อง (ชื่อ / ที่อยู่ / ตำบล / อำเภอ / จังหวัด / รหัสไปรษณีย์ / เบอร์)
 * เป็น controlled input — ค่าไม่หายตอน server action ตอบ error กลับมา
 * ชื่อช่องใน FormData = prefix + ชื่อฟิลด์ เช่น ship_firstName
 */
export default function AddressFields({
  prefix,
  value,
  onChange,
}: {
  prefix: string;
  value: ThaiAddress;
  onChange: (next: ThaiAddress) => void;
}) {
  const set = (k: keyof ThaiAddress) => (v: string) => onChange({ ...value, [k]: v });
  const id = (k: keyof ThaiAddress) => `${prefix}${k}`;

  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-4">
      <Field label="ชื่อจริง" htmlFor={id("firstName")}>
        <input
          id={id("firstName")}
          name={id("firstName")}
          required
          autoComplete="given-name"
          value={value.firstName}
          onChange={(e) => set("firstName")(e.target.value)}
          className={INPUT}
        />
      </Field>
      <Field label="นามสกุล" htmlFor={id("lastName")}>
        <input
          id={id("lastName")}
          name={id("lastName")}
          required
          autoComplete="family-name"
          value={value.lastName}
          onChange={(e) => set("lastName")(e.target.value)}
          className={INPUT}
        />
      </Field>

      <Field label="ประเทศ" htmlFor={id("country")}>
        {/* ตอนนี้ส่งในไทยอย่างเดียว เลยล็อกไว้ แต่คงช่องไว้ให้หน้าตาเหมือนฟอร์มมาตรฐาน */}
        <select
          id={id("country")}
          name={id("country")}
          value={value.country}
          onChange={(e) => set("country")(e.target.value)}
          className={INPUT}
        >
          <option value="ไทย">ไทย</option>
        </select>
      </Field>
      <Field label="รหัสไปรษณีย์" htmlFor={id("postalCode")}>
        <input
          id={id("postalCode")}
          name={id("postalCode")}
          required
          inputMode="numeric"
          autoComplete="postal-code"
          maxLength={5}
          pattern="\d{5}"
          title="ตัวเลข 5 หลัก"
          placeholder="10110"
          value={value.postalCode}
          onChange={(e) => set("postalCode")(e.target.value.replace(/\D/g, ""))}
          className={INPUT}
        />
      </Field>

      <div className="col-span-2">
        <label htmlFor={id("line1")} className={LABEL}>
          ที่อยู่ <Req />
        </label>
        <p className="mt-0.5 text-xs text-ink-400">
          กรอกข้อมูลบ้านเลขที่/อาคาร/หมู่/ซอย (ห้ามกรอกจังหวัด/เขต/แขวงและรหัสไปรษณีย์)
        </p>
        <input
          id={id("line1")}
          name={id("line1")}
          required
          autoComplete="address-line1"
          placeholder="บ้านเลขที่ ซอย/ชั้น อาคาร ถนน"
          value={value.line1}
          onChange={(e) => set("line1")(e.target.value)}
          className={`${INPUT} mt-2`}
        />
        <input
          id={id("line2")}
          name={id("line2")}
          aria-label="ที่อยู่ (บรรทัดที่ 2)"
          autoComplete="address-line2"
          placeholder="หมู่บ้าน / จุดสังเกต (ถ้ามี)"
          value={value.line2}
          onChange={(e) => set("line2")(e.target.value)}
          className={`${INPUT} mt-2`}
        />
      </div>

      <Field label="ตำบล/แขวง" htmlFor={id("subdistrict")}>
        <input
          id={id("subdistrict")}
          name={id("subdistrict")}
          required
          value={value.subdistrict}
          onChange={(e) => set("subdistrict")(e.target.value)}
          className={INPUT}
        />
      </Field>
      <Field label="อำเภอ/เขต" htmlFor={id("district")}>
        <input
          id={id("district")}
          name={id("district")}
          required
          value={value.district}
          onChange={(e) => set("district")(e.target.value)}
          className={INPUT}
        />
      </Field>

      <Field label="จังหวัด" htmlFor={id("province")} full>
        <select
          id={id("province")}
          name={id("province")}
          required
          autoComplete="address-level1"
          value={value.province}
          onChange={(e) => set("province")(e.target.value)}
          className={INPUT}
        >
          <option value="" disabled>
            เลือกจังหวัด
          </option>
          {THAI_PROVINCES.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </Field>

      <Field label="เบอร์โทรศัพท์" htmlFor={id("phone")} full>
        <div className="flex items-center gap-2">
          <input
            id={id("phone")}
            name={id("phone")}
            type="tel"
            required
            inputMode="tel"
            autoComplete="tel-national"
            placeholder="0812345678"
            pattern="0[\d\s-]{8,11}"
            title="ขึ้นต้นด้วย 0 และมี 9–10 หลัก"
            value={value.phone}
            onChange={(e) => set("phone")(e.target.value)}
            className={INPUT}
          />
          <span
            className="grid size-6 shrink-0 cursor-help place-items-center rounded-full border border-ink-300 text-xs font-bold text-ink-400"
            title="ใช้ติดต่อเรื่องการจัดส่งเท่านั้น"
            aria-label="ใช้ติดต่อเรื่องการจัดส่งเท่านั้น"
          >
            ?
          </span>
        </div>
      </Field>
    </div>
  );
}

const INPUT =
  "w-full rounded-md border border-ink-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-brand-400 focus:ring-1 focus:ring-brand-200";
const LABEL = "block text-sm text-ink-600";

function Req() {
  return <span className="text-red-500">*</span>;
}

function Field({
  label,
  htmlFor,
  full,
  children,
}: {
  label: string;
  htmlFor: string;
  full?: boolean;
  children: ReactNode;
}) {
  return (
    <div className={full ? "col-span-2" : "col-span-2 sm:col-span-1"}>
      <label htmlFor={htmlFor} className={`${LABEL} mb-1.5`}>
        {label} <Req />
      </label>
      {children}
    </div>
  );
}
