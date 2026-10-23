import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
  const token = await getToken({ req, secret });
  const isLoggedIn = !!token;
  const { pathname } = req.nextUrl;

  const protectedPaths = ["/contribute", "/dashboard", "/admin"];
  const isProtected = protectedPaths.some((p) => pathname.startsWith(p));

  if (isProtected && !isLoggedIn) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const authPaths = ["/login", "/register"];
  const isAuthPage = authPaths.some((p) => pathname === p);
  if (isAuthPage && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }
  return NextResponse.next();
}
export const config = {
  matcher: ["/contribute/:path*", "/dashboard/:path*", "/admin/:path*", "/login", "/register"],
};