"use client";
import { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";

type Word = {
  id: string; yoruba: string; normalizedWord: string; slug: string; english: string;
  ipa?: string | null; partOfSpeech: string; exampleYo?: string | null; exampleEn?: string | null;
  status: string; views: number; createdAt: string;
  category: { name: string };
  audioRecordings: { id: string; secureUrl: string; status: string }[];
};

export function DashboardClient({ initialWords, categories, counts, totalArchive, user }: {
  initialWords: Word[]; categories: { id: string; name: string }[];
  counts: any; totalArchive: number; user: { name: string; email?: string | null };
}) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [view, setView] = useState<"grid"|"table">("grid");
  const [page, setPage] = useState(1);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const PAGE_SIZE = 9;

  const firstName = useMemo(() => {
    const n = user.name || user.email?.split("@")[0] || "Guest";
    return n.split(" ")[0];
  }, [user.name, user.email]);
  const firstNameUpper = firstName.toUpperCase();

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    let res = initialWords.filter(w => {
      const matchQ = !q || w.yoruba.toLowerCase().includes(q) || w.normalizedWord.toLowerCase().includes(q) || w.english.toLowerCase().includes(q);
      const matchStatus =
        filter === "all" ||
        (filter === "approved" && w.status === "APPROVED") ||
        (filter === "pending" && w.status === "PENDING") ||
        (filter === "rejected" && w.status === "REJECTED") ||
        (filter === "audio" && w.audioRecordings.length > 0) ||
        (filter === "noaudio" && w.audioRecordings.length === 0);
      return matchQ && matchStatus;
    });
    res.sort((a,b)=> new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return res;
  }, [initialWords, search, filter]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  useEffect(() => { setPage(1); }, [search, filter]);

  const playAudio = (word: Word) => {
    if (!word.audioRecordings.length) return;
    const audioUrl = word.audioRecordings[0].secureUrl;
    if (playingId === word.id) {
      audioRef.current?.pause();
      setPlayingId(null);
      return;
    }
    if (audioRef.current) audioRef.current.pause();
    const el = new Audio(audioUrl);
    el.onended = () => setPlayingId(null);
    el.onerror = () => setPlayingId(null);
    el.play();
    audioRef.current = el;
    setPlayingId(word.id);
  };

  const totalViews = initialWords.reduce((a,b)=>a+b.views,0);
  const topWord = [...initialWords].sort((a,b)=>b.views-a.views)[0];

  const streakData = useMemo(() => {
    const days = 28;
    const map: Record<string, number> = {};
    initialWords.forEach(w => {
      const d = new Date(w.createdAt).toISOString().split("T")[0];
      map[d] = (map[d] || 0) + 1;
    });
    const today = new Date();
    return Array.from({length: days}).map((_,i) => {
      const d = new Date(today);
      d.setDate(today.getDate() - (days - 1 - i));
      const key = d.toISOString().split("T")[0];
      const count = map[key] || 0;
      let intensity = 0;
      if (count > 0) intensity = 1;
      if (count >= 2) intensity = 2;
      if (count >= 3) intensity = 3;
      return { date: key, count, intensity };
    });
  }, [initialWords]);

  const waveform = [6,10,14,8,12,6,16,10,8,14,6,10];
  const rejectedCount = counts.rejected ?? initialWords.filter(w=>w.status==="REJECTED").length;

  return (
    <div className="max-w-[1320px] mx-auto px-6 py-8">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@400;500;600;700;800&display=swap'); .serif{font-family:'Instrument Serif',serif}`}</style>

      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-7 px-3 rounded-full bg-[#121212] text-white text-[11px] font-bold tracking-[0.12em] uppercase flex items-center justify-center gap-2">● LIVE ARCHIVE • {totalArchive}</span>
          </div>
          <h1 className="serif text-[52px] leading-[0.9] tracking-[-0.03em] mt-5 text-[#121212] font-bold">
            Bawo ni, {firstNameUpper} <span className="inline-block">👋</span>
          </h1>
          <p className="text-[14px] text-zinc-600 mt-3 font-medium max-w-[60ch]">
            You’ve preserved <span className="text-[#121212] font-bold">{counts.total} Yorùbá words</span> with <span className="text-[#121212] font-bold">{totalViews} community views</span> — keeping <span className="bg-[#f5d547] px-2 py-0.5 rounded-md font-bold text-[#121212]">Egba</span>, <span className="bg-zinc-100 border border-zinc-200 px-2 py-0.5 rounded-md font-bold text-[#121212]">Ijebu</span> & Standard Yorùbá alive.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Link href="/dictionary" className="h-11 px-6 rounded-full bg-white border border-zinc-200 text-[13px] font-semibold text-[#121212] hover:bg-zinc-50 transition flex items-center justify-center">Browse Dictionary →</Link>
          <Link href="/contribute" className="h-11 px-6 rounded-full bg-[#1a4d2e] text-white text-[13px] font-bold shadow-[0_12px_24px_rgba(26,77,46,0.25)] hover:bg-[#143d24] transition flex items-center justify-center">+ New Word</Link>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-12 gap-4">
        <div className="col-span-12 md:col-span-6 lg:col-span-4 bg-white rounded-[24px] border border-zinc-200 p-6 shadow-[0_8px_32px_rgba(0,0,0,0.06)]">
          <div className="flex justify-between items-center">
            <span className="text-[11px] font-extrabold tracking-[0.15em] uppercase text-zinc-500">APPROVED • LIVE</span>
            <span className="w-7 h-7 rounded-full bg-green-50 border border-green-100 text-green-700 flex items-center justify-center text-[12px]">↗</span>
          </div>
          <div className="flex items-baseline gap-3 mt-5">
            <span className="serif text-[64px] leading-none font-bold text-[#121212]">{counts.approved}</span>
            <span className="text-[13px] font-semibold text-zinc-500">/{counts.total} • {counts.total ? Math.round((counts.approved/counts.total)*100) : 0}% rate</span>
          </div>
          <div className="mt-5 flex gap-1.5">
            {Array.from({length:10}).map((_,i)=><div key={i} className={`h-2 flex-1 rounded-full ${i < Math.round((counts.approved/counts.total)*10 || 0) ? 'bg-[#1a4d2e]' : 'bg-zinc-100'}`} />)}
          </div>
          <div className="mt-5 text-[13px] font-medium text-zinc-600">Top word: <span className="font-bold text-[#121212]">{topWord?.yoruba || "—"}</span> → {topWord?.english || "—"} • {topWord?.views || 0} views</div>
        </div>

        <div className="col-span-12 md:col-span-6 lg:col-span-3 flex flex-col gap-4">
          <div className="bg-[#f5d547] rounded-[24px] p-6 border border-black/10 flex-1">
            <div className="text-[11px] font-extrabold tracking-[0.15em] uppercase text-black/50">PENDING REVIEW</div>
            <div className="serif text-[56px] leading-none mt-4 font-bold text-[#121212]">{counts.pending}</div>
            <div className="text-[13px] font-medium text-black/70 mt-3 leading-snug">Awaiting admin. Avg 24h. Edit allowed until approved.</div>
          </div>
          <div className="bg-[#121212] rounded-[24px] p-6 text-white flex-1">
            <div className="text-[11px] font-extrabold tracking-[0.15em] uppercase text-white/40">IMPACT</div>
            <div className="serif text-[56px] leading-none mt-4 font-bold">{totalViews}</div>
            <div className="text-[13px] font-medium text-white/60 mt-2">{counts.withAudio} audios • {totalArchive} archive words</div>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-5 bg-white rounded-[24px] border border-zinc-200 p-6 shadow-[0_8px_32px_rgba(0,0,0,0.06)]">
          <div className="flex justify-between items-start gap-4">
            <div>
              <div className="font-bold text-[15px] text-[#121212]">Level: {counts.total < 5 ? "Atọkùn (Seed)" : counts.total < 20 ? "Akẹ́kọ̀ọ́ (Learner)" : "Olùkọ́ (Teacher)"}</div>
              <div className="text-[13px] font-medium text-zinc-600 mt-1">{20 - (counts.total % 20)} words to next level</div>
            </div>
            <span className="h-7 px-3 rounded-full bg-[#1a4d2e] text-white text-[11px] font-bold flex items-center justify-center">{counts.total} words</span>
          </div>
          <div className="mt-6">
            <div className="flex justify-between text-[10px] font-extrabold tracking-[0.15em] uppercase text-zinc-500 mb-3"><span>CONTRIBUTION STREAK • REAL DATA</span><span>{streakData.filter(s=>s.count>0).length} days</span></div>
            <div className="flex gap-[4px]">
              {streakData.map((d,i) => (
                <div key={i} title={`${d.date}: ${d.count} words`} className={`flex-1 h-[24px] rounded-[8px] transition ${d.intensity===0 ? 'bg-zinc-100' : d.intensity===1 ? 'bg-[#a7d5b0]' : d.intensity===2 ? 'bg-[#5a9a68]' : 'bg-[#1a4d2e]'}`} />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 bg-white rounded-[24px] border border-zinc-200 p-4 flex flex-col lg:flex-row gap-4 items-center shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
        <div className="flex-1 relative w-full">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">⌕</span>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by Yorùbá, toned, English, IPA..." className="w-full h-[48px] pl-11 pr-4 rounded-full border border-zinc-200 bg-zinc-50 text-[14px] font-medium text-[#121212] placeholder:text-zinc-400 focus:bg-white focus:border-[#1a4d2e] focus:ring-4 focus:ring-[#1a4d2e]/10 outline-none transition" />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {[
            {id:"all", l:`All ${counts.total}`},
            {id:"approved", l:`Approved ${counts.approved}`},
            {id:"pending", l:`Pending ${counts.pending}`},
            {id:"rejected", l:`Rejected ${rejectedCount}`},
            {id:"audio", l:`With Audio ${counts.withAudio}`},
            {id:"noaudio", l:`No Audio ${counts.noAudio}`},
          ].map(f=>(
            <button key={f.id} onClick={()=>setFilter(f.id)} className={`h-9 px-4 rounded-full text-[12px] font-bold border transition flex items-center justify-center ${filter===f.id ? 'bg-[#121212] text-white border-[#121212]' : 'bg-white border-zinc-200 text-zinc-700 hover:border-zinc-300'}`}>{f.l}</button>
          ))}
        </div>
        <div className="flex gap-1 p-1 rounded-full bg-zinc-100 border border-zinc-200 shrink-0">
          <button onClick={()=>setView("grid")} className={`h-9 px-4 rounded-full text-[11px] font-bold transition ${view==="grid"?"bg-[#121212] text-white shadow":"text-zinc-500 hover:text-zinc-700"}`}>Grid</button>
          <button onClick={()=>setView("table")} className={`h-9 px-4 rounded-full text-[11px] font-bold transition ${view==="table"?"bg-[#121212] text-white shadow":"text-zinc-500 hover:text-zinc-700"}`}>Table</button>
        </div>
      </div>

      <div id="contributions" className="mt-6">
        <div className="flex justify-between items-center mb-4">
          <div className="text-[13px] font-medium text-zinc-600">Showing <b className="text-[#121212]">{paginated.length}</b> of <b className="text-[#121212]">{filtered.length}</b> {filtered.length === 1 ? 'word' : 'words'} • Recent first • <span className="capitalize">{view}</span></div>
          {totalPages > 1 && <div className="text-[12px] text-zinc-500">Page {page} of {totalPages}</div>}
        </div>

        {view==="grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginated.map(w=>(
              <div key={w.id} className="group bg-white rounded-[20px] border border-zinc-200 p-5 hover:shadow-[0_12px_32px_rgba(0,0,0,0.1)] hover:border-zinc-300 transition-all">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-[#1a4d2e] text-white flex items-center justify-center font-bold text-[13px]">{w.yoruba.slice(0,2).toUpperCase()}</div>
                    <div>
                      <div className="font-bold text-[16px] leading-none text-[#121212]">{w.yoruba}</div>
                      <div className="text-[12px] font-medium text-zinc-500 mt-1">{w.normalizedWord} {w.ipa && `• /${w.ipa}/`}</div>
                    </div>
                  </div>
                  <span className={`text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full border flex items-center justify-center ${w.status==="APPROVED" ? 'bg-green-50 text-green-700 border-green-200' : w.status==="PENDING" ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-red-50 text-red-700 border-red-200'}`}>{w.status}</span>
                </div>
                <div className="mt-4 flex items-center gap-2 flex-wrap">
                  <span className="text-zinc-400">→</span> 
                  <span className="font-semibold text-[15px] text-[#121212]">{w.english}</span> 
                  <span className="text-[11px] font-medium bg-zinc-100 border border-zinc-200 px-2.5 py-1 rounded-full text-zinc-700">{w.category.name} • {w.partOfSpeech}</span>
                </div>
                {w.exampleYo && <div className="mt-3 bg-zinc-50 border border-zinc-100 rounded-[12px] p-3"><div className="text-[13px] italic font-medium text-zinc-700">"{w.exampleYo}"</div><div className="text-[12px] text-zinc-500 mt-1">{w.exampleEn}</div></div>}
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {w.audioRecordings.length>0 ? (
                      <button onClick={()=>playAudio(w)} className={`flex items-center gap-2 h-8 px-3 rounded-full border transition ${playingId===w.id ? 'bg-[#1a4d2e] text-white border-[#1a4d2e]' : 'bg-white border-zinc-200 hover:border-[#1a4d2e]/30'}`}>
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] ${playingId===w.id ? 'bg-white text-[#1a4d2e]' : 'bg-[#1a4d2e] text-white'}`}>{playingId===w.id ? '■' : '▶'}</div>
                        <div className="flex gap-[2px] items-end">
                          {waveform.slice(0,5).map((h,i)=><div key={i} className={`w-[2px] rounded-full ${playingId===w.id ? 'bg-white' : 'bg-[#1a4d2e]/40'}`} style={{height: `${h}px`}} />)}
                        </div>
                        <span className="text-[11px] font-bold">{playingId===w.id ? 'Playing' : `${w.audioRecordings.length} audio`}</span>
                      </button>
                    ) : <span className="text-[12px] font-medium text-zinc-400">No audio • {w.views} views</span>}
                  </div>
                  <div className="flex gap-2 items-center">
                    <Link href={`/dictionary/${w.slug}`} className="h-8 w-8 rounded-full bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center text-[#121212] transition">↗</Link>
                    {w.status === "REJECTED" && (
                      <Link href={`/contribute?resubmit=${w.id}`} className="h-8 px-3 rounded-full bg-[#1a4d2e] text-white text-[11px] font-bold flex items-center justify-center hover:bg-[#143d24]">Fix & Resubmit</Link>
                    )}
                    {w.status === "PENDING" && (
                      <Link href={`/contribute?edit=${w.id}`} className="h-8 px-3 rounded-full bg-white border border-zinc-200 text-[11px] font-bold text-[#121212] hover:bg-zinc-50 flex items-center justify-center">Edit</Link>
                    )}
                    {w.status === "APPROVED" && (
                      <span className="h-8 px-3 rounded-full bg-zinc-100 border border-zinc-200 text-[11px] font-bold text-zinc-400 flex items-center justify-center gap-1">🔒 Locked</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-[20px] border border-zinc-300 overflow-hidden shadow-sm">
            <div className="overflow-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-zinc-100 text-[11px] tracking-widest font-bold text-zinc-600 border-b border-zinc-200">
                    <th className="py-4 px-4">YORÙBÁ</th>
                    <th className="py-4 px-4">ENGLISH</th>
                    <th className="py-4 px-4">CATEGORY</th>
                    <th className="py-4 px-4">STATUS</th>
                    <th className="py-4 px-4">AUDIO</th>
                    <th className="py-4 px-4">VIEWS</th>
                    <th className="py-4 px-4">ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map(w=>(
                    <tr key={w.id} className="border-t border-zinc-200 text-[14px] hover:bg-zinc-50 transition">
                      <td className="py-4 px-4 font-bold text-[#121212] text-[15px]">{w.yoruba}</td>
                      <td className="py-4 px-4 font-semibold text-[#121212]">{w.english}</td>
                      <td className="py-4 px-4 text-zinc-700 font-medium">{w.category.name}</td>
                      <td className="py-4 px-4"><span className={`px-3 py-1 rounded-full text-[11px] font-bold border ${w.status==="APPROVED"?"bg-green-50 text-green-700 border-green-200": w.status==="PENDING"?"bg-amber-50 text-amber-700 border-amber-200":"bg-red-50 text-red-700 border-red-200"}`}>{w.status}</span></td>
                      <td className="py-4 px-4">{w.audioRecordings.length>0?<span className="px-3 py-1 rounded-full bg-[#1a4d2e] text-white text-[11px] font-bold">🎙 {w.audioRecordings.length}</span>:<span className="text-zinc-400">—</span>}</td>
                      <td className="py-4 px-4 font-bold text-[#121212]">{w.views}</td>
                      <td className="py-4 px-4">
                        <div className="flex gap-2">
                          <Link href={`/dictionary/${w.slug}`} className="h-8 px-4 rounded-full bg-white border border-zinc-300 text-[#121212] text-[11px] font-bold flex items-center justify-center hover:bg-zinc-100">View</Link>
                          {w.status==="REJECTED" && <Link href={`/contribute?resubmit=${w.id}`} className="h-8 px-4 rounded-full bg-[#1a4d2e] text-white text-[11px] font-bold flex items-center justify-center hover:bg-black">Fix</Link>}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {filtered.length > PAGE_SIZE && (
          <div className="mt-8 flex items-center justify-between bg-white rounded-full border border-zinc-200 p-2 shadow-sm">
            <button disabled={page===1} onClick={()=>setPage(p=>Math.max(1,p-1))} className="h-10 px-5 rounded-full bg-white border border-zinc-200 text-[13px] font-bold text-[#121212] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-zinc-50 flex items-center justify-center transition">← Prev</button>
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-medium text-zinc-600">Showing <b className="text-[#121212]">{(page-1)*PAGE_SIZE + 1}-{Math.min(page*PAGE_SIZE, filtered.length)}</b> of <b className="text-[#121212]">{filtered.length}</b></span>
            </div>
            <button disabled={page===totalPages} onClick={()=>setPage(p=>Math.min(totalPages,p+1))} className="h-10 px-5 rounded-full bg-[#121212] text-white text-[13px] font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-black flex items-center justify-center transition">Next →</button>
          </div>
        )}

        {filtered.length===0 && <div className="py-20 text-center bg-white rounded-[24px] border border-dashed border-zinc-200 mt-4"><div className="text-[14px] font-medium text-zinc-500">No matches. Try different search.</div></div>}
      </div>
    </div>
  );
}
