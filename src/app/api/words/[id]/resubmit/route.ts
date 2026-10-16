// src/app/api/words/[id]/resubmit/route.ts
import { prisma } from "@/lib/prisma";
import { auth } from "@/../auth";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.email) return Response.json({ error: "Unauthorized" }, { status: 401 });
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return Response.json({ error: "User not found" }, { status: 404 });

    const word = await prisma.word.findUnique({ where: { id } });
    if (!word) return Response.json({ error: "Word not found" }, { status: 404 });
    if (word.contributorId!== user.id && user.role!== "ADMIN") {
      return Response.json({ error: "Only owner can resubmit" }, { status: 403 });
    }
    if (word.status!== "REJECTED") {
      return Response.json({ error: "Only REJECTED words can be resubmitted via this route" }, { status: 400 });
    }

    const body = await req.json();
    const normYo = body.yoruba.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "");
    const normEn = body.english.toLowerCase().trim();

    // FIX: Check if APPROVED duplicate exists (other than self)
    const dupApproved = await prisma.word.findFirst({
      where: { id: { not: id }, normalizedWord: normYo, normalizedEnglish: normEn, status: "APPROVED" }
    });
    if (dupApproved) {
      return Response.json({ error: `Cannot resubmit: "${dupApproved.yoruba}" = "${dupApproved.english}" already approved. Change English meaning.` }, { status: 409 });
    }

    // FIX: If PENDING duplicate exists (race), delete old pending or block
    const dupPending = await prisma.word.findFirst({
      where: { id: { not: id }, normalizedWord: normYo, normalizedEnglish: normEn, status: "PENDING" }
    });
    if (dupPending && dupPending.contributorId === user.id) {
      return Response.json({ error: "You already have this pending" }, { status: 409 });
    }

    const updated = await prisma.word.update({
      where: { id },
      data: {
        yoruba: body.yoruba.trim(),
        english: body.english.trim(),
        translation: body.translation?.trim() || body.english.trim(),
        ipa: body.ipa?.trim() || null,
        partOfSpeech: body.partOfSpeech || "NOUN",
        exampleYo: body.exampleYo?.trim() || null,
        exampleEn: body.exampleEn?.trim() || null,
        categoryId: body.categoryId,
        status: "PENDING",
        normalizedWord: normYo,
        normalizedEnglish: normEn,
        updatedAt: new Date(),
      },
    });

    return Response.json({ ok: true, word: updated });
  } catch (e: any) {
    if (e.code === "P2002") return Response.json({ error: "Duplicate exists — try different English meaning" }, { status: 409 });
    return Response.json({ error: e.message }, { status: 500 });
  }
}