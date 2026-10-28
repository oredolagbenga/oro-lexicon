"use client";
import { useState } from "react";
import Link from "next/link";

export default function ForgotForm() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.toLowerCase().trim() }),
    });
    setLoading(false);
    setSent(true);
  }

  return (
    <div className="min-h-screen bg-[#fafaf7] flex flex-col lg:flex-row">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@400;500;600;700&display=swap'); *{font-family:'Inter',sans-serif} .serif{font-family:'Instrument Serif',serif}`}</style>
      <div className="hidden lg:flex flex-1 bg-[#1a4d2e] relative overflow-hidden p-12 flex-col justify-between">
        <div className="absolute -top-[20%] -right-[10%] w-[80%] h-[80%] bg-white/[0.05] rounded-full blur-" />
        <Link href="/" className="relative z-10 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-[#1a4d2e] font-bold">O</div>
          <div className="serif text-white text- leading-none">Oro Lexicon</div>
        </Link>
        <div className="relative z-10 max-w-">
          <h1 className="serif text- leading-[0.9] text-white">Forgot your<br/><span className="italic font-light text-[#f5d547]">password?</span><br/>No worries.</h1>
          <p className="mt-6 text- text-white/60">We&apos;ll send a secure reset link from hello@oredola.dev — valid 1 hour only.</p>
        </div>
        <div className="relative z-10 text- text-white/30">© 2025 oredola.dev</div>
      </div>
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-">
          <Link href="/login" className="inline-flex gap-2 text- text-black/40 hover:text-black mb-6">← Back to login</Link>
          <h2 className="serif text- leading-[0.9] text-[#121212]">Reset password</h2>
          <p className="mt-3 text- text-black/50">Enter your email and we&apos;ll send you a reset link.</p>
          {sent ? (
            <div className="mt-6 rounded- bg-green-50 border border-green-200 p-5">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mb-3">✓</div>
              <h3 className="font-semibold text-">Check your inbox</h3>
              <p className="mt-2 text- text-black/60 leading-[1.6]">If an account exists for <b>{email}</b>, we sent a link from <b>hello@oredola.dev</b>. Check spam too. Link expires in 60 minutes.</p>
              <Link href="/login" className="mt-5 flex h- items-center justify-center rounded-full bg-[#121212] text-white text- font-semibold">Back to login</Link>
            </div>
          ) : (
            <form onSubmit={submit} className="mt-6 space-y-4">
              <div>
                <label className="text- font-semibold tracking-widest uppercase text-black/60 mb-2 block">Email address</label>
                <input required type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="gbenga@oredola.dev" className="w-full h- rounded-full bg-white border border-black/10 px-5 text- focus:outline-none focus:border-[#1a4d2e] focus:ring-4 focus:ring-[#1a4d2e]/10" />
              </div>
              <button disabled={loading} className="w-full h- rounded-full bg-[#1a4d2e] text-white font-semibold shadow-[0_10px_24px_rgba(26,77,46,0.28)] disabled:opacity-50">{loading ? "Sending link..." : "Send reset link →"}</button>
              <p className="text-center text- text-black/40">For security, we never confirm if an email exists.</p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}