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

const formatSlotTime = (slot: IExpertAvailability) => {
  const startValue = slot.schedule?.startDateTime;
  if (!startValue) return "Time unavailable";

  const start = parseISO(startValue);
  const end = slot.schedule?.endDateTime ? parseISO(slot.schedule.endDateTime) : null;

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
  return (
    <Button
      type="button"
      variant="outline"
      disabled={disabled || slot.isBooked}
      onClick={() => onSelect?.(slot)}
      className={cn(
        "h-auto w-full justify-between rounded-2xl border px-4 py-3 text-left transition-all duration-300",
        isSelected
          ? "border-violet-500 bg-violet-600 text-white shadow-lg shadow-violet-500/20 hover:bg-violet-600"
          : "border-violet-200 bg-white/90 hover:border-violet-300 hover:bg-violet-50",
      )}
    >
      <span className="flex items-center gap-2 text-sm font-medium">
        <Clock3 className="size-4" />
        {formatSlotTime(slot)}
      </span>

      <Badge
        variant="secondary"
        className={cn(
          "ml-3 rounded-full px-2.5 py-0.5 text-[10px] uppercase tracking-wide",
          isSelected
            ? "bg-white/20 text-white"
            : "bg-emerald-100 text-emerald-700",
        )}
      >
        {slot.isBooked ? "Booked" : isSelected ? "Selected" : "Open"}
      </Badge>
    </Button>
  );
}
