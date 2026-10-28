import { prisma } from "@/lib/prisma";
import { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://lexicon.oredola.dev";
  
  // Static public pages ONLY — no private pages
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/dictionary`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/contribute`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.6 },
  ];

  try {
    const words = await prisma.word.findMany({
      where: { status: "APPROVED" }, // Your DB uses APPROVED — keep it
      select: { slug: true, updatedAt: true },
      take: 5000, // Google limit is 50k, but 5k is safe for build
    });

    const wordRoutes: MetadataRoute.Sitemap = words.map((w) => ({
      url: `${baseUrl}/dictionary/${w.slug}`,
      lastModified: w.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

    return [...staticRoutes, ...wordRoutes];
  } catch (e) {
    console.error("Sitemap DB error:", e);
    return staticRoutes;
  }
}