import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { WordAudioPlayer } from "./WordAudioPlayer";

export async function generateMetadata({ params }: { params: { slug: string } }) {
  try {
    const word = await prisma.word.findUnique({ where: { slug: params.slug } });
    if (!word) return { title: "Not found" };
    return {
      title: `${word.yoruba} - ${word.english} in Yoruba | Oredola Lexicon`,
      description: `${word.yoruba} means ${word.english} in English. Example: ${word.exampleYo || ''}`,
    };
  } catch {
    return { title: "Oredola Lexicon" };
  }
}

export default async function WordPage({ params }: { params: { slug: string } }) {
  let word: any = null;
  try {
    word = await prisma.word.findUnique({
      where: { slug: params.slug },
      include: {
        category: true,
        audios: { where: { status: "APPROVED" } },
      },
    });
  } catch (e) {
    console.error("DB ERROR:", e);
  }

  if (!word) notFound();

  return (
    <div className="max-w-3xl mx-auto p-6 md:p-10">
      <Link href="/dictionary" className="text- text-black/50">← Back to Dictionary</Link>
      
      <div className="mt-6 bg-white rounded- border border-black/10 p-8 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="serif text- font-bold text-[#1a4d2e] leading-none">{word.yoruba}</h1>
            <p className="mt-2 text- text-black/60">{word.english}</p>
            {word.ipa && <p className="mt-1 text- font-mono text-black/40">/{word.ipa}/</p>}
          </div>
          {word.audios?.length > 0 && <WordAudioPlayer audios={word.audios} variant="big" />}
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
          {word.audios?.length > 0 && (
            <div className="pt-6">
              <WordAudioPlayer audios={word.audios} variant="list" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}