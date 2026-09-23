import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { MOCK_PRODUCTS } from "@/lib/mock-data";
import { getBrands, safeTerms } from "@/lib/queries";
import { getProductImageUrl } from "@/lib/product-images";
import type { ProductOption, ProductType } from "@/lib/types";

/**
 * ค้นหาสินค้าสำหรับช่องเลือกรุ่น (ProductPicker) และแถบค้นหาแนะนำ (SearchBar Autocomplete)
 * รองรับการค้นหาแบบแยกคำอิสระ (Multi-word) และดึงข้อมูลแบรนด์มาร่วมค้นหา
 */
export async function GET(request: NextRequest) {
  const q = (request.nextUrl.searchParams.get("q") ?? "").trim().slice(0, 60);
  const type = request.nextUrl.searchParams.get("type") as ProductType | null;
  const limitParam = request.nextUrl.searchParams.get("limit");
  const limit = Math.min(Math.max(1, Number(limitParam) || 8), 30);

  const terms = safeTerms(q);

  if (!isSupabaseConfigured) {
    const lowerTerms = terms.map((t) => t.toLowerCase());
    const filtered = MOCK_PRODUCTS.filter((p) => {
      if (type && p.product_type !== type) return false;
      if (!lowerTerms.length) return true;
      const target = `${p.name} ${p.product_no} ${p.companies?.name ?? ""}`.toLowerCase();
      return lowerTerms.every((t) => target.includes(t));
    })
      .slice(0, limit)
      .map((p) => ({
        id: p.id,
        slug: p.slug,
        name: p.name,
        product_no: p.product_no,
        product_type: p.product_type,
        msrp: p.msrp,
        market_price: p.market_price,
        thumbnail_url: getProductImageUrl(p.slug, p.thumbnail_url),
        companies: p.companies
          ? {
              id: p.companies.id,
              name: p.companies.name,
              slug: p.companies.slug,
              logo_url: p.companies.logo_url ?? null,
            }
          : null,
      }));

    return NextResponse.json({ items: filtered as ProductOption[] });
  }

  try {
    const supabase = await createClient();
    let query = supabase
      .from("products")
      .select(
        "id, slug, name, product_no, product_type, msrp, market_price, thumbnail_url, companies!inner ( id, name, slug, logo_url )"
      )
      .eq("is_deleted", false);

    if (type) query = query.eq("product_type", type);

    if (terms.length > 0) {
      const brands = await getBrands();
      for (const term of terms) {
        const lower = term.toLowerCase();
        const matchedBrandIds = brands
          .filter(
            (b) =>
              b.name.toLowerCase().includes(lower) ||
              b.slug.toLowerCase().includes(lower)
          )
          .map((b) => b.id);

        const conditions = [
          `name.ilike.%${term}%`,
          `product_no.ilike.%${term}%`,
          ...matchedBrandIds.map((id) => `company_id.eq.${id}`),
        ];

        query = query.or(conditions.join(","));
      }
    }

    const { data, error } = await query
      .order("review_count", { ascending: false })
      .order("name", { ascending: true })
      .limit(limit);

    if (error) throw error;

    const items = (data ?? []).map((item: any) => ({
      ...item,
      thumbnail_url: getProductImageUrl(item.slug, item.thumbnail_url),
    }));

    return NextResponse.json({ items: items as ProductOption[] });
  } catch {
    return NextResponse.json({ items: [] });
  }
}
