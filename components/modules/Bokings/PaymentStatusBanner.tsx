import { AlertTriangle, CheckCircle2, ReceiptText } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/src/lib/utils";
import type { PaymentRedirectStatus } from "@/src/hooks/usePaymentRedirectParams";

type PaymentStatusBannerProps = {
  status?: PaymentRedirectStatus;
  consultationId?: string | null;
  paymentId?: string | null;
  transactionId?: string | null;
  amount?: string | null;
};

const getAmountLabel = (amount?: string | null) => {
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

export default function PaymentStatusBanner({
  status,
  consultationId,
  paymentId,
  transactionId,
  amount,
}: PaymentStatusBannerProps) {
  const issuccess = status === "success";
  const isCancelled = status === "cancelled";

  const title = issuccess
    ? "Payment completed successfully"
    : isCancelled
      ? "Payment was cancelled"
      : "Payment status received";

  const description = issuccess
    ? "Your consultation payment is confirmed and your booking data is being refreshed."
    : isCancelled
      ? "No payment was taken. You can review the consultation below and try again whenever you are ready."
      : "We received a payment update from the gateway and saved the related details below.";

  const Icon = issuccess ? CheckCircle2 : isCancelled ? AlertTriangle : ReceiptText;

  return (
    <Card
      className={cn(
        "shadow-sm",
        issuccess
          ? "border-emerald-200 bg-emerald-50/60"
          : isCancelled
            ? "border-amber-200 bg-amber-50/60"
            : "border-sky-200 bg-sky-50/60",
      )}
    >
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <Badge
              className={cn(
                "mb-2",
                issuccess
                  ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
                  : isCancelled
                    ? "bg-amber-100 text-amber-800 hover:bg-amber-100"
                    : "bg-sky-100 text-sky-700 hover:bg-sky-100",
              )}
            >
              <Icon className="mr-1 size-3.5" />
              {issuccess ? "Payment success" : isCancelled ? "Payment cancelled" : "Payment update"}
            </Badge>
            <CardTitle className="text-xl">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid gap-3 md:grid-cols-4">
          <div className="rounded-2xl border bg-white/80 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Consultation ID
            </p>
            <p className="mt-1 text-sm font-semibold text-foreground">
              {consultationId || "Not provided"}
            </p>
          </div>

          <div className="rounded-2xl border bg-white/80 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Payment ID
            </p>
            <p className="mt-1 text-sm font-semibold text-foreground">{paymentId || "Not provided"}</p>
          </div>

          <div className="rounded-2xl border bg-white/80 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Transaction ID
            </p>
            <p className="mt-1 text-sm font-semibold text-foreground">
              {transactionId || "Not provided"}
            </p>
          </div>

          <div className="rounded-2xl border bg-white/80 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Amount
            </p>
            <p className="mt-1 text-sm font-semibold text-foreground">{getAmountLabel(amount)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
