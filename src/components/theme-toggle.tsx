"use client";

import { useEffect, useState } from "react";

/**
 * ปุ่มสลับโหมดสว่าง/มืด
 * - ครั้งแรกใช้ตามการตั้งค่าเครื่อง (prefers-color-scheme)
 * - กดแล้วจำไว้ใน localStorage ("theme" = "light" | "dark")
 * - class "dark" บน <html> ถูกตั้งตั้งแต่ก่อนหน้าโหลดโดยสคริปต์ใน layout.tsx
 */
export default function ThemeToggle() {
  // null = ยังไม่รู้ (ตอน render ฝั่ง server) กัน hydration mismatch ของไอคอน
  const [dark, setDark] = useState<boolean | null>(null);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {
      /* โหมดส่วนตัวบางเบราว์เซอร์เขียน localStorage ไม่ได้ — สลับได้แต่ไม่จำ */
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? "เปลี่ยนเป็นโหมดสว่าง" : "เปลี่ยนเป็นโหมดมืด"}
      title={dark ? "โหมดสว่าง" : "โหมดมืด"}
      className="grid size-9 shrink-0 place-items-center rounded-full text-ink-600 hover:bg-ink-50 hover:text-brand-600"
    >
      {dark === null ? (
        <span className="size-5" />
      ) : dark ? (
        // พระอาทิตย์ = กดแล้วกลับเป็นสว่าง
        <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </svg>
      ) : (
        // พระจันทร์ = กดแล้วเป็นมืด
        <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5a8.5 8.5 0 1 0 11 11Z" />
        </svg>
      )}
    </button>
  );
}
