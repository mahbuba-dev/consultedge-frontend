
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { ChartWrapper, AnalyticsSkeleton, AnalyticsEmptyState } from "@/components/analytics";
import { getClientSavedExpertsAnalytics } from "@/src/services/dashboard.services";
import type { ClientSavedExpertsAnalytics } from "@/src/types/client.analytics";
import { transformSavedExperts } from "@/src/lib/analytics-core";

const COLORS = ["#0ea5e9", "#22c55e", "#f59e42", "#ef4444", "#a78bfa"];


export default function ClientSavedExpertsAnalytics() {
  const {
    data = [],
    isLoading,
    isError,
    isFetching,
    isStale,
  } = useQuery<ClientSavedExpertsAnalytics[]>({
    queryKey: ["client-saved-experts-analytics"],
    queryFn: getClientSavedExpertsAnalytics,
    refetchInterval: 60000,
    refetchOnWindowFocus: true,
    staleTime: 60000,
  });
  const savedExpertsData = transformSavedExperts(data);

  return (
    <section className="space-y-6">
      <h2 className="text-xl font-bold">Saved Experts Distribution</h2>
      <ChartWrapper
        title="Saved Experts by Category"
        description="See which categories your saved experts belong to."
        loading={isLoading || isFetching}
        error={isError}
        empty={!savedExpertsData.length}
        skeleton={<AnalyticsSkeleton />}
      >
        {savedExpertsData.length > 0 ? (
          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie
                data={savedExpertsData}
                dataKey="count"
                nameKey="category"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {savedExpertsData.map((_, idx) => (
                  <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <AnalyticsEmptyState message="No saved experts data available." />
        )}
      </ChartWrapper>
    </section>
  );
}