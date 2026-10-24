"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const searchParams = useSearchParams();
  const registered = searchParams.get("registered");

     async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const cleanEmail = email.toLowerCase().trim();
    const res = await signIn("credentials", { 
      email: cleanEmail, 
      password, 
      redirect: false 
    });

    if (res?.error) {
      setError("Invalid email or password. Please try again.");
      setLoading(false);
      return;
    }

    if (res?.ok) {
      window.location.href = "/dashboard";
      return;
    }

    setError("Invalid email or password. Please try again.");
    setLoading(false);
  }
   
  return (
    <div className="min-h-screen bg-[#fafaf7] flex flex-col lg:flex-row">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@400;500;600;700&display=swap');
        * { font-family: 'Inter', sans-serif; }
        .serif { font-family: 'Instrument Serif', serif; }
      `}</style>

      {/* Desktop Left - Brand */}
      <div className="hidden lg:flex flex-1 bg-[#1a4d2e] relative overflow-hidden p-8 xl:p-12 flex-col justify-between">
        <div className="absolute -top-[20%] -right-[10%] w-[80%] h-[80%] bg-white/[0.05] rounded-full blur-[80px]" />
        <div className="absolute top-[40%] -left-[10%] w-[60%] h-[60%] bg-[#f5d547]/10 rounded-full blur-[80px]" />

        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-[#1a4d2e] font-bold text-[15px]">O</div>
            <div>
              <div className="serif text-white text-[20px] leading-none">Oro Lexicon</div>
              <div className="text-[10px] tracking-widest uppercase text-white/40 font-medium">by Oredola Gbenga</div>
            </div>
          </Link>
        </div>

        <div className="relative z-10 max-w-[420px]">
          <h1 className="serif text-[52px] xl:text-[56px] leading-[0.9] tracking-[-0.03em] text-white">
            Preserve the<br />
            <span className="italic font-light text-[#f5d547]">words that</span><br />
            shaped us.
          </h1>
          <p className="mt-6 text-[15px] leading-[1.6] text-white/60 max-w-[36ch]">
            Built by Oredola Gbenga Augustine to preserve Egba, Ijebu and Standard Yorùbá — with audio, IPA and living examples.
          </p>

          <div className="mt-10 flex gap-3 items-center">
            <div className="flex -space-x-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-8 h-8 rounded-full bg-white/20 border-2 border-[#1a4d2e] backdrop-blur flex items-center justify-center text-[11px] font-bold text-white">
                  {String.fromCharCode(64 + i)}
                </div>
              ))}
            </div>
            <div className="text-[12px] text-white/50 leading-tight">
              Trusted by linguists from<br />
              <span className="text-white/80 font-medium">Unilag, OAU, UI</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between text-[11px] text-white/30">
          <span>© 2025 oredola.dev</span>
          <span className="tracking-widest uppercase">Yorùbá Living Archive</span>
        </div>
      </div>

      {/* Mobile Top Bar */}
      <div className="lg:hidden flex items-center justify-between px-6 py-4 bg-white border-b border-black/[0.06] sticky top-0 z-20">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#1a4d2e] flex items-center justify-center text-white font-bold text-[13px]">O</div>
          <div>
            <div className="serif text-[16px] leading-none text-[#121212]">Oro Lexicon</div>
            <div className="text-[9px] tracking-widest uppercase text-black/40 font-medium">by Oredola Gbenga</div>
          </div>
        </Link>
        <div className="text-[10px] tracking-widest uppercase bg-[#f5d547] px-2.5 py-1 rounded-full font-bold text-[#121212]">YORÙBÁ</div>
      </div>

      {/* Right - Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 md:p-10 lg:p-12 bg-[#fafaf7]">
        <div className="w-full max-w-[420px]">
          <div className="mb-7">
            <h2 className="serif text-[34px] sm:text-[40px] leading-[0.9] tracking-[-0.02em] text-[#121212]">Welcome back</h2>
            <p className="mt-3 text-[14px] sm:text-[15px] leading-[1.5] text-black/50">
              Sign in to continue preserving Yorùbá dialects
            </p>
          </div>

          {registered && (
            <div className="mb-5 rounded-[14px] bg-green-50 border border-green-200 text-green-800 text-[13px] px-4 py-3">
              Account created! Please sign in.
            </div>
          )}

          {error && (
            <div className="mb-5 rounded-[14px] bg-red-50 border border-red-200 text-red-700 text-[13px] px-4 py-3 leading-[1.4]">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label htmlFor="email" className="text-[11px] font-semibold tracking-widest uppercase text-black/60 mb-2 block">
                Email address
              </label>
              <input
                id="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="gbenga@oredola.dev"
                className="w-full h-[52px] rounded-full bg-white border border-black/10 px-5 text-[15px] text-[#121212] placeholder:text-black/25 focus:outline-none focus:border-[#1a4d2e] focus:ring-4 focus:ring-[#1a4d2e]/10 transition"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="password" className="text-[11px] font-semibold tracking-widest uppercase text-black/60">
                  Password
                </label>
                <Link href="/forgot-password" className="text-[11px] font-medium text-black/40 hover:text-black transition">
                  Forgot?
                </Link>
              </div>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-[52px] rounded-full bg-white border border-black/10 px-5 text-[15px] text-[#121212] placeholder:text-black/25 focus:outline-none focus:border-[#1a4d2e] focus:ring-4 focus:ring-[#1a4d2e]/10 transition"
              />
            </div>

            <button
              disabled={loading}
              type="submit"
              className="w-full h-[52px] rounded-full bg-[#1a4d2e] hover:bg-[#143d24] active:bg-[#0f2e1b] text-white text-[15px] font-semibold tracking-wide shadow-[0_10px_24px_rgba(26,77,46,0.28)] transition disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? "Signing in..." : "Sign in →"}
            </button>
          </form>

          <div className="mt-6 flex items-center gap-4">
            <div className="h-px flex-1 bg-black/10" />
            <span className="text-[11px] tracking-widest uppercase text-black/30">or</span>
            <div className="h-px flex-1 bg-black/10" />
          </div>

          <p className="mt-6 text-center text-[14px] text-black/50">
            No account?{" "}
            <Link href="/register" className="font-semibold text-[#121212] underline underline-offset-4 hover:text-[#1a4d2e] transition">
              Create account
            </Link>
          </p>

          <div className="mt-8 rounded-[16px] bg-white border border-black/[0.06] shadow-[0_4px_16px_rgba(0,0,0,0.03)] p-4 flex gap-3">
            <div className="w-8 h-8 rounded-full bg-[#f5d547] flex items-center justify-center text-[14px] shrink-0">🔒</div>
            <div>
              <div className="text-[12px] font-semibold text-[#121212]">Secure & private</div>
              <div className="text-[12px] leading-[1.5] text-black/50 mt-1">
                Your data is protected. We never share your email. Built with NextAuth.js.
              </div>
            </div>
          </div>

          <p className="mt-6 text-center text-[10px] tracking-wide text-black/30 leading-[1.5]">
            Protected by reCAPTCHA • Built by Oredola Gbenga Augustine • <Link href="https://oredola.dev" className="underline hover:text-black/60">oredola.dev</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
