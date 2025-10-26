-- VENA Calendly-like scheduling schema
set search_path = public;

create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";
create extension if not exists "btree_gist";

-- Helper function to keep updated_at current
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Helper to read the public token from request headers for RLS
create or replace function public.request_public_token()
returns text
language plpgsql
stable
as $$
declare
  token text;
begin
  begin
    token := nullif(current_setting('request.header.x-public-token', true), '');
  exception when others then
    token := null;
  end;
  return token;
end;
$$;

-- Profiles table (one-to-one with auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text check (phone is null or phone ~ '^\+[1-9][0-9]{4,14}$'),
  timezone text not null default 'Europe/Berlin',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row
  execute function public.handle_updated_at();

-- Scheduling links (hashed edit token, plain public token)
create table if not exists public.links (
  owner_id uuid primary key references public.profiles(id) on delete cascade,
  edit_token_hash text not null,
  public_token text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_generated_at timestamptz default now()
);

create trigger trg_links_updated_at
  before update on public.links
  for each row
  execute function public.handle_updated_at();

-- Services owned by users
create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  description text,
  duration_minutes integer not null check (duration_minutes between 5 and 720),
  buffer_minutes integer not null default 0 check (buffer_minutes between 0 and 180),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint services_unique_name unique (owner_id, lower(name))
);

create trigger trg_services_updated_at
  before update on public.services
  for each row
  execute function public.handle_updated_at();

-- Availability blocks in UTC
create table if not exists public.availability_blocks (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  service_id uuid references public.services(id) on delete cascade,
  start_time timestamptz not null,
  end_time timestamptz not null,
  is_recurring boolean not null default false,
  recurrence_rule text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  period tstzrange generated always as (tstzrange(start_time, end_time, '[)')) stored,
  service_scope uuid generated always as (coalesce(service_id, owner_id)) stored,
  constraint availability_valid_range check (end_time > start_time),
  constraint recurrence_requires_rule check ((is_recurring = false and recurrence_rule is null) or (is_recurring = true and recurrence_rule is not null))
);

create trigger trg_availability_updated_at
  before update on public.availability_blocks
  for each row
  execute function public.handle_updated_at();

alter table public.availability_blocks
  add constraint availability_no_overlap
  exclude using gist (
    owner_id with =,
    service_scope with =,
    period with &&
  );

-- Generated slots derived from availability
create table if not exists public.bookable_slots (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  service_id uuid not null references public.services(id) on delete cascade,
  availability_id uuid references public.availability_blocks(id) on delete set null,
  start_time timestamptz not null,
  end_time timestamptz not null,
  status text not null default 'free' check (status in ('free','held','booked')),
  hold_token uuid,
  hold_expires_at timestamptz,
  generated_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  idempotency_key uuid,
  slot_period tstzrange generated always as (tstzrange(start_time, end_time, '[)')) stored,
  constraint slot_time_valid check (end_time > start_time),
  constraint hold_requires_expiry check (
    (status = 'held' and hold_expires_at is not null)
    or (status <> 'held' and hold_expires_at is null)
  )
);

create trigger trg_slots_updated_at
  before update on public.bookable_slots
  for each row
  execute function public.handle_updated_at();

alter table public.bookable_slots
  add constraint unique_slot_per_service unique (service_id, start_time);

alter table public.bookable_slots
  add constraint slot_no_overlap
  exclude using gist (
    service_id with =,
    slot_period with &&
  )
  deferrable initially immediate;

-- Confirmed bookings
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  service_id uuid not null references public.services(id) on delete cascade,
  slot_id uuid not null unique references public.bookable_slots(id) on delete cascade,
  client_full_name text not null,
  client_phone text not null check (client_phone ~ '^\+[1-9][0-9]{4,14}$'),
  status text not null default 'confirmed' check (status in ('confirmed','cancelled')),
  confirmation_code text not null default upper(substr(encode(gen_random_bytes(6), 'hex'), 1, 12)),
  idempotency_key uuid not null unique,
  hold_token uuid not null,
  start_time timestamptz not null,
  end_time timestamptz not null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  cancelled_at timestamptz
);

create trigger trg_bookings_updated_at
  before update on public.bookings
  for each row
  execute function public.handle_updated_at();

-- Row Level Security configuration
alter table public.profiles enable row level security;
alter table public.links enable row level security;
alter table public.services enable row level security;
alter table public.availability_blocks enable row level security;
alter table public.bookable_slots enable row level security;
alter table public.bookings enable row level security;

create policy "Profiles are self-accessible"
  on public.profiles
  for select
  using (auth.uid() = id);

create policy "Profiles manage self"
  on public.profiles
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Profiles insert self"
  on public.profiles
  for insert
  with check (auth.uid() = id);

create policy "Owner manage links"
  on public.links
  for all
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

create policy "Owner manage services"
  on public.services
  for all
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

create policy "Owner manage availability"
  on public.availability_blocks
  for all
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

create policy "Owner manage slots"
  on public.bookable_slots
  for all
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

create policy "Owner select bookings"
on public.bookings
for select
using (auth.uid() = owner_id);

create policy "Owner update bookings"
on public.bookings
for update
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

create policy "Owner delete bookings"
on public.bookings
for delete
using (auth.uid() = owner_id);

-- Allow public/token-based read access via header for services & slots
create policy "Public services via token"
  on public.services
  for select
  to anon, authenticated
  using (
    is_active
    and public.request_public_token() is not null
    and exists (
      select 1 from public.links l
      where l.owner_id = services.owner_id
        and l.public_token = public.request_public_token()
    )
  );

create policy "Public slots via token"
  on public.bookable_slots
  for select
  to anon, authenticated
  using (
    public.request_public_token() is not null
    and exists (
      select 1 from public.links l
      where l.owner_id = bookable_slots.owner_id
        and l.public_token = public.request_public_token()
    )
    and (
      status = 'free'
      or (status = 'held' and hold_expires_at <= now())
    )
  );

-- Read-only public views keyed by public_token
create or replace view public.public_services_view as
select
  l.public_token,
  s.id as service_id,
  s.name,
  s.description,
  s.duration_minutes,
  s.buffer_minutes,
  s.owner_id,
  s.updated_at
from public.links l
join public.services s on s.owner_id = l.owner_id
where s.is_active;

create or replace view public.public_free_slots_view as
select
  l.public_token,
  bs.service_id,
  bs.id as slot_id,
  bs.start_time,
  bs.end_time
from public.links l
join public.bookable_slots bs on bs.owner_id = l.owner_id
where (
    bs.status = 'free'
    or (bs.status = 'held' and bs.hold_expires_at <= now())
  )
  and bs.start_time >= now();

grant select on public.public_services_view to anon, authenticated;
grant select on public.public_free_slots_view to anon, authenticated;

-- Utility to release expired holds
create or replace function public.release_expired_holds()
returns integer
language sql
security definer
set search_path = public
as $$
  with released as (
    update public.bookable_slots
       set status = 'free',
           hold_token = null,
           hold_expires_at = null,
           updated_at = now()
     where status = 'held'
       and hold_expires_at <= now()
    returning 1
  )
  select count(*) from released;
$$;

-- Slot generation from availability
create or replace function public.generate_slots_for_owner(
  p_owner uuid,
  p_days_ahead integer default 30,
  p_service_id uuid default null
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_now timestamptz := now();
  v_until timestamptz := v_now + make_interval(days => p_days_ahead);
  v_service record;
  v_block record;
  v_start timestamptz;
  v_end timestamptz;
  v_duration interval;
  v_buffer interval;
  v_inserted integer := 0;
  v_skipped integer := 0;
  v_pruned integer := 0;
  v_slot_id uuid;
begin
  if p_days_ahead < 1 then
    raise exception 'days_ahead must be at least 1';
  end if;

  for v_service in
    select *
      from public.services
     where owner_id = p_owner
       and is_active
       and (p_service_id is null or id = p_service_id)
  loop
    v_duration := make_interval(mins => v_service.duration_minutes);
    v_buffer := make_interval(mins => v_service.buffer_minutes);

    for v_block in
      select *
        from public.availability_blocks
       where owner_id = p_owner
         and (service_id is null or service_id = v_service.id)
         and end_time >= v_now
         and start_time <= v_until
    loop
      v_start := greatest(v_block.start_time, v_now);
      while v_start + v_duration <= least(v_block.end_time, v_until) loop
        v_end := v_start + v_duration;
        insert into public.bookable_slots (
          owner_id,
          service_id,
          availability_id,
          start_time,
          end_time,
          status,
          generated_at,
          updated_at
        ) values (
          p_owner,
          v_service.id,
          v_block.id,
          v_start,
          v_end,
          'free',
          now(),
          now()
        )
        on conflict (service_id, start_time) do nothing
        returning id into v_slot_id;

        if v_slot_id is not null then
          v_inserted := v_inserted + 1;
        else
          v_skipped := v_skipped + 1;
        end if;

        v_start := v_end + v_buffer;
        v_slot_id := null;
      end loop;
    end loop;
  end loop;

  with removed as (
    delete from public.bookable_slots
     where owner_id = p_owner
       and start_time < v_now
       and status = 'free'
    returning 1
  )
  select count(*) into v_pruned from removed;

  return jsonb_build_object(
    'inserted', v_inserted,
    'skipped', v_skipped,
    'pruned', coalesce(v_pruned, 0)
  );
end;
$$;

-- Atomic public booking flow (hold -> book)
create or replace function public.public_book_slot(
  p_public_token text,
  p_service_id uuid,
  p_slot_id uuid,
  p_full_name text,
  p_phone text,
  p_idempotency_key uuid
) returns public.bookings
language plpgsql
security definer
set search_path = public
as $$
declare
  v_owner uuid;
  v_booking public.bookings%rowtype;
  v_slot public.bookable_slots%rowtype;
  v_token uuid := p_idempotency_key;
begin
  if p_public_token is null or length(trim(p_public_token)) = 0 then
    raise exception 'public_token required';
  end if;

  if p_full_name is null or length(trim(p_full_name)) < 2 then
    raise exception 'full_name must be at least 2 characters';
  end if;

  if p_phone is null or p_phone !~ '^\+[1-9][0-9]{4,14}$' then
    raise exception 'phone must be in E.164 format';
  end if;

  if v_token is null then
    v_token := gen_random_uuid();
  end if;

  select owner_id
    into v_owner
    from public.links
   where public_token = p_public_token;

  if v_owner is null then
    raise exception 'Invalid booking link';
  end if;

  perform 1
    from public.services
   where id = p_service_id
     and owner_id = v_owner
     and is_active;

  if not found then
    raise exception 'Service unavailable';
  end if;

  select *
    into v_booking
    from public.bookings
   where owner_id = v_owner
     and idempotency_key = v_token;

  if found then
    return v_booking;
  end if;

  perform public.release_expired_holds();

  select *
    into v_slot
    from public.bookable_slots
   where id = p_slot_id
     and owner_id = v_owner
     and service_id = p_service_id
   for update;

  if not found then
    raise exception 'Slot not found';
  end if;

  if v_slot.status = 'booked' then
    raise exception 'Slot already booked';
  end if;

  if v_slot.status = 'held' and v_slot.hold_expires_at > now() then
    raise exception 'Slot temporarily held';
  end if;

  update public.bookable_slots
     set status = 'held',
         hold_token = v_token,
         hold_expires_at = now() + interval '3 minutes',
         updated_at = now()
   where id = p_slot_id;

  insert into public.bookings (
    owner_id,
    service_id,
    slot_id,
    client_full_name,
    client_phone,
    status,
    idempotency_key,
    hold_token,
    start_time,
    end_time,
    notes
  )
  values (
    v_owner,
    p_service_id,
    p_slot_id,
    trim(p_full_name),
    p_phone,
    'confirmed',
    v_token,
    v_token,
    v_slot.start_time,
    v_slot.end_time,
    null
  )
  returning * into v_booking;

  update public.bookable_slots
     set status = 'booked',
         hold_token = null,
         hold_expires_at = null,
         updated_at = now()
   where id = p_slot_id;

  return v_booking;

exception
  when unique_violation then
    select *
      into v_booking
      from public.bookings
     where owner_id = v_owner
       and idempotency_key = v_token;
    if found then
      return v_booking;
    end if;
    raise;
  when others then
    update public.bookable_slots
       set status = 'free',
           hold_token = null,
           hold_expires_at = null,
           updated_at = now()
     where id = p_slot_id
       and hold_token = v_token;
    raise;
end;
$$;

-- Verify hashed edit token for owner dashboard access
create or replace function public.verify_edit_token(
  p_edit_token text
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_owner uuid;
  v_hash text;
begin
  if auth.uid() is null then
    raise exception ''Authentication required'';
  end if;

  select owner_id, edit_token_hash
    into v_owner, v_hash
    from public.links
   where owner_id = auth.uid();

  if v_owner is null or v_hash is null then
    raise exception ''Scheduling links not configured'';
  end if;

  if crypt(p_edit_token, v_hash) <> v_hash then
    raise exception ''Invalid edit token'';
  end if;

  return v_owner;
end;
$$;

-- Cancel a booking and release the slot
create or replace function public.cancel_booking(
  p_booking_id uuid
) returns public.bookings
language plpgsql
security definer
set search_path = public
as $$
declare
  v_booking public.bookings%rowtype;
begin
  if auth.uid() is null then
    raise exception ''Authentication required'';
  end if;

  select *
    into v_booking
    from public.bookings
   where id = p_booking_id
   for update;

  if not found then
    raise exception ''Booking not found'';
  end if;

  if v_booking.owner_id <> auth.uid() then
    raise exception ''Forbidden'';
  end if;

  if v_booking.status = ''cancelled'' then
    return v_booking;
  end if;

  update public.bookings
     set status = ''cancelled'',
         cancelled_at = now(),
         updated_at = now()
   where id = p_booking_id
  returning * into v_booking;

  update public.bookable_slots
     set status = ''free'',
         hold_token = null,
         hold_expires_at = null,
         updated_at = now()
   where id = v_booking.slot_id;

  return v_booking;
end;
$$;

grant execute on function public.public_book_slot(text, uuid, uuid, text, text, uuid) to anon, authenticated, service_role;
grant execute on function public.generate_slots_for_owner(uuid, integer, uuid) to authenticated, service_role;
grant execute on function public.release_expired_holds() to authenticated, service_role;
grant execute on function public.verify_edit_token(text) to authenticated, service_role;
grant execute on function public.cancel_booking(uuid) to authenticated, service_role;
