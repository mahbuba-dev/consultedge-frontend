import ExpertDashboardContent from "@/components/modules/dashboard/ExpertDashboardContent";
import { getUserInfo } from "@/src/services/auth.services";
import { getDashboardData } from "@/src/services/dashboard.services";
import { IExpertDashboardStats } from "@/src/types/expert.dashboard";
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";

const ExpertDashboardPage = async () => {
  const queryClient = new QueryClient();
  const currentUser = await getUserInfo();

  if (currentUser) {
    await queryClient.prefetchQuery({
      queryKey: ["expert-dashboard-data"],
      queryFn: () => getDashboardData<IExpertDashboardStats>(),
      staleTime: 30 * 1000,
      gcTime: 5 * 60 * 1000,
    });
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ExpertDashboardContent />
    </HydrationBoundary>
  );
};

export default ExpertDashboardPage;