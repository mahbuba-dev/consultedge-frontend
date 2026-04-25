"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/src/lib/utils";
import type { IExpertAvailability } from "@/src/types/expert.types";
import { format, parseISO } from "date-fns";
import { Clock3 } from "lucide-react";

type BookingCardProps = {
  slot: IExpertAvailability;
  isSelected?: boolean;
  disabled?: boolean;
  onSelect?: (slot: IExpertAvailability) => void;
};

const getStartDateTime = (slot: IExpertAvailability) => {
  const rawSlot = slot as IExpertAvailability & { startDateTime?: string | null };
  return slot.schedule?.startDateTime ?? rawSlot.startDateTime ?? "";
};

const getEndDateTime = (slot: IExpertAvailability) => {
  const rawSlot = slot as IExpertAvailability & { endDateTime?: string | null };
  return slot.schedule?.endDateTime ?? rawSlot.endDateTime ?? null;
};

// Strip any TZ designator so wall-clock numbers ("20:00") are rendered as-is,
// regardless of how the backend serializes the value. Without this, a stored
// "2026-04-24T20:00:00Z" would be shifted into the viewer's local timezone.
const stripTimezone = (value: string) =>
  value.trim().replace(/Z$/i, "").replace(/[+-]\d{2}:?\d{2}$/, "");

const parseWallClock = (value: string) => parseISO(stripTimezone(value));

const formatSlotTime = (slot: IExpertAvailability) => {
  const startValue = getStartDateTime(slot);
  if (!startValue) return "Time unavailable";

  const start = parseWallClock(startValue);
  const endValue = getEndDateTime(slot);
  const end = endValue ? parseWallClock(endValue) : null;

  if (Number.isNaN(start.getTime())) return "Time unavailable";

  return end && !Number.isNaN(end.getTime())
    ? `${format(start, "h:mm a")} - ${format(end, "h:mm a")}`
    : format(start, "h:mm a");
};

export default function BookingCard({
  slot,
  isSelected = false,
  disabled = false,
  onSelect,
}: BookingCardProps) {
  const statusLabel = slot.isBooked ? "Booked" : isSelected ? "Selected" : "Open";

  return (
    <Button
      type="button"
      variant="outline"
      disabled={disabled || slot.isBooked}
      onClick={() => onSelect?.(slot)}
      className={cn(
        "h-auto w-full justify-start whitespace-normal rounded-2xl border px-4 py-3 text-left transition-all duration-300",
        isSelected
          ? "border-blue-500 bg-blue-600 text-white shadow-lg shadow-blue-500/20 hover:bg-blue-600"
          : "border-blue-200 bg-white/90 hover:border-blue-300 hover:bg-blue-50",
      )}
    >
      <div className="flex w-full flex-col gap-2">
        <span className="flex min-w-0 items-start gap-2 text-sm font-medium sm:text-base">
          <Clock3 className="mt-0.5 size-4 shrink-0" />
          <span className="min-w-0 whitespace-normal leading-6">{formatSlotTime(slot)}</span>
        </span>

        <Badge
          variant="secondary"
          className={cn(
            "h-auto self-start rounded-full px-3 py-1 text-[10px] uppercase tracking-wide whitespace-normal",
            isSelected
              ? "bg-white/20 text-white"
              : "bg-emerald-100 text-emerald-700",
          )}
        >
          {statusLabel}
        </Badge>
      </div>
    </Button>
  );
}
