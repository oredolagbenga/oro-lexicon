import { prisma } from "@/lib/prisma";
import { auth } from "@/../auth";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.email) return new Response("Unauthorized", { status: 401 });
  const me = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (me?.role !== "ADMIN") return new Response("Forbidden", { status: 403 });

  const { userId, action } = await req.json();
  if (!userId || !action) return new Response("Bad request", { status: 400 });

  if (action === "SUSPEND") {
    await prisma.user.update({ where: { id: userId }, data: { status: "SUSPENDED" as any } });
  } else if (action === "UNSUSPEND") {
    await prisma.user.update({ where: { id: userId }, data: { status: "ACTIVE" as any } });
  } else if (action === "ADMIN") {
    await prisma.user.update({ where: { id: userId }, data: { role: "ADMIN" as any } });
  } else if (action === "CONTRIBUTOR") {
    await prisma.user.update({ where: { id: userId }, data: { role: "CONTRIBUTOR" as any } });
  } else {
    return new Response("Invalid action", { status: 400 });
  }

  return Response.json({ ok: true });
}
