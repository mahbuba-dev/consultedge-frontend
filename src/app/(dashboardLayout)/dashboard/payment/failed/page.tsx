import PaymentResultCard from "@/components/modules/Bokings/PaymentResultCard";

export default function PaymentsFailedPage() {
  return (
    <div className="space-y-6 px-4 py-6 md:px-6">
      <section className="overflow-hidden rounded-3xl border-0 bg-linear-to-r from-rose-600 via-cyan-600 to-amber-500 p-6 text-white shadow-xl">
        <div>
          <p className="mb-2 text-sm font-medium text-white/80">Client Dashboard</p>
          <h1 className="text-3xl font-bold tracking-tight">Payment not completed</h1>
          <p className="mt-2 max-w-2xl text-white/80">
            Review the payment result, retry securely, and return to your booking in a few clicks.
          </p>
        </div>
      </section>

      <PaymentResultCard mode="failed" />
    </div>
  );
}
