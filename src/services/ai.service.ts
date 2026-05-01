/**
 * AI service layer.
 *
 * Wraps the new `/api/v1/ai/*` endpoints with strong types and graceful
 * fallbacks. Every public function ALWAYS resolves with a usable shape — when
 * the backend returns 429 / 503 / model errors, the heuristic fallback is
 * returned instead so callers can render a UI without try/catch boilerplate.
 *
 * Each function also exposes the raw error via the second tuple element so
 * callers that care (e.g. for toasts / analytics) can read it.
 */

import axios, { AxiosError } from "axios";

import { httpClient } from "@/src/lib/axious/httpClient";
import type {
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

const ENDPOINTS = {
  recommendations: "/ai/recommendations",
  search: "/ai/search",
  summary: "/ai/summary",
  chat: "/ai/chat",
  document: "/ai/document-analysis",
  support: "/ai/support",
} as const;

/** Convert an axios error into the structured AI error envelope. */
function toAIError(err: unknown): AIServiceError {
  if (axios.isAxiosError(err)) {
    const ax = err as AxiosError<{ message?: string }>;
    const status = ax.response?.status;
    const retryAfterRaw = ax.response?.headers?.["retry-after"];
    const retryAfterSeconds =
      typeof retryAfterRaw === "string" && /^\d+$/.test(retryAfterRaw)
        ? Number(retryAfterRaw)
        : undefined;
    const message = ax.response?.data?.message || ax.message;

    if (status === 429) {
      return { reason: "rate-limited", message: "Too many requests — slowing down.", retryAfterSeconds };
    }
    if (status === 503) {
      return { reason: "service-unavailable", message: "AI service is temporarily unavailable.", retryAfterSeconds };
    }
    if (status && status >= 500) {
      return { reason: "model-error", message: message || "Model returned an error." };
    }
    if (!ax.response) {
      return { reason: "network-error", message: message || "Network error." };
    }
    return { reason: "unknown", message: message || "Unknown AI error." };
  }
  return { reason: "unknown", message: err instanceof Error ? err.message : "Unknown AI error." };
}

// ---------------------------------------------
// Fallback shapes
// ---------------------------------------------

function recommendationsFallback(): AIRecommendationResponse {
  return { items: [], generatedAt: new Date().toISOString(), intent: "fallback" };
}

function searchFallback(query: string): AISearchResponse {
  return { query, suggestions: [], experts: [] };
}

function summaryFallback(topic: string): AISummaryResponse {
  return { topic, items: [] };
}

function chatFallback(): AIChatResponse {
  return {
    reply: "I couldn't reach the AI service. Please try again or contact support.",
    suggestedActions: [],
    escalatedToHuman: true,
    timestamp: new Date().toISOString(),
  };
}

function documentFallback(): AIDocumentAnalysisResponse {
  return { summary: "", keyPoints: [], risks: [] };
}

// ---------------------------------------------
// Generic POST helper that always resolves
// ---------------------------------------------
type AIResult<T> = { data: T; error: AIServiceError | null };

async function postOrFallback<TBody, TData>(
  endpoint: string,
  body: TBody,
  fallback: () => TData,
): Promise<AIResult<TData>> {
  try {
    const res = await httpClient.post<TData>(endpoint, body, { silent: true });
    // httpClient unwraps to ApiResponse<TData>; data lives on `.data`.
    const data = (res?.data ?? fallback()) as TData;
    return { data, error: null };
  } catch (err) {
    const error = toAIError(err);
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.warn(`[ai.service] ${endpoint} failed:`, error);
    }
    return { data: fallback(), error };
  }
}

// ---------------------------------------------
// Public API
// ---------------------------------------------
export async function getAIRecommendations(
  payload: AIRecommendationRequest = {},
): Promise<AIResult<AIRecommendationResponse>> {
  return postOrFallback(ENDPOINTS.recommendations, payload, recommendationsFallback);
}

export async function aiSearch(
  payload: AISearchRequest,
): Promise<AIResult<AISearchResponse>> {
  return postOrFallback(ENDPOINTS.search, payload, () => searchFallback(payload.query));
}

export async function aiSummary(
  payload: AISummaryRequest,
): Promise<AIResult<AISummaryResponse>> {
  return postOrFallback(ENDPOINTS.summary, payload, () => summaryFallback(payload.topic));
}

export async function aiChat(
  payload: AIChatRequest,
): Promise<AIResult<AIChatResponse>> {
  return postOrFallback(ENDPOINTS.chat, payload, chatFallback);
}

export async function aiDocumentAnalysis(
  payload: AIDocumentAnalysisRequest,
): Promise<AIResult<AIDocumentAnalysisResponse>> {
  return postOrFallback(ENDPOINTS.document, payload, documentFallback);
}

/** Used by the support widget — same shape as aiChat but routed through `/support`. */
export async function aiSupport(
  payload: AIChatRequest,
): Promise<AIResult<AIChatResponse>> {
  return postOrFallback(ENDPOINTS.support, payload, chatFallback);
}
