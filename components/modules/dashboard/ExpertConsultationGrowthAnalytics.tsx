export type ExpertConsultationGrowthAnalytics = {
  consultationTrends: { month: string; completed: number; pending: number }[];
  completedCount: number;
  pendingCount: number;
  growthPercentage: number;
  successRate: number;
};
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, BarChart, Bar } from "recharts";
import { AnalyticsCard, ChartWrapper, TrendBadge, AnalyticsGrid, AnalyticsSkeleton, AnalyticsEmptyState } from "@/components/analytics";
import { getExpertConsultationGrowthAnalytics } from "@/src/services/dashboard.services";
import AnimatedCounter from "@/components/analytics/AnimatedCounter";
import DashboardInsightPanel from "@/components/analytics/DashboardInsightPanel";
import InsightBanner from "@/components/analytics/InsightBanner";

export default function ExpertConsultationGrowthAnalytics() {
  const { data, isLoading, isError } = useQuery<ExpertConsultationGrowthAnalytics>({
    queryKey: ["expert-consultation-growth-analytics"],
    queryFn: getExpertConsultationGrowthAnalytics,
    refetchOnWindowFocus: false,
    retry: false,
  });

  const trendData = data?.consultationTrends ?? [];
  const completed = data?.completedCount ?? 0;
  const pending = data?.pendingCount ?? 0;
  const growth = data?.growthPercentage ?? 0;
  const successRate = data?.successRate ?? 0;

  return (
    <section className="space-y-6">
      <h2 className="text-xl font-bold">Consultation Growth Analytics</h2>
      <AnalyticsGrid>
        <AnalyticsCard
          title="Completed"
          value={<AnimatedCounter value={completed} />}
          trend={<TrendBadge value={growth} positive={growth > 0} />}
          description="Total completed consultations"
        />
        <AnalyticsCard
          title="Pending"
          value={pending}
          description="Consultations awaiting action"
        />
        <AnalyticsCard
          title="Success Rate"
          value={`${successRate}%`}
          description="Completion percentage"
        />
      </AnalyticsGrid>
      <ChartWrapper
        title="Consultation Trends Over Time"
        description="Track completed and pending consultations by month."
        loading={isLoading}
        error={isError}
        empty={!trendData.length}
        skeleton={<AnalyticsSkeleton />}
      >
        {trendData.length > 0 ? (
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={trendData} margin={{ top: 16, right: 24, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="completed" stackId="a" fill="#22c55e" name="Completed" />
              <Bar dataKey="pending" stackId="a" fill="#0ea5e9" name="Pending" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <AnalyticsEmptyState message="No consultation trend data available." />
        )}
      </ChartWrapper>
      <div className="mt-6">
        <DashboardInsightPanel
          title="Completed Consultations"
          description={growth > 0 ? "Consultations increased" : "Consultations changed"}
          highlight={growth > 0 ? `+${growth}%` : `${growth}%`}
          className="mb-4"
        />
        <InsightBanner message="The number of completed consultations has grown by 25%." />
      </div>
    </section>
  );
}
