import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
const prisma = new PrismaClient();
async function main() {
  const email = "gbengaoredola88@gmail.com";
  const newPass = "Test1234!";
  const hash = await bcrypt.hash(newPass, 10);
  await prisma.user.update({ where: { email }, data: { passwordHash: hash } });
  console.log(`✅ Reset ${email} password to: ${newPass}`);
}
main().finally(() => prisma.$disconnect());
