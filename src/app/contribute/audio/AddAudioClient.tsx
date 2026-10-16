"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const isIOS = typeof navigator!== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent);

function getSupportedMimeType() {
  if (isIOS) return 'audio/wav';
  const types = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4'];
  for (const t of types) {
    if (typeof MediaRecorder!== 'undefined' && MediaRecorder.isTypeSupported(t)) return t;
  }
  return '';
}

function getExtension(mime: string) {
  if (mime.includes('mp4') || mime.includes('aac')) return 'm4a';
  if (mime.includes('wav')) return 'wav';
  return 'webm';
}

function encodeWAV(samples: Float32Array[], sampleRate: number) {
  const length = samples.reduce((a, c) => a + c.length, 0);
  const buffer = new ArrayBuffer(44 + length * 2);
  const view = new DataView(buffer);
  const writeString = (offset: number, str: string) => { for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i)); };
  writeString(0, 'RIFF'); view.setUint32(4, 36 + length * 2, true); writeString(8, 'WAVE');
  writeString(12, 'fmt '); view.setUint32(16, 16, true); view.setUint16(20, 1, true);
  view.setUint16(22, 1, true); view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true); view.setUint16(32, 2, true);
  view.setUint16(34, 16, true); writeString(36, 'data'); view.setUint32(40, length * 2, true);
  let offset = 44;
  for (const chunk of samples) { for (let i = 0; i < chunk.length; i++) { const s = Math.max(-1, Math.min(1, chunk[i])); view.setInt16(offset, s < 0? s * 0x8000 : s * 0x7FFF, true); offset += 2; } }
  return new Blob([view], { type: 'audio/wav' });
}

