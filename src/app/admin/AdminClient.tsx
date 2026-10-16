"use client";
import { useState, useMemo, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

function formatDate(iso: string) {
  try { return new Date(iso).toLocaleDateString("en-GB", { day:"2-digit", month:"short" }); } catch { return ""; }
}

function ConfirmModal({ open, onClose, onConfirm, title, message, confirmText, variant }: any) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] bg-[#1a4d2e]/30 backdrop-blur-[8px] flex items-center justify-center p-4">
      <div className="bg-[#fcfaf0] rounded-[24px] max-w-[440px] w-full border border-[#1a4d2e]/10 shadow-[0_24px_80px_rgba(26,77,46,0.25)] p-8">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 text-[18px] ${variant==="danger"?"bg-red-50 text-red-600": variant==="success"?"bg-[#1a4d2e] text-white":"bg-[#f5d547] text-[#1a4d2e]"}`}>{variant==="danger"?"⚠": variant==="success"?"✓":"?"}</div>
        <h3 className="serif text-[24px] font-bold leading-[1.1] text-[#1a4d2e]">{title}</h3>
        <p className="mt-3 text-[13px] leading-[1.6] text-[#1a4d2e]/60">{message}</p>
        <div className="mt-8 flex gap-3">
          <button onClick={onClose} className="flex-1 h-[48px] rounded-full bg-white border border-[#1a4d2e]/10 text-[13px] font-bold">Cancel</button>
          <button onClick={()=>{ onConfirm(); onClose(); }} className={`flex-1 h-[48px] rounded-full text-[13px] font-bold ${variant==="danger"?"bg-[#e13a4b] text-white": "bg-[#1a4d2e] text-white"}`}>{confirmText||"Confirm"}</button>
        </div>
      </div>
    </div>
  );
}

export default function AdminClient({ initialWords, users, categories, currentUser }: { initialWords?: any[], users?: any[], categories?: any[], currentUser?: any }) {
  const router = useRouter();
  const safeWords = initialWords || [];
  const safeUsers = users || [];
  const safeCats = categories || [];

  const [words, setWords] = useState<any[]>(safeWords);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [view, setView] = useState<"grid"|"table">("grid");
  const [selected, setSelected] = useState<any|null>(null);
  const [playingId, setPlayingId] = useState<string|null>(null);
  const [loadingId, setLoadingId] = useState<string|null>(null);
  const [showUsers, setShowUsers] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [showAdminMenu, setShowAdminMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [confirm, setConfirm] = useState<any>({open:false});
  const [page, setPage] = useState(1);
  const adminMenuRef = useRef<HTMLDivElement>(null);
  const entriesRef = useRef<HTMLDivElement>(null);

  const [rejectModal, setRejectModal] = useState<{ open: boolean; word: any | null; comment: string; target: "word" | "both" }>({ open: false, word: null, comment: "", target: "word" });

  const perPage = view==="grid"?12:15;

  useEffect(()=>{ setWords(safeWords); }, [safeWords.length]);
  useEffect(()=>{ setPage(1); }, [search, statusFilter, categoryFilter, view]);
  useEffect(()=>{
    const handleClickOutside = (e: MouseEvent) => {
      if (adminMenuRef.current && !adminMenuRef.current.contains(e.target as Node)) {
        setShowAdminMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return ()=> document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const total = words.length;
  const pending = words.filter(w=>w.status==="PENDING").length;
  const approved = words.filter(w=>w.status==="APPROVED").length;
  const rejected = words.filter(w=>w.status==="REJECTED").length;
  const audioWith = words.filter(w=>(w.audioRecordings||[]).length>0).length;
  const audioCoverage = total? Math.round((audioWith/total)*100):0;
  const contributorsCount = safeUsers.length;
  const activeUsers = safeUsers.filter((u:any)=>u.status!=="SUSPENDED").length;
  const suspendedUsers = safeUsers.filter((u:any)=>u.status==="SUSPENDED").length;

  const byCategory = useMemo(()=>{
    const map: Record<string, number> = {};
    words.forEach(w=>{
      const cat = w.category?.name || "Uncategorized";
      map[cat] = (map[cat]||0)+1;
    });
    return Object.entries(map).sort((a,b)=>b[1]-a[1]).slice(0,6);
  }, [words]);

  const avgPerDay = useMemo(()=>{
    const thirtyDaysAgo = new Date(); thirtyDaysAgo.setDate(thirtyDaysAgo.getDate()-30);
    const recent = words.filter(w=> new Date(w.createdAt) > thirtyDaysAgo).length;
    return (recent/30).toFixed(1);
  }, [words]);

  const rejectionRate = total? Math.round((rejected/total)*100):0;

  const filtered = useMemo(()=> {
    let res = words.filter(w=>{
      if (statusFilter!=="ALL" && w.status!==statusFilter) return false;
      if (categoryFilter!=="ALL" && w.category?.name!==categoryFilter) return false;
      if (search) { const q=search.toLowerCase(); const hay=`${w.yoruba||""} ${w.english||""} ${w.translation||""} ${w.contributor?.name||""}`.toLowerCase(); if(!hay.includes(q)) return false; }
      return true;
    });
    res.sort((a,b)=> new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return res;
  }, [words, search, statusFilter, categoryFilter]);

  const filteredUsers = useMemo(()=> safeUsers.filter((u:any)=>{
    if (!userSearch) return true;
    const q = userSearch.toLowerCase();
    return `${u.name||""} ${u.email||""} ${u.role||""}`.toLowerCase().includes(q);
  }), [safeUsers, userSearch]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paginated = filtered.slice((page-1)*perPage, page*perPage);
  const start = filtered.length===0?0:(page-1)*perPage+1;
  const end = Math.min(page*perPage, filtered.length);

  const recentActivities = useMemo(()=>{
    return [...words].sort((a,b)=> new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0,5).map(w=> ({
      id: w.id,
      text: `${w.contributor?.name||"Someone"} submitted ${w.yoruba} — ${w.status==="PENDING"?"pending tone review": w.status==="APPROVED"?"approved": "rejected"}`,
      time: formatDate(w.createdAt),
      status: w.status
    }));
  }, [words]);

  const scrollToEntries = () => {
    entriesRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const openPending = () => {
    setStatusFilter("PENDING");
    setPage(1);
    scrollToEntries();
  };

  const openApprove = () => {
    setStatusFilter("APPROVED");
    setPage(1);
    scrollToEntries();
  };

  const ask = (title:string, message:string, action:()=>void, confirmText?:string, variant?:any) => setConfirm({open:true, title, message, action, confirmText, variant});
  const play = (url:string, id:string) => { if(!url) return; if(playingId===id){ (window as any)._adminAudio?.pause(); setPlayingId(null); return; } (window as any)._adminAudio?.pause(); const a=new Audio(url); a.onended=()=>setPlayingId(null); a.play().catch(()=>{}); (window as any)._adminAudio=a; setPlayingId(id); };

  const handleWord = async (id:string, action:"APPROVED"|"REJECTED", comment?: string) => { 
    setLoadingId(id); 
    const res = await fetch("/api/admin/words",{method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({wordId:id, status:action, comment})}); 
    const data = await res.json();
    if(!res.ok) { alert(data.error); setLoadingId(null); return; }
    setWords(p=>p.map(w=>w.id===id?{...w, status:action}:w)); 
    if(selected?.id===id) setSelected(null);
    setLoadingId(null); 
  };

  const handleBoth = async (word:any, wa:any, aa:any, comment?: string) => { 
    setLoadingId(word.id); 
    if (aa === "APPROVED") {
      for(const a of word.audioRecordings||[]) {
        if (a.status === "PENDING") {
          await fetch("/api/admin/audio",{method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({audioId:a.id, status:aa})});
        }
      }
    } else if (aa === "REJECTED") {
      for(const a of word.audioRecordings||[]) {
        await fetch("/api/admin/audio",{method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({audioId:a.id, status:aa})});
      }
    }
    await fetch("/api/admin/words",{method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({wordId:word.id, status:wa, comment})}); 
    setWords(p=>p.map(w=>w.id===word.id?{...w, status:wa, audioRecordings:(w.audioRecordings||[]).map((a:any)=>({...a, status:aa}))}:w)); 
    setSelected(null); 
    setLoadingId(null); 
  };

  const handleUser = async (userId:string, action:string) => { setLoadingId(userId); await fetch("/api/admin/users",{method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({userId, action})}); router.refresh(); setLoadingId(null); };

  const approvedPct = total? Math.round((approved/total)*100):0;
  const pendingPct = total? Math.round((pending/total)*100):0;
  const rejectedPct = total? 100-approvedPct-pendingPct:0;

  const adminInitial = (currentUser?.name?.[0] || currentUser?.email?.[0] || "A").toUpperCase();
  const adminName = currentUser?.name || currentUser?.email?.split("@")[0] || "Admin Oro";
  const adminEmail = currentUser?.email || "admin@oro.lex";

  return (
    <div className="min-h-screen bg-[#f7f5ee] text-[#1a4d2e]">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@400;500;600;700&display=swap'); *{font-family:'Inter',sans-serif} .serif{font-family:'Instrument Serif',serif}`}</style>
      <ConfirmModal open={confirm.open} onClose={()=>setConfirm({...confirm, open:false})} onConfirm={()=>confirm.action?.()} title={confirm.title} message={confirm.message} confirmText={confirm.confirmText} variant={confirm.variant} />

      {rejectModal.open && rejectModal.word && (
        <div className="fixed inset-0 z-[110] bg-[#1a4d2e]/40 backdrop-blur-[8px] flex items-center justify-center p-4">
          <div className="bg-[#fcfaf0] rounded-[24px] max-w-[520px] w-full border border-[#1a4d2e]/10 shadow-[0_24px_80px_rgba(26,77,46,0.25)] p-7">
            <div className="flex items-start justify-between">
              <div>
                <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center text-[18px]">⚠</div>
                <h3 className="serif text-[24px] font-bold mt-4 leading-[1.1]">Reject "{rejectModal.word.yoruba}"?</h3>
                <p className="mt-2 text-[13px] leading-[1.6] text-[#1a4d2e]/60">Contributor <b>{rejectModal.word.contributor?.name}</b> will get your reason in notification 🔔.</p>
              </div>
              <button onClick={()=>setRejectModal({open:false, word:null, comment:"", target:"word"})} className="w-8 h-8 rounded-full bg-[#1a4d2e] text-white flex items-center justify-center">✕</button>
            </div>
            <div className="mt-6">
              <label className="text-[11px] tracking-[0.14em] uppercase font-bold text-[#1a4d2e]/50">Reason for rejection (required)</label>
              <textarea value={rejectModal.comment} onChange={(e) => setRejectModal({ ...rejectModal, comment: e.target.value })} placeholder="e.g. Missing example sentence..." className="mt-2 w-full h-28 rounded-[14px] border border-[#1a4d2e]/15 p-4 text-[13px] bg-white focus:outline-none focus:border-[#1a4d2e] focus:ring-4 focus:ring-[#1a4d2e]/10 resize-none" autoFocus />
              <div className="text-[11px] text-[#1a4d2e]/40 mt-2">{rejectModal.comment.length}/200</div>
            </div>
            <div className="mt-6 flex gap-3">
              <button onClick={()=>setRejectModal({open:false, word:null, comment:"", target:"word"})} className="flex-1 h-[48px] rounded-full bg-white border border-[#1a4d2e]/10 text-[13px] font-bold">Cancel</button>
              <button disabled={!rejectModal.comment.trim() || rejectModal.comment.length < 5} onClick={()=>{ if (rejectModal.target === "both") { handleBoth(rejectModal.word, "REJECTED", "REJECTED", rejectModal.comment); } else { handleWord(rejectModal.word.id, "REJECTED", rejectModal.comment); } setRejectModal({open:false, word:null, comment:"", target:"word"}); }} className="flex-1 h-[48px] rounded-full bg-[#e13a4b] text-white text-[13px] font-bold disabled:opacity-40">Reject & Send Feedback</button>
            </div>
          </div>
        </div>
      )}

      <div className="border-b border-[#1a4d2e]/10 bg-[#fcfaf0]/80 backdrop-blur sticky top-0 z-30">
        <div className="max-w-[1320px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3"><div className="w-9 h-9 rounded-full bg-[#1a4d2e] text-[#f5d547] flex items-center justify-center font-bold">O</div><div><div className="serif text-[18px] leading-none font-bold">Oro Lexicon</div><div className="text-[10px] tracking-[0.14em] uppercase text-[#1a4d2e]/60">ADMIN · YORÙBÁ PRESERVATION</div></div></div>
            <div className="hidden md:flex items-center gap-2 pl-6 border-l border-[#1a4d2e]/10"><span className="w-2 h-2 rounded-full bg-[#7dd3a0] animate-pulse"></span><span className="text-[11px] tracking-[0.14em] uppercase text-[#1a4d2e]/60">LIVE MODERATION • {total} entries</span></div>
          </div>
          <div className="relative" ref={adminMenuRef}>
            <button onClick={()=>setShowAdminMenu(!showAdminMenu)} className="flex items-center gap-3 pl-3 pr-2 py-1 rounded-full hover:bg-[#1a4d2e]/5 transition">
              <div className="hidden sm:block text-right"><div className="text-[13px] font-bold leading-none">{adminName}</div><div className="text-[11px] text-[#1a4d2e]/50">{adminEmail}</div></div>
              <div className="w-9 h-9 rounded-full bg-[#1a4d2e] text-[#f5d547] flex items-center justify-center font-bold text-[13px] border-2 border-[#f5d547]/30">{adminInitial}</div>
              <span className="text-[10px] text-[#1a4d2e]/40">▼</span>
            </button>
            {showAdminMenu && (
              <div className="absolute right-0 top-[52px] w-[300px] bg-white rounded-[20px] border border-[#1a4d2e]/10 shadow-[0_20px_60px_rgba(26,77,46,0.15)] overflow-hidden z-50">
                <div className="p-4 bg-[#f7f5ee] border-b border-[#1a4d2e]/10">
                  <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-[#1a4d2e] text-[#f5d547] flex items-center justify-center font-bold">{adminInitial}</div><div><div className="font-bold text-[13px]">{adminName}</div><div className="text-[11px] text-[#1a4d2e]/50">{adminEmail}</div><div className="text-[10px] px-2 py-0.5 rounded-full bg-[#1a4d2e] text-white inline-block mt-1">ADMIN</div></div></div>
                </div>
                <div className="p-2">
                  <button onClick={()=>{ setShowAdminMenu(false); setShowNotifications(true); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-[12px] hover:bg-[#f7f5ee] text-left transition">
                    <span className="w-8 h-8 rounded-full bg-[#f5d547]/30 flex items-center justify-center text-[14px]">🔔</span>
                    <div className="flex-1"><div className="text-[13px] font-bold">Notifications</div><div className="text-[11px] text-[#1a4d2e]/50">{pending} pending • {recentActivities.length} recent</div></div>
                    {pending>0 && <span className="w-5 h-5 rounded-full bg-[#e13a4b] text-white text-[10px] flex items-center justify-center font-bold">{pending}</span>}
                  </button>
                  <button onClick={()=>{ setShowAdminMenu(false); setShowUsers(true); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-[12px] hover:bg-[#f7f5ee] text-left transition">
                    <span className="w-8 h-8 rounded-full bg-[#1a4d2e]/10 flex items-center justify-center text-[14px]">👥</span>
                    <div className="flex-1"><div className="text-[13px] font-bold">User management</div><div className="text-[11px] text-[#1a4d2e]/50">{activeUsers} active • {suspendedUsers} suspended</div></div>
                  </button>
                  <div className="h-px bg-[#1a4d2e]/10 my-2" />
                  <button onClick={()=>ask("Log out?", "You will be signed out of admin dashboard and returned to login.", ()=>{ window.location.href="/"; }, "Log out", "danger")} className="w-full flex items-center gap-3 px-4 py-3 rounded-[12px] hover:bg-red-50 text-left transition">
                    <span className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-[14px]">↪</span>
                    <div><div className="text-[13px] font-bold text-red-600">Log out</div><div className="text-[11px] text-[#1a4d2e]/50">Sign out of admin</div></div>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-[1320px] mx-auto px-6 py-8">
        <div className="flex flex-col lg:flex-row justify-between gap-6">
          <div><h1 className="serif text-[44px] md:text-[52px] leading-[0.9] tracking-[-0.03em] text-[#1a4d2e]">Admin Dashboard</h1><p className="mt-4 max-w-[520px] text-[14px] leading-[1.6] text-[#1a4d2e]/60">Curate with care. Every word carries lineage, tone, and living memory.</p></div>
          <div className="text-right hidden lg:block cursor-pointer" onClick={openPending}>
            <div className="text-[11px] tracking-widest uppercase text-[#1a4d2e]/40">Today</div>
            <div className="text-[13px] font-bold">{new Date().toLocaleDateString("en-GB", { weekday:"long", day:"numeric", month:"short" })}</div>
            <div className="mt-1 text-[11px] px-2.5 py-1 rounded-full bg-[#1a4d2e] text-white inline-block hover:bg-black transition">{pending} need review →</div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-[#f5d547] rounded-[24px] p-6 border border-[#1a4d2e]/5"><div className="text-[11px] tracking-[0.14em] uppercase text-[#1a4d2e]/60">TOTAL ENTRIES</div><div className="serif text-[42px] leading-none mt-2 text-[#1a4d2e]">{total}</div><div className="mt-3 text-[12px] text-[#1a4d2e]/60">{approved} approved • {pending} pending</div></div>
          <div onClick={openPending} className="bg-[#1a4d2e] rounded-[24px] p-6 text-white cursor-pointer hover:bg-[#143d24] transition group">
            <div className="text-[11px] tracking-[0.14em] uppercase text-[#f5d547]/60">PENDING REVIEW</div>
            <div className="serif text-[42px] leading-none mt-2 text-[#f5d547] group-hover:scale-105 transition">{pending}</div>
            <div className="mt-3 text-[12px] text-[#f5d547]/70 flex items-center gap-1">Needs attention <span className="group-hover:translate-x-1 transition">→</span></div>
          </div>
          <div onClick={openApprove} className="bg-white rounded-[24px] p-6 border border-[#1a4d2e]/10 cursor-pointer hover:border-[#1a4d2e]/30 transition group"><div className="text-[11px] tracking-[0.14em] uppercase text-[#1a4d2e]/40">APPROVED</div><div className="serif text-[42px] leading-none mt-2 group-hover:text-[#1a4d2e]">{approved}</div><div className="mt-3 text-[12px] text-[#1a4d2e]/50">{approvedPct}% of lexicon →</div></div>
          <div className="bg-white rounded-[24px] p-6 border border-[#1a4d2e]/10"><div className="text-[11px] tracking-[0.14em] uppercase text-[#1a4d2e]/40">AUDIO COVERAGE</div><div className="serif text-[42px] leading-none mt-2">{audioCoverage}%</div><div className="mt-3 text-[12px] text-[#1a4d2e]/50">{audioWith} recorded & verified</div></div>
          <button onClick={()=>setShowUsers(true)} className="bg-[#efe9d8] rounded-[24px] p-6 border border-[#1a4d2e]/5 text-left hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] transition"><div className="text-[11px] tracking-[0.14em] uppercase text-[#1a4d2e]/40">CONTRIBUTORS</div><div className="serif text-[42px] leading-none mt-2">{contributorsCount}</div><div className="mt-3 text-[12px] text-[#1a4d2e]/50">{activeUsers} active</div></button>
        </div>

        <div className="mt-8" ref={entriesRef}>
          <div className="bg-white rounded-[24px] border border-[#1a4d2e]/10 p-4">
            <div className="flex flex-col lg:flex-row gap-3 items-start lg:items-center justify-between">
              <div className="flex items-center gap-3">
                <h3 className="serif text-[20px] whitespace-nowrap">Dictionary Entries</h3>
                <span className="px-3 py-1 rounded-full bg-black text-white text-[11px] font-bold">Showing {start}-{end} of {filtered.length} • Recent first</span>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
                <div className="relative flex-1 lg:w-[260px]"><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search Yorùbá or English" className="w-full h-[40px] rounded-full bg-[#f7f5ee] border border-[#1a4d2e]/10 px-4 pl-10 text-[12px] outline-none focus:border-[#1a4d2e]/30" /><span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1a4d2e]/30 text-[12px]">⌕</span></div>
                <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)} className="h-[40px] rounded-full bg-[#f7f5ee] border border-[#1a4d2e]/10 px-4 text-[12px]"><option value="ALL">All status</option><option value="PENDING">Pending</option><option value="APPROVED">Approved</option><option value="REJECTED">Rejected</option></select>
                <select value={categoryFilter} onChange={e=>setCategoryFilter(e.target.value)} className="h-[40px] rounded-full bg-[#f7f5ee] border border-[#1a4d2e]/10 px-4 text-[12px]"><option value="ALL">All categories</option>{safeCats.map((c:any)=><option key={c.id} value={c.name}>{c.name}</option>)}</select>
                <div className="flex gap-1 p-1 rounded-full bg-[#f7f5ee] border border-[#1a4d2e]/10"><button onClick={()=>setView("grid")} className={`h-[32px] px-4 rounded-full text-[11px] font-bold transition ${view==="grid"?"bg-[#1a4d2e] text-white":"text-[#1a4d2e]/60"}`}>Grid</button><button onClick={()=>setView("table")} className={`h-[32px] px-4 rounded-full text-[11px] font-bold transition ${view==="table"?"bg-[#1a4d2e] text-white":"text-[#1a4d2e]/60"}`}>Table</button></div>
              </div>
            </div>
          </div>

          <div className="mt-5">
            {view==="grid" ? (
              <>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {paginated.length===0 ? <div className="col-span-3 py-20 text-center bg-white rounded-[24px] border border-[#1a4d2e]/10 text-[#1a4d2e]/40">No words match filters.</div> : paginated.map((w:any)=>(
                    <div key={w.id} onClick={()=>setSelected(w)} className="group bg-white rounded-[24px] border border-[#1a4d2e]/10 p-5 hover:shadow-[0_12px_32px_rgba(26,77,46,0.08)] hover:border-[#1a4d2e]/20 transition cursor-pointer">
                      <div className="flex justify-between items-start gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="serif text-[26px] font-bold text-[#1a4d2e] leading-none truncate">{w.yoruba}</span>
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide ${w.status==="PENDING"?"bg-amber-100 text-amber-700": w.status==="APPROVED"?"bg-green-50 text-green-700 border border-green-200":"bg-red-50 text-red-700"}`}>{w.status}</span>
                          </div>
                          <div className="mt-2 text-[13px] text-[#1a4d2e]/60 truncate">{w.english}</div>
                          <div className="mt-3 flex flex-wrap gap-2">
                            <span className="px-2.5 py-1 rounded-full bg-[#f7f5ee] border text-[11px]">{w.category?.name||"Culture"}</span>
                            {(w.audioRecordings||[]).length>0 && <span className="px-2.5 py-1 rounded-full bg-[#1a4d2e] text-[#f5d547] text-[10px] font-bold">🎙 {w.audioRecordings.length}</span>}
                            {w.status==="PENDING" && <span className="px-2 py-1 rounded-full bg-[#f5d547]/30 text-[10px] font-bold">NEW • {formatDate(w.createdAt)}</span>}
                          </div>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-[#f7f5ee] group-hover:bg-[#1a4d2e] group-hover:text-white flex items-center justify-center transition">↗</div>
                      </div>
                      {w.exampleYo && <div className="mt-4 p-3 rounded-[14px] bg-[#f7f5ee] border border-[#1a4d2e]/5"><div className="text-[11px] italic text-[#1a4d2e]/70 line-clamp-1">"{w.exampleYo}"</div></div>}
                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center gap-2"><div className="w-6 h-6 rounded-full bg-[#efe9d8] flex items-center justify-center text-[10px] font-bold">{(w.contributor?.name?.[0]||"A").toUpperCase()}</div><div><div className="text-[11px] font-bold truncate max-w-[100px]">{w.contributor?.name||"Anon"}</div><div className="text-[10px] text-[#1a4d2e]/40">{formatDate(w.createdAt)}</div></div></div>
                        <span className="text-[11px] font-bold text-[#1a4d2e]/40 group-hover:text-[#1a4d2e]">Review →</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 bg-white rounded-full border border-[#1a4d2e]/10 px-4 py-2">
                  <div className="text-[12px] text-[#1a4d2e]/50">Showing {start}-{end} of {filtered.length} • Page {page} of {totalPages} • Recent first</div>
                  <div className="flex items-center gap-2"><button disabled={page===1} onClick={()=>setPage(p=>Math.max(1,p-1))} className="h-9 px-5 rounded-full border bg-white text-[12px] font-bold disabled:opacity-40">← Prev</button><div className="flex gap-1">{Array.from({length:Math.min(5,totalPages)}, (_,i)=>{ const n= page<=3? i+1 : page>=totalPages-2? totalPages-4+i : page-2+i; if(n<1||n>totalPages) return null; return <button key={n} onClick={()=>setPage(n)} className={`w-9 h-9 rounded-full text-[12px] font-bold ${n===page?"bg-[#1a4d2e] text-white":"bg-white border"}`}>{n}</button>; })}</div><button disabled={page===totalPages} onClick={()=>setPage(p=>Math.min(totalPages,p+1))} className="h-9 px-5 rounded-full border bg-white text-[12px] font-bold disabled:opacity-40">Next →</button></div>
                </div>
              </>
            ) : (
              <div className="bg-white rounded-[24px] border border-[#1a4d2e]/10 overflow-hidden">
                <div className="overflow-auto"><table className="w-full text-left"><thead><tr className="bg-[#d9f5e3]/50 text-[11px] tracking-widest font-bold text-[#1a4d2e]"><th className="py-3 px-4">WORD</th><th>MEANING</th><th>CATEGORY</th><th>USER</th><th>STATUS</th><th>AUDIO</th><th>ACTION</th></tr></thead><tbody>{paginated.map((w:any)=><tr key={w.id} className="border-t border-[#1a4d2e]/10 text-[13px] hover:bg-[#f7f5ee]"><td className="py-3 px-4 font-bold serif text-[16px]">{w.yoruba}</td><td className="max-w-[160px] truncate">{w.english}</td><td>{w.category?.name}</td><td className="truncate max-w-[100px]">{w.contributor?.name}</td><td><span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${w.status==="APPROVED"?"bg-[#1a4d2e] text-white": w.status==="PENDING"?"bg-amber-100 text-amber-700":"bg-red-100 text-red-700"}`}>{w.status.toLowerCase()}</span></td><td>{(w.audioRecordings||[]).length>0?<span className="px-2 py-0.5 rounded-full bg-[#1a4d2e] text-[#f5d547] text-[10px] font-bold">🎙 {w.audioRecordings.length}</span>:"—"}</td><td><button onClick={()=>setSelected(w)} className="h-7 px-3 rounded-full bg-[#1a4d2e] text-[#f5d547] text-[11px] font-bold">Review</button></td></tr>)}</tbody></table></div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ADVANCED MODERN DETAILS MODAL WITH ARE YOU SURE */}
      {selected && (
        <div className="fixed inset-0 z-50 bg-[#1a4d2e]/30 backdrop-blur-[12px] flex items-center justify-center p-4 overflow-auto">
          <div className="bg-[#fcfaf0] rounded-[32px] max-w-[760px] w-full border border-[#1a4d2e]/10 shadow-[0_32px_120px_rgba(26,77,46,0.3)] max-h-[92vh] overflow-y-auto">
            <div className="sticky top-0 bg-[#fcfaf0] p-8 border-b border-[#1a4d2e]/10 flex justify-between items-start gap-6 rounded-t-[32px]">
              <div className="min-w-0 flex-1">
                <div className="flex items-start gap-4 flex-wrap">
                  <h2 className="serif text-[40px] font-bold leading-[0.9] text-[#1a4d2e]">{selected.yoruba}</h2>
                  <span className={`mt-2 px-3 py-1 rounded-full text-[11px] font-bold tracking-wide ${selected.status==="PENDING"?"bg-amber-100 text-amber-700 border border-amber-200": selected.status==="APPROVED"?"bg-green-50 text-green-700 border border-green-200":"bg-red-50 text-red-700 border border-red-200"}`}>{selected.status} • {formatDate(selected.createdAt)}</span>
                </div>
                <div className="mt-3 text-[15px] leading-[1.4]"><span className="font-bold text-[#1a4d2e]">{selected.english}</span> <span className="text-[#1a4d2e]/50">→ {selected.translation}</span></div>
                <div className="mt-3 flex items-center gap-2 flex-wrap">
                  <span className="px-3 py-1 rounded-full bg-[#f7f5ee] border text-[11px]">{selected.category?.name}</span>
                  <span className="px-3 py-1 rounded-full bg-[#1a4d2e]/5 text-[11px]">{selected.partOfSpeech}</span>
                  <span className="px-3 py-1 rounded-full bg-[#f5d547]/30 text-[11px] font-bold">{selected.ipa && `/${selected.ipa}/`}</span>
                </div>
                <div className="mt-4 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#1a4d2e] text-[#f5d547] flex items-center justify-center font-bold text-[11px]">{(selected.contributor?.name?.[0]||"A").toUpperCase()}</div>
                  <div><div className="text-[12px] font-bold">{selected.contributor?.name} • {selected.contributor?.email}</div><div className="text-[11px] text-[#1a4d2e]/40">Submitted {new Date(selected.createdAt).toLocaleString()}</div></div>
                </div>
              </div>
              <button onClick={()=>setSelected(null)} className="w-10 h-10 rounded-full bg-[#1a4d2e] text-white flex items-center justify-center hover:bg-black transition shrink-0">✕</button>
            </div>

            <div className="p-8 space-y-6">
              {selected.exampleYo && (
                <div className="bg-white rounded-[20px] border border-[#1a4d2e]/10 p-5">
                  <div className="text-[11px] tracking-[0.14em] uppercase font-bold text-[#1a4d2e]/40">Example Usage</div>
                  <div className="mt-3 text-[15px] italic leading-[1.5] text-[#1a4d2e]">"{selected.exampleYo}"</div>
                  <div className="mt-2 text-[13px] text-[#1a4d2e]/60">→ {selected.exampleEn}</div>
                </div>
              )}

              <div className="bg-white rounded-[20px] border border-[#1a4d2e]/10 p-5">
                <div className="flex justify-between items-center">
                  <div className="text-[11px] tracking-[0.14em] uppercase font-bold text-[#1a4d2e]/40">Pronunciation • {(selected.audioRecordings||[]).length} recording(s)</div>
                </div>
                <div className="mt-4 space-y-3">
                  {(selected.audioRecordings||[]).length===0?(
                    <div className="py-8 text-center rounded-[16px] bg-[#f7f5ee] border border-dashed"><div className="text-[12px] text-[#1a4d2e]/40">No audio yet</div></div>
                  ):(
                    (selected.audioRecordings||[]).map((a:any)=>(
                      <div key={a.id} className="flex items-center justify-between p-4 rounded-[16px] bg-[#f7f5ee] border border-[#1a4d2e]/5">
                        <div className="flex items-center gap-3">
                          <button onClick={()=>play(a.secureUrl||a.url, a.id)} className={`w-10 h-10 rounded-full flex items-center justify-center transition ${playingId===a.id?"bg-black text-white":"bg-[#1a4d2e] text-white hover:bg-black"}`}>{playingId===a.id?"■":"▶"}</button>
                          <div><div className="text-[12px] font-bold flex items-center gap-2">{a.status} <span className={`w-2 h-2 rounded-full ${a.status==="APPROVED"?"bg-green-500": a.status==="PENDING"?"bg-amber-500":"bg-red-500"}`}></span></div><div className="text-[11px] text-[#1a4d2e]/40">{formatDate(a.createdAt)}</div></div>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={()=>ask(`Reject audio?`,`Reject audio for ${selected.yoruba}? This cannot be undone.`,()=>{ const fn = async()=>{ await fetch("/api/admin/audio",{method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({audioId:a.id, status:"REJECTED"})}); setWords(p=>p.map(w=>({...w, audioRecordings:(w.audioRecordings||[]).filter((aa:any)=>aa.id!==a.id)}))); setSelected((prev:any)=>({...prev, audioRecordings:(prev.audioRecordings||[]).filter((aa:any)=>aa.id!==a.id)})); }; fn(); }, "Reject", "danger")} className="h-8 px-3 rounded-full border border-red-200 text-red-600 text-[11px] font-bold hover:bg-red-50">Reject</button>
                          <button onClick={()=>ask(`Approve audio?`,`Approve audio for ${selected.yoruba}? Users will hear this pronunciation in dictionary.`,()=>{ const fn = async()=>{ await fetch("/api/admin/audio",{method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({audioId:a.id, status:"APPROVED"})}); setWords(p=>p.map(w=>({...w, audioRecordings:(w.audioRecordings||[]).map((aa:any)=>aa.id===a.id?{...aa, status:"APPROVED"}:aa)}))); setSelected((prev:any)=>({...prev, audioRecordings:(prev.audioRecordings||[]).map((aa:any)=>aa.id===a.id?{...aa, status:"APPROVED"}:aa)})); }; fn(); }, "Approve", "success")} className="h-8 px-4 rounded-full bg-[#1a4d2e] text-white text-[11px] font-bold hover:bg-black">Approve</button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="pt-2 space-y-3">
                <div className="text-[11px] tracking-[0.14em] uppercase font-bold text-[#1a4d2e]/40">Moderation Actions — Are you sure?</div>
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={()=>setRejectModal({open:true, word:selected, comment:"", target:"word"})} className="h-[48px] rounded-full border border-red-200 text-red-600 font-bold text-[13px] hover:bg-red-50 transition">Reject Word (with reason)</button>
                  <button disabled={loadingId===selected.id} onClick={()=>ask(`Approve ${selected.yoruba}?`,`Approve "${selected.yoruba}" = "${selected.english}"? This will make it live in dictionary and visible to all users.`,()=>handleWord(selected.id,"APPROVED"),"Approve Word Only","success")} className="h-[48px] rounded-full bg-white border border-[#1a4d2e] text-[#1a4d2e] font-bold text-[13px] hover:bg-[#f7f5ee] disabled:opacity-40">✅ Approve Word Only</button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={()=>setRejectModal({open:true, word:selected, comment:"", target:"both"})} className="h-[48px] rounded-full bg-red-50 border border-red-200 text-red-600 font-bold text-[12px] hover:bg-red-100">Reject Both</button>
                  <button disabled={loadingId===selected.id} onClick={()=>ask(`Approve both?`,`Approve word and ${selected.audioRecordings?.length||0} audio(s) for "${selected.yoruba}" together? This is for eja + audio submissions.`,()=>handleBoth(selected,"APPROVED","APPROVED"),"✅ Approve Both","success")} className="h-[48px] rounded-full bg-[#1a4d2e] text-white font-bold text-[13px] hover:bg-black disabled:opacity-40">✅ Approve Word + Audio Together</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showNotifications && (
        <div className="fixed inset-0 z-50 bg-[#1a4d2e]/20 backdrop-blur-sm flex items-start justify-end p-6">
          <div className="bg-white rounded-[24px] w-full max-w-[420px] max-h-[85vh] overflow-auto border shadow-[0_20px_60px_rgba(0,0,0,0.2)]">
            <div className="sticky top-0 bg-white p-6 border-b border-[#1a4d2e]/10 flex justify-between items-center rounded-t-[24px]"><h3 className="serif text-[20px] font-bold">Recent Activity • {total} entries</h3><button onClick={()=>setShowNotifications(false)} className="w-8 h-8 rounded-full bg-[#1a4d2e] text-white">✕</button></div>
            <div className="p-4 space-y-3">
              {recentActivities.map((act:any)=>(
                <div key={act.id} className="p-4 rounded-[16px] bg-[#f7f5ee] border border-[#1a4d2e]/5">
                  <div className="flex gap-3"><span className={`w-2 h-2 rounded-full mt-2 shrink-0 ${act.status==="PENDING"?"bg-amber-500": act.status==="APPROVED"?"bg-green-600":"bg-red-500"}`}></span><div><div className="text-[12px] leading-[1.4]">{act.text}</div><div className="text-[11px] text-[#1a4d2e]/40 mt-1">{act.time} • {act.status.toLowerCase()}</div></div></div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-[#1a4d2e]/10"><button onClick={()=>{ setShowNotifications(false); openPending(); }} className="w-full h-10 rounded-full bg-[#1a4d2e] text-white text-[12px] font-bold">View {pending} pending reviews →</button></div>
          </div>
        </div>
      )}

      {showUsers && (
        <div className="fixed inset-0 z-50 bg-[#1a4d2e]/30 backdrop-blur flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] max-w-[640px] w-full max-h-[85vh] flex flex-col overflow-hidden border shadow-2xl">
            <div className="p-6 border-b border-[#1a4d2e]/10"><div className="flex justify-between items-center"><h3 className="serif text-[22px] font-bold">All Users • {safeUsers.length}</h3><button onClick={()=>setShowUsers(false)} className="w-8 h-8 rounded-full bg-[#1a4d2e] text-white">✕</button></div><div className="mt-4 relative"><input value={userSearch} onChange={e=>setUserSearch(e.target.value)} placeholder="🔍 Search users..." className="w-full h-[44px] rounded-full bg-[#f7f5ee] border border-[#1a4d2e]/10 px-5 pl-11 text-[13px] outline-none focus:border-[#1a4d2e]/30" /><span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1a4d2e]/30">⌕</span></div></div>
            <div className="flex-1 overflow-auto p-4 space-y-3">
              {filteredUsers.map((u:any)=>(
                <div key={u.id} className="p-4 rounded-[16px] bg-[#f7f5ee] border border-[#1a4d2e]/5 flex flex-col sm:flex-row justify-between gap-3">
                  <div className="min-w-0 flex gap-3"><div className="w-9 h-9 rounded-full bg-[#1a4d2e] text-[#f5d547] flex items-center justify-center font-bold text-[12px] shrink-0">{(u.name?.[0]||u.email?.[0]||"U").toUpperCase()}</div><div className="min-w-0"><div className="font-bold text-[13px] flex flex-wrap items-center gap-2"><span className="truncate">{u.name||"No name"}</span><span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${u.role==="ADMIN"?"bg-[#1a4d2e] text-white": u.status==="SUSPENDED"?"bg-red-600 text-white":"bg-white border"}`}>{u.status==="SUSPENDED"?"SUSPENDED":u.role}</span></div><div className="text-[11px] text-[#1a4d2e]/50 truncate">{u.email}</div></div></div>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={()=>ask(u.status==="SUSPENDED"?"Unsuspend?":"Suspend?", u.status==="SUSPENDED"?`Unsuspend ${u.email}?`:`Suspend ${u.email}?`, ()=>handleUser(u.id, u.status==="SUSPENDED"?"UNSUSPEND":"SUSPEND"), u.status==="SUSPENDED"?"Unsuspend":"Suspend", u.status==="SUSPENDED"?"success":"danger")} className={`h-8 px-3 rounded-full text-[11px] font-bold border ${u.status==="SUSPENDED"?"bg-green-50 text-green-700 border-green-200":"bg-white text-red-600 border-red-200"}`}>{u.status==="SUSPENDED"?"Unsuspend":"Suspend"}</button>
                    <button onClick={()=>ask(u.role==="ADMIN"?"Remove admin?":"Make admin?", `Change role for ${u.email}?`, ()=>handleUser(u.id, u.role==="ADMIN"?"CONTRIBUTOR":"ADMIN"), u.role==="ADMIN"?"Remove Admin":"Make Admin", u.role==="ADMIN"?"danger":"success")} className={`h-8 px-3 rounded-full text-[11px] font-bold ${u.role==="ADMIN"?"bg-black text-white":"bg-white border"}`}>{u.role==="ADMIN"?"Remove":"Make Admin"}</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
