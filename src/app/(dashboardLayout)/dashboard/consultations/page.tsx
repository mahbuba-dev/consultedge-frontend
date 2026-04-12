"use client";

import ConsultationsList from "@/components/modules/Bokings/ConsultationsList";
import usePaymentRedirectParams from "@/src/hooks/usePaymentRedirectParams";

export default function ConsultationsPage() {
  const { consultationId, paymentId, transactionId, amount, status } =
    usePaymentRedirectParams();

  return (
    <div className="space-y-6 px-4 py-6 md:px-6">
      <section className="overflow-hidden rounded-3xl border-0 bg-linear-to-r from-violet-600 via-fuchsia-600 to-indigo-600 p-6 text-white shadow-xl">
        <div>
          <p className="mb-2 text-sm font-medium text-white/80">Client Dashboard</p>
          <h1 className="text-3xl font-bold tracking-tight">My consultations</h1>
          <p className="mt-2 max-w-2xl text-white/80">
            Review your sessions, payment progress, and consultation details in one polished view.
          </p>
        </div>
      </section>

      <ConsultationsList
        highlightedConsultationId={consultationId}
        redirectStatus={status}
        redirectPaymentId={paymentId}
        redirectTransactionId={transactionId}
        redirectAmount={amount}
      />
    </div>
  );
}
