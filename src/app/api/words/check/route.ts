import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/../auth";

function normalizeYoruba(text: string) {
  return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "").trim();
}
function normalizeEnglish(text: string) {
  return text.toLowerCase().trim().replace(/\s+/g, " ");
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    const currentUserId = (session?.user as any)?.id || null;

    const { searchParams } = new URL(req.url);
    const yoruba = searchParams.get("yoruba")?.trim();
    const english = searchParams.get("english")?.trim();

    if (!yoruba || !english) return NextResponse.json({ exists: false });

    const normYo = normalizeYoruba(yoruba);
    const normEn = normalizeEnglish(english);

    const candidates = await prisma.word.findMany({
      where: { normalizedWord: normYo },
      select: { id: true, yoruba: true, english: true, normalizedEnglish: true, slug: true, status: true, contributorId: true },
    });

    const exactSame = candidates.filter(c => c.normalizedEnglish === normEn);

    if (exactSame.length === 0) {
      // oko=husband vs oko=vehicle -> different entity, allow
      return NextResponse.json({ exists: false });
    }

    // RULE: APPROVED = can't be submit from all users
    const approved = exactSame.find(c => c.status === "APPROVED");
    if (approved) {
      return NextResponse.json({ exists: true, reason: "approved", word: approved, message: `Already approved as "${approved.yoruba}" = "${approved.english}"` });
    }

    // RULE: PENDING = same user can't submit but other user CAN submit
    const pendingSameUser = exactSame.find(c => c.status === "PENDING" && c.contributorId === currentUserId);
    if (pendingSameUser) {
      return NextResponse.json({ exists: true, reason: "pending_same_user", word: pendingSameUser, message: "You already have this pending" });
    }

    const pendingOtherUser = exactSame.find(c => c.status === "PENDING" && c.contributorId !== currentUserId);
    if (pendingOtherUser) {
      // Allow other user to submit
      return NextResponse.json({ exists: false, reason: "pending_other_user", message: "Pending by other user - you can submit" });
    }

    // RULE: REJECTED = can be submit by same user and all users
    const rejected = exactSame.find(c => c.status === "REJECTED");
    if (rejected) {
      return NextResponse.json({ exists: false, reason: "rejected", word: rejected, message: "Rejected - can resubmit" });
    }

    return NextResponse.json({ exists: false });
  } catch (e: any) {
    console.error("CHECK ERROR:", e);
    return NextResponse.json({ exists: false });
  }
}
