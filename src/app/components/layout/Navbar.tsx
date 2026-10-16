"use client";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect, useRef } from "react";
import { NotificationBell } from "./NotificationBell"; // FIXED: same folder as Navbar = layout/NotificationBell.tsx

export function Navbar() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const isLoggedIn = !!session?.user;

  const name = (session?.user as any)?.name || session?.user?.email?.split("@")[0] || "Guest";
  const firstName = name.split(" ")[0];
  const initial = firstName.charAt(0).toUpperCase();

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-zinc-200">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@500;600;700&display=swap'); .serif{font-family:'Instrument Serif',serif} *{font-family:'Inter',sans-serif}`}</style>
      <div className="max-w-[1320px] mx-auto px-6 h-[64px] flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#1a4d2e] text-white flex items-center justify-center font-bold">O</div>
          <span className="serif text-[20px] font-bold tracking-tight text-[#121212]">Oro Lexicon</span>
          <span className="text-[10px] font-extrabold tracking-widest uppercase bg-[#f5d547] px-2 py-1 rounded-md text-[#121212]">YORÙBÁ</span>
        </Link>

        <nav className="flex items-center gap-3">
          <Link href="/about" className="hidden md:flex h-9 px-4 rounded-full bg-white border border-zinc-200 text-[13px] font-semibold text-zinc-700 hover:bg-zinc-50 items-center justify-center">About</Link>
          
          {isLoggedIn ? (
            <>
              {/* FIXED: Show bell when logged in */}
              <NotificationBell />

              <div className="relative" ref={ref}>
                <button onClick={() => setOpen(!open)} className="flex items-center gap-2 h-10 pl-1 pr-3 rounded-full border border-zinc-200 bg-white hover:bg-zinc-50 transition">
                  <div className="w-8 h-8 rounded-full bg-[#1a4d2e] text-white flex items-center justify-center font-bold text-[13px]">{initial}</div>
                  <div className="text-left hidden sm:block">
                    <div className="text-[13px] font-bold leading-none text-[#121212]">{firstName.toLowerCase()}</div>
                    <div className="text-[10px] text-zinc-500 leading-none mt-0.5">contributor</div>
                  </div>
                  <span className="text-zinc-400 text-[10px] ml-1">▼</span>
                </button>

                {open && (
                  <div className="absolute right-0 mt-2 w-[260px] bg-white rounded-[16px] border border-zinc-200 shadow-[0_16px_40px_rgba(0,0,0,0.14)] overflow-hidden z-50">
                    <div className="p-4 flex gap-3 border-b border-zinc-100 bg-zinc-50/50">
                      <div className="w-10 h-10 rounded-full bg-[#1a4d2e] text-white flex items-center justify-center font-bold">{initial}</div>
                      <div className="min-w-0">
                        <div className="font-bold text-[14px] text-[#121212]">{firstName}</div>
                        <div className="text-[12px] text-zinc-500 truncate">{session?.user?.email}</div>
                      </div>
                    </div>
                    <div className="p-2">
                      <Link href="/dashboard" onClick={()=>setOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-[10px] hover:bg-zinc-50 text-[13px] font-medium text-[#121212] transition"><span className="w-5 text-center">📊</span> Dashboard</Link>
                      <Link href="/contribute" onClick={()=>setOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-[10px] hover:bg-zinc-50 text-[13px] font-medium text-[#121212] transition"><span className="w-5 text-center">➕</span> Contribute</Link>
                      <Link href="/profile" onClick={()=>setOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-[10px] hover:bg-zinc-50 text-[13px] font-medium text-[#121212] transition"><span className="w-5 text-center">👤</span> My Profile</Link>
                      <div className="h-px bg-zinc-100 my-2" />
                      <button onClick={() => signOut({ callbackUrl: "/" })} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[10px] hover:bg-red-50 text-[13px] font-medium text-red-600 transition"><span className="w-5 text-center">↪</span> Logout</button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link href="/login" className="h-9 px-5 rounded-full bg-[#121212] text-white text-[13px] font-semibold flex items-center justify-center">Login</Link>
              <Link href="/register" className="hidden md:flex h-9 px-4 rounded-full bg-white border border-zinc-200 text-[13px] font-semibold items-center justify-center">Register</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
