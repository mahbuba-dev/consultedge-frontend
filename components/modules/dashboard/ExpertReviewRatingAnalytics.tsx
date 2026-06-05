import React from "react";
import { useQuery } from "@tanstack/react-query";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { AnalyticsCard, ChartWrapper, AnalyticsGrid, AnalyticsSkeleton, AnalyticsEmptyState } from "@/components/analytics";
import { getExpertReviewRatingAnalytics } from "@/src/services/dashboard.services";
import AnimatedCounter from "@/components/analytics/AnimatedCounter";
import DashboardInsightPanel from "@/components/analytics/DashboardInsightPanel";
import InsightBanner from "@/components/analytics/InsightBanner";

const COLORS = ["#fbbf24", "#f59e42", "#ef4444", "#22c55e", "#0ea5e9"];


export type ReviewRatingAnalytics = {
  averageRating: number;
  reviewDistribution: { rating: number; count: number }[];
  reviewTrends: { month: string; reviews: number }[];
  totalReviews: number;
};

export default function ExpertReviewRatingAnalytics() {
  const { data, isLoading, isError } = useQuery<ReviewRatingAnalytics>({
    queryKey: ["expert-review-rating-analytics"],
    queryFn: getExpertReviewRatingAnalytics,
    refetchOnWindowFocus: false,
    retry: false,
  });

  const avgRating = data?.averageRating ?? 0;
  const reviewDist = data?.reviewDistribution ?? [];
  const reviewTrends = data?.reviewTrends ?? [];
  const totalReviews = data?.totalReviews ?? 0;

  return (
    <section className="space-y-6">
      <h2 className="text-xl font-bold">Review & Rating Analytics</h2>
      <AnalyticsGrid>
        <AnalyticsCard
          title="Average Rating"
          value={totalReviews}
          description="All client reviews received"
        />
        <AnalyticsCard
          title="Total Reviews"
          value={totalReviews}
          description="All client reviews received"
        />
      </AnalyticsGrid>
      <ChartWrapper
        title="Review Distribution"
        description="See the spread of ratings received."
        loading={isLoading}
        error={isError}
        empty={!reviewDist.length}
        skeleton={<AnalyticsSkeleton />}
      >
        {reviewDist.length > 0 ? (
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={reviewDist}
                dataKey="count"
                nameKey="rating"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {reviewDist.map((_, idx: number) => (
                  <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <AnalyticsEmptyState message="No review distribution data available." />
        )}
      </ChartWrapper>
      <ChartWrapper
        title="Review Trends"
        description="Track review activity over time."
        loading={isLoading}
        error={isError}
        empty={!reviewTrends.length}
        skeleton={<AnalyticsSkeleton />}
      >
        {reviewTrends.length > 0 ? (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={reviewTrends} margin={{ top: 16, right: 24, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="reviews" fill="#fbbf24" name="Reviews" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <AnalyticsEmptyState message="No review trend data available." />
        )}
      </ChartWrapper>
      <div className="mt-6">
        <AnimatedCounter value={avgRating} />
        <DashboardInsightPanel title="Average Rating" description={avgRating.toString()} />
        <InsightBanner message="The average rating is 4.5 out of 5." />
        <DashboardInsightPanel
          icon={<svg width="24" height="24" fill="none" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" stroke="#fbbf24" strokeWidth="2"/></svg>}
          title="Review Highlights"
          description={avgRating >= 4.5 ? "Excellent feedback" : avgRating >= 4 ? "Great feedback" : "Feedback received"}
          highlight={`${avgRating.toFixed(2)}★`}
          className="mb-4"
        />
      </div>
    </section>
  );
}
