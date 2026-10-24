import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function reset(email, password, role) {
  const hash = await bcrypt.hash(password, 10);
  const user = await prisma.user.upsert({
    where: { email: email.toLowerCase() },
    update: {
      passwordHash: hash,
      status: 'ACTIVE',
      role: role,
    },
    create: {
      email: email.toLowerCase(),
      passwordHash: hash,
      name: role === 'ADMIN' ? 'Admin' : 'Gbenga Oredola',
      role: role,
      status: 'ACTIVE',
    },
  });
  console.log(`✅ ${role}: ${user.email} / ${password} -> ${user.status}`);
}

await reset('gbengaoredola88@gmail.com', 'Test1234!', 'CONTRIBUTOR');
await reset('admin@orolexicon.com', 'Admin1234!', 'ADMIN');

await prisma.$disconnect();