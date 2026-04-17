"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";
import { CalendarDays, LockKeyhole, Sparkles } from "lucide-react";
import { toast } from "sonner";

import AvailabilityCalendar from "./AvailabilityCalendar";
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
import BookConsultationButton from "../Experts/BookConsultationButton";

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
  if (!Number.isNaN(iso.getTime())) return iso;

  const fallback = new Date(value);
  if (!Number.isNaN(fallback.getTime())) return fallback;

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

  // ✅ FIXED: Book now works
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

    setTimeout(() => {
      document
        .getElementById("booking-calendar-panel")
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    }, 100);
  };

  // ✅ FIXED: Prevent unwanted reopen loop
  useEffect(() => {
    if (openSignal <= 0) return;

    setIsBookingOpen((prev) => (prev ? prev : true));

    setTimeout(() => {
      document
        .getElementById("booking-calendar-panel")
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    }, 100);
  }, [openSignal]);

  return (
   
    <div className="z-9999 space-y-4 relative pointer-events-auto">
      
      {/* TOP CARD */}
      <Card
        className=" z-9999 scroll-mt-24 border-cyan-200/70 shadow-lg shadow-cyan-500/5"
        id="book-session"
      >
        <CardHeader className="z-9999 space-y-4 ">
          <div className="z-9999 flex flex-wrap items-start justify-between gap-4">
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

            {/* <Button
              onClick={handleBookNow}
              className=" z-9999 bg-blue-600 hover:bg-blue-700 "
            >
              {isBookingOpen ? "Select a time below ↓" : "Book now"}
            </Button> */}
            {/* <Button
  className="relative z-99999  pointer-events-auto"
  onClick={() => console.log("BOOK NOW CLICKED")}
>
  Book now
</Button> */}

          </div>
        </CardHeader>

        <CardContent className="grid gap-4 md:grid-cols-2">
          {/* NEXT SLOT */}
          <div className="rounded-2xl border bg-blue-50/70 p-4">
            <div className="mb-2 flex items-center gap-2 text-blue-700">
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
          <div className="rounded-2xl border bg-cyan-50/70 p-4">
            <div className="mb-2 flex items-center gap-2 text-cyan-700">
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

      {/* BOOKING PANEL */}
    {isBookingOpen && (
  <Portal>
    <Card
      id="booking-calendar-panel"
      className="mx-auto mt-20 w-full max-w-3xl rounded-xl bg-white p-6 shadow-xl"
    >
      <Button
        variant="outline"
        size="sm"
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
  </Portal>
)}

    </div>
   

  );
}