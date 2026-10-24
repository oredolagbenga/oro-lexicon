import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
const prisma = new PrismaClient();
async function main() {
  const hash1 = await bcrypt.hash('Test1234!', 10);
  const hash2 = await bcrypt.hash('Admin1234!', 10);
  const u1 = await prisma.user.upsert({
    where: { email: 'gbengaoredola88@gmail.com' },
    update: { passwordHash: hash1, status: 'ACTIVE', role: 'CONTRIBUTOR' },
    create: { email: 'gbengaoredola88@gmail.com', passwordHash: hash1, name: 'Gbenga', role: 'CONTRIBUTOR', status: 'ACTIVE' },
  });
  const u2 = await prisma.user.upsert({
    where: { email: 'admin@orolexicon.com' },
    update: { passwordHash: hash2, status: 'ACTIVE', role: 'ADMIN' },
    create: { email: 'admin@orolexicon.com', passwordHash: hash2, name: 'Admin', role: 'ADMIN', status: 'ACTIVE' },
  });
  console.log(`✅ CONTRIBUTOR: ${u1.email} / Test1234! -> ${u1.status}`);
  console.log(`✅ ADMIN: ${u2.email} / Admin1234! -> ${u2.status}`);
}
main().finally(() => prisma.$disconnect());
