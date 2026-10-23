import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/email';
import crypto from 'crypto';

export async function POST(req: Request) {
  const { email } = await req.json();
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!user) return Response.json({ ok: true }); // don't leak if email exists

  const token = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60), // 1 hour
    }
  });

  const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;
  await sendEmail(
    user.email,
    'Reset your Oro Lexicon password',
    `<p>Hi ${user.name || ''},</p><p>Click <a href="${resetUrl}">here</a> to reset your password. Link expires in 1 hour.</p><p>If you didn't request this, ignore.</p>`
  );

  return Response.json({ ok: true });
}