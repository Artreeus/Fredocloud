import { NextResponse } from "next/server";

const accessCookieName =
  process.env.ACCESS_TOKEN_COOKIE_NAME || "fredocloud_access_token";

const protectedPrefixes = ["/dashboard", "/settings"];
const guestOnlyPrefixes = ["/login", "/register"];

export function middleware(request) {
  const { pathname } = request.nextUrl;
  const hasAccessToken = Boolean(request.cookies.get(accessCookieName)?.value);

  const isProtectedRoute = protectedPrefixes.some((prefix) => pathname.startsWith(prefix));
  const isGuestOnlyRoute = guestOnlyPrefixes.some((prefix) => pathname.startsWith(prefix));

  if (isProtectedRoute && !hasAccessToken) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isGuestOnlyRoute && hasAccessToken) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/settings/:path*", "/login", "/register"]
};
