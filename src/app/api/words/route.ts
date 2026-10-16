import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/../auth";

function makeSlug(text: string) {
  return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 50) || "word";
}
function normalizeYoruba(text: string) {
  return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "").trim();
}
function normalizeEnglish(text: string) {
  return text.toLowerCase().trim().replace(/\s+/g, " ");
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    const userId = (session?.user as any)?.id;
    if (!userId) return NextResponse.json({ error: "Login required" }, { status: 401 });

    const body = await req.json();
    const { yoruba, english, ipa, partOfSpeech, categoryId, exampleYo, exampleEn, translation, conceptKey } = body;

    if (!yoruba?.trim() || !english?.trim() || !categoryId) {
      return NextResponse.json({ error: "Yoruba, English, Category required" }, { status: 400 });
    }

    const normYo = normalizeYoruba(yoruba);
    const normEn = normalizeEnglish(english);
    const yorubaTrim = yoruba.trim();
    const englishTrim = english.trim();

    const candidates = await prisma.word.findMany({
      where: { normalizedWord: normYo },
      select: { id: true, yoruba: true, english: true, normalizedEnglish: true, status: true, contributorId: true, slug: true, categoryId: true },
    });

    const exactSame = candidates.filter(c => c.normalizedEnglish === normEn);

    const approved = exactSame.find(c => c.status === "APPROVED");
    if (approved) {
      return NextResponse.json({ error: `Duplicate: "${approved.yoruba}" = "${approved.english}" already approved.` }, { status: 409 });
    }

    const pendingSameUser = exactSame.find(c => c.status === "PENDING" && c.contributorId === userId);
    if (pendingSameUser) {
      return NextResponse.json({ error: `You already submitted "${pendingSameUser.yoruba}" = "${pendingSameUser.english}" and it's pending.` }, { status: 409 });
    }

    const rejected = exactSame.filter(c => c.status === "REJECTED")[0];
    if (rejected) {
      const updated = await prisma.word.update({
        where: { id: rejected.id },
        data: {
          yoruba: yorubaTrim,
          english: englishTrim,
          translation: translation?.trim() || englishTrim,
          ipa: ipa?.trim() || null,
          partOfSpeech: partOfSpeech || "NOUN",
          exampleYo: exampleYo?.trim() || null,
          exampleEn: exampleEn?.trim() || null,
          conceptKey: conceptKey?.trim() || null,
          categoryId,
          contributorId: userId,
          status: "PENDING",
          updatedAt: new Date(),
        }
      });
      // Notify admins that rejected was resubmitted
      try {
        const admins = await prisma.user.findMany({ where: { role: "ADMIN" } });
        for (const admin of admins) {
          if (admin.id === userId) continue;
          await prisma.notification.create({
            data: {
              recipientId: admin.id,
              type: "WORD_PENDING",
              title: `Resubmitted: ${yorubaTrim}`,
              message: `${yorubaTrim} = ${englishTrim} — was rejected, now fixed and needs review.`,
              relatedType: "Word",
              relatedId: updated.id,
            }
          });
        }
      } catch {}
      return NextResponse.json({ word: updated }, { status: 200 });
    }

    let slug = `${makeSlug(yorubaTrim)}-${makeSlug(englishTrim).slice(0,20)}-${Date.now().toString().slice(-4)}`;
    let counter = 1;
    while (await prisma.word.findUnique({ where: { slug } })) {
      slug = `${makeSlug(yorubaTrim)}-${makeSlug(englishTrim).slice(0,15)}-${counter++}-${Date.now().toString().slice(-3)}`;
    }

    const word = await prisma.word.create({
      data: {
        yoruba: yorubaTrim,
        normalizedWord: normYo,
        normalizedEnglish: normEn,
        english: englishTrim,
        translation: translation?.trim() || englishTrim,
        ipa: ipa?.trim() || null,
        partOfSpeech: partOfSpeech || "NOUN",
        exampleYo: exampleYo?.trim() || null,
        exampleEn: exampleEn?.trim() || null,
        conceptKey: conceptKey?.trim() || null,
        slug,
        status: "PENDING",
        categoryId,
        contributorId: userId,
      },
    });

    // FIX: Notify admins for new word — this was missing, so admin saw 0 pending
    try {
      const admins = await prisma.user.findMany({ where: { role: "ADMIN" } });
      for (const admin of admins) {
        if (admin.id === userId) continue;
        await prisma.notification.create({
          data: {
            recipientId: admin.id,
            type: "WORD_PENDING",
            title: `New word: ${yorubaTrim}`,
            message: `${yorubaTrim} = ${englishTrim} — needs review.`,
            relatedType: "Word",
            relatedId: word.id,
          }
        });
      }
    } catch (e) {
      console.log("Admin notify failed", e);
    }

    return NextResponse.json({ word }, { status: 201 });
  } catch (err: any) {
    console.error("POST /api/words error:", err);
    if (err.code === "P2002") return NextResponse.json({ error: "Duplicate race - try again" }, { status: 409 });
    return NextResponse.json({ error: err?.message || "Server error" }, { status: 500 });
  }
}

export async function GET() {
  const words = await prisma.word.findMany({
    where: { status: "APPROVED" },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { category: true },
  });
  return NextResponse.json(words);
}
