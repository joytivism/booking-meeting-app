"use client";

import { User, Bell } from "lucide-react";
import { useState } from "react";
import Image from "next/image";

export default function HistoryPlaceholder() {
  const [showNotif, setShowNotif] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-[#000000]">
      {/* ── HEADER UTAMA ── */}
      <header className="sticky top-0 z-50 flex h-[80px] items-center justify-between border-b border-gray-100 bg-[#ffffff] px-8 shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
        {/* Kiri: Logo */}
        <div className="flex items-center">
          <Image src="/logo.svg" alt="Real Advertise" width={140} height={35} className="h-8 w-auto object-contain" />
        </div>

        {/* Tengah: Navigasi Pill */}
        <nav className="hidden items-center gap-2 rounded-full border border-gray-100 p-1 lg:flex">
          <Link href="/admin" className="px-5 py-2 text-sm font-medium text-gray-500 hover:text-[#000000]">Dashboard</Link>
          <Link href="/admin/analytic" className="px-5 py-2 text-sm font-medium text-gray-500 hover:text-[#000000]">Analytic</Link>
          <Link href="/admin/history" className="rounded-full bg-[#000000] px-5 py-2 text-sm font-medium text-[#ffffff]">History</Link>
        </nav>

        {/* Kanan: Icons & Profile */}
        <div className="flex items-center gap-4">
          <div className="relative">
             <button onClick={() => setShowNotif(!showNotif)} className="relative flex h-10 w-10 items-center justify-center rounded-full border border-gray-100 text-gray-500 transition hover:bg-gray-50">
               <Bell className="h-5 w-5" />
               <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#e50000]"></span>
             </button>
             {showNotif && (
               <div className="absolute right-0 top-12 w-48 rounded-xl bg-white p-4 shadow-lg border border-gray-100 text-sm">
                 Belum ada notifikasi baru
               </div>
             )}
          </div>
          <button className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-100 text-gray-500 transition hover:bg-gray-50">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
          </button>
          <div className="flex items-center gap-2 pl-2">
            <div className="h-10 w-10 overflow-hidden rounded-full border border-gray-100 bg-gray-50 text-gray-500">
               <User className="h-full w-full p-2" />
            </div>
            <div className="hidden flex-col md:flex">
              <span className="text-sm font-semibold">Admin Panel</span>
            </div>
          </div>
        </div>
      </header>

      <main className="flex flex-col items-center justify-center p-20 text-center">
        <h2 className="text-2xl font-bold">Halaman History</h2>
        <p className="mt-2 text-gray-500">Halaman sedang dalam pengembangan.</p>
      </main>
    </div>
  );
}
