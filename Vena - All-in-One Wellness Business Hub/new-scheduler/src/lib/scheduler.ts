import type { AvailabilityWindow, Booking, Schedule } from "../types";
import { supabase } from "./supabaseClient";

// New Scheduler Tables Migration Script
// Run this in your Supabase SQL Editor to create the new tables

export const NEW_SCHEDULER_MIGRATION = `
-- Enable required extensions
create extension if not exists "pgcrypto" with schema public;
create extension if not exists "btree_gist" with schema public;

-- Create booking status enum
create type scheduler_booking_status as enum ('held', 'booked', 'canceled');

-- Create scheduler_schedules table
create table scheduler_schedules (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  slug text not null unique,
  title text not null default 'My Schedule',
  timezone text not null default 'Europe/Berlin',
  edit_token text not null unique,
  created_at timestamptz not null default now(),
  constraint scheduler_slug_format check (slug ~ '^[a-z0-9-]{3,}$')
);

-- Create scheduler_availability_windows table
create table scheduler_availability_windows (
  id uuid primary key default gen_random_uuid(),
  schedule_id uuid not null references scheduler_schedules(id) on delete cascade,
  weekday int not null check (weekday between 1 and 7),
  start_minute int not null check (start_minute between 0 and 1439),
  end_minute int not null check (end_minute between 1 and 1440),
  slot_minutes int not null check (slot_minutes in (15, 20, 30, 45, 60)),
  created_at timestamptz not null default now(),
  constraint scheduler_window_valid_range check (end_minute > start_minute)
);

-- Add constraint to prevent overlapping windows
alter table scheduler_availability_windows
  add constraint scheduler_window_no_overlap
  exclude using gist (
    schedule_id with =,
    weekday with =,
    int4range(start_minute, end_minute, '[]') with &&
  );

-- Create scheduler_bookings table
create table scheduler_bookings (
  id uuid primary key default gen_random_uuid(),
  schedule_id uuid not null references scheduler_schedules(id) on delete cascade,
  start_ts timestamptz not null,
  end_ts timestamptz not null,
  guest_name text not null,
  guest_phone text not null check (guest_phone ~ '^\+[1-9][0-9]{6,14}$'),
  status scheduler_booking_status not null default 'booked',
  hold_expires_at timestamptz,
  created_at timestamptz not null default now(),
  constraint scheduler_booking_valid_range check (end_ts > start_ts),
  unique (schedule_id, start_ts, end_ts)
);

-- Create indexes for better performance
create index scheduler_bookings_schedule_start_idx on scheduler_bookings (schedule_id, start_ts);
create index scheduler_availability_windows_schedule_weekday_idx on scheduler_availability_windows (schedule_id, weekday);

-- Enable Row Level Security
alter table scheduler_schedules enable row level security;
alter table scheduler_availability_windows enable row level security;
alter table scheduler_bookings enable row level security;
alter table scheduler_bookings force row level security;

-- Owner policies (for authenticated users)
create policy "Owner manage scheduler schedules" on scheduler_schedules
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

create policy "Owner manage scheduler windows" on scheduler_availability_windows
  using (
    exists (
      select 1
        from scheduler_schedules s
       where s.id = scheduler_availability_windows.schedule_id
         and s.owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
        from scheduler_schedules s
       where s.id = scheduler_availability_windows.schedule_id
         and s.owner_id = auth.uid()
    )
  );

create policy "Owner manage scheduler bookings" on scheduler_bookings
  using (
    exists (
      select 1
        from scheduler_schedules s
       where s.id = scheduler_bookings.schedule_id
         and s.owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
        from scheduler_schedules s
       where s.id = scheduler_bookings.schedule_id
         and s.owner_id = auth.uid()
    )
  );

-- Public read access policies
create policy "Public scheduler schedule lookup" on scheduler_schedules
  for select using (true);

create policy "Public scheduler availability lookup" on scheduler_availability_windows
  for select using (
    exists (
      select 1
        from scheduler_schedules s
       where s.id = scheduler_availability_windows.schedule_id
    )
  );

create policy "Public insert scheduler bookings" on scheduler_bookings
  for insert
  with check (
    coalesce(current_setting('request.jwt.claim.role', true), 'anon') in ('anon', 'authenticated')
    and status = 'booked'
    and hold_expires_at is null
  );

create policy "Public read scheduler bookings" on scheduler_bookings
  for select using (
    exists (
      select 1
        from scheduler_schedules s
       where s.id = scheduler_bookings.schedule_id
    )
  );

-- Set up permissions
revoke all on scheduler_schedules from public;
revoke all on scheduler_availability_windows from public;
revoke all on scheduler_bookings from public;

revoke all on scheduler_schedules from anon, authenticated;
revoke all on scheduler_availability_windows from anon, authenticated;
revoke all on scheduler_bookings from anon, authenticated;

-- Grant specific permissions
grant select (slug, title, timezone, owner_id) on scheduler_schedules to anon, authenticated;
grant select, insert, update, delete on scheduler_schedules to authenticated;
grant select, insert, update, delete on scheduler_availability_windows to authenticated;
grant select, update, delete on scheduler_bookings to authenticated;
grant insert on scheduler_bookings to anon, authenticated;
grant select, insert, update, delete on scheduler_schedules, scheduler_availability_windows, scheduler_bookings to service_role;

-- Create public bookings view
drop view if exists scheduler_public_bookings;
create or replace view scheduler_public_bookings with (security_barrier = true) as
select schedule_id, start_ts, end_ts, status
  from scheduler_bookings
 where status <> 'canceled';

grant select on scheduler_public_bookings to anon, authenticated;

-- Create booking function
create or replace function scheduler_attempt_booking(
  p_schedule_id uuid,
  p_start_ts timestamptz,
  p_end_ts timestamptz,
  p_guest_name text,
  p_guest_phone text
) returns scheduler_bookings
language plpgsql
set search_path = public
as $$
declare
  v_schedule scheduler_schedules%rowtype;
  v_window scheduler_availability_windows%rowtype;
  v_booking scheduler_bookings%rowtype;
  v_duration_minutes int;
  v_local_start timestamp;
  v_local_end timestamp;
  v_weekday int;
  v_start_minute int;
  v_end_minute int;
  v_lock_key bigint;
begin
  if p_end_ts <= p_start_ts then
    raise exception using message = 'INVALID_RANGE';
  end if;

  if p_start_ts < now() then
    raise exception using message = 'PAST_SLOT';
  end if;

  select * into v_schedule
    from scheduler_schedules
   where id = p_schedule_id
   limit 1;

  if not found then
    raise exception using message = 'SCHEDULE_NOT_FOUND';
  end if;

  v_duration_minutes := round(extract(epoch from (p_end_ts - p_start_ts)) / 60.0);

  if v_duration_minutes <= 0 then
    raise exception using message = 'INVALID_DURATION';
  end if;

  v_local_start := p_start_ts at time zone v_schedule.timezone;
  v_local_end := p_end_ts at time zone v_schedule.timezone;
  v_weekday := extract(isodow from v_local_start)::int;
  v_start_minute := (extract(hour from v_local_start)::int * 60) + extract(minute from v_local_start)::int;
  v_end_minute := (extract(hour from v_local_end)::int * 60) + extract(minute from v_local_end)::int;

  if v_end_minute <= v_start_minute then
    raise exception using message = 'INVALID_LOCAL_RANGE';
  end if;

  select * into v_window
    from scheduler_availability_windows
   where schedule_id = p_schedule_id
     and weekday = v_weekday
     and start_minute <= v_start_minute
     and end_minute >= v_end_minute
   order by start_minute
   limit 1;

  if not found then
    raise exception using message = 'OUTSIDE_AVAILABILITY';
  end if;

  if v_duration_minutes <> v_window.slot_minutes then
    raise exception using message = 'INVALID_SLOT_DURATION';
  end if;

  if mod(v_start_minute - v_window.start_minute, v_window.slot_minutes) <> 0 then
    raise exception using message = 'INVALID_SLOT_ALIGNMENT';
  end if;

  v_lock_key := hashtextextended(concat_ws('|', p_schedule_id::text, p_start_ts::text, p_end_ts::text), 0);
  perform pg_advisory_xact_lock(v_lock_key);

  if exists (
    select 1
      from scheduler_bookings b
     where b.schedule_id = p_schedule_id
       and b.status = 'booked'
       and tstzrange(b.start_ts, b.end_ts, '[)') && tstzrange(p_start_ts, p_end_ts, '[)')
  ) then
    raise exception using message = 'SLOT_TAKEN';
  end if;

  insert into scheduler_bookings (schedule_id, start_ts, end_ts, guest_name, guest_phone, status)
  values (p_schedule_id, p_start_ts, p_end_ts, p_guest_name, p_guest_phone, 'booked')
  returning * into v_booking;

  return v_booking;
end;
$$;

-- Grant permissions for the function
grant execute on function scheduler_attempt_booking(uuid, timestamptz, timestamptz, text, text) to anon, authenticated, service_role;
`;

export async function getScheduleBySlug(slug: string): Promise<Schedule> {
  const { data, error } = await supabase
    .from("scheduler_schedules")
    .select("id, owner_id, slug, title, timezone, edit_token, created_at")
    .eq("slug", slug)
    .single();

  if (error) {
    console.error('getScheduleBySlug error:', error);
    if (error.code === 'PGRST116') {
      throw Object.assign(new Error("Schedule not found"), { status: 404 });
    } else if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
      throw Object.assign(new Error("Access denied. Please check if the schedule is public."), { status: 401 });
    } else {
      throw error;
    }
  }

  if (!data) {
    throw Object.assign(new Error("Schedule not found"), { status: 404 });
  }

  return data as Schedule;
}

export async function getAvailabilityWindows(scheduleId: string): Promise<AvailabilityWindow[]> {
  const { data, error } = await supabase
    .from("scheduler_availability_windows")
    .select("id, schedule_id, weekday, start_minute, end_minute, slot_minutes, created_at")
    .eq("schedule_id", scheduleId)
    .order("weekday", { ascending: true })
    .order("start_minute", { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []) as AvailabilityWindow[];
}

export async function getBookings(scheduleId: string, fromIso: string, toIso: string): Promise<Booking[]> {
  const { data, error } = await supabase
    .from("scheduler_bookings")
    .select("id, schedule_id, start_ts, end_ts, guest_name, guest_phone, status, hold_expires_at, created_at")
    .eq("schedule_id", scheduleId)
    .eq("status", "booked")
    .gte("start_ts", fromIso)
    .lt("end_ts", toIso);

  if (error) {
    throw error;
  }

  return (data ?? []) as Booking[];
}

export async function bookSlot(scheduleId: string, startTs: string, endTs: string, guestName: string, guestPhone: string): Promise<any> {
  // Validate input
  if (!startTs || !endTs || !guestName || !guestPhone) {
    throw new Error("Missing required booking information");
  }

  // Check if slot is in the past
  const now = new Date().toISOString();
  if (startTs < now) {
    throw new Error("PAST_SLOT");
  }

  // Check if end time is after start time
  if (endTs <= startTs) {
    throw new Error("INVALID_RANGE");
  }

  // Get schedule details for timezone validation
  const { data: schedule, error: scheduleError } = await supabase
    .from("scheduler_schedules")
    .select("timezone")
    .eq("id", scheduleId)
    .single();

  if (scheduleError || !schedule) {
    throw new Error("SCHEDULE_NOT_FOUND");
  }

  // Get availability windows for this schedule
  const { data: windows, error: windowsError } = await supabase
    .from("scheduler_availability_windows")
    .select("*")
    .eq("schedule_id", scheduleId);

  if (windowsError) {
    throw windowsError;
  }

  // Validate against availability windows
  const startDate = new Date(startTs);
  const weekday = startDate.getDay() || 7; // Convert Sunday (0) to 7
  const startMinutes = startDate.getHours() * 60 + startDate.getMinutes();
  const endMinutes = new Date(endTs).getHours() * 60 + new Date(endTs).getMinutes();
  const durationMinutes = (endMinutes - startMinutes);

  const validWindow = windows?.find(w =>
    w.weekday === weekday &&
    w.start_minute <= startMinutes &&
    w.end_minute >= endMinutes &&
    w.slot_minutes === durationMinutes
  );

  if (!validWindow) {
    throw new Error("OUTSIDE_AVAILABILITY");
  }

  // Check if slot is available by querying existing bookings
  const { data: existingBookings, error: checkError } = await supabase
    .from("scheduler_bookings")
    .select("id")
    .eq("schedule_id", scheduleId)
    .eq("status", "booked")
    .or(`and(start_ts.lte.${endTs},end_ts.gte.${startTs})`);

  if (checkError) {
    throw checkError;
  }

  if (existingBookings && existingBookings.length > 0) {
    throw new Error("SLOT_TAKEN");
  }

  // If slot is available, create the booking
  const { data, error } = await supabase
    .from("scheduler_bookings")
    .insert({
      schedule_id: scheduleId,
      start_ts: startTs,
      end_ts: endTs,
      guest_name: guestName,
      guest_phone: guestPhone,
      status: "booked"
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}
