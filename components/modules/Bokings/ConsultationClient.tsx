"use client";

import ConsultationsList from "@/components/modules/Bokings/ConsultationsList";
import usePaymentRedirectParams from "@/src/hooks/usePaymentRedirectParams";

export default function ConsultationsClient() {
  const { consultationId, paymentId, transactionId, amount, status } =
    usePaymentRedirectParams();

  return (
    <ConsultationsList
      highlightedConsultationId={consultationId}
      redirectStatus={status}
      redirectPaymentId={paymentId}
      redirectTransactionId={transactionId}
      redirectAmount={amount}
    />
  );
}
