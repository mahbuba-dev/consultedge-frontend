export type ExpertEarningsAnalytics = {
  totalEarnings: number;
  monthlyEarnings: { month: string; earnings: number }[];
  earningsGrowth: number;
};
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { AnalyticsCard, ChartWrapper, TrendBadge, AnalyticsGrid, AnalyticsSkeleton, AnalyticsEmptyState } from "@/components/analytics";
import { getExpertEarningsAnalytics } from "@/src/services/dashboard.services";
import { format } from "date-fns";
import AnimatedCounter from "@/components/analytics/AnimatedCounter";
import DashboardInsightPanel from "@/components/analytics/DashboardInsightPanel";
import InsightBanner from "@/components/analytics/InsightBanner";

interface EarningsPoint {
  month: string;
  earnings: number;
}

export default function ExpertEarningsAnalytics() {
  const { data, isLoading, isError } = useQuery<ExpertEarningsAnalytics>({
    queryKey: ["expert-earnings-analytics"],
    queryFn: getExpertEarningsAnalytics,
    refetchOnWindowFocus: false,
    retry: false,
  });

  const earningsData: EarningsPoint[] = data?.monthlyEarnings ?? [];
  const totalEarnings = data?.totalEarnings ?? 0;
  const growth = data?.earningsGrowth ?? 0;
  const bestMonth = earningsData.reduce((max, curr) => (curr.earnings > max.earnings ? curr : max), { month: "", earnings: 0 });

  return (
    <section className="space-y-6">
      <h2 className="text-xl font-bold">Earnings Analytics</h2>
      <AnalyticsGrid>
        <AnalyticsCard
          title="Total Earnings"
          value={<AnimatedCounter value={totalEarnings} prefix="$" />}
          trend={<TrendBadge value={growth} positive={growth > 0} />}
          description="Total revenue from all consultations"
        />
        <AnalyticsCard
          title="Best Month"
          value={bestMonth.month ? format(new Date(bestMonth.month), "MMM yyyy") : "-"}
          description={bestMonth.earnings ? `$${bestMonth.earnings.toLocaleString()}` : "No data"}
        />
      </AnalyticsGrid>
      <ChartWrapper
        title="Monthly Earnings Trend"
        description="Track your earnings growth over time."
        loading={isLoading}
        error={isError}
        empty={!earningsData.length}
        skeleton={<AnalyticsSkeleton />}
      >
        {earningsData.length > 0 ? (
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={earningsData} margin={{ top: 16, right: 24, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" tickFormatter={m => format(new Date(m), "MMM yy")}/>
              <YAxis tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip formatter={v => v !== undefined ? `$${(+v).toLocaleString()}` : '-'} />
              <Legend />
              <Line type="monotone" dataKey="earnings" stroke="#0ea5e9" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <AnalyticsEmptyState message="No earnings data available." />
        )}
      </ChartWrapper>
      <InsightBanner message="Your earnings are growing!" />
      <DashboardInsightPanel title="Monthly Earnings" description="Total earnings this month" highlight={`$${totalEarnings.toLocaleString()}`} />
      <DashboardInsightPanel
        icon={<svg width="24" height="24" fill="none" viewBox="0 0 24 24"><path d="M12 3v18M3 12h18" stroke="#0ea5e9" strokeWidth="2" strokeLinecap="round"/></svg>}
        title="Earnings Growth"
        description={growth > 0 ? "Your earnings increased" : "Earnings changed"}
        highlight={growth > 0 ? `+${growth}%` : `${growth}%`}
        className="mb-4"
      />
      <AnimatedCounter value={totalEarnings} />
    </section>
  );
}
