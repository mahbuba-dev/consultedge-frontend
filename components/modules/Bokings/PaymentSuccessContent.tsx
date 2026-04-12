"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Home, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

import PaymentStatusBanner from "@/components/modules/Bokings/PaymentStatusBanner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import usePaymentRedirectParams from "@/src/hooks/usePaymentRedirectParams";
import { getMyBookings } from "@/src/services/bookings";

const formatCurrency = (amount?: string | null) => {
  if (!amount) {
    return "Not provided";
  }

  const numericAmount = Number(amount);
  if (Number.isNaN(numericAmount)) {
    return amount;
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(numericAmount);
};

export default function PaymentSuccessContent() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const toastShownRef = useRef(false);
  const { consultationId, paymentId, transactionId, amount, status, hasRedirectData } =
    usePaymentRedirectParams();

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["consultations"],
    queryFn: () => getMyBookings({ limit: 50, sortBy: "date", sortOrder: "desc" }),
  });

  const matchedConsultation = useMemo(() => {
    const bookings = Array.isArray(data?.data) ? data.data : [];

    return bookings.find(
      (item) => item.id === consultationId || (paymentId ? item.payment?.id === paymentId : false),
    );
  }, [consultationId, data?.data, paymentId]);

  useEffect(() => {
    if (status !== "success" || toastShownRef.current) {
      return;
    }

    toast.success("Payment successful", {
      description: transactionId
        ? `Transaction ${transactionId} has been recorded successfully.`
        : "Your consultation payment has been completed successfully.",
    });
    toastShownRef.current = true;

    void queryClient.invalidateQueries({ queryKey: ["consultations"] });
    void refetch();
    router.refresh();
  }, [queryClient, refetch, router, status, transactionId]);

  if (!hasRedirectData) {
    return (
      <Card className="border-violet-200/70 shadow-sm">
        <CardContent className="py-12 text-center">
          <p className="text-lg font-semibold text-foreground">No payment summary found</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Open this page from the payment gateway redirect to see the payment result.
          </p>
          <div className="mt-4 flex justify-center gap-3">
            <Button asChild>
              <Link href="/dashboard/consultations">Go to Consultations</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/">Back to Home</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-emerald-200/70 bg-linear-to-r from-emerald-50 via-white to-cyan-50 shadow-sm">
        <CardHeader>
          <Badge className="mb-2 w-fit bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
            <Sparkles className="mr-1 size-3.5" />
            Consultation payment
          </Badge>
          <CardTitle className="text-2xl">Payment completed</CardTitle>
          <CardDescription>
            Your booking and payment details are being refreshed from the backend now.
          </CardDescription>
        </CardHeader>
      </Card>

      <PaymentStatusBanner
        status="success"
        consultationId={consultationId}
        paymentId={paymentId}
        transactionId={transactionId}
        amount={amount}
      />

      <Card className="border-violet-200/70 shadow-sm">
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle className="text-xl">Booking summary</CardTitle>
              <CardDescription>
                Review the affected consultation and continue from your dashboard.
              </CardDescription>
            </div>

            {isFetching ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" />
                Refreshing...
              </div>
            ) : null}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="grid gap-3 md:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="h-24 animate-pulse rounded-2xl bg-muted/40" />
              ))}
            </div>
          ) : matchedConsultation ? (
            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-2xl border bg-violet-50/70 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-violet-700">
                  Expert
                </p>
                <p className="mt-2 text-sm font-semibold text-foreground">
                  {matchedConsultation.expert?.fullName || "Consultation booking"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {matchedConsultation.expert?.title || "Expert consultation"}
                </p>
              </div>

              <div className="rounded-2xl border bg-cyan-50/70 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-cyan-700">
                  Consultation status
                </p>
                <p className="mt-2 text-sm font-semibold text-foreground">
                  {matchedConsultation.status}
                </p>
                <p className="text-sm text-muted-foreground">
                  Payment: {matchedConsultation.paymentStatus}
                </p>
              </div>

              <div className="rounded-2xl border bg-emerald-50/70 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                  Amount paid
                </p>
                <p className="mt-2 text-sm font-semibold text-foreground">
                  {formatCurrency(amount)}
                </p>
                <p className="text-sm text-muted-foreground">
                  Transaction saved successfully
                </p>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed px-4 py-8 text-center">
              <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                <CheckCircle2 className="size-6" />
              </div>
              <p className="text-lg font-semibold text-foreground">Payment recorded</p>
              <p className="mt-2 text-sm text-muted-foreground">
                The backend redirect data was received successfully. Your consultation list will reflect the updated payment state shortly.
              </p>
            </div>
          )}

          <div className="flex flex-wrap gap-3 pt-2">
            <Button asChild className="bg-violet-600 hover:bg-violet-700">
              <Link href="/dashboard/consultations">Go to Consultations</Link>
            </Button>

            <Button asChild variant="outline">
              <Link
                href={
                  consultationId
                    ? `/dashboard/consultations?consultationId=${consultationId}`
                    : "/dashboard/consultations"
                }
              >
                View Booking Details
              </Link>
            </Button>

            <Button asChild variant="ghost">
              <Link href="/">
                <Home className="mr-2 size-4" />
                Back to Home
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
