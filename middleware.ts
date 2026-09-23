import { NextResponse, type NextRequest } from "next/server";

const AUTH_TOKEN_COOKIE_KEY = "sherix-auth-token";
const AUTH_ROUTES = new Set(["/sign-in"]);
const PROTECTED_ROUTE_PREFIXES = [
  "/dashboard",
  "/employee",
  "/requests",
  "/earnings",
  "/notifications",
  "/settings",
];

function isProtectedRoute(pathname: string) {
  return PROTECTED_ROUTE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasToken = Boolean(request.cookies.get(AUTH_TOKEN_COOKIE_KEY)?.value);

  if (AUTH_ROUTES.has(pathname) && hasToken) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (isProtectedRoute(pathname) && !hasToken) {
    const signInUrl = new URL("/sign-in", request.url);
    signInUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/sign-in",
    "/company-onboarding/:path*",
    "/dashboard/:path*",
    "/employee/:path*",
    "/requests/:path*",
    "/earnings/:path*",
    "/notifications/:path*",
    "/settings/:path*",
  ],
};
