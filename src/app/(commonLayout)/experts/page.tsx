import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import { getExperts } from "./_actions";
import ExpertList from "@/components/modules/Experts/ExpertsList";

export default async function expertsPage() {

  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ['experts'],
    queryFn:getExperts 
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
     <ExpertList/>
    </HydrationBoundary>
  
  )
}


