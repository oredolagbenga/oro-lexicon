import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
const prisma = new PrismaClient();
async function main() {
  const email = "gbengaoredola88@gmail.com";
  const user = await prisma.user.findUnique({ where: { email }});
  console.log("Found:", user?.email, "status:", user?.status, "hash:", user?.passwordHash?.substring(0,20));
  if (!user?.passwordHash) return;
  
  const tests = ["Test1234!", "test1234!", "Test1234", "password", "Password123"];
  for (const p of tests) {
    const ok = await bcrypt.compare(p, user.passwordHash);
    console.log(`  Does "${p}" match? -> ${ok}`);
  }
}
main().finally(() => prisma.$disconnect());
