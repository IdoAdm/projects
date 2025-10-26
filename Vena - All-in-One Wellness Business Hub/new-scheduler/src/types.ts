export type Schedule = {
  id: string;
  owner_id: string;
  slug: string;
  title: string;
  timezone: string;
  edit_token: string;
  created_at: string;
};

export type AvailabilityWindow = {
  id: string;
  schedule_id: string;
  weekday: number;
  start_minute: number;
  end_minute: number;
  slot_minutes: number;
  created_at: string;
};

export type BookingStatus = "held" | "booked" | "canceled";

export type Booking = {
  id: string;
  schedule_id: string;
  start_ts: string;
  end_ts: string;
  guest_name: string;
  guest_phone: string;
  status: BookingStatus;
  hold_expires_at: string | null;
  created_at: string;
};

export type PublicBooking = {
  schedule_id: string;
  start_ts: string;
  end_ts: string;
  status: BookingStatus;
};

export type ScheduleWithWindows = Schedule & {
  availability_windows: AvailabilityWindow[];
};

export type AvailableSlot = {
  startTs: string;
  endTs: string;
};
