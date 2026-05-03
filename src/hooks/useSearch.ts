"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";

import type { SearchDropdownItem } from "@/components/AI/local-search/types";
import { useDebounce } from "@/hooks/use-mobile";
import { useUserActivity } from "@/src/hooks/useUserActivity";
import {
  readSearchHistory,
  syncSearchHistoryFromBackend,
} from "@/src/lib/searchHistoryManager";
import { aiSearch } from "@/src/services/ai.service";
import type { AISearchResultItem, AISearchResponse } from "@/src/types/ai.types";

interface UseSearchOptions {
  query: string;
  open: boolean;
}

const toDropdownItem = (item: AISearchResultItem): SearchDropdownItem => ({
  id: item.id,
  type: item.type,
  label: item.label,
  ...(item.subLabel ? { subLabel: item.subLabel } : {}),
  ...(item.expertId ? { expertId: item.expertId } : {}),
  ...(item.slug ? { slug: item.slug } : {}),
  ...(typeof item.matchScore === "number" ? { matchScore: item.matchScore } : {}),
});

const toRecentSearchItems = (items: string[]): SearchDropdownItem[] =>
  items.map((label, index) => ({
    id: `recent-${index}-${label.toLowerCase().replace(/\s+/g, "-")}`,
    type: "recent",
    label,
    subLabel: "Recent search",
    slug: label.toLowerCase().replace(/\s+/g, "-"),
  }));

export function useSearch({ query, open }: UseSearchOptions) {
  const { signals } = useUserActivity();
  const debouncedQuery = useDebounce(query, 300);
  const [historyTick, setHistoryTick] = useState(0);

  useEffect(() => {
    const onHistory = () => setHistoryTick((value) => value + 1);
    window.addEventListener("consultedge:search-history-updated", onHistory);
    window.addEventListener("storage", onHistory);
    return () => {
      window.removeEventListener("consultedge:search-history-updated", onHistory);
      window.removeEventListener("storage", onHistory);
    };
  }, []);

  const searchQuery = debouncedQuery.trim();

  const searchResult = useQuery({
    queryKey: ["universal-search", searchQuery, signals],
    queryFn: () =>
      aiSearch({
        query: searchQuery,
        userActivity: {
          viewedExperts: signals.viewedExperts,
          exploredIndustries: signals.exploredIndustries,
          searchHistory: signals.searchHistory,
          clickedCategories: signals.clickedCategories,
        },
      }),
    enabled: open && searchQuery.length >= 2,
    staleTime: 1000 * 60,
    gcTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    const backendRecent = searchResult.data?.data?.recentSearches;
    if (!backendRecent || backendRecent.length === 0) return;
    syncSearchHistoryFromBackend(backendRecent);
  }, [searchResult.data]);

  const historyItems = useMemo(
    () => toRecentSearchItems(readSearchHistory()),
    [historyTick],
  );

  const data: AISearchResponse =
    searchResult.data?.data ?? {
      experts: [],
      industries: [],
      testimonials: [],
      trending: [],
      aiSuggestions: [],
      recentSearches: [],
    };

  const experts = useMemo(() => data.experts.map(toDropdownItem), [data.experts]);
  const industries = useMemo(
    () => data.industries.map(toDropdownItem),
    [data.industries],
  );
  const testimonials = useMemo(
    () => data.testimonials.map(toDropdownItem),
    [data.testimonials],
  );
  const trending = useMemo(() => data.trending.map(toDropdownItem), [data.trending]);
  const aiSuggestions = useMemo(
    () => data.aiSuggestions.map(toDropdownItem),
    [data.aiSuggestions],
  );

  const topMatches = useMemo(
    () => [...experts, ...industries, ...testimonials].slice(0, 3),
    [experts, industries, testimonials],
  );

  const recentSearches = useMemo(() => {
    const fromBackend = toRecentSearchItems(data.recentSearches);
    if (fromBackend.length > 0) return fromBackend;
    return historyItems;
  }, [data.recentSearches, historyItems]);

  return {
    query: searchQuery,
    isSearching: searchResult.isFetching,
    error: searchResult.data?.error ?? null,
    recentSearches,
    trending,
    aiSuggestions,
    topMatches,
    grouped: {
      experts,
      industries,
      testimonials,
      trending,
      aiSuggestions,
      recentSearches,
    },
  };
}
