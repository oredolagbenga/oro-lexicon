import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  const result = await prisma.user.updateMany({
    where: { emailVerified: false },
    data: { emailVerified: true }
  });
  console.log(`✅ Fixed ${result.count} users to emailVerified=true`);
  const all = await prisma.user.findMany({ select: { email: true, emailVerified: true }});
  console.table(all);
}
main().finally(() => prisma.$disconnect());
