import ExpertAvailavilityForm from "@/components/modules/Experts/ExpertAvailavilityForm";

export default function SetAvailavilityPage() {
  return (
    <div className="space-y-6 px-4 py-6 md:px-6">
      <section className="overflow-hidden rounded-3xl border-0 bg-linear-to-r from-violet-600 via-fuchsia-600 to-indigo-600 p-6 text-white shadow-xl">
        <p className="mb-2 text-sm font-medium text-white/80">Expert Dashboard</p>
        <h1 className="text-3xl font-bold tracking-tight">Set your availability</h1>
        <p className="mt-2 max-w-2xl text-white/80">
          Publish open time slots, keep your calendar current, and give clients a smooth premium booking experience.
        </p>
      </section>

      <ExpertAvailavilityForm mode="manage" />
    </div>
  );
}
