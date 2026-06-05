// Strict DTO contracts for all Client analytics modules, matching backend response shapes exactly.

// 1. Spending Trends
export interface ClientSpendingTrendsAnalytics {
  month: string; // e.g. '2026-04'
  amount: number;
  growthPercent: number;
  comparisonToLastMonth: number;
  trendBadge: 'up' | 'down' | 'flat';
  // Add any additional backend fields as needed
}

// 2. Consultation Activity
export interface ClientConsultationActivityAnalytics {
  month: string;
  completed: number;
  pending: number;
  activitySpike: boolean;
  activityDrop: boolean;
  // Add any additional backend fields as needed
}

// 3. Saved Experts Analytics
export interface ClientSavedExpertsAnalytics {
  category: string;
  count: number;
  rank: number;
  // Add any additional backend fields as needed
}

// 4. AI Usage Analytics
export interface ClientAIUsageAnalytics {
  feature: string;
  count: number;
  timeline: Array<{ date: string; count: number }>;
  adoptionMetric: number;
  // Add any additional backend fields as needed
}

// 5. Engagement Trends
export interface ClientEngagementTrendsAnalytics {
  month: string;
  engagement: number;
  retention: number;
  repeatConsultations: number;
  inactivityDips: number;
  // Add any additional backend fields as needed
}

// 6. Consultation Category Distribution
export interface ClientConsultationCategoriesAnalytics {
  category: string;
  count: number;
  percent: number;
  // Add any additional backend fields as needed
}
