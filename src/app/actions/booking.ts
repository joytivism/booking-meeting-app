"use server";

import { getSupabaseServer } from "@/lib/supabase";
import type { ActionResult, Booking, BookingStatus } from "@/types";
import { Resend } from "resend";
import { revalidatePath } from "next/cache";

const resend = new Resend(process.env.RESEND_API_KEY);

/* ═══════════════════════════════════════════════════════
   Server Actions — Booking
   ═══════════════════════════════════════════════════════ */

/**
 * Submit a new booking.
 * Includes server-side re-validation to prevent race conditions (double booking).
 */
export async function submitBooking(data: {
  brandName: string;
  email: string;
  secondaryEmail?: string;
  meetingType: string;
  bookingDate: string;
  bookingTime: string;
}): Promise<ActionResult> {
  try {
    const { brandName, email, secondaryEmail, meetingType, bookingDate, bookingTime } = data;

    // Basic validation
    if (!brandName || !email || !meetingType || !bookingDate || !bookingTime) {
      return { success: false, error: "Semua field wajib diisi." };
    }

    const supabase = getSupabaseServer();

    // ── Lock on Submit: Re-check slot availability ──
    const { data: existing, error: checkError } = await supabase
      .from("bookings")
      .select("id")
      .eq("booking_date", bookingDate)
      .eq("booking_time", bookingTime)
      .in("status", ["New Request", "Approved", "Follow-up", "pending", "approved"])
      .limit(1);

    if (checkError) {
      console.error("Slot check error:", checkError);
      return { success: false, error: "Gagal memeriksa ketersediaan slot." };
    }

    if (existing && existing.length > 0) {
      return {
        success: false,
        error: "Slot ini sudah terisi. Silakan pilih waktu lain.",
      };
    }

    // ── Insert booking ──
    // Try new schema first, fall back to old schema if column doesn't exist yet
    let inserted = null;
    let insertError = null;

    const newSchemaPayload = {
      brand_name: brandName,
      email,
      secondary_email: secondaryEmail || null,
      meeting_type: meetingType,
      booking_date: bookingDate,
      booking_time: bookingTime,
      status: "New Request",
    };

    const result1 = await supabase
      .from("bookings")
      .insert(newSchemaPayload)
      .select()
      .single();

    if (result1.error) {
      // Fallback: old schema still has whatsapp column and pending status
      console.warn("New schema insert failed, trying old schema fallback:", result1.error.message);
      const oldSchemaPayload = {
        brand_name: brandName,
        email,
        whatsapp: secondaryEmail || "-",
        meeting_type: meetingType,
        booking_date: bookingDate,
        booking_time: bookingTime,
        status: "pending",
      };
      const result2 = await supabase
        .from("bookings")
        .insert(oldSchemaPayload)
        .select()
        .single();
      inserted = result2.data;
      insertError = result2.error;
    } else {
      inserted = result1.data;
    }

    if (insertError) {
      console.error("Insert error:", insertError);
      return { success: false, error: "Gagal menyimpan booking." };
    }

    return { success: true, data: inserted as Booking };
  } catch (err) {
    console.error("submitBooking error:", err);
    return { success: false, error: "Terjadi kesalahan server." };
  }
}

/**
 * Get booked time slots for a specific date.
 * Returns array of times that are already taken (pending or approved).
 */
export async function getBookedSlots(date: string): Promise<string[]> {
  try {
    const supabase = getSupabaseServer();

    const { data, error } = await supabase
      .from("bookings")
      .select("booking_time")
      .eq("booking_date", date)
      .in("status", ["New Request", "Approved", "Follow-up", "pending", "approved"]);

    if (error) {
      console.error("getBookedSlots error:", error);
      return [];
    }

    return (data || []).map((row) => row.booking_time);
  } catch (err) {
    console.error("getBookedSlots error:", err);
    return [];
  }
}

/**
 * Fetch all bookings for admin dashboard.
 * Ordered by created_at descending (newest first).
 */
export async function fetchAllBookings(): Promise<Booking[]> {
  try {
    const supabase = getSupabaseServer();

    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("fetchAllBookings error:", error);
      return [];
    }

    return (data || []) as Booking[];
  } catch (err) {
    console.error("fetchAllBookings error:", err);
    return [];
  }
}

/* ═══════════════════════════════════════════════════════
   Approval / Rejection with Resend Email
   ═══════════════════════════════════════════════════════ */

export async function updateBookingStatus(
  id: string,
  newStatus: BookingStatus,
  clientEmail: string,
  clientName: string
): Promise<ActionResult> {
  try {
    const supabase = getSupabaseServer();

    // 1. Update status
    const { data, error } = await supabase
      .from("bookings")
      .update({ status: newStatus })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("updateBookingStatus DB error:", error);
      return { success: false, error: "Gagal mengubah status di database." };
    }

    // 2. Send Email via Resend ONLY if Approved
    if (newStatus === "Approved" && process.env.RESEND_API_KEY) {
      try {
        const meetingDate = new Date(data.booking_date).toLocaleDateString("id-ID", {
          weekday: "long", year: "numeric", month: "long", day: "numeric"
        });
        
        const htmlContent = `
        <div style="font-family: 'Inter', Helvetica, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eaeaea; border-radius: 12px; overflow: hidden; background-color: #ffffff;">
          <div style="background-color: #ff6301; padding: 24px 32px; text-align: center;">
             <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">Real Advertise</h1>
          </div>
          <div style="padding: 40px 32px;">
            <p style="font-size: 16px; color: #333333; margin-top: 0;">Halo <strong style="color: #111111;">${clientName}</strong>,</p>
            <p style="font-size: 16px; color: #555555; line-height: 1.6;">
              Jadwal Anda untuk sesi <strong style="color: #ff6301;">${data.meeting_type}</strong> bersama tim Real Advertise telah resmi kami konfirmasi.
            </p>
            
            <div style="margin: 32px 0; padding: 24px; background-color: #f9fafb; border-radius: 10px; border-left: 4px solid #00a1a6;">
               <h3 style="margin-top: 0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: #888888; margin-bottom: 16px;">Rincian Jadwal Anda</h3>
               <table style="width: 100%; border-collapse: collapse;">
                 <tr>
                   <td style="padding: 8px 0; border-bottom: 1px solid #eeeeee; color: #666666; font-size: 15px; width: 100px;">Tanggal</td>
                   <td style="padding: 8px 0; border-bottom: 1px solid #eeeeee; color: #111111; font-size: 15px; font-weight: 600;">${meetingDate}</td>
                 </tr>
                 <tr>
                   <td style="padding: 8px 0; color: #666666; font-size: 15px;">Waktu</td>
                   <td style="padding: 8px 0; color: #111111; font-size: 15px; font-weight: 600;">${data.booking_time} WIB</td>
                 </tr>
               </table>
            </div>

            <p style="font-size: 15px; color: #555555; line-height: 1.6; margin-bottom: 32px;">
              Tim representatif kami akan menghubungi Anda melalui saluran komunikasi yang terdaftar sesaat sebelum sesi dimulai untuk memastikan ketersediaan.
            </p>
            
            <p style="font-size: 15px; color: #888888; margin-bottom: 0;">Salam Hangat,</p>
            <p style="font-size: 16px; font-weight: 700; color: #111111; margin-top: 4px;">Tim Real Advertise</p>
          </div>
          <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #eaeaea; font-size: 12px; color: #aaaaaa;">
             Email ini dikirim secara otomatis. Mohon tidak membalas email ini secara langsung.
          </div>
        </div>
        `;

        const { data: emailData, error: emailError } = await resend.emails.send({
          from: "Real Advertise <hello@realadvertise.co.id>",
          to: [clientEmail],
          subject: "Jadwal Terkonfirmasi - Real Advertise",
          html: htmlContent,
        });

        if (emailError) {
          console.error("Resend API error details:", emailError);
          return { 
            success: false, 
            error: `Status diperbarui, tapi EMAIL GAGAL dikirim: ${emailError.message || "Unknown error"}` 
          };
        } else {
          console.log("Approve Email sent successfully:", emailData);
        }
      } catch (err: unknown) {
        console.error("Resend API exception:", err);
        const errorMessage = err instanceof Error ? err.message : "Unknown exception";
        return { 
          success: false, 
          error: `Error koneksi Resend: ${errorMessage}` 
        };
      }
    } else if (newStatus === "Approved" && !process.env.RESEND_API_KEY) {
      console.warn("RESEND_API_KEY is missing. Approve Email not sent.");
      return { success: false, error: "RESEND_API_KEY tidak ditemukan di server." };
    }

    // 3. Revalidate path to update UI
    revalidatePath("/admin");
    return { success: true, data: data as Booking };
  } catch (err) {
    console.error("updateBookingStatus error:", err);
    return { success: false, error: "Terjadi kesalahan server saat update status." };
  }
}

/* ═══════════════════════════════════════════════════════
   Deletion
   ═══════════════════════════════════════════════════════ */

export async function deleteBooking(id: string): Promise<ActionResult> {
  try {
    const supabase = getSupabaseServer();
    const { data, error } = await supabase.from("bookings").delete().eq("id", id).select().single();
    if (error) {
       console.error("Delete single error:", error);
       return { success: false, error: "Gagal menghapus data klien." };
    }
    revalidatePath("/admin");
    return { success: true, data: data as Booking };
  } catch (err) {
    return { success: false, error: "Terjadi kesalahan server saat menghapus." };
  }
}

export async function bulkDeleteBookings(ids: string[]): Promise<ActionResult> {
  if (!ids || ids.length === 0) return { success: false, error: "Tidak ada ID klien yang dipilih." };
  try {
    const supabase = getSupabaseServer();
    const { error } = await supabase.from("bookings").delete().in("id", ids);
    if (error) {
       console.error("Bulk Delete error:", error);
       return { success: false, error: "Gagal menghapus beberapa klien secara bersamaan." };
    }
    revalidatePath("/admin");
    return { success: true };
  } catch (err) {
    return { success: false, error: "Terjadi kesalahan server saat hapus massal." };
  }
}
