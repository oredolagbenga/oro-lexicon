import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail(to: string, subject: string, html: string) {
  if (!process.env.RESEND_API_KEY) {
    console.error("RESEND_API_KEY missing - email not sent to", to);
    // Don't throw in prod - let forgot-password still return ok
    return null;
  }

  try {
    const { data, error } = await resend.emails.send({
      from: 'Oro Lexicon <hello@oredola.dev>',
      to,
      subject,
      html,
    });
    
    if (error) {
      console.error("Resend error:", error);
      throw error;
    }
    
    console.log("Email sent:", data?.id, "to", to);
    return data;
  } catch (err) {
    console.error("sendEmail failed:", err);
    // In forgot-password flow, we don't want to throw - just log
    // The caller can decide to throw if it's critical
    throw err;
  }
}