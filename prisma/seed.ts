import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

function normYo(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "").trim();
}
function normEn(s: string) {
  return s.toLowerCase().trim().replace(/\s+/g, " ");
}

async function main() {
  console.log("Seeding...");

  await prisma.word.deleteMany();
  await prisma.audioRecording.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  const admin = await prisma.user.create({
    data: {
      email: "admin@orolexicon.com",
      name: "Admin",
      role: "ADMIN",
      status: "ACTIVE",
    },
  });

  const contributor = await prisma.user.create({
    data: {
      email: "gbengaoredola411@gmail.com",
      name: "GBENGA ORO",
      role: "CONTRIBUTOR",
      status: "ACTIVE",
    },
  });

  // ✅ YOUR NICE CATEGORIES BACK
  const categoriesData = [
    { name: 'Greetings', slug: 'greetings', description: 'Ẹ kú - Daily greetings and respect' },
    { name: 'Love', slug: 'love', description: 'Ìfẹ́ - Love, affection & relationships' },
    { name: 'Family', slug: 'family', description: 'Ẹbí - Family, people & kinship' },
    { name: 'Food', slug: 'food', description: 'Oúnjẹ - Food, drink & cooking' },
    { name: 'Nature', slug: 'nature', description: 'Ìṣẹ̀dá - Nature, water, sky & earth' },
    { name: 'Common', slug: 'common', description: 'Ọ̀rọ̀ wọ́pọ̀ - Everyday common words' },
    { name: 'Body', slug: 'body', description: 'Ara - Body, health & wellness' },
    { name: 'Spirituality', slug: 'spirituality', description: 'Ẹ̀mí - Spirit, faith & culture' },
    { name: 'Numbers', slug: 'numbers', description: 'Nọ́mbà - Numbers, time & days' },
  ];

  const cats: Record<string, any> = {};
  for (const c of categoriesData) {
    cats[c.slug] = await prisma.category.create({ data: { ...c, active: true } });
  }

  console.log(`Created ${categoriesData.length} categories`);

  const words = [
    {
      yoruba: "Ẹ kú àárọ̀",
      english: "Good morning",
      ipa: "/ɛ kú àárɔ̀/",
      partOfSpeech: "phrase",
      exampleYo: "Ẹ kú àárọ̀, báwo ni?",
      exampleEn: "Good morning, how are you?",
      conceptKey: "good-morning",
      category: "greetings",
    },
    {
      yoruba: "Omi",
      english: "Water",
      ipa: "/o.mi/",
      partOfSpeech: "noun",
      conceptKey: "water",
      category: "nature",
    },
    {
      yoruba: "Ìfẹ́",
      english: "Love",
      ipa: "/ì.fɛ́/",
      partOfSpeech: "noun",
      conceptKey: "love",
      category: "love",
    },
  ];

  for (const w of words) {
    await prisma.word.create({
      data: {
        yoruba: w.yoruba,
        normalizedWord: normYo(w.yoruba),
        normalizedEnglish: normEn(w.english),
        slug: w.yoruba.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
        english: w.english,
        ipa: (w as any).ipa,
        partOfSpeech: w.partOfSpeech,
        exampleYo: (w as any).exampleYo,
        exampleEn: (w as any).exampleEn,
        conceptKey: (w as any).conceptKey,
        categoryId: cats[w.category].id,
        contributorId: contributor.id,
        status: "APPROVED",
        views: 0,
      },
    });
  }

  console.log("Seeded 3 words + admin + contributor + 8 categories");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });