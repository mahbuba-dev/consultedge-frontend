import ExpertAvailavilityForm from "@/components/modules/Experts/ExpertAvailavilityForm";

export default function MySchdulePage() {
  return (
    <div className="space-y-6 px-4 py-6 md:px-6">
      <section className="overflow-hidden rounded-3xl border-0 bg-linear-to-r from-slate-900 via-violet-900 to-fuchsia-800 p-6 text-white shadow-xl">
        <p className="mb-2 text-sm font-medium text-white/80">Expert Dashboard</p>
        <h1 className="text-3xl font-bold tracking-tight">My schedules</h1>
        <p className="mt-2 max-w-2xl text-white/80">
          Review your published availability, keep open slots fresh, and manage upcoming consultation windows with confidence.
        </p>
      </section>

      <ExpertAvailavilityForm mode="overview" />
    </div>
  );
}