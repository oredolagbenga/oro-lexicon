// import { auth } from "../auth";

// export default auth((req) => {
//   const isLoggedIn =!!req.auth;
//   const isAdminRoute = req.nextUrl.pathname.startsWith("/admin");
//   const isContribute = req.nextUrl.pathname.startsWith("/contribute");

//   if ((isAdminRoute || isContribute) &&!isLoggedIn) {
//     return Response.redirect(new URL("/login", req.nextUrl));
//   }

//   if (isAdminRoute && req.auth?.user) {
//     const role = (req.auth.user as any).role;
//     if (role!== "ADMIN") {
//       return Response.redirect(new URL("/", req.nextUrl));
//     }
//   }
// });

// export const config = {
//   matcher: ["/admin/:path*", "/contribute/:path*"],
// };

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// Protect /contribute, /dashboard, and redirect /login,/register if logged in
export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const isLoggedIn = !!token;
  const { pathname } = req.nextUrl;

  // 1. Protected pages - need login
  const protectedPaths = ["/contribute", "/dashboard"];
  const isProtected = protectedPaths.some((p) => pathname.startsWith(p));

  if (isProtected && !isLoggedIn) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 2. Auth pages - redirect if already logged in
  const authPaths = ["/login", "/register"];
  const isAuthPage = authPaths.some((p) => pathname === p);

  if (isAuthPage && isLoggedIn) {
    return NextResponse.redirect(new URL("/contribute", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/contribute/:path*", "/dashboard/:path*", "/login", "/register"],
};
