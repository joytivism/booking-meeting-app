import type { DayOption } from "@/types";

/* ═══════════════════════════════════════════════════════
   Date Helper — Weekly Window Logic
   ═══════════════════════════════════════════════════════ */

const INDO_DAYS = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
const INDO_MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
  "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
];

/**
 * Get the next week's working days (Mon-Fri).
 *
 * "Next week" means the upcoming Monday–Friday block.
 * Rolling: recalculates based on current date.
 *
 * All dates are calculated in WIB (UTC+7) context.
 */
export function getNextWeekDays(): DayOption[] {
  const now = new Date();

  // Calculate days until next Monday
  // getDay(): 0=Sun, 1=Mon, ..., 6=Sat
  const currentDay = now.getDay();
  // If today is Sunday(0), next Monday is 1 day away
  // If today is Monday(1), next Monday is 7 days away
  // If today is Saturday(6), next Monday is 2 days away
  const daysUntilNextMonday = currentDay === 0 ? 1 : 8 - currentDay;

  const nextMonday = new Date(now);
  nextMonday.setDate(now.getDate() + daysUntilNextMonday);
  nextMonday.setHours(0, 0, 0, 0);

  const days: DayOption[] = [];

  for (let i = 0; i < 5; i++) {
    const date = new Date(nextMonday);
    date.setDate(nextMonday.getDate() + i);

    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");

    const dayName = INDO_DAYS[date.getDay()];
    const monthName = INDO_MONTHS[date.getMonth()];

    days.push({
      date: `${yyyy}-${mm}-${dd}`,
      label: `${dayName}, ${date.getDate()} ${monthName}`,
      dayName,
    });
  }

  return days;
}

/* ─────────────── Available Hours ─────────────── */

const ALL_HOURS = ["08:00", "10:00", "13:00", "15:00"];

/**
 * Get available time slots for a given day.
 * Business rule: Monday & Thursday → 08:00 is NOT available.
 */
export function getAvailableHours(dayName: string): string[] {
  if (dayName === "Senin" || dayName === "Kamis") {
    return ALL_HOURS.filter((h) => h !== "08:00");
  }
  return [...ALL_HOURS];
}

/**
 * Format DB time (e.g. "08:00:00") to display format ("08.00").
 */
export function formatTimeForDisplay(time: string): string {
  // Handle both "08:00" and "08:00:00"
  const parts = time.split(":");
  return `${parts[0]}.${parts[1]}`;
}

/**
 * Format display time (e.g. "08.00") to DB format ("08:00").
 */
export function formatTimeForDB(displayTime: string): string {
  return displayTime.replace(".", ":");
}
