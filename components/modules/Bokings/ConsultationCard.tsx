import Link from "next/link";
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

type ConsultationCardProps = {
  booking: IConsultation;
  isHighlighted?: boolean;
  canPayNow?: boolean;
  isPaying?: boolean;
  onPayNow: (consultationId: string) => void;
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
      return "from-slate-500/10 via-violet-500/10 to-white";
    default:
      return "from-violet-500/15 via-fuchsia-500/10 to-white";
  }
};

export default function ConsultationCard({
  booking,
  isHighlighted = false,
  canPayNow = false,
  isPaying = false,
  onPayNow,
}: ConsultationCardProps) {
  const expertName = booking.expert?.fullName || "Consultation booking";
  const expertTitle = booking.expert?.title || "Expert consultation";
  const expertInitials = expertName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
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
          <div className="rounded-2xl border bg-violet-50/70 p-3">
            <div className="mb-1 flex items-center gap-2 text-violet-700">
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

        <div className="flex flex-wrap gap-3">
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

          {canPayNow ? (
            <Button className="bg-violet-600 hover:bg-violet-700" onClick={() => onPayNow(booking.id)}>
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
  );
}
