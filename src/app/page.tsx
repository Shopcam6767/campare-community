import Link from "next/link";
import HeroVideoBanner from "@/components/hero-video-banner";
import ProductCard from "@/components/product-card";
import { getBrands, getProducts } from "@/lib/queries";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { PRODUCT_TYPE_LABEL, type ProductType } from "@/lib/types";

const CATEGORIES = [
  { type: "camera", image: "/images/categories/camera.webp" },
  { type: "lens", image: "/images/categories/lens.webp" },
  { type: "tripod", image: "/images/categories/tripod.webp" },
  { type: "filter", image: "/images/categories/filter.webp" },
  { type: "strap", image: "/images/categories/strap.webp" },
  { type: "grip", image: "/images/categories/grip.webp" },
] satisfies {
  type: ProductType;
  image: string;
}[];

export default async function HomePage() {
  const [recommended, newest, brands] = await Promise.all([
    getProducts({ sort: "popular" }),
    getProducts({ sort: "newest" }),
    getBrands(),
  ]);

  return (
    <>
      {!isSupabaseConfigured && (
        <div className="bg-brand-50 px-4 py-2 text-center text-xs text-brand-800">
          กำลังแสดงข้อมูลตัวอย่าง — ตั้งค่า <code className="font-mono">.env.local</code> เพื่อเชื่อม Supabase จริง
        </div>
      )}

      {/* HERO VIDEO BANNER (Cinematic Video Banner แบบ Pop Mart) */}
      <HeroVideoBanner
        stats={{
          modelsCount: recommended.length,
          brandsCount: brands.length,
          reviewsCount: recommended.reduce((s, p) => s + p.review_count, 0),
        }}
      />

      {/* จุดขาย 3 ข้อ (แถบใต้ hero ตาม wireframe) */}
      <section className="border-b border-ink-100">
        <div className="mx-auto grid max-w-7xl gap-4 px-4 py-6 sm:grid-cols-3">
          {[
            ["เทียบสเปกอัตโนมัติ", "ระบบไฮไลต์ช่องที่ต่างกันให้เอง ไม่ต้องไล่อ่านเอง"],
            ["ราคากลางมือสอง", "คำนวณจากประกาศขายจริงในระบบ ดูแนวโน้มได้"],
            ["แจ้งเตือน Wishlist", "มีของเข้าตรงรุ่นที่กดใจไว้ ระบบเตือนทันที"],
          ].map(([title, desc]) => (
            <div key={title} className="flex items-start gap-3">
              <span className="mt-1 size-2 shrink-0 rounded-full bg-brand-400" />
              <div>
                <p className="text-sm font-semibold">{title}</p>
                <p className="text-xs leading-relaxed text-ink-500">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

{/* ประเภทสินค้า */}
<section className="mx-auto max-w-7xl px-4 py-10">
  <h2 className="text-xl font-bold">ประเภทสินค้า</h2>

  <div className="scroll-slim mt-6 flex gap-6 overflow-x-auto pb-4 sm:gap-8">
    {CATEGORIES.map(({ type, image }) => (
      <Link
        key={type}
        href={`/category?type=${type}`}
        className="group flex min-w-[140px] flex-1 flex-col items-center"
      >
        <div className="flex h-32 w-32 items-center justify-center">
          <img
            src={image}
            alt={PRODUCT_TYPE_LABEL[type]}
            className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
          />
        </div>

        <span className="mt-3 text-sm font-semibold transition-colors group-hover:text-brand-600">
          {PRODUCT_TYPE_LABEL[type]}
        </span>
      </Link>
    ))}
  </div>
</section>

      {/* สินค้าแนะนำ */}
      <section className="mx-auto max-w-7xl px-4 pb-10">
        <div className="flex items-end justify-between">
          <h2 className="text-xl font-bold">สินค้าแนะนำ</h2>
          <Link
            href="/category"
            className="text-sm font-medium text-brand-600 hover:underline"
          >
            ดูทั้งหมด →
          </Link>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {recommended.slice(0, 8).map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* มาใหม่ */}
      <section className="mx-auto max-w-7xl px-4 pb-4">
        <div className="flex items-end justify-between">
          <h2 className="text-xl font-bold">เพิ่งเปิดตัว</h2>
          <Link
            href="/category?sort=newest"
            className="text-sm font-medium text-brand-600 hover:underline"
          >
            ดูทั้งหมด →
          </Link>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {newest.slice(0, 4).map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* แบรนด์ */}
      <section className="mx-auto max-w-7xl px-4 py-10">
        <h2 className="text-xl font-bold">แบรนด์</h2>
        <div className="scroll-slim mt-4 flex gap-3 overflow-x-auto pb-2">
          {brands.map((b) => (
            <Link
              key={b.id}
              href={`/category?brand=${b.slug}`}
              className="shrink-0 rounded-full border border-ink-200 px-5 py-2 text-sm font-medium hover:border-brand-400 hover:text-brand-600"
            >
              {b.name}
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
