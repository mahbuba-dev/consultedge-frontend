import BookingsManageTable from "@/components/modules/shared/Table/BookingsManageTable";

export default function BookingsManagementPage() {
  return (
    <section className="space-y-6 p-4 md:p-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Bookings management</h1>
        <p className="text-sm text-muted-foreground">
          Monitor consultation bookings, payment progress, and status changes from the admin dashboard.
        </p>
      </div>

      <BookingsManageTable />
    </section>
  );
}