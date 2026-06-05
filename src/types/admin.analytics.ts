// Strict DTO contracts for modular Admin analytics sections. Each matches backend shape exactly.

export interface PlatformGrowthAnalyticsDTO {
  month: string;
  userGrowth: number;
  expertGrowth: number;
  clientGrowth: number;
  consultationGrowth: number;
}

export interface RevenueAnalyticsDTO {
  month: string;
  totalRevenue: number;
  paidConsultations: number;
  refunds: number;
}

export interface UserGrowthAnalyticsDTO {
  month: string;
  newUsers: number;
  churnedUsers: number;
  netGrowth: number;
}

export interface AIAdoptionAnalyticsDTO {
  month: string;
  aiSessions: number;
  aiUsers: number;
  aiAdoptionRate: number;
  semanticSearches: number;
  ragSessions: number;
}

export interface EngagementAnalyticsDTO {
  month: string;
  activeUsers: number;
  repeatSessions: number;
  engagementScore: number;
  inactivityDips: number;
}

export interface TopExpertsAnalyticsDTO {
  expertId: string;
  name: string;
  rating: number;
  consultations: number;
  revenue: number;
  rank: number;
}

export interface CategoryIntelligenceDTO {
  category: string;
  consultations: number;
  percent: number;
  growth: number;
  rank: number;
}

export interface PlatformHealthAnalyticsDTO {
  metric: string;
  value: number;
  trend: 'up' | 'down' | 'flat';
  comparison: number;
}
