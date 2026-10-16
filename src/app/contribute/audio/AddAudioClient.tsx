"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AddAudioClient({ word }: any) {
  const router = useRouter();
  const [audioFile, setAudioFile] = useState<File|null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordTime, setRecordTime] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const recRef = useRef<MediaRecorder|null>(null);
  const timerRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const chunksRef = useRef<BlobPart[]>([]);

  useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const startRec = async () => {
    try {
      setError("");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      let options: any = {};
      if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) options.mimeType = 'audio/webm;codecs=opus';
      else if (MediaRecorder.isTypeSupported('audio/webm')) options.mimeType = 'audio/webm';
      else if (MediaRecorder.isTypeSupported('audio/mp4')) options.mimeType = 'audio/mp4';

      const rec = new MediaRecorder(stream, options);
      chunksRef.current = [];
      rec.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      rec.onstop = () => {
        // FIXED: Use actual mimeType from recorder - YOUR WORKING LOGIC
        const mimeType = (rec as any).mimeType || 'audio/webm';
        const blob = new Blob(chunksRef.current, { type: mimeType });
        const file = new File([blob], `yoruba-${word.yoruba}-${Date.now()}.webm`, { type: mimeType });
        setAudioFile(file);

        const audioURL = URL.createObjectURL(blob);
        if (audioRef.current) {
          if (audioRef.current.src && audioRef.current.src.startsWith('blob:')) URL.revokeObjectURL(audioRef.current.src);
          audioRef.current.src = audioURL;
          audioRef.current.load();
          audioRef.current.onloadeddata = () => {
            console.log("Preview loaded, duration:", audioRef.current?.duration);
            // don't auto-play, let user click play
          };
          audioRef.current.onerror = (e) => {
            console.error("Preview error:", e);
            setError("Preview error - try again");
          };
        }
        stream.getTracks().forEach(t => t.stop());
        setIsRecording(false);
        if (timerRef.current) clearInterval(timerRef.current);
      };
      recRef.current = rec;
      rec.start(100);
      setIsRecording(true); setRecordTime(0);
      timerRef.current = setInterval(() => setRecordTime(s => s+1), 1000);
    } catch (e:any) { setError("Mic denied: "+e.message); }
  };

  const stopRec = () => recRef.current?.stop();
  const removeAudio = () => { if (audioRef.current?.src) URL.revokeObjectURL(audioRef.current.src); if (audioRef.current) audioRef.current.removeAttribute('src'); setAudioFile(null); };

  async function handleUpload() {
    if (!audioFile) { setError("Record first"); return; }
    setUploading(true);
    try {
      const fd = new FormData(); fd.append("file", audioFile); fd.append("wordId", word.id); fd.append("slug", word.slug);
      const res = await fetch("/api/upload/audio", { method: "POST", body: fd });
      const d = await res.json(); if (!res.ok) throw new Error(d.error);
      router.push(`/dictionary/${word.slug}?audioAdded=1`);
    } catch(e:any){ setError(e.message); } finally { setUploading(false); }
  }

  return (
    <div className="space-y-6">
      <Link href={`/dictionary/${word.slug}`} className="text- text-black/50">← Back to {word.yoruba}</Link>
      <div className="bg-white rounded- border p-8">
        <h1 className="serif text- font-bold text-[#1a4d2e]">{word.yoruba}</h1>
        <div className="text- text-black/60">{word.english}</div>
        {error && <div className="mt-4 bg-red-50 border border-red-200 text-red-700 rounded- p-3 text-">{error}</div>}
        <div className="mt-8 space-y-4">
          <div className="flex gap-3">
            {!isRecording? <button onClick={startRec} className="h-11 px-5 rounded-full bg-[#1a4d2e] text-white text- font-bold">🎙 Record</button> : <button onClick={stopRec} className="h-11 px-5 rounded-full bg-red-600 text-white">⏹ Stop {Math.floor(recordTime/60)}:{String(recordTime%60).padStart(2,'0')}</button>}
          </div>
          <div className="bg-[#fafaf7] border rounded- p-3 flex items-center gap-3">
            <audio ref={audioRef} controls playsInline className="w-full max-w- h-10" />
            {audioFile && <button onClick={removeAudio} className="text- text-red-600">Remove</button>}
          </div>
          <button disabled={!audioFile||uploading} onClick={handleUpload} className="w-full h-12 rounded-full bg-[#f5d547] font-bold disabled:opacity-40">{uploading? "Uploading...":`Submit audio for "${word.yoruba}"`}</button>
        </div>
      </div>
    </div>
  );
}