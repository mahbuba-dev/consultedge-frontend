// app/admin/dashboard/profile/page.tsx
import ProfileContent from "@/components/modules/dashboard/ProfileContent";
import { getMe } from "@/src/services/auth.services";
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";

export default async function ProfilePage() {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["me"],
    queryFn: getMe,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ProfileContent />
    </HydrationBoundary>
  );
}
