"use client";
import { useState, useRef } from "react";

type Audio = { id: string; secureUrl: string; contributor?: { name: string | null } };

export function WordAudioPlayer({ audios, variant = "big" }: { audios: Audio[]; variant?: "big" | "list" }) {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const play = (audio: Audio) => {
    if (audioRef.current) {
      if (playingId === audio.id) {
        audioRef.current.pause();
        setPlayingId(null);
        return;
      }
      audioRef.current.pause();
    }
    const el = new Audio(audio.secureUrl);
    el.onended = () => setPlayingId(null);
    el.onerror = () => setPlayingId(null);
    el.play();
    audioRef.current = el;
    setPlayingId(audio.id);
  };

  if (audios.length === 0) return null;

  if (variant === "big") {
    return (
      <>
        <button
          onClick={() => play(audios[0])}
          className={`w-11 h-11 rounded-full flex items-center justify-center shadow-[0_4px_12px_rgba(245,213,71,0.3)] transition hover:scale-105 active:scale-95 ${
            playingId ? "bg-[#1a4d2e] text-white" : "bg-[#f5d547] hover:bg-[#f2c840]"
          }`}
          title={playingId ? "Stop" : "Play pronunciation"}
        >
          {playingId ? "■" : "▶"}
        </button>
        <audio className="hidden" />
      </>
    );
  }

  return (
    <div className="space-y-3">
      {audios.map((a) => (
        <div key={a.id} className={`flex items-center gap-4 rounded-full px-4 py-3 border transition ${playingId === a.id ? "bg-[#1a4d2e] text-white border-[#1a4d2e]" : "bg-[#f5f7f0] border-[#1a4d2e]/10"}`}>
          <button
            onClick={() => play(a)}
            className={`w-9 h-9 rounded-full flex items-center justify-center text-[12px] transition hover:scale-105 ${playingId === a.id ? "bg-white text-[#1a4d2e]" : "bg-[#1a4d2e] text-white"}`}
          >
            {playingId === a.id ? "■" : "▶"}
          </button>
          <div className="flex-1 flex items-center gap-2">
            <div className={`flex gap-[2px] items-end ${playingId === a.id ? "opacity-100" : "opacity-40"}`}>
              {[6,10,14,8,12,6,16].map((h,i) => (
                <div key={i} className={`w-[3px] rounded-full ${playingId === a.id ? "bg-white animate-[bounce_0.6s_infinite]" : "bg-[#1a4d2e]"} ${playingId === a.id ? `animate-[bounce_0.6s_${i*0.1}s_infinite]` : ""}`} style={{ height: `${h}px` }} />
              ))}
            </div>
            <span className={`text-[12px] font-medium ${playingId === a.id ? "text-white" : "text-black/60"}`}>{playingId === a.id ? "Playing..." : "Play pronunciation"}</span>
          </div>
          <div className={`text-[11px] hidden md:block ${playingId === a.id ? "text-white/70" : "text-black/40"}`}>by {a.contributor?.name || "Community"}</div>
        </div>
      ))}
    </div>
  );
}
