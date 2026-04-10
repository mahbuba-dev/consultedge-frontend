"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { CalendarDays, Clock3, CreditCard, Loader2, RefreshCw, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getMyBookings, initiateConsultationPayment } from "@/src/services/bookings";
import type { ConsultationStatus, IConsultation, PaymentStatus } from "@/src/types/booking.types";

const formatDateTime = (value?: string) => {
  if (!value) {
    return "Date pending";
  }

  return new Date(value).toLocaleString();
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

const getErrorMessage = (error: unknown, fallback: string) => {
  if (typeof error === "object" && error !== null) {
    const maybeError = error as {
      response?: { data?: { message?: string } };
      message?: string;
    };

    return maybeError.response?.data?.message ?? maybeError.message ?? fallback;
  }

  return fallback;
};

export default function MyBookingsList() {
  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["my-bookings"],
    queryFn: () => getMyBookings({ limit: 50, sortBy: "date", sortOrder: "desc" }),
  });

  const payNowMutation = useMutation({
    mutationFn: (consultationId: string) => initiateConsultationPayment(consultationId),
    onSuccess: (result) => {
      toast.success("Redirecting to secure checkout...", {
        description: "Complete payment to confirm your consultation.",
      });

      if (result?.paymentUrl) {
        window.location.href = result.paymentUrl;
      }
    },
    onError: (mutationError) => {
      toast.error(getErrorMessage(mutationError, "Unable to continue to payment right now."));
    },
  });

  const bookings = useMemo(() => (Array.isArray(data?.data) ? data.data : []), [data]);

  return (
    <div className="space-y-6">
      <Card className="border-violet-200/70 bg-linear-to-r from-violet-50 via-white to-cyan-50 shadow-sm">
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <Badge className="mb-2 bg-violet-100 text-violet-700 hover:bg-violet-100">
              <Sparkles className="mr-1 size-3.5" />
              Client dashboard
            </Badge>
            <CardTitle className="text-2xl">My bookings</CardTitle>
            <CardDescription>
              Track upcoming sessions, payment status, and expert details from one place.
            </CardDescription>
          </div>

          <Button variant="outline" onClick={() => void refetch()} disabled={isFetching}>
            <RefreshCw className={`mr-2 size-4 ${isFetching ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </CardHeader>
      </Card>

      {isError ? (
        <Alert variant="destructive">
          <AlertTitle>Could not load your bookings</AlertTitle>
          <AlertDescription>
            {error instanceof Error
              ? error.message
              : "Your consultation list is unavailable right now. Please try again shortly."}
          </AlertDescription>
        </Alert>
      ) : null}

      {isLoading ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={index} className="h-52 animate-pulse bg-muted/40" />
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
            <div>
              <h3 className="text-lg font-semibold">No bookings yet</h3>
              <p className="text-sm text-muted-foreground">
                Once you book an expert, your consultation details will appear here.
              </p>
            </div>

            <Link href="/experts">
              <Button className="bg-violet-600 hover:bg-violet-700">Browse experts</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {bookings.map((booking: IConsultation) => {
            const canPayNow =
              booking.paymentStatus !== "PAID" && booking.status !== "CANCELLED" && !payNowMutation.isPending;

            return (
              <Card key={booking.id} className="border-border/60 shadow-sm transition hover:shadow-md">
                <CardHeader className="space-y-3">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <CardTitle className="text-lg">
                        {booking.expert?.fullName || "Consultation booking"}
                      </CardTitle>
                      <CardDescription>
                        {booking.expert?.title || "Expert consultation"}
                      </CardDescription>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {getStatusBadge(booking.status)}
                      {getPaymentBadge(booking.paymentStatus)}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl bg-violet-50/70 p-3">
                      <div className="mb-1 flex items-center gap-2 text-violet-700">
                        <CalendarDays className="size-4" />
                        <span className="text-xs font-medium uppercase tracking-wide">Session date</span>
                      </div>
                      <p className="text-sm font-semibold text-foreground">{formatDateTime(booking.date)}</p>
                    </div>

                    <div className="rounded-2xl bg-cyan-50/70 p-3">
                      <div className="mb-1 flex items-center gap-2 text-cyan-700">
                        <Clock3 className="size-4" />
                        <span className="text-xs font-medium uppercase tracking-wide">Booked on</span>
                      </div>
                      <p className="text-sm font-semibold text-foreground">{formatDateTime(booking.createdAt)}</p>
                    </div>
                  </div>

                  <div className="rounded-2xl border bg-muted/20 p-3 text-sm text-muted-foreground">
                    <p>
                      <span className="font-medium text-foreground">Video call ID:</span>{" "}
                      {booking.videoCallId || "Generated after confirmation"}
                    </p>
                    <p className="mt-1">
                      <span className="font-medium text-foreground">Payment amount:</span>{" "}
                      {typeof booking.payment?.amount === "number"
                        ? `$${booking.payment.amount}`
                        : typeof booking.expert?.consultationFee === "number"
                          ? `$${booking.expert.consultationFee}`
                          : "To be confirmed"}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    {booking.expert?.id ? (
                      <Link href={`/experts/${booking.expert.id}`}>
                        <Button variant="outline">View expert</Button>
                      </Link>
                    ) : null}

                    {canPayNow ? (
                      <Button
                        className="bg-violet-600 hover:bg-violet-700"
                        onClick={() => payNowMutation.mutate(booking.id)}
                      >
                        {payNowMutation.isPending ? (
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
          })}
        </div>
      )}
    </div>
  );
}
