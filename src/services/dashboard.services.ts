// --- Admin Analytics DTOs ---
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
import { httpClient } from "../lib/axious/httpClient";
import { ApiResponse } from "../types/api.types";

// --- Admin Analytics Service Functions ---
export async function getPlatformGrowthAnalytics(): Promise<PlatformGrowthAnalyticsDTO[]> {
  const response = await httpClient.get<PlatformGrowthAnalyticsDTO[]>("/admin/analytics/platform-growth");
  return response.data;
}

export async function getDashboardData<TDashboardStats = unknown>(): Promise<
  ApiResponse<TDashboardStats>
> {
  try {
    const response = await httpClient.get<TDashboardStats>("/stats");
    return response;
  } catch (error: any) {
    console.log(error, "From dashboard service");
    return {
      success: false,
      message:
        error?.response?.data?.message ||
        error.message ||
        "An error occurred while fetching dashboard data.",
      data: null as TDashboardStats,
      meta: undefined,
    } as ApiResponse<TDashboardStats>;
  }
}


// BookingConversionAnalytics type from component file
type BookingConversionAnalytics = {
  funnel: { stage: string; value: number }[];
  conversionRate: number;
  completed: number;
  cancelled: number;
  total: number;
};
export async function getExpertBookingConversionAnalytics(): Promise<BookingConversionAnalytics> {
  const response = await httpClient.get<BookingConversionAnalytics>(
    "/expert/analytics/booking-conversion"
  );
  return response.data;
}

import type { ExpertClientEngagementAnalytics } from "@/components/modules/dashboard/ExpertClientEngagementAnalytics";
export async function getExpertClientEngagementAnalytics(): Promise<ExpertClientEngagementAnalytics> {
  const response = await httpClient.get<ExpertClientEngagementAnalytics>(
    "/expert/analytics/client-engagement"
  );
  return response.data;
}

import type { ReviewRatingAnalytics } from "@/components/modules/dashboard/ExpertReviewRatingAnalytics";
export async function getExpertReviewRatingAnalytics(): Promise<ReviewRatingAnalytics> {
  const response = await httpClient.get<ReviewRatingAnalytics>("/expert/analytics/review-rating");
  return response.data;
}


// ProfilePerformanceAnalytics type from component file
type ProfilePerformanceAnalytics = {
  performanceTrends: { month: string; views: number; saves: number; clickThrough: number; consultationRequests: number }[];
  views: number;
  saves: number;
  clickThrough: number;
  consultationRequests: number;
};
export async function getExpertProfilePerformanceAnalytics(): Promise<ProfilePerformanceAnalytics> {
  const response = await httpClient.get<ProfilePerformanceAnalytics>(
    "/expert/analytics/profile-performance"
  );
  return response.data;
}


// MonthlyActivityAnalytics type from component file
type MonthlyActivityAnalytics = {
  activityTrends: { month: string; activityCount: number }[];
  peakMonth: string;
  peakCount: number;
};
export async function getExpertMonthlyActivityAnalytics(): Promise<MonthlyActivityAnalytics> {
  const response = await httpClient.get<MonthlyActivityAnalytics>(
    "/expert/analytics/monthly-activity"
  );
  return response.data;
}