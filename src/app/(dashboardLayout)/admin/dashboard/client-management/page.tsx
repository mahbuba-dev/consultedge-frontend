import ClientManageTable from "@/components/modules/Table/ClientManageTable";

export default function ClientManagementPage() {
  return (
    <section className="space-y-6 p-4 md:p-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Client management</h1>
        <p className="text-sm text-muted-foreground">
          Browse client accounts with built-in search, filters, sorting, and pagination.
        </p>
      </div>

      <ClientManageTable />
    </section>
  );
}