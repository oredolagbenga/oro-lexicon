import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
const prisma = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash("Admin123!", 10);
  await prisma.user.update({
    where: { email: "admin@orolexicon.com" },
    data: { passwordHash: hash, role: "ADMIN", status: "ACTIVE", emailVerified: true }
  });
  console.log("✅ Admin password set to: Admin123!");
  
  const hash2 = await bcrypt.hash("Gbenga123!", 10);
  await prisma.user.update({
    where: { email: "gbengaoredola411@gmail.com" },
    data: { passwordHash: hash2, status: "ACTIVE", emailVerified: true }
  });
  console.log("✅ Contributor password set to: Gbenga123!");
}
main().finally(() => prisma.$disconnect());