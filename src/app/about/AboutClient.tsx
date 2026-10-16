"use client";
import { useState } from "react";
import Link from "next/link";
import { Navbar } from "../components/layout/Navbar";
import { Footer } from "../components/layout/Footer";

export default function App(
    {

  total,
  
}: {
  
  total: number;
 
}
) {
  const [activeTone, setActiveTone] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const tones = [
    { word: "omí", meaning: "water", tone: "high-high", mark: "´ ´" },
    { word: "ọmọ", meaning: "child", tone: "mid-mid", mark: "– –" },
    { word: "omì", meaning: "to know (?) — context is everything", tone: "mid-low", mark: "– `" },
  ];

  // FIXED: Static heights to avoid hydration mismatch (was Math.sin)
  const audioBars = [10, 14, 8, 16, 12, 6, 14, 10, 18, 12, 8, 16, 10, 12, 18, 14, 6, 12, 10, 8, 16, 12, 10, 14];
  const smallBars = [8, 12, 16, 20, 8, 12, 16, 20, 8, 12, 16, 20];

  const showFeedback = (msg: string) => {
    setFeedback(msg);
    setTimeout(()=> setFeedback(null), 3200);
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--ink)] selection:bg-[var(--yellow)] selection:text-black overflow-x-clip">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@400;500;600&display=swap');
        :root {
          --bg: #f7f5ee;
          --ink: #121212;
          --green: #1a4d2e;
          --yellow: #f5d547;
          --line: rgba(18,18,18,0.08);
          --line-strong: rgba(18,18,18,0.12);
        }
        * { font-family: "Inter", system-ui, sans-serif; }
        .serif { font-family: "Instrument Serif", Georgia, serif; }
      `}</style>

      <Navbar/>

      <main className="max-w-[1320px] mx-auto px-6 md:px-10">
        {feedback && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] max-w-[90vw] pointer-events-none">
            <div className="px-4 py-2.5 rounded-full bg-[#121212] text-white text-[13px] font-medium shadow-[0_8px_24px_rgba(0,0,0,0.2)] border border-white/10 whitespace-nowrap">
              {feedback}
            </div>
          </div>
        )}

        {/* Hero */}
        <section className="pt-[56px] md:pt-[88px] pb-[48px] md:pb-[72px]">
          <div className="flex flex-col lg:flex-row gap-10 lg:gap-[72px]">
            <div className="flex-1 min-w-0">
              <div className="inline-flex items-center gap-2 mb-8">
                <span className="text-[11px] tracking-[0.14em] font-semibold text-zinc-500">EST. 2024 — YORÙBÁ PRESERVATION</span>
                <span className="w-px h-3 bg-[var(--line-strong)]" />
                <span className="text-[11px] tracking-[0.14em] font-semibold">EGBA • IJEBU • STANDARD</span>
              </div>
              <h1 className="serif text-[46px] md:text-[78px] lg:text-[84px] leading-[0.92] tracking-[-0.04em] text-[#121212]">
                Yorùbá is not just<br />
                a language. It is<br />
                <span className="italic font-normal text-[#1a4d2e]">memory.</span>
              </h1>
              <p className="mt-8 max-w-[520px] text-[17px] md:text-[18px] leading-[1.6] text-zinc-600 tracking-[-0.01em]">
                We are building the first living archive that respects tonal accuracy, dialectal difference, and the people who speak it. From Ẹ̀gbá to Ìjẹ̀bú to Standard Yorùbá — preserved as it is lived.
              </p>

              {/* ====== ADD YOUR DETAILS HERE - SUBTLE FOUNDER CREDIT ====== */}
              <div className="mt-4 text-[13px] text-zinc-500">
                Built by <b className="text-[#121212]">Oredola Gbenga Augustine</b> • <a href="https://oredola.dev" target="_blank" className="font-bold text-[#121212] hover:underline">oredola.dev</a> • <a href="https://github.com/oredolagbenga" target="_blank" className="hover:text-[#121212]">github.com/oredolagbenga</a>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="#preserve" className="h-[44px] px-6 rounded-full bg-[#121212] text-white text-[14px] font-medium inline-flex items-center gap-2 hover:bg-black transition-colors">
                  Explore the archive
                  <span className="text-[16px] leading-none">→</span>
                </Link>
                <a href="#manifesto" onClick={(e)=>{e.preventDefault(); document.getElementById('manifesto')?.scrollIntoView({behavior:'smooth'})}} className="h-[44px] px-6 rounded-full bg-white border border-[var(--line-strong)] text-[14px] font-medium inline-flex items-center hover:border-zinc-300 transition-colors">
                  Read manifesto
                </a>
              </div>

              <div className="mt-12 md:mt-16 rounded-[24px] bg-white border border-[var(--line)] shadow-[0_8px_32px_rgba(0,0,0,0.06)] p-6 md:p-7">
                <div className="flex items-center justify-between mb-5">
                  <span className="text-[11px] tracking-[0.12em] font-semibold text-zinc-500">TONAL PRECISION — WHY IT MATTERS</span>
                  <span className="text-[11px] tracking-[0.08em] px-2.5 py-1 rounded-full bg-[#f7f5ee] border border-[var(--line)]">INTERACTIVE</span>
                </div>
                <div className="grid md:grid-cols-[1.2fr_0.8fr] gap-6 items-center">
                  <div className="flex gap-2">
                    {tones.map((t, i) => (
                      <button
                        key={i}
                        onClick={() => { setActiveTone(i); showFeedback(`${t.word} — ${t.meaning}`); }}
                        className={`flex-1 rounded-[16px] border p-4 text-left transition-all ${activeTone === i ? "bg-[#121212] text-white border-[#121212] shadow-[0_8px_24px_rgba(0,0,0,0.12)]" : "bg-[#f7f5ee] border-[var(--line)] hover:border-zinc-300"}`}
                      >
                        <div className={`serif text-[28px] leading-none tracking-[-0.02em] ${activeTone === i ? "text-white" : "text-[#121212]"}`}>{t.word}</div>
                        <div className={`mt-2 text-[12px] ${activeTone === i ? "text-zinc-400" : "text-zinc-500"}`}>{t.mark} · {t.tone}</div>
                      </button>
                    ))}
                  </div>
                  <div className="min-h-[84px]">
                    <div className="text-[13px] text-zinc-500">MEANING</div>
                    <div className="serif text-[22px] leading-[1.2] mt-1 tracking-[-0.01em]">{tones[activeTone].meaning}</div>
                    <div className="mt-3 text-[13px] leading-[1.5] text-zinc-600">One dot changes everything. Without tone marks, you lose the sentence. Without the sentence, you lose the culture.</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full lg:w-[340px] shrink-0 flex flex-col gap-4 lg:pt-[96px]">
              <div className="rounded-[24px] bg-[#121212] text-[#f7f5ee] p-7 shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
                <div className="flex items-start justify-between">
                  <div className="text-[11px] tracking-[0.14em] opacity-60">ARCHIVE SIZE</div>
                  <div className="w-6 h-6 rounded-full bg-white/10 grid place-items-center text-[12px]">↗</div>
                </div>
                <div className="serif text-[56px] leading-[0.9] tracking-[-0.03em] mt-6">1,000+</div>
                <div className="text-[14px] opacity-70 mt-3 leading-[1.4]">Curated words with dialect variants, tone marks, and usage examples.</div>
                <div className="mt-6 h-px bg-white/10" />
                <div className="mt-4 flex items-center gap-2 text-[12px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--yellow)]" /> Growing daily — community verified
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-[24px] bg-white border border-[var(--line)] p-6 shadow-[0_8px_32px_rgba(0,0,0,0.06)]">
                  <div className="text-[11px] tracking-[0.12em] text-zinc-500 font-semibold">DIALECTS</div>
                  <div className="serif text-[38px] leading-none mt-4 tracking-[-0.02em]">3</div>
                  <div className="text-[12px] text-zinc-600 mt-2 leading-[1.4]">Ẹ̀gbá · Ìjẹ̀bú · Standard</div>
                  <div className="mt-4 flex gap-1.5">
                    <span className="h-1.5 w-8 rounded-full bg-[#1a4d2e]" />
                    <span className="h-1.5 w-4 rounded-full bg-[#1a4d2e]/40" />
                    <span className="h-1.5 w-3 rounded-full bg-zinc-200" />
                  </div>
                </div>
                <div className="rounded-[24px] bg-[var(--yellow)] border border-black/10 p-6 shadow-[0_8px_32px_rgba(0,0,0,0.06)]">
                  <div className="text-[11px] tracking-[0.12em] font-semibold text-black/60">AUDIO</div>
                  <div className="flex items-baseline gap-1 mt-4">
                    <span className="serif text-[32px] leading-none tracking-[-0.02em]">44.1</span>
                    <span className="text-[14px] font-medium">kHz</span>
                  </div>
                  <div className="text-[12px] text-black/60 mt-2 leading-[1.4]">Native speakers, lossless capture</div>
                  <div className="mt-4 flex gap-[3px] items-end">
                    {smallBars.map((h,i)=><span key={i} className="w-[3px] rounded-full bg-black/80" style={{height: `${h}px`}} />)}
                  </div>
                </div>
              </div>

              <div className="rounded-[24px] bg-white border border-[var(--line)] p-5 flex items-center gap-4 shadow-[0_8px_32px_rgba(0,0,0,0.04)]">
                <div className="w-10 h-10 rounded-full bg-[#f7f5ee] border border-[var(--line)] grid place-items-center serif text-[18px]">è</div>
                <div className="text-[13px] leading-[1.4]">
                  <div className="font-medium text-[#121212]">Precision over speed.</div>
                  <div className="text-zinc-500">Every entry is reviewed twice.</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Manifesto */}
        <section id="manifesto" className="border-t border-[var(--line)] py-[56px] md:py-[88px] grid md:grid-cols-[200px_1fr] gap-8 md:gap-16">
          <div className="md:sticky md:top-[88px] self-start">
            <div className="text-[11px] tracking-[0.16em] font-semibold text-zinc-500 flex items-center gap-3">
              <span className="w-6 h-px bg-zinc-300" />
              OUR MANIFESTO
            </div>
            <div className="mt-4 serif text-[13px] text-zinc-500 leading-[1.6] max-w-[160px]">[01] — We refuse to flatten a tonal language into plain text. Tone is not decoration.</div>
          </div>
          <div>
            <h2 className="serif text-[32px] md:text-[44px] leading-[1.05] tracking-[-0.03em] max-w-[780px]">
              Most archives treat Yorùbá as if it were English with different words. It is not. Without tone marks, <span className="italic text-[#1a4d2e]">omi</span> can be water, or it can be nothing.
            </h2>
            <div className="mt-8 md:mt-10 grid md:grid-cols-2 gap-8 md:gap-12 max-w-[860px]">
              <p className="text-[16px] leading-[1.7] text-zinc-700">Yorùbá is a tonal language where pitch carries meaning. <em className="serif text-[18px] not-italic font-medium text-[#121212]">omí</em> with a high tone, <em className="serif text-[18px] not-italic font-medium text-[#121212]">ọmọ</em> with mid tone — drop the mark and you lose the thought.</p>
              <p className="text-[16px] leading-[1.7] text-zinc-700">The loss is not theoretical. When children cannot hear their grandparents' dialect — Ẹ̀gbá's clipped cadence, Ìjẹ̀bú's musicality — they lose proverbs, jokes, prayers. Oro Lexicon exists to archive memory.</p>
            </div>
          </div>
        </section>

        {/* What we preserve */}
        <section className="py-[24px] md:py-[32px]">
          <div className="flex items-baseline justify-between gap-6 mb-8">
            <h3 className="serif text-[28px] md:text-[36px] tracking-[-0.02em]">What we preserve</h3>
            <span className="text-[11px] tracking-[0.12em] text-zinc-500 font-semibold">[02] — FOUR PILLARS</span>
          </div>
          <div className="grid md:grid-cols-12 gap-4 md:gap-5">
            <div className="md:col-span-7 rounded-[24px] bg-white border border-[var(--line)] p-7 md:p-8 shadow-[0_8px_32px_rgba(0,0,0,0.06)]">
              <div className="w-[44px] h-[44px] rounded-[14px] bg-[#121212] text-white grid place-items-center">◐</div>
              <h4 className="serif text-[24px] mt-6">Tonal Accuracy</h4>
              <p className="text-[14px] leading-[1.6] text-zinc-600 mt-3 max-w-[420px]">Every entry carries proper tone marks — dótì, àmì. We don't ship plain ASCII Yorùbá.</p>
            </div>
            <div className="md:col-span-5 rounded-[24px] bg-[#1a4d2e] text-[#f7f5ee] p-7 md:p-8 relative overflow-hidden">
              <div className="absolute -right-8 -top-8 w-[160px] h-[160px] rounded-full bg-white/10" />
              <div className="relative">
                <div className="w-[44px] h-[44px] rounded-[14px] bg-white/10 border border-white/15 grid place-items-center">◑</div>
                <h4 className="serif text-[24px] mt-6">Dialect Respect</h4>
                <p className="text-[14px] leading-[1.6] text-white/70 mt-3">Ẹ̀gbá, Ìjẹ̀bú, Standard. Not footnotes — first-class citizens.</p>
              </div>
            </div>
            <div className="md:col-span-5 rounded-[24px] bg-white border border-[var(--line)] p-7 md:p-8 shadow-[0_8px_32px_rgba(0,0,0,0.06)]">
              <div className="w-[44px] h-[44px] rounded-[14px] bg-[var(--yellow)] grid place-items-center text-black">◎</div>
              <h4 className="serif text-[24px] mt-6">Native Audio</h4>
              <p className="text-[14px] leading-[1.6] text-zinc-600 mt-3">44.1kHz recordings from native speakers. Not synthetic.</p>
              {/* FIXED: was Math.sin, now fixed heights */}
              <div className="mt-6 h-[36px] rounded-full bg-[#f7f5ee] border border-[var(--line)] px-4 flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-[#121212] text-white grid place-items-center text-[10px]">▶</span>
                <div className="flex gap-[2px] flex-1 items-center">
                  {audioBars.map((h,i)=><span key={i} className="flex-1 rounded-full bg-zinc-900/80" style={{height: `${h}px`}} />)}
                </div>
                <span className="text-[11px] text-zinc-500">0:03</span>
              </div>
            </div>
            <div className="md:col-span-7 rounded-[24px] bg-[#f7f5ee] border border-[var(--line)] p-7 md:p-8">
              <h4 className="serif text-[24px]">Community Verified</h4>
              <p className="text-[14px] leading-[1.6] text-zinc-600 mt-3 max-w-[440px]">No single authority. Elders, linguists, and young speakers review each entry.</p>
            </div>
          </div>
        </section>

        {/* CTA - YOUR DETAILS HERE */}
        <section className="py-[56px] md:py-[80px]">
          <div className="rounded-[32px] bg-[#1a4d2e] text-[#f7f5ee] p-8 md:p-12 lg:p-14 relative overflow-hidden">
            <div className="absolute -right-20 -bottom-20 w-[420px] h-[420px] rounded-full bg-white/10" />
            <div className="relative grid lg:grid-cols-[1.1fr_0.9fr] gap-10 items-end">
              <div>
                <div className="inline-flex items-center gap-2 h-7 px-3 rounded-full bg-white/10 border border-white/15 text-[11px] tracking-[0.12em] font-semibold">BUILT AT oredola.dev • LEXICON.OREDOLA.DEV</div>
                <h3 className="serif text-[36px] md:text-[52px] leading-[0.9] tracking-[-0.03em] mt-6">Help us preserve<br /><span className="italic text-[var(--yellow)]">what remembers us.</span></h3>
                <p className="text-[15px] leading-[1.6] text-white/70 mt-6 max-w-[480px]">Whether you speak Yorùbá daily or are learning your first phrase, your knowledge matters.</p>
                <div className="mt-2 text-[12px] text-white/50">Founded by Oredola Gbenga Augustine — Lagos, NG — github.com/oredolagbenga</div>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link href="/dictionary" className="h-11 px-6 rounded-full bg-[#f7f5ee] text-[#121212] text-[14px] font-medium inline-flex items-center gap-2 hover:bg-white">Browse Dictionary →</Link>
                  <Link href="/contribute" className="h-11 px-6 rounded-full bg-white/10 border border-white/20 text-white text-[14px] font-medium inline-flex items-center gap-2 hover:bg-white/15">Contribute a word</Link>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-[20px] bg-white/10 border border-white/15 p-5"><div className="text-[11px] tracking-[0.12em] opacity-60">LICENSE</div><div className="serif text-[20px] mt-3">CC BY-SA 4.0</div><div className="text-[12px] opacity-70 mt-2">Open forever.</div></div>
                <div className="rounded-[20px] bg-[var(--yellow)] text-black p-5"><div className="text-[11px] tracking-[0.12em] font-semibold opacity-70">FOUNDER</div><div className="text-[13px] font-bold mt-3 leading-[1.2]">Oredola Gbenga Augustine</div><div className="text-[11px] opacity-70 mt-1"><a href="https://www.oredola.dev" target="blank">oredola.dev •</a> <a href="https://www.linkedin.com/in/oredolagbenga/" target="_blank" className="underline">LinkedIn</a></div></div>
              </div>
            </div>
          </div>
        </section>
      </main>

       <Footer totalWords={total} />
    </div>
  );
}
