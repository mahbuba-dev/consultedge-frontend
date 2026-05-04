"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import type { IExpertAvailability } from "@/src/types/expert.types";
import {
  validateCoupon,
  type ICouponValidationResult,
} from "@/src/services/coupon.service";
import { format, parseISO } from "date-fns";
import {
  ArrowRight,
  CalendarDays,
  Check,
  Clock3,
  Loader2,
  ShieldCheck,
  Sparkles,
  Tag,
  X,
} from "lucide-react";

type BookingSummaryProps = {
  expertName: string;
  expertTitle?: string | null;
  consultationFee?: number | null;
  selectedSlot?: IExpertAvailability | null;
  isLoggedIn?: boolean;
  isClient?: boolean;
  actionLoading?: "pay-now" | "pay-later" | null;
  appliedCoupon?: ICouponValidationResult | null;
  onCouponChange?: (coupon: ICouponValidationResult | null) => void;
  onBookNow: () => void;
  onPayLater: () => void;
  onRefreshAvailability?: () => void;
};

const formatCurrency = (value?: number | null) =>
  typeof value === "number" ? `$${value}` : "Contact for pricing";

const getStartDateTime = (selectedSlot?: IExpertAvailability | null) => {
  const rawSlot = selectedSlot as (IExpertAvailability & { startDateTime?: string | null }) | null | undefined;
  return selectedSlot?.schedule?.startDateTime ?? rawSlot?.startDateTime ?? "";
};

const getEndDateTime = (selectedSlot?: IExpertAvailability | null) => {
  const rawSlot = selectedSlot as (IExpertAvailability & { endDateTime?: string | null }) | null | undefined;
  return selectedSlot?.schedule?.endDateTime ?? rawSlot?.endDateTime ?? null;
};

const getSelectedDate = (selectedSlot?: IExpertAvailability | null) => {
  const dateValue = getStartDateTime(selectedSlot);
  return dateValue ? format(parseISO(dateValue), "EEEE, MMM d, yyyy") : "Pick a date";
};

const getSelectedTime = (selectedSlot?: IExpertAvailability | null) => {
  const startValue = getStartDateTime(selectedSlot);
  if (!startValue) return "Choose an available time";

  const start = parseISO(startValue);
  const endValue = getEndDateTime(selectedSlot);
  const end = endValue ? parseISO(endValue) : null;

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
  appliedCoupon = null,
  onCouponChange,
  onBookNow,
  onPayLater,
}: BookingSummaryProps) {
  const isDisabled = Boolean(actionLoading);
  const [couponInput, setCouponInput] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);

  const fee = typeof consultationFee === "number" ? consultationFee : null;

  const handleApplyCoupon = async () => {
    const code = couponInput.trim();
    if (!code) {
      setCouponError("Enter a coupon code first.");
      return;
    }
    if (!fee || fee <= 0) {
      setCouponError("No fee available to apply a coupon to.");
      return;
    }
    setCouponLoading(true);
    setCouponError(null);
    try {
      const result = await validateCoupon(code, fee);
      onCouponChange?.(result);
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "This coupon is not valid right now.";
      setCouponError(message);
      onCouponChange?.(null);
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    onCouponChange?.(null);
    setCouponInput("");
    setCouponError(null);
  };

  return (
    <Card className="overflow-hidden border-blue-200/70 shadow-xl shadow-blue-500/10">
      <CardHeader className="bg-linear-to-br from-blue-600 via-cyan-600 to-indigo-600 text-white">
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
        <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-4 dark:border-cyan-500/20 dark:bg-cyan-500/10">
          <p className="text-xs uppercase tracking-[0.2em] text-blue-700 dark:text-cyan-300">Expert</p>
          <h3 className="mt-1 text-lg font-semibold text-foreground dark:text-white">{expertName}</h3>
          <p className="text-sm text-muted-foreground dark:text-slate-300">{expertTitle || "Consultation specialist"}</p>
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

        <div className="rounded-2xl border bg-emerald-50/70 p-4 dark:border-emerald-500/20 dark:bg-emerald-500/10">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-300">Session fee</p>
              {appliedCoupon ? (
                <div className="mt-1 flex flex-wrap items-baseline gap-2">
                  <p className="text-2xl font-bold text-foreground dark:text-white">
                    {formatCurrency(appliedCoupon.finalAmount)}
                  </p>
                  <p className="text-sm font-medium text-muted-foreground line-through dark:text-slate-400">
                    {formatCurrency(appliedCoupon.originalAmount)}
                  </p>
                </div>
              ) : (
                <p className="mt-1 text-2xl font-bold text-foreground dark:text-white">
                  {formatCurrency(fee)}
                </p>
              )}
              {appliedCoupon ? (
                <p className="mt-1 text-xs font-medium text-emerald-700 dark:text-emerald-300">
                  Coupon {appliedCoupon.code} — saved {formatCurrency(appliedCoupon.discountAmount)}
                </p>
              ) : null}
            </div>
            <ShieldCheck className="size-8 shrink-0 text-emerald-600 dark:text-emerald-300" />
          </div>
        </div>

        {/* Coupon code
        {fee && fee > 0 ? (
          <div className="rounded-2xl border bg-background p-3">
            <div className="mb-2 flex items-center gap-2 text-muted-foreground">
              <Tag className="size-4" />
              <span className="text-xs font-semibold uppercase tracking-wide">
                Have a coupon?
              </span>
            </div>

            {appliedCoupon ? (
              <div className="flex items-center justify-between gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm dark:border-emerald-500/30 dark:bg-emerald-500/10">
                <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-700 dark:text-emerald-200">
                  <Check className="size-4" />
                  {appliedCoupon.code} applied
                </span>
                <button
                  type="button"
                  onClick={handleRemoveCoupon}
                  disabled={isDisabled}
                  className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs text-emerald-700 hover:bg-emerald-100 disabled:opacity-50 dark:text-emerald-200 dark:hover:bg-emerald-500/20"
                  aria-label="Remove coupon"
                >
                  <X className="size-3.5" />
                  Remove
                </button>
              </div>
            ) : (
              <>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Input
                    value={couponInput}
                    onChange={(event) => {
                      setCouponInput(event.target.value);
                      if (couponError) setCouponError(null);
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        void handleApplyCoupon();
                      }
                    }}
                    placeholder="Enter code (e.g. SAVE10)"
                    className="h-9 flex-1 uppercase tracking-wider"
                    disabled={couponLoading || isDisabled}
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-9 sm:w-24"
                    onClick={() => void handleApplyCoupon()}
                    disabled={couponLoading || isDisabled || !couponInput.trim()}
                  >
                    {couponLoading ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      "Apply"
                    )}
                  </Button>
                </div>
                {couponError ? (
                  <p className="mt-2 text-xs font-medium text-red-600 dark:text-red-400">
                    {couponError}
                  </p>
                ) : null}
              </>
            )}
          </div>
        ) : null} */}

        <Separator />

        {!isLoggedIn ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
            Sign in with a <strong>client</strong> account to continue booking.
          </div>
        ) : !isClient ? (
          <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-800 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-200">
            Booking is currently available for <strong>client accounts</strong> only.
          </div>
        ) : (
          <div className="rounded-2xl border border-blue-100 bg-blue-50/60 px-4 py-3 text-sm text-blue-800 dark:border-cyan-500/30 dark:bg-cyan-500/10 dark:text-cyan-100">
            Choose <strong>pay now</strong> for Stripe checkout or <strong>pay later</strong>
            to reserve and complete payment from your dashboard.
          </div>
        )}

        <div className="space-y-2">
          <Button
            className="w-full bg-blue-600 text-white hover:bg-blue-700"
            disabled={isDisabled}
            type="button"
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
            className="w-full border-blue-200 text-blue-700 hover:bg-blue-50 dark:border-cyan-500/30 dark:bg-transparent dark:text-cyan-200 dark:hover:bg-cyan-500/10"
            disabled={isDisabled}
            type="button"
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
