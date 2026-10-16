export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { auth } from "@/../auth";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) return Response.json({ error: "Unauthorized" }, { status: 401 });
    const me = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!me || me.role !== "ADMIN") return Response.json({ error: "Admin only" }, { status: 403 });

    const { wordId, status, comment } = await req.json();
    if (!wordId || !["APPROVED","PENDING","REJECTED"].includes(status)) {
      return Response.json({ error: "wordId and status required" }, { status: 400 });
    }

    if (status === "APPROVED") {
      const toApprove = await prisma.word.findUnique({ where: { id: wordId } });
      if (!toApprove) return Response.json({ error: "Word not found" }, { status: 404 });

      const duplicateApproved = await prisma.word.findFirst({
        where: {
          id: { not: wordId },
          status: "APPROVED" as any,
          normalizedWord: (toApprove as any).normalizedWord,
          normalizedEnglish: (toApprove as any).normalizedEnglish,
        }
      });

      if (duplicateApproved) {
        return Response.json({ error: `Cannot approve: "${toApprove.yoruba}" = "${toApprove.english}" already approved.` }, { status: 409 });
      }

      await prisma.word.updateMany({
        where: {
          id: { not: wordId },
          normalizedWord: (toApprove as any).normalizedWord,
          normalizedEnglish: (toApprove as any).normalizedEnglish,
          status: "PENDING" as any,
        },
        data: { status: "REJECTED" as any, updatedAt: new Date() }
      });
    }

    const updated = await prisma.word.update({
      where: { id: wordId },
      data: { status: status as any, updatedAt: new Date() },
      include: { contributor: true }
    });

    // NOTIFICATION: Feedback from admin decision
     try {
      if (updated.contributorId && updated.contributorId !== me.id) {
        const isApproved = status === "APPROVED";
        const notif = await prisma.notification.create({
          data: {
            recipientId: updated.contributorId,
            type: isApproved ? "WORD_APPROVED" : status === "REJECTED" ? "WORD_REJECTED" : "WORD_PENDING",
            title: isApproved ? `Approved: ${updated.yoruba}` : status === "REJECTED" ? `Needs fix: ${updated.yoruba}` : `Pending: ${updated.yoruba}`,
            message: isApproved 
              ? `Your word "${updated.yoruba}" = "${updated.english}" is now live in dictionary! 🎉` 
              : status === "REJECTED"
              ? `Your word "${updated.yoruba}" = "${updated.english}" was rejected${comment ? `: ${comment}` : ". Click Fix & Resubmit — oko=husband and oko=vehicle are different entities."}`
              : `Your word "${updated.yoruba}" is pending review.`,
            relatedType: "Word",
            relatedId: updated.id,
          }
        });
        console.log("NOTIFICATION CREATED:", notif.id, "for", updated.contributorId);
      } else {
        console.log("No notification - contributor is admin or missing", updated.contributorId, me.id);
      }
    } catch (notifError: any) {
      console.error("NOTIFICATION CREATE FAILED:", notifError.message);
      // Don't fail the whole request if notification fails
    }

    return Response.json({ ok: true, word: updated });
  } catch (e: any) {
    console.error("ADMIN WORDS ERROR:", e);
    return Response.json({ error: e.message }, { status: 500 });
  }
}
