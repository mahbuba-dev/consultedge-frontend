import PaymentResultCard from "@/components/modules/Bokings/PaymentResultCard";

export default function PaymentsCancelPage() {
  return (
    <div className="space-y-6 px-4 py-6 md:px-6">
      <section className="overflow-hidden rounded-3xl border-0 bg-linear-to-r from-amber-500 via-orange-500 to-blue-600 p-6 text-white shadow-xl">
        <div>
          <p className="mb-2 text-sm font-medium text-white/80">Client Dashboard</p>
          <h1 className="text-3xl font-bold tracking-tight">Payment cancelled</h1>
          <p className="mt-2 max-w-2xl text-white/80">
            Your checkout was cancelled. You can review the booking details and pay again whenever you are ready.
          </p>
        </div>
      </section>

      <PaymentResultCard mode="cancelled" />
    </div>
  );
}
