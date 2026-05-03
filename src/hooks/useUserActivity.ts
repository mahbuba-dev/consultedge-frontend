"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import {
  clearRecentSearches,
  getActivityCount,
  getBehavior,
  getRecommendationMode,
  getUserActivitySignals,
  trackCategoryClick,
  trackExpertView,
  trackIndustryExplore as trackIndustryExploreSignal,
  trackSearch,
  type RecommendationMode,
  type UserActivitySignals,
} from "@/src/lib/aiPersonalization";

type UseUserActivityState = {
  signals: UserActivitySignals;
  mode: RecommendationMode;
  activityCount: number;
};

const emptySignals: UserActivitySignals = {
  viewedExperts: [],
  exploredIndustries: [],
  searchHistory: [],
  clickedCategories: [],
};

const getInitialState = (): UseUserActivityState => ({
  signals: emptySignals,
  mode: "cold-start",
  activityCount: 0,
});

export function useUserActivity() {
  const [hydrated, setHydrated] = useState(false);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    setHydrated(true);

    const handleUpdate = () => setTick((value) => value + 1);
    window.addEventListener("consultedge:behavior-updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);

    return () => {
      window.removeEventListener("consultedge:behavior-updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  const state = useMemo<UseUserActivityState>(() => {
    if (!hydrated) return getInitialState();
    const behavior = getBehavior();
    return {
      signals: getUserActivitySignals(behavior),
      mode: getRecommendationMode(behavior),
      activityCount: getActivityCount(behavior),
    };
  }, [hydrated, tick]);

  const trackViewedExpert = useCallback(
    (expert: { id: string; industryId?: string; industry?: { id?: string } }) => {
      trackExpertView(expert);
    },
    [],
  );

  const trackIndustryExplore = useCallback((industryName: string) => {
    trackIndustryExploreSignal(industryName);
  }, []);

  const trackSearchHistory = useCallback((query: string) => {
    trackSearch(query);
  }, []);

  const trackCategory = useCallback((category: string) => {
    trackCategoryClick(category);
  }, []);

  const clearSearchHistory = useCallback(() => {
    clearRecentSearches();
  }, []);

  return {
    hydrated,
    signals: state.signals,
    mode: state.mode,
    activityCount: state.activityCount,
    isColdStart: state.mode === "cold-start",
    isPersonalized: state.mode === "personalized",
    trackViewedExpert,
    trackIndustryExplore,
    trackSearchHistory,
    trackCategory,
    clearSearchHistory,
  };
}
