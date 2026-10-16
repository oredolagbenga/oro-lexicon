export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { auth } from "@/../auth";
import { redirect } from "next/navigation";
import AdminClient from "./AdminClient";

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user?.email) redirect("/login?callbackUrl=/admin");

  const currentUser = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!currentUser) redirect("/login");

  if (currentUser.role !== "ADMIN") {
    const adminCount = await prisma.user.count({ where: { role: "ADMIN" } });
    if (adminCount === 0) {
      await prisma.user.update({ where: { id: currentUser.id }, data: { role: "ADMIN" as any } });
    } else {
      redirect("/dashboard?error=admin-only");
    }
  }

  const [allWords, allUsers, allCategories] = await Promise.all([
    prisma.word.findMany({
      include: {
        category: true,
        contributor: { select: { id: true, name: true, email: true } },
        audioRecordings: { orderBy: { createdAt: "desc" } },
      },
      orderBy: { createdAt: "desc" },
      take: 500,
    }),
    prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, status: true, createdAt: true } as any,
      orderBy: { createdAt: "desc" },
    }),
    prisma.category.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
  ]);

  return (
    <AdminClient
      initialWords={JSON.parse(JSON.stringify(allWords))}
      users={JSON.parse(JSON.stringify(allUsers))}
      categories={JSON.parse(JSON.stringify(allCategories))}
      currentUser={JSON.parse(JSON.stringify(currentUser))}
    />
  );
}
