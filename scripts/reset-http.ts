import 'dotenv/config';
import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';
const url = process.env.DATABASE_URL!.replaceAll('"','').trim();
console.log('URL loaded:', url.slice(0, 50));
const sql = neon(url);
async function main() {
  const hash1 = await bcrypt.hash('Test1234!', 10);
  const hash2 = await bcrypt.hash('Admin1234!', 10);
  await sql`INSERT INTO "User" (id, email, "passwordHash", name, role, status, "createdAt", "updatedAt") VALUES (gen_random_uuid(), 'gbengaoredola88@gmail.com', ${hash1}, 'Gbenga', 'CONTRIBUTOR', 'ACTIVE', NOW(), NOW()) ON CONFLICT (email) DO UPDATE SET "passwordHash" = ${hash1}, status = 'ACTIVE', role = 'CONTRIBUTOR', "updatedAt" = NOW()`;
  await sql`INSERT INTO "User" (id, email, "passwordHash", name, role, status, "createdAt", "updatedAt") VALUES (gen_random_uuid(), 'admin@orolexicon.com', ${hash2}, 'Admin', 'ADMIN', 'ACTIVE', NOW(), NOW()) ON CONFLICT (email) DO UPDATE SET "passwordHash" = ${hash2}, status = 'ACTIVE', role = 'ADMIN', "updatedAt" = NOW()`;
  console.log('✅ CONTRIBUTOR: gbengaoredola88@gmail.com / Test1234! -> ACTIVE');
  console.log('✅ ADMIN: admin@orolexicon.com / Admin1234! -> ACTIVE');
}
main();
