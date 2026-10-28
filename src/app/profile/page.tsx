import { auth } from "@/../auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/app/components/layout/Navbar";
import { Footer } from "@/app/components/layout/Footer";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata = { robots: { index: false, follow: false } };
export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/profile");

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  const stats = await prisma.word.groupBy({ by: ["status"], where: { contributorId: session.user.id }, _count: true });
  const total = stats.reduce((a,b)=>a+b._count,0);

  return (
    <div className="min-h-screen bg-[#fafaf7] text-[#121212]">
      <Navbar />
      <div className="max-w-[800px] mx-auto px-6 py-10">
        <div className="bg-white rounded-[24px] border border-zinc-200 p-8 shadow-sm">
          <div className="flex gap-5 items-start">
            <div className="w-20 h-20 rounded-full bg-[#1a4d2e] text-white flex items-center justify-center text-[28px] font-bold">{user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase()}</div>
            <div>
              <h1 className="text-[28px] font-bold tracking-tight">{user?.name || "Contributor"}</h1>
              <p className="text-[14px] text-zinc-600 mt-1">{user?.email}</p>
              <div className="mt-3 flex gap-2">
                <span className="text-[11px] font-bold uppercase tracking-widest bg-[#1a4d2e] text-white px-3 py-1 rounded-full">{user?.role}</span>
                <span className="text-[11px] font-bold uppercase tracking-widest bg-zinc-100 border border-zinc-200 px-3 py-1 rounded-full">{total} words</span>
              </div>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-3 gap-3">
            {stats.map(s => (
              <div key={s.status} className="bg-zinc-50 rounded-[16px] p-4 border border-zinc-100 text-center">
                <div className="text-[24px] font-bold">{s._count}</div>
                <div className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-500 mt-1">{s.status}</div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex gap-3">
            <Link href="/dashboard" className="h-11 px-6 rounded-full bg-[#121212] text-white text-[13px] font-bold flex items-center justify-center">Go to Dashboard →</Link>
            <Link href="/contribute" className="h-11 px-6 rounded-full bg-white border border-zinc-200 text-[13px] font-bold flex items-center justify-center">+ Contribute</Link>
          </div>
        </div>
      </div>
      <Footer totalWords={await prisma.word.count({ where: { status: "APPROVED" } })} />
    </div>
  );
}
