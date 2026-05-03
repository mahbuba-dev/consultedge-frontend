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
import { getMyBookings } from "@/src/services/bookings.service";

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

  const consultationsRedirectHref = useMemo(() => {
    const params = new URLSearchParams();

    if (consultationId) {
      params.set("consultationId", consultationId);
    }

    if (paymentId) {
      params.set("paymentId", paymentId);
    }

    if (transactionId) {
      params.set("transactionId", transactionId);
    }

    if (amount) {
      params.set("amount", amount);
    }

    params.set("status", status || "success");

    const query = params.toString();
    return query ? `/dashboard/success?${query}` : "/dashboard/success";
  }, [amount, consultationId, paymentId, status, transactionId]);

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["consultations"],
    queryFn: () => getMyBookings({ limit: 50, sortBy: "date", sortOrder: "desc" }),
  });

  const bookings = useMemo(() => (Array.isArray(data?.data) ? data.data : []), [data]);

  const matchedConsultation = useMemo(() => {
    return bookings.find(
      (item) => item.id === consultationId || (paymentId ? item.payment?.id === paymentId : false),
    );
  }, [bookings, consultationId, paymentId]);

  const fallbackConsultation = useMemo(() => {
    if (!bookings.length) {
      return null;
    }

    return bookings.find((item) => item.paymentStatus === "PAID" || item.payment?.status === "PAID") || bookings[0];
  }, [bookings]);

  const selectedConsultation = matchedConsultation || fallbackConsultation;
  const selectedConsultationId = consultationId || selectedConsultation?.id || null;
  const selectedPaymentId = paymentId || selectedConsultation?.payment?.id || null;
  const selectedTransactionId =
    transactionId || selectedConsultation?.payment?.transactionId || null;
  const selectedAmount =
    amount ||
    (typeof selectedConsultation?.payment?.amount === "number"
      ? String(selectedConsultation.payment.amount)
      : null);

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

  if (!hasRedirectData && !selectedConsultation) {
    return (
      <Card className="border-blue-200/70 shadow-sm">
        <CardContent className="py-12 text-center">
          <p className="text-lg font-semibold text-foreground">No payment summary found</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Open this page from the payment gateway redirect to see the payment result.
          </p>
          <div className="mt-4 flex justify-center gap-3">
            <Button asChild>
              <Link href={consultationsRedirectHref}>Go to Consultations</Link>
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
      <Card className="relative overflow-hidden border-emerald-200/70 bg-linear-to-r from-emerald-50 via-white to-cyan-50 shadow-sm dark:border-emerald-500/20 dark:from-slate-900 dark:via-slate-900/80 dark:to-slate-950">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 hidden bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.18),transparent_55%),radial-gradient(circle_at_bottom_left,rgba(34,211,238,0.16),transparent_55%)] dark:block"
        />
        <CardHeader className="relative">
          <Badge className="mb-2 w-fit border-emerald-200/60 bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-400/30 dark:bg-emerald-500/15 dark:text-emerald-200 dark:hover:bg-emerald-500/15">
            <Sparkles className="mr-1 size-3.5" />
            Consultation payment
          </Badge>
          <CardTitle className="text-2xl text-foreground">Payment completed</CardTitle>
          <CardDescription>
            {hasRedirectData
              ? "Your booking and payment details are being refreshed from the backend now."
              : "Showing your latest consultation summary from the dashboard."}
          </CardDescription>
        </CardHeader>
      </Card>

      {hasRedirectData ? (
        <PaymentStatusBanner
          status="success"
          consultationId={selectedConsultationId}
          paymentId={selectedPaymentId}
          transactionId={selectedTransactionId}
          amount={selectedAmount}
        />
      ) : null}

      <Card className="border-blue-200/70 shadow-sm">
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
          ) : selectedConsultation ? (
            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-2xl border border-blue-200/60 bg-blue-50/70 p-4 dark:border-blue-500/20 dark:bg-blue-500/10">
                <p className="text-xs font-semibold uppercase tracking-wide text-blue-700 dark:text-blue-300">
                  Expert
                </p>
                <p className="mt-2 text-sm font-semibold text-foreground">
                  {selectedConsultation.expert?.fullName || "Consultation booking"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {selectedConsultation.expert?.title || "Expert consultation"}
                </p>
              </div>

              <div className="rounded-2xl border border-cyan-200/60 bg-cyan-50/70 p-4 dark:border-cyan-500/20 dark:bg-cyan-500/10">
                <p className="text-xs font-semibold uppercase tracking-wide text-cyan-700 dark:text-cyan-300">
                  Consultation status
                </p>
                <p className="mt-2 text-sm font-semibold text-foreground">
                  {selectedConsultation.status}
                </p>
                <p className="text-sm text-muted-foreground">
                  Payment: {selectedConsultation.paymentStatus}
                </p>
              </div>

              <div className="rounded-2xl border border-emerald-200/60 bg-emerald-50/70 p-4 dark:border-emerald-500/20 dark:bg-emerald-500/10">
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
                  Amount paid
                </p>
                <p className="mt-2 text-sm font-semibold text-foreground">
                  {formatCurrency(selectedAmount)}
                </p>
                <p className="text-sm text-muted-foreground">
                  {hasRedirectData ? "Transaction saved successfully" : "Latest dashboard summary"}
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

          <div className="flex flex-wrap gap-3 pt-2 ">
           <Button asChild className="px-4 ">
    <Link href="/dashboard/consultations">
    Go to Consultations
  </Link>
   </Button>

  <Button asChild>
  <Link href="/dashboard/consultations">
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
