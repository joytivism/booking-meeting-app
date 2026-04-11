"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { fetchAllBookings, updateBookingStatus, deleteBooking, bulkDeleteBookings, submitBooking } from "@/app/actions/booking";
import { formatTimeForDisplay } from "@/utils/dateHelper";
import type { Booking, BookingStatus } from "@/types";
import { 
  User, Bell, LayoutDashboard, Calendar, Clock, ChevronDown, ChevronUp,
  CheckCircle2, AlertCircle, ArrowDownRight, ArrowUpRight, 
  BarChart3, Search, Mail, Building, History, FileText, Check, Plus, UploadCloud, Trash2, X, Menu, LogOut
} from "lucide-react";

/* ───────────────────── LoginForm Component ───────────────────── */
function LoginForm({ onSuccess }: { onSuccess: () => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (res.ok) onSuccess();
      else setError("Kredensial tidak sah. Coba lagi.");
    } catch {
      setError("Tidak dapat terhubung ke server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-6 font-sans">
      <div className="w-full max-w-sm">
        <div className="rounded-2xl bg-white p-8 shadow-sm border border-gray-200">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-white">
              <LayoutDashboard size={24} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Login</h1>
          </div>
          {error && (
            <div className="mb-6 rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm font-medium text-destructive text-center">
              {error}
            </div>
          )}
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="text"
              required
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary"
            />
            <input
              type="password"
              required
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-white transition-all hover:bg-primary/90 active:scale-[0.98] disabled:opacity-50 mt-2"
            >
              {loading ? "Memproses..." : "Masuk"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function formatDateForDisplay(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Ago", "Sep", "Okt", "Nov", "Des"];
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

const STATUS_LIST: BookingStatus[] = ["New Request", "Approved", "Meeting Done", "Follow-up"];

/* ───────────────────── AdminDashboard ───────────────────── */
export default function AdminDashboard() {
  const [authenticated, setAuthenticated] = useState(false);
  const [checking, setChecking] = useState(true);
  const [data, setData] = useState<Booking[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"dashboard" | "analytic" | "history">("dashboard");
  
  // UI States
  const [showNotif, setShowNotif] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  
  // Delete States
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState<Record<string, boolean>>({});

  // Manual Add Form States
  const [modalData, setModalData] = useState({ name: "", email: "", type: "Consultation", date: "", time: "10:00" });
  const [modalLoading, setModalLoading] = useState(false);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setAuthenticated(false);
      setShowProfileMenu(false);
    } catch {}
  };

  const checkAuth = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/check");
      if (res.ok) setAuthenticated(true);
    } catch {
    } finally {
      setChecking(false);
    }
  }, []);

  useEffect(() => { checkAuth(); }, [checkAuth]);

  const loadBookings = useCallback(async () => {
    try {
       const bookings = await fetchAllBookings();
       setData(bookings);
       setSelectedIds(new Set()); // reset selections
    } catch {}
  }, []);

  useEffect(() => { if (authenticated) loadBookings(); }, [authenticated, loadBookings]);

  const handleUpdateStatus = async (id: string, newStatus: BookingStatus, email: string, name: string) => {
    setData((prev) => prev.map((b) => (b.id === id ? { ...b, status: newStatus } : b)));
    await updateBookingStatus(id, newStatus, email, name);
  };

  const handleDeleteSingle = async (id: string) => {
     if (!window.confirm("Yakin ingin menghapus klien ini permanen?")) return;
     setIsDeleting(prev => ({ ...prev, [id]: true }));
     await deleteBooking(id);
     loadBookings();
  };

  const handleBulkDelete = async () => {
     if (!window.confirm(`Yakin ingin menghapus ${selectedIds.size} klien terpilih?`)) return;
     setIsDeleting(prev => ({ ...prev, bulk: true }));
     await bulkDeleteBookings(Array.from(selectedIds));
     setIsDeleting(prev => ({ ...prev, bulk: false }));
     loadBookings();
  };

  const handleSelectToggle = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelectedIds(next);
  };

  const filteredData = data.filter((b) => 
    b.brand_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    b.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectAll = () => {
    if (selectedIds.size === filteredData.length && filteredData.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredData.map(d => d.id)));
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
     e.preventDefault();
     setModalLoading(true);
     await submitBooking({
       brandName: modalData.name, email: modalData.email, meetingType: modalData.type,
       bookingDate: modalData.date, bookingTime: modalData.time
     });
     setModalLoading(false);
     setShowAddModal(false);
     setModalData({ name: "", email: "", type: "Consultation", date: "", time: "10:00" });
     loadBookings();
  };

  const metrics = useMemo(() => {
    const totalClients = data.length;
    const approvedCount = data.filter((b) => b.status === "Approved" || b.status === "Meeting Done").length;
    const pendingCount = data.filter((b) => b.status === "New Request" || b.status === "pending").length;
    
    let consultationCount = 0;
    let weeklyCount = 0;
    let biweeklyCount = 0;
    
    data.forEach(b => {
       const typed = b.meeting_type.toLowerCase();
       if (typed.includes("consultation")) consultationCount++;
       else if (typed.includes("biweekly")) biweeklyCount++;
       else if (typed.includes("weekly")) weeklyCount++;
    });

    const otherCount = totalClients - (consultationCount + weeklyCount + biweeklyCount);

    return { totalClients, approvedCount, pendingCount, consultationCount, weeklyCount, biweeklyCount, otherCount };
  }, [data]);

  if (checking) return null;
  if (!authenticated) return <LoginForm onSuccess={() => setAuthenticated(true)} />;

  return (
    <div className="flex min-h-screen bg-[#f9fafb] font-sans relative">
      
      {/* ── Overlay Modal Tambah ── */}
      {showAddModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-fadeIn">
           <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden animate-slideUp">
             <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
               <h3 className="text-lg font-bold text-gray-900">Daftar Klien Manual</h3>
               <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-900 transition-colors">
                 <X size={20}/>
               </button>
             </div>
             <form onSubmit={handleManualSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Nama / Brand</label>
                  <input required value={modalData.name} onChange={e => setModalData({...modalData, name: e.target.value})} type="text" className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-transparent focus-visible:outline-none transition-colors bg-gray-50 focus:bg-white" placeholder="Contoh: Budi Santoso"/>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Email</label>
                  <input required value={modalData.email} onChange={e => setModalData({...modalData, email: e.target.value})} type="email" className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-transparent focus-visible:outline-none transition-colors bg-gray-50 focus:bg-white" placeholder="klien@email.com"/>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Tipe Layanan</label>
                  <select required value={modalData.type} onChange={e => setModalData({...modalData, type: e.target.value})} className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-transparent focus-visible:outline-none transition-colors bg-gray-50 focus:bg-white">
                     <option value="Consultation">Consultation Session</option>
                     <option value="Weekly">Weekly Meeting</option>
                     <option value="Biweekly">Biweekly</option>
                     <option value="Onboarding">Onboarding</option>
                     <option value="Evaluasi">Evaluasi</option>
                     <option value="Discussion">Discussion</option>
                     <option value="Monthly">Monthly</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Tanggal</label>
                    <input required value={modalData.date} onChange={e => setModalData({...modalData, date: e.target.value})} type="date" className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-transparent focus-visible:outline-none transition-colors bg-gray-50 focus:bg-white"/>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Jam (WIB)</label>
                    <input required value={modalData.time} onChange={e => setModalData({...modalData, time: e.target.value})} type="time" className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-transparent focus-visible:outline-none transition-colors bg-gray-50 focus:bg-white"/>
                  </div>
                </div>
                <div className="pt-4">
                  <button type="submit" disabled={modalLoading} className="w-full rounded-xl bg-gray-900 py-3 text-sm font-semibold text-white transition-all hover:bg-gray-800 active:scale-[0.98] disabled:opacity-50">
                    {modalLoading ? "Menyimpan..." : "Simpan Klien"}
                  </button>
                </div>
             </form>
           </div>
        </div>
      )}

      {/* ── Left Sidebar (Desktop Only) ── */}
      <aside className="fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200 hidden md:flex flex-col z-40">
        
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-6 h-16 border-b border-gray-100 shrink-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white">
            <LayoutDashboard size={18} />
          </div>
          <span className="text-lg font-bold text-gray-900 tracking-tight">Real Advertise</span>
        </div>

        {/* Central Nav Tabs */}
        <div className="flex flex-col gap-1 px-4 py-8 flex-1">
          <button 
            onClick={() => { setActiveTab("dashboard"); setSelectedDate(null); }}
            className={`w-full flex items-center justify-start gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all ${
              activeTab === "dashboard" ? "bg-primary/10 text-primary" : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
            }`}>
             <LayoutDashboard size={18}/> Dashboard
          </button>
          <button 
            onClick={() => { setActiveTab("analytic"); setSelectedDate(null); }}
            className={`w-full flex items-center justify-start gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all ${
              activeTab === "analytic" ? "bg-primary/10 text-primary" : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
            }`}>
            <BarChart3 size={18}/> Analytic
          </button>
          <button 
            onClick={() => { setActiveTab("history"); setSelectedDate(null); }}
            className={`w-full flex items-center justify-start gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all ${
              activeTab === "history" ? "bg-primary/10 text-primary" : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
            }`}>
            <History size={18}/> History
          </button>
        </div>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-gray-100 flex items-center justify-between">
          
          {/* Profile Menu */}
          <div className="relative flex-1">
            <button 
              onClick={() => { setShowProfileMenu(!showProfileMenu); setShowNotif(false); }}
              className="flex w-full items-center gap-2 rounded-xl border border-gray-200 p-1.5 hover:bg-gray-50 transition-colors"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-700 shrink-0">
                <User size={16} />
              </div>
              <span className="text-sm font-semibold text-gray-700 truncate w-full text-left">Admin</span>
              <ChevronUp size={14} className="text-gray-400 shrink-0 mr-1" />
            </button>

            {showProfileMenu && (
              <div className="absolute bottom-0 left-full ml-4 mb-0 w-56 rounded-xl bg-white shadow-[0_8px_30px_-4px_rgba(0,0,0,0.1)] border border-gray-200 py-1 z-[100] animate-fadeIn">
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-destructive hover:bg-red-50 transition-colors"
                >
                  <LogOut size={16}/>
                  Keluar Akun
                </button>
              </div>
            )}
          </div>
          
          {/* Notification */}
          <div className="relative shrink-0 ml-2">
            <button 
              onClick={() => { setShowNotif(!showNotif); setShowProfileMenu(false); }}
              className={`relative flex h-11 w-11 items-center justify-center rounded-xl border ${showNotif ? 'bg-primary/10 border-primary cursor-default' : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-500'} transition-colors`}
            >
              <Bell size={20} className={showNotif ? 'text-primary' : ''} />
              {metrics.pendingCount > 0 && <span className="absolute top-2 right-2 block h-2.5 w-2.5 rounded-full bg-destructive ring-2 ring-white" />}
            </button>
            {showNotif && (
              <div className="absolute bottom-0 left-full ml-4 mb-0 w-80 rounded-xl bg-white p-4 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.1)] border border-gray-200 z-[100] animate-fadeIn">
                <div className="flex items-center justify-between mb-3 border-b border-gray-100 pb-2">
                  <span className="font-semibold text-gray-900 text-sm">Notifikasi</span>
                  {metrics.pendingCount > 0 && <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md">{metrics.pendingCount} Baru</span>}
                </div>
                <div className="space-y-2">
                  {metrics.pendingCount > 0 ? (
                    <div className="rounded-lg p-3 border border-gray-100 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer flex gap-3 items-start">
                      <div className="h-2 w-2 rounded-full bg-primary mt-1.5 shrink-0"></div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900 mb-0.5">Klien Menunggu Review</p>
                        <p className="text-xs text-gray-500">Terdapat {metrics.pendingCount} permintaan meeting baru yang butuh persetujuan segera.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="py-6 text-center">
                       <CheckCircle2 size={24} className="text-secondary mx-auto mb-2 opacity-50" />
                       <span className="text-xs text-gray-500">Tidak ada notifikasi baru.</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

        </div>
      </aside>

      {/* ── Mobile Top Bar (Mobile Only) ── */}
      <div className="fixed top-0 left-0 right-0 h-14 bg-white border-b border-gray-200 flex md:hidden items-center justify-between px-4 z-40">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white">
            <LayoutDashboard size={16} />
          </div>
          <span className="text-base font-bold text-gray-900 tracking-tight">Real Advertise</span>
        </div>
        <div className="flex items-center gap-2">
          {/* Mobile Notification */}
          <div className="relative">
            <button 
              onClick={() => { setShowNotif(!showNotif); setShowProfileMenu(false); }}
              className={`relative flex h-9 w-9 items-center justify-center rounded-lg border ${showNotif ? 'bg-primary/10 border-primary' : 'bg-white border-gray-200 text-gray-500'} transition-colors`}
            >
              <Bell size={18} className={showNotif ? 'text-primary' : ''} />
              {metrics.pendingCount > 0 && <span className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full bg-destructive ring-2 ring-white" />}
            </button>
            {showNotif && (
              <div className="absolute right-0 top-full mt-2 w-72 rounded-xl bg-white p-4 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.1)] border border-gray-200 z-[100] animate-fadeIn">
                <div className="flex items-center justify-between mb-3 border-b border-gray-100 pb-2">
                  <span className="font-semibold text-gray-900 text-sm">Notifikasi</span>
                  {metrics.pendingCount > 0 && <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md">{metrics.pendingCount} Baru</span>}
                </div>
                <div className="space-y-2">
                  {metrics.pendingCount > 0 ? (
                    <div className="rounded-lg p-3 border border-gray-100 bg-gray-50 flex gap-3 items-start">
                      <div className="h-2 w-2 rounded-full bg-primary mt-1.5 shrink-0"></div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900 mb-0.5">Klien Menunggu Review</p>
                        <p className="text-xs text-gray-500">{metrics.pendingCount} permintaan baru.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="py-4 text-center">
                       <CheckCircle2 size={20} className="text-secondary mx-auto mb-1.5 opacity-50" />
                       <span className="text-xs text-gray-500">Tidak ada notifikasi.</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          {/* Mobile Profile/Logout */}
          <div className="relative">
            <button 
              onClick={() => { setShowProfileMenu(!showProfileMenu); setShowNotif(false); }}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 transition-colors"
            >
              <User size={18} />
            </button>
            {showProfileMenu && (
              <div className="absolute right-0 top-full mt-2 w-44 rounded-xl bg-white shadow-[0_8px_30px_-4px_rgba(0,0,0,0.1)] border border-gray-200 py-1 z-[100] animate-fadeIn">
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-destructive hover:bg-red-50 transition-colors"
                >
                  <LogOut size={16}/> Keluar Akun
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Mobile Bottom Navigation (Mobile Only) ── */}
      <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-200 flex md:hidden items-center justify-around z-40 px-2">
        <button 
          onClick={() => { setActiveTab("dashboard"); setSelectedDate(null); }}
          className={`flex flex-col items-center justify-center gap-1 flex-1 py-2 rounded-xl transition-colors ${
            activeTab === "dashboard" ? "text-primary" : "text-gray-400"
          }`}>
          <LayoutDashboard size={20}/>
          <span className="text-[10px] font-semibold">Dashboard</span>
        </button>
        <button 
          onClick={() => { setActiveTab("analytic"); setSelectedDate(null); }}
          className={`flex flex-col items-center justify-center gap-1 flex-1 py-2 rounded-xl transition-colors ${
            activeTab === "analytic" ? "text-primary" : "text-gray-400"
          }`}>
          <BarChart3 size={20}/>
          <span className="text-[10px] font-semibold">Analytic</span>
        </button>
        <button 
          onClick={() => { setActiveTab("history"); setSelectedDate(null); }}
          className={`flex flex-col items-center justify-center gap-1 flex-1 py-2 rounded-xl transition-colors ${
            activeTab === "history" ? "text-primary" : "text-gray-400"
          }`}>
          <History size={20}/>
          <span className="text-[10px] font-semibold">History</span>
        </button>
      </nav>

      <main className="flex-1 md:ml-64 p-4 sm:p-6 md:p-8 min-h-screen pt-18 md:pt-8 pb-24 md:pb-8">
        
        {(activeTab === "dashboard" || activeTab === "analytic") && (
        <div className="space-y-6">
        
        {/* ── ROW 1: STAT CARDS ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
          
          {/* Card 1: Total Klien Aktif */}
          <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-200 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
                  <Building size={20} />
                </div>
                <span className="font-semibold text-gray-600 text-sm">Total Klien Aktif</span>
              </div>
              <ChevronDown size={16} className="text-gray-400"/>
            </div>
            
            <div className="mb-6 flex items-end justify-between">
               <div>
                 <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-none">{metrics.totalClients}</h2>
               </div>
            </div>

            <div className="flex w-full pt-4">
              <button onClick={() => setShowAddModal(true)} className="w-full rounded-lg bg-gray-900 text-white py-2.5 text-sm font-semibold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 shadow-sm">
                <Plus size={16}/> Tambah Manual
              </button>
            </div>
          </div>

          {/* Card 2: Meeting Disetujui */}
          <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-200 flex flex-col justify-between">
             <div className="flex items-center justify-between mb-4">
               <div className="flex items-center gap-3">
                 <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
                   <CheckCircle2 size={20} />
                 </div>
                 <span className="font-semibold text-gray-600 text-sm">Meeting Disetujui</span>
               </div>
             </div>
             
             <div className="mb-6 flex items-end justify-between">
               <div>
                 <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-none">{metrics.approvedCount}</h2>
               </div>
             </div>

             <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-4">
               <div>
                 <p className="text-xs font-medium text-gray-500 mb-1">Consultation</p>
                 <p className="text-xl font-bold text-gray-900">{metrics.consultationCount}</p>
               </div>
               <div>
                 <p className="text-xs font-medium text-gray-500 mb-1">Mingguan</p>
                 <p className="text-xl font-bold text-gray-900">{metrics.weeklyCount}</p>
               </div>
             </div>
          </div>

          {/* Card 3: Permintaan Menunggu */}
          <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-200 flex flex-col justify-between">
             <div className="flex items-center justify-between mb-4">
               <div className="flex items-center gap-3">
                 <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
                   <AlertCircle size={20} />
                 </div>
                 <span className="font-semibold text-gray-600 text-sm">Status Menunggu</span>
               </div>
             </div>
             
             <div className="mb-6 flex items-end justify-between">
               <div>
                 <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-none">{metrics.pendingCount}</h2>
                 <p className="text-xs font-medium mt-2 flex items-center gap-1.5 text-gray-500">
                   <span className="text-destructive font-semibold bg-destructive/10 px-1.5 py-0.5 rounded-md text-xs">{metrics.totalClients > 0 ? Math.round((metrics.pendingCount/metrics.totalClients)*100) : 0}% Pending</span>
                   Butuh tindakan
                 </p>
               </div>
             </div>

             <div className="pt-4 border-t border-gray-100">
               <div className="flex h-2 overflow-hidden rounded-full mb-3 bg-gray-100">
                  <div className="h-full bg-gray-900" style={{ width: '50%' }}></div>
                  <div className="h-full bg-primary" style={{ width: '32%' }}></div>
                  <div className="h-full bg-secondary" style={{ width: '18%' }}></div>
               </div>
               <div className="flex justify-between text-xs font-medium text-gray-500">
                 <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-gray-900" /> Consult</span>
                 <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-primary" /> Weekly</span>
                 <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-secondary" /> Biweek</span>
               </div>
             </div>
          </div>
        </div>

        {/* ── ROW 2: CHART SECTION ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-4 sm:gap-6">
          
          {/* Card 1: Kapasitas Slot (Gauge) */}
          <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-200 flex flex-col justify-between">
             <div className="flex items-center justify-between mb-8">
               <span className="font-semibold text-gray-900">Beban Kalender (Minggu Ini)</span>
               <span className="text-xs font-semibold bg-gray-100 text-gray-500 px-2.5 py-1 rounded-md tracking-wide">{Math.min(metrics.totalClients, 40)} / 40 JAM</span>
             </div>
             
             {/* Perfect SVG Gauge display */}
             <div className="flex flex-col items-center flex-1 justify-center relative mt-4">
                <div className="relative w-[200px] h-[100px] flex items-end justify-center mb-6">
                  {/* SVG Arc */}
                  <svg className="absolute bottom-0 w-full h-full" viewBox="0 0 100 50">
                    <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#f3f4f6" strokeWidth="12" strokeLinecap="round" />
                    <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke={metrics.totalClients === 0 ? "transparent" : "#ff6301"} strokeWidth="12" strokeLinecap="round" strokeDasharray="125.66" strokeDashoffset={`${125.66 - (125.66 * (Math.min(metrics.totalClients, 40) / 40))}`} className="transition-all duration-1000" />
                  </svg>
                  
                  {/* Inner text perfectly centered inside the arc hole */}
                  <div className="absolute -bottom-1 flex flex-col items-center px-4 bg-white">
                    <h2 className="text-4xl font-bold text-gray-900 leading-none">{Math.round((Math.min(metrics.totalClients, 40) / 40) * 100)}%</h2>
                  </div>
                </div>
                
                <div className="flex flex-col items-center mt-2">
                  <p className={`text-xs font-semibold px-2 py-1 rounded ${metrics.totalClients === 0 ? 'text-gray-500 bg-gray-100' : 'text-primary bg-primary/10'}`}>
                    {metrics.totalClients === 0 ? 'Masih Kosong' : metrics.totalClients >= 40 ? 'Terisi Penuh' : 'Terjadwal'}
                  </p>
                </div>
             </div>

             <div className="mt-8 space-y-3">
               <p className="text-sm text-center text-gray-500 font-medium">
                 Tersisa <strong className="text-gray-900 font-bold">{Math.max(40 - metrics.totalClients, 0)} slot kosong</strong> untuk minggu ini.
               </p>
               <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                  <span className="font-medium text-gray-500">Telah Terpesan</span>
                  <div className="flex items-center gap-2">
                     <span className="font-bold text-gray-900">{metrics.totalClients} Slot</span>
                  </div>
               </div>
             </div>
          </div>

          {/* Card 2: Proporsi Layanan (Horizontal Breakdown) */}
          <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-200 flex flex-col justify-between">
             <div className="flex items-center justify-between mb-8">
               <span className="font-semibold text-gray-900">Distribusi Proporsi Layanan</span>
             </div>

             <div className="flex flex-col flex-1 justify-center space-y-6">
                
                {/* Item 1: Consultation */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                     <span className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <span className="h-3 w-3 rounded-full bg-gray-900 shrink-0"></span> Consultation Session
                     </span>
                     <span className="text-sm font-bold text-gray-900">{metrics.totalClients > 0 ? Math.round((metrics.consultationCount / metrics.totalClients) * 100) : 0}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-3">
                     <div className="bg-gray-900 h-3 rounded-full transition-all duration-1000" style={{ width: `${metrics.totalClients > 0 ? (metrics.consultationCount / metrics.totalClients) * 100 : 0}%` }}></div>
                  </div>
                </div>

                {/* Item 2: Weekly */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                     <span className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <span className="h-3 w-3 rounded-full bg-primary shrink-0"></span> Weekly Meeting
                     </span>
                     <span className="text-sm font-bold text-primary">{metrics.totalClients > 0 ? Math.round((metrics.weeklyCount / metrics.totalClients) * 100) : 0}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-3">
                     <div className="bg-primary h-3 rounded-full transition-all duration-1000" style={{ width: `${metrics.totalClients > 0 ? (metrics.weeklyCount / metrics.totalClients) * 100 : 0}%` }}></div>
                  </div>
                </div>

                {/* Item 3: Biweekly */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                     <span className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <span className="h-3 w-3 rounded-full bg-secondary shrink-0"></span> Biweekly
                     </span>
                     <span className="text-sm font-bold text-secondary">{metrics.totalClients > 0 ? Math.round((metrics.biweeklyCount / metrics.totalClients) * 100) : 0}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-3">
                     <div className="bg-secondary h-3 rounded-full transition-all duration-1000" style={{ width: `${metrics.totalClients > 0 ? (metrics.biweeklyCount / metrics.totalClients) * 100 : 0}%` }}></div>
                  </div>
                </div>

             </div>

             <div className="pt-6 border-t border-gray-100 mt-6 flex justify-between items-center text-xs text-gray-500">
               <span>Total Klien Tercatat</span>
               <span className="font-bold text-gray-900">{metrics.totalClients} Data</span>
             </div>
          </div>
        </div>

        {/* ── ROW 2.5: MONTHLY CALENDAR HEATMAP (ANALYTIC EXCLUSIVE) ── */}
        {activeTab === "analytic" && (
          <div className="rounded-xl bg-white p-6 md:p-8 shadow-sm border border-gray-200 relative pb-20 overflow-hidden">
             <div className="flex items-center justify-between mb-8">
               <h3 className="font-semibold text-gray-900 text-lg">Status Kalender Bulan Ini</h3>
               <button className="flex items-center gap-2 border border-gray-200 bg-gray-50 rounded-md px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-100 transition-colors">
                 <Calendar size={14}/> April 2026
               </button>
             </div>

             {/* Grid Calendar 31 Hari */}
             <div className="grid grid-cols-5 sm:grid-cols-7 md:grid-cols-[repeat(11,minmax(0,1fr))] gap-1.5 sm:gap-2 md:gap-3">
               {Array.from({ length: 31 }).map((_, i) => {
                 const day = i + 1;
                 const dayStr = day.toString().padStart(2, "0");
                 // Menggunakan bulan April 2026 sebagai sampel/basis dinamis berjalan
                 const dayBookings = data.filter(b => b.booking_date.includes(`-04-${dayStr}`));
                 
                 let bgClass = "bg-gray-50 text-gray-400 border border-gray-100"; // Kosong putih-abu
                 
                 if (dayBookings.length > 0) {
                   const done = dayBookings.filter(b => b.status === "Meeting Done").length;
                   const approved = dayBookings.filter(b => b.status === "Approved").length;
                   const pending = dayBookings.filter(b => b.status === "New Request" || b.status === "pending").length;
                   
                   if (done > 0 && approved === 0 && pending === 0) {
                      bgClass = "bg-gray-900 text-white shadow-sm ring-1 ring-offset-2 ring-gray-900 hover:scale-105"; // Hitam
                   } else if (approved > 0 || done > 0) {
                      bgClass = "bg-secondary text-white shadow-sm shadow-secondary/30 ring-1 ring-offset-2 ring-secondary hover:scale-105"; // Tosca
                   } else {
                      bgClass = "bg-primary text-white shadow-sm shadow-primary/30 ring-1 ring-offset-2 ring-primary hover:scale-105"; // Oren
                   }
                 }

                 const isSelected = selectedDate === day;

                 return (
                   <div 
                     key={day} 
                     onClick={() => setSelectedDate(isSelected ? null : day)}
                     className={`aspect-square rounded-lg sm:rounded-2xl flex items-center justify-center text-xs sm:text-sm font-bold cursor-pointer transition-transform duration-300 ${bgClass} ${isSelected ? 'ring-2 ring-primary scale-105 z-10' : ''}`}>
                      {dayStr}
                   </div>
                 );
               })}
             </div>

             {/* Legend Floating Label */}
             <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 sm:gap-6 bg-white/90 backdrop-blur-md px-4 sm:px-6 py-2.5 sm:py-3 rounded-full border border-gray-200 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.1)] text-[10px] sm:text-xs font-semibold text-gray-600 z-10 w-max">
                <span className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-secondary"></span> Booked</span>
                <span className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-primary"></span> Pending</span>
                <span className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-gray-900"></span> Completed</span>
                <span className="flex items-center gap-2 hidden sm:flex"><span className="w-3 h-3 rounded border border-gray-200 bg-gray-50"></span> Empty</span>
             </div>
          </div>
        )}

        {/* Selected Date Analytics Detail */}
        {activeTab === "analytic" && selectedDate !== null && (
          <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-200 mt-2">
             {(() => {
                const dayStr = selectedDate.toString().padStart(2, "0");
                const dayBookings = data.filter(b => b.booking_date.includes(`-04-${dayStr}`));
                return (
                  <>
                    <h3 className="font-semibold text-gray-900 text-[15px] mb-4 flex items-center gap-2">
                       <Calendar size={16} className="text-primary"/> Rincian Jadwal: <span className="text-gray-500 font-medium"> {dayStr} April 2026</span>
                    </h3>
                    {dayBookings.length === 0 ? (
                      <div className="py-8 text-center bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
                        <span className="text-sm font-medium text-gray-400">Tidak ada jadwal tercatat pada tanggal ini.</span>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {dayBookings.map(b => {
                           const isApproved = b.status === "Approved" || b.status === "Meeting Done";
                           return (
                             <div key={b.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 rounded-xl border border-gray-100 bg-gray-50 hover:bg-white hover:shadow-sm transition-all gap-3">
                                <div className="flex items-center gap-3 sm:gap-4">
                                   <div className="hidden sm:flex h-10 w-10 items-center justify-center rounded-full bg-white border border-gray-200 text-gray-700 font-bold text-sm shrink-0">
                                      {b.brand_name.charAt(0).toUpperCase()}
                                   </div>
                                   <div className="min-w-0">
                                      <p className="font-bold text-gray-900 text-sm truncate">{b.brand_name}</p>
                                      <p className="text-gray-500 text-xs mt-1 truncate">{b.email} <span className="mx-1">•</span> {b.meeting_type}</p>
                                   </div>
                                </div>
                                <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-6 sm:text-right">
                                   <div className="flex sm:flex-col items-center sm:items-end gap-2 sm:gap-0">
                                      <p className="font-bold text-gray-900 text-xs sm:text-sm flex items-center gap-1.5"><Clock size={14} className="text-gray-400"/> {formatTimeForDisplay(b.booking_time)} WIB</p>
                                      <p className={`text-[10px] sm:mt-1.5 font-bold uppercase tracking-wider px-2 py-0.5 rounded-md inline-block ${isApproved ? 'bg-secondary/10 text-secondary' : 'bg-primary/10 text-primary'}`}>{b.status}</p>
                                   </div>
                                </div>
                             </div>
                           )
                        })}
                      </div>
                    )}
                  </>
                );
             })()}
          </div>
        )}
        </div>
        )}

        {(activeTab === "dashboard" || activeTab === "history") && (
        <div className="mt-4 sm:mt-6">
        
        {/* ── ROW 3: LIST TABEL ── */}
        <div className="rounded-xl bg-white shadow-sm border border-gray-200 overflow-hidden">
          
          <div className="p-4 sm:p-6 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-3">
              <input 
                type="checkbox" 
                checked={filteredData.length > 0 && selectedIds.size === filteredData.length}
                onChange={handleSelectAll}
                className="w-4 h-4 rounded text-primary border-gray-300 appearance-none checked:bg-primary checked:border-primary border relative after:content-[''] after:absolute after:hidden checked:after:block after:left-[4px] after:top-[1px] after:w-[5px] after:h-[10px] after:border-solid after:border-white after:border-b-2 after:border-r-2 after:rotate-45 md:hidden"
              />
              <h3 className="font-semibold text-gray-900 text-base sm:text-lg flex items-center gap-2">
                <FileText size={18} className="text-gray-500"/> Booking History
              </h3>
            </div>
            
            <div className="flex items-center gap-3 w-full sm:w-auto">
              {selectedIds.size > 0 && (
                <button 
                  onClick={handleBulkDelete}
                  disabled={isDeleting.bulk}
                  className="flex items-center gap-2 shrink-0 bg-destructive text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-700 transition shadow-sm disabled:opacity-50"
                >
                  <Trash2 size={16}/> {isDeleting.bulk ? "Menghapus..." : `Hapus ${selectedIds.size}`}
                </button>
              )}

              <div className="relative w-full sm:w-64 shrink-0">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search clients..." 
                  className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-4 text-sm text-gray-900 outline-none focus:ring-1 focus:ring-primary focus:border-primary placeholder:text-gray-400"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* ═══ MOBILE CARD VIEW ═══ */}
          <div className="md:hidden divide-y divide-gray-100">
            {filteredData.length === 0 ? (
              <div className="py-12 text-center">
                <Search size={28} className="mx-auto text-gray-300 mb-2"/>
                <p className="text-gray-500 text-sm">Tidak ada data ditemukan.</p>
              </div>
            ) : filteredData.map(d => {
              const isApproved = d.status === 'Approved' || d.status === 'approved';
              const isNew = d.status === 'New Request' || d.status === 'pending';
              const isDone = d.status === 'Meeting Done';
              const isSelected = selectedIds.has(d.id);
              
              let statusColorClasses = "bg-gray-100 text-gray-700";
              if (isApproved) statusColorClasses = "bg-secondary/10 text-secondary";
              if (isNew) statusColorClasses = "bg-primary/10 text-primary";
              if (isDone) statusColorClasses = "bg-gray-900 text-white";

              return (
                <div key={d.id} className={`p-4 ${isSelected ? 'bg-primary/5' : ''}`}>
                  <div className="flex items-start gap-3">
                    <input 
                      type="checkbox" 
                      checked={isSelected}
                      onChange={() => handleSelectToggle(d.id)}
                      className="w-4 h-4 mt-1 rounded text-primary border-gray-300 appearance-none checked:bg-primary checked:border-primary border cursor-pointer relative after:content-[''] after:absolute after:hidden checked:after:block after:left-[4px] after:top-[1px] after:w-[5px] after:h-[10px] after:border-solid after:border-white after:border-b-2 after:border-r-2 after:rotate-45 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="h-8 w-8 bg-gray-100 rounded-full flex justify-center items-center font-semibold text-xs text-gray-600 shrink-0">
                            {d.brand_name.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-semibold text-gray-900 text-sm truncate">{d.brand_name}</span>
                        </div>
                        <button 
                          onClick={() => handleDeleteSingle(d.id)}
                          disabled={isDeleting[d.id]}
                          className="text-gray-400 hover:text-destructive p-1.5 rounded-md shrink-0"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 truncate mb-3">{d.email}</p>
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <span className="bg-gray-100 px-2 py-0.5 rounded font-medium">{d.meeting_type}</span>
                          <span className="font-medium">{formatDateForDisplay(d.booking_date)}</span>
                          <span className="text-gray-400">{formatTimeForDisplay(d.booking_time)}</span>
                        </div>
                        <div className="relative shrink-0">
                          <select 
                            value={d.status} 
                            onChange={(e) => handleUpdateStatus(d.id, e.target.value as BookingStatus, d.email, d.brand_name)} 
                            className={`appearance-none text-[10px] font-bold px-2.5 py-1 pr-5 rounded-full outline-none focus:outline-none focus-visible:outline-none focus:ring-0 cursor-pointer ${statusColorClasses}`}
                          >
                            {STATUS_LIST.map(st => <option key={st} value={st} className="text-gray-900 bg-white font-normal">{st}</option>)}
                          </select>
                          <ChevronDown size={10} className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-50"/>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ═══ DESKTOP TABLE VIEW ═══ */}
          <div className="w-full overflow-x-auto hidden md:block">
             <table className="w-full text-left min-w-[950px] border-collapse">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-3 px-4 w-12 text-center border-b border-gray-200">
                      <input 
                        type="checkbox" 
                        checked={filteredData.length > 0 && selectedIds.size === filteredData.length}
                        onChange={handleSelectAll}
                        className="w-4 h-4 rounded text-primary border-gray-300 focus:ring-primary appearance-none checked:bg-primary checked:border-primary border relative after:content-[''] after:absolute after:hidden checked:after:block after:left-[4px] after:top-[1px] after:w-[5px] after:h-[10px] after:border-solid after:border-white after:border-b-2 after:border-r-2 after:rotate-45"
                      />
                    </th>
                    <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200">Nama Klien</th>
                    <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200">Tipe Meeting</th>
                    <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200">Kredensial Email</th>
                    <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200">Tanggal (WIB)</th>
                    <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200 text-center">Status Jadwal</th>
                    <th className="py-3 px-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200">Aksi</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {filteredData.length === 0 ? (
                     <tr><td colSpan={7} className="py-16 text-center">
                       <Search size={32} className="mx-auto text-gray-300 mb-2"/>
                       <p className="text-gray-500 text-sm">Tidak ada data ditemukan.</p>
                     </td></tr>
                  ) : filteredData.map(d => {
                    const isApproved = d.status === 'Approved' || d.status === 'approved';
                    const isNew = d.status === 'New Request' || d.status === 'pending';
                    const isDone = d.status === 'Meeting Done';
                    const isSelected = selectedIds.has(d.id);
                    
                    let statusColorClasses = "bg-gray-100 text-gray-700 border border-gray-200";
                    if (isApproved) statusColorClasses = "bg-secondary/10 text-secondary border border-secondary/20";
                    if (isNew) statusColorClasses = "bg-primary/10 text-primary border border-primary/20";
                    if (isDone) statusColorClasses = "bg-gray-900 text-white border border-gray-900";

                    return (
                      <tr key={d.id} className={`hover:bg-gray-50 transition-colors ${isSelected ? 'bg-primary/5' : ''}`}>
                         <td className="py-3 px-4 text-center">
                            <input 
                              type="checkbox" 
                              checked={isSelected}
                              onChange={() => handleSelectToggle(d.id)}
                              className="w-4 h-4 rounded text-primary border-gray-300 focus:ring-primary appearance-none checked:bg-primary checked:border-primary border cursor-pointer relative after:content-[''] after:absolute after:hidden checked:after:block after:left-[4px] after:top-[1px] after:w-[5px] after:h-[10px] after:border-solid after:border-white after:border-b-2 after:border-r-2 after:rotate-45"
                            />
                         </td>
                         <td className="py-3 px-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                               <div className="h-8 w-8 bg-gray-100 rounded-full flex justify-center items-center font-semibold text-sm text-gray-600">
                                 {d.brand_name.charAt(0).toUpperCase()}
                               </div>
                               <span className="font-medium text-gray-900 text-sm">{d.brand_name}</span>
                            </div>
                         </td>
                         <td className="py-3 px-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-gray-100 text-xs font-medium text-gray-700">
                              {d.meeting_type}
                            </span>
                         </td>
                         <td className="py-3 px-4 whitespace-nowrap">
                            <span className="text-sm text-gray-500">{d.email}</span>
                         </td>
                         <td className="py-3 px-4 whitespace-nowrap">
                            <div className="flex flex-col">
                              <span className="font-medium text-gray-900 text-sm">{formatDateForDisplay(d.booking_date)}</span>
                              <span className="text-gray-500 text-xs mt-0.5">{formatTimeForDisplay(d.booking_time)}</span>
                            </div>
                         </td>
                         <td className="py-3 px-4 whitespace-nowrap text-center">
                           <div className="relative inline-block w-36">
                             <select 
                               value={d.status} 
                               onChange={(e) => handleUpdateStatus(d.id, e.target.value as BookingStatus, d.email, d.brand_name)} 
                               className={`appearance-none w-full text-xs font-medium px-3 py-1.5 rounded-full outline-none focus:outline-none focus-visible:outline-none focus:ring-0 focus:border-transparent cursor-pointer text-center ${statusColorClasses}`}
                             >
                               {STATUS_LIST.map(st => <option key={st} value={st} className="text-gray-900 bg-white font-normal">{st}</option>)}
                             </select>
                             <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-50"/>
                           </div>
                         </td>
                         <td className="py-3 px-4 whitespace-nowrap text-right">
                           <button 
                             onClick={() => handleDeleteSingle(d.id)}
                             disabled={isDeleting[d.id]}
                             className="text-gray-400 hover:text-destructive hover:bg-red-50 disabled:opacity-50 transition-colors p-2 rounded-md"
                           >
                             <Trash2 size={16} />
                           </button>
                         </td>
                      </tr>
                    );
                  })}
                </tbody>
             </table>
          </div>
        </div>
        </div>
        )}

      </main>
    </div>
  );
}
