"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import Link from "next/link";
import { getNextWeekDays, getAvailableHours, formatTimeForDisplay } from "@/utils/dateHelper";
import { submitBooking, getBookedSlots } from "@/app/actions/booking";
import type { DayOption } from "@/types";
import { Check, ChevronUp, ChevronDown, ArrowRight, LayoutDashboard, Calendar, Clock, AlertTriangle } from "lucide-react";

/* ───────────────────── Constants ───────────────────── */
const MEETING_TYPES = [
  { value: "Consultation", label: "Consultation Session", key: "A" },
  { value: "Weekly", label: "Weekly Meeting", key: "B" },
  { value: "Biweekly", label: "Biweekly", key: "C" },
];

/* ───────────────────── Reusable UI (outside render) ───────────────────── */
function Slide({ children, active, scrollable = false }: { children: React.ReactNode; active: boolean; scrollable?: boolean }) {
  return (
    <div className={`absolute inset-0 flex flex-col items-center justify-center transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${
      active ? 'opacity-100 translate-y-0 z-10' : 'opacity-0 translate-y-8 pointer-events-none -z-10'
    }`}>
      <div className={`w-full max-w-3xl mx-auto px-4 sm:px-6 ${
        scrollable ? 'max-h-[calc(100vh-160px)] overflow-y-auto scrollbar-hide py-10' : ''
      }`}>
        {children}
      </div>
    </div>
  );
}

function OkButton({ onClick, disabled = false, label = "OK" }: { onClick: () => void; disabled?: boolean; label?: string }) {
  return (
    <div className="flex items-center gap-4 mt-8 animate-fadeIn" style={{ animationDelay: '200ms', animationFillMode: 'both' }}>
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className="inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-3 text-sm font-semibold text-white transition-all hover:bg-primary/90 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
      >
        {label} <Check className="h-4 w-4" strokeWidth={2.5} />
      </button>
      <span className="text-xs text-gray-400 font-medium tracking-wide flex items-center gap-1.5 hidden sm:flex">
        tekan <strong className="text-gray-600">Enter ↵</strong>
      </span>
    </div>
  );
}

/* ───────────────── Component ───────────────── */
export default function BookingPage() {
  const weekDays = useMemo(() => getNextWeekDays(), []);

  /* ── Form state ── */
  const [step, setStep] = useState(0); // 0: welcome, 1: info, 2: type, 3: time, 4: success
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [secondaryEmail, setSecondaryEmail] = useState("");
  const [meetingType, setMeetingType] = useState("");
  const [selectedDay, setSelectedDay] = useState<DayOption | null>(null);
  const [selectedHour, setSelectedHour] = useState("");

  /* ── Availability state ── */
  const [bookedSlotsDict, setBookedSlotsDict] = useState<Record<string, string[]>>({});
  const [loadingSlots, setLoadingSlots] = useState(false);

  /* ── UI state ── */
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  /* ── Fetch booked slots ── */
  const fetchAllSlots = useCallback(async () => {
    setLoadingSlots(true);
    try {
      const dict: Record<string, string[]> = {};
      for (const day of weekDays) {
        const slots = await getBookedSlots(day.date);
        dict[day.date] = slots;
      }
      setBookedSlotsDict(dict);
    } catch { /* ignore */ } finally { setLoadingSlots(false); }
  }, [weekDays]);

  useEffect(() => { fetchAllSlots(); }, [fetchAllSlots]);

  const isDayFullyBooked = (day: DayOption) => {
    const totalHours = getAvailableHours(day.dayName).filter(h => h !== "19:00");
    const booked = bookedSlotsDict[day.date] || [];
    return totalHours.filter((h) => booked.some(b => b.startsWith(h))).length >= totalHours.length;
  };

  const isSlotBooked = (hour: string): boolean => {
    if (!selectedDay) return false;
    const bookedSlots = bookedSlotsDict[selectedDay.date] || [];
    return bookedSlots.some((slot) => slot.startsWith(hour) || slot === hour);
  };

  /* ── Navigation ── */
  const totalSteps = 4; // 0, 1, 2, 3 (4 is success)
  
  const canGoNext = () => {
    if (step === 0) return true;
    if (step === 1) {
      const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      return name.trim().length > 1 && isValidEmail;
    }
    if (step === 2) return !!meetingType;
    if (step === 3) return !!selectedDay && !!selectedHour;
    return false;
  };

  const goNext = () => {
    if (canGoNext() && step < totalSteps - 1) setStep(s => s + 1);
  };
  const goPrev = () => { if (step > 0) setStep(s => s - 1); };

  /* ── Keyboard navigation ── */
  const canGoNextRef = useRef(canGoNext);
  const goNextRef = useRef(goNext);
  canGoNextRef.current = canGoNext;
  goNextRef.current = goNext;

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'TEXTAREA') return;
      if (e.key === "Enter" && canGoNextRef.current()) {
        e.preventDefault();
        goNextRef.current();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  /* ── Submit ── */
  const handleSubmit = async () => {
    setError("");
    if (!selectedDay || !selectedHour) return;
    setLoading(true);
    try {
      const result = await submitBooking({
        brandName: name, email, secondaryEmail, meetingType,
        bookingDate: selectedDay.date, bookingTime: selectedHour,
      });
      if (result.success) setStep(4); 
      else { setError(result.error || "Gagal menyimpan booking."); fetchAllSlots(); }
    } catch { setError("Terjadi kesalahan jaringan."); } finally { setLoading(false); }
  };

  return (
    <div ref={containerRef} className="relative h-screen w-screen overflow-hidden bg-white font-sans">

      {/* ── Header ── */}
      <div className="fixed top-0 left-0 right-0 z-50 flex h-14 sm:h-16 items-center justify-between px-4 sm:px-8 bg-white border-b border-gray-100">
        <Link href="/" className="flex items-center gap-2.5 transition-transform hover:opacity-80">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-900 text-white">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>
          </div>
          <span className="text-base sm:text-lg font-bold tracking-tight text-gray-900">Real Advertise</span>
        </Link>
        <Link href="/admin" className="text-xs font-semibold text-gray-500 hover:text-gray-900 transition-colors px-3 py-1.5 rounded-md hover:bg-gray-50">
          Login Admin
        </Link>
      </div>

      {/* ── Progress bar ── */}
      <div className="fixed top-14 sm:top-16 left-0 right-0 z-40 h-1 bg-gray-100">
        <div className="h-full bg-primary transition-all duration-700 ease-out" style={{ width: `${(step / totalSteps) * 100}%` }} />
      </div>

      {/* ── Slides container ── */}
      <div className="relative h-full w-full pt-14 sm:pt-16 bg-white">

        {/* SLIDE 0: Welcome */}
        <Slide active={step === 0}>
          <div className="max-w-xl">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight text-gray-900 tracking-tight">
              Jadwalkan meeting dengan tim <span className="text-primary pr-1">Real Advertise</span>
            </h1>
            <p className="mt-4 sm:mt-6 text-base sm:text-lg text-gray-500 leading-relaxed max-w-md">
              Hanya butuh 2 menit. Kami akan menghubungi Anda setelah booking dikonfirmasi.
            </p>
            <div className="mt-10">
              <button
                onClick={goNext}
                className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-8 py-3.5 text-sm font-semibold text-white hover:bg-gray-800 transition-colors shadow-sm group"
              >
                Mulai Jadwalkan <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform"/>
              </button>
            </div>
          </div>
        </Slide>

        {/* SLIDE 1: Info */}
        <Slide active={step === 1}>
          <div className="max-w-xl w-full">
            <p className="text-sm font-semibold text-secondary mb-4 flex items-center gap-2 animate-fadeIn">
              1. Identitas <ArrowRight className="h-4 w-4" />
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-10 animate-fadeIn" style={{ animationDelay: '50ms', animationFillMode: 'both' }}>
              Kenali diri Anda.
            </h2>
            <div className="space-y-8 animate-fadeIn" style={{ animationDelay: '100ms', animationFillMode: 'both' }}>
              <div className="group">
                <label className="text-xs font-semibold text-gray-500 block mb-2 transition-colors">Nama Lengkap / Brand</label>
                <input
                  autoFocus
                  type="text"
                  value={name}
                  placeholder="Ketik di sini..."
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border-b border-gray-300 bg-transparent py-2 text-xl sm:text-2xl font-semibold text-gray-900 outline-none placeholder:text-gray-300 focus:border-primary transition-colors"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                 <div className="group">
                   <label className="text-xs font-semibold text-gray-500 block mb-2 transition-colors">Email Utama *</label>
                   <input
                     type="email"
                     value={email}
                     placeholder="contoh@domain.com"
                     onChange={(e) => setEmail(e.target.value)}
                     className="w-full border-b border-gray-300 bg-transparent py-2 text-lg font-medium text-gray-900 outline-none placeholder:text-gray-300 focus:border-primary transition-colors"
                   />
                 </div>
                 <div className="group">
                   <label className="text-xs font-semibold text-gray-500 block mb-2 transition-colors">Email CC (Opsional)</label>
                   <input
                     type="email"
                     value={secondaryEmail}
                     placeholder="tim@domain.com"
                     onChange={(e) => setSecondaryEmail(e.target.value)}
                     className="w-full border-b border-gray-300 bg-transparent py-2 text-lg font-medium text-gray-900 outline-none placeholder:text-gray-300 focus:border-primary transition-colors"
                   />
                 </div>
              </div>
            </div>
            <OkButton onClick={goNext} disabled={!canGoNext()} label="Selanjutnya" />
          </div>
        </Slide>

        {/* SLIDE 2: Type */}
        <Slide active={step === 2}>
          <div className="max-w-xl w-full">
            <p className="text-sm font-semibold text-secondary mb-4 flex items-center gap-2 animate-fadeIn">
              2. Kebutuhan <ArrowRight className="h-4 w-4" />
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 animate-fadeIn" style={{ animationDelay: '50ms', animationFillMode: 'both' }}>
              Halo, {name || 'Klien'}.<br />Meeting apa yang diinginkan?
            </h2>
            <div className="space-y-4 animate-fadeIn" style={{ animationDelay: '100ms', animationFillMode: 'both' }}>
              {MEETING_TYPES.map((type, index) => (
                <button
                  key={type.value}
                  onClick={() => { setMeetingType(type.value); setTimeout(goNext, 350); }}
                  className={`group flex w-full items-center gap-4 rounded-xl border p-4 text-left transition-all duration-200 ${
                    meetingType === type.value
                      ? 'border-primary bg-primary/5 ring-1 ring-primary'
                      : 'border-gray-200 bg-white hover:border-gray-300 shadow-sm'
                  }`}
                  style={{ animationDelay: `${150 + index * 50}ms`, animationFillMode: 'both' }}
                >
                  <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border text-xs font-semibold transition-colors ${
                    meetingType === type.value
                      ? 'border-primary bg-primary text-white'
                      : 'border-gray-200 bg-gray-50 text-gray-500 group-hover:border-gray-300 group-hover:text-gray-700'
                  }`}>
                    {type.key}
                  </span>
                  <span className={`text-base font-semibold transition-colors ${
                    meetingType === type.value ? 'text-primary' : 'text-gray-700 group-hover:text-gray-900'
                  }`}>
                    {type.label}
                  </span>
                  <div className="ml-auto flex items-center justify-center">
                     {meetingType === type.value && <Check className="h-5 w-5 text-primary animate-fadeIn" strokeWidth={2.5} />}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </Slide>

        {/* SLIDE 3: Schedule */}
        <Slide active={step === 3} scrollable>
          <div className="max-w-2xl w-full">
            <p className="text-sm font-semibold text-secondary mb-4 flex items-center gap-2 animate-fadeIn">
              3. Penjadwalan <ArrowRight className="h-4 w-4" />
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 animate-fadeIn" style={{ animationDelay: '50ms', animationFillMode: 'both' }}>
              Kapan waktu terbaik <br/>untuk Anda?
            </h2>

            {error && (
              <div className="mb-8 rounded-lg bg-red-50 border border-red-100 p-4 text-sm text-red-600 flex gap-2 items-center">
                <AlertTriangle className="shrink-0 h-4 w-4"/> 
                <span>{error}</span>
              </div>
            )}

            {/* Dates */}
            <div className="mb-10 animate-fadeIn" style={{ animationDelay: '100ms', animationFillMode: 'both' }}>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-4">Pilih Tanggal</label>
              <div className="flex flex-wrap gap-3">
                {weekDays.map((day) => {
                  const full = isDayFullyBooked(day);
                  const isSelected = selectedDay?.date === day.date;
                  return (
                    <button
                      key={day.date}
                      disabled={full}
                      onClick={() => { setSelectedDay(day); setSelectedHour(""); }}
                      className={`flex flex-col items-start rounded-xl border p-3 sm:p-4 transition-all duration-200 w-[calc(50%-6px)] sm:w-[120px] ${
                        full
                          ? 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed'
                          : isSelected
                          ? 'border-primary bg-primary/5 ring-1 ring-primary'
                          : 'border-gray-200 bg-white hover:border-gray-300 shadow-sm hover:shadow active:scale-95'
                      }`}
                    >
                      <span className={`text-xs font-medium uppercase tracking-wider mb-1 ${
                        isSelected ? 'text-primary' : 'text-gray-500'
                      }`}>
                        {day.dayName}
                      </span>
                      <span className={`text-lg font-bold ${isSelected ? 'text-gray-900' : 'text-gray-700'}`}>
                        {day.label.split(', ')[1]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Time slots */}
            {selectedDay && (
              <div className="mb-10 animate-fadeIn">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                   <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">Pilih Jam (WIB)</label>
                   {(selectedDay.dayName === "Senin" || selectedDay.dayName === "Kamis") && (
                     <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2.5 py-1 rounded-md">Jam 08.00 Off</span>
                   )}
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">
                  {getAvailableHours(selectedDay.dayName)
                    .filter(h => h !== "19:00")
                    .map((hour) => {
                      const booked = isSlotBooked(hour);
                      return (
                        <button
                          key={hour}
                          disabled={booked}
                          onClick={() => setSelectedHour(hour)}
                          className={`rounded-lg border py-3 text-sm font-semibold transition-all duration-200 ${
                            booked
                              ? 'border-gray-100 bg-gray-50 text-gray-400 line-through cursor-not-allowed'
                              : selectedHour === hour
                              ? 'border-primary bg-primary text-white shadow-sm'
                              : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50 shadow-sm active:scale-95'
                          }`}
                        >
                          {formatTimeForDisplay(hour)}
                        </button>
                      );
                  })}
                </div>
              </div>
            )}

            {/* Summary & Confirm */}
            {selectedDay && selectedHour && (
              <div className="animate-slideUp border-t border-gray-100 pt-8 mt-4">
                <div className="rounded-xl bg-gray-50 border border-gray-200 p-4 sm:p-6 mb-6">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Ringkasan Jadwal</p>
                  
                  <div className="space-y-4 text-sm">
                     <div className="flex justify-between items-center">
                        <span className="text-gray-500">Nama</span>
                        <span className="font-semibold text-gray-900">{name}</span>
                     </div>
                     <div className="flex justify-between items-center">
                        <span className="text-gray-500">Email</span>
                        <span className="font-semibold text-gray-900">{email}</span>
                     </div>
                     <div className="flex justify-between items-center">
                        <span className="text-gray-500">Tipe Meeting</span>
                        <span className="font-semibold text-primary">{meetingType}</span>
                     </div>
                     <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pt-4 border-t border-gray-200 gap-2">
                        <span className="text-gray-500">Waktu Pelaksanaan</span>
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 font-semibold text-gray-900">
                           <span className="flex items-center gap-1.5"><Calendar size={14} className="text-gray-400"/> {selectedDay.label}</span>
                           <span className="flex items-center gap-1.5"><Clock size={14} className="text-gray-400"/> {formatTimeForDisplay(selectedHour)}</span>
                        </div>
                     </div>
                  </div>
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-8 py-3.5 text-sm font-semibold text-white transition-all hover:bg-primary/90 active:scale-[0.98] disabled:opacity-50 shadow-sm"
                >
                  {loading ? "Memproses Data..." : "Konfirmasi & Jadwalkan"}
                </button>
              </div>
            )}
          </div>
        </Slide>

        {/* SLIDE 4: Success */}
        <Slide active={step === 4}>
          <div className="text-center animate-fadeIn max-w-sm mx-auto">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-secondary/10 text-secondary mb-8">
              <Check className="h-10 w-10" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Booking Berhasil!
            </h2>
            <p className="text-gray-500 leading-relaxed text-sm mb-8">
              Jadwal Anda telah terkonfirmasi. Tiket undangan telah dikirimkan ke email <strong className="text-gray-900 font-medium">{email}</strong>.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center justify-center rounded-xl bg-white border border-gray-200 px-6 py-2.5 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-50 shadow-sm"
            >
              Buat Sesi Baru
            </button>
          </div>
        </Slide>

      </div>

      {/* ── Navigation arrows (bottom right corner) ── */}
      {step > 0 && step < totalSteps && (
        <div className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-50 flex gap-2">
          <button
            onClick={goPrev}
            disabled={step === 0}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-white border border-gray-200 text-gray-500 transition-colors hover:bg-gray-50 shadow-sm disabled:opacity-50 disabled:hover:bg-white active:scale-95"
          >
            <ChevronUp className="h-5 w-5" />
          </button>
          <button
            onClick={goNext}
            disabled={!canGoNext() || step >= totalSteps - 1}
            className={`flex h-12 w-12 items-center justify-center rounded-full transition-all shadow-sm active:scale-95 ${
              canGoNext() 
                ? 'bg-primary border-primary text-white hover:bg-primary/90' 
                : 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            <ChevronDown className="h-5 w-5" />
          </button>
        </div>
      )}

    </div>
  );
}
