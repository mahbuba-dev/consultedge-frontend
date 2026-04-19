"use client";
import Link from "next/link";
import { useState } from "react";
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
import { Router } from "next/router";
import { useRouter } from "next/navigation";


const isPastSession = (date?: string) => {
  if (!date) return false;
  return new Date(date) < new Date();
};




type ConsultationCardProps = {
  booking: IConsultation;
  isHighlighted?: boolean;
  canPayNow?: boolean;
  isPaying?: boolean;
  onPayNow: (consultationId: string) => void;
  onOpenReschedule: (booking: IConsultation) => void;
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
      return <Badge className="bg-sky-100 text-sky-700 hover:bg-sky-100">Confirmed</Badge>;
    case "COMPLETED":
      return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Completed</Badge>;
    case "CANCELLED":
      return <Badge variant="destructive">Cancelled</Badge>;
    default:
      return <Badge variant="secondary">Pending</Badge>;
  }
};

const getPaymentBadge = (status?: PaymentStatus) => {
  switch (status) {
    case "PAID":
      return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Paid</Badge>;
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
      return "from-emerald-500/15 via-cyan-500/10 to-white";
    case "FAILED":
      return "from-rose-500/15 via-orange-500/10 to-white";
    case "REFUNDED":
      return "from-slate-500/10 via-blue-500/10 to-white";
    default:
      return "from-blue-500/15 via-cyan-500/10 to-white";
  }
};


export default function ConsultationCard({
  booking,
  isHighlighted = false,
  canPayNow = false,
  isPaying = false,
  onPayNow,
  onOpenReschedule
}: ConsultationCardProps) {
  const expertName = booking.expert?.fullName || "Consultation booking";
  const expertTitle = booking.expert?.title || "Expert consultation";
  const expertInitials = expertName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const router = useRouter();

  // Session flow state
  const [joinOpen, setJoinOpen] = useState(false);
  const [callOpen, setCallOpen] = useState(false);
  const [endOpen, setEndOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Session status logic
  const isCompleted = booking.status === "COMPLETED";
  const isConfirmed = booking.status === "CONFIRMED" && booking.paymentStatus === "PAID";
  const isPast = isPastSession(booking.date);
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
const handleConfirmEnd = async () => {
  try {
    setLoading(true);

    // 1. Update backend
    await updateConsultationStatus(booking.id, "COMPLETED");

    // 2. Update UI instantly
    booking.status = "COMPLETED";

    // 3. Close modals
    setEndOpen(false);
    setCallOpen(false);

    // 4. Open review modal
    setReviewOpen(true);

  } catch (error) {
    console.error("Error ending session:", error);
  } finally {
    setLoading(false);
  }
};
  const handleSubmitReview = (rating: number, comment: string) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setReviewOpen(false);
      // Here, trigger backend review submission
    }, 1200);
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
                <AvatarFallback>{expertInitials || "CE"}</AvatarFallback>
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

            <div className="rounded-full border bg-white/80 px-3 py-1 text-xs font-medium text-foreground backdrop-blur">
              {formatMoney(booking)}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 p-5">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            <div className="rounded-2xl border bg-blue-50/70 p-3">
              <div className="mb-1 flex items-center gap-2 text-blue-700">
                <CalendarDays className="size-4" />
                <span className="text-xs font-semibold uppercase tracking-wide">Session date</span>
              </div>
              <p className="text-sm font-semibold text-foreground">{formatDateTime(booking.date)}</p>
            </div>

            <div className="rounded-2xl border bg-cyan-50/70 p-3">
              <div className="mb-1 flex items-center gap-2 text-cyan-700">
                <Clock3 className="size-4" />
                <span className="text-xs font-semibold uppercase tracking-wide">Booked on</span>
              </div>
              <p className="text-sm font-semibold text-foreground">{formatDateTime(booking.createdAt)}</p>
            </div>

            <div className="rounded-2xl border bg-emerald-50/70 p-3 md:col-span-2 xl:col-span-1">
              <div className="mb-1 flex items-center gap-2 text-emerald-700">
                <ShieldCheck className="size-4" />
                <span className="text-xs font-semibold uppercase tracking-wide">Payment state</span>
              </div>
              <p className="text-sm font-semibold text-foreground">{booking.paymentStatus}</p>
            </div>
          </div>

          <div className="rounded-2xl border bg-muted/20 p-3 text-sm text-muted-foreground">
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

          <div className="flex flex-wrap gap-3 justify-center">
            {booking.expert?.id ? (
              <Button asChild variant="outline">
                <Link href={`/experts/${booking.expert.id}`}>
                  <ArrowUpRight className="mr-2 size-4" />
                  View expert
                </Link>
              </Button>
            ) : null}

            {booking.expert?.id ? (
              <Button asChild variant="ghost">
                <Link href={`/dashboard/chat?expertId=${booking.expert.id}`}>
                  <MessageCircleMore className="mr-2 size-4" />
                  Message
                </Link>
              </Button>
            ) : null}

            <Button asChild variant="ghost">
              <Link href={`/dashboard/consultations?consultationId=${booking.id}`}>
                <ReceiptText className="mr-2 size-4" />
                View details
              </Link>
            </Button>
{/* Completed → Review Session */}
{/* If completed and NOT reviewed → show Review button */}
{isCompleted && !hasReview && (
  <Button
    variant="secondary"
    className="bg-emerald-600 text-white hover:bg-emerald-700"
    onClick={() => setReviewOpen(true)}
  >
    Review Session
  </Button>
)}

{/* If completed AND reviewed → show Reviewed badge */}
{isCompleted && hasReview && (
  <Badge className="bg-emerald-100 text-emerald-700 text-sm font-semi-bold p-2">
    Feedback Submitted
  </Badge>
)}

{/* Confirmed, paid, not completed */}
{isConfirmed && !isCompleted && (
  <>
    {isPast ? (
      <>
      
        <Button
          variant="outline"
          className="border-red-300 text-red-700 hover:bg-red-50"
         onClick={() => onOpenReschedule?.(booking)}
        >
          Reschedule
        </Button>
      </>
    ) : (
      <Button
        variant="default"
        className="bg-blue-600 text-white hover:bg-blue-700"
        onClick={() => setJoinOpen(true)}
      >
        Join Session
      </Button>
    )}
  </>
)}


         

            {canPayNow ? (
              <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => onPayNow(booking.id)}>
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
            ) : null}
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
        loading={loading}
      />
      <ReviewModal
        open={reviewOpen}
        onSubmit={handleSubmitReview}
        onClose={() => setReviewOpen(false)}
        loading={loading} consultationId={""}      />
    </>
  );
}
