"use client";
import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

export const dynamic = 'force-dynamic';

function ResetForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: any) {
    e.preventDefault();
    if (!token) { setMsg("Invalid link - no token"); return; }
    setLoading(true);
    setMsg("Resetting...");
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    const data = await res.json();
    setLoading(false);
    if (res.ok) {
      setMsg("✅ Password reset! Redirecting...");
      setTimeout(() => router.push("/login"), 1500);
    } else {
      setMsg("❌ " + (data.error || "Failed"));
    }
  }

  if (!token) {
    return <div>Invalid reset link. No token. <Link href="/forgot-password" className="underline">Request new link</Link></div>;
  }

  return (
    <div className="w-full max-w-md bg-white rounded-2xl p-8 border">
      <h1 className="text-2xl font-serif font-bold">Set new password</h1>
      <form onSubmit={submit} className="mt-6 space-y-4">
        <input required minLength={8} type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="New password (8+ chars)" className="w-full h-12 rounded-full border px-5" />
        <button disabled={loading} className="w-full h-12 rounded-full bg-[#1a4d2e] text-white font-semibold disabled:opacity-50">
          {loading ? "Resetting..." : "Reset password"}
        </button>
        {msg && <p className="text-sm mt-3">{msg}</p>}
      </form>
      <Link href="/login" className="mt-6 block text-center text-sm underline">Back to login</Link>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fafaf7] p-6">
      <Suspense fallback={<div>Loading...</div>}>
        <ResetForm />
      </Suspense>
    </div>
  );
}