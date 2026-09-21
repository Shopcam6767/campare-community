"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import { PRODUCT_TYPE_LABEL, type Company, type ProductType } from "@/lib/types";
import { formatPrice } from "@/lib/format";

const TYPES = Object.keys(PRODUCT_TYPE_LABEL) as ProductType[];
const PRICE_FLOOR = 0;
const PRICE_CEIL = 250000; // กล้องแพงสุดในระบบราว 2.2 แสน (Canon EOS R1)
const PRICE_STEP = 1000;

export default function CategoryFilters({ brands }: { brands: Company[] }) {
  const router = useRouter();
  const params = useSearchParams();

  const push = useCallback(
    (mutate: (p: URLSearchParams) => void) => {
      const next = new URLSearchParams(params.toString());
      mutate(next);
      // เปลี่ยนตัวกรองแล้วต้องกลับไปหน้า 1 เสมอ
      // ไม่งั้นค้างอยู่หน้า 120 ของผลลัพธ์เดิมที่อาจมีแค่ 3 หน้า
      next.delete("page");
      router.push(`/category?${next.toString()}`);
    },
    [params, router]
  );

  const activeType = params.get("type");
  const activeBrands = params.getAll("brand");
  const minRating = params.get("rating");
  const activeStatus = params.get("status");
  const activeYear = params.get("year") ?? "";

  return (
    <aside
      // จอใหญ่: ตัวกรองมี scrollbar ของตัวเอง เลื่อนแยกจากรายการสินค้า
      // ความสูงไม่เกินจอ (หัก header + ระยะ top-24 ออก) ไม่งั้นส่วนล่างตกขอบเลื่อนไม่ถึง
      className="space-y-6 lg:sticky lg:top-24 lg:self-start lg:max-h-[calc(100vh-7.5rem)] lg:overflow-y-auto lg:overscroll-contain lg:pr-2 lg:pb-4 lg:[scrollbar-width:thin]"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold">ตัวกรอง</h2>
        <button
          type="button"
          onClick={() => router.push("/category")}
          className="text-xs text-ink-500 underline-offset-2 hover:text-brand-600 hover:underline"
        >
          ล้างทั้งหมด
        </button>
      </div>

      {/* ราคา — key ผูกกับ URL เพื่อให้ช่องรีเซ็ตตามเวลากด "ล้างทั้งหมด" */}
      <PriceRange
        key={`${params.get("min") ?? ""}-${params.get("max") ?? ""}`}
        initialMin={Number(params.get("min") ?? PRICE_FLOOR)}
        initialMax={Number(params.get("max") ?? PRICE_CEIL)}
        onApply={(lo, hi) =>
          push((p) => {
            if (lo <= PRICE_FLOOR) p.delete("min");
            else p.set("min", String(lo));
            if (hi >= PRICE_CEIL) p.delete("max");
            else p.set("max", String(hi));
          })
        }
      />

      {/* สถานะการผลิต */}
      <section className="rounded-card border border-ink-100 p-4">
        <p className="text-sm font-semibold">สถานะการผลิต</p>
        <div className="mt-3 space-y-1">
          {[
            ["", "ทั้งหมด"],
            ["in_production", "ยังผลิตอยู่"],
            ["discontinued", "เลิกผลิตแล้ว"],
          ].map(([value, label]) => (
            <label
              key={value || "all"}
              className="flex cursor-pointer items-center gap-2 text-sm text-ink-600"
            >
              <input
                type="radio"
                name="status"
                checked={(activeStatus ?? "") === value}
                onChange={() =>
                  push((p) => (value ? p.set("status", value) : p.delete("status")))
                }
                className="accent-brand-400"
              />
              {label}
            </label>
          ))}
        </div>
        <p className="mt-2 text-xs text-ink-400">
          คลังข้อมูลครอบคลุมกล้องตั้งแต่ปี 1994 จึงมีรุ่นที่เลิกผลิตแล้วเป็นส่วนใหญ่
        </p>
      </section>

      {/* ปีที่เปิดตัว */}
      <section className="rounded-card border border-ink-100 p-4">
        <p className="text-sm font-semibold">ปีที่เปิดตัว</p>
        <select
          value={activeYear}
          onChange={(e) =>
            push((p) =>
              e.target.value ? p.set("year", e.target.value) : p.delete("year")
            )
          }
          className="mt-3 w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-400"
        >
          <option value="">ทุกปี</option>
          <option value="2020">ปี 2020 ขึ้นไป</option>
          <option value="2015">ปี 2015 ขึ้นไป</option>
          <option value="2010">ปี 2010 ขึ้นไป</option>
          <option value="2000">ปี 2000 ขึ้นไป</option>
        </select>
      </section>

      {/* ประเภท */}
      <section className="rounded-card border border-ink-100 p-4">
        <p className="text-sm font-semibold">ประเภทสินค้า</p>
        <div className="mt-3 space-y-1">
          {TYPES.map((t) => (
            <label
              key={t}
              className="flex cursor-pointer items-center gap-2 text-sm text-ink-600"
            >
              <input
                type="radio"
                name="type"
                checked={activeType === t}
                onChange={() => push((p) => p.set("type", t))}
                className="accent-brand-400"
              />
              {PRODUCT_TYPE_LABEL[t]}
            </label>
          ))}
          <label className="flex cursor-pointer items-center gap-2 text-sm text-ink-600">
            <input
              type="radio"
              name="type"
              checked={!activeType}
              onChange={() => push((p) => p.delete("type"))}
              className="accent-brand-400"
            />
            ทั้งหมด
          </label>
        </div>
      </section>

      {/* แบรนด์ */}
      <section className="rounded-card border border-ink-100 p-4">
        <p className="text-sm font-semibold">แบรนด์</p>
        <div className="mt-3 max-h-56 space-y-1 overflow-y-auto pr-1">
          {brands.map((b) => (
            <label
              key={b.id}
              className="flex cursor-pointer items-center gap-2 text-sm text-ink-600"
            >
              <input
                type="checkbox"
                checked={activeBrands.includes(b.slug)}
                onChange={(e) =>
                  push((p) => {
                    const current = p.getAll("brand");
                    p.delete("brand");
                    const next = e.target.checked
                      ? [...current, b.slug]
                      : current.filter((x) => x !== b.slug);
                    next.forEach((s) => p.append("brand", s));
                  })
                }
                className="accent-brand-400"
              />
              {b.name}
            </label>
          ))}
        </div>
      </section>

      {/* คะแนน */}
      <section className="rounded-card border border-ink-100 p-4">
        <p className="text-sm font-semibold">คะแนนรีวิว</p>
        <div className="mt-3 space-y-1">
          {[4.5, 4, 3.5].map((r) => (
            <label
              key={r}
              className="flex cursor-pointer items-center gap-2 text-sm text-ink-600"
            >
              <input
                type="radio"
                name="rating"
                checked={minRating === String(r)}
                onChange={() => push((p) => p.set("rating", String(r)))}
                className="accent-brand-400"
              />
              <span className="text-brand-400">★</span> {r} ขึ้นไป
            </label>
          ))}
          <label className="flex cursor-pointer items-center gap-2 text-sm text-ink-600">
            <input
              type="radio"
              name="rating"
              checked={!minRating}
              onChange={() => push((p) => p.delete("rating"))}
              className="accent-brand-400"
            />
            ทุกคะแนน
          </label>
        </div>
      </section>
    </aside>
  );
}

/**
 * ช่วงราคาแบบ 2 หัว — ลากได้ทั้งซ้าย (ต่ำสุด) และขวา (สูงสุด) หรือพิมพ์ตัวเลขในช่อง
 * กด "ยืนยัน" ถึงจะกรอง ไม่ยิงค้นหาทุกครั้งที่ลาก
 *
 * ทำจาก input[type=range] 2 ตัววางซ้อนกัน ตัวแถบปิด pointer-events
 * ให้กดได้เฉพาะหัวจับ (สไตล์อยู่ใน globals.css → .price-range)
 */
function PriceRange({
  initialMin,
  initialMax,
  onApply,
}: {
  initialMin: number;
  initialMax: number;
  onApply: (min: number, max: number) => void;
}) {
  const clamp = (n: number) =>
    Math.min(PRICE_CEIL, Math.max(PRICE_FLOOR, Number.isFinite(n) ? n : 0));
  const [lo, setLo] = useState(clamp(initialMin));
  const [hi, setHi] = useState(clamp(initialMax));

  // หัวซ้ายห้ามเลยหัวขวา และกลับกัน
  const setLow = (n: number) => setLo(Math.min(clamp(n), hi));
  const setHigh = (n: number) => setHi(Math.max(clamp(n), lo));

  const pct = (n: number) => ((n - PRICE_FLOOR) / (PRICE_CEIL - PRICE_FLOOR)) * 100;

  return (
    <section className="rounded-card border border-ink-100 p-4">
      <p className="text-sm font-semibold">ราคา</p>

      <div className="mt-3 flex items-center gap-2">
        <input
          type="number"
          inputMode="numeric"
          aria-label="ราคาต่ำสุด"
          value={lo}
          min={PRICE_FLOOR}
          max={hi}
          step={PRICE_STEP}
          onChange={(e) => setLo(Number(e.target.value))}
          onBlur={() => setLow(lo)}
          className="w-full rounded-lg border border-ink-200 px-2 py-1.5 text-center text-sm outline-none focus:border-brand-400"
        />
        <span className="text-ink-400">–</span>
        <input
          type="number"
          inputMode="numeric"
          aria-label="ราคาสูงสุด"
          value={hi}
          min={lo}
          max={PRICE_CEIL}
          step={PRICE_STEP}
          onChange={(e) => setHi(Number(e.target.value))}
          onBlur={() => setHigh(hi)}
          className="w-full rounded-lg border border-ink-200 px-2 py-1.5 text-center text-sm outline-none focus:border-brand-400"
        />
      </div>

      <div className="price-range relative mt-4 h-5">
        {/* แถบพื้น + ช่วงที่เลือก */}
        <div className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-ink-100" />
        <div
          className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-brand-400"
          // หัวจับกว้าง 20px จุดกึ่งกลางเลยเดินได้แค่ 10px → (100% - 10px)
          style={{
            left: `calc(10px + (100% - 20px) * ${pct(lo) / 100})`,
            right: `calc(10px + (100% - 20px) * ${1 - pct(hi) / 100})`,
          }}
        />
        <input
          type="range"
          aria-label="ลากเพื่อตั้งราคาต่ำสุด"
          min={PRICE_FLOOR}
          max={PRICE_CEIL}
          step={PRICE_STEP}
          value={lo}
          onChange={(e) => setLow(Number(e.target.value))}
          // หัวซ้ายชนขวาสุดแล้ว ยกขึ้นมาข้างบนไม่งั้นจะลากกลับไม่ได้
          style={{ zIndex: lo >= PRICE_CEIL - PRICE_STEP ? 5 : 3 }}
        />
        <input
          type="range"
          aria-label="ลากเพื่อตั้งราคาสูงสุด"
          min={PRICE_FLOOR}
          max={PRICE_CEIL}
          step={PRICE_STEP}
          value={hi}
          onChange={(e) => setHigh(Number(e.target.value))}
          style={{ zIndex: 4 }}
        />
      </div>

      <div className="mt-1 flex justify-between text-xs text-ink-500">
        <span>{formatPrice(lo)}</span>
        <span>{hi >= PRICE_CEIL ? `${formatPrice(PRICE_CEIL)}+` : formatPrice(hi)}</span>
      </div>

      <button
        type="button"
        onClick={() => {
          const a = clamp(Math.min(lo, hi));
          const b = clamp(Math.max(lo, hi));
          setLo(a);
          setHi(b);
          onApply(a, b);
        }}
        className="mt-3 w-full rounded-full border border-brand-400 py-2 text-sm font-medium text-brand-600 transition hover:bg-brand-400 hover:text-white"
      >
        ยืนยัน
      </button>
    </section>
  );
}
