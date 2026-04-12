import Link from "next/link";
import { CalendarDays, CheckCircle2, Clock3, MessageCircleMore, UserRound } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/src/lib/utils";
import type { IConsultation } from "@/src/types/booking.types";

type ExpertConsultationCardProps = {
  consultation: IConsultation;
};

const formatDateTime = (value?: string) => {
  if (!value) {
    return "Date pending";
  }

  return new Date(value).toLocaleString();
};

const getStatusBadge = (status?: string) => {
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

const getPaymentBadge = (status?: string) => {
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

export default function ExpertConsultationCard({
  consultation,
}: ExpertConsultationCardProps) {
  const clientName = consultation.client?.fullName || "Client";
  const clientInitials = clientName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <Card className="overflow-hidden border-border/60 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg">
      <CardHeader className="gap-4 bg-linear-to-r from-violet-500/15 via-fuchsia-500/10 to-white">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <Avatar size="lg" className="size-12 ring-2 ring-white/80">
              <AvatarImage src={consultation.client?.profilePhoto || undefined} alt={clientName} />
              <AvatarFallback>{clientInitials || "CL"}</AvatarFallback>
            </Avatar>

            <div>
              <CardTitle className="text-lg">{clientName}</CardTitle>
              <p className="text-sm text-muted-foreground">{consultation.client?.email || "Client consultation"}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {getStatusBadge(consultation.status)}
                {getPaymentBadge(consultation.paymentStatus)}
              </div>
            </div>
          </div>

          <div className="rounded-full border bg-white/80 px-3 py-1 text-xs font-medium text-foreground backdrop-blur">
            {typeof consultation.payment?.amount === "number"
              ? new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "USD",
                  maximumFractionDigits: 2,
                }).format(consultation.payment.amount)
              : "Amount pending"}
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
            <p className="text-sm font-semibold text-foreground">{formatDateTime(consultation.date)}</p>
          </div>

          <div className="rounded-2xl border bg-cyan-50/70 p-3">
            <div className="mb-1 flex items-center gap-2 text-cyan-700">
              <Clock3 className="size-4" />
              <span className="text-xs font-semibold uppercase tracking-wide">Video call ID</span>
            </div>
            <p className="text-sm font-semibold text-foreground break-all">
              {consultation.videoCallId || "Generated after confirmation"}
            </p>
          </div>

          <div className="rounded-2xl border bg-emerald-50/70 p-3 md:col-span-2 xl:col-span-1">
            <div className="mb-1 flex items-center gap-2 text-emerald-700">
              <CheckCircle2 className="size-4" />
              <span className="text-xs font-semibold uppercase tracking-wide">Created</span>
            </div>
            <p className="text-sm font-semibold text-foreground">{formatDateTime(consultation.createdAt)}</p>
          </div>
        </div>

        <div className="rounded-2xl border bg-muted/20 p-3 text-sm text-muted-foreground">
          <div className="grid gap-2 sm:grid-cols-2">
            <p>
              <span className="font-medium text-foreground">Consultation ID:</span> {consultation.id}
            </p>
            <p>
              <span className="font-medium text-foreground">Transaction ID:</span>{" "}
              {consultation.payment?.transactionId || "Pending gateway response"}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button asChild variant="outline">
            <Link
              href={`/expert/dashboard/messages${consultation.clientId ? `?participantId=${consultation.clientId}` : ""}`}
            >
              <MessageCircleMore className="mr-2 size-4" />
              Message client
            </Link>
          </Button>

          <Button variant="ghost" className={cn("pointer-events-none opacity-80")}>
            <UserRound className="mr-2 size-4" />
            Client details ready
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
