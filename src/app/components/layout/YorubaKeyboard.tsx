"use client";
import { useState, useEffect, useRef } from "react";

const LOWER = {
  a: ["a", "á", "à"], e: ["e", "é", "è"], eDot: ["ẹ", "ẹ́", "ẹ̀"],
  i: ["i", "í", "ì"], o: ["o", "ó", "ò"], oDot: ["ọ", "ọ́", "ọ̀"],
  u: ["u", "ú", "ù"], special: ["ṣ", "ń", "ǹ", "ḿ", "m̀", "n"],
};
const UPPER = {
  a: ["A", "Á", "À"], e: ["E", "É", "È"], eDot: ["Ẹ", "Ẹ́", "Ẹ̀"],
  i: ["I", "Í", "Ì"], o: ["O", "Ó", "Ò"], oDot: ["Ọ", "Ọ́", "Ọ̀"],
  u: ["U", "Ú", "Ù"], special: ["Ṣ", "Ń", "Ǹ", "Ḿ", "M̀", "N"],
};

export default function YorubaKeyboard({ onInsert, onClose, visible, anchorRef }: { onInsert: (c: string) => void; onClose?: () => void; visible: boolean; anchorRef?: React.RefObject<HTMLElement>; }) {
  const [isUpper, setIsUpper] = useState(false);
  const [position, setPosition] = useState<{ top: number; left: number; width: number } | null>(null);
  const keyboardRef = useRef<HTMLDivElement>(null);
  const keys = isUpper ? UPPER : LOWER;

  useEffect(() => {
    if (!visible || !anchorRef?.current) { setPosition(null); return; }
    const updatePos = () => {
      if (window.innerWidth < 768) { setPosition(null); return; }
      const rect = anchorRef.current!.getBoundingClientRect();
      const gap = 12; let left = rect.left; let top = rect.bottom + gap;
      let width = Math.max(rect.width, 380); if (width > 420) width = 420;
      const pad = 16;
      if (left + width > window.innerWidth - pad) left = window.innerWidth - width - pad;
      if (left < pad) left = pad;
      const kbHeight = 360;
      if (rect.bottom + kbHeight + gap > window.innerHeight && rect.top > kbHeight) top = rect.top - kbHeight - gap;
      setPosition({ top, left, width });
    };
    updatePos();
    window.addEventListener("resize", updatePos);
    window.addEventListener("scroll", updatePos, true);
    return () => { window.removeEventListener("resize", updatePos); window.removeEventListener("scroll", updatePos, true); };
  }, [visible, anchorRef, isUpper]);

  if (!visible) return null;
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  const KeyboardContent = (
    <>
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <span className="text- font-extrabold tracking-[0.15em] uppercase text-white/60">YORÙBÁ • {isUpper ? "UPPER" : "lower"}</span>
          <span className="text- text-white/30 hidden md:inline">• mid a = unmarked • high á • low à</span>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onMouseDown={e => e.preventDefault()} onClick={() => setIsUpper(!isUpper)} className={`h-8 px-3 rounded-full text- font-extrabold tracking-widest flex items-center gap-1.5 transition ${isUpper ? "bg-[#f5d547] text-black" : "bg-white/10 text-white hover:bg-white/15"}`}>
            <span className="text-">⇧</span> {isUpper ? "UPPER" : "lower"}
          </button>
          <button type="button" onMouseDown={e => e.preventDefault()} onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 text-">✕</button>
        </div>
      </div>
      <div className="space-y-2">
        <div className="grid grid-cols-9 gap-1.5">
          {[...keys.a, ...keys.e, ...keys.eDot].map(k => (
            <button key={k} type="button" onMouseDown={e => e.preventDefault()} onClick={() => onInsert(k)} className="h-11 md:h-10 rounded- bg-white text-[#121212] font-bold text- md:text- hover:bg-[#f5d547] active:scale-95 transition flex items-center justify-center shadow-sm">{k}</button>
          ))}
        </div>
        <div className="grid grid-cols-9 gap-1.5">
          {[...keys.i, ...keys.o, ...keys.oDot].map(k => (
            <button key={k} type="button" onMouseDown={e => e.preventDefault()} onClick={() => onInsert(k)} className="h-11 md:h-10 rounded- bg-white text-[#121212] font-bold text- md:text- hover:bg-[#f5d547] active:scale-95 transition flex items-center justify-center shadow-sm">{k}</button>
          ))}
        </div>
        <div className="grid grid-cols-9 gap-1.5">
          {[...keys.u, ...keys.special].map(k => (
            <button key={k} type="button" onMouseDown={e => e.preventDefault()} onClick={() => onInsert(k)} className="h-11 md:h-10 rounded- bg-zinc-100 md:bg-white text-[#121212] font-bold text- md:text- hover:bg-[#f5d547] active:scale-95 transition flex items-center justify-center shadow-sm border border-black/5">{k}</button>
          ))}
        </div>
      </div>
      <div className="mt-3 grid grid-cols-4 gap-2">
        <button type="button" onMouseDown={e => e.preventDefault()} onClick={() => onInsert(" ")} className="col-span-2 h-11 rounded- bg-white/10 text-white font-bold text- tracking-[0.15em] hover:bg-white/15">SPACE</button>
        <button type="button" onMouseDown={e => e.preventDefault()} onClick={() => onInsert("DEL")} className="h-11 rounded- bg-red-500/20 text-red-200 font-bold text- hover:bg-red-500/30">⌫ DEL</button>
        <button type="button" onMouseDown={e => e.preventDefault()} onClick={() => setIsUpper(!isUpper)} className="h-11 rounded- bg-[#f5d547] text-black font-extrabold text- tracking-widest">⇧ {isUpper ? "lower" : "UPPER"}</button>
      </div>
      <div className="mt-2.5 flex flex-wrap gap-1.5 justify-center md:justify-start">
        <span className="text- text-white/30 uppercase tracking-widest">Quick:</span>
        {["ẹ́", "ẹ̀", "ọ́", "ọ̀", "ṣ"].map(q => (
          <button key={q} type="button" onMouseDown={e => e.preventDefault()} onClick={() => onInsert(q)} className="text- px-2 py-1 rounded-full bg-white/10 text-white/70 hover:bg-white/20">+{q}</button>
        ))}
      </div>
    </>
  );

  // FIXED beautiful look: rounded-t- and max-w-
  if (isMobile || !position) {
    return (
      <div ref={keyboardRef} data-yoruba-keyboard className="fixed bottom-0 left-0 right-0 z-[9999] bg-[#121212] border-t border-zinc-800 rounded-t- p-2.5 pb-[max(12px,env(safe-area-inset-bottom))] shadow-[0_-12px_40px_rgba(0,0,0,0.4)] animate-in slide-in-from-bottom duration-300 md:hidden w-full max-w- overflow-hidden touch-manipulation">
        <div className="w-10 h-1 rounded-full bg-white/20 mx-auto mb-2.5" />
        <div className="w-full max-w- mx-auto">{KeyboardContent}</div>
      </div>
    );
  }

  return (
    <div ref={keyboardRef} data-yoruba-keyboard className="fixed z-[9999] bg-[#121212] rounded- border border-zinc-800 p-4 shadow-[0_20px_60px_rgba(0,0,0,0.5)] animate-in fade-in zoom-in-95 duration-200 hidden md:block" style={{ top: position.top, left: position.left, width: position.width }}>
      <div className="absolute -top-2 left-8 w-4 h-4 bg-[#121212] border-l border-t border-zinc-800 rotate-45" />
      {KeyboardContent}
    </div>
  );
}