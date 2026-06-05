
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { ChartWrapper, AnalyticsSkeleton, AnalyticsEmptyState } from "@/components/analytics";
import { getClientConsultationCategoriesAnalytics } from "@/src/services/dashboard.services";
import type { ClientConsultationCategoriesAnalytics } from "@/src/types/client.analytics";
import { transformConsultationCategories } from "@/src/lib/analytics-core";

const COLORS = ["#0ea5e9", "#22c55e", "#f59e42", "#ef4444", "#a78bfa"];


export default function ClientConsultationCategoriesAnalytics() {
  const {
    data = [],
    isLoading,
    isError,
    isFetching,
    isStale,
  } = useQuery<ClientConsultationCategoriesAnalytics[]>({
    queryKey: ["client-consultation-categories-analytics"],
    queryFn: getClientConsultationCategoriesAnalytics,
    refetchInterval: 60000,
    refetchOnWindowFocus: true,
    staleTime: 60000,
  });
  const categoriesData = transformConsultationCategories(data);

  return (
    <section className="space-y-6">
      <h2 className="text-xl font-bold">Consultation Categories</h2>
      <ChartWrapper
        title="Consultations by Category"
        description="See which categories you book most often."
        loading={isLoading || isFetching}
        error={isError}
        empty={!categoriesData.length}
        skeleton={<AnalyticsSkeleton />}
      >
        {categoriesData.length > 0 ? (
          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie
                data={categoriesData}
                dataKey="count"
                nameKey="category"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {categoriesData.map((_, idx) => (
                  <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <AnalyticsEmptyState message="No consultation category data available." />
        )}
      </ChartWrapper>
    </section>
  );
}