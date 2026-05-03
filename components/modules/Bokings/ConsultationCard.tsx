"use client";
import Link from "next/link";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowUpRight,
  CalendarDays,
  Clock3,
  CreditCard,
  Loader2,
  MessageCircleMore,
  ReceiptText,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/src/lib/utils";
import type { ConsultationStatus, IConsultation, PaymentStatus } from "@/src/types/booking.types";
import JoinSessionModal from "../Session/JoinSessionModal";
import EndSessionModal from "../Session/EndSessionModel";
import ReviewModal from "../Review/ReviewModal";
import CallPanel from "../ChatRoom/CallPanel";
import { updateConsultationStatus } from "@/src/services/bookings.service";
import { createTestimonial } from "@/src/services/testimonial.services";
import type { ITestimonial } from "@/src/types/testimonial.types";


const getConsultationEndTime = (booking: IConsultation) => {
  const rawBooking = booking as IConsultation & {
    endDateTime?: string | null;
    schedule?: { endDateTime?: string | null } | null;
  };

  const endValue =
    booking.expertSchedule?.schedule?.endDateTime ??
    rawBooking.schedule?.endDateTime ??
    rawBooking.endDateTime ??
    null;

  if (endValue) {
    return new Date(endValue);
  }

  return booking.date ? new Date(booking.date) : null;
};

const isPastSession = (booking: IConsultation) => {
  const endTime = getConsultationEndTime(booking);

  if (!endTime) {
    return false;
  }

  return endTime < new Date();
};




type ConsultationCardProps = {
  booking: IConsultation;
  isHighlighted?: boolean;
  canPayNow?: boolean;
  isPaying?: boolean;
  onPayNow: (consultationId: string) => void;
  onOpenReschedule: (booking: IConsultation) => void;
  onReviewSubmitted?: () => void;
};

const updateConsultationCache = (
  current: unknown,
  consultationId: string,
  updater: (consultation: IConsultation) => IConsultation,
) => {
  if (!current || typeof current !== "object") {
    return current;
  }

  const currentData = (current as { data?: unknown }).data;

  if (!Array.isArray(currentData)) {
    return current;
  }

  return {
    ...(current as Record<string, unknown>),
    data: currentData.map((consultation) => {
      if (
        consultation &&
        typeof consultation === "object" &&
        "id" in consultation &&
        consultation.id === consultationId
      ) {
        return updater(consultation as IConsultation);
      }

      return consultation;
    }),
  };
};

const formatDateTime = (value?: string) => {
  if (!value) {
    return "Date pending";
  }

  return new Date(value).toLocaleString();
};

const formatMoney = (booking: IConsultation) => {
  const amount =
    typeof booking.payment?.amount === "number"
      ? booking.payment.amount
      : typeof booking.expert?.consultationFee === "number"
        ? booking.expert.consultationFee
        : null;

  if (amount === null) {
    return "To be confirmed";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(amount);
};

const getStatusBadge = (status?: ConsultationStatus) => {
  switch (status) {
    case "CONFIRMED":
      return <Badge className="bg-sky-100 text-sky-700 hover:bg-sky-100 dark:bg-sky-500/15 dark:text-sky-200 dark:hover:bg-sky-500/15">Confirmed</Badge>;
    case "COMPLETED":
      return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-500/15 dark:text-emerald-200 dark:hover:bg-emerald-500/15">Completed</Badge>;
    case "CANCELLED":
      return <Badge variant="destructive">Cancelled</Badge>;
    default:
      return <Badge variant="secondary">Pending</Badge>;
  }
};

const getPaymentBadge = (status?: PaymentStatus) => {
  switch (status) {
    case "PAID":
      return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-500/15 dark:text-emerald-200 dark:hover:bg-emerald-500/15">Paid</Badge>;
    case "FAILED":
      return <Badge variant="destructive">Failed</Badge>;
    case "REFUNDED":
      return <Badge variant="outline">Refunded</Badge>;
    default:
      return <Badge variant="secondary">Unpaid</Badge>;
  }
};

const getHeaderTone = (paymentStatus?: PaymentStatus) => {
  switch (paymentStatus) {
    case "PAID":
      return "from-emerald-500/15 via-cyan-500/10 to-white dark:from-emerald-500/15 dark:via-cyan-500/10 dark:to-slate-900/80";
    case "FAILED":
      return "from-rose-500/15 via-orange-500/10 to-white dark:from-rose-500/20 dark:via-orange-500/10 dark:to-slate-900/80";
    case "REFUNDED":
      return "from-slate-500/10 via-blue-500/10 to-white dark:from-slate-500/15 dark:via-blue-500/10 dark:to-slate-900/80";
    default:
      return "from-blue-500/15 via-cyan-500/10 to-white dark:from-blue-500/15 dark:via-cyan-500/10 dark:to-slate-900/80";
  }
};


export default function ConsultationCard({
  booking,
  isHighlighted = false,
  canPayNow = false,
  isPaying = false,
  onPayNow,
  onOpenReschedule,
  onReviewSubmitted,
}: ConsultationCardProps) {
  const expertName = booking.expert?.fullName || "Consultation booking";
  const expertTitle = booking.expert?.title || "Expert consultation";
  const expertInitials = expertName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 1)
    .toUpperCase();

  const queryClient = useQueryClient();

  // Session flow state
  const [joinOpen, setJoinOpen] = useState(false);
  const [callOpen, setCallOpen] = useState(false);
  const [endOpen, setEndOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Session status logic
  const isCompleted = booking.status === "COMPLETED";
  const isConfirmed = booking.status === "CONFIRMED" && booking.paymentStatus === "PAID";
  const isPast = isPastSession(booking);
  // Handlers
  const handleJoin = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setJoinOpen(false);
      setCallOpen(true);
    }, 1200);
  };

  const handleEnd = () => {
    setCallOpen(false);
    setEndOpen(true);
  };

  // const handleConfirmEnd = () => {
  //   setEndOpen(false);
  //   setReviewOpen(true);
  //   // Here, trigger backend session completion
  // };
  const completeConsultationMutation = useMutation({
    mutationFn: () => updateConsultationStatus(booking.id, "COMPLETED"),
    onSuccess: () => {
      setEndOpen(false);
      setCallOpen(false);
      setReviewOpen(true);
      toast.success("Session ended successfully.");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || error?.message || "Error ending session.");
    },
  });

  const submitReviewMutation = useMutation({
    mutationFn: ({ rating, comment }: { rating: number; comment: string }) =>
      createTestimonial({
        rating,
        comment,
        consultationId: booking.id,
      }),
    onSuccess: (testimonial: ITestimonial) => {
      queryClient.setQueryData(["consultations"], (current: unknown) =>
        updateConsultationCache(current, booking.id, (consultation) => ({
          ...consultation,
          status: "COMPLETED",
          testimonial,
        })),
      );

      setReviewOpen(false);
      toast.success("Review submitted successfully!");
      onReviewSubmitted?.();
      void queryClient.invalidateQueries({ queryKey: ["consultations"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || error?.message || "Failed to submit review. Please try again.");
    },
  });

  const handleConfirmEnd = async () => {
    await completeConsultationMutation.mutateAsync();
  };

  const handleSubmitReview = async (rating: number, comment: string) => {
    if (hasReview) {
      toast.info("Review already submitted for this consultation.");
      setReviewOpen(false);
      return;
    }

    await submitReviewMutation.mutateAsync({ rating, comment });
  };

  const hasReview = Boolean(booking.testimonial);



  return (
    <>
      <Card
        id={`consultation-card-${booking.id}`}
        className={cn(
          "overflow-hidden border-border/60 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg",
          isHighlighted && "border-amber-300 ring-2 ring-amber-200 shadow-amber-100/70",
        )}
      >
        <CardHeader className={cn("gap-4 bg-linear-to-r", getHeaderTone(booking.paymentStatus))}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <Avatar size="lg" className="size-12 ring-2 ring-white/80">
                <AvatarImage src={booking.expert?.profilePhoto || undefined} alt={expertName} />
                <AvatarFallback>{expertInitials || "C"}</AvatarFallback>
              </Avatar>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <CardTitle className="text-lg">{expertName}</CardTitle>
                  {isHighlighted ? (
                    <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">
                      Needs attention
                    </Badge>
                  ) : null}
                </div>
                <p className="text-sm text-muted-foreground">{expertTitle}</p>
                <div className="mt-2 flex flex-wrap gap-2">
  {getStatusBadge(booking.status)}
  {getPaymentBadge(booking.paymentStatus)}

  {isConfirmed && !isCompleted && isPast && (
    <Badge className="bg-red-100 text-red-700">Missed</Badge>
  )}
</div>
              </div>
            </div>

            <div className="rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-xs font-medium text-foreground backdrop-blur dark:border-white/15 dark:bg-white/10">
              {formatMoney(booking)}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 p-5">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            <div className="rounded-2xl border border-blue-200/60 bg-blue-50/70 p-3 dark:border-blue-500/20 dark:bg-blue-500/10">
              <div className="mb-1 flex items-center gap-2 text-blue-700 dark:text-blue-300">
                <CalendarDays className="size-4" />
                <span className="text-xs font-semibold uppercase tracking-wide">Session date</span>
              </div>
              <p className="text-sm font-semibold text-foreground">{formatDateTime(booking.date)}</p>
            </div>

            <div className="rounded-2xl border border-cyan-200/60 bg-cyan-50/70 p-3 dark:border-cyan-500/20 dark:bg-cyan-500/10">
              <div className="mb-1 flex items-center gap-2 text-cyan-700 dark:text-cyan-300">
                <Clock3 className="size-4" />
                <span className="text-xs font-semibold uppercase tracking-wide">Booked on</span>
              </div>
              <p className="text-sm font-semibold text-foreground">{formatDateTime(booking.createdAt)}</p>
            </div>

            <div className="rounded-2xl border border-emerald-200/60 bg-emerald-50/70 p-3 dark:border-emerald-500/20 dark:bg-emerald-500/10 md:col-span-2 xl:col-span-1">
              <div className="mb-1 flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
                <ShieldCheck className="size-4" />
                <span className="text-xs font-semibold uppercase tracking-wide">Payment state</span>
              </div>
              <p className="text-sm font-semibold text-foreground">{booking.paymentStatus}</p>
            </div>
          </div>

          <div className="rounded-2xl border bg-muted/20 p-3 text-sm text-muted-foreground dark:border-white/10 dark:bg-white/5">
            <div className="grid gap-2 sm:grid-cols-2">
              <p>
                <span className="font-medium text-foreground">Consultation ID:</span> {booking.id}
              </p>
              <p>
                <span className="font-medium text-foreground">Transaction ID:</span>{" "}
                {booking.payment?.transactionId || "Pending gateway response"}
              </p>
              <p>
                <span className="font-medium text-foreground">Payment ID:</span> {booking.payment?.id || "Pending"}
              </p>
              <p>
                <span className="font-medium text-foreground">Amount:</span> {formatMoney(booking)}
              </p>
            </div>
          </div>

         <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">

  {booking.expert?.id && (
    <Button asChild variant="outline" className="w-full">
      <Link href={`/experts/${booking.expert.id}`}>
        <ArrowUpRight className="mr-2 size-4" />
        View expert
      </Link>
    </Button>
  )}

  {booking.expert?.id && (
    <Button asChild variant="outline" className="w-full">
      <Link href={`/dashboard/chat?expertId=${booking.expert.id}`}>
        <MessageCircleMore className="mr-2 size-4" />
        Message
      </Link>
    </Button>
  )}

  <Button asChild variant="outline" className="w-full">
    <Link href={`/dashboard/consultations?consultationId=${booking.id}`}>
      <ReceiptText className="mr-2 size-4" />
      View details
    </Link>
  </Button>

  {/* Completed → Review Session */}
  {isCompleted && !hasReview && (
    <Button
      variant="secondary"
      className="w-full bg-emerald-600 text-white hover:bg-emerald-700"
      onClick={() => setReviewOpen(true)}
    >
      Review Session
    </Button>
  )}

  {isCompleted && hasReview && (
    <Badge className="w-full text-center bg-emerald-100 text-emerald-700 text-sm font-semibold p-4 dark:bg-emerald-500/15 dark:text-emerald-200">
      Feedback Submitted
    </Badge>
  )}

  {/* Confirmed, paid, not completed */}
  {isConfirmed && !isCompleted && (
    <>
      {isPast ? (
        <Button
          variant="outline"
          className="w-full border-red-300 text-red-700 hover:bg-red-50"
          onClick={() => onOpenReschedule?.(booking)}
        >
          Reschedule
        </Button>
      ) : (
        <Button
          variant="default"
          className="w-full bg-blue-600 text-white hover:bg-blue-700"
          onClick={() => setJoinOpen(true)}
        >
          Join Session
        </Button>
      )}
    </>
  )}

  {canPayNow && (
    <Button
      className="w-full bg-blue-600 hover:bg-blue-700"
      onClick={() => onPayNow(booking.id)}
    >
      {isPaying ? (
        <>
          <Loader2 className="mr-2 size-4 animate-spin" />
          Processing...
        </>
      ) : (
        <>
          <CreditCard className="mr-2 size-4" />
          Pay now
        </>
      )}
    </Button>
  )}

</div>

        </CardContent>
      </Card>

      {/* Modals for session flow */}
      <JoinSessionModal
        open={joinOpen}
        scheduledStart={booking.date || new Date()}
        onJoin={handleJoin}
        onClose={() => setJoinOpen(false)}
        loading={loading}
      />
      <CallPanel
        open={callOpen}
        callState={callOpen ? "active" : "idle"}
        localVideoRef={{ current: null }}
        remoteVideoRef={{ current: null }}
        remoteName={expertName}
        onEndCall={handleEnd} isCaller={false}      />
      <EndSessionModal
        open={endOpen}
        onConfirm={handleConfirmEnd}
        onCancel={() => setEndOpen(false)}
        loading={loading || completeConsultationMutation.isPending}
      />
      <ReviewModal
        open={reviewOpen}
        onSubmit={handleSubmitReview}
        onClose={() => setReviewOpen(false)}
        loading={loading || submitReviewMutation.isPending}
        consultationId={booking.id}
      />
    </>
  );
}
