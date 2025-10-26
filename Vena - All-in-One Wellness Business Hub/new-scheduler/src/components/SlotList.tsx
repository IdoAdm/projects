import { DateTime } from "luxon";
import { clsx } from "clsx";
import type { AvailableSlot } from "../lib/availability";

type SlotListProps = {
  slots: AvailableSlot[];
  timezone: string;
  selected?: AvailableSlot | null;
  onSelect: (slot: AvailableSlot) => void;
};

type GroupedSlots = Record<string, AvailableSlot[]>;

type SlotWithLabel = {
  slot: AvailableSlot;
  label: string;
};

function formatSlotLabel(slot: AvailableSlot, timezone: string) {
  const start = DateTime.fromISO(slot.startTs, { zone: "utc" }).setZone(timezone);
  const end = DateTime.fromISO(slot.endTs, { zone: "utc" }).setZone(timezone);
  return `${start.toFormat("HH:mm")} – ${end.toFormat("HH:mm")}`;
}

export function SlotList({ slots, timezone, selected, onSelect }: SlotListProps) {
  if (!slots.length) {
    return (
      <div className="rounded-md border border-dashed border-slate-300 bg-white p-6 text-center text-slate-500">
        No upcoming availability in the selected range.
      </div>
    );
  }

  const grouped = slots.reduce<GroupedSlots>((acc, slot) => {
    const day = DateTime.fromISO(slot.startTs, { zone: "utc" }).setZone(timezone);
    const key = day.toISODate();
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(slot);
    return acc;
  }, {});

  const sortedKeys = Object.keys(grouped).sort();

  return (
    <div className="flex flex-col gap-4">
      {sortedKeys.map((dayKey) => {
        const day = DateTime.fromISO(dayKey, { zone: timezone });
        const items: SlotWithLabel[] = grouped[dayKey]
          .sort((a, b) => (a.startTs < b.startTs ? -1 : 1))
          .map((slot) => ({
            slot,
            label: formatSlotLabel(slot, timezone)
          }));

        return (
          <div key={dayKey} className="rounded-lg border border-slate-200 bg-white">
            <div className="border-b border-slate-200 bg-slate-50 px-4 py-2">
              <h3 className="text-sm font-medium text-slate-700">
                {day.toFormat("cccc, d LLLL")}
              </h3>
              <p className="text-xs text-slate-500">{timezone}</p>
            </div>
            <div className="flex flex-wrap gap-2 p-4">
              {items.map(({ slot, label }) => {
                const isSelected = selected?.startTs === slot.startTs && selected?.endTs === slot.endTs;
                return (
                  <button
                    key={`${slot.startTs}-${slot.endTs}`}
                    type="button"
                    onClick={() => onSelect(slot)}
                    className={clsx(
                      "rounded-md border px-3 py-2 text-sm transition",
                      isSelected
                        ? "border-violet-500 bg-violet-500 text-white"
                        : "border-slate-200 bg-white text-slate-700 hover:border-violet-400 hover:text-violet-600"
                    )}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