export default function AddAudioClient({ word }: { word: { id: string; yoruba: string; english: string; slug: string; category: { name: string }, audioRecordings: any[] } }) {
  const router = useRouter();
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioPreview, setAudioPreview] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordTime, setRecordTime] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const recRef = useRef<any>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const mimeRef = useRef<string>('');
  // iOS refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const pcmRef = useRef<Float32Array[]>([]);

  useEffect(() => {
    return () => {
      if (audioPreview) URL.revokeObjectURL(audioPreview);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [audioPreview]);

  const startRec = async () => {
    try {
      setError("");
      if (audioPreview) URL.revokeObjectURL(audioPreview);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, sampleRate: 44100 } });

      if (isIOS) {
        // iPhone: Record WAV so preview plays
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 44100 });
        audioContextRef.current = ctx;
        const source = ctx.createMediaStreamSource(stream);
        const processor = ctx.createScriptProcessor(4096, 1, 1);
        processorRef.current = processor;
        pcmRef.current = [];
        processor.onaudioprocess = (e) => { pcmRef.current.push(new Float32Array(e.inputBuffer.getChannelData(0))); };
        source.connect(processor); processor.connect(ctx.destination);
        mimeRef.current = 'audio/wav';
        recRef.current = {
          stream, source, processor,
          stop: () => {
            source.disconnect(); processor.disconnect();
            const wavBlob = encodeWAV(pcmRef.current, ctx.sampleRate);
            const file = new File([wavBlob], `yoruba-${word.yoruba}-${Date.now()}.wav`, { type: 'audio/wav' });
            setAudioFile(file); setAudioPreview(URL.createObjectURL(wavBlob));
            stream.getTracks().forEach(t => t.stop()); ctx.close();
            setIsRecording(false); if (timerRef.current) clearInterval(timerRef.current);
          }
        };
        setIsRecording(true); setRecordTime(0);
        timerRef.current = setInterval(() => setRecordTime(s => s + 1), 1000);
      } else {
        // Android/Desktop: webm
        const mimeType = getSupportedMimeType();
        mimeRef.current = mimeType;
        const rec = mimeType? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
        const chunks: BlobPart[] = [];
        rec.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data); };
        rec.onstop = () => {
          const type = mimeRef.current || 'audio/webm';
          const blob = new Blob(chunks, { type });
          const ext = getExtension(type);
          const file = new File([blob], `yoruba-${word.yoruba}-${Date.now()}.${ext}`, { type });
          setAudioFile(file); setAudioPreview(URL.createObjectURL(blob));
          stream.getTracks().forEach(t => t.stop());
          setIsRecording(false); if (timerRef.current) clearInterval(timerRef.current);
        };
        recRef.current = rec; rec.start(100);
        setIsRecording(true); setRecordTime(0);
        timerRef.current = setInterval(() => setRecordTime(s => s + 1), 1000);
      }
    } catch (e: any) {
      setError("Mic permission denied: " + e.message);
    }
  };

  const stopRec = () => { recRef.current?.stop(); };
  const removeAudio = () => {
    if (audioPreview) URL.revokeObjectURL(audioPreview);
    setAudioFile(null); setAudioPreview(null); setRecordTime(0);
  };

  async function handleUpload() {
    if (!audioFile) { setError("Record or upload audio first"); return; }
    setUploading(true); setError("");
    try {
      const fd = new FormData(); fd.append("file", audioFile); fd.append("wordId", word.id); fd.append("slug", word.slug);
      const res = await fetch("/api/upload/audio", { method: "POST", body: fd });
      const data = await res.json(); if (!res.ok) throw new Error(data.error || "Upload failed");
      router.push(`/dictionary/${word.slug}?audioAdded=1`);
    } catch (e: any) { setError(e.message); } finally { setUploading(false); }
  }

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div className="space-y-6">
      <Link href={`/dictionary/${word.slug}`} className="inline-flex items-center gap-2 text- font-medium text-black/50 hover:text-black">← Back to {word.yoruba}</Link>

      <div className="bg-white rounded- border border-black/[0.06] shadow-[0_8px_32px_rgba(0,0,0,0.06)] p-8">
        <div className="h- -mx-8 -mt-8 mb-8 bg-gradient-to-r from-[#1a4d2e] via-[#2a7a4b] to-[#f5d547] rounded-t-" />
        <div className="text- tracking-widest uppercase font-bold text-black/30">Add pronunciation • Approved word locked {isIOS? '• iPhone mode' : ''}</div>
        <h1 className="serif text- font-bold text-[#1a4d2e] mt-2 leading-none">{word.yoruba}</h1>
        <div className="mt-2 text- text-black/60">{word.english} • {word.category.name} • {word.audioRecordings.length} approved audio</div>

        <div className="mt-6 p-4 bg-[#f5f7f0] rounded- border border-[#1a4d2e]/10 text- leading-[1.5] text-[#1a4d2e]/70">
          <b>Important:</b> "{word.yoruba}" is already APPROVED and locked — you cannot edit meaning. You are only adding pronunciation. This solves <b>eja approved but no audio</b> problem. Audio will go to PENDING and admin will approve audio only (word stays approved).
        </div>

        {error && <div className="mt-4 bg-red-50 border border-red-200 text-red-700 rounded- p-3 text-">{error}</div>}

        <div className="mt-8 space-y-4">
          <div className="flex flex-wrap gap-3 items-center">
            {!isRecording? (
              <button type="button" onClick={startRec} className="h-11 px-5 rounded-full bg-[#1a4d2e] text-white text- font-bold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-400" /> 🎙 Record — {word.yoruba}
              </button>
            ) : (
              <button type="button" onClick={stopRec} className="h-11 px-5 rounded-full bg-red-600 text-white text- font-bold animate-pulse">⏹ Stop • {formatTime(recordTime)}</button>
            )}

            <label className="h-11 px-5 rounded-full bg-white border border-black/10 text- font-semibold flex items-center gap-2 cursor-pointer hover:bg-zinc-50">
              📁 Upload mp3/wav
              <input type="file" accept="audio/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) { if (audioPreview) URL.revokeObjectURL(audioPreview); setAudioFile(f); setAudioPreview(URL.createObjectURL(f)); mimeRef.current = f.type; } }} />
            </label>

            {audioPreview && (
              <div className="flex items-center gap-2 bg-[#fafaf7] border rounded-full pl-3 pr-2 h-11">
                <audio controls playsInline preload="auto" src={audioPreview} className="h-8 w-" />
                <button type="button" onClick={removeAudio} className="w-7 h-7 rounded-full bg-white border text-">✕</button>
              </div>
            )}
          </div>

          {audioFile && (
            <div className="bg-white border rounded- px-3 py-2 text- text-black/60 flex justify-between">
              <span><b className="text-black">{audioFile.name}</b> • {(audioFile.size / 1024).toFixed(1)} KB {mimeRef.current? `• ${mimeRef.current}` : ''}</span>
              <button onClick={removeAudio} className="text-red-600 font-bold">Remove</button>
            </div>
          )}

          <button disabled={!audioFile || uploading} onClick={handleUpload} className="w-full h-12 rounded-full bg-[#f5d547] text-[#1a4d2e] font-bold text- disabled:opacity-40 flex items-center justify-center gap-2">
            {uploading? <><span className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" /> Uploading...</> : `Submit audio for "${word.yoruba}" → Review`}
          </button>

          <div className="text- text-black/40 text-center">Audio alone cannot be approved if word is not approved — here word is already approved, so admin can approve audio alone.</div>
        </div>
      </div>
    </div>
  );
}