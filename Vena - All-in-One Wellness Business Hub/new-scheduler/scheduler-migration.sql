-- Fix RLS Policies for Existing Scheduler Tables (Safe Version)
-- Run this in Supabase SQL Editor to fix the 401 permission errors

-- Create new permissive policies for public access (only if they don't exist)
do $$
begin
  -- Create policies only if they don't already exist
  if not exists (select 1 from pg_policies where policyname = 'scheduler_public_read_schedules') then
    create policy "scheduler_public_read_schedules" on scheduler_schedules for select using (true);
  end if;

  if not exists (select 1 from pg_policies where policyname = 'scheduler_public_read_availability') then
    create policy "scheduler_public_read_availability" on scheduler_availability_windows for select using (true);
  end if;

  if not exists (select 1 from pg_policies where policyname = 'scheduler_public_read_bookings') then
    create policy "scheduler_public_read_bookings" on scheduler_bookings for select using (true);
  end if;

  if not exists (select 1 from pg_policies where policyname = 'scheduler_public_insert_bookings') then
    create policy "scheduler_public_insert_bookings" on scheduler_bookings for insert with check (true);
  end if;
end $$;

-- Grant necessary permissions (safe to run multiple times)
grant select on scheduler_schedules to anon, authenticated;
grant select on scheduler_availability_windows to anon, authenticated;
grant select, insert on scheduler_bookings to anon, authenticated;

-- Grant usage on schema for anonymous users
grant usage on schema public to anon, authenticated;

-- Remove all constraints that might prevent multiple time slots per day
-- First, let's see what constraints exist
select '=== EXISTING CONSTRAINTS ===' as info;
select conname, pg_get_constraintdef(oid)
from pg_constraint
where conrelid = 'scheduler_availability_windows'::regclass;

-- Remove the overlapping constraint to allow multiple time slots per day with gaps
-- The application will handle preventing double-booking within time ranges
do $$
declare
  constraint_rec record;
begin
  -- Drop any exclusion constraints that might prevent multiple windows
  for constraint_rec in
    select conname
    from pg_constraint
    where conrelid = 'scheduler_availability_windows'::regclass
    and contype = 'x' -- exclusion constraint
  loop
    execute 'alter table scheduler_availability_windows drop constraint if exists ' || constraint_rec.conname;
    raise notice 'Dropped constraint: %', constraint_rec.conname;
  end loop;
end $$;

-- Check if tables have the right columns
do $$
begin
  -- Add missing columns if they don't exist
  if not exists (select 1 from information_schema.columns where table_name = 'scheduler_schedules' and column_name = 'edit_token') then
    alter table scheduler_schedules add column edit_token text;
    update scheduler_schedules set edit_token = encode(gen_random_bytes(32), 'hex') where edit_token is null;
    alter table scheduler_schedules alter column edit_token set not null;
  end if;

  if not exists (select 1 from information_schema.columns where table_name = 'scheduler_bookings' and column_name = 'guest_phone') then
    alter table scheduler_bookings add column guest_phone text;
  end if;

  if not exists (select 1 from information_schema.columns where table_name = 'scheduler_bookings' and column_name = 'status') then
    alter table scheduler_bookings add column status text default 'booked';
  else
    alter table scheduler_bookings alter column status set default 'booked';
  end if;
end $$;

-- Check existing schedules and create a test schedule if needed
-- First, let's see what schedules exist
select '=== EXISTING SCHEDULES ===' as info;
select id, slug, title, owner_id, created_at from scheduler_schedules order by created_at desc;

select '=== EXISTING AVAILABILITY WINDOWS ===' as info;
select * from scheduler_availability_windows order by schedule_id, weekday;

select '=== EXISTING BOOKINGS ===' as info;
select * from scheduler_bookings order by schedule_id, start_ts;

-- Check current user
select '=== CURRENT USER ===' as info;
select id, email from auth.users limit 1;

-- Create a test schedule (optional - only if no schedules exist)
do $$
declare
  current_user_id uuid;
  test_schedule_id uuid;
begin
  -- Get current user ID
  select id into current_user_id from auth.users limit 1;

  -- Only create test schedule if no schedules exist
  if not exists (select 1 from scheduler_schedules) then
    insert into scheduler_schedules (owner_id, slug, title, timezone, edit_token)
    values (
      current_user_id,
      'test-schedule',
      'Test Schedule',
      'Asia/Jerusalem',
      encode(gen_random_bytes(32), 'hex')
    ) returning id into test_schedule_id;

    -- Add some test availability windows (Monday 9 AM - 5 PM, 1-hour slots)
    insert into scheduler_availability_windows (schedule_id, weekday, start_minute, end_minute, slot_minutes)
    values
      (test_schedule_id, 1, 9 * 60, 17 * 60, 60), -- Monday
      (test_schedule_id, 2, 9 * 60, 17 * 60, 60), -- Tuesday
      (test_schedule_id, 3, 9 * 60, 17 * 60, 60), -- Wednesday
      (test_schedule_id, 4, 9 * 60, 17 * 60, 60), -- Thursday
      (test_schedule_id, 5, 9 * 60, 17 * 60, 60); -- Friday

    raise notice 'Created test schedule with ID: %', test_schedule_id;
  else
    raise notice 'Schedules already exist. Use one of the existing schedules from the query above.';
  end if;
end $$;

-- Show final state
select '=== FINAL SCHEDULES ===' as info;
select id, slug, title, owner_id, created_at from scheduler_schedules order by created_at desc;

select '=== FINAL AVAILABILITY WINDOWS ===' as info;
select aw.*, s.title as schedule_title
from scheduler_availability_windows aw
join scheduler_schedules s on aw.schedule_id = s.id
order by s.id, aw.weekday;
