"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AddAudioClient({ word }: { word: { id: string; yoruba: string; english: string; slug: string; category: { name: string }, audioRecordings: any[] } }) {
  const router = useRouter();
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioPreview, setAudioPreview] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordTime, setRecordTime] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const recRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startRec = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];
      rec.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data); };
      rec.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        const file = new File([blob], `yoruba-${word.yoruba}-${Date.now()}.webm`, { type: "audio/webm" });
        setAudioFile(file);
        setAudioPreview(URL.createObjectURL(blob));
        stream.getTracks().forEach(t => t.stop());
        setIsRecording(false);
        if (timerRef.current) clearInterval(timerRef.current);
      };
      recRef.current = rec;
      rec.start();
      setIsRecording(true);
      timerRef.current = setInterval(() => setRecordTime(s => s + 1), 1000);
    } catch {
      setError("Mic permission denied");
    }
  };

  const stopRec = () => {
    recRef.current?.stop();
  };

  const removeAudio = () => {
    if (audioPreview) URL.revokeObjectURL(audioPreview);
    setAudioFile(null);
    setAudioPreview(null);
    setRecordTime(0);
  };

  async function handleUpload() {
    if (!audioFile) { setError("Record or upload audio first"); return; }
    setUploading(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("file", audioFile);
      fd.append("wordId", word.id);
      fd.append("slug", word.slug);
      const res = await fetch("/api/upload/audio", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      router.push(`/dictionary/${word.slug}?audioAdded=1`);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setUploading(false);
    }
  }

  const formatTime = (s: number) => `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;

  return (
    <div className="space-y-6">
      <Link href={`/dictionary/${word.slug}`} className="inline-flex items-center gap-2 text-[13px] font-medium text-black/50 hover:text-black">
        ← Back to {word.yoruba}
      </Link>

      <div className="bg-white rounded-[24px] border border-black/[0.06] shadow-[0_8px_32px_rgba(0,0,0,0.06)] p-8">
        <div className="h-[4px] -mx-8 -mt-8 mb-8 bg-gradient-to-r from-[#1a4d2e] via-[#2a7a4b] to-[#f5d547] rounded-t-[24px]" />
        <div className="text-[11px] tracking-widest uppercase font-bold text-black/30">Add pronunciation • Approved word locked</div>
        <h1 className="serif text-[42px] font-bold text-[#1a4d2e] mt-2 leading-none">{word.yoruba}</h1>
        <div className="mt-2 text-[16px] text-black/60">{word.english} • {word.category.name} • {word.audioRecordings.length} approved audio</div>

        <div className="mt-6 p-4 bg-[#f5f7f0] rounded-[14px] border border-[#1a4d2e]/10 text-[12px] leading-[1.5] text-[#1a4d2e]/70">
          <b>Important:</b> "{word.yoruba}" is already APPROVED and locked — you cannot edit meaning. You are only adding pronunciation. This solves <b>eja approved but no audio</b> problem. Audio will go to PENDING and admin will approve audio only (word stays approved).
        </div>

        {error && <div className="mt-4 bg-red-50 border border-red-200 text-red-700 rounded-[12px] p-3 text-[13px]">{error}</div>}

        <div className="mt-8 space-y-4">
          <div className="flex flex-wrap gap-3 items-center">
            {!isRecording ? (
              <button type="button" onClick={startRec} className="h-11 px-5 rounded-full bg-[#1a4d2e] text-white text-[13px] font-bold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-400" /> 🎙 Record — {word.yoruba}
              </button>
            ) : (
              <button type="button" onClick={stopRec} className="h-11 px-5 rounded-full bg-red-600 text-white text-[13px] font-bold animate-pulse">
                ⏹ Stop • {formatTime(recordTime)}
              </button>
            )}

            <label className="h-11 px-5 rounded-full bg-white border border-black/10 text-[13px] font-semibold flex items-center gap-2 cursor-pointer hover:bg-zinc-50">
              📁 Upload mp3/wav
              <input type="file" accept="audio/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) { setAudioFile(f); setAudioPreview(URL.createObjectURL(f)); } }} />
            </label>

            {audioPreview && (
              <div className="flex items-center gap-2 bg-[#fafaf7] border rounded-full pl-3 pr-2 h-11">
                <audio controls src={audioPreview} className="h-8 w-[200px]" />
                <button type="button" onClick={removeAudio} className="w-7 h-7 rounded-full bg-white border text-[12px]">✕</button>
              </div>
            )}
          </div>

          {audioFile && (
            <div className="bg-white border rounded-[10px] px-3 py-2 text-[11px] text-black/60 flex justify-between">
              <span><b className="text-black">{audioFile.name}</b> • {(audioFile.size/1024).toFixed(1)} KB</span>
              <button onClick={removeAudio} className="text-red-600 font-bold">Remove</button>
            </div>
          )}

          <button disabled={!audioFile || uploading} onClick={handleUpload} className="w-full h-12 rounded-full bg-[#f5d547] text-[#1a4d2e] font-bold text-[14px] disabled:opacity-40 flex items-center justify-center gap-2">
            {uploading ? <><span className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" /> Uploading...</> : `Submit audio for "${word.yoruba}" → Review`}
          </button>

          <div className="text-[11px] text-black/40 text-center">Audio alone cannot be approved if word is not approved — here word is already approved, so admin can approve audio alone.</div>
        </div>
      </div>
    </div>
  );
}
