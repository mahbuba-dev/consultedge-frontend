
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { ChartWrapper, AnalyticsSkeleton, AnalyticsEmptyState } from "@/components/analytics";
import { getClientEngagementTrendsAnalytics } from "@/src/services/dashboard.services";
import type { ClientEngagementTrendsAnalytics } from "@/src/types/client.analytics";
import { transformEngagementTrends } from "@/src/lib/analytics-core";


export default function ClientEngagementTrendsAnalytics() {
  const {
    data = [],
    isLoading,
    isError,
    isFetching,
    isStale,
  } = useQuery<ClientEngagementTrendsAnalytics[]>({
    queryKey: ["client-engagement-trends-analytics"],
    queryFn: getClientEngagementTrendsAnalytics,
    refetchInterval: 60000,
    refetchOnWindowFocus: true,
    staleTime: 60000,
  });
  const engagementData = transformEngagementTrends(data);

  return (
    <section className="space-y-6">
      <h2 className="text-xl font-bold">Engagement Trends</h2>
      <ChartWrapper
        title="Engagement Over Time"
        description="Visualize your engagement with the platform over time."
        loading={isLoading || isFetching}
        error={isError}
        empty={!engagementData.length}
        skeleton={<AnalyticsSkeleton />}
      >
        {engagementData.length > 0 ? (
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={engagementData} margin={{ top: 16, right: 24, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="engagement" stroke="#0ea5e9" fill="#0ea5e9" name="Engagement" />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <AnalyticsEmptyState message="No engagement trend data available." />
        )}
      </ChartWrapper>
    </section>
  );
}