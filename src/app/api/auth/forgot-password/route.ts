import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import crypto from "crypto";

export async function POST(req: Request) {
  const { email } = await req.json();
  if (!email) return Response.json({ error: "Email required" }, { status: 400 });

  const user = await prisma.user.findUnique({ 
    where: { email: email.toLowerCase().trim() } 
  });
  
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

  // 👇 TRY/CATCH HERE — so email failure doesn't crash the route
  try {
    await sendEmail(
      user.email,
      "Reset your Oro Lexicon password",
      `<div style="font-family:sans-serif; max-width:480px; line-height:1.6;">
        <p>Ẹ kú àárọ̀ ${user.name || ""},</p>
        <p>You requested a password reset for Oro Lexicon.</p>
        <p style="margin:16px 0;">
          <a href="${resetUrl}" style="background:#1a4d2e; color:white; padding:12px 24px; border-radius:999px; text-decoration:none; display:inline-block; font-weight:600;">
            Reset Password →
          </a>
        </p>
        <p style="font-size:13px; color:#666;">This link expires in 1 hour and can only be used once.</p>
        <p style="font-size:12px; color:#999;">If you didn't request this, ignore this email.</p>
      </div>`
    );
  } catch (e) {
    console.error("Failed to send reset email:", e);
    // Still return ok — don't reveal if email failed (security)
    // But log it so you can see in Vercel logs
  }

  return Response.json({ ok: true });
}