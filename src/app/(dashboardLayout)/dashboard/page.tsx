import ClientDashboardContent from "@/components/modules/dashboard/ClientDashboardContent";
import { getDashboardData } from "@/src/services/dashboard.services";
import { IClientDashboardStats } from "@/src/types/client.dashboard";
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";

const DashboardPage = async () => {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["client-dashboard-data"],
    queryFn: () => getDashboardData<IClientDashboardStats>(),
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ClientDashboardContent />
    </HydrationBoundary>
  );
};

export default DashboardPage;