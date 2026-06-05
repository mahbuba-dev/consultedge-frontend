
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { ChartWrapper, AnalyticsSkeleton, AnalyticsEmptyState } from "@/components/analytics";
import { getClientSpendingTrendsAnalytics } from "@/src/services/dashboard.services";
import type { ClientSpendingTrendsAnalytics } from "@/src/types/client.analytics";
import { transformSpendingTrends } from "@/src/lib/analytics-core";


export default function ClientSpendingTrendsAnalytics() {
  const {
    data = [],
    isLoading,
    isError,
    isFetching,
    isStale,
  } = useQuery<ClientSpendingTrendsAnalytics[]>({
    queryKey: ["client-spending-trends-analytics"],
    queryFn: getClientSpendingTrendsAnalytics,
    refetchInterval: 60000, // 1 min polling for real-time readiness
    refetchOnWindowFocus: true,
    staleTime: 60000,
  });
  const spendingData = transformSpendingTrends(data);

  return (
    <section className="space-y-6">
      <h2 className="text-xl font-bold">Spending Trends</h2>
      <ChartWrapper
        title="Monthly Spending Trends"
        description="Track your spending on consultations over time."
        loading={isLoading || isFetching}
        error={isError}
        empty={!spendingData.length}
        skeleton={<AnalyticsSkeleton />}
      >
        {spendingData.length > 0 ? (
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={spendingData} margin={{ top: 16, right: 24, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="amount" stroke="#0ea5e9" strokeWidth={3} dot={{ r: 4 }} name="Spending" />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <AnalyticsEmptyState message="No spending trend data available." />
        )}
      </ChartWrapper>
    </section>
  );
}