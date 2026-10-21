export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Navbar } from "@/app/components/layout/Navbar";
import { Footer } from "@/app/components/layout/Footer";
import { WordAudioPlayer } from "./WordAudioPlayer";

// ✅ FIXED - params is Promise now
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const word = await prisma.word.findUnique({ where: { slug } });
  if (!word) return { title: "Word not found | Oredola Lexicon" };

  return {
    title: `${word.yoruba} - ${word.english} in Yoruba | Meaning, Pronunciation & Examples`,
    description: `What does ${word.yoruba} mean? ${word.yoruba} means ${word.english}. ${word.ipa ? `IPA: ${word.ipa}.` : ''} Example: ${word.exampleYo || ''} - ${word.exampleEn || ''}. Listen to native audio.`,
  };
}

// rest of your file stays 100% same...
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

      <div className="max-w-[1000px] mx-auto px-6 py-10">
        <Link href="/dictionary" className="inline-flex items-center gap-2 text-[13px] font-medium text-black/50 hover:text-black">
          ← Back to Dictionary
        </Link>

        <div className="mt-8 bg-white rounded-[24px] border border-black/[0.06] shadow-[0_8px_32px_rgba(0,0,0,0.06)] overflow-hidden">
          <div className="h-[5px] bg-gradient-to-r from-[#1a4d2e] via-[#2a7a4b] to-[#f5d547]" />
          <div className="p-8 md:p-10">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h1 className="serif text-[44px] md:text-[56px] leading-none font-bold text-[#1a4d2e]">{word.yoruba}</h1>
                  <WordAudioPlayer audios={word.audioRecordings} variant="big" />
                </div>
                <div className="mt-3 flex items-center gap-3 text-[13px] flex-wrap">
                  <span className="font-mono bg-black/[0.04] px-2.5 py-1 rounded-full">{word.ipa || `/${word.normalizedWord}/`}</span>
                  <span className="text-black/30">•</span>
                  <span className="uppercase tracking-widest font-bold text-[11px] text-black/50">{word.partOfSpeech}</span>
                  <span className="text-black/30">•</span>
                  <span className="text-black/40">{word.views + 1} views</span>
                  {word.audioRecordings.length > 0 && (
                    <>
                      <span className="text-black/30">•</span>
                      <span className="text-[11px] bg-green-50 border border-green-200 text-green-700 px-2 py-0.5 rounded-full font-bold">🎙 {word.audioRecordings.length} audio</span>
                    </>
                  )}
                </div>
              </div>
              <span className="text-[11px] font-bold tracking-widest uppercase bg-[#f5f7f0] border border-[#1a4d2e]/10 text-[#1a4d2e] px-3 py-1.5 rounded-full">{word.category.name}</span>
            </div>

            <div className="mt-8">
              <div className="text-[11px] tracking-widest uppercase font-bold text-black/30">English</div>
              <div className="mt-2 text-[22px] font-semibold leading-[1.3]">{word.english}</div>
              {word.translation && <div className="mt-2 text-[15px] text-black/60">{word.translation}</div>}
            </div>

            {(word.exampleYo || word.exampleEn) && (
              <div className="mt-8 grid md:grid-cols-2 gap-4">
                <div className="bg-[#fafaf7] rounded-[16px] border border-black/[0.04] p-5">
                  <div className="text-[10px] tracking-widest uppercase font-bold text-black/30">Yoruba Example</div>
                  <div className="mt-2 text-[15px] leading-[1.5] serif italic">{word.exampleYo || "—"}</div>
                </div>
                <div className="bg-[#fafaf7] rounded-[16px] border border-black/[0.04] p-5">
                  <div className="text-[10px] tracking-widest uppercase font-bold text-black/30">English Translation</div>
                  <div className="mt-2 text-[15px] leading-[1.5]">{word.exampleEn || "—"}</div>
                </div>
              </div>
            )}

            <div className="mt-8">
              <div className="text-[11px] tracking-widest uppercase font-bold text-black/30">Pronunciation • Audio</div>
              <div className="mt-3 space-y-3">
                {word.audioRecordings.length > 0 ? (
                  <WordAudioPlayer audios={word.audioRecordings} variant="list" />
                ) : (
                  <div className="bg-amber-50 border border-amber-200 rounded-[14px] p-4">
                    <div className="text-[13px] text-amber-900">
                      No approved audio yet for <b>{word.yoruba}</b>. Be the first to record!
                    </div>
                    {/* FIXED: backticks */}
                    <Link href={`/contribute/audio?wordId=${word.id}`} className="mt-3 inline-flex h-10 px-5 rounded-full bg-[#1a4d2e] text-white text-[13px] font-bold items-center justify-center hover:bg-black transition">
                      🎙 Add pronunciation
                    </Link>
                    <div className="mt-2 text-[11px] text-amber-700">Word is APPROVED and locked — you only add audio, not edit meaning.</div>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-10 pt-6 border-t border-black/[0.06] flex items-center justify-between text-[12px] text-black/40">
              <div>Added by {word.contributor.name || "Community"} • {new Date(word.createdAt).toLocaleDateString()}</div>
              <Link href={`/dictionary?category=${word.category.slug}`} className="underline hover:text-black">More in {word.category.name}</Link>
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <div className="mt-12">
            <h2 className="serif text-[24px] font-bold">Related words in {word.category.name}</h2>
            <div className="mt-4 grid md:grid-cols-3 gap-4">
              {related.map((w) => (
                <Link key={w.id} href={`/dictionary/${w.slug}`} className="bg-white rounded-[18px] border border-black/[0.06] p-5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] transition">
                  <div className="serif text-[20px] font-bold text-[#1a4d2e]">{w.yoruba}</div>
                  <div className="text-[13px] text-black/50 mt-1">{w.english}</div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

           {/* SEO: Dictionary Schema - makes Google show as dictionary */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "DefinedTermSet",
            name: "Oro Lexicon - Yoruba Dictionary",
            hasDefinedTerm: {
              "@type": "DefinedTerm",
              name: word.yoruba,
              description: word.english,
              termCode: word.slug,
              inDefinedTermSet: "https://lexicon.oredola.dev",
              url: `https://lexicon.oredola.dev/dictionary/${word.slug}`,
            },
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Dictionary", item: "https://lexicon.oredola.dev/dictionary" },
              { "@type": "ListItem", position: 2, name: word.yoruba, item: `https://lexicon.oredola.dev/dictionary/${word.slug}` },
            ],
          }),
        }}
      />

      <Footer totalWords={totalWords} />
    </div>
  );
}
