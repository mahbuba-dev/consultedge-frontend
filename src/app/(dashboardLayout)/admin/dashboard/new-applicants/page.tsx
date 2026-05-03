import NewApplicantsTable from "@/components/modules/Table/NewApplicantsTable";

export default function NewApplicantsPage() {
  return (
    <section className="space-y-6 p-4 md:p-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">New applicants</h1>
        <p className="text-sm text-muted-foreground">
          Review pending expert applications. Approve or reject to complete applicant processing.
        </p>
      </div>

      <NewApplicantsTable />
    </section>
  );
}
