"use client";
import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export const dynamic = "force-dynamic";

function ResetInner() {
  const token = useSearchParams().get("token");
  const [pw, setPw] = useState(""); 
  const [error, setError] = useState(""); 
  const router = useRouter();

  async function submit(e: any) {
    e.preventDefault();
    const res = await fetch("/api/auth/reset-password", { 
      method: "POST", 
      headers: { "Content-Type": "application/json" }, 
      body: JSON.stringify({ token, password: pw }) 
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error); return; }
    router.push("/login?reset=true");
  }

  if (!token) return <div className="p-6 text-">Invalid link. Go to <a href="/forgot-password" className="underline">forgot password</a> again.</div>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fafaf7] p-6">
      <div className="w-full max-w- bg-white rounded- p-8 border">
        <h1 className="text- font-serif">New password</h1>
        {error && <div className="mt-4 bg-red-50 border border-red-200 p-3 rounded-xl text- text-red-700">{error}</div>}
        <form onSubmit={submit} className="mt-6 space-y-4">
          <input required type="password" value={pw} onChange={e=>setPw(e.target.value)} placeholder="8+ characters" className="w-full h- rounded-full border px-5" />
          <button className="w-full h- rounded-full bg-[#1a4d2e] text-white font-semibold">Reset password</button>
        </form>
      </div>
    </div>
  );
}

export default function ResetPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <ResetInner />
    </Suspense>
  );
}