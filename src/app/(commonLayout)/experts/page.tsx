import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import ExpertList from "@/components/modules/Experts/ExpertsList";
import { getExperts } from "./_actions";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const buildQueryString = async (searchParams?: SearchParams) => {
  const resolvedSearchParams = (await searchParams) ?? {};
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(resolvedSearchParams)) {
    if (Array.isArray(value)) {
      value.filter(Boolean).forEach((item) => params.append(key, item));
      continue;
    }

    if (typeof value === "string" && value.length > 0) {
      params.set(key, value);
    }
  }

  return params.toString();
};

export default async function ExpertsPage({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  const queryClient = new QueryClient();
  const queryString = await buildQueryString(searchParams);

  await queryClient.prefetchQuery({
    queryKey: ["experts", queryString],
    queryFn: () => getExperts(queryString),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ExpertList />
    </HydrationBoundary>
  );
}


