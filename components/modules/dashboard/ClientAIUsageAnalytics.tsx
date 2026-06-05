
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { ChartWrapper, AnalyticsSkeleton, AnalyticsEmptyState } from "@/components/analytics";
import { getClientAIUsageAnalytics } from "@/src/services/dashboard.services";
import type { ClientAIUsageAnalytics } from "@/src/types/client.analytics";
import { transformAIUsage } from "@/src/lib/analytics-core";

const COLORS = ["#0ea5e9", "#22c55e", "#f59e42", "#ef4444", "#a78bfa"];


export default function ClientAIUsageAnalytics() {
  const {
    data = null,
    isLoading,
    isError,
    isFetching,
    isStale,
  } = useQuery<ClientAIUsageAnalytics[] | null>({
    queryKey: ["client-ai-usage-analytics"],
    queryFn: getClientAIUsageAnalytics,
    refetchInterval: 60000,
    refetchOnWindowFocus: true,
    staleTime: 60000,
  });
  const aiUsageData = transformAIUsage(data);

  // Show unsupported/degraded state if backend returns null or empty array
  const showUnsupported = !isLoading && !isFetching && (!aiUsageData || aiUsageData.length === 0);

  return (
    <section className="space-y-6">
      <h2 className="text-xl font-bold">AI Usage Analytics</h2>
      <ChartWrapper
        title="AI Feature Usage"
        description="See how you use AI features across the platform."
        loading={isLoading || isFetching}
        error={isError}
        empty={showUnsupported}
        skeleton={<AnalyticsSkeleton />}
      >
        {aiUsageData && aiUsageData.length > 0 ? (
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={aiUsageData} margin={{ top: 16, right: 24, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="feature" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#0ea5e9" name="Usage" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <AnalyticsEmptyState message="AI usage analytics are currently unsupported or unavailable." />
        )}
      </ChartWrapper>
    </section>
  );
}