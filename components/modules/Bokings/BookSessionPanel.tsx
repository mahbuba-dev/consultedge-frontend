"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";
import { CalendarDays, LockKeyhole, Sparkles } from "lucide-react";
import { toast } from "sonner";

import AvailabilityCalendar from "./AvailabilityCalendar";
import PredictiveCoupon from "@/components/AI/PredictiveCoupon";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { IExpertAvailability } from "@/src/types/expert.types";
import Portal from "./BookingPortal";

type BookSessionPanelProps = {
  expertId: string;
  expertName: string;
  expertTitle?: string | null;
  consultationFee?: number | null;
  industryName?: string | null;
  availability?: IExpertAvailability[];
  isLoggedIn?: boolean;
  userRole?: string | null;
  openSignal?: number;
};

const getSlotStartDateTime = (slot: IExpertAvailability) => {
  const rawSlot = slot as IExpertAvailability & {
    startDateTime?: string | null;
  };

  return slot.schedule?.startDateTime ?? rawSlot.startDateTime ?? "";
};

const stripTimezone = (value: string) =>
  value.trim().replace(/Z$/i, "").replace(/[+-]\d{2}:?\d{2}$/, "");

const parseDateSafe = (value: string) => {
  const cleaned = stripTimezone(value);
  const iso = parseISO(cleaned);
  if (!Number.isNaN(iso.getTime())) return iso;

  const fallback = new Date(cleaned);
  if (!Number.isNaN(fallback.getTime())) return fallback;

  return null;
};

export default function BookSessionPanel({
  expertId,
  expertName,
  expertTitle,
  consultationFee,
  industryName,
  availability = [],
  isLoggedIn = false,
  userRole,
  openSignal = 0,
}: BookSessionPanelProps) {
  const router = useRouter();
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const bookingPanelRef = useRef<HTMLDivElement | null>(null);

  const scrollToBookingPanel = () => {
    window.requestAnimationFrame(() => {
      bookingPanelRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  };

  // ✅ Find next available slot
  const nextAvailableSlot = useMemo(() => {
    const upcoming = availability
      .filter(
        (slot) =>
          !slot.isBooked &&
          !slot.isDeleted &&
          Boolean(getSlotStartDateTime(slot))
      )
      .sort((a, b) => {
        const aTime =
          parseDateSafe(getSlotStartDateTime(a))?.getTime() ?? 0;
        const bTime =
          parseDateSafe(getSlotStartDateTime(b))?.getTime() ?? 0;
        return aTime - bTime;
      });

    return upcoming[0] ?? null;
  }, [availability]);

  const handleBookNow = () => {
    if (!isLoggedIn) {
      toast.error("Please sign in to continue booking.", {
        description: "We'll bring you back after login.",
      });

      router.push(
        `/login?redirect=${encodeURIComponent(
          `/experts/${expertId}#book-session`
        )}`
      );
      return;
    }

    setIsBookingOpen(true);
  };

  useEffect(() => {
    if (openSignal <= 0) return;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsBookingOpen((prev) => (prev ? prev : true));
  }, [openSignal]);

  useEffect(() => {
    if (!isBookingOpen) return;

    scrollToBookingPanel();
  }, [isBookingOpen]);

  return (
    <div className="relative isolate z-10 space-y-4">
      <Card
        className="relative z-10 scroll-mt-24 border-cyan-200/70 shadow-lg shadow-cyan-500/5"
        id="book-session"
      >
        <CardHeader className="space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <Badge className="mb-2 bg-cyan-100 text-cyan-700">
                <Sparkles className="mr-1 size-3.5" />
                Smart booking flow
              </Badge>
              <CardTitle className="text-2xl">
                Book this expert now
              </CardTitle>
              <CardDescription>
                Select the best available date and time.
              </CardDescription>
            </div>

            <button
              type="button"
              onClick={handleBookNow}
              className="relative z-20 inline-flex min-h-11 items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            >
              {isBookingOpen ? "Select a time below ↓" : "Book now"}
            </button>
          </div>
        </CardHeader>

        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <PredictiveCoupon
              industryName={industryName}
              consultationFee={consultationFee}
            />
          </div>
          {/* NEXT SLOT */}
          <div className="rounded-2xl border bg-blue-50/70 p-4 dark:border-blue-500/20 dark:bg-blue-500/10">
            <div className="mb-2 flex items-center gap-2 text-blue-700 dark:text-blue-300">
              <CalendarDays className="size-4" />
              <span className="text-xs font-semibold uppercase">
                Next available
              </span>
            </div>

            <p className="text-base font-semibold">
              {nextAvailableSlot &&
              parseDateSafe(getSlotStartDateTime(nextAvailableSlot))
                ? format(
                    parseDateSafe(
                      getSlotStartDateTime(nextAvailableSlot)
                    ) as Date,
                    "EEEE, MMM d • h:mm a"
                  )
                : "No time slots available"}
            </p>
          </div>

          {/* ACCESS */}
          <div className="rounded-2xl border bg-cyan-50/70 p-4 dark:border-cyan-500/20 dark:bg-cyan-500/10">
            <div className="mb-2 flex items-center gap-2 text-cyan-700 dark:text-cyan-300">
              <LockKeyhole className="size-4" />
              <span className="text-xs font-semibold uppercase">
                Access
              </span>
            </div>

            <p className="text-base font-semibold">
              {!isLoggedIn
                ? "Sign in required"
                : userRole === "CLIENT"
                ? "Client booking enabled"
                : "Client account needed"}
            </p>
          </div>
        </CardContent>
      </Card>

      {isBookingOpen && (
        <Portal>
          <div ref={bookingPanelRef} className="w-full px-4">
            <Card
              id="booking-calendar-panel"
              className="mx-auto mt-20 w-full max-w-3xl rounded-xl bg-white p-6 shadow-xl dark:bg-slate-900 dark:border-white/10"
            >
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={() => setIsBookingOpen(false)}
              >
                Close booking
              </Button>

              <AvailabilityCalendar
                expertId={expertId}
                expertName={expertName}
                expertTitle={expertTitle}
                consultationFee={consultationFee}
                availability={availability}
                isLoggedIn={isLoggedIn}
                userRole={userRole}
              />
            </Card>
          </div>
        </Portal>
      )}
    </div>
  );
}