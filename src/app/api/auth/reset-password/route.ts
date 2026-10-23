import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  const { token, password } = await req.json();
  if (!token || !password || password.length < 8) return Response.json({ error: "Invalid" }, { status: 400 });

  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const record = await prisma.passwordResetToken.findUnique({ where: { tokenHash } });

  if (!record || record.used || record.expiresAt < new Date()) {
    return Response.json({ error: "Token expired or invalid" }, { status: 400 });
  }

  const hashed = await bcrypt.hash(password, 10);
  await prisma.user.update({ where: { id: record.userId }, data: { password: hashed } });
  await prisma.passwordResetToken.update({ where: { id: record.id }, data: { used: true } });

  return Response.json({ ok: true });
}