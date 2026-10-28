"use client";
import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function ResetForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) { setMsg("Invalid link - no token"); return; }
    if (password.length < 8) { setMsg("Password must be at least 8 characters"); return; }
    if (password !== confirm) { setMsg("Passwords don't match"); return; }
    setLoading(true); setMsg("");
    const res = await fetch("/api/auth/reset-password", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    const data = await res.json(); setLoading(false);
    if (res.ok) { setSuccess(true); setTimeout(()=>router.push("/login?reset=success"),1500); }
    else { setMsg("❌ " + (data.error || "Failed")); }
  }

  return (
    <div className="min-h-screen bg-[#fafaf7] flex flex-col lg:flex-row">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@400;500;600;700&display=swap'); *{font-family:'Inter',sans-serif} .serif{font-family:'Instrument Serif',serif}`}</style>
      <div className="hidden lg:flex flex-1 bg-[#1a4d2e] p-12 flex-col justify-between">
        <Link href="/" className="flex items-center gap-3"><div className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-[#1a4d2e] font-bold">O</div><div className="serif text-white text-">Oro Lexicon</div></Link>
        <div className="max-w-"><h1 className="serif text- leading-[0.9] text-white">Secure<br/><span className="italic font-light text-[#f5d547]">reset</span></h1></div>
        <div className="text- text-white/30">© 2025 oredola.dev</div>
      </div>
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-">
          { !token ? (
            <div className="text-center"><div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">⚠️</div><h2 className="serif text-">Invalid link</h2><Link href="/forgot-password" className="mt-6 inline-flex h- px-6 items-center justify-center rounded-full bg-[#121212] text-white">Request new link</Link></div>
          ) : success ? (
            <div className="text-center"><div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">✓</div><h2 className="serif text-">Password reset!</h2><p className="mt-2 text- text-black/50">Redirecting to login...</p></div>
          ) : (
            <>
              <h2 className="serif text- leading-[0.9]">Set new password</h2>
              <p className="mt-3 text- text-black/50">Choose a strong password — at least 8 characters.</p>
              {msg && <div className="mt-5 rounded- border bg-red-50 border-red-200 text-red-700 text- px-4 py-3">{msg}</div>}
              <form onSubmit={submit} className="mt-6 space-y-4">
                <div><label className="text- font-semibold tracking-widest uppercase text-black/60 mb-2 block">New password</label><input required minLength={8} type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" className="w-full h- rounded-full border border-black/10 px-5" /></div>
                <div><label className="text- font-semibold tracking-widest uppercase text-black/60 mb-2 block">Confirm password</label><input required minLength={8} type="password" value={confirm} onChange={e=>setConfirm(e.target.value)} placeholder="••••••••" className="w-full h- rounded-full border border-black/10 px-5" /></div>
                <button disabled={loading} className="w-full h- rounded-full bg-[#1a4d2e] text-white font-semibold disabled:opacity-50">{loading ? "Resetting..." : "Reset password →"}</button>
              </form>
            </>
          )}
          <Link href="/login" className="mt-8 block text-center text- text-black/40">← Back to login</Link>
        </div>
      </div>
    </div>
  );
}