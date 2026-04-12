"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";

export type PaymentRedirectStatus = "success" | "cancelled" | "pending" | null;

const normalizeStatus = (rawStatus: string | null): PaymentRedirectStatus => {
  const normalized = rawStatus?.toLowerCase();

  if (["success", "successful", "paid", "completed"].includes(normalized || "")) {
    return "success";
  }

  if (["cancelled", "canceled", "cancel"].includes(normalized || "")) {
    return "cancelled";
  }

  if (normalized) {
    return "pending";
  }

  return null;
};

export function usePaymentRedirectParams() {
  const searchParams = useSearchParams();

  return useMemo(() => {
    const consultationId = searchParams.get("consultationId");
    const paymentId = searchParams.get("paymentId");
    const transactionId = searchParams.get("transactionId");
    const amount = searchParams.get("amount");
    const status = normalizeStatus(searchParams.get("status"));

    return {
      consultationId,
      paymentId,
      transactionId,
      amount,
      status,
      hasRedirectData: Boolean(
        consultationId || paymentId || transactionId || amount || status,
      ),
    };
  }, [searchParams]);
}

export default usePaymentRedirectParams;
