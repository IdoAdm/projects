import { DateTime, Interval } from "luxon";
import type { AvailabilityWindow, Booking } from "../types";

export type AvailabilityParams = {
  windows: AvailabilityWindow[];
  bookings: Booking[];
  fromUtc: string;
  toUtc: string;
  timezone: string;
};

export type AvailableSlot = {
  startTs: string;
  endTs: string;
};

function overlaps(intervals: Interval[], candidate: Interval) {
  return intervals.some((interval) => interval.overlaps(candidate));
}

export function computeAvailability({
  windows,
  bookings,
  fromUtc,
  toUtc,
  timezone
}: AvailabilityParams): AvailableSlot[] {
  if (!windows.length) {
    return [];
  }

  const from = DateTime.fromISO(fromUtc, { zone: "utc" });
  const to = DateTime.fromISO(toUtc, { zone: "utc" });
  const now = DateTime.utc();

  if (!from.isValid || !to.isValid || to <= from) {
    return [];
  }

  const bookingIntervals = bookings
    .filter((booking) => booking.status === "booked")
    .map((booking) =>
      Interval.fromDateTimes(
        DateTime.fromISO(booking.start_ts, { zone: "utc" }),
        DateTime.fromISO(booking.end_ts, { zone: "utc" })
      )
    );

  const startDay = from.setZone(timezone).startOf("day");
  const endDay = to.setZone(timezone).startOf("day");

  const slots: AvailableSlot[] = [];

  for (
    let day = startDay;
    day <= endDay;
    day = day.plus({ days: 1 })
  ) {
    const weekday = day.weekday; // ISO 1..7
    const dailyWindows = windows.filter((window) => window.weekday === weekday);

    if (!dailyWindows.length) {
      continue;
    }

    const dayStart = day.startOf("day");

    for (const window of dailyWindows) {
      const windowStart = dayStart.plus({ minutes: window.start_minute });
      const windowEnd = dayStart.plus({ minutes: window.end_minute });
      let cursor = windowStart;

      while (cursor < windowEnd) {
        const slotEnd = cursor.plus({ minutes: window.slot_minutes });

        if (slotEnd > windowEnd) {
          break;
        }

        const slotStartUtc = cursor.setZone("utc");
        const slotEndUtc = slotEnd.setZone("utc");

        if (slotEndUtc > to || slotStartUtc < from || slotStartUtc < now) {
          cursor = cursor.plus({ minutes: window.slot_minutes });
          continue;
        }

        const slotInterval = Interval.fromDateTimes(slotStartUtc, slotEndUtc);
        if (!overlaps(bookingIntervals, slotInterval)) {
          slots.push({
            startTs: slotStartUtc.toISO(),
            endTs: slotEndUtc.toISO()
          });
        }

        cursor = cursor.plus({ minutes: window.slot_minutes });
      }
    }
  }

  return slots.sort((a, b) => (a.startTs < b.startTs ? -1 : 1));
}
