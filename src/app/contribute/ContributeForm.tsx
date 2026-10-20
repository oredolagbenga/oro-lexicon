"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import YorubaKeyboard from "@/app/components/layout/YorubaKeyboard";

const POS = [
  { value: "NOUN", label: "Noun - orúkọ" },
  { value: "VERB", label: "Verb - ìṣe" },
  { value: "ADJECTIVE", label: "Adjective" },
  { value: "ADVERB", label: "Adverb" },
  { value: "PRONOUN", label: "Pronoun" },
  { value: "PREPOSITION", label: "Preposition" },
  { value: "CONJUNCTION", label: "Conjunction" },
  { value: "INTERJECTION", label: "Interjection" },
  { value: "GREETING", label: "Greeting - ìkíni" },
  { value: "PHRASE", label: "Phrase" },
  { value: "DETERMINER", label: "Determiner" },
  { value: "NUMERAL", label: "Numeral" },
];

export default function ContributeForm({ categories }: { categories: { id: string; name: string; slug: string }[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const resubmitId = searchParams.get("resubmit");

  const [activeField, setActiveField] = useState<string | null>(null);
  const [form, setForm] = useState({ yoruba: "", english: "", ipa: "", partOfSpeech: "NOUN", categoryId: categories[0]?.id || "", exampleYo: "", exampleEn: "", translation: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [duplicate, setDuplicate] = useState<any>(null);
  const [checking, setChecking] = useState(false);
  const [isResubmit, setIsResubmit] = useState(false);
  const [originalWord, setOriginalWord] = useState<any>(null);
  const [loadingResubmit, setLoadingResubmit] = useState(false);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioPreview, setAudioPreview] = useState<string | null>(null);
  const [uploadedAudioId, setUploadedAudioId] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordTime, setRecordTime] = useState(0);
  const recRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [showSuccess, setShowSuccess] = useState<{ open: boolean; yoruba: string; english: string; hasAudio: boolean }>({ open: false, yoruba: "", english: "", hasAudio: false });

  const refs = {
    yoruba: useRef<HTMLInputElement>(null),
    ipa: useRef<HTMLInputElement>(null),
    exampleYo: useRef<HTMLTextAreaElement>(null),
    english: useRef<HTMLInputElement>(null),
    exampleEn: useRef<HTMLTextAreaElement>(null),
    translation: useRef<HTMLInputElement>(null),
  };

  const yorubaFields = ["yoruba", "ipa", "exampleYo"];
  const showKeyboard = activeField ? yorubaFields.includes(activeField) : false;
  const anchorRef = activeField ? (refs as any)[activeField] as React.RefObject<HTMLElement> : undefined;

  useEffect(() => { if (categories.length && !form.categoryId) setForm(f => ({ ...f, categoryId: categories[0].id })); }, [categories]);

  useEffect(() => {
    if (!resubmitId) return;
    setLoadingResubmit(true);
    fetch(`/api/words/${resubmitId}`, { cache: "no-store" })
      .then(async (r) => { const json = await r.json(); if (!r.ok) throw new Error(json.error); return json; })
      .then((json) => {
        const w = json.word || json;
        if (w?.id) {
          setForm({ yoruba: w.yoruba || "", english: w.english || "", ipa: w.ipa || "", partOfSpeech: w.partOfSpeech || "NOUN", categoryId: w.categoryId || w.category?.id || categories[0]?.id || "", exampleYo: w.exampleYo || "", exampleEn: w.exampleEn || "", translation: w.translation || "" });
          setOriginalWord(w); setIsResubmit(true);
        }
      })
      .catch((e) => setError(`Could not load word: ${e.message}`))
      .finally(() => setLoadingResubmit(false));
  }, [resubmitId, categories]);

  useEffect(() => {
    if (isResubmit) return;
    if (form.yoruba.trim().length < 2 || form.english.trim().length < 2) { setDuplicate(null); return; }
    setChecking(true);
    const t = setTimeout(async () => {
      try {
        const r = await fetch(`/api/words/check?yoruba=${encodeURIComponent(form.yoruba.trim())}&english=${encodeURIComponent(form.english.trim())}`);
        const d = await r.json(); setDuplicate(d.exists ? (d.word || d.existing) : null);
      } catch { setDuplicate(null); } finally { setChecking(false); }
    }, 500);
    return () => clearTimeout(t);
  }, [form.yoruba, form.english, isResubmit]);

  // FIXED: Don't close when clicking keyboard keys
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest("[data-yoruba-keyboard]")) return;
      if (target.closest("input") || target.closest("textarea") || target.closest("select")) return;
      setActiveField(null);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  useEffect(() => {
    if (isRecording) { timerRef.current = setInterval(() => setRecordTime(s => s + 1), 1000); }
    else { if (timerRef.current) clearInterval(timerRef.current); setRecordTime(0); }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isRecording]);

  function insertChar(char: string) {
    if (!activeField) return;
    if (char === "DEL") { setForm(f => ({ ...f, [activeField]: (f as any)[activeField].slice(0, -1) })); return; }
    const ref = (refs as any)[activeField]?.current;
    if (!ref) { setForm(f => ({ ...f, [activeField]: (f as any)[activeField] + char })); return; }
    const s = ref.selectionStart ?? (form as any)[activeField].length;
    const e = ref.selectionEnd ?? (form as any)[activeField].length;
    const cur = (form as any)[activeField] || "";
    const nxt = cur.substring(0, s) + char + cur.substring(e);
    setForm(f => ({ ...f, [activeField]: nxt }));
    setTimeout(() => { ref.focus(); ref.setSelectionRange(s + char.length, s + char.length); }, 0);
  }

  const startRec = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream); const chunks: BlobPart[] = [];
      rec.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data); };
      rec.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        const file = new File([blob], `yoruba-${Date.now()}.webm`, { type: "audio/webm" });
        setAudioFile(file); setAudioPreview(URL.createObjectURL(blob));
        stream.getTracks().forEach(t => t.stop()); setIsRecording(false);
      };
      recRef.current = rec; rec.start(); setIsRecording(true);
    } catch { setError("Mic permission denied"); }
  };
  const stopRec = () => recRef.current?.stop();
  const removeAudio = async () => {
    if (uploadedAudioId) { try { await fetch(`/api/upload/audio?audioId=${uploadedAudioId}`, { method: "DELETE" }); } catch {} setUploadedAudioId(null); }
    if (audioPreview) URL.revokeObjectURL(audioPreview);
    setAudioFile(null); setAudioPreview(null);
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isResubmit && duplicate) { setError(`Duplicate: "${duplicate.yoruba}" = "${duplicate.english}"`); return; }
    setLoading(true); setError("");
    try {
      let wordId: string; let wordSlug: string;
      if (isResubmit && originalWord) {
        const r = await fetch(`/api/words/${originalWord.id}/resubmit`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
        const d = await r.json(); if (!r.ok) throw new Error(d.error); wordId = d.word.id; wordSlug = d.word.slug;
      } else {
        const r = await fetch("/api/words", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
        const d = await r.json(); if (!r.ok) throw new Error(d.error); wordId = d.word.id; wordSlug = d.word.slug;
      }
      if (audioFile && wordId) {
        const fd = new FormData(); fd.append("file", audioFile); fd.append("wordId", wordId); fd.append("slug", wordSlug);
        const up = await fetch("/api/upload/audio", { method: "POST", body: fd });
        if (!up.ok) { const upErr = await up.json().catch(()=>({error:"Audio upload failed"})); throw new Error(upErr.error); }
      }
      setShowSuccess({ open: true, yoruba: form.yoruba, english: form.english, hasAudio: !!audioFile });
    } catch (err: any) { setError(err.message); } finally { setLoading(false); }
  }

  const formatTime = (s: number) => `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;
  if (loadingResubmit) return <div className="bg-white rounded- border p-12 text-center text-">Loading "{resubmitId}" for fix... Please wait.</div>;

  return (
    <div className="space-y-6 relative">
      {loading && (
        <div className="fixed bottom-6 right-6 z-[80] bg-[#121212] text-white px-5 py-4 rounded- text- font-bold shadow-[0_20px_60px_rgba(0,0,0,0.3)] flex items-center gap-3 animate-in slide-in-from-bottom-4">
          <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
          <div><div>{audioFile ? "Uploading audio to Cloudinary... 5-12s" : "Saving word..."}</div><div className="text- font-normal text-white/60">{audioFile ? "Transcoding audio, please wait" : "Checking tones"}</div></div>
        </div>
      )}
      {showSuccess.open && (
        <div className="fixed inset-0 z-[100] bg-[#1a4d2e]/30 backdrop-blur- flex items-center justify-center p-4">
          <div className="bg-[#fcfaf0] rounded- max-w- w-full p-8 border border-[#1a4d2e]/10 shadow-[0_32px_120px_rgba(0,0,0,0.3)] text-center">
            <div className="w-16 h-16 rounded-full bg-[#1a4d2e] text-white flex items-center justify-center mx-auto text-">✓</div>
            <h3 className="serif text- font-bold mt-5 leading-[0.9]">Submitted!</h3>
            <div className="mt-3 inline-flex px-3 py-1 rounded-full bg-[#f5d547] text- font-bold tracking-wide">PENDING REVIEW • AWAITING ADMIN</div>
            <p className="mt-4 text- leading-[1.6] text-[#1a4d2e]/70"><b className="text-[#1a4d2e]">{showSuccess.yoruba}</b> = {showSuccess.english} {showSuccess.hasAudio && "🎙 with audio"} is now waiting for review.</p>
            <div className="mt-7 grid grid-cols-2 gap-3">
              <button onClick={()=>{ setShowSuccess({open:false, yoruba:"", english:"", hasAudio:false}); router.push("/dashboard"); }} className="h-12 rounded-full bg-[#1a4d2e] text-white font-bold text- hover:bg-black">Go to Dashboard</button>
              <button onClick={()=>{ setShowSuccess({open:false, yoruba:"", english:"", hasAudio:false}); setForm({ yoruba: "", english: "", ipa: "", partOfSpeech: "NOUN", categoryId: categories[0]?.id || "", exampleYo: "", exampleEn: "", translation: "" }); removeAudio(); }} className="h-12 rounded-full bg-white border border-[#1a4d2e]/10 font-bold text-">Add Another +</button>
            </div>
          </div>
        </div>
      )}
      {isResubmit && (
        <div className="bg-amber-50 border border-amber-200 rounded- p-4 flex gap-3">
          <span className="text-">✏</span>
          <div><div className="font-bold text- text-amber-900">Fix & Resubmit Mode — "{originalWord?.yoruba}"</div><div className="text- text-amber-800 mt-1">Fix what admin complained about and resubmit — it goes back to PENDING.</div></div>
        </div>
      )}
      <form onSubmit={handleSubmit} className="bg-white rounded- border border-black/[0.06] shadow-[0_8px_32px_rgba(0,0,0,0.06)] p-6 md:p-10 space-y-6">
        <div className="h- -mx-6 md:-mx-10 -mt-6 md:-mt-10 mb-8 bg-gradient-to-r from-[#1a4d2e] via-[#2a7a4b] to-[#f5d547] rounded-t-" />
        {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded- p-3 text-">{error}</div>}
        {duplicate && !isResubmit && <div className="bg-amber-50 border border-amber-200 rounded- p-4 flex gap-3"><div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0">⚠</div><div className="flex-1"><div className="text- font-bold text-amber-900">Duplicate</div><div className="text- text-amber-800">"{duplicate.yoruba}" = "{duplicate.english}" is {duplicate.status}</div><Link href={`/dictionary/${duplicate.slug}`} className="mt-2 inline-flex h-7 px-3 rounded-full bg-white border border-amber-200 text- font-bold">View →</Link></div></div>}
        {checking && !isResubmit && <div className="text- text-black/40 flex items-center gap-2"><span className="w-3 h-3 border-2 border-black/10 border-t-[#1a4d2e] rounded-full animate-spin" /> Checking for duplicate...</div>}

        <div className="grid md:grid-cols-2 gap-5">
          <div>
            <label className="text- font-bold tracking-widest uppercase text-black/40">Yoruba Word *</label>
            <input ref={refs.yoruba} onFocus={() => setActiveField("yoruba")} value={form.yoruba} onChange={e => setForm({ ...form, yoruba: e.target.value })} required placeholder="ẹ kú àárọ̀" className="mt-2 w-full h-12 rounded- bg-[#fafaf7] border border-black/10 px-4 text- focus:outline-none focus:bg-white focus:border-[#1a4d2e]" />
            {activeField === "yoruba" && showKeyboard && <YorubaKeyboard visible={showKeyboard} onInsert={insertChar} onClose={() => setActiveField(null)} anchorRef={refs.yoruba as any} />}
          </div>
          <div>
            <label className="text- font-bold tracking-widest uppercase text-black/40">English *</label>
            <input ref={refs.english} value={form.english} onChange={e => setForm({ ...form, english: e.target.value })} required placeholder="good morning" className="mt-2 w-full h-12 rounded- bg-[#fafaf7] border border-black/10 px-4 text- focus:outline-none focus:bg-white focus:border-[#1a4d2e]" />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          <div>
            <label className="text- font-bold tracking-widest uppercase text-black/40">IPA</label>
            <input ref={refs.ipa} onFocus={() => setActiveField("ipa")} value={form.ipa} onChange={e => setForm({ ...form, ipa: e.target.value })} placeholder="/ẹ kú àárọ̀/" className="mt-2 w-full h-12 rounded- bg-[#fafaf7] border border-black/10 px-4 text- font-mono focus:outline-none focus:bg-white focus:border-[#1a4d2e]" />
            {activeField === "ipa" && showKeyboard && <YorubaKeyboard visible={showKeyboard} onInsert={insertChar} onClose={() => setActiveField(null)} anchorRef={refs.ipa as any} />}
          </div>
          <div>
            <label className="text- font-bold tracking-widest uppercase text-black/40">Part of Speech *</label>
            <select value={form.partOfSpeech} onChange={e => setForm({ ...form, partOfSpeech: e.target.value })} className="mt-2 w-full h-12 rounded- bg-[#fafaf7] border border-black/10 px-4 text- focus:outline-none focus:bg-white">{POS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}</select>
          </div>
        </div>

        <div>
          <label className="text- font-bold tracking-widest uppercase text-black/40">Category *</label>
          <select value={form.categoryId} onChange={e => setForm({ ...form, categoryId: e.target.value })} required className="mt-2 w-full h-12 rounded- bg-[#fafaf7] border border-black/10 px-4 text- focus:outline-none focus:bg-white">{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          <div>
            <label className="text- font-bold tracking-widest uppercase text-black/40">Yoruba Example</label>
            <textarea ref={refs.exampleYo} onFocus={() => setActiveField("exampleYo")} value={form.exampleYo} onChange={e => setForm({ ...form, exampleYo: e.target.value })} placeholder="Ẹ kú àárọ̀" rows={3} className="mt-2 w-full rounded- bg-[#fafaf7] border border-black/10 p-4 text- focus:outline-none focus:bg-white focus:border-[#1a4d2e]" />
            {activeField === "exampleYo" && showKeyboard && <YorubaKeyboard visible={showKeyboard} onInsert={insertChar} onClose={() => setActiveField(null)} anchorRef={refs.exampleYo as any} />}
          </div>
          <div>
            <label className="text- font-bold tracking-widest uppercase text-black/40">English Example</label>
            <textarea ref={refs.exampleEn} value={form.exampleEn} onChange={e => setForm({ ...form, exampleEn: e.target.value })} placeholder="Good morning" rows={3} className="mt-2 w-full rounded- bg-[#fafaf7] border border-black/10 p-4 text- focus:outline-none focus:bg-white focus:border-[#1a4d2e]" />
          </div>
        </div>

        <div className="bg-[#f8faf8] rounded- border border-black/[0.06] p-5">
          <div className="flex items-center justify-between mb-3">
            <label className="text- font-bold tracking-widest uppercase text-black/50">Audio Pronunciation (optional) - takes 5-12s extra</label>
            {isRecording && <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-full px-3 py-1"><span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" /><span className="text- font-bold text-red-600">REC {formatTime(recordTime)}</span></div>}
          </div>
          <div className="flex flex-wrap gap-3 items-center">
            {!isRecording ? <button type="button" onClick={startRec} className="h-11 px-5 rounded-full bg-[#1a4d2e] text-white text- font-bold flex items-center gap-2">🎙 Record</button> : <button type="button" onClick={stopRec} className="h-11 px-5 rounded-full bg-red-600 text-white text- font-bold">⏹ Stop • {formatTime(recordTime)}</button>}
            <label className="h-11 px-5 rounded-full bg-white border border-black/10 text- font-semibold flex items-center gap-2 cursor-pointer">📁 Upload<input type="file" accept="audio/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) { setAudioFile(f); setAudioPreview(URL.createObjectURL(f)); } }} /></label>
            {audioPreview && <div className="flex items-center gap-2 bg-white border rounded-full pl-3 pr-2 h-11"><audio controls src={audioPreview} className="h-8 w-" /><button type="button" onClick={removeAudio} className="w-7 h-7 rounded-full bg-red-50 border border-red-200 text-red-600 flex items-center justify-center">✕</button></div>}
          </div>
          {audioFile && <div className="mt-3 flex items-center justify-between bg-white border rounded- px-3 py-2"><div className="text- text-black/60">Selected: <b className="text-black">{audioFile.name}</b> • {(audioFile.size/1024).toFixed(0)}KB</div><button type="button" onClick={removeAudio} className="h-7 px-3 rounded-full bg-red-50 border border-red-200 text-red-600 text- font-bold">Remove</button></div>}
        </div>

        <button disabled={loading || (!isResubmit && !!duplicate)} type="submit" className="w-full h-12 rounded-full bg-[#1a4d2e] text-white font-bold text- disabled:opacity-40 flex items-center justify-center gap-2">
          {loading ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>{audioFile ? "Uploading audio... 5-12s" : "Submitting..."}</> : isResubmit ? "Resubmit for Review →" : duplicate ? "Duplicate — fix" : "Submit for Review →"}
        </button>
      </form>
    </div>
  );
}