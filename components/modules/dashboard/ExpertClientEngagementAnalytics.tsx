export type ExpertClientEngagementAnalytics = {
  engagementTrends: { month: string; activeClients: number; repeatClients: number }[];
  repeatClients: number;
  activeClients: number;
  retentionRate: number;
};
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { AnalyticsCard, ChartWrapper, TrendBadge, AnalyticsGrid, AnalyticsSkeleton, AnalyticsEmptyState } from "@/components/analytics";
import { getExpertClientEngagementAnalytics } from "@/src/services/dashboard.services";
import AnimatedCounter from "@/components/analytics/AnimatedCounter";
import DashboardInsightPanel from "@/components/analytics/DashboardInsightPanel";
import InsightBanner from "@/components/analytics/InsightBanner";

export default function ExpertClientEngagementAnalytics() {
  const { data, isLoading, isError } = useQuery<ExpertClientEngagementAnalytics>({
    queryKey: ["expert-client-engagement-analytics"],
    queryFn: getExpertClientEngagementAnalytics,
    refetchOnWindowFocus: false,
    retry: false,
  });

  const engagementData = data?.engagementTrends ?? [];
  const repeatClients = data?.repeatClients ?? 0;
  const activeClients = data?.activeClients ?? 0;
  const retention = data?.retentionRate ?? 0;

  return (
    <section className="space-y-6">
      <h2 className="text-xl font-bold">Client Engagement Analytics</h2>
      <AnalyticsGrid>
        <AnalyticsCard
          title="Repeat Clients"
          value={<AnimatedCounter value={repeatClients} />}
          description="Clients who booked more than once"
        />
        <AnalyticsCard
          title="Active Clients"
          value={activeClients}
          description="Clients active this month"
        />
        <AnalyticsCard
          title="Retention Rate"
          value={`${retention}%`}
          trend={<TrendBadge value={retention} positive={retention > 0} />}
          description="Client retention percentage"
        />
      </AnalyticsGrid>
      <ChartWrapper
        title="Engagement Frequency Over Time"
        description="Track client engagement and retention trends."
        loading={isLoading}
        error={isError}
        empty={!engagementData.length}
        skeleton={<AnalyticsSkeleton />}
      >
        {engagementData.length > 0 ? (
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={engagementData} margin={{ top: 16, right: 24, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="activeClients" stroke="#0ea5e9" strokeWidth={3} dot={{ r: 4 }} name="Active Clients" />
              <Line type="monotone" dataKey="repeatClients" stroke="#22c55e" strokeWidth={3} dot={{ r: 4 }} name="Repeat Clients" />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <AnalyticsEmptyState message="No engagement trend data available." />
        )}
      </ChartWrapper>
      <div className="mt-6">
        <DashboardInsightPanel title="Repeat Clients" description="Clients who booked more than once" />
        <InsightBanner message="Clients who booked more than once" />
        <DashboardInsightPanel
          icon={<svg width="24" height="24" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="#0ea5e9" strokeWidth="2"/><path d="M8 12l2 2 4-4" stroke="#22c55e" strokeWidth="2" strokeLinecap="round"/></svg>}
          title="Client Retention"
          description="Repeat client engagement this month"
          highlight={`${retention}%`}
          className="mb-4"
        />
      </div>
    </section>
  );
}
