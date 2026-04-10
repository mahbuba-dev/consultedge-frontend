import ExpertManageTable from "@/components/modules/Table/ExpertManageTable";

export default function ExpertManagementPage() {
  return (
    <section className="space-y-6 p-4 md:p-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Expert management</h1>
        <p className="text-sm text-muted-foreground">
          Review expert records and manage them from a searchable admin table.
        </p>
      </div>

      <ExpertManageTable />
    </section>
  );
}