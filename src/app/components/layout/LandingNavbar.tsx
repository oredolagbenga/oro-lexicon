import Link from "next/link";

export function LandingNavbar() {
  return (
    <header className="sticky top-0 z-50 bg-[#fafaf7]/80 backdrop-blur-xl border-b border-black/[0.06]">
      <div className="max-w- mx-auto px-6 h- flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#1a4d2e] text-white flex items-center justify-center font-bold text-">O</div>
          <span className="serif text- font-bold tracking-tight" style={{fontFamily:'Instrument Serif, serif'}}>Oro Lexicon</span>
          <span className="text- font-bold tracking-widest uppercase bg-[#f5d547] px-1.5 py-0.5 rounded ml-1">Yorùbá</span>
        </Link>
        <nav className="flex items-center gap-2">
          <Link href="/dictionary" className="h-9 px-4 rounded-full bg-white border border-black/5 text- font-medium flex items-center">Dictionary</Link>
          <Link href="/contribute" className="hidden md:flex h-9 px-4 rounded-full bg-white border border-black/5 text- font-medium flex items-center">Contribute</Link>
          <Link href="/login" className="h-9 px-5 rounded-full bg-[#121212] text-white text- font-semibold flex items-center">Login</Link>
        </nav>
      </div>
    </header>
  );
}