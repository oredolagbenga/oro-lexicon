import { auth } from "./auth";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { pathname } = req.nextUrl;

  const protectedPaths = ["/contribute", "/dashboard", "/admin"];
  const isProtected = protectedPaths.some((p) => pathname.startsWith(p));

  if (isProtected && !isLoggedIn) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return Response.redirect(loginUrl);
  }

  const authPaths = ["/login", "/register"];
  const isAuthPage = authPaths.some((p) => pathname === p);
  if (isAuthPage && isLoggedIn) {
    return Response.redirect(new URL("/dashboard", req.url));
  }
});

export const config = {
  matcher: ["/contribute/:path*", "/dashboard/:path*", "/admin/:path*", "/login", "/register"],
};
