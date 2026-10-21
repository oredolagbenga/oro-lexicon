export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Navbar } from "@/app/components/layout/Navbar";
import { Footer } from "@/app/components/layout/Footer";
import { WordAudioPlayer } from "./WordAudioPlayer";

// ✅ FIXED: params is Promise in Next.js 15
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const word = await prisma.word.findUnique({ where: { slug } });
  if (!word) return { title: "Word not found | Oredola Lexicon" };

  return {
    title: `${word.yoruba} - ${word.english} in Yoruba | Meaning, Pronunciation & Examples`,
    description: `What does ${word.yoruba} mean? ${word.yoruba} means ${word.english}. ${word.ipa ? `IPA: ${word.ipa}.` : ''} Example: ${word.exampleYo || ''} - ${word.exampleEn || ''}. Listen to native audio.`,
    keywords: [`${word.yoruba} meaning`, `${word.yoruba} in English`, `what does ${word.yoruba} mean`],
    openGraph: {
      title: `${word.yoruba} = ${word.english}`,
      description: `${word.yoruba} means ${word.english}`,
      url: `https://lexicon.oredola.dev/dictionary/${word.slug}`,
    },
  };
}

export default async function WordDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!slug) notFound();

  const word = await prisma.word.findUnique({
    where: { slug },
    include: {
      category: true,
      contributor: { select: { name: true } },
      audioRecordings: { 
        where: { status: "APPROVED" }, 
        include: { contributor: { select: { name: true } } },
        orderBy: { createdAt: "desc" }
      },
    },
  });

  if (!word) notFound();

  const [_, related, totalWords] = await Promise.all([
    prisma.word.update({ where: { id: word.id }, data: { views: { increment: 1 } } }),
    prisma.word.findMany({
      where: { categoryId: word.categoryId, id: { not: word.id }, status: "APPROVED" },
      take: 3,
      include: { category: true },
    }),
    prisma.word.count({ where: { status: "APPROVED" } }),
  ]);

  return (
    <div className="min-h-screen bg-[#fafaf7] text-[#121212]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@400;500;600;700&display=swap');
        * { font-family: 'Inter', sans-serif; }
        .serif { font-family: 'Instrument Serif', serif; }
      `}</style>
      <Navbar />
      <div className="max-w- mx-auto px-6 py-10">
        <Link href="/dictionary" className="inline-flex items-center gap-2 text- font-medium text-black/50 hover:text-black">← Back to Dictionary</Link>
        <div className="mt-8 bg-white rounded- border border-black/[0.06] shadow-[0_8px_32px_rgba(0,0,0,0.06)] overflow-hidden">
          <div className="h- bg-gradient-to-r from-[#1a4d2e] via-[#2a7a4b] to-[#f5d547]" />
          <div className="p-8 md:p-10">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h1 className="serif text- md:text- leading-none font-bold text-[#1a4d2e]">{word.yoruba}</h1>
                  <WordAudioPlayer audios={word.audioRecordings} variant="big" />
                </div>
                <div className="mt-3 flex items-center gap-3 text- flex-wrap">
                  <span className="font-mono bg-black/[0.04] px-2.5 py-1 rounded-full">{word.ipa || `/${word.normalizedWord}/`}</span>
                  <span className="uppercase tracking-widest font-bold text- text-black/50">{word.partOfSpeech}</span>
                </div>
              </div>
              <span className="text- font-bold tracking-widest uppercase bg-[#f5f7f0] border border-[#1a4d2e]/10 text-[#1a4d2e] px-3 py-1.5 rounded-full">{word.category.name}</span>
            </div>
            <div className="mt-8">
              <div className="text- tracking-widest uppercase font-bold text-black/30">English</div>
              <div className="mt-2 text- font-semibold">{word.english}</div>
            </div>
            {(word.exampleYo || word.exampleEn) && (
              <div className="mt-8 grid md:grid-cols-2 gap-4">
                <div className="bg-[#fafaf7] rounded- border p-5"><div className="text- uppercase font-bold text-black/30">Yoruba Example</div><div className="mt-2 text- serif italic">{word.exampleYo}</div></div>
                <div className="bg-[#fafaf7] rounded- border p-5"><div className="text- uppercase font-bold text-black/30">English</div><div className="mt-2 text-">{word.exampleEn}</div></div>
              </div>
            )}
            <div className="mt-8">
              <div className="text- uppercase font-bold text-black/30">Pronunciation</div>
              <div className="mt-3">
                {word.audioRecordings.length > 0 ? <WordAudioPlayer audios={word.audioRecordings} variant="list" /> : <Link href={`/contribute/audio?wordId=${word.id}`} className="inline-flex h-10 px-5 rounded-full bg-[#1a4d2e] text-white text- font-bold items-center">🎙 Add pronunciation</Link>}
              </div>
            </div>
          </div>
        </div>
        {related.length > 0 && (
          <div className="mt-12">
            <h2 className="serif text- font-bold">Related in {word.category.name}</h2>
            <div className="mt-4 grid md:grid-cols-3 gap-4">
              {related.map((w) => (
                <Link key={w.id} href={`/dictionary/${w.slug}`} className="bg-white rounded- border p-5 hover:shadow-lg transition">
                  <div className="serif text- font-bold text-[#1a4d2e]">{w.yoruba}</div>
                  <div className="text- text-black/50">{w.english}</div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
      <Footer totalWords={totalWords} />
    </div>
  );
}