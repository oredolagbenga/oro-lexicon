export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { auth } from "@/../auth";
import { redirect } from "next/navigation";
import { Navbar } from "@/app/components/layout/Navbar";
import { Footer } from "@/app/components/layout/Footer";
import { DashboardClient } from "../dashboard/DashboardClient";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/dashboard");

  // NEW: If admin, send to admin dashboard
  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });
  
  if (currentUser?.role === "ADMIN") {
    redirect("/admin");
  }

  const [words, categories, totalArchive, stats] = await Promise.all([
    prisma.word.findMany({
      where: { contributorId: session.user.id },
      include: { category: true, audioRecordings: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.category.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
    prisma.word.count({ where: { status: "APPROVED" } }),
    prisma.word.groupBy({ by: ["status"], where: { contributorId: session.user.id }, _count: true }),
  ]);

  const counts = {
    total: words.length,
    approved: stats.find(s => s.status === "APPROVED")?._count ?? 0,
    pending: stats.find(s => s.status === "PENDING")?._count ?? 0,
    rejected: stats.find(s => s.status === "REJECTED")?._count ?? 0,
    withAudio: words.filter(w => w.audioRecordings.some(a => a.status === "APPROVED")).length,
    noAudio: words.filter(w => w.audioRecordings.every(a => a.status !== "APPROVED")).length,
  };

  return (
    <div className="min-h-screen bg-[#f8f9f7]">
      <Navbar />
      <DashboardClient 
        initialWords={JSON.parse(JSON.stringify(words))} 
        categories={categories} 
        counts={counts}
        totalArchive={totalArchive}
        user={{ name: session.user.name || "GBENGA", email: session.user.email }}
      />
      <Footer totalWords={totalArchive} />
    </div>
  );
}