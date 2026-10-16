import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/../auth";
import { prisma } from "@/lib/prisma";
import cloudinary from "@/lib/cloudinary";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const me = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!me || me.role !== "ADMIN") return NextResponse.json({ error: "Admin only" }, { status: 403 });

    const body = await req.json();
    // FIX: Accept both {audioId, action} and {id, status} from AdminClient.tsx
    const audioId = body.audioId || body.id;
    const rawAction = body.action || body.status || "";
    const action = String(rawAction).toUpperCase();

    if (!audioId || !["APPROVED","REJECTED"].includes(action)) {
      console.log("AUDIO ADMIN BAD REQUEST BODY:", body);
      return NextResponse.json({ error: `audioId and action required, got ${JSON.stringify(body)}` }, { status: 400 });
    }

    const audio = await prisma.audioRecording.findUnique({
      where: { id: audioId },
      include: { word: true }
    });
    if (!audio) return NextResponse.json({ error: "Audio not found" }, { status: 404 });

    if (action === "REJECTED") {
      if (audio.cloudinaryPublicId) {
        try { await cloudinary.uploader.destroy(audio.cloudinaryPublicId, { resource_type: "video" }); } catch {}
      }
      await prisma.audioRecording.delete({ where: { id: audioId } });
      try {
        if (audio.contributorId !== me.id) {
          await prisma.notification.create({
            data: {
              recipientId: audio.contributorId,
              type: "AUDIO_REJECTED",
              title: `Audio rejected: ${audio.word.yoruba}`,
              message: `Your audio for "${audio.word.yoruba}" was rejected.`,
              relatedType: "AudioRecording",
              relatedId: audioId,
            }
          });
        }
      } catch {}
      return NextResponse.json({ ok: true, action: "REJECTED" });
    }

    const updated = await prisma.audioRecording.update({
      where: { id: audioId },
      data: { status: "APPROVED", approvedAt: new Date(), approvedBy: me.id },
    });

    try {
      if (audio.contributorId !== me.id) {
        await prisma.notification.create({
          data: {
            recipientId: audio.contributorId,
            type: "AUDIO_APPROVED",
            title: `Audio live: ${audio.word.yoruba} 🎙`,
            message: `Your pronunciation for "${audio.word.yoruba}" = "${audio.word.english}" is now live!`,
            relatedType: "AudioRecording",
            relatedId: audioId,
          }
        });
      }
      await prisma.notification.updateMany({
        where: { type: "AUDIO_PENDING", relatedId: audioId, read: false },
        data: { read: true, readAt: new Date() }
      });
    } catch (e) {
      console.log("notify fail but audio approved", e);
    }

    return NextResponse.json({ ok: true, action: "APPROVED", audio: updated });
  } catch (e: any) {
    console.error("ADMIN AUDIO ERROR:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const me = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!me || me.role !== "ADMIN") return NextResponse.json({ error: "Admin only" }, { status: 403 });

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "PENDING";

    const audios = await prisma.audioRecording.findMany({
      where: { status: status as any },
      include: { word: true, contributor: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    const pendingCount = await prisma.audioRecording.count({ where: { status: "PENDING" as any } });

    return NextResponse.json({ audios, pendingCount });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
