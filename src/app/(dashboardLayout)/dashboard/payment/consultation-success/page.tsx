import PaymentSuccessContent from "@/components/modules/Bokings/PaymentSuccessContent";

export default function ConsultationPaymentSuccessPage() {
  return (
    <div className="space-y-6 px-4 py-6 md:px-6">
      <section className="overflow-hidden rounded-3xl border-0 bg-linear-to-r from-emerald-600 via-cyan-500 to-violet-600 p-6 text-white shadow-xl">
        <div>
          <p className="mb-2 text-sm font-medium text-white/80">Client Dashboard</p>
          <h1 className="text-3xl font-bold tracking-tight">Consultation payment success</h1>
          <p className="mt-2 max-w-2xl text-white/80">
            Your payment has been confirmed. Review the summary and continue managing your consultation below.
          </p>
        </div>
      </section>

      <PaymentSuccessContent />
    </div>
  );
}
