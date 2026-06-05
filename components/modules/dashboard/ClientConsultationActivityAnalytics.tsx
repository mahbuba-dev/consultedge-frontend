
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { ChartWrapper, AnalyticsSkeleton, AnalyticsEmptyState } from "@/components/analytics";
import { getClientConsultationActivityAnalytics } from "@/src/services/dashboard.services";
import type { ClientConsultationActivityAnalytics } from "@/src/types/client.analytics";
import { transformConsultationActivity } from "@/src/lib/analytics-core";


export default function ClientConsultationActivityAnalytics() {
  const {
    data = [],
    isLoading,
    isError,
    isFetching,
    isStale,
  } = useQuery<ClientConsultationActivityAnalytics[]>({
    queryKey: ["client-consultation-activity-analytics"],
    queryFn: getClientConsultationActivityAnalytics,
    refetchInterval: 60000,
    refetchOnWindowFocus: true,
    staleTime: 60000,
  });
  const activityData = transformConsultationActivity(data);

  return (
    <section className="space-y-6">
      <h2 className="text-xl font-bold">Consultation Activity</h2>
      <ChartWrapper
        title="Consultation Activity Over Time"
        description="See your consultation activity by month."
        loading={isLoading || isFetching}
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
              <Bar dataKey="completed" fill="#0ea5e9" name="Completed" />
              <Bar dataKey="pending" fill="#f59e42" name="Pending" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <AnalyticsEmptyState message="No consultation activity data available." />
        )}
      </ChartWrapper>
    </section>
  );
}