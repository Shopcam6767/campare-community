import Image from "next/image";

/**
 * รูปสินค้า — ถ้ายังไม่มีรูปจริง จะ render กล่อง placeholder ของเราเอง
 *
 * ทำไมไม่ใช้ placehold.co: มันส่ง SVG กลับมา ซึ่ง next/image บล็อกไว้
 * (SVG ฝัง script ได้) ถ้าจะให้ผ่านต้องเปิด dangerouslyAllowSVG ซึ่งไม่คุ้ม
 * placeholder ที่วาดเองเร็วกว่า สวยกว่า และไม่ต้องยิงเน็ตออกไปข้างนอก
 */

import { getProductImageUrl } from "@/lib/product-images";

const REMOTE_PLACEHOLDER_HOSTS = ["placehold.co", "via.placeholder.com"];

export function isRealImage(url: string | null | undefined) {
  if (!url) return false;
  // รูป local เช่น /images/products/... ถือเป็นรูปจริงเสมอ
  if (url.startsWith("/") || url.startsWith("./")) return true;
  try {
    return !REMOTE_PLACEHOLDER_HOSTS.includes(new URL(url).hostname);
  } catch {
    return false;
  }
}

export default function ProductThumb({
  src,
  alt,
  slug,
  sizes,
  priority = false,
  fit = "cover",
  className = "",
}: {
  src: string | null | undefined;
  alt: string;
  slug?: string;
  sizes?: string;
  priority?: boolean;
  /** contain = เห็นสินค้าทั้งตัว ไม่ถูกครอป (ใช้กับการ์ด) */
  fit?: "cover" | "contain";
  className?: string;
}) {
  const resolvedSrc = getProductImageUrl(slug, src);

  if (isRealImage(resolvedSrc)) {
    return (
      <Image
        src={resolvedSrc!}
        alt={alt}
        fill
        priority={priority}
        sizes={sizes}
        className={`${fit === "contain" ? "object-contain p-3" : "object-cover"} ${className}`}
      />
    );
  }

  return (
    <div
      role="img"
      aria-label={alt}
      className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-linear-to-br from-brand-50 via-ink-50 to-brand-100 p-3 text-center"
    >
      <svg
        viewBox="0 0 24 24"
        className="size-8 text-brand-300"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 8.5A1.5 1.5 0 0 1 4.5 7h2.4a1.5 1.5 0 0 0 1.2-.6l.9-1.2a1.5 1.5 0 0 1 1.2-.6h3.6a1.5 1.5 0 0 1 1.2.6l.9 1.2a1.5 1.5 0 0 0 1.2.6h2.4A1.5 1.5 0 0 1 21 8.5v9a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 17.5v-9Z"
        />
        <circle cx="12" cy="13" r="3.25" />
      </svg>
      <span className="line-clamp-2 text-[11px] font-medium leading-tight text-ink-500">
        {alt}
      </span>
    </div>
  );
}
