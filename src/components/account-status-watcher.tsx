"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

/**
 * เฝ้าดูว่าบัญชีถูกระงับระหว่างที่เปิดหน้าค้างไว้หรือไม่
 *
 * middleware เตะออกทุกครั้งที่มี request ใหม่อยู่แล้ว ตัวนี้มีไว้กรณีผู้ใช้เปิดหน้าค้างไว้
 * เฉย ๆ ไม่ได้กดอะไร — เช็คทุก 20 วินาที และทุกครั้งที่สลับกลับมาที่แท็บนี้
 * ไม่ได้ล็อกอิน = ไม่ทำอะไร (rpc คืน true)
 */
const CHECK_EVERY_MS = 20_000;

export default function AccountStatusWatcher() {
  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return;
    const supabase = createClient();
    let stopped = false;

    const check = async () => {
      if (stopped || document.visibilityState !== "visible") return;
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const { data: active } = await supabase.rpc("is_account_active");
      if (active === false && !stopped) {
        stopped = true;
        await supabase.auth.signOut();
        // โหลดใหม่ทั้งหน้า ให้ header/ตะกร้า/ข้อมูลส่วนตัวที่ค้างบนจอหายไปด้วย
        window.location.assign("/login?error=suspended");
      }
    };

    const timer = setInterval(check, CHECK_EVERY_MS);
    document.addEventListener("visibilitychange", check);
    check();

    return () => {
      stopped = true;
      clearInterval(timer);
      document.removeEventListener("visibilitychange", check);
    };
  }, []);

  return null;
}
