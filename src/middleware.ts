import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicPaths = ["/login", "/forgot-password"];
const SESSION_COOKIE = "ftx_admin_session";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = request.cookies.get(SESSION_COOKIE)?.value;

  if (pathname.startsWith("/api/")) {
    const publicApi =
      pathname === "/api/auth/login" ||
      pathname.startsWith("/api/auth/login/") ||
      pathname === "/api/admin/auth/login" ||
      pathname.startsWith("/api/admin/auth/login/") ||
      pathname === "/api/admin/auth/mfa/verify" ||
      pathname.startsWith("/api/admin/auth/mfa/verify/") ||
      pathname === "/api/admin/auth/password/reset" ||
      pathname.startsWith("/api/admin/auth/password/reset/") ||
      pathname === "/api/admin/health" ||
      pathname.startsWith("/api/admin/health/");
    if (publicApi) return NextResponse.next();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.next();
  }

  const isPublic =
    publicPaths.some((p) => pathname === p || pathname.startsWith(`${p}/`)) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/brand") ||
    pathname.includes(".");

  if (!session && !isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (session && (pathname === "/login" || pathname === "/forgot-password")) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
