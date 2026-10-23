import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import crypto from "crypto";

export async function POST(req: Request) {
  const { email } = await req.json();
  if (!email) return Response.json({ error: "Email required" }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
  // Always return ok to prevent email enumeration
  if (!user) return Response.json({ ok: true });

  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60), // 1 hour
    }
  });

  const resetUrl = `https://lexicon.oredola.dev/reset-password?token=${token}`;

  await sendEmail(
    user.email,
    "Reset your Oro Lexicon password",
    `<div style="font-family:sans-serif"><p>Ẹ kú àárọ̀ ${user.name || ""},</p><p>Click to reset: <a href="${resetUrl}">${resetUrl}</a></p><p>This link expires in 1 hour.</p></div>`
  );

  return Response.json({ ok: true });
}