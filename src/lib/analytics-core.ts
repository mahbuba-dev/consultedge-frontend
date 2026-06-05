// --- Admin Analytics Transforms ---
import type {
  PlatformGrowthAnalyticsDTO,
  RevenueAnalyticsDTO,
  UserGrowthAnalyticsDTO,
  AIAdoptionAnalyticsDTO,
  EngagementAnalyticsDTO,
  TopExpertsAnalyticsDTO,
  CategoryIntelligenceDTO,
  PlatformHealthAnalyticsDTO,
} from "@/src/types/admin.analytics";

export function transformPlatformGrowth(data: PlatformGrowthAnalyticsDTO[]): any[] {
  return (data || []).map((item) => ({
    month: item.month,
    userGrowth: item.userGrowth ?? 0,
    expertGrowth: item.expertGrowth ?? 0,
    clientGrowth: item.clientGrowth ?? 0,
    consultationGrowth: item.consultationGrowth ?? 0,
  }));
}

export function transformRevenueAnalytics(data: RevenueAnalyticsDTO[]): any[] {
  return (data || []).map((item) => ({
    month: item.month,
    totalRevenue: item.totalRevenue ?? 0,
    paidConsultations: item.paidConsultations ?? 0,
    refunds: item.refunds ?? 0,
  }));
}

export function transformUserGrowth(data: UserGrowthAnalyticsDTO[]): any[] {
  return (data || []).map((item) => ({
    month: item.month,
    newUsers: item.newUsers ?? 0,
    churnedUsers: item.churnedUsers ?? 0,
    netGrowth: item.netGrowth ?? 0,
  }));
}

export function transformAIAdoption(data: AIAdoptionAnalyticsDTO[]): any[] {
  return (data || []).map((item) => ({
    month: item.month,
    aiSessions: item.aiSessions ?? 0,
    aiUsers: item.aiUsers ?? 0,
    aiAdoptionRate: item.aiAdoptionRate ?? 0,
    semanticSearches: item.semanticSearches ?? 0,
    ragSessions: item.ragSessions ?? 0,
  }));
}

export function transformEngagementAdmin(data: EngagementAnalyticsDTO[]): any[] {
  return (data || []).map((item) => ({
    month: item.month,
    activeUsers: item.activeUsers ?? 0,
    repeatSessions: item.repeatSessions ?? 0,
    engagementScore: item.engagementScore ?? 0,
    inactivityDips: item.inactivityDips ?? 0,
  }));
}

export function transformTopExperts(data: TopExpertsAnalyticsDTO[]): any[] {
  return (data || []).map((item) => ({
    expertId: item.expertId,
    name: item.name,
    rating: item.rating ?? 0,
    consultations: item.consultations ?? 0,
    revenue: item.revenue ?? 0,
    rank: item.rank ?? 0,
  })).sort((a, b) => a.rank - b.rank);
}

export function transformCategoryIntelligence(data: CategoryIntelligenceDTO[]): any[] {
  return (data || []).map((item) => ({
    category: item.category,
    consultations: item.consultations ?? 0,
    percent: item.percent ?? 0,
    growth: item.growth ?? 0,
    rank: item.rank ?? 0,
  })).sort((a, b) => a.rank - b.rank);
}

export function transformPlatformHealth(data: PlatformHealthAnalyticsDTO[]): any[] {
  return (data || []).map((item) => ({
    metric: item.metric,
    value: item.value ?? 0,
    trend: item.trend,
    comparison: item.comparison ?? 0,
  }));
}
// Consultation Categories: Normalize and aggregate for pie/donut chart
export function transformConsultationCategories(data: ClientConsultationCategoriesAnalytics[]): any[] {
  return (data || []).map((item) => ({
    category: item.category,
    count: item.count ?? 0,
    percent: item.percent ?? 0,
  }));
}
// Engagement Trends: Normalize and aggregate for area/line chart
export function transformEngagementTrends(data: ClientEngagementTrendsAnalytics[]): any[] {
  return (data || []).map((item) => ({
    month: item.month,
    engagement: item.engagement ?? 0,
    retention: item.retention ?? 0,
    repeatConsultations: item.repeatConsultations ?? 0,
    inactivityDips: item.inactivityDips ?? 0,
  }));
}
// AI Usage: Normalize and aggregate for bar/timeline chart
export function transformAIUsage(data: ClientAIUsageAnalytics[] | null | undefined): any[] {
  if (!data) return [];
  // Example: flatten timeline, ensure feature and count are present
  return data.map((item) => ({
    feature: item.feature,
    count: item.count ?? 0,
    timeline: item.timeline || [],
    adoptionMetric: item.adoptionMetric ?? 0,
  }));
}
// Saved Experts: Normalize and aggregate for pie/rank chart
export function transformSavedExperts(data: ClientSavedExpertsAnalytics[]): any[] {
  // Example: sort by rank, ensure category and count are present
  return (data || []).map((item) => ({
    category: item.category,
    count: item.count ?? 0,
    rank: item.rank ?? 0,
  })).sort((a, b) => a.rank - b.rank);
}
// Centralized analytics-core for transforms, formatting, aggregation, and query orchestration

import type {
  ClientSpendingTrendsAnalytics,
  ClientConsultationActivityAnalytics,
  ClientSavedExpertsAnalytics,
  ClientAIUsageAnalytics,
  ClientEngagementTrendsAnalytics,
  ClientConsultationCategoriesAnalytics,
} from "@/src/types/client.analytics";

// Example: transform backend spending trends to chart-ready data
export function transformSpendingTrends(data: ClientSpendingTrendsAnalytics[]): any[] {
  // Add date normalization, sorting, etc. as needed
  return data.map((item) => ({
    ...item,
    // Optionally format month, etc.
  }));
}


// Consultation Activity: Normalize and aggregate for chart
export function transformConsultationActivity(data: ClientConsultationActivityAnalytics[]): any[] {
  // Example: flatten, normalize, and aggregate completed/pending for stacked/combo chart
  return data.map((item) => ({
    month: item.month,
    completed: item.completed ?? 0,
    pending: item.pending ?? 0,
    activitySpike: !!item.activitySpike,
    activityDrop: !!item.activityDrop,
  }));
}

// Example: trend badge logic (should be backend-driven, but fallback if needed)
export function getTrendBadge(trend: 'up' | 'down' | 'flat') {
  switch (trend) {
    case 'up':
      return { color: 'green', label: 'Growth' };
    case 'down':
      return { color: 'red', label: 'Decline' };
    default:
      return { color: 'gray', label: 'Flat' };
  }
}

// Add aggregation, comparison, and formatting helpers as needed
