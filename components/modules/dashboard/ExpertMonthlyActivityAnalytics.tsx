import React from "react";
import { useQuery } from "@tanstack/react-query";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { AnalyticsCard, ChartWrapper, AnalyticsGrid, AnalyticsSkeleton, AnalyticsEmptyState } from "@/components/analytics";
import { getExpertMonthlyActivityAnalytics } from "@/src/services/dashboard.services";
import AnimatedCounter from "@/components/analytics/AnimatedCounter";
import DashboardInsightPanel from "@/components/analytics/DashboardInsightPanel";
import InsightBanner from "@/components/analytics/InsightBanner";


type MonthlyActivityAnalytics = {
  activityTrends: { month: string; activityCount: number }[];
  peakMonth: string;
  peakCount: number;
};

export default function ExpertMonthlyActivityAnalytics() {
  const { data, isLoading, isError } = useQuery<MonthlyActivityAnalytics>({
    queryKey: ["expert-monthly-activity-analytics"],
    queryFn: getExpertMonthlyActivityAnalytics,
    refetchOnWindowFocus: false,
    retry: false,
  });

  const activityData = data?.activityTrends ?? [];
  const peakMonth = data?.peakMonth ?? "-";
  const peakCount = data?.peakCount ?? 0;

  return (
    <section className="space-y-6">
      <h2 className="text-xl font-bold">Monthly Activity Analytics</h2>
      <AnalyticsGrid>
        <AnalyticsCard
          title="Peak Month"
          value={peakMonth}
          description="Month with highest activity"
        />
        <AnalyticsCard
          title="Peak Activity"
          value={<AnimatedCounter value={peakCount} />}
          description="Most active consultations in a month"
        />
      </AnalyticsGrid>
      <ChartWrapper
        title="Monthly Activity Trends"
        description="Visualize your monthly workload and activity peaks."
        loading={isLoading}
        error={isError}
        empty={!activityData.length}
        skeleton={<AnalyticsSkeleton />}
      >
        {activityData.length > 0 ? (
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={activityData} margin={{ top: 16, right: 24, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="activityCount" fill="#0ea5e9" name="Activity" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <AnalyticsEmptyState message="No monthly activity data available." />
        )}
      </ChartWrapper>
      <div className="mt-6">
        <DashboardInsightPanel
          icon={<svg width="24" height="24" fill="none" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="4" stroke="#0ea5e9" strokeWidth="2"/><path d="M8 12h8" stroke="#22c55e" strokeWidth="2" strokeLinecap="round"/></svg>}
          title="Peak Activity"
          description={`Most active month: ${peakMonth}`}
          highlight={peakMonth}
          className="mb-4"
        />
        <InsightBanner message="Activity peaks are common in certain months." />
      </div>
    </section>
  );
}
