"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { format, isSameDay, parseISO } from "date-fns";
import { CalendarDays, Clock3, RefreshCw, Sparkles } from "lucide-react";
import { toast } from "sonner";

import BookingCard from "./BookingCard";
import BookingSummary from "./BookingSummary";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
// import { bookConsultation, bookConsultationWithPayLater } from "@/src/services/bookings";
import type { IExpertAvailability } from "@/src/types/expert.types";
import { bookConsultation, bookConsultationWithPayLater } from "@/src/services/bookings.service";
import type { ICouponValidationResult } from "@/src/services/coupon.service";

type AvailabilityCalendarProps = {
  expertId: string;
  expertName: string;
  expertTitle?: string | null;
  consultationFee?: number | null;
  availability?: IExpertAvailability[];
  isLoggedIn?: boolean;
  userRole?: string | null;
};

const getSlotStartDateTime = (slot: IExpertAvailability) => {
  const rawSlot = slot as IExpertAvailability & { startDateTime?: string | null };
  return slot.schedule?.startDateTime ?? rawSlot.startDateTime ?? "";
};

// Strip TZ markers so wall-clock numbers parse identically regardless of how
// the backend serializes the value (with or without trailing Z / offset).
const stripTimezone = (value: string) =>
  value.trim().replace(/Z$/i, "").replace(/[+-]\d{2}:?\d{2}$/, "");

const parseDateSafe = (value: string) => {
  const cleaned = stripTimezone(value);
  const iso = parseISO(cleaned);
  if (!Number.isNaN(iso.getTime())) {
    return iso;
  }

  const fallback = new Date(cleaned);
  if (!Number.isNaN(fallback.getTime())) {
    return fallback;
  }

  return null;
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
  const [appliedCoupon, setAppliedCoupon] = useState<ICouponValidationResult | null>(null);

  const sortedAvailability = useMemo(() => {
    return [...availability]
      .filter(
        (slot) =>
          !slot.isBooked &&
          !slot.isDeleted &&
          Boolean(getSlotStartDateTime(slot)) &&
          Boolean(parseDateSafe(getSlotStartDateTime(slot))),
      )
      .sort((left, right) => {
        const leftTime = parseDateSafe(getSlotStartDateTime(left))?.getTime() ?? 0;
        const rightTime = parseDateSafe(getSlotStartDateTime(right))?.getTime() ?? 0;
        return leftTime - rightTime;
      });
  }, [availability]);

  const availableDateKeys = useMemo(
    () =>
      new Set(
        sortedAvailability.map((slot) =>
          format(parseDateSafe(getSlotStartDateTime(slot)) as Date, "yyyy-MM-dd"),
        ),
      ),
    [sortedAvailability],
  );

  const nextAvailableSlot = sortedAvailability[0] ?? null;
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    nextAvailableSlot && getSlotStartDateTime(nextAvailableSlot)
      ? (parseDateSafe(getSlotStartDateTime(nextAvailableSlot)) ?? undefined)
      : undefined,
  );
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(
    nextAvailableSlot?.id ?? null,
  );

  const selectedDaySlots = useMemo(() => {
    if (!selectedDate) return [];

    return sortedAvailability.filter((slot) =>
      isSameDay(parseDateSafe(getSlotStartDateTime(slot)) as Date, selectedDate),
    );
  }, [selectedDate, sortedAvailability]);

  useEffect(() => {
    if (!selectedDate && nextAvailableSlot && getSlotStartDateTime(nextAvailableSlot)) {
      setSelectedDate(parseDateSafe(getSlotStartDateTime(nextAvailableSlot)) ?? undefined);
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

  const handleRefreshAvailability = () => {
    router.refresh();
    toast.message("Refreshing availability…", {
      description: "Fetching the latest published slots for this expert.",
    });
  };

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
          ...(appliedCoupon?.code ? { couponCode: appliedCoupon.code } : {}),
        });

        if (result.paymentUrl) {
          window.location.href = result.paymentUrl;
          return;
        }

        toast.success("Consultation booked successfully ✨", {
          description: "Your session is being added to the consultations dashboard now.",
        });
        router.push("/dashboard/consultations");
        router.refresh();
        return;
      }

      await bookConsultationWithPayLater({
        expertId,
        expertScheduleId: selectedSlot.id,
        ...(appliedCoupon?.code ? { couponCode: appliedCoupon.code } : {}),
      });

      toast.success("Slot reserved successfully ✨", {
        description: "You can review or pay later from your consultations dashboard.",
      });
      router.push("/dashboard/consultations");
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

  return (
    <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
      <Card className="border-blue-200/70 shadow-lg shadow-blue-500/5 dark:border-white/10" id="availability-calendar">
        <CardHeader>
          <Badge className="w-fit bg-blue-100 text-blue-700 hover:bg-blue-100 dark:bg-blue-500/15 dark:text-blue-200 dark:hover:bg-blue-500/15">
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
              <div className="rounded-3xl border bg-linear-to-br from-blue-50 via-white to-cyan-50 p-3 dark:border-white/10 dark:from-blue-500/10 dark:via-slate-900/60 dark:to-cyan-500/10">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => setSelectedDate(date)}
                  disabled={(date) => {
                    const key = format(date, "yyyy-MM-dd");
                    return !availableDateKeys.has(key);
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

                  {nextAvailableSlot && getSlotStartDateTime(nextAvailableSlot) ? (
                    <div className="max-w-full rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 wrap-break-word dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-200">
                      Next open: {format(parseDateSafe(getSlotStartDateTime(nextAvailableSlot)) as Date, "MMM d, h:mm a")}
                    </div>
                  ) : null}
                </div>

                <div className="grid gap-3 2xl:grid-cols-2">
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
                    <div className="rounded-2xl border border-dashed p-5 text-sm text-muted-foreground 2xl:col-span-2">
                      No open slots on this day yet. Please choose another highlighted date.
                    </div>
                  )}
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border bg-blue-50/60 p-4 dark:border-blue-500/20 dark:bg-blue-500/10">
                  <div className="mb-1 flex items-center gap-2 text-blue-700 dark:text-blue-300">
                    <CalendarDays className="size-4" />
                    <span className="text-xs font-semibold uppercase tracking-wide">
                      Flexible booking
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Select from the expert’s available time slots and book in a few clicks.
                  </p>
                </div>

                <div className="rounded-2xl border bg-sky-50/60 p-4 dark:border-sky-500/20 dark:bg-sky-500/10">
                  <div className="mb-1 flex items-center gap-2 text-sky-700 dark:text-sky-300">
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
            <div className="rounded-3xl border border-dashed bg-muted/20 px-5 py-10 text-center dark:border-white/10 dark:bg-white/5">
              <p className="text-lg font-semibold text-foreground">No availability yet</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Once this expert adds open time slots, they will appear here for booking.
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={handleRefreshAvailability}
              >
                <RefreshCw className="mr-1.5 size-3.5" />
                Refresh availability
              </Button>
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
        appliedCoupon={appliedCoupon}
        onCouponChange={setAppliedCoupon}
        onBookNow={() => handleBookAction("pay-now")}
        onPayLater={() => handleBookAction("pay-later")}
        onRefreshAvailability={handleRefreshAvailability}
      />
    </div>
  );
}
