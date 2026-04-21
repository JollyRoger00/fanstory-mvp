import { NextResponse } from "next/server";
import { auth } from "@/auth";

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
  signInUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);

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
