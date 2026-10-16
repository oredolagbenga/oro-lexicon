import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/../auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    let userId = (session?.user as any)?.id;
    if (!userId && session?.user?.email) {
      const user = await prisma.user.findUnique({ where: { email: session.user.email } });
      userId = user?.id;
    }
    if (!userId) return NextResponse.json({ notifications: [], unreadCount: 0 });

    const notifications = await prisma.notification.findMany({
      where: { recipientId: userId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    // FIXED: your schema uses `read` not `isRead`
    const unreadCount = await prisma.notification.count({
      where: { recipientId: userId, read: false },
    });

    return NextResponse.json({ notifications, unreadCount });
  } catch (e: any) {
    console.error("NOTIFICATIONS GET ERROR:", e.message);
    return NextResponse.json({ error: e.message, notifications: [], unreadCount: 0 }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    let userId = (session?.user as any)?.id;
    if (!userId && session?.user?.email) {
      const user = await prisma.user.findUnique({ where: { email: session.user.email } });
      userId = user?.id;
    }
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { id, markAll } = body;

    if (markAll) {
      await prisma.notification.updateMany({
        where: { recipientId: userId, read: false },
        data: { read: true, readAt: new Date() },
      });
      return NextResponse.json({ ok: true });
    }

    if (id) {
      await prisma.notification.update({
        where: { id },
        data: { read: true, readAt: new Date() },
      });
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "id or markAll required" }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
