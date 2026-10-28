import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/admin/",
          "/dashboard",
          "/dashboard/",
          "/profile",
          "/profile/",
          "/login",
          "/register",
          "/forgot-password",
          "/reset-password",
          "/contribute/audio",
          "/api/",
          "/_next/",
        ],
      },
    ],
    sitemap: "https://lexicon.oredola.dev/sitemap.xml",
  };
}