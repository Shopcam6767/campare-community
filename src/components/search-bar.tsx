"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import ProductThumb from "@/components/product-thumb";
import { formatPrice } from "@/lib/format";
import { PRODUCT_TYPE_LABEL, type ProductOption } from "@/lib/types";

export default function SearchBar() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const [value, setValue] = useState(params.get("q") ?? "");
  const [items, setItems] = useState<ProductOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // ปิด dropdown เมื่อมีการเปลี่ยนหน้า
  useEffect(() => {
    setOpen(false);
  }, [pathname, params]);

  // อัปเดตค่าตาม URL search parameter เมื่อเปลี่ยนหน้า
  useEffect(() => {
    setValue(params.get("q") ?? "");
  }, [params]);

  // ปิด dropdown เมื่อคลิกนอกกล่องค้นหา
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  // ค้นหาแบบหน่วงเวลา 250ms (Debounce Autocomplete)
  useEffect(() => {
    const trimmed = value.trim();
    if (!trimmed) {
      setItems([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const queryParams = new URLSearchParams({
          q: trimmed,
          limit: "6",
        });
        const res = await fetch(`/api/products/search?${queryParams}`);
        const data = await res.json();
        setItems(data.items ?? []);
        setActiveIndex(-1);
      } catch {
        setItems([]);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [value]);

  function submitSearch(q: string) {
    setOpen(false);
    const trimmed = q.trim();
    router.push(trimmed ? `/category?q=${encodeURIComponent(trimmed)}` : "/category");
  }

  function selectProduct(p: ProductOption) {
    setOpen(false);
    router.push(`/product/${p.slug}`);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open) {
      if (e.key === "ArrowDown" && items.length > 0) {
        e.preventDefault();
        setOpen(true);
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev < items.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : items.length - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0 && items[activeIndex]) {
        selectProduct(items[activeIndex]);
      } else {
        submitSearch(value);
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
      inputRef.current?.blur();
    }
  }

  const trimmed = value.trim();
  const showDropdown = open && trimmed.length > 0;

  return (
    <div ref={containerRef} className="relative w-full">
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          submitSearch(value);
        }}
        className="relative flex items-center"
      >
        <input
          ref={inputRef}
          type="search"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            if (!open) setOpen(true);
          }}
          onFocus={() => {
            if (trimmed) setOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder="ค้นหารุ่นกล้อง เลนส์ หรือแบรนด์..."
          aria-autocomplete="list"
          aria-expanded={showDropdown}
          autoComplete="off"
          className="w-full rounded-full border border-ink-200 bg-ink-50 py-2 pl-4 pr-16 text-sm outline-none placeholder:text-ink-400 focus:border-brand-400 focus:bg-white focus:ring-2 focus:ring-brand-400/20"
        />

        <div className="absolute right-1.5 flex items-center gap-1">
          {/* ปุ่มล้างข้อความ */}
          {trimmed && (
            <button
              type="button"
              aria-label="ล้างคำค้นหา"
              onClick={() => {
                setValue("");
                setItems([]);
                setOpen(false);
                inputRef.current?.focus();
              }}
              className="grid size-6 place-items-center rounded-full text-ink-400 hover:bg-ink-200 hover:text-ink-700"
            >
              <svg viewBox="0 0 24 24" fill="none" className="size-3.5" stroke="currentColor" strokeWidth="2.5">
                <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
              </svg>
            </button>
          )}

          {/* สปินเนอร์ตอนกำลังค้นหา หรือปุ่มแว่นขยาย */}
          {loading ? (
            <div className="grid size-7 place-items-center text-brand-500">
              <svg
                className="size-4 animate-spin text-brand-500"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            </div>
          ) : (
            <button
              type="submit"
              aria-label="ค้นหา"
              className="grid size-7 place-items-center rounded-full text-ink-500 hover:bg-ink-100 hover:text-brand-500"
            >
              <svg viewBox="0 0 24 24" fill="none" className="size-4" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" strokeLinecap="round" />
              </svg>
            </button>
          )}
        </div>
      </form>

      {/* Autocomplete Dropdown List */}
      {showDropdown && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-ink-200/80 bg-white shadow-2xl backdrop-blur-md sm:min-w-[340px]">
          {loading && items.length === 0 ? (
            <div className="flex items-center justify-center gap-2 py-6 text-sm text-ink-400">
              <svg
                className="size-4 animate-spin text-brand-500"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span>กำลังค้นหา...</span>
            </div>
          ) : items.length > 0 ? (
            <div>
              <div className="border-b border-ink-100/70 bg-ink-50/70 px-3 py-1.5 text-[11px] font-medium tracking-wide text-ink-500">
                สินค้าแนะนำ ({items.length})
              </div>

              <ul role="listbox" className="max-h-[380px] overflow-y-auto divide-y divide-ink-50 py-1">
                {items.map((item, idx) => {
                  const price = item.market_price ?? item.msrp;
                  const isActive = idx === activeIndex;
                  return (
                    <li
                      key={item.id}
                      role="option"
                      aria-selected={isActive}
                      onClick={() => selectProduct(item)}
                      onMouseEnter={() => setActiveIndex(idx)}
                      className={`flex cursor-pointer items-center gap-3 px-3 py-2 transition ${
                        isActive
                          ? "bg-brand-50/80 text-brand-900"
                          : "hover:bg-ink-50/80"
                      }`}
                    >
                      {/* รูปสินค้า */}
                      <div className="relative size-11 shrink-0 overflow-hidden rounded-xl border border-ink-100 bg-ink-50">
                        <ProductThumb
                          src={item.thumbnail_url}
                          alt={item.name}
                          slug={item.slug}
                          sizes="44px"
                        />
                      </div>

                      {/* รายละเอียดสินค้า */}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-semibold text-ink-800">
                          {item.name}
                        </p>
                        <div className="flex items-center gap-1.5 text-[11px] text-ink-400">
                          {item.companies?.name && (
                            <span>{item.companies.name}</span>
                          )}
                          {item.companies?.name && item.product_type && (
                            <span>·</span>
                          )}
                          {item.product_type && (
                            <span>{PRODUCT_TYPE_LABEL[item.product_type]}</span>
                          )}
                          {item.product_no && (
                            <span className="hidden sm:inline">#{item.product_no}</span>
                          )}
                        </div>
                      </div>

                      {/* ราคา */}
                      <div className="shrink-0 text-right">
                        <span className="text-xs font-bold text-brand-600">
                          {formatPrice(price)}
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ul>

              {/* ปุ่มดูผลการค้นหาทั้งหมด */}
              <button
                type="button"
                onClick={() => submitSearch(value)}
                className="flex w-full items-center justify-between border-t border-ink-100/70 bg-ink-50/50 px-3 py-2 text-xs font-semibold text-brand-600 transition hover:bg-brand-50 hover:text-brand-700"
              >
                <span>ดูผลการค้นหาทั้งหมดสำหรับ &ldquo;{trimmed}&rdquo;</span>
                <svg viewBox="0 0 24 24" fill="none" className="size-4" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          ) : (
            <div className="p-4 text-center">
              <p className="text-xs font-medium text-ink-700">
                ไม่พบสินค้าที่ตรงกับ &ldquo;{trimmed}&rdquo;
              </p>
              <p className="mt-1 text-[11px] text-ink-400">
                ลองตรวจสอบตัวสะกด หรือใช้คำค้นหาที่สั้นลง
              </p>
              <button
                type="button"
                onClick={() => submitSearch(value)}
                className="mt-3 inline-flex items-center justify-center rounded-full bg-ink-100 px-3 py-1 text-xs font-medium text-ink-700 hover:bg-brand-50 hover:text-brand-600"
              >
                กด Enter เพื่อดูผลค้นหาทั้งหมด
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
