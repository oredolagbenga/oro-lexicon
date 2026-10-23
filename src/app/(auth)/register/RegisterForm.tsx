"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterForm() {
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.password !== form.confirm) {
      setError("Passwords don't match");
      return;
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          confirmPassword: form.confirm,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      router.push("/login?registered=true");
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-[#fafaf7] flex flex-col lg:flex-row">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@400;500;600;700&display=swap');
        * { font-family: 'Inter', sans-serif; }
        .serif { font-family: 'Instrument Serif', serif; }
      `}</style>

      {/* Left - Branding, hides on mobile but shows compact top bar instead */}
      <div className="lg:flex hidden flex-1 bg-[#1a4d2e] relative overflow-hidden p-8 xl:p-12 flex-col justify-between">
        <div className="absolute -top-[15%] -right-[10%] w-[70%] h-[70%] bg-white/[0.06] rounded-full blur-[60px]" />
        <div className="absolute top-[35%] -left-[15%] w-[80%] h-[80%] bg-[#f5d547]/10 rounded-full blur-[80px]" />

        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-[#1a4d2e] font-bold text-[15px]">O</div>
            <div>
              <div className="serif text-white text-[20px] leading-none">Oro Lexicon</div>
              <div className="text-[10px] tracking-widest uppercase text-white/40 -mt-1">by Oredola Gbenga</div>
            </div>
          </Link>
        </div>

        <div className="relative z-10 max-w-[420px]">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/10 backdrop-blur px-3 py-1.5 text-[10px] tracking-widest font-semibold uppercase text-white">
            <span className="w-1.5 h-1.5 bg-[#f5d547] rounded-full animate-pulse" /> 1,247 words preserved • open
          </div>
          <h1 className="serif text-[52px] xl:text-[56px] leading-[0.9] tracking-[-0.03em] text-white mt-6">
            Your grandmother&apos;s<br />
            <span className="italic font-light text-[#f5d547]">word matters.</span>
          </h1>
          <p className="mt-5 text-[15px] leading-[1.6] text-white/60 max-w-[36ch]">
            Built by Oredola Gbenga Augustine to preserve Egba, Ijebu and Standard Yorùbá — with audio, IPA and living examples.
          </p>

          <div className="mt-8 grid grid-cols-3 gap-3 max-w-[360px]">
            {[
              { k: "3", v: "dialects" },
              { k: "42", v: "contributors" },
              { k: "100%", v: "open" },
            ].map((s) => (
              <div key={s.k} className="rounded-[14px] bg-white/5 border border-white/10 p-3 text-center backdrop-blur">
                <div className="serif text-[22px] text-white leading-none">{s.k}</div>
                <div className="text-[10px] uppercase tracking-widest text-white/40 mt-1">{s.v}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between text-[11px] text-white/30">
          <span>© 2025 Oredola.dev</span>
          <span className="tracking-widest uppercase">Yorùbá Living Archive</span>
        </div>
      </div>

      {/* Mobile top bar */}
      <div className="lg:hidden flex items-center justify-between px-6 py-5 bg-white border-b border-black/5">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#1a4d2e] flex items-center justify-center text-white font-bold text-[13px]">O</div>
          <div>
            <div className="serif text-[16px] leading-none">Oro Lexicon</div>
            <div className="text-[9px] tracking-widest uppercase text-black/40 -mt-0.5">by Oredola Gbenga A.</div>
          </div>
        </Link>
        <div className="text-[10px] tracking-widest uppercase bg-[#f5d547] px-2.5 py-1 rounded-full font-bold">YORÙBÁ</div>
      </div>

      {/* Right - Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 md:p-12 bg-[#fafaf7]">
        <div className="w-full max-w-[420px]">
          <div className="mb-7">
            <h2 className="serif text-[36px] sm:text-[40px] leading-[0.9] tracking-[-0.02em] text-[#121212]">Create account</h2>
            <p className="mt-3 text-[14px] sm:text-[15px] leading-[1.5] text-black/50">
              Join the living archive. Takes <span className="font-semibold text-black">30 seconds</span> — no spam.
            </p>
          </div>

          {error && (
            <div className="mb-5 rounded-[14px] bg-red-50 border border-red-200 text-red-700 text-[13px] px-4 py-3 leading-[1.4]">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label htmlFor="name" className="text-[11px] font-semibold tracking-widest uppercase text-black/60 mb-2 block">
                Full name
              </label>
              <input
                id="name"
                autoComplete="name"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Gbenga Oredola"
                className="w-full h-[52px] rounded-full bg-white border border-black/10 px-5 text-[15px] text-[#121212] placeholder:text-black/25 focus:outline-none focus:border-[#1a4d2e] focus:ring-4 focus:ring-[#1a4d2e]/10 transition"
              />
            </div>

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
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="gbenga@oredola.dev"
                className="w-full h-[52px] rounded-full bg-white border border-black/10 px-5 text-[15px] text-[#121212] placeholder:text-black/25 focus:outline-none focus:border-[#1a4d2e] focus:ring-4 focus:ring-[#1a4d2e]/10 transition"
              />
              <p className="mt-2 text-[11px] text-black/40 px-1">Use your university or personal email — we&apos;ll never share it.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="password" className="text-[11px] font-semibold tracking-widest uppercase text-black/60 mb-2 block">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="8+ characters"
                  className="w-full h-[52px] rounded-full bg-white border border-black/10 px-5 text-[15px] text-[#121212] placeholder:text-black/25 focus:outline-none focus:border-[#1a4d2e] focus:ring-4 focus:ring-[#1a4d2e]/10 transition"
                />
              </div>
              <div>
                <label htmlFor="confirm" className="text-[11px] font-semibold tracking-widest uppercase text-black/60 mb-2 block">
                  Confirm
                </label>
                <input
                  id="confirm"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={form.confirm}
                  onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                  placeholder="Repeat"
                  className="w-full h-[52px] rounded-full bg-white border border-black/10 px-5 text-[15px] text-[#121212] placeholder:text-black/25 focus:outline-none focus:border-[#1a4d2e] focus:ring-4 focus:ring-[#1a4d2e]/10 transition"
                />
              </div>
            </div>

            <label className="flex gap-3 items-start pt-2 cursor-pointer">
              <input type="checkbox" required className="mt-1 w-4 h-4 rounded border-black/20 text-[#1a4d2e] focus:ring-[#1a4d2e]/20" />
              <span className="text-[12px] leading-[1.5] text-black/60">
                I agree to the <Link href="#" className="underline underline-offset-4 font-medium text-[#121212]">Terms</Link> and{" "}
                <Link href="#" className="underline underline-offset-4 font-medium text-[#121212]">Community Guidelines</Link> for dialect preservation.
              </span>
            </label>

            <button
              disabled={loading}
              type="submit"
              className="w-full h-[52px] rounded-full bg-[#1a4d2e] hover:bg-[#143d24] active:bg-[#0f2e1b] text-white text-[15px] font-semibold tracking-wide shadow-[0_10px_24px_rgba(26,77,46,0.28)] transition disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? "Creating account..." : "Create account →"}
            </button>
          </form>

          <div className="mt-6 flex items-center gap-4">
            <div className="h-px flex-1 bg-black/10" />
            <span className="text-[11px] tracking-widest uppercase text-black/30">or</span>
            <div className="h-px flex-1 bg-black/10" />
          </div>

          <p className="mt-6 text-center text-[14px] text-black/50">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-[#121212] underline underline-offset-4 hover:text-[#1a4d2e] transition">
              Sign in
            </Link>
          </p>

          <div className="mt-8 rounded-[16px] bg-white border border-black/[0.06] p-4 flex gap-3">
            <div className="w-8 h-8 rounded-full bg-[#f5d547] flex items-center justify-center text-[14px] shrink-0">🎙</div>
            <div>
              <div className="text-[12px] font-semibold text-[#121212]">Why we need you</div>
              <div className="text-[12px] leading-[1.5] text-black/50 mt-1">
                Yorùbá has 3+ living dialects. Without recordings, they disappear. Your voice keeps them alive.
              </div>
            </div>
          </div>

          <p className="mt-6 text-center text-[10px] tracking-wide text-black/30 leading-[1.5]">
            Protected by reCAPTCHA • Built by Oredola Gbenga Augustine • <Link href="https://oredola.dev" className="underline">oredola.dev</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
