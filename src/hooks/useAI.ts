"use client";

import { useQuery, type UseQueryOptions } from "@tanstack/react-query";

import {
  aiChat,
  aiIndustryCreation,
  aiDocumentAnalysis,
  aiSearch,
  aiSummary,
  getAIRecommendations,
} from "@/src/services/ai.service";
import type {
  AIIndustryCreationRequest,
  AIIndustryCreationResponse,
  AIChatRequest,
  AIChatResponse,
  AIDocumentAnalysisRequest,
  AIDocumentAnalysisResponse,
  AIRecommendationRequest,
  AIRecommendationResponse,
  AISearchRequest,
  AISearchResponse,
  AIServiceError,
  AISummaryRequest,
  AISummaryResponse,
} from "@/src/types/ai.types";

const MIN = 60 * 1000;

type AIQueryResult<T> = { data: T; error: AIServiceError | null };

type ExtraOptions<T> = Omit<
  UseQueryOptions<AIQueryResult<T>, Error, AIQueryResult<T>, readonly unknown[]>,
  "queryKey" | "queryFn"
>;

/** Cached for 10 minutes. */
export function useAIRecommendations(
  payload?: Partial<AIRecommendationRequest> & {
    behavior?: {
      recentExpertIds?: string[];
      industryIds?: string[];
      recentSearches?: string[];
      clickedCategories?: string[];
    };
  },
  options?: ExtraOptions<AIRecommendationResponse>,
) {
  return useQuery({
    queryKey: ["ai-recommendations", payload ?? null] as const,
    queryFn: () => getAIRecommendations(payload),
    staleTime: 10 * MIN,
    gcTime: 30 * MIN,
    ...options,
  });
}

export function useAIIndustryCreation(
  payload: AIIndustryCreationRequest,
  options?: ExtraOptions<AIIndustryCreationResponse>,
) {
  return useQuery({
    queryKey: ["ai-industry-creation", payload] as const,
    queryFn: () => aiIndustryCreation(payload),
    enabled: payload.industryName.trim().length > 1,
    staleTime: 5 * MIN,
    gcTime: 20 * MIN,
    ...options,
  });
}

/** Cached for 2 minutes. */
export function useAISearch(
  payload: AISearchRequest,
  options?: ExtraOptions<AISearchResponse>,
) {
  return useQuery({
    queryKey: ["ai-search", payload] as const,
    queryFn: () => aiSearch(payload),
    enabled: payload.query.trim().length >= 2,
    staleTime: 2 * MIN,
    gcTime: 5 * MIN,
    ...options,
  });
}

/** Cached for 30 minutes. */
export function useAISummary(
  payload: AISummaryRequest,
  options?: ExtraOptions<AISummaryResponse>,
) {
  return useQuery({
    queryKey: ["ai-summary", payload] as const,
    queryFn: () => aiSummary(payload),
    enabled: payload.topic.trim().length > 0,
    staleTime: 30 * MIN,
    gcTime: 60 * MIN,
    ...options,
  });
}

/**
 * Chat is request/response — we expose `useQuery` only for convenience when
 * a component wants to memoize the last response. Most callers should use
 * `aiChat()` directly inside an event handler / mutation.
 */
export function useAIChat(payload: AIChatRequest, options?: ExtraOptions<AIChatResponse>) {
  return useQuery({
    queryKey: ["ai-chat", payload] as const,
    queryFn: () => aiChat(payload),
    enabled: payload.message.trim().length > 0,
    staleTime: 0,
    gcTime: 5 * MIN,
    ...options,
  });
}

export function useAIDocumentAnalysis(
  payload: AIDocumentAnalysisRequest,
  options?: ExtraOptions<AIDocumentAnalysisResponse>,
) {
  return useQuery({
    queryKey: ["ai-document-analysis", payload] as const,
    queryFn: () => aiDocumentAnalysis(payload),
    enabled: Boolean(payload.text || payload.documentUrl),
    staleTime: 30 * MIN,
    gcTime: 60 * MIN,
    ...options,
  });
}
