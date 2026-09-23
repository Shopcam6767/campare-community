"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";

interface HeroVideoBannerProps {
  videoUrl?: string;
  posterUrl?: string;
  tag?: string;
  title?: string;
  subtitle?: string;
  primaryCta?: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  tertiaryCta?: { label: string; href: string };
  stats?: {
    modelsCount: number;
    brandsCount: number;
    reviewsCount: number;
  };
}

export default function HeroVideoBanner({
  videoUrl = "https://apnxwruqdqlgiemqioks.supabase.co/storage/v1/object/public/product/Nikon%20Z6III.mp4",
  posterUrl = "/images/products/nikon-z6-iii.jpg",
  tag = "NEW ARRIVAL · NIKON Z6 III",
  title = "เลือกกล้องให้ตรงกับสิ่งที่คุณอยากถ่าย",
  subtitle = "ดูสเปกแบบ side-by-side ที่ไฮไลต์ความต่างให้อัตโนมัติ เทียบราคามือสองจากประกาศจริง อ่านรีวิวจากคนใช้จริง",
  primaryCta = { label: "เริ่มเลือกสินค้า", href: "/category" },
  secondaryCta = { label: "ไปหน้าเปรียบเทียบ", href: "/compare" },
  tertiaryCta = { label: "ดูสเปก Nikon Z6 III", href: "/product/nikon-z6-iii" },
  stats,
}: HeroVideoBannerProps) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
    } else {
      video.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    const nextMuted = !isMuted;
    video.muted = nextMuted;
    setIsMuted(nextMuted);
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.play().catch(() => {
      video.muted = true;
      setIsMuted(true);
      video.play().catch(() => {});
    });
  }, [videoUrl]);

  return (
    <div className="relative w-full overflow-hidden bg-black text-white select-none">
      {/* Container สัดส่วนสไตล์ Cinematic ปรับความสูงกระชับขึ้นเพื่อไม่บังวิดีโอ */}
      <div className="relative h-[420px] sm:h-[480px] lg:h-[540px] xl:h-[600px] w-full">
        {/* Background Video */}
        <video
          ref={videoRef}
          src={videoUrl}
          poster={posterUrl}
          autoPlay
          loop
          muted={isMuted}
          playsInline
          preload="auto"
          className="absolute inset-0 size-full object-cover"
        />

        {/* Cinematic Overlays ปรับแสงไล่เงาให้ตัวหนังสืออ่านง่าย แต่ยังเห็นรายละเอียดวิดีโอเต็มตา */}
        <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-black/50 via-transparent to-black/80" />
        <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/90 via-black/40 to-transparent" />

        {/* Content Box วางตำแหน่งด้านล่าง ข้อความขนาดกะทัดรัด ไม่สลับข้อความไปมา */}
        <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col items-center justify-end px-4 pb-8 sm:pb-12 text-center">
          <div className="mx-auto max-w-2xl px-4">
            {/* Tag Badge ขนาดเล็กกะทัดรัด */}
            {tag && (
              <div className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/40 px-3 py-0.5 text-[11px] font-medium tracking-wider text-brand-300 backdrop-blur-md uppercase">
                <span className="size-1.5 rounded-full bg-brand-400 animate-pulse" />
                {tag}
              </div>
            )}

            {/* Main Title ปรับขนาดเล็กลงตามคำขอ (text-xl sm:text-2xl lg:text-3xl) ดูโมเดิร์น สวยงาม ไม่เกะกะ */}
            <h1 className="mt-2.5 text-xl font-bold tracking-tight sm:text-2xl lg:text-3xl text-white drop-shadow-md">
              {title}
            </h1>

            {/* Subtitle ขนาดตัวอักษรพอเหมาะ สบายตา */}
            {subtitle && (
              <p className="mt-2 mx-auto max-w-xl text-xs sm:text-sm leading-relaxed text-ink-100/90 drop-shadow-sm">
                {subtitle}
              </p>
            )}

            {/* Action Buttons ปุ่มขนาดกะทัดรัด สไตล์ Pill */}
            <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5 sm:gap-3">
              <Link
                href={primaryCta.href}
                className="group inline-flex items-center gap-1.5 rounded-full bg-brand-400 px-5 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-white shadow-lg shadow-brand-500/20 transition-all duration-200 hover:bg-brand-500 hover:scale-105 active:scale-95"
              >
                <span>{primaryCta.label}</span>
                <svg
                  viewBox="0 0 24 24"
                  className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                </svg>
              </Link>

              {secondaryCta && (
                <Link
                  href={secondaryCta.href}
                  className="inline-flex items-center rounded-full border border-white/25 bg-black/30 px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-white backdrop-blur-md transition-all duration-200 hover:bg-white/20 hover:border-white/40 active:scale-95"
                >
                  {secondaryCta.label}
                </Link>
              )}

              {tertiaryCta && (
                <Link
                  href={tertiaryCta.href}
                  className="inline-flex items-center rounded-full border border-brand-400/40 bg-brand-500/10 px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-brand-300 backdrop-blur-md transition-all duration-200 hover:bg-brand-500/25 active:scale-95"
                >
                  {tertiaryCta.label}
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* แถบควบคุมวิดีโอมุมขวาล่าง: ปุ่ม Pause/Play และ ปุ่มเปิด-ปิดเสียง */}
        <div className="absolute bottom-4 sm:bottom-6 right-4 sm:right-6 z-20 flex items-center gap-2">
          {/* ปุ่มสลับเสียง (Mute / Unmute) */}
          <button
            type="button"
            onClick={toggleMute}
            aria-label={isMuted ? "เปิดเสียงวิดีโอ" : "ปิดเสียงวิดีโอ"}
            title={isMuted ? "เปิดเสียง" : "ปิดเสียง"}
            className="flex size-8 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white/90 backdrop-blur-md transition hover:bg-black/70 hover:text-white active:scale-95"
          >
            {isMuted ? (
              <svg viewBox="0 0 24 24" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 9.75 19.5 12m0 0 2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6-4.5 3.75H2.25a.75.75 0 0 0-.75.75v3c0 .414.336.75.75.75h2.25l4.5 3.75V3.75Z" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.5-3.75v15l-4.5-3.75H2.25A.75.75 0 0 1 1.5 15V9a.75.75 0 0 1 .75-.75h4.5Z" />
              </svg>
            )}
          </button>

          {/* ปุ่ม Pause / Play */}
          <button
            type="button"
            onClick={togglePlay}
            aria-label={isPlaying ? "หยุดวิดีโอชั่วคราว" : "เล่นวิดีโอต่อ"}
            title={isPlaying ? "หยุดเล่น (Pause)" : "เล่นต่อ (Play)"}
            className="flex size-8 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white/90 backdrop-blur-md transition hover:bg-black/70 hover:text-white active:scale-95"
          >
            {isPlaying ? (
              <svg viewBox="0 0 24 24" className="size-3.5" fill="currentColor">
                <path d="M6 5h3v14H6V5Zm9 0h3v14h-3V5Z" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" className="size-3.5 ml-0.5" fill="currentColor">
                <path d="M7 4.5v15l12-7.5L7 4.5Z" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* แถบตัวเลขสรุป (Stats Bar) */}
      {stats && (
        <div className="border-t border-white/10 bg-neutral-950/90 py-3 backdrop-blur-md">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-around gap-4 px-4 text-center text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <span className="text-ink-400">รุ่นในระบบ:</span>
              <span className="font-bold text-brand-400">{stats.modelsCount} รุ่น</span>
            </div>
            <div className="hidden h-3 w-px bg-white/20 sm:block" />
            <div className="flex items-center gap-2">
              <span className="text-ink-400">แบรนด์ชั้นนำ:</span>
              <span className="font-bold text-white">{stats.brandsCount} แบรนด์</span>
            </div>
            <div className="hidden h-3 w-px bg-white/20 sm:block" />
            <div className="flex items-center gap-2">
              <span className="text-ink-400">รีวิวจากผู้ใช้จริง:</span>
              <span className="font-bold text-brand-400">{stats.reviewsCount} รีวิว</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
