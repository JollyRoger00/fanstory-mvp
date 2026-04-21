import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { sanitizeCallbackUrl } from "@/lib/auth/callback-url";

const protectedPrefixes = [
  "/dashboard",
  "/stories",
  "/saves",
  "/wallet",
  "/subscriptions",
];

export default auth((request) => {
  const isProtectedRoute = protectedPrefixes.some((prefix) =>
    request.nextUrl.pathname.startsWith(prefix),
  );

  if (!isProtectedRoute || request.auth) {
    return NextResponse.next();
  }

  const signInUrl = new URL("/sign-in", request.nextUrl.origin);
  signInUrl.searchParams.set(
    "callbackUrl",
    sanitizeCallbackUrl(`${request.nextUrl.pathname}${request.nextUrl.search}`),
  );

  return NextResponse.redirect(signInUrl);
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/stories/:path*",
    "/saves/:path*",
    "/wallet/:path*",
    "/subscriptions/:path*",
  ],
};
