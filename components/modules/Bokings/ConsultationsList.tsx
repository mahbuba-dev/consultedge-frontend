"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Loader2, RefreshCw, Sparkles } from "lucide-react";
import { toast } from "sonner";

import ConsultationCard from "@/components/modules/Bokings/ConsultationCard";
import PaymentStatusBanner from "@/components/modules/Bokings/PaymentStatusBanner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getMyBookings, initiateConsultationPayment } from "@/src/services/bookings";
import type { IConsultation } from "@/src/types/booking.types";

type ConsultationsListProps = {
  highlightedConsultationId?: string | null;
  redirectStatus?: "success" | "cancelled" | "pending" | null;
  redirectPaymentId?: string | null;
  redirectTransactionId?: string | null;
  redirectAmount?: string | null;
};

type ConsultationsPayload = {
  data?: unknown;
  consultations?: unknown;
  items?: unknown;
  result?: unknown;
  results?: unknown;
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

const extractConsultations = (payload: unknown): IConsultation[] => {
  if (Array.isArray(payload)) {
    return payload as IConsultation[];
  }

  if (!payload || typeof payload !== "object") {
    return [];
  }

  const candidate = payload as ConsultationsPayload;
  const pools = [
    candidate.data,
    candidate.consultations,
    candidate.items,
    candidate.result,
    candidate.results,
  ];

  for (const pool of pools) {
    if (Array.isArray(pool)) {
      return pool as IConsultation[];
    }

    if (pool && typeof pool === "object") {
      const nested = pool as ConsultationsPayload;
      if (Array.isArray(nested.data)) {
        return nested.data as IConsultation[];
      }
      if (Array.isArray(nested.consultations)) {
        return nested.consultations as IConsultation[];
      }
      if (Array.isArray(nested.items)) {
        return nested.items as IConsultation[];
      }
      if (Array.isArray(nested.result)) {
        return nested.result as IConsultation[];
      }
      if (Array.isArray(nested.results)) {
        return nested.results as IConsultation[];
      }
    }
  }

  return [];
};

export default function ConsultationsList({
  highlightedConsultationId,
  redirectStatus,
  redirectPaymentId,
  redirectTransactionId,
  redirectAmount,
}: ConsultationsListProps) {
  const toastShownRef = useRef(false);

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["consultations"],
    queryFn: () => getMyBookings({ limit: 50, sortBy: "createdAt", sortOrder: "desc" }),
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

  const bookings = useMemo(() => extractConsultations(data), [data]);

  const stats = useMemo(
    () => ({
      total: bookings.length,
      active: bookings.filter((item) => item.status === "CONFIRMED" || item.status === "PENDING").length,
      unpaid: bookings.filter((item) => item.paymentStatus !== "PAID" && item.status !== "CANCELLED").length,
    }),
    [bookings],
  );

  useEffect(() => {
    if (redirectStatus !== "cancelled" || toastShownRef.current) {
      return;
    }

    toast.warning("Payment cancelled", {
      description:
        "Your consultation payment was cancelled. You can review the booking below and pay again anytime.",
    });
    toastShownRef.current = true;
  }, [redirectStatus]);

  useEffect(() => {
    if (!highlightedConsultationId || !bookings.length) {
      return;
    }

    const element = document.getElementById(`consultation-card-${highlightedConsultationId}`);
    element?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [bookings, highlightedConsultationId]);

  return (
    <div className="space-y-6">
      <Card className="border-violet-200/70 bg-linear-to-r from-violet-50 via-white to-cyan-50 shadow-sm">
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <Badge className="mb-2 bg-violet-100 text-violet-700 hover:bg-violet-100">
              <Sparkles className="mr-1 size-3.5" />
              Client dashboard
            </Badge>
            <CardTitle className="text-2xl">My consultations</CardTitle>
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

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-violet-200/70 bg-linear-to-br from-violet-50 to-white shadow-sm">
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Total consultations</p>
            <p className="mt-2 text-3xl font-bold text-foreground">{stats.total}</p>
          </CardContent>
        </Card>

        <Card className="border-sky-200/70 bg-linear-to-br from-sky-50 to-white shadow-sm">
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Active sessions</p>
            <p className="mt-2 text-3xl font-bold text-foreground">{stats.active}</p>
          </CardContent>
        </Card>

        <Card className="border-amber-200/70 bg-linear-to-br from-amber-50 to-white shadow-sm">
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Awaiting payment</p>
            <p className="mt-2 text-3xl font-bold text-foreground">{stats.unpaid}</p>
          </CardContent>
        </Card>
      </div>

      {redirectStatus === "cancelled" ? (
        <PaymentStatusBanner
          status="cancelled"
          consultationId={highlightedConsultationId}
          paymentId={redirectPaymentId}
          transactionId={redirectTransactionId}
          amount={redirectAmount}
        />
      ) : null}

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
              <h3 className="text-lg font-semibold">No consultations yet</h3>
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
              booking.paymentStatus !== "PAID" &&
              booking.status !== "CANCELLED" &&
              !payNowMutation.isPending;

            return (
              <ConsultationCard
                key={booking.id}
                booking={booking}
                isHighlighted={booking.id === highlightedConsultationId}
                canPayNow={canPayNow}
                isPaying={payNowMutation.isPending}
                onPayNow={(consultationId) => payNowMutation.mutate(consultationId)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
