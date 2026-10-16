"use client";
import { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Navbar } from "../../app/components/layout/Navbar";
import { Footer } from "../../app/components/layout/Footer";

type Word = {
  id: string;
  yoruba: string;
  english: string;
  slug: string;
  ipa: string | null;
  partOfSpeech: string;
  exampleYo: string | null;
  exampleEn: string | null;
  normalizedWord: string;
  category: { name: string; slug: string };
  audioRecordings: { id: string; secureUrl: string }[];
};

function normalizeYoruba(text: string) {
  return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "");
}

export default function DictionaryClient({
  words,
  total,
  categories,
  initialQ,
  initialCategory,
  page,
  pageSize,
}: {
  words: Word[];
  total: number;
  categories: { id: string; name: string; slug: string }[];
  initialQ: string;
  initialCategory: string;
  page: number;
  pageSize: number;
}) {
  const [q, setQ] = useState(initialQ);
  const [isTyping, setIsTyping] = useState(false);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Debounce: 350ms
  useEffect(() => {
    setIsTyping(true);
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      const trimmed = q.trim();
      if (trimmed) params.set("q", trimmed);
      else params.delete("q");
      params.set("page", "1");
      if (trimmed !== initialQ) {
        router.push(`/dictionary?${params.toString()}`);
      }
      setIsTyping(false);
    }, 350);
    return () => clearTimeout(timer);
  }, [q]);

  useEffect(() => {
    setQ(initialQ);
  }, [initialQ]);

  function updateCategory(newCat: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (newCat) params.set("category", newCat);
    else params.delete("category");
    params.set("page", "1");
    router.push(`/dictionary?${params.toString()}`);
  }

  function updatePage(newPage: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(newPage));
    router.push(`/dictionary?${params.toString()}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function playQuick(word: Word, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (word.audioRecordings.length === 0) return;
    if (audioRef.current) audioRef.current.pause();
    if (playingId === word.id) {
      setPlayingId(null);
      return;
    }
    const audio = new Audio(word.audioRecordings[0].secureUrl);
    audio.onended = () => setPlayingId(null);
    audio.onerror = () => setPlayingId(null);
    audio.play();
    audioRef.current = audio;
    setPlayingId(word.id);
  }

  const totalPages = Math.ceil(total / pageSize);

  const suggestions = useMemo(() => {
    if (!q || q.length < 2) return [];
    const normQ = normalizeYoruba(q);
    return words
      .filter((w) => w.yoruba.toLowerCase().includes(q.toLowerCase()) || w.english.toLowerCase().includes(q.toLowerCase()) || w.normalizedWord.includes(normQ))
      .slice(0, 6);
  }, [q, words]);

  return (
    <div className="min-h-screen bg-[#fafaf7] text-[#121212]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@400;500;600;700&display=swap');
        * { font-family: 'Inter', sans-serif; }
        .serif { font-family: 'Instrument Serif', serif; }
        @keyframes bounce { 0%,100% { transform: scaleY(0.6) } 50% { transform: scaleY(1.2) } }
      `}</style>

      <Navbar />

      <div className="max-w-[1240px] mx-auto px-6 py-10">
        <div className="max-w-[760px]">
          <h1 className="serif text-[40px] md:text-[56px] leading-[0.9] tracking-[-0.02em]">Dictionary</h1>
          <p className="mt-3 text-[15px] text-black/50 leading-[1.5]">Explore {total} approved Yoruba words — tone-insensitive search (ọjọ́ = ojo), instant results, audio playback.</p>
        </div>

        <div className="mt-8 flex flex-col md:flex-row gap-3 relative">
          <div className="flex-1 relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-black/30">🔍</span>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Type Yoruba or English — e.g. omi, oko, love, husband, vehicle..."
              autoFocus
              className="w-full h-12 rounded-full bg-white border border-black/10 pl-11 pr-11 text-[14px] focus:outline-none focus:border-[#1a4d2e] focus:ring-4 focus:ring-[#1a4d2e]/10 transition"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {isTyping && <span className="w-5 h-5 border-2 border-black/10 border-t-[#1a4d2e] rounded-full animate-spin" />}
              {q && (
                <button onClick={() => setQ("")} className="w-8 h-8 rounded-full bg-black/5 hover:bg-black/10 flex items-center justify-center text-[12px]">✕</button>
              )}
            </div>

            {suggestions.length > 0 && q && (
              <div className="absolute top-[52px] left-0 right-0 bg-white rounded-[18px] border border-black/10 shadow-[0_12px_32px_rgba(0,0,0,0.12)] p-2 z-20">
                {suggestions.map((s) => (
                  <Link key={s.id} href={`/dictionary/${s.slug}`} className="flex items-center justify-between px-4 py-2.5 rounded-[12px] hover:bg-[#f5f7f0] transition">
                    <div>
                      <div className="text-[14px] font-semibold text-[#1a4d2e]">{s.yoruba} <span className="text-black/40 font-normal">→ {s.english}</span></div>
                      <div className="text-[11px] text-black/40">{s.category.name} • {s.partOfSpeech} • {s.audioRecordings.length} audio</div>
                    </div>
                    <div className="text-[11px] text-black/30">↵</div>
                  </Link>
                ))}
                <div className="px-4 py-2 text-[11px] text-black/30 border-t border-black/5 mt-1">{total} matches • ọkọ=husband and ọkọ=vehicle are different entries</div>
              </div>
            )}
          </div>

          <select
            value={initialCategory}
            onChange={(e) => updateCategory(e.target.value)}
            className="h-12 rounded-full bg-white border border-black/10 px-5 text-[14px] focus:outline-none focus:border-[#1a4d2e] min-w-[180px]"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.slug}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="mt-4 flex items-center gap-2 text-[12px] text-black/40 flex-wrap">
          <span className="font-medium text-black/60">{total} results</span>
          {initialQ && <span className="bg-[#1a4d2e]/10 text-[#1a4d2e] px-2.5 py-1 rounded-full font-medium">"{initialQ}" → also searching normalized ({normalizeYoruba(initialQ)})</span>}
          {initialCategory && <span className="bg-[#f5f7f0] border border-[#1a4d2e]/10 text-[#1a4d2e] px-2.5 py-1 rounded-full">{initialCategory}</span>}
          {(initialQ || initialCategory) && <button onClick={() => router.push("/dictionary")} className="ml-2 underline hover:text-black">Clear</button>}
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {words.map((w) => (
            <Link key={w.id} href={`/dictionary/${w.slug}`} className="group bg-white rounded-[20px] border border-black/[0.06] p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)] hover:border-[#1a4d2e]/15 hover:-translate-y-0.5 transition-all">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="serif text-[24px] font-bold text-[#1a4d2e] group-hover:text-[#143d24] line-clamp-1">{w.yoruba}</div>
                  <div className="text-[12px] text-black/40 font-mono mt-0.5">{w.ipa || w.normalizedWord}</div>
                </div>
                <button
                  onClick={(e) => playQuick(w, e)}
                  disabled={w.audioRecordings.length === 0}
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-[12px] transition ml-3 shrink-0 ${w.audioRecordings.length === 0 ? "bg-black/5 text-black/20 cursor-not-allowed" : playingId === w.id ? "bg-[#1a4d2e] text-white animate-pulse" : "bg-[#f5d547]/30 group-hover:bg-[#f5d547] hover:scale-110"}`}
                  title={w.audioRecordings.length ? "Quick play" : "No audio"}
                >
                  {playingId === w.id ? "■" : "▶"}
                </button>
              </div>
              <div className="mt-3 text-[14px] font-medium line-clamp-1">{w.english}</div>
              <div className="text-[12px] text-black/50 mt-1 line-clamp-2">{w.exampleYo ? `“${w.exampleYo}” — ${w.exampleEn}` : "No example"}</div>
              <div className="mt-4 flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-bold tracking-widest uppercase bg-[#f5f7f0] border border-[#1a4d2e]/10 text-[#1a4d2e] px-2.5 py-1 rounded-full">{w.category.name}</span>
                <span className="text-[10px] text-black/40">{w.partOfSpeech}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${w.audioRecordings.length ? "bg-green-50 border border-green-200 text-green-700" : "bg-amber-50 border border-amber-200 text-amber-700"}`}>
                  {w.audioRecordings.length ? `🎙 ${w.audioRecordings.length}` : "No audio"}
                </span>
              </div>
            </Link>
          ))}
        </div>

        {words.length === 0 && (
          <div className="mt-12 bg-white border border-dashed border-black/10 rounded-[24px] p-12 text-center">
            <div className="serif text-[26px]">No words found for "{initialQ}"</div>
            <p className="text-[14px] text-black/50 mt-2">We searched Yoruba, English, normalized form ({initialQ && normalizeYoruba(initialQ)}), and category.</p>
            <Link href="/contribute" className="mt-4 inline-flex h-10 px-5 rounded-full bg-[#1a4d2e] text-white text-[13px] font-medium items-center">Contribute this word</Link>
          </div>
        )}

        {total > pageSize && (
          <div className="mt-10 flex items-center justify-center gap-2">
            <button disabled={page <= 1} onClick={() => updatePage(page - 1)} className="h-10 px-4 rounded-full bg-white border border-black/10 text-[13px] font-medium disabled:opacity-40 hover:border-[#1a4d2e]">← Prev</button>
            <span className="text-[13px] text-black/50 px-3">Page {page} of {Math.ceil(total / pageSize)} • {total} words</span>
            <button disabled={page >= Math.ceil(total / pageSize)} onClick={() => updatePage(page + 1)} className="h-10 px-4 rounded-full bg-white border border-black/10 text-[13px] font-medium disabled:opacity-40 hover:border-[#1a4d2e]">Next →</button>
          </div>
        )}
      </div>

      <Footer totalWords={total} />
    </div>
  );
}
