import { auth } from "../auth";

export default auth((req) => {
  const isLoggedIn =!!req.auth;
  const isAdminRoute = req.nextUrl.pathname.startsWith("/admin");
  const isContribute = req.nextUrl.pathname.startsWith("/contribute");

  if ((isAdminRoute || isContribute) &&!isLoggedIn) {
    return Response.redirect(new URL("/login", req.nextUrl));
  }

  if (isAdminRoute && req.auth?.user) {
    const role = (req.auth.user as any).role;
    if (role!== "ADMIN") {
      return Response.redirect(new URL("/", req.nextUrl));
    }
  }
});

export const config = {
  matcher: ["/admin/:path*", "/contribute/:path*"],
};