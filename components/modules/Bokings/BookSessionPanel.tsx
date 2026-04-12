"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";
import { CalendarDays, LockKeyhole, Sparkles } from "lucide-react";
import { toast } from "sonner";

import AvailabilityCalendar from "./AvailabilityCalendar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { IExpertAvailability } from "@/src/types/expert.types";

type BookSessionPanelProps = {
  expertId: string;
  expertName: string;
  expertTitle?: string | null;
  consultationFee?: number | null;
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

const parseDateSafe = (value: string) => {
  const iso = parseISO(value);
  if (!Number.isNaN(iso.getTime())) {
    return iso;
  }

  const fallback = new Date(value);
  if (!Number.isNaN(fallback.getTime())) {
    return fallback;
  }

  return null;
};

export default function BookSessionPanel({
  expertId,
  expertName,
  expertTitle,
  consultationFee,
  availability = [],
  isLoggedIn = false,
  userRole,
  openSignal = 0,
}: BookSessionPanelProps) {
  const router = useRouter();
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  const nextAvailableSlot = useMemo(() => {
    const upcoming = availability
      .filter((slot) => !slot.isBooked && !slot.isDeleted && Boolean(getSlotStartDateTime(slot)))
      .sort((left, right) => {
        const leftTime = parseDateSafe(getSlotStartDateTime(left))?.getTime() ?? 0;
        const rightTime = parseDateSafe(getSlotStartDateTime(right))?.getTime() ?? 0;
        return leftTime - rightTime;
      });

    return upcoming[0] ?? null;
  }, [availability]);

  const handleBookNow = () => {
    if (!isLoggedIn) {
      toast.error("Please sign in to continue booking.", {
        description: "We'll bring you back to this expert after login.",
      });
      router.push(`/login?redirect=${encodeURIComponent(`/experts/${expertId}#book-session`)}`);
      return;
    }

    setIsBookingOpen(true);

    window.setTimeout(() => {
      document.getElementById("booking-calendar-panel")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);
  };

  useEffect(() => {
    if (openSignal <= 0) {
      return;
    }

    setIsBookingOpen(true);

    window.setTimeout(() => {
      document.getElementById("booking-calendar-panel")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);
  }, [openSignal]);

  return (
    <div className="space-y-4">
      <Card className="scroll-mt-24 border-fuchsia-200/70 shadow-lg shadow-fuchsia-500/5" id="book-session">
        <CardHeader className="space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <Badge className="mb-2 bg-fuchsia-100 text-fuchsia-700 hover:bg-fuchsia-100">
                <Sparkles className="mr-1 size-3.5" />
                Smart booking flow
              </Badge>
              <CardTitle className="text-2xl">Book this expert now</CardTitle>
              <CardDescription>
                Select the best available date and time in a polished booking pop-up.
              </CardDescription>
            </div>

            <Button onClick={handleBookNow} className="bg-violet-600 hover:bg-violet-700">
              {isBookingOpen ? "Select a time below ↓" : "Book now"}
            </Button>
          </div>
        </CardHeader>

        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border bg-violet-50/70 p-4">
            <div className="mb-2 flex items-center gap-2 text-violet-700">
              <CalendarDays className="size-4" />
              <span className="text-xs font-semibold uppercase tracking-wide">Next available</span>
            </div>
            <p className="text-base font-semibold text-foreground">
              {nextAvailableSlot && parseDateSafe(getSlotStartDateTime(nextAvailableSlot))
                ? format(parseDateSafe(getSlotStartDateTime(nextAvailableSlot)) as Date, "EEEE, MMM d • h:mm a")
                : "No time slots available yet"}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {nextAvailableSlot
                ? `Choose a time with ${expertName} and continue in seconds.`
                : "Once the expert adds availability, booking will open here automatically."}
            </p>
          </div>

          <div className="rounded-2xl border bg-cyan-50/70 p-4">
            <div className="mb-2 flex items-center gap-2 text-cyan-700">
              <LockKeyhole className="size-4" />
              <span className="text-xs font-semibold uppercase tracking-wide">Access</span>
            </div>
            <p className="text-base font-semibold text-foreground">
              {!isLoggedIn
                ? "Sign in required"
                : userRole === "CLIENT"
                  ? "Client booking enabled"
                  : "Client account needed"}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {!isLoggedIn
                ? "You’ll be redirected to login first, then return to this expert."
                : userRole === "CLIENT"
                  ? "Open the booking pop-up to pick your date and time."
                  : "Switch to a client account to complete the booking flow."}
            </p>
          </div>
        </CardContent>
      </Card>

      {isBookingOpen ? (
        <Card className="border-violet-200/70 shadow-lg" id="booking-calendar-panel">
          <CardHeader className="border-b bg-muted/30">
            <CardTitle className="text-xl">Choose your consultation slot</CardTitle>
            <CardDescription>
              Pick a date and time for your session with {expertName}.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 md:p-6">
            <div className="mb-4 flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsBookingOpen(false)}
              >
                Close booking
              </Button>
            </div>

            <AvailabilityCalendar
              expertId={expertId}
              expertName={expertName}
              expertTitle={expertTitle}
              consultationFee={consultationFee}
              availability={availability}
              isLoggedIn={isLoggedIn}
              userRole={userRole}
            />
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
