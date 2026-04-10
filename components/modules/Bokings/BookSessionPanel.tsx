"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";
import { CalendarDays, LockKeyhole, Sparkles } from "lucide-react";
import { toast } from "sonner";

import AvailabilityCalendar from "./AvailabilityCalendar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
};

export default function BookSessionPanel({
  expertId,
  expertName,
  expertTitle,
  consultationFee,
  availability = [],
  isLoggedIn = false,
  userRole,
}: BookSessionPanelProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const nextAvailableSlot = useMemo(() => {
    const upcoming = availability
      .filter((slot) => !slot.isBooked && !slot.isDeleted && slot.schedule?.startDateTime)
      .sort((left, right) => {
        const leftTime = new Date(left.schedule?.startDateTime || "").getTime();
        const rightTime = new Date(right.schedule?.startDateTime || "").getTime();
        return leftTime - rightTime;
      });

    return upcoming[0] ?? null;
  }, [availability]);

  const handleBookNow = () => {
    if (!isLoggedIn) {
      toast.error("Please sign in to continue booking.", {
        description: "We’ll bring you back to this expert after login.",
      });
      router.push(`/login?redirect=${encodeURIComponent(`/experts/${expertId}#book-session`)}`);
      return;
    }

    if (userRole !== "CLIENT") {
      toast.error("Please use a client account to book this session.");
      return;
    }

    setOpen(true);
  };

  return (
    <>
      <Card className="border-fuchsia-200/70 shadow-lg shadow-fuchsia-500/5" id="book-session">
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
              Book now
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
              {nextAvailableSlot?.schedule?.startDateTime
                ? format(parseISO(nextAvailableSlot.schedule.startDateTime), "EEEE, MMM d • h:mm a")
                : "No time slots published yet"}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {nextAvailableSlot
                ? `Choose a time with ${expertName} and continue in seconds.`
                : "Once the expert publishes availability, booking will open here automatically."}
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

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto border-violet-200 sm:max-w-5xl">
          <DialogHeader>
            <DialogTitle>Choose your consultation slot</DialogTitle>
            <DialogDescription>
              Pick a date and time for your session with {expertName}.
            </DialogDescription>
          </DialogHeader>

          <AvailabilityCalendar
            expertId={expertId}
            expertName={expertName}
            expertTitle={expertTitle}
            consultationFee={consultationFee}
            availability={availability}
            isLoggedIn={isLoggedIn}
            userRole={userRole}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
