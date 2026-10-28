export const dynamic = "force-dynamic";

import Link from "next/link";
import { prisma } from "../lib/prisma";
import { Navbar } from "../app/components/layout/Navbar";
import { Footer } from "../app/components/layout/Footer";
import { Inter, Instrument_Serif } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });
const instrument = Instrument_Serif({ 
  subsets: ["latin"], 
  weight: ["400"], 
  style: ["normal","italic"] 
});

export default async function HomePage() {
  const [totalWords, approvedWords, totalCategories, totalUsers, recentWords] = await Promise.all([
    prisma.word.count(),
    prisma.word.count({ where: { status: "APPROVED" } }),
    prisma.category.count(),
    prisma.user.count(),
    prisma.word.findMany({
      where: { status: "APPROVED" },
      orderBy: { createdAt: "desc" },
      take: 6,
      include: { category: true },
    }),
  ]);

  const wordOfDay = recentWords[Math.floor(Math.random() * Math.max(1, recentWords.length))] || recentWords[0];

  return (
    <div className={inter.className + " min-h-screen bg-[#fafaf7] text-[#121212]"}>
      <Navbar />
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context":"https://schema.org","@type":"Dictionary","name":"Oro Lexicon","url":"https://lexicon.oredola.dev","inLanguage":"yo","isAccessibleForFree":true})}} />

      <section className="relative overflow-hidden bg-[#1a4d2e]">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-[#2a7a4b]/40 via-transparent to-black/20" />
          <div className="absolute -top-32 -left-32 w- h- bg-[#f5d547]/10 rounded-full blur-" />
          <div className="absolute -bottom-40 -right-20 w- h- bg-white/[0.04] rounded-full blur-" />
        </div>
        <div className="relative max-w- mx-auto px-6 pt-16 pb-32 md:pt-24 md:pb-40 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/[0.08] border border-white/15 backdrop-blur px-4 py-2 text- font-bold tracking-widest uppercase text-white/90">
            <span className="w-1.5 h-1.5 bg-[#f5d547] rounded-full animate-pulse" /> TRUSTED BY {totalUsers}+ CONTRIBUTORS • PRESERVING YORUBA FOR GENERATIONS
          </div>
          <h1 className={instrument.className + " text- md:text- leading-[0.9] tracking-[-0.04em] text-white mt-8"}>
            Oro Lexicon:<br />
            <span className="italic font-light text-[#f5d547]">Yoruba Dictionary</span>
          </h1>
          <p className="mt-6 text- md:text- leading-[1.6] text-white/70 max-w- mx-auto">
            Explore meanings, translations, examples and community-contributed Yoruba words.<br className="hidden md:block" /> Built by Oredola Gbenga to preserve Yoruba language and culture.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/dictionary" className="w-full sm:w-auto h- px-8 rounded-full bg-[#f5d547] hover:bg-[#f2c840] text-[#121212] text- font-bold flex items-center justify-center gap-2 shadow-[0_8px_20px_rgba(245,213,71,0.3)] transition">🔍 Browse Dictionary</Link>
            <Link href="/register" className="w-full sm:w-auto h- px-8 rounded-full bg-white hover:bg-white/90 text-[#121212] text- font-bold flex items-center justify-center transition">Contribute Words</Link>
            <Link href="/about" className="w-full sm:w-auto h- px-8 rounded-full bg-transparent border-2 border-white/30 hover:border-white text-white text- font-bold flex items-center justify-center hover:bg-white/10 transition">About</Link>
          </div>
          <div className="mt-14 flex items-center justify-center gap-10 md:gap-16 text-white">
            <div className="text-center"><div className="text- md:text- font-extrabold leading-none">{totalWords}+</div><div className="text- tracking-widest uppercase font-bold opacity-60 mt-2">Words Preserved</div></div>
            <div className="w-px h-8 bg-white/15 hidden md:block" />
            <div className="text-center"><div className="text- md:text- font-extrabold leading-none">100%</div><div className="text- tracking-widest uppercase font-bold opacity-60 mt-2">Free & Open</div></div>
            <div className="w-px h-8 bg-white/15 hidden md:block" />
            <div className="text-center"><div className="text- md:text- font-extrabold leading-none">Audio</div><div className="text- tracking-widest uppercase font-bold opacity-60 mt-2">Pronunciations</div></div>
          </div>
        </div>
      </section>

      <div className="max-w- mx-auto px-6 -mt-16 relative z-10">
        <div className="bg-white rounded- border border-black/[0.06] shadow-[0_20px_60px_rgba(0,0,0,0.12)] p-8 md:p-10 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h- bg-gradient-to-r from-[#1a4d2e] via-[#2a7a4b] to-[#f5d547]" />
          <div className="text- tracking-widest uppercase font-bold text-[#1a4d2e]">💡 WORD OF THE DAY • Ọ̀rọ̀ Ọjọ́</div>
          <div className={instrument.className + " text- md:text- leading-none mt-5 text-[#121212]"}>{wordOfDay?.yoruba || "ewa"}</div>
          <div className="text- text-black/50 mt-2">{wordOfDay?.english || "beans"} • <span className="italic">{wordOfDay?.ipa || "èwà"}</span></div>
          {wordOfDay?.exampleYo && <div className="mt-4 text- text-black/60 bg-black/[0.02] rounded-full px-4 py-2 inline-block">“{wordOfDay.exampleYo}” — {wordOfDay.exampleEn}</div>}
          <div className="mt-6"><Link href={`/dictionary/${wordOfDay?.slug || ""}`} className="inline-flex items-center gap-1.5 h-9 px-5 rounded-full border border-[#1a4d2e] text-[#1a4d2e] text- font-semibold hover:bg-[#1a4d2e] hover:text-white transition">Explore →</Link></div>
        </div>
      </div>

      <section className="max-w- mx-auto px-6 pt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { n: totalWords, label: "Dictionary Entries", icon: "📄" },
          { n: approvedWords, label: "Approved Words", icon: "✅" },
          { n: totalUsers, label: "Contributors", icon: "👥" },
          { n: totalCategories, label: "Categories", icon: "🏷" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded- border border-black/[0.06] p-6 md:p-7 text-center shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
            <div className="w-12 h-12 mx-auto rounded- bg-[#f5f7f0] border border-black/[0.04] flex items-center justify-center text-">{s.icon}</div>
            <div className="text- font-extrabold leading-none mt-4 text-[#1a4d2e]">{s.n}</div>
            <div className="text- font-medium text-black/60 mt-1.5">{s.label}</div>
          </div>
        ))}
      </section>

      <section className="max-w- mx-auto px-6 pt-20 pb-16">
        <div className="text-center max-w- mx-auto">
          <h2 className={instrument.className + " text- md:text- leading-[0.9] tracking-tight"}>Recently Added Words</h2>
          <p className="mt-3 text- text-black/50 leading-[1.6]">Explore the latest approved Yoruba dictionary entries from our community.</p>
        </div>
        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-5">
          {recentWords.map((w) => (
            <Link key={w.id} href={`/dictionary/${w.slug}`} className="group bg-white rounded- border border-black/[0.06] p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)] transition-all">
              <div className="flex items-start justify-between">
                <div><div className={instrument.className + " text- font-bold text-[#1a4d2e]"}>{w.yoruba}</div><div className="text- text-black/40 mt-0.5 font-mono">{w.ipa || w.normalizedWord}</div></div>
                <div className="w-8 h-8 rounded-full bg-[#f5d547]/20 flex items-center justify-center text-">▶</div>
              </div>
              <div className="text- text-black/70 mt-4 line-clamp-2 leading-[1.5]">{w.english} — {w.exampleEn || w.translation || "No example yet"}</div>
              <div className="mt-4 flex items-center gap-2"><span className="inline-flex items-center gap-1 text- font-semibold px-2.5 py-1 rounded-full bg-[#f5f7f0] text-[#1a4d2e] border border-[#1a4d2e]/10">{w.category.name}</span></div>
              <div className="mt-5 h-10 rounded-full border border-[#1a4d2e] text-[#1a4d2e] text- font-semibold flex items-center justify-center group-hover:bg-[#1a4d2e] group-hover:text-white transition">View Details</div>
            </Link>
          ))}
        </div>
        <div className="mt-12 text-center"><Link href="/dictionary" className="inline-flex items-center gap-2 h-12 px-8 rounded-full border-2 border-[#1a4d2e] text-[#1a4d2e] text- font-bold hover:bg-[#1a4d2e] hover:text-white transition">View All Words →</Link></div>
      </section>

      <section className="bg-white border-y border-black/[0.06] py-20">
        <div className="max-w- mx-auto px-6">
          <div className="text-center max-w- mx-auto">
            <h2 className={instrument.className + " text- md:text- leading-[0.9]"}>Why Use Oro Lexicon?</h2>
            <p className="mt-3 text- text-black/50">More than a dictionary — a living archive of Yoruba culture by Oredola Gbenga.</p>
          </div>
          <div className="mt-12 grid md:grid-cols-3 gap-6">
            {[
              { t: "Powerful Search", d: "Search Yoruba words, meanings, tone marks and audio with smart filters.", icon: "🔍" },
              { t: "Community Contributions", d: "Contributors submit words for review. Quality checked by experts before approval.", icon: "👥" },
              { t: "Preserve Culture", d: "Help preserve Yoruba language and cultural heritage digitally for future generations.", icon: "💛" },
            ].map((f) => (
              <div key={f.t} className="bg-[#fafaf7] rounded- border border-black/[0.05] p-8 text-center"><div className="w-12 h-12 mx-auto rounded- bg-white border border-black/[0.06] flex items-center justify-center text-">{f.icon}</div><div className="font-bold text- mt-5">{f.t}</div><div className="text- text-black/50 mt-2 max-w- mx-auto">{f.d}</div></div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#1a4d2e] py-20">
        <div className="absolute top-0 right-0 w- h- bg-[#f5d547]/10 rounded-full blur-" />
        <div className="relative max-w- mx-auto px-6 text-center">
          <h2 className={instrument.className + " text- md:text- leading-[0.9] text-white"}>Join the Oro Lexicon Community</h2>
          <p className="mt-4 text- leading-[1.6] text-white/70">Contribute words, improve translations and help preserve Yoruba knowledge for generations.</p>
          <Link href="/register" className="mt-8 inline-flex items-center gap-2 h- px-8 rounded-full bg-[#f5d547] hover:bg-[#f2c840] text-[#121212] text- font-bold shadow-[0_8px_20px_rgba(245,213,71,0.3)] transition">🚀 Get Started Free</Link>
          <div className="mt-4 text- text-white/40">Free • Open Source • Built at oredola.dev</div>
        </div>
      </section>

      <Footer totalWords={totalWords} />
    </div>
  );
}