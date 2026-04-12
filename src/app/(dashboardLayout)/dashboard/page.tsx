import ClientDashboardContent from "@/components/modules/dashboard/ClientDashboardContent";
import { getUserInfo } from "@/src/services/auth.services";
import { getDashboardData } from "@/src/services/dashboard.services";
import { IClientDashboardStats } from "@/src/types/client.dashboard";
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";

const DashboardPage = async () => {
  const queryClient = new QueryClient();
  const currentUser = await getUserInfo();

  if (currentUser) {
    await queryClient.prefetchQuery({
      queryKey: ["client-dashboard-data"],
      queryFn: () => getDashboardData<IClientDashboardStats>(),
      staleTime: 30 * 1000,
      gcTime: 5 * 60 * 1000,
    });
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ClientDashboardContent />
    </HydrationBoundary>
  );
};

export default DashboardPage;