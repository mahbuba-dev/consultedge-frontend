import ExpertAvailabilityForm from "@/components/modules/Experts/ExpertAvailabilityForm";

export default function ExpertSetAvailabilityPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Set availability</h1>
        <p className="text-muted-foreground">
          Create consultation slots for clients and keep your schedule updated from one place.
        </p>
      </div>

      <ExpertAvailabilityForm />
    </div>
  );
}

