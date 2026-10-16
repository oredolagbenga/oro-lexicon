import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/../auth";
import { prisma } from "@/lib/prisma";
import cloudinary from "@/lib/cloudinary";

const MAX_SIZE = 10 * 1024 * 1024;

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const wordId = formData.get("wordId") as string | null;
    const slug = formData.get("slug") as string | null;

    if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });
    if (!wordId) return NextResponse.json({ error: "wordId required" }, { status: 400 });
    if (file.size > MAX_SIZE) return NextResponse.json({ error: "Max 10MB" }, { status: 400 });
    if (!file.type.startsWith("audio/")) return NextResponse.json({ error: "Only audio allowed" }, { status: 400 });

    const word = await prisma.word.findUnique({ where: { id: wordId } });
    if (!word) return NextResponse.json({ error: "Word not found" }, { status: 404 });

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const publicId = slug ? `gns-lexicon/audio/${slug}-${Date.now()}` : `gns-lexicon/audio/${wordId}-${Date.now()}`;

    const upload = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: "video",
          folder: "gns-lexicon/audio",
          public_id: publicId.split("/").pop(),
          overwrite: true,
        },
        (err, result) => (err ? reject(err) : resolve(result))
      ).end(buffer);
    });

    const audio = await prisma.audioRecording.create({
      data: {
        wordId,
        contributorId: user.id,
        cloudinaryPublicId: upload.public_id,
        secureUrl: upload.secure_url,
        fileType: file.type,
        fileSize: file.size,
        duration: upload.duration || null,
        status: "PENDING",
      },
    });

    // FIX: Notify all admins that new audio needs review + count as pending
    try {
      const admins = await prisma.user.findMany({ where: { role: "ADMIN" } });
      for (const admin of admins) {
        if (admin.id === user.id) continue; // don't notify self
        await prisma.notification.create({
          data: {
            recipientId: admin.id,
            type: "AUDIO_PENDING",
            title: `New audio: ${word.yoruba}`,
            message: `${user.name || user.email} recorded audio for "${word.yoruba}" = "${word.english}". Review in admin audio panel.`,
            relatedType: "AudioRecording",
            relatedId: audio.id,
          }
        });
      }
    } catch (e) {
      console.log("Admin audio notify failed", e);
    }

    return NextResponse.json({ success: true, url: upload.secure_url, publicId: upload.public_id, audio });
  } catch (e: any) {
    console.error("Audio upload error:", e);
    return NextResponse.json({ error: e.message || "Upload failed" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const audioId = searchParams.get("audioId");
    const wordId = searchParams.get("wordId");

    if (!audioId && !wordId) return NextResponse.json({ error: "audioId or wordId required" }, { status: 400 });

    let audio;
    if (audioId) {
      audio = await prisma.audioRecording.findUnique({ where: { id: audioId } });
    } else if (wordId) {
      audio = await prisma.audioRecording.findFirst({ where: { wordId, status: "PENDING" }, orderBy: { createdAt: "desc" } });
    }

    if (!audio) return NextResponse.json({ error: "Audio not found" }, { status: 404 });

    if (audio.cloudinaryPublicId) {
      try {
        await cloudinary.uploader.destroy(audio.cloudinaryPublicId, { resource_type: "video" });
      } catch (err) {
        console.warn("Cloudinary delete failed:", err);
      }
    }

    await prisma.audioRecording.delete({ where: { id: audio.id } });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
