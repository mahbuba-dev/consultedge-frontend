import React from "react";
import { useQuery } from "@tanstack/react-query";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { AnalyticsCard, ChartWrapper, TrendBadge, AnalyticsGrid, AnalyticsSkeleton, AnalyticsEmptyState } from "@/components/analytics";
import { getExpertBookingConversionAnalytics } from "@/src/services/dashboard.services";
import AnimatedCounter from "@/components/analytics/AnimatedCounter";
import DashboardInsightPanel from "@/components/analytics/DashboardInsightPanel";
import InsightBanner from "@/components/analytics/InsightBanner";

const COLORS = ["#0ea5e9", "#22c55e", "#f59e42", "#ef4444"];


type BookingConversionAnalytics = {
  funnel: { stage: string; value: number }[];
  conversionRate: number;
  completed: number;
  cancelled: number;
  total: number;
};

export default function ExpertBookingConversionAnalytics() {
  const { data, isLoading, isError } = useQuery<BookingConversionAnalytics>({
    queryKey: ["expert-booking-conversion-analytics"],
    queryFn: getExpertBookingConversionAnalytics,
    refetchOnWindowFocus: false,
    retry: false,
  });

  const funnelData = data?.funnel ?? [];
  const conversionRate = data?.conversionRate ?? 0;
  const completed = data?.completed ?? 0;
  const cancelled = data?.cancelled ?? 0;
  const total = data?.total ?? 0;

  return (
    <section className="space-y-6">
      <h2 className="text-xl font-bold">Booking Conversion Analytics</h2>
      <AnalyticsGrid>
        <AnalyticsCard
          title="Conversion Rate"
          value={<AnimatedCounter value={conversionRate} suffix="%" />}
          trend={<TrendBadge value={conversionRate} positive={conversionRate > 0} />}
          description="Consultation-to-booking conversion"
        />
        <AnalyticsCard
          title="Completed"
          value={completed}
          description="Completed consultations"
        />
        <AnalyticsCard
          title="Cancelled"
          value={cancelled}
          description="Cancelled bookings"
        />
        <AnalyticsCard
          title="Total Bookings"
          value={total}
          description="All booking attempts"
        />
      </AnalyticsGrid>
      <ChartWrapper
        title="Booking Funnel"
        description="Visualize the booking funnel and conversion ratios."
        loading={isLoading}
        error={isError}
        empty={!funnelData.length}
        skeleton={<AnalyticsSkeleton />}
      >
        {funnelData.length > 0 ? (
          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie
                data={funnelData}
                dataKey="value"
                nameKey="stage"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {funnelData.map((_, idx: number) => (
                  <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <AnalyticsEmptyState message="No booking funnel data available." />
        )}
      </ChartWrapper>
      <div className="mt-6">
        <DashboardInsightPanel
          title="Conversion Rate"
          description="Your consultation-to-booking conversion rate"
          highlight={`${conversionRate}%`}
        />
        <InsightBanner message="The conversion rate is high, indicating successful booking funnel." />
      </div>
    </section>
  );
}
