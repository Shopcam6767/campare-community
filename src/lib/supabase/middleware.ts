import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

type CookieToSet = { name: string; value: string; options: CookieOptions };

/** หน้าที่ต้องล็อกอินก่อนถึงจะเข้าได้ */
const PROTECTED_PREFIXES = ["/profile", "/cart", "/checkout", "/admin"];

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  // ยังไม่ได้ตั้งค่า .env.local — ปล่อยผ่านไปก่อน เว็บจะขึ้นโหมด demo
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return response;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // ห้ามลบบรรทัดนี้ — เป็นตัวรีเฟรช token ให้ session ไม่หลุด
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // บัญชีถูกระงับ → เตะออกทันทีที่ขอหน้าใหม่ / กดปุ่ม / ส่งฟอร์ม
  // (ทุก request รวมถึงการเปลี่ยนหน้าแบบไม่รีเฟรชและ server action ผ่านตรงนี้หมด)
  if (user && !pathname.startsWith("/login")) {
    const { data: active } = await supabase.rpc("is_account_active");
    if (active === false) {
      await supabase.auth.signOut(); // ล้าง cookie ผ่าน setAll → อยู่ใน response
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.search = "?error=suspended";
      const redirect = NextResponse.redirect(url);
      response.cookies.getAll().forEach((c) => redirect.cookies.set(c));
      return redirect;
    }
  }

  const needsAuth = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));

  if (!user && needsAuth) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  return response;
}
