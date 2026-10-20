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

  useEffect(() => { return () => { if (timerRef.current) clearInterval(timerRef.current); }; }, []);

  const startRec = async () => {
    try {
      setError("");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // FIXED: iPhone first — iPhone does NOT support webm
      const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
      let mimeType = "";
      let ext = "webm";
      
      if (isIOS) {
        if (MediaRecorder.isTypeSupported('audio/mp4')) { mimeType = 'audio/mp4'; ext = 'm4a'; }
        else if (MediaRecorder.isTypeSupported('audio/aac')) { mimeType = 'audio/aac'; ext = 'm4a'; }
      } else {
        if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) { mimeType = 'audio/webm;codecs=opus'; ext = 'webm'; }
        else if (MediaRecorder.isTypeSupported('audio/webm')) { mimeType = 'audio/webm'; ext = 'webm'; }
        else if (MediaRecorder.isTypeSupported('audio/mp4')) { mimeType = 'audio/mp4'; ext = 'm4a'; }
      }

      const options: any = mimeType ? { mimeType } : {};
      const rec = new MediaRecorder(stream, options);
      chunksRef.current = [];
      
      rec.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      
      rec.onstop = () => {
        // Use REAL mimeType from recorder
        const realMime = rec.mimeType || mimeType || 'audio/mp4';
        const realExt = realMime.includes('mp4') || realMime.includes('aac') || realMime.includes('m4a') ? 'm4a' : 'webm';
        const blob = new Blob(chunksRef.current, { type: realMime });
        const file = new File([blob], `yoruba-${word.yoruba}-${Date.now()}.${realExt}`, { type: realMime });
        setAudioFile(file);

        const audioURL = URL.createObjectURL(blob);
        if (audioRef.current) {
          // Revoke old
          if (audioRef.current.src && audioRef.current.src.startsWith('blob:')) URL.revokeObjectURL(audioRef.current.src);
          audioRef.current.src = audioURL;
          audioRef.current.load();
          audioRef.current.onloadeddata = () => console.log("Preview OK:", audioRef.current?.duration);
          audioRef.current.onerror = () => {
            console.error("Preview error", audioRef.current?.error);
            setError("Preview failed on this device - but upload will still work (Cloudinary transcodes)");
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
  const removeAudio = () => { 
    if (audioRef.current?.src?.startsWith('blob:')) URL.revokeObjectURL(audioRef.current.src); 
    if (audioRef.current) audioRef.current.removeAttribute('src'); 
    setAudioFile(null); 
  };

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
      <Link href={`/dictionary/${word.slug}`} className="text- text-black/50 hover:text-black">← Back to {word.yoruba}</Link>
      <div className="bg-white rounded- border border-black/10 p-8 shadow-sm">
        <h1 className="serif text- font-bold text-[#1a4d2e]">{word.yoruba}</h1>
        <div className="text- text-black/60">{word.english}</div>
        {error && <div className="mt-4 bg-red-50 border border-red-200 text-red-700 rounded- p-3 text-">{error}</div>}
        <div className="mt-8 space-y-4">
          <div className="flex gap-3">
            {!isRecording? <button onClick={startRec} className="h-11 px-5 rounded-full bg-[#1a4d2e] text-white text- font-bold">🎙 Record</button> : <button onClick={stopRec} className="h-11 px-5 rounded-full bg-red-600 text-white text-">⏹ Stop {Math.floor(recordTime/60)}:{String(recordTime%60).padStart(2,'0')}</button>}
          </div>
          <div className="bg-[#fafaf7] border border-black/10 rounded- p-3 flex items-center gap-3">
            <audio ref={audioRef} controls playsInline preload="metadata" className="w-full max-w- h-10" />
            {audioFile && <button onClick={removeAudio} className="text- text-red-600 font-bold hover:underline">Remove</button>}
          </div>
          {audioFile && <div className="text- text-black/50">Ready: {audioFile.name} • {(audioFile.size/1024).toFixed(0)}KB • {audioFile.type}</div>}
          <button disabled={!audioFile||uploading} onClick={handleUpload} className="w-full h-12 rounded-full bg-[#f5d547] text-black font-bold text- disabled:opacity-40 hover:bg-[#f5d547]/90">{uploading? "Uploading to Cloudinary...":`Submit audio for "${word.yoruba}"`}</button>
        </div>
      </div>
    </div>
  );
}