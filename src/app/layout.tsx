import type { Metadata } from "next";
import { IBM_Plex_Sans_Thai } from "next/font/google";
import "./globals.css";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import AccountStatusWatcher from "@/components/account-status-watcher";

const plex = IBM_Plex_Sans_Thai({
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-plex",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Shopcam — เปรียบเทียบและซื้อขายกล้อง",
    template: "%s | Shopcam",
  },
  description:
    "แพลตฟอร์มเปรียบเทียบสเปกกล้อง 2–4 รุ่นแบบ side-by-side พร้อมตลาดมือสอง รีวิว แกลเลอรีภาพตัวอย่าง และคอมมูนิตี้ถาม-ตอบ",
};

const THEME_INIT = `try{var t=localStorage.getItem("theme");if(t==="dark"||(!t&&matchMedia("(prefers-color-scheme: dark)").matches))document.documentElement.classList.add("dark")}catch(e){}`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    // suppressHydrationWarning: สคริปต์ด้านล่างเติม class "dark" ก่อน React โหลด
    <html lang="th" className={plex.variable} suppressHydrationWarning>
      <head>
        {/* ตั้งธีมก่อนหน้าเว็บแสดง กันจอขาวแวบตอนเปิดในโหมดมืด */}
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT }} />
      </head>
      <body className="min-h-screen flex flex-col">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
        <AccountStatusWatcher />
      </body>
    </html>
  );
}
