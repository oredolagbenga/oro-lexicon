export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { auth } from "@/../auth";
import { redirect, notFound } from "next/navigation";
import { Navbar } from "@/app/components/layout/Navbar";
import { Footer } from "@/app/components/layout/Footer";
import AddAudioClient from "./AddAudioClient";

export default async function AddAudioPage({ searchParams }: { searchParams: Promise<{ wordId?: string }> }) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login?callbackUrl=/contribute/audio");
  }

  const { wordId } = await searchParams;
  if (!wordId) {
    return (
      <div className="min-h-screen bg-[#fafaf7]">
        <Navbar />
        <div className="max-w-[720px] mx-auto px-6 py-20 text-center">
          <h1 className="text-[20px] font-bold">No word selected</h1>
          <p className="mt-2 text-[13px] text-black/50">Go to dictionary and click "Add pronunciation" on an approved word like eja.</p>
        </div>
      </div>
    );
  }

  const word = await prisma.word.findUnique({
    where: { id: wordId },
    include: {
      category: true,
      audioRecordings: { where: { status: "APPROVED" } },
    },
  });

  if (!word) notFound();
  if (word.status !== "APPROVED") {
    return (
      <div className="min-h-screen bg-[#fafaf7]">
        <Navbar />
        <div className="max-w-[720px] mx-auto px-6 py-20 text-center">
          <h1 className="serif text-[28px] font-bold">Word not approved yet</h1>
          <p className="mt-2 text-[14px] text-black/60">"{word.yoruba}" is {word.status}. Audio can only be added after word is APPROVED. This prevents audio alone being approved.</p>
        </div>
      </div>
    );
  }

  const totalWords = await prisma.word.count({ where: { status: "APPROVED" } });

  return (
    <div className="min-h-screen bg-[#fafaf7] text-[#121212]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@400;500;600;700&display=swap');
        * { font-family: 'Inter', sans-serif; }
        .serif { font-family: 'Instrument Serif', serif; }
      `}</style>
      <Navbar />
      <div className="max-w-[800px] mx-auto px-6 py-10">
        <AddAudioClient word={JSON.parse(JSON.stringify(word))} />
      </div>
      <Footer totalWords={totalWords} />
    </div>
  );
}
