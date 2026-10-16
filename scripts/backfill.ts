// Run with: npx tsx scripts/backfill.ts
// Or: node --loader ts-node/esm scripts/backfill.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function normalizeYoruba(text: string) {
  return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "").trim();
}
function normalizeEnglish(text: string) {
  return text.toLowerCase().trim().replace(/\s+/g, " ");
}

async function main() {
  console.log("Backfilling normalized fields...");

  const words = await prisma.word.findMany();
  console.log(`Found ${words.length} words`);

  for (const w of words) {
    const normYo = (w as any).normalizedWord || normalizeYoruba(w.yoruba);
    const normEn = (w as any).normalizedEnglish || normalizeEnglish(w.english);

    // Check if duplicate would violate new unique constraint
    const duplicate = await prisma.word.findFirst({
      where: {
        id: { not: w.id },
        normalizedWord: normYo,
        normalizedEnglish: normEn,
      },
    });

    if (duplicate) {
      console.log(`⚠️ Duplicate found: ${w.yoruba} -> ${w.english} duplicates ${duplicate.yoruba} -> ${duplicate.english} (ID ${duplicate.id}). Deleting older or keeping?`);
      // Keep first, delete second - change logic if you want
      // await prisma.word.delete({ where: { id: w.id } });
      // console.log(`Deleted ${w.id}`);
      // continue;
    }

    await prisma.word.update({
      where: { id: w.id },
      data: {
        normalizedWord: normYo,
        normalizedEnglish: normEn,
      },
    });
    console.log(`✓ ${w.yoruba} -> normYo=${normYo}, normEn=${normEn}`);
  }

  console.log("Done backfill");
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
