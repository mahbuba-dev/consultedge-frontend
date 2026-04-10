"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { format, isBefore, isSameDay, parseISO, startOfDay } from "date-fns";
import { CalendarDays, Clock3, Sparkles } from "lucide-react";
import { toast } from "sonner";

import BookingCard from "./BookingCard";
import BookingSummary from "./BookingSummary";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { bookConsultation, bookConsultationWithPayLater } from "@/src/services/bookings";
import type { IExpertAvailability } from "@/src/types/expert.types";

type AvailabilityCalendarProps = {
  expertId: string;
  expertName: string;
  expertTitle?: string | null;
  consultationFee?: number | null;
  availability?: IExpertAvailability[];
  isLoggedIn?: boolean;
  userRole?: string | null;
};

export default function AvailabilityCalendar({
  expertId,
  expertName,
  expertTitle,
  consultationFee,
  availability = [],
  isLoggedIn = false,
  userRole,
}: AvailabilityCalendarProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [actionLoading, setActionLoading] = useState<"pay-now" | "pay-later" | null>(null);

  const sortedAvailability = useMemo(() => {
    return [...availability]
      .filter(
        (slot) =>
          !slot.isBooked &&
          !slot.isDeleted &&
          Boolean(slot.schedule?.startDateTime) &&
          !isBefore(parseISO(slot.schedule!.startDateTime), new Date()),
      )
      .sort((left, right) => {
        const leftTime = new Date(left.schedule?.startDateTime || "").getTime();
        const rightTime = new Date(right.schedule?.startDateTime || "").getTime();
        return leftTime - rightTime;
      });
  }, [availability]);

  const availableDateKeys = useMemo(
    () =>
      new Set(
        sortedAvailability.map((slot) =>
          format(parseISO(slot.schedule!.startDateTime), "yyyy-MM-dd"),
        ),
      ),
    [sortedAvailability],
  );

  const nextAvailableSlot = sortedAvailability[0] ?? null;
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    nextAvailableSlot?.schedule?.startDateTime
      ? parseISO(nextAvailableSlot.schedule.startDateTime)
      : undefined,
  );
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(
    nextAvailableSlot?.id ?? null,
  );

  const selectedDaySlots = useMemo(() => {
    if (!selectedDate) return [];

    return sortedAvailability.filter((slot) =>
      isSameDay(parseISO(slot.schedule!.startDateTime), selectedDate),
    );
  }, [selectedDate, sortedAvailability]);

  useEffect(() => {
    if (!selectedDate && nextAvailableSlot?.schedule?.startDateTime) {
      setSelectedDate(parseISO(nextAvailableSlot.schedule.startDateTime));
    }

    if (!selectedSlotId && nextAvailableSlot?.id) {
      setSelectedSlotId(nextAvailableSlot.id);
    }
  }, [nextAvailableSlot, selectedDate, selectedSlotId]);

  useEffect(() => {
    if (!selectedDaySlots.length) {
      setSelectedSlotId(null);
      return;
    }

    if (!selectedDaySlots.some((slot) => slot.id === selectedSlotId)) {
      setSelectedSlotId(selectedDaySlots[0]?.id ?? null);
    }
  }, [selectedDaySlots, selectedSlotId]);

  const selectedSlot =
    selectedDaySlots.find((slot) => slot.id === selectedSlotId) ?? selectedDaySlots[0] ?? null;

  const ensureBookingAccess = () => {
    if (!selectedSlot) {
      toast.error("Please select an available time slot first.");
      return false;
    }

    if (!isLoggedIn) {
      toast.error("Please sign in to book this expert.", {
        description: "We’ll bring you right back to this page after login.",
      });
      router.push(
        `/login?redirect=${encodeURIComponent(`${pathname || `/experts/${expertId}`}#book-session`)}`,
      );
      return false;
    }

    if (userRole !== "CLIENT") {
      toast.error("Please use a client account to book this consultation.");
      return false;
    }

    return true;
  };

  const handleBookAction = async (mode: "pay-now" | "pay-later") => {
    if (!ensureBookingAccess() || !selectedSlot) {
      return;
    }

    setActionLoading(mode);

    try {
      if (mode === "pay-now") {
        const result = await bookConsultation({
          expertId,
          expertScheduleId: selectedSlot.id,
        });

        if (result.paymentUrl) {
          window.location.href = result.paymentUrl;
          return;
        }

        toast.success("Consultation booked successfully ✨", {
          description: "Your session is being added to the dashboard now.",
        });
        router.push("/dashboard/my-bookings");
        router.refresh();
        return;
      }

      await bookConsultationWithPayLater({
        expertId,
        expertScheduleId: selectedSlot.id,
      });

      toast.success("Slot reserved successfully ✨", {
        description: "You can review or pay later from your dashboard bookings.",
      });
      router.push("/dashboard/my-bookings");
      router.refresh();
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to complete the booking right now.",
      );
    } finally {
      setActionLoading(null);
    }
  };

  const today = startOfDay(new Date());

  return (
    <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
      <Card className="border-violet-200/70 shadow-lg shadow-violet-500/5" id="book-session">
        <CardHeader>
          <Badge className="w-fit bg-violet-100 text-violet-700 hover:bg-violet-100">
            <Sparkles className="mr-1 size-3.5" />
            Availability Calendar
          </Badge>
          <CardTitle className="text-2xl">Choose your consultation slot</CardTitle>
          <CardDescription>
            Pick a date and time that works best for your next session with {expertName}.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {sortedAvailability.length > 0 ? (
            <>
              <div className="rounded-3xl border bg-linear-to-br from-violet-50 via-white to-fuchsia-50 p-3">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => setSelectedDate(date)}
                  disabled={(date) => {
                    const key = format(date, "yyyy-MM-dd");
                    return isBefore(startOfDay(date), today) || !availableDateKeys.has(key);
                  }}
                  className="mx-auto"
                />
              </div>

              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {selectedDate
                        ? format(selectedDate, "EEEE, MMMM d")
                        : "Select an available date"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {selectedDaySlots.length} slot{selectedDaySlots.length === 1 ? "" : "s"} available
                    </p>
                  </div>

                  {nextAvailableSlot?.schedule?.startDateTime ? (
                    <div className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                      Next open: {format(parseISO(nextAvailableSlot.schedule.startDateTime), "MMM d, h:mm a")}
                    </div>
                  ) : null}
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {selectedDaySlots.length > 0 ? (
                    selectedDaySlots.map((slot) => (
                      <BookingCard
                        key={slot.id}
                        slot={slot}
                        isSelected={slot.id === selectedSlot?.id}
                        onSelect={() => setSelectedSlotId(slot.id)}
                      />
                    ))
                  ) : (
                    <div className="rounded-2xl border border-dashed p-5 text-sm text-muted-foreground sm:col-span-2">
                      No open slots on this day yet. Please choose another highlighted date.
                    </div>
                  )}
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border bg-violet-50/60 p-4">
                  <div className="mb-1 flex items-center gap-2 text-violet-700">
                    <CalendarDays className="size-4" />
                    <span className="text-xs font-semibold uppercase tracking-wide">
                      Flexible booking
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Select from the expert’s published availability and book in a few clicks.
                  </p>
                </div>

                <div className="rounded-2xl border bg-sky-50/60 p-4">
                  <div className="mb-1 flex items-center gap-2 text-sky-700">
                    <Clock3 className="size-4" />
                    <span className="text-xs font-semibold uppercase tracking-wide">
                      Quick confirmation
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Pay now with Stripe or reserve first and manage payment later from your dashboard.
                  </p>
                </div>
              </div>
            </>
          ) : (
            <div className="rounded-3xl border border-dashed bg-muted/20 px-5 py-10 text-center">
              <p className="text-lg font-semibold text-foreground">No availability published yet</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Once this expert publishes open time slots, they will appear here for booking.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <BookingSummary
        expertName={expertName}
        expertTitle={expertTitle}
        consultationFee={consultationFee}
        selectedSlot={selectedSlot}
        isLoggedIn={isLoggedIn}
        isClient={userRole === "CLIENT"}
        actionLoading={actionLoading}
        onBookNow={() => handleBookAction("pay-now")}
        onPayLater={() => handleBookAction("pay-later")}
      />
    </div>
  );
}
