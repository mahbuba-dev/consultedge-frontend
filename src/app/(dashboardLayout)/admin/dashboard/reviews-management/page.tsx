
import ReviewsManagementTable from "@/components/modules/Table/ReviewsManagementTable";

export default function ReviewsManagementPage() {
  return (
    <section className="space-y-6 p-4 md:p-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Reviews management</h1>
        <p className="text-sm text-muted-foreground">
          Monitor client feedback, review quality signals, and take action from the admin workspace.
        </p>
      </div>

      <ReviewsManagementTable />
    </section>
  );
}