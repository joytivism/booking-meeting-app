-- Supabase seed script for booking meeting application

-- 1. Create bookings table if it does not exist
create table if not exists public.bookings (
  id uuid default gen_random_uuid() primary key,
  brand_name text not null,
  email text not null,
  secondary_email text,
  meeting_type text not null,
  booking_date date not null,
  booking_time time not null,
  status text not null default 'New Request' check (status in ('New Request', 'Approved', 'Meeting Done', 'Follow-up')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Create index for date and time lookup
create index if not exists idx_bookings_date_time on public.bookings (booking_date, booking_time);

-- 3. Optional sample booking data for development
insert into public.bookings (brand_name, email, secondary_email, meeting_type, booking_date, booking_time, status)
values
  ('Real Advertise', 'client@example.com', 'cc@example.com', 'Consultation Session', current_date + 3, '10:00', 'New Request'),
  ('Acme Studio', 'hello@acme.com', null, 'Weekly Meeting', current_date + 5, '14:00', 'Approved');
