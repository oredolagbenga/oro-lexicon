import { prisma } from "@/lib/prisma";

export default async function sitemap() {
  const baseUrl = "https://lexicon.oredola.dev";
  
  // Get all approved words
  const words = await prisma.word.findMany({
    where: { status: "APPROVED" },
    select: { slug: true, updatedAt: true },
  });

  // Home + dictionary pages
  const routes = [
    { url: baseUrl, lastModified: new Date() },
    { url: `${baseUrl}/dictionary`, lastModified: new Date() },
    { url: `${baseUrl}/contribute`, lastModified: new Date() },
  ];

  // Add each word page
  const wordRoutes = words.map((w) => ({
    url: `${baseUrl}/dictionary/${w.slug}`,
    lastModified: w.updatedAt,
  }));

  return [...routes, ...wordRoutes];
}