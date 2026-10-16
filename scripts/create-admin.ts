import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = "verify@orolexicon.com";
  const password = "123456789";
  const hash = await bcrypt.hash(password, 10);

  const admin = await prisma.user.upsert({
    where: { email },
    update: {
      passwordHash: hash,
      role: "ADMIN",
      status: "ACTIVE",
      emailVerified: true,
      name: "Oro Lexicon Admin",
    },
    create: {
      email,
      passwordHash: hash,
      role: "ADMIN",
      status: "ACTIVE",
      emailVerified: true,
      name: "Oro Lexicon Admin",
    },
  });

  console.log("✅ Admin created:", admin.email, "role:", admin.role, "id:", admin.id);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => await prisma.$disconnect());
