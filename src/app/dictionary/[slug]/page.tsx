import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { WordAudioPlayer } from "./WordAudioPlayer";

// ✅ STEP 2 SEO: Google title
export async function generateMetadata({ params }: { params: { slug: string } }) {
  const word = await prisma.word.findUnique({ where: { slug: params.slug } });
  if (!word) return { title: "Word not found" };
  
  const title = `${word.yoruba} - ${word.english} in Yoruba | Meaning, Pronunciation & Examples`;
  const description = `What does ${word.yoruba} mean? ${word.yoruba} means ${word.english}. ${word.ipa ? `IPA: ${word.ipa}.` : ''} Example: ${word.exampleYo || ''} - ${word.exampleEn || ''}. Listen to native audio.`;
  
  return {
    title,
    description,
    keywords: [`${word.yoruba} meaning`, `${word.yoruba} in English`, `what does ${word.yoruba} mean`],
    openGraph: { title, description },
  };
}

export default async function WordPage({ params }: { params: { slug: string } }) {
  const word = await prisma.word.findUnique({
    where: { slug: params.slug },
    include: { 
      category: true,
      audios: { where: { status: "APPROVED" }, include: { contributor: { select: { name: true } } } }
    },
  });
  
  if (!word) notFound();

  return (
    <div className="max-w-3xl mx-auto p-6 md:p-10">
      <Link href="/dictionary" className="text- text-black/50">← Back to Dictionary</Link>
      
      <div className="mt-6 bg-white rounded- border p-8 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="serif text- font-bold text-[#1a4d2e] leading-none">{word.yoruba}</h1>
            <p className="mt-2 text- text-black/60">{word.english}</p>
            {word.ipa && <p className="mt-1 text- font-mono text-black/40">/{word.ipa}/</p>}
          </div>
          <WordAudioPlayer audios={word.audios} variant="big" />
        </div>

        <div className="mt-8 space-y-4">
          <div>
            <div className="text- font-bold tracking-widest uppercase text-black/40">Meaning</div>
            <p className="mt-1 text-">{word.english}</p>
          </div>
          
          {word.exampleYo && (
            <div>
              <div className="text- font-bold tracking-widest uppercase text-black/40">Example</div>
              <p className="mt-1 text- italic">"{word.exampleYo}"</p>
              <p className="text- text-black/60">{word.exampleEn}</p>
            </div>
          )}

          {word.audios.length > 0 && (
            <div className="pt-6">
              <div className="text- font-bold tracking-widest uppercase text-black/40 mb-3">Pronunciations</div>
              <WordAudioPlayer audios={word.audios} variant="list" />
            </div>
          )}
        </div>
      </div>

      {/* SEO Schema */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "DefinedTerm",
        name: word.yoruba,
        description: word.english,
        inDefinedTermSet: "https://lexicon.oredola.dev",
      })}} />
    </div>
  );
}