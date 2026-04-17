"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import {
  AlertCircle,
  CheckCircle2,
  CreditCard,
  Loader2,
  ReceiptText,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { initiateConsultationPayment } from "@/src/services/bookings.service";

type PaymentResultCardProps = {
  mode?: "success" | "failed" | "cancelled" | "pending";
};

type PaymentUiStatus = "success" | "failed" | "cancelled" | "pending";

const readFirst = (searchParams: URLSearchParams, keys: string[]) => {
  for (const key of keys) {
    const value = searchParams.get(key);
    if (value) {
      return value;
    }
  }

  return null;
};

const formatAmount = (amount?: string | null, currency?: string | null) => {
  if (!amount) {
    return "Not provided";
  }

  const numericAmount = Number(amount);
  if (Number.isNaN(numericAmount)) {
    return amount;
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "USD",
    maximumFractionDigits: 2,
  }).format(numericAmount);
};

const resolveStatus = (rawStatus: string | null, mode: PaymentUiStatus): PaymentUiStatus => {
  const normalized = (rawStatus || mode).toLowerCase();

  if (["success", "successful", "paid", "completed", "succeeded", "valid"].includes(normalized)) {
    return "success";
  }

  if (["cancel", "cancelled", "canceled"].includes(normalized)) {
    return "cancelled";
  }

  if (["failed", "fail", "error", "declined", "rejected", "invalid"].includes(normalized)) {
    return "failed";
  }

  return "pending";
};

const getStatusCopy = (status: PaymentUiStatus) => {
  switch (status) {
    case "success":
      return {
        badge: "Payment received",
        title: "Your payment looks good",
        description:
          "Your consultation payment has been recorded. You can now review the booking from your dashboard.",
        tone: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100",
        panel: "border-emerald-200 bg-emerald-50 text-emerald-900",
        Icon: CheckCircle2,
      };
    case "failed":
      return {
        badge: "Payment failed",
        title: "Payment was not completed",
        description:
          "No worries — you can retry the payment or go back to your bookings and try again later.",
        tone: "bg-rose-100 text-rose-700 hover:bg-rose-100",
        panel: "border-rose-200 bg-rose-50 text-rose-900",
        Icon: AlertCircle,
      };
    case "cancelled":
      return {
        badge: "Payment cancelled",
        title: "You cancelled the checkout",
        description:
          "Your booking is still safe. When you are ready, you can return and complete the payment.",
        tone: "bg-amber-100 text-amber-700 hover:bg-amber-100",
        panel: "border-amber-200 bg-amber-50 text-amber-900",
        Icon: RotateCcw,
      };
    default:
      return {
        badge: "Payment update",
        title: "Payment status is being checked",
        description:
          "We received your payment response. Please review the details below or return to your bookings.",
        tone: "bg-sky-100 text-sky-700 hover:bg-sky-100",
        panel: "border-sky-200 bg-sky-50 text-sky-900",
        Icon: ReceiptText,
      };
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

export default function PaymentResultCard({
  mode = "success",
}: PaymentResultCardProps) {
  const searchParams = useSearchParams();

  const paymentDetails = useMemo(() => {
    const rawStatus = readFirst(searchParams, [
      "status",
      "paymentStatus",
      "payment_status",
      "result",
    ]);

    return {
      status: resolveStatus(rawStatus, mode),
      consultationId: readFirst(searchParams, [
        "consultationId",
        "consultation_id",
        "bookingId",
        "booking_id",
        "id",
      ]),
      transactionId: readFirst(searchParams, [
        "transactionId",
        "transaction_id",
        "tran_id",
        "trxId",
        "txId",
      ]),
      amount: readFirst(searchParams, ["amount", "total", "payable", "price"]),
      currency: readFirst(searchParams, ["currency", "currencyCode"]),
      message: readFirst(searchParams, ["message", "gatewayMessage", "reason"]),
    };
  }, [mode, searchParams]);

  const statusCopy = getStatusCopy(paymentDetails.status);

  const retryPaymentMutation = useMutation({
    mutationFn: async () => {
      if (!paymentDetails.consultationId) {
        throw new Error("Consultation ID is missing for payment retry.");
      }

      return initiateConsultationPayment(paymentDetails.consultationId);
    },
    onSuccess: (result) => {
      toast.success("Redirecting to secure checkout...");

      if (result?.paymentUrl) {
        window.location.href = result.paymentUrl;
      }
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Unable to restart the payment right now."));
    },
  });

  const StatusIcon = statusCopy.Icon;
  const canRetry = Boolean(paymentDetails.consultationId) && paymentDetails.status !== "success";

  return (
    <Card className="border-blue-200/70 shadow-lg shadow-blue-500/5">
      <CardHeader className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <Badge className={`mb-2 ${statusCopy.tone}`}>
              <Sparkles className="mr-1 size-3.5" />
              {statusCopy.badge}
            </Badge>
            <CardTitle className="text-2xl">{statusCopy.title}</CardTitle>
            <CardDescription>{statusCopy.description}</CardDescription>
          </div>

          <div className={`rounded-2xl border p-3 ${statusCopy.panel}`}>
            <StatusIcon className="size-6" />
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        <div className={`rounded-2xl border px-4 py-3 text-sm ${statusCopy.panel}`}>
          {paymentDetails.message ||
            (paymentDetails.status === "success"
              ? "You can now continue with your dashboard booking flow."
              : "If needed, use the retry button below to continue the payment securely.")}
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl border bg-blue-50/70 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
              Consultation
            </p>
            <p className="mt-2 text-sm font-semibold text-foreground">
              {paymentDetails.consultationId || "Not provided"}
            </p>
          </div>

          <div className="rounded-2xl border bg-cyan-50/70 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-cyan-700">
              Transaction
            </p>
            <p className="mt-2 text-sm font-semibold text-foreground">
              {paymentDetails.transactionId || "Not provided"}
            </p>
          </div>

          <div className="rounded-2xl border bg-emerald-50/70 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
              Amount
            </p>
            <p className="mt-2 text-sm font-semibold text-foreground">
              {formatAmount(paymentDetails.amount, paymentDetails.currency)}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button asChild className="bg-blue-600 hover:bg-blue-700">
            <Link href="/dashboard/consultations">Go to consultations</Link>
          </Button>

          {canRetry ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => retryPaymentMutation.mutate()}
              disabled={retryPaymentMutation.isPending}
            >
              {retryPaymentMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Redirecting...
                </>
              ) : (
                <>
                  <CreditCard className="mr-2 size-4" />
                  Retry payment
                </>
              )}
            </Button>
          ) : null}

          <Button asChild variant="ghost">
            <Link href="/experts">Browse experts</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
