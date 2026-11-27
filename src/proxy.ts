import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "./i18n/routing";
import { COOKIE, verifyToken } from "./lib/auth";

const intl = createMiddleware(routing);

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const admin = await verifyToken(req.cookies.get(COOKIE)?.value);

  // 1) Admin API: JSON 401, never a redirect
  if (pathname.startsWith("/api/admin")) {
    return admin ? NextResponse.next() : NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  // 2) Admin pages (locale-prefixed)
  const m = pathname.match(/^\/(ar|en)\/admin(\/login)?\/?$/);
  if (m) {
    const [, locale, isLogin] = m;
    if (!admin && !isLogin) return NextResponse.redirect(new URL(`/${locale}/admin/login`, req.url));
    // تحويل الأدمن المسجّل من الـ login لـ /admin بيتم في الصفحة نفسها (بتفحص الداتابيز)
    const res = intl(req);
    res.headers.set("Cache-Control", "no-store");
    res.headers.set("X-Robots-Tag", "noindex, nofollow");
    return res;
  }

  return intl(req);
}

export const config = { matcher: ["/api/admin/:path*", "/((?!api|_next|_vercel|.*\\..*).*)"] };