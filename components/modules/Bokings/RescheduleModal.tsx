"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getPublishedExpertAvailability } from "@/src/services/expertAvailability";
import type { IConsultation } from "@/src/types/booking.types";
import type { IExpertAvailability } from "@/src/types/expert.types";

type RescheduleModalProps = {
  open: boolean;
  onClose: () => void;
  booking: IConsultation;
  onConfirm: (expertScheduleId: string) => void;
  isSubmitting?: boolean;
};

const getSlotStartDateTime = (slot: IExpertAvailability) => {
  const rawSlot = slot as IExpertAvailability & { startDateTime?: string | null };
  return slot.schedule?.startDateTime ?? rawSlot.startDateTime ?? "";
};

const parseDateSafe = (value: string) => {
  const parsed = parseISO(value);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed;
  }

  const fallback = new Date(value);
  if (!Number.isNaN(fallback.getTime())) {
    return fallback;
  }

  return null;
};

const formatSlotLabel = (slot: IExpertAvailability) => {
  const startDateTime = parseDateSafe(getSlotStartDateTime(slot));

  if (!startDateTime) {
    return "Unavailable time";
  }

  return format(startDateTime, "EEEE, MMM d • h:mm a");
};

export default function RescheduleModal({
  open,
  onClose,
  booking,
  onConfirm,
  isSubmitting = false,
}: RescheduleModalProps) {
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [currentTimestamp, setCurrentTimestamp] = useState(0);
  const expertId = booking.expert?.id ?? booking.expertId ?? "";

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["reschedule-availability", expertId],
    queryFn: () =>
      getPublishedExpertAvailability(expertId, {
        limit: 100,
        sortBy: "createdAt",
        sortOrder: "desc",
      }),
    enabled: open && Boolean(expertId),
  });

  const availableSlots = (() => {
    const items = Array.isArray(data?.data) ? data.data : [];

    return items
      .filter((slot) => {
        const startDateTime = getSlotStartDateTime(slot);
        const parsed = startDateTime ? parseDateSafe(startDateTime) : null;

        return (
          Boolean(slot.id) &&
          !slot.isBooked &&
          !slot.isDeleted &&
          slot.id !== booking.expertScheduleId &&
          Boolean(parsed) &&
          (parsed?.getTime() ?? 0) > currentTimestamp
        );
      })
      .sort((left, right) => {
        const leftTime = parseDateSafe(getSlotStartDateTime(left))?.getTime() ?? 0;
        const rightTime = parseDateSafe(getSlotStartDateTime(right))?.getTime() ?? 0;
        return leftTime - rightTime;
      });
  })();

  useEffect(() => {
    if (!open) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrentTimestamp(new Date().getTime());
  }, [open]);

  useEffect(() => {
    if (!open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedSlot(null);
      return;
    }

    setSelectedSlot(availableSlots[0]?.id ?? null);
  }, [availableSlots, open, booking.id]);

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => (!nextOpen ? onClose() : undefined)}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Reschedule Consultation</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Choose a new available time slot for your consultation.
          </p>

          {!expertId ? (
            <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
              This consultation is missing expert information, so rescheduling is unavailable.
            </div>
          ) : null}

          {expertId && isLoading ? (
            <div className="grid gap-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="h-12 animate-pulse rounded-md bg-muted/50" />
              ))}
            </div>
          ) : null}

          {expertId && isError ? (
            <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
              {error instanceof Error
                ? error.message
                : "Unable to load available slots right now."}
            </div>
          ) : null}

          {expertId && !isLoading && !isError ? (
            availableSlots.length > 0 ? (
              <div className="grid gap-2 max-h-72 overflow-y-auto pr-1">
                {availableSlots.map((slot) => (
                  <button
                    key={slot.id}
                    type="button"
                    onClick={() => setSelectedSlot(slot.id)}
                    className={`rounded-md border p-3 text-left transition-colors ${
                      selectedSlot === slot.id
                        ? "border-blue-600 bg-blue-50 text-blue-900"
                        : "border-border hover:border-blue-300 hover:bg-blue-50/60"
                    }`}
                  >
                    <span className="block text-sm font-medium">{formatSlotLabel(slot)}</span>
                    <span className="mt-1 block text-xs text-muted-foreground">
                      Select this new session time.
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="rounded-md border bg-muted/20 p-3 text-sm text-muted-foreground">
                No future time slots are currently available for rescheduling.
              </div>
            )
          ) : null}

          <Button
            disabled={!selectedSlot || isSubmitting || isLoading || Boolean(isError) || !expertId}
            onClick={() => selectedSlot && onConfirm(selectedSlot)}
            className="w-full"
          >
            {isSubmitting ? "Rescheduling..." : "Confirm Reschedule"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
