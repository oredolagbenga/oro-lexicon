export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { auth } from "@/../auth";
import { redirect } from "next/navigation";
import ContributeForm from "./ContributeForm";
import { Navbar } from "@/app/components/layout/Navbar";
import { Footer } from "@/app/components/layout/Footer";

export const metadata = { robots: { index: false, follow: false } };
export default async function ContributePage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login?callbackUrl=/contribute");
  }

  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
  const totalWords = await prisma.word.count();

  return (
    <div className="min-h-screen bg-[#fafaf7] text-[#121212]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@400;500;600&display=swap');
        * { font-family: 'Inter', sans-serif; }
        .serif { font-family: 'Instrument Serif', serif; }
      `}</style>
      <Navbar />
      <div className="max-w-[800px] mx-auto px-6 py-12">
        <div className="text-center mb-10">
          <h1 className="serif text-[40px] md:text-[52px] leading-[0.9]">Contribute a Word</h1>
          <p className="mt-3 text-[15px] text-black/50">Add a Yoruba word with translation and example. It will be reviewed by our team — real data goes to PENDING.</p>
        </div>
        <ContributeForm categories={categories} />
      </div>
      <Footer totalWords={totalWords} />
    </div>
  );
}
