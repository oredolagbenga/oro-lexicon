import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/../auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET /api/words/[id] - Load own word for resubmit (fixes "can't load existing words")
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const word = await prisma.word.findFirst({
      where: { 
        id,
        // Allow user to load own word if REJECTED or PENDING, admin can load any
        ...(user.role === "ADMIN" ? {} : { contributorId: user.id })
      },
      include: { category: true }
    });

    if (!word) return NextResponse.json({ error: "Word not found or not yours" }, { status: 404 });

    return NextResponse.json({ word });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
