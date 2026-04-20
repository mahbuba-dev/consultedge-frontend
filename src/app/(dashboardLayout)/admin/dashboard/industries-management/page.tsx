import IndustryList from "@/components/modules/dashboard/Industry/IndustryList";
import { getAllIndustries } from "@/src/services/industry.services";
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";

export default async function IndustryListPage() {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["industries"],
    queryFn: getAllIndustries,
  });
 
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <IndustryList />
    </HydrationBoundary>
  );
}
