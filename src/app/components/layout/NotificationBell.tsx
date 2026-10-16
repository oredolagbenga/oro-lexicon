"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";

type Notification = {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  relatedId: string;
  relatedType: string;
  createdAt: string;
};

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  async function fetchNotifs() {
    try {
      const res = await fetch("/api/notifications", { cache: "no-store" });
      const data = await res.json();
      if (data.notifications) {
        setNotifications(data.notifications.filter((n:any) => !n.read));
        setUnreadCount(data.unreadCount || 0);
      }
    } catch {}
  }

  useEffect(() => {
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  async function handleClick(n: Notification) {
    // Mark read and disappear immediately
    try {
      await fetch("/api/notifications", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: n.id }) });
    } catch {}
    setNotifications((prev) => prev.filter((x) => x.id !== n.id));
    setUnreadCount((c) => Math.max(0, c - 1));
    setOpen(false);

    if (n.type.includes("WORD_REJECTED") || n.type === "WORD_PENDING") {
      router.push(`/contribute?resubmit=${n.relatedId}`);
    } else if (n.type === "WORD_APPROVED") {
      router.push(`/dashboard?filter=approved`);
    } else if (n.type.includes("AUDIO")) {
      router.push(`/dashboard?filter=audio`);
    }
  }

  async function markAllRead() {
    await fetch("/api/notifications", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ markAll: true }) });
    setUnreadCount(0);
    setNotifications([]);
    setOpen(false);
  }

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(!open)} className="relative w-10 h-10 rounded-full bg-white border border-black/10 flex items-center justify-center hover:border-[#1a4d2e] transition">
        <span className="text-[18px]">🔔</span>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[11px] font-bold rounded-full flex items-center justify-center animate-pulse">{unreadCount}</span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 w-[380px] max-w-[90vw] bg-white rounded-[20px] border border-black/10 shadow-[0_12px_40px_rgba(0,0,0,0.15)] overflow-hidden z-50">
          <div className="p-4 flex items-center justify-between border-b border-black/5">
            <div className="font-semibold text-[14px]">Notifications</div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] bg-zinc-100 px-2 py-1 rounded-full">{unreadCount} new</span>
              {unreadCount > 0 && <button onClick={markAllRead} className="text-[11px] text-[#1a4d2e] font-medium underline">Mark all read</button>}
            </div>
          </div>

          <div className="max-h-[420px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-[13px] text-black/40">No new notifications. Admin feedback will appear here.</div>
            ) : (
              notifications.map((n) => (
                <div key={n.id} onClick={() => handleClick(n)} className="p-4 border-b border-black/[0.04] hover:bg-[#fafaf7] cursor-pointer transition bg-[#f5f7f0]">
                  <div className="text-[13px] font-semibold flex gap-2 items-start">
                    <span>{n.type === "WORD_APPROVED" ? "✅" : n.type.includes("REJECTED") ? "❌" : n.type.includes("AUDIO") ? "🎙" : "⏳"}</span>
                    <span className="flex-1">{n.title}</span>
                    <span className="w-2 h-2 bg-[#1a4d2e] rounded-full mt-1.5 shrink-0" />
                  </div>
                  <div className="text-[12px] text-black/60 mt-1 leading-[1.4]">{n.message}</div>
                  <div className="text-[10px] text-black/30 mt-2">{new Date(n.createdAt).toLocaleString()} • Click to fix</div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
