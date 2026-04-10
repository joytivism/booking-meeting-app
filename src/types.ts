/* ═══════════════════════════════════════════════════════
   Shared Types — Real Advertise Booking
   ═══════════════════════════════════════════════════════ */

export type BookingStatus = "New Request" | "Approved" | "Meeting Done" | "Follow-up" | "pending" | "approved";

export interface Booking {
  id: string;
  brand_name: string;
  email: string;
  secondary_email?: string | null;
  meeting_type: string;
  booking_date: string; // "2026-04-13"
  booking_time: string; // "08:00:00"
  status: BookingStatus;
  created_at?: string;
}

export interface DayOption {
  date: string;      // "2026-04-13" (YYYY-MM-DD)
  label: string;     // "Senin, 13 Apr"
  dayName: string;   // "Senin"
}

export interface ActionResult {
  success: boolean;
  error?: string;
  data?: Booking;
}
