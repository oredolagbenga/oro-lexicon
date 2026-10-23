// import { prisma } from "@/lib/prisma";
// import bcrypt from "bcryptjs";

// export async function POST(req: Request) {
//   const { email, password } = await req.json();
//   const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
//   if (!user) return Response.json({ found: false });
//   const hasHash = !!user.passwordHash;
//   const valid = hasHash ? await bcrypt.compare(password, user.passwordHash!) : false;
//   return Response.json({ 
//     found: true, 
//     email: user.email,
//     hasHash,
//     hash_len: user.passwordHash?.length || 0,
//     status: user.status,
//     emailVerified: user.emailVerified,
//     validPassword: valid
//   });
// }

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
export async function POST(req: Request) {
  const { email, password } = await req.json();
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
  if (!user) return Response.json({ found: false });
  const valid = user.passwordHash ? await bcrypt.compare(password, user.passwordHash) : false;
  return Response.json({ found: true, email: user.email, hasHash: !!user.passwordHash, hash_len: user.passwordHash?.length, status: user.status, verified: user.emailVerified, valid });
}