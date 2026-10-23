"use client";
import { useState } from "react";
import Link from "next/link";

export default function ForgotPage() {
  const [email, setEmail] = useState(""); const [sent, setSent] = useState(false);
  async function submit(e: any) { e.preventDefault(); await fetch("/api/auth/forgot-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) }); setSent(true); }
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fafaf7] p-6">
      <div className="w-full max-w- bg-white rounded- p-8 border">
        <h1 className="text- font-serif">Forgot password</h1>
        {sent ? <p className="mt-4 text-">If that email exists, we sent a reset link from <b>hello@oredola.dev</b>. Check spam too.</p> :
        <form onSubmit={submit} className="mt-6 space-y-4">
          <input required type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="gbenga@oredola.dev" className="w-full h- rounded-full border px-5" />
          <button className="w-full h- rounded-full bg-[#1a4d2e] text-white font-semibold">Send reset link</button>
        </form>}
        <Link href="/login" className="mt-6 block text-center text- underline">Back to login</Link>
      </div>
    </div>
  );
}