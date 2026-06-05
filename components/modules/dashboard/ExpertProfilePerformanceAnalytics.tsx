import React from "react";
import { useQuery } from "@tanstack/react-query";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, BarChart, Bar } from "recharts";
import { AnalyticsCard, ChartWrapper, AnalyticsGrid, AnalyticsSkeleton, AnalyticsEmptyState } from "@/components/analytics";
import { getExpertProfilePerformanceAnalytics } from "@/src/services/dashboard.services";
import AnimatedCounter from "@/components/analytics/AnimatedCounter";
import DashboardInsightPanel from "@/components/analytics/DashboardInsightPanel";
import InsightBanner from "@/components/analytics/InsightBanner";


type ProfilePerformanceAnalytics = {
  performanceTrends: { month: string; views: number; saves: number; clickThrough: number; consultationRequests: number }[];
  views: number;
  saves: number;
  clickThrough: number;
  consultationRequests: number;
};

export default function ExpertProfilePerformanceAnalytics() {
  const { data, isLoading, isError } = useQuery<ProfilePerformanceAnalytics>({
    queryKey: ["expert-profile-performance-analytics"],
    queryFn: getExpertProfilePerformanceAnalytics,
    refetchOnWindowFocus: false,
    retry: false,
  });

  const performanceData = data?.performanceTrends ?? [];
  const views = data?.views ?? 0;
  const saves = data?.saves ?? 0;
  const clickThrough = data?.clickThrough ?? 0;
  const requests = data?.consultationRequests ?? 0;

  return (
    <section className="space-y-6">
      <h2 className="text-xl font-bold">Profile Performance Analytics</h2>
      <AnalyticsGrid>
        <AnalyticsCard
          title="Profile Views"
          value={<AnimatedCounter value={views} />}
          description="Total profile views"
        />
        <AnalyticsCard
          title="Saves/Bookmarks"
          value={saves}
          description="Times your profile was saved"
        />
        <AnalyticsCard
          title="Click-Throughs"
          value={clickThrough}
          description="Profile click-throughs"
        />
        <AnalyticsCard
          title="Consultation Requests"
          value={requests}
          description="Consultation requests from profile"
        />
      </AnalyticsGrid>
      <ChartWrapper
        title="Profile Engagement Trends"
        description="Track profile engagement and activity."
        loading={isLoading}
        error={isError}
        empty={!performanceData.length}
        skeleton={<AnalyticsSkeleton />}
      >
        {performanceData.length > 0 ? (
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={performanceData} margin={{ top: 16, right: 24, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="views" stroke="#0ea5e9" strokeWidth={3} dot={{ r: 4 }} name="Views" />
              <Line type="monotone" dataKey="saves" stroke="#22c55e" strokeWidth={3} dot={{ r: 4 }} name="Saves" />
              <Line type="monotone" dataKey="clickThrough" stroke="#f59e42" strokeWidth={3} dot={{ r: 4 }} name="Click-Throughs" />
              <Line type="monotone" dataKey="consultationRequests" stroke="#ef4444" strokeWidth={3} dot={{ r: 4 }} name="Consultation Requests" />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <AnalyticsEmptyState message="No profile performance data available." />
        )}
      </ChartWrapper>
      <div className="mt-6">
        <DashboardInsightPanel
          icon={<svg width="24" height="24" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="#0ea5e9" strokeWidth="2"/><path d="M8 12l2 2 4-4" stroke="#22c55e" strokeWidth="2" strokeLinecap="round"/></svg>}
          title="Profile Engagement"
          description="Profile activity and engagement trends"
          highlight={`${views} views`}
          className="mb-4"
        />
        <InsightBanner message="Profile engagement trends are visualized above." />
      </div>
    </section>
  );
}
