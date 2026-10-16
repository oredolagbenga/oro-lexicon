"use client";
import { useState, useEffect, useRef } from "react";

// Complete Yoruba tone set - your good version
const LOWER = {
  a: ["a", "á", "à"],
  e: ["e", "é", "è"],
  eDot: ["ẹ", "ẹ́", "ẹ̀"],
  i: ["i", "í", "ì"],
  o: ["o", "ó", "ò"],
  oDot: ["ọ", "ọ́", "ọ̀"],
  u: ["u", "ú", "ù"],
  special: ["ṣ", "ń", "ǹ", "ḿ", "m̀", "n"],
};

const UPPER = {
  a: ["A", "Á", "À"],
  e: ["E", "É", "È"],
  eDot: ["Ẹ", "Ẹ́", "Ẹ̀"],
  i: ["I", "Í", "Ì"],
  o: ["O", "Ó", "Ò"],
  oDot: ["Ọ", "Ọ́", "Ọ̀"],
  u: ["U", "Ú", "Ù"],
  special: ["Ṣ", "Ń", "Ǹ", "Ḿ", "M̀", "N"],
};

export default function YorubaKeyboard({ 
  onInsert, 
  onClose, 
  visible,
  anchorRef,
}: { 
  onInsert: (c: string) => void; 
  onClose?: () => void;
  visible: boolean;
  anchorRef?: React.RefObject<HTMLElement>;
}) {
  const [isUpper, setIsUpper] = useState(false);
  const [position, setPosition] = useState<{ top: number; left: number; width: number } | null>(null);
  const keyboardRef = useRef<HTMLDivElement>(null);

  const keys = isUpper ? UPPER : LOWER;

  // FIXED: Position for laptop - use fixed viewport coords, not absolute + scrollY
  useEffect(() => {
    if (!visible || !anchorRef?.current) {
      setPosition(null);
      return;
    }
    const updatePos = () => {
      // Mobile = fixed bottom sheet (keep your good version)
      if (window.innerWidth < 768) {
        setPosition(null);
        return;
      }
      const rect = anchorRef.current!.getBoundingClientRect();
      const kbWidth = 400;
      const gap = 12;
      let left = rect.left;
      let top = rect.bottom + gap; // FIXED: viewport coords, no scrollY
      let width = Math.max(rect.width, 380); // at least 380 so 9 cols fit, not cramped
      if (width > 420) width = 420;

      // Keep inside viewport
      const pad = 16;
      if (left + width > window.innerWidth - pad) {
        left = window.innerWidth - width - pad;
      }
      if (left < pad) left = pad;

      // Flip above if near bottom of screen
      const kbHeight = 360;
      if (rect.bottom + kbHeight + gap > window.innerHeight && rect.top > kbHeight) {
        top = rect.top - kbHeight - gap;
      }

      setPosition({ top, left, width });
    };
    updatePos();
    window.addEventListener("resize", updatePos);
    window.addEventListener("scroll", updatePos, true);
    return () => {
      window.removeEventListener("resize", updatePos);
      window.removeEventListener("scroll", updatePos, true);
    };
  }, [visible, anchorRef, isUpper]);

  if (!visible) return null;

  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  const KeyboardContent = (
    <>
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-extrabold tracking-[0.15em] uppercase text-white/60">YORÙBÁ • {isUpper ? "UPPER" : "lower"}</span>
          <span className="text-[10px] text-white/30 hidden md:inline">• mid a = unmarked • high á • low à</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onMouseDown={e => e.preventDefault()}
            onClick={() => setIsUpper(!isUpper)}
            className={`h-8 px-3 rounded-full text-[11px] font-extrabold tracking-widest flex items-center gap-1.5 transition ${isUpper ? "bg-[#f5d547] text-black" : "bg-white/10 text-white hover:bg-white/15"}`}
          >
            <span className="text-[14px]">⇧</span> {isUpper ? "UPPER" : "lower"}
          </button>
          <button type="button" onMouseDown={e => e.preventDefault()} onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 text-[12px]">✕</button>
        </div>
      </div>

      <div className="space-y-2">
        <div className="grid grid-cols-9 gap-1.5">
          {[...keys.a, ...keys.e, ...keys.eDot].map(k => (
            <button 
              key={k} 
              type="button" 
              onMouseDown={e => e.preventDefault()} // FIX: keep focus, so insert works
              onClick={() => onInsert(k)} 
              className="h-11 md:h-10 rounded-[10px] bg-white text-[#121212] font-bold text-[16px] md:text-[14px] hover:bg-[#f5d547] active:scale-95 transition flex items-center justify-center shadow-sm"
            >
              {k}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-9 gap-1.5">
          {[...keys.i, ...keys.o, ...keys.oDot].map(k => (
            <button 
              key={k} 
              type="button" 
              onMouseDown={e => e.preventDefault()}
              onClick={() => onInsert(k)} 
              className="h-11 md:h-10 rounded-[10px] bg-white text-[#121212] font-bold text-[16px] md:text-[14px] hover:bg-[#f5d547] active:scale-95 transition flex items-center justify-center shadow-sm"
            >
              {k}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-9 gap-1.5">
          {[...keys.u, ...keys.special].map(k => (
            <button 
              key={k} 
              type="button" 
              onMouseDown={e => e.preventDefault()}
              onClick={() => onInsert(k)} 
              className="h-11 md:h-10 rounded-[10px] bg-zinc-100 md:bg-white text-[#121212] font-bold text-[16px] md:text-[14px] hover:bg-[#f5d547] active:scale-95 transition flex items-center justify-center shadow-sm border border-black/5"
            >
              {k}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-3 grid grid-cols-4 gap-2">
        <button type="button" onMouseDown={e => e.preventDefault()} onClick={() => onInsert(" ")} className="col-span-2 h-11 rounded-[10px] bg-white/10 text-white font-bold text-[12px] tracking-[0.15em] hover:bg-white/15">SPACE</button>
        <button type="button" onMouseDown={e => e.preventDefault()} onClick={() => onInsert("DEL")} className="h-11 rounded-[10px] bg-red-500/20 text-red-200 font-bold text-[12px] hover:bg-red-500/30">⌫ DEL</button>
        <button type="button" onMouseDown={e => e.preventDefault()} onClick={() => setIsUpper(!isUpper)} className="h-11 rounded-[10px] bg-[#f5d547] text-black font-extrabold text-[11px] tracking-widest">⇧ {isUpper ? "lower" : "UPPER"}</button>
      </div>

      <div className="mt-2.5 flex flex-wrap gap-1.5 justify-center md:justify-start">
        <span className="text-[9px] text-white/30 uppercase tracking-widest">Quick:</span>
        {["ẹ́", "ẹ̀", "ọ́", "ọ̀", "ṣ"].map(q => (
          <button key={q} type="button" onMouseDown={e => e.preventDefault()} onClick={() => onInsert(q)} className="text-[10px] px-2 py-1 rounded-full bg-white/10 text-white/70 hover:bg-white/20">+{q}</button>
        ))}
      </div>
    </>
  );

  // Mobile: fixed bottom sheet - your good version, untouched
  if (isMobile || !position) {
    return (
      <div ref={keyboardRef} className="fixed bottom-0 left-0 right-0 z-[9999] bg-[#121212] border-t border-zinc-800 rounded-t-[20px] p-3 pb-[max(12px,env(safe-area-inset-bottom))] shadow-[0_-12px_40px_rgba(0,0,0,0.4)] animate-in slide-in-from-bottom duration-300 md:hidden">
        <div className="w-10 h-1 rounded-full bg-white/20 mx-auto mb-3" />
        <div className="max-w-[480px] mx-auto">
          {KeyboardContent}
        </div>
      </div>
    );
  }

  // Desktop: FIXED position directly below Yoruba box, black bg white text
  return (
    <div
      ref={keyboardRef}
      className="fixed z-[9999] bg-[#121212] rounded-[18px] border border-zinc-800 p-4 shadow-[0_20px_60px_rgba(0,0,0,0.5)] animate-in fade-in zoom-in-95 duration-200 hidden md:block"
      style={{ top: position.top, left: position.left, width: position.width }}
    >
      {/* Arrow pointing to input */}
      <div className="absolute -top-2 left-8 w-4 h-4 bg-[#121212] border-l border-t border-zinc-800 rotate-45" />
      {KeyboardContent}
    </div>
  );
}
