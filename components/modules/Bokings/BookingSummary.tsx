"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { IExpertAvailability } from "@/src/types/expert.types";
import { format, parseISO } from "date-fns";
import {
  ArrowRight,
  CalendarDays,
  Clock3,
  Loader2,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

type BookingSummaryProps = {
  expertName: string;
  expertTitle?: string | null;
  consultationFee?: number | null;
  selectedSlot?: IExpertAvailability | null;
  isLoggedIn?: boolean;
  isClient?: boolean;
  actionLoading?: "pay-now" | "pay-later" | null;
  onBookNow: () => void;
  onPayLater: () => void;
};

const formatCurrency = (value?: number | null) =>
  typeof value === "number" ? `$${value}` : "Contact for pricing";

const getSelectedDate = (selectedSlot?: IExpertAvailability | null) => {
  const dateValue = selectedSlot?.schedule?.startDateTime;
  return dateValue ? format(parseISO(dateValue), "EEEE, MMM d, yyyy") : "Pick a date";
};

const getSelectedTime = (selectedSlot?: IExpertAvailability | null) => {
  const startValue = selectedSlot?.schedule?.startDateTime;
  if (!startValue) return "Choose an available time";

  const start = parseISO(startValue);
  const end = selectedSlot?.schedule?.endDateTime
    ? parseISO(selectedSlot.schedule.endDateTime)
    : null;

  return end
    ? `${format(start, "h:mm a")} - ${format(end, "h:mm a")}`
    : format(start, "h:mm a");
};

export default function BookingSummary({
  expertName,
  expertTitle,
  consultationFee,
  selectedSlot,
  isLoggedIn = false,
  isClient = false,
  actionLoading = null,
  onBookNow,
  onPayLater,
}: BookingSummaryProps) {
  const isDisabled = !selectedSlot || !isLoggedIn || !isClient || Boolean(actionLoading);

  return (
    <Card className="overflow-hidden border-violet-200/70 shadow-xl shadow-violet-500/10">
      <CardHeader className="bg-linear-to-br from-violet-600 via-fuchsia-600 to-indigo-600 text-white">
        <div className="flex items-center justify-between gap-3">
          <div>
            <Badge className="mb-2 bg-white/15 text-white hover:bg-white/15">
              <Sparkles className="mr-1 size-3.5" />
              Booking Summary
            </Badge>
            <CardTitle className="text-xl text-white">Reserve your session</CardTitle>
            <CardDescription className="text-white/80">
              Secure, fast, and designed for premium consultation scheduling.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 p-5">
        <div className="rounded-2xl border border-violet-100 bg-violet-50/70 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-violet-700">Expert</p>
          <h3 className="mt-1 text-lg font-semibold text-foreground">{expertName}</h3>
          <p className="text-sm text-muted-foreground">{expertTitle || "Consultation specialist"}</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border bg-background p-3">
            <div className="mb-1 flex items-center gap-2 text-muted-foreground">
              <CalendarDays className="size-4" />
              <span className="text-xs uppercase tracking-wide">Selected date</span>
            </div>
            <p className="font-medium text-foreground">{getSelectedDate(selectedSlot)}</p>
          </div>

          <div className="rounded-2xl border bg-background p-3">
            <div className="mb-1 flex items-center gap-2 text-muted-foreground">
              <Clock3 className="size-4" />
              <span className="text-xs uppercase tracking-wide">Time slot</span>
            </div>
            <p className="font-medium text-foreground">{getSelectedTime(selectedSlot)}</p>
          </div>
        </div>

        <div className="rounded-2xl border bg-emerald-50/70 p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-emerald-700">Session fee</p>
              <p className="mt-1 text-2xl font-bold text-foreground">
                {formatCurrency(consultationFee)}
              </p>
            </div>
            <ShieldCheck className="size-8 text-emerald-600" />
          </div>
        </div>

        <Separator />

        {!isLoggedIn ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Sign in with a <strong>client</strong> account to continue booking.
          </div>
        ) : !isClient ? (
          <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-800">
            Booking is currently available for <strong>client accounts</strong> only.
          </div>
        ) : (
          <div className="rounded-2xl border border-violet-100 bg-violet-50/60 px-4 py-3 text-sm text-violet-800">
            Choose <strong>pay now</strong> for Stripe checkout or <strong>pay later</strong>
            to reserve and complete payment from your dashboard.
          </div>
        )}

        <div className="space-y-2">
          <Button
            className="w-full bg-violet-600 text-white hover:bg-violet-700"
            disabled={isDisabled}
            onClick={onBookNow}
          >
            {actionLoading === "pay-now" ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Redirecting to checkout...
              </>
            ) : (
              <>
                Book & Pay Now
                <ArrowRight className="ml-2 size-4" />
              </>
            )}
          </Button>

          <Button
            variant="outline"
            className="w-full border-violet-200 text-violet-700 hover:bg-violet-50"
            disabled={isDisabled}
            onClick={onPayLater}
          >
            {actionLoading === "pay-later" ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Reserving slot...
              </>
            ) : (
              "Reserve & Pay Later"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
