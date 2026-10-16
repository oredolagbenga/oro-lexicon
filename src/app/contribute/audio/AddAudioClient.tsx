"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

function getSupportedMimeType() {
  const types = [
    'audio/mp4', // iPhone + most Android
    'audio/aac',
    'audio/webm;codecs=opus',
    'audio/webm',
  ];
  for (const t of types) {
    if (typeof MediaRecorder!== 'undefined' && MediaRecorder.isTypeSupported(t)) {
      return t;
    }
  }
  return '';
}

function getExtension(mime: string) {
  if (mime.includes('mp4') || mime.includes('aac')) return 'm4a';
  if (mime.includes('webm')) return 'webm';
  return 'webm';
}

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
  const mimeRef = useRef<string>('');

  useEffect(() => {
    return () => {
      if (audioPreview) URL.revokeObjectURL(audioPreview);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  }, [audioPreview]);

  const startRec = async () => {
    try {
      setError("");
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, sampleRate: 44100 }
      });

      const mimeType = getSupportedMimeType();
      mimeRef.current = mimeType;
      console.log('Recording with:', mimeType);

      const rec = mimeType? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      rec.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data); };
      rec.onstop = () => {
        const type = mimeRef.current || 'audio/mp4';
        const blob = new Blob(chunks, { type });
        const ext = getExtension(type);
        const file = new File([blob], `yoruba-${word.yoruba}-${Date.now()}.${ext}`, { type });
        setAudioFile(file);
        setAudioPreview(URL.createObjectURL(blob));
        stream.getTracks().forEach(t => t.stop());
        setIsRecording(false);
        if (timerRef.current) clearInterval(timerRef.current);
      };

      recRef.current = rec;
      rec.start(100);
      setIsRecording(true);
      setRecordTime(0);
      timerRef.current = setInterval(() => setRecordTime(s => s + 1), 1000);
    } catch (e: any) {
      setError("Mic permission denied or not supported: " + e.message);
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
      <Link href={`/dictionary/${word.slug}`} className="inline-flex items-center gap-2 text- font-medium text-black/50 hover:text-black">
        ← Back to {word.yoruba}
      </Link>

      <div className="bg-white rounded- border border-black/[0.06] shadow-[0_8px_32px_rgba(0,0,0,0.06)] p-8">
        <div className="h- -mx-8 -mt-8 mb-8 bg-gradient-to-r from-[#1a4d2e] via-[#2a7a4b] to-[#f5d547] rounded-t-" />
        <div className="text- tracking-widest uppercase font-bold text-black/30">Add pronunciation • Approved word locked</div>
        <h1 className="serif text- font-bold text-[#1a4d2e] mt-2 leading-none">{word.yoruba}</h1>
        <div className="mt-2 text- text-black/60">{word.english} • {word.category.name} • {word.audioRecordings.length} approved audio</div>

        <div className="mt-6 p-4 bg-[#f5f7f0] rounded- border border-[#1a4d2e]/10 text- leading-[1.5] text-[#1a4d2e]/70">
          <b>Important:</b> "{word.yoruba}" is already APPROVED and locked — you cannot edit meaning. You are only adding pronunciation.
        </div>

        {error && <div className="mt-4 bg-red-50 border border-red-200 text-red-700 rounded- p-3 text-">{error}</div>}

        <div className="mt-8 space-y-4">
          <div className="flex flex-wrap gap-3 items-center">
            {!isRecording? (
              <button type="button" onClick={startRec} className="h-11 px-5 rounded-full bg-[#1a4d2e] text-white text- font-bold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-400" /> 🎙 Record — {word.yoruba}
              </button>
            ) : (
              <button type="button" onClick={stopRec} className="h-11 px-5 rounded-full bg-red-600 text-white text- font-bold animate-pulse">
                ⏹ Stop • {formatTime(recordTime)}
              </button>
            )}

            <label className="h-11 px-5 rounded-full bg-white border border-black/10 text- font-semibold flex items-center gap-2 cursor-pointer hover:bg-zinc-50">
              📁 Upload mp3/wav/m4a
              <input type="file" accept="audio/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) { if (audioPreview) URL.revokeObjectURL(audioPreview); setAudioFile(f); setAudioPreview(URL.createObjectURL(f)); } }} />
            </label>

            {audioPreview && (
              <div className="flex items-center gap-2 bg-[#fafaf7] border rounded-full pl-3 pr-2 h-11">
                {/* ✅ FIXED: playsInline + crossOrigin for mobile */}
                <audio controls playsInline preload="auto" src={audioPreview} className="h-8 w-" />
                <button type="button" onClick={removeAudio} className="w-7 h-7 rounded-full bg-white border text-">✕</button>
              </div>
            )}
          </div>

          {audioFile && (
            <div className="bg-white border rounded- px-3 py-2 text- text-black/60 flex justify-between">
              <span><b className="text-black">{audioFile.name}</b> • {(audioFile.size/1024).toFixed(1)} KB • {mimeRef.current || audioFile.type}</span>
              <button onClick={removeAudio} className="text-red-600 font-bold">Remove</button>
            </div>
          )}

          <button disabled={!audioFile || uploading} onClick={handleUpload} className="w-full h-12 rounded-full bg-[#f5d547] text-[#1a4d2e] font-bold text- disabled:opacity-40 flex items-center justify-center gap-2">
            {uploading? <><span className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" /> Uploading...</> : `Submit audio for "${word.yoruba}" → Review`}
          </button>
        </div>
      </div>
    </div>
  );
}