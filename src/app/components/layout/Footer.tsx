import Link from "next/link";

export function Footer({ totalWords }: { totalWords: number }) {
  return (
    <footer className="bg-[#0f1e13] text-white">
      <div className="max-w-[1240px] mx-auto px-6 py-14">
        <div className="grid md:grid-cols-[1.6fr_1fr_1fr_1.2fr] gap-10">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-[12px] bg-[#1a4d2e] flex items-center justify-center font-bold text-white">Ò</div>
              <div>
                <div className="font-bold text-[16px] serif">Oro Lexicon</div>
                <div className="text-[11px] text-white/50 tracking-wide">Yoruba Preservation Project</div>
              </div>
            </div>
            <p className="mt-4 text-[14px] leading-[1.6] text-white/60 max-w-[34ch]">
              Preserving Yoruba language for future generations. A community-driven dictionary built by <span className="text-white">Oredola Gbenga Augustine</span> for culture.
            </p>
            <div className="mt-6 flex gap-2">
              <a href="https://oredola.dev" className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/15 flex items-center justify-center text-[12px] transition">↗</a>
              <a href="https://github.com" className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/15 flex items-center justify-center text-[12px] transition">GH</a>
              <a href="mailto:gbenga@oredola.dev" className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/15 flex items-center justify-center text-[12px] transition">✉</a>
            </div>
          </div>

          <div>
            <div className="font-bold text-[11px] tracking-widest uppercase text-white/30">Platform</div>
            <div className="mt-4 space-y-2.5 text-[14px] text-white/60">
              <Link href="/dictionary" className="block hover:text-white">Dictionary</Link>
              <Link href="/about" className="block hover:text-white">About Us</Link>
              <Link href="/dashboard" className="block hover:text-white">Dashboard</Link>
              <Link href="/contributors" className="block hover:text-white">Contributors</Link>
            </div>
          </div>

          <div>
            <div className="font-bold text-[11px] tracking-widest uppercase text-white/30">Support</div>
            <div className="mt-4 space-y-2.5 text-[14px] text-white/60">
              <div className="hover:text-white cursor-pointer">Help Center</div>
              <div className="hover:text-white cursor-pointer">Contact Us</div>
              <div className="hover:text-white cursor-pointer">Privacy Policy</div>
              <div className="hover:text-white cursor-pointer">Terms of Use</div>
            </div>
          </div>

          <div>
            <div className="font-bold text-[11px] tracking-widest uppercase text-white/30">Built with love</div>
            <p className="mt-4 text-[14px] text-white/60 leading-[1.5]">Crafted by <span className="text-white font-semibold">Gbenga Oredola</span> and community worldwide.</p>
            <div className="mt-4 bg-white/[0.06] border border-white/10 rounded-[14px] p-4">
              <div className="text-[10px] tracking-widest uppercase text-white/30 font-bold">Live Dictionary</div>
              <div className="text-[22px] font-bold mt-1">{totalWords} Words</div>
              <div className="text-[11px] text-white/40 mt-1">lexicon.oredola.dev</div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between gap-3 text-[13px] text-white/40">
          <div>© {new Date().getFullYear()} Oro Lexicon by Oredola Gbenga. All rights reserved.</div>
          <div>Yoruba Preservation • v3.0 Premium • oredola.dev</div>
        </div>
      </div>
    </footer>
  );
}
