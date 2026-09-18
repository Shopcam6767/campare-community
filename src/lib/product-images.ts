import type { Product } from "./types";

/**
 * รูปสินค้าจริงที่มีในเครื่อง สำหรับรุ่นหลักในชุดข้อมูล seed / mock
 * เก็บไว้ใน public/images/products/ เพื่อให้โหลดเร็วทันทีและไม่ขึ้นกับเน็ตเวิร์กภายนอก
 */
export const SEED_PRODUCT_IMAGES: Record<string, string> = {
  "sony-a7c-ii": "/images/products/sony-a7c-ii.jpg",
  "sony-a6700": "/images/products/sony-a6700.jpg",
  "canon-eos-r6-ii": "/images/products/canon-eos-r6-ii.jpg",
  "canon-eos-r50": "/images/products/canon-eos-r50.jpg",
  "nikon-z6-iii": "/images/products/nikon-z6-iii.jpg",
  "fujifilm-x-t5": "/images/products/fujifilm-x-t5.jpg",
  "fujifilm-x100vi": "/images/products/fujifilm-x100vi.jpg",
  "olympus-om-1": "/images/products/olympus-om-1.jpg",
  "panasonic-g100": "/images/products/panasonic-g100.jpg",
  "sony-fe-50mm-f18": "/images/products/sony-fe-50mm-f18.jpg",
  "sigma-18-50-f28": "/images/products/sigma-18-50-f28.jpg",
  "canon-rf-50mm-f18": "/images/products/canon-rf-50mm-f18.jpg",
  "manfrotto-befree-3": "/images/products/manfrotto-befree-3.jpg",
  "peak-design-slide": "/images/products/peak-design-slide.jpg",
};

export function getProductImageUrl(slug: string | null | undefined, currentUrl: string | null | undefined): string | null {
  if (slug && SEED_PRODUCT_IMAGES[slug]) {
    // ถ้ารูปเดิมเป็น placeholder หรือไม่มี ให้ใช้รูปจริงจาก local
    if (!currentUrl || currentUrl.includes("placehold.co") || currentUrl.includes("via.placeholder.com")) {
      return SEED_PRODUCT_IMAGES[slug];
    }
  }
  return currentUrl ?? null;
}

export function resolveProductImage(p: Product): Product {
  if (!p) return p;
  const resolved = getProductImageUrl(p.slug, p.thumbnail_url);
  if (resolved !== p.thumbnail_url) {
    return { ...p, thumbnail_url: resolved };
  }
  return p;
}
