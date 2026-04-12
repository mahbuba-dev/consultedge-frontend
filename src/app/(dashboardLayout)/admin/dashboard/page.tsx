
import AdminDashboardContent from "@/components/modules/dashboard/AdminDashboardContent";
import { getUserInfo } from "@/src/services/auth.services";
import { getDashboardData } from "@/src/services/dashboard.services";
import { IAdminDashboardStats } from "@/src/types/admin.dashboard";
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";

const AdminDashboardPage = async () => {
  const queryClient = new QueryClient();
  const currentUser = await getUserInfo();

  if (currentUser) {
    await queryClient.prefetchQuery({
      queryKey: ["admin-dashboard-data"],
      queryFn: () => getDashboardData<IAdminDashboardStats>(),
      staleTime: 30 * 1000,
      gcTime: 5 * 60 * 1000,
    });
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AdminDashboardContent />
    </HydrationBoundary>
  );
};

export default AdminDashboardPage;