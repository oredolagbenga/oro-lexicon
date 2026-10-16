export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import DictionaryClient from "./DictionaryClient";

export default async function DictionaryPage({ searchParams }: { searchParams: Promise<{ q?: string; category?: string; page?: string }> }) {
  const params = await searchParams;
  const q = params.q || "";
  const categorySlug = params.category || "";
  const page = parseInt(params.page || "1");
  const take = 12;
  const skip = (page - 1) * take;

  const where: any = { status: "APPROVED" };
  if (q) {
    where.OR = [
      { yoruba: { contains: q } },
      { english: { contains: q } },
      { normalizedWord: { contains: q } },
    ];
  }
  if (categorySlug) {
    where.category = { slug: categorySlug };
  }

  const [words, total, categories] = await Promise.all([
    prisma.word.findMany({
      where,
      include: { category: true, audioRecordings: { where: { status: "APPROVED" } } },
      orderBy: { createdAt: "desc" },
      take,
      skip,
    }),
    prisma.word.count({ where }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  return <DictionaryClient words={words} total={total} categories={categories} initialQ={q} initialCategory={categorySlug} page={page} pageSize={take} />;
}
