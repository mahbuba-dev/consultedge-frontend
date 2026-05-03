"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { getExperts } from "@/src/services/expert.services";

export function usePendingApplicantsCount(enabled: boolean) {
  const { data, isLoading } = useQuery({
    queryKey: ["pending-applicants-count"],
    queryFn: () =>
      getExperts({
        page: 1,
        limit: 200,
        sortBy: "createdAt",
        sortOrder: "desc",
      }),
    enabled,
    staleTime: 30 * 1000,
    refetchInterval: enabled ? 30 * 1000 : false,
  });

  const pendingCount = useMemo(() => {
    const experts = Array.isArray(data?.data) ? data.data : [];
    return experts.filter((expert) => !expert.isVerified).length;
  }, [data]);

  return {
    pendingCount,
    isLoading,
  };
}
