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

const formatSlotTime = (slot: IExpertAvailability) => {
  const startValue = getStartDateTime(slot);
  if (!startValue) return "Time unavailable";

  const start = parseISO(startValue);
  const endValue = getEndDateTime(slot);
  const end = endValue ? parseISO(endValue) : null;

  return end
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
        "h-auto w-full flex-col items-start gap-3 rounded-2xl border px-4 py-3 text-left transition-all duration-300 sm:flex-row sm:items-center sm:justify-between",
        isSelected
          ? "border-blue-500 bg-blue-600 text-white shadow-lg shadow-blue-500/20 hover:bg-blue-600"
          : "border-blue-200 bg-white/90 hover:border-blue-300 hover:bg-blue-50",
      )}
    >
      <span className="flex min-w-0 items-center gap-2 text-sm font-medium sm:text-base">
        <Clock3 className="size-4 shrink-0" />
        <span className="wrap-break-word leading-6">{formatSlotTime(slot)}</span>
      </span>

      <Badge
        variant="secondary"
        className={cn(
          "self-start rounded-full px-3 py-1 text-[10px] uppercase tracking-wide sm:self-center",
          isSelected
            ? "bg-white/20 text-white"
            : "bg-emerald-100 text-emerald-700",
        )}
      >
        {statusLabel}
      </Badge>
    </Button>
  );
}
