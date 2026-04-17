// import ExpertReviewsPanel from "@/components/modules/dashboard/ExpertReviewsPanel";
import ExpertReviewsPanel from "@/components/modules/dashboard/ExpertReviewsPanel";
import { getMe } from "@/src/services/auth.services";

export default async function MyReviewsPage() {
  const profile = await getMe();

  return (
    <div className="space-y-6 px-4 py-6 md:px-6">
      <ExpertReviewsPanel profile={profile} />
    </div>
  );
}