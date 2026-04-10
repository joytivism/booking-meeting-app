-- ==============================================================================
-- STRUKTUR SKEMA BARU: "Real Advertise Booking"
-- Silakan Jalankan Keseluruhan Script ini di Supabase SQL Editor Anda
-- ==============================================================================

-- 1. Buat tabel bookings (Jika belum ada)
create table if not exists public.bookings (
  id uuid default gen_random_uuid() primary key,
  brand_name text not null,
  email text not null,
  secondary_email text, -- (NEW) Email CC Optional, menggantikan whatsapp
  meeting_type text not null,
  booking_date date not null,
  booking_time time not null,
  status text not null default 'New Request' check (status in ('New Request', 'Approved', 'Meeting Done', 'Follow-up')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Matikan Row Level Security (RLS) 
-- Karena kita menggunakan Service Role Key di server (Backend / API Route),
-- kita tidak perlu RLS layer untuk public / anon user.
alter table public.bookings disable row level security;

-- (Opsional) Tambahkan Index agar pencarian tanggal + jam lebih cepat
create index if not exists idx_bookings_date_time on public.bookings (booking_date, booking_time);

-- ==============================================================================
-- (MIGRATION) Jika Anda memperbarui tabel yang sudah ADA, HANYA jalankan perintah blok di bawah ini:
-- ==============================================================================
/*
-- Hapus kolom whatsapp yang lama
ALTER TABLE public.bookings DROP COLUMN IF EXISTS whatsapp;
-- Tambahkan kolom secondary email
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS secondary_email text;
-- Update nilai status yang lama agar cocok dengan konvensi baru
UPDATE public.bookings SET status = 'New Request' WHERE status = 'pending';
UPDATE public.bookings SET status = 'Approved' WHERE status = 'approved';
-- Terapkan Constraint baru untuk status
ALTER TABLE public.bookings ADD CONSTRAINT bookings_status_check check (status in ('New Request', 'Approved', 'Meeting Done', 'Follow-up'));
ALTER TABLE public.bookings ALTER COLUMN status SET DEFAULT 'New Request';
*/
