import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const categories = [
    { name: "Greetings", slug: "greetings", description: "Common Yoruba greetings and pleasantries" },
    { name: "Family & Relationships", slug: "family-relationships", description: "Family members, relatives and relationships" },
    { name: "Food & Drinks", slug: "food-drinks", description: "Food, drinks, cooking and meals" },
    { name: "Animals & Birds", slug: "animals-birds", description: "Animals, birds and insects" },
    { name: "Body Parts", slug: "body-parts", description: "Human body parts and organs" },
    { name: "Nature & Environment", slug: "nature-environment", description: "Nature, weather, plants and environment" },
    { name: "Numbers & Counting", slug: "numbers-counting", description: "Numbers, counting and measurements" },
    { name: "Verbs & Actions", slug: "verbs-actions", description: "Common verbs and actions" },
    { name: "Adjectives & Descriptions", slug: "adjectives-descriptions", description: "Adjectives and descriptive words" },
    { name: "Everyday Phrases", slug: "everyday-phrases", description: "Everyday expressions and common phrases" },
    { name: "Religion & Spirituality", slug: "religion-spirituality", description: "Religion, spirituality and traditional beliefs" },
    { name: "Occupations & Roles", slug: "occupations-roles", description: "Jobs, occupations and social roles" },
    { name: "Clothing & Appearance", slug: "clothing-appearance", description: "Clothing, accessories and appearance" },
    { name: "Colors", slug: "colors", description: "Colors and shades" },
    { name: "Time & Calendar", slug: "time-calendar", description: "Time, days, months and seasons" },
    { name: "Places & Locations", slug: "places-locations", description: "Places, locations, home and community" },
  ];

  console.log(`Seeding ${categories.length} categories...`);

  for (const c of categories) {
    await prisma.category.upsert({
      where: { slug: c.slug },
      update: { name: c.name, description: c.description, active: true },
      create: { ...c, active: true },
    });
    console.log(`✓ ${c.name}`);
  }

  const count = await prisma.category.count();
  console.log(`Done. Total categories in DB: ${count}`);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
