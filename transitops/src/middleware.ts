import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AUTH_COOKIE_NAME } from "@/lib/constants";

// Routes that do not require authentication
const publicRoutes = ["/login", "/register"];
const publicApiRoutes = ["/api/auth/login", "/api/auth/register"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if token exists in cookie or Authorization header
  const tokenCookie = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const authHeader = request.headers.get("authorization");
  const hasToken = Boolean(tokenCookie || (authHeader && authHeader.startsWith("Bearer ")));

  // 1. API Route checks
  if (pathname.startsWith("/api/")) {
    if (publicApiRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`))) {
      return NextResponse.next();
    }

    if (!hasToken) {
      return NextResponse.json(
        {
          success: false,
          message: "Authentication required. Please log in.",
          error: { code: "UNAUTHORIZED" },
        },
        { status: 401 }
      );
    }
    return NextResponse.next();
  }

  // 2. Frontend Page Route checks
  const isPublicPage = publicRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`));

  if (!hasToken && !isPublicPage && pathname !== "/") {
    // Redirect unauthenticated users to /login
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (hasToken && isPublicPage) {
    // Redirect already logged in users to /dashboard (or role default)
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (pathname === "/") {
    if (hasToken) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    } else {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, assets)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
