"use client";
import { useState, useEffect, useRef } from "react";

const LOWER = {
  a: ["a", "á", "à"],
  e: ["e", "é", "è"],
  eDot: ["ẹ", "ẹ́", "ẹ̀"],
  i: ["i", "í", "ì"],
  o: ["o", "ó", "ò"],
  oDot: ["ọ", "ọ́", "ọ̀"],
  u: ["u", "ú", "ù"],
  special: ["ṣ", "ń", "ǹ", "ḿ", "m̀", "n"],
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
  const keyboardRef = useRef<HTMLDivElement>(null);
  const keys = isUpper ? UPPER : LOWER;

  useEffect(() => {
    if (!visible) return;
    const handleOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (keyboardRef.current?.contains(target)) return;
      if (anchorRef?.current?.contains(target)) return;
      if (target.closest("[data-yoruba-keyboard]")) return;
      // If clicking another Yoruba input, don't close here — let onFocus switch
      if (target.closest("input") || target.closest("textarea")) return;
      onClose?.();
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [visible, onClose, anchorRef]);

  if (!visible) return null;

  return (
    <div ref={keyboardRef} data-yoruba-keyboard className="relative mt-3 w-full bg-[#121212] rounded- border border-zinc-800 p-3 shadow-[0_8px_32px_rgba(0,0,0,0.15)] animate-in fade-in slide-in-from-top-2 duration-200">
      <div className="flex justify-between items-center mb-3">
        <span className="text- font-extrabold tracking-[0.15em] uppercase text-white/60">YORÙBÁ • {isUpper ? "UPPER" : "lower"}</span>
        <div className="flex items-center gap-2">
          <button type="button" onMouseDown={e => e.preventDefault()} onClick={() => setIsUpper(!isUpper)} className={`h-8 px-3 rounded-full text- font-extrabold tracking-widest ${isUpper ? "bg-[#f5d547] text-black" : "bg-white/10 text-white hover:bg-white/15"}`}>
            ⇧ {isUpper ? "UPPER" : "lower"}
          </button>
          <button type="button" onMouseDown={e => e.preventDefault()} onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 text-">✕</button>
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="grid grid-cols-9 gap-1">
          {[...keys.a, ...keys.e, ...keys.eDot].map(k => (
            <button key={k} type="button" onMouseDown={e => e.preventDefault()} onClick={() => onInsert(k)} className="h- rounded- bg-white text-[#121212] font-bold text- hover:bg-[#f5d547] active:scale-95 flex items-center justify-center shadow-sm">
              {k}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-9 gap-1">
          {[...keys.i, ...keys.o, ...keys.oDot].map(k => (
            <button key={k} type="button" onMouseDown={e => e.preventDefault()} onClick={() => onInsert(k)} className="h- rounded- bg-white text-[#121212] font-bold text- hover:bg-[#f5d547] active:scale-95 flex items-center justify-center shadow-sm">
              {k}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-9 gap-1">
          {[...keys.u, ...keys.special].map(k => (
            <button key={k} type="button" onMouseDown={e => e.preventDefault()} onClick={() => onInsert(k)} className="h- rounded- bg-white text-[#121212] font-bold text- hover:bg-[#f5d547] active:scale-95 flex items-center justify-center shadow-sm border border-black/5">
              {k}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-3 grid grid-cols-4 gap-1.5">
        <button type="button" onMouseDown={e => e.preventDefault()} onClick={() => onInsert(" ")} className="col-span-2 h- rounded- bg-white/10 text-white font-bold text- tracking-[0.15em] hover:bg-white/15">SPACE</button>
        <button type="button" onMouseDown={e => e.preventDefault()} onClick={() => onInsert("DEL")} className="h- rounded- bg-red-500/20 text-red-200 font-bold text- hover:bg-red-500/30">⌫ DEL</button>
        <button type="button" onMouseDown={e => e.preventDefault()} onClick={() => setIsUpper(!isUpper)} className="h- rounded- bg-[#f5d547] text-black font-extrabold text- tracking-widest">⇧ {isUpper ? "lower" : "UPPER"}</button>
      </div>
    </div>
  );
}