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
  AIIndustryCreationRequest,
  AIIndustryCreationResponse,
  AIChatRequest,
  AIChatResponse,
  AIDocumentAnalysisRequest,
  AIDocumentAnalysisResponse,
  AIRecommendationRequest,
  AIRecommendationResponse,
  AISearchRequest,
  AISearchResultItem,
  AISearchResultType,
  AISearchResponse,
  AIServiceError,
  AISummaryRequest,
  AISummaryResponse,
} from "@/src/types/ai.types";
import type {
  AISendMessageRequest,
  AISendMessageResponse,
  AIConversationSummary,
  AIConversationDetail,
  AIMessageFeedback,
  AIChatHistoryItem,
} from "@/src/types/ai.types";

const ENDPOINTS = {
  recommendations: "/ai/recommendations",
  industryCreation: "/ai/industry-creation",
  search: "/ai/search",
  summary: "/ai/summary",
  chat: "/ai/chat",
  ragQuery: "/ai/rag/query",
  document: "/ai/document-analysis",
  support: "/ai/support",
} as const;

export interface AIRagContextItem {
  source_id: string;
  content: string;
  metadata?: Record<string, unknown>;
}

export interface AIRagQueryRequest {
  query: string;
  topK?: number;
  context: AIRagContextItem[];
}

export interface AIRagSource {
  source_id: string;
  evidence: string;
}

export interface AIRagQueryResponse {
  answer: string;
  reasoning: string;
  sources: AIRagSource[];
  suggestions: string[];
}

const MAX_TOPIC_LENGTH = 200;
const MAX_QUERY_LENGTH = 120;
const MAX_SUMMARY_TEXT_LENGTH = 20000;
const MAX_SEARCH_HISTORY = 8;

function normalizeText(value: string, maxLength: number): string {
  return value.replace(/\s+/g, " ").trim().slice(0, maxLength);
}

/**
 * Keep payloads minimal and predictable to avoid strict backend Zod failures.
 * We intentionally avoid optional enum/object fields that vary between backend versions.
 */
function sanitizeStringArray(value: unknown, max = 20): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean)
    .slice(0, max);
}

function sanitizeRecommendationPayload(
  payload: Partial<AIRecommendationRequest> & {
    behavior?: {
      recentExpertIds?: string[];
      industryIds?: string[];
      recentSearches?: string[];
      clickedCategories?: string[];
    };
  } = {},
): AIRecommendationRequest {
  const viewedExperts = sanitizeStringArray(
    payload.viewedExperts ?? payload.behavior?.recentExpertIds,
  );
  const exploredIndustries = sanitizeStringArray(
    payload.exploredIndustries ?? payload.behavior?.industryIds,
  );
  const searchHistory = sanitizeStringArray(
    payload.searchHistory ?? payload.behavior?.recentSearches,
  );
  const clickedCategories = sanitizeStringArray(
    payload.clickedCategories ?? payload.behavior?.clickedCategories,
  );

  return {
    viewedExperts,
    exploredIndustries,
    searchHistory,
    clickedCategories,
  };
}

function sanitizeSearchPayload(payload: AISearchRequest): AISearchRequest {
  return {
    query: normalizeText(payload.query, MAX_QUERY_LENGTH),
    userActivity: {
      viewedExperts: sanitizeStringArray(payload.userActivity?.viewedExperts, 20),
      exploredIndustries: sanitizeStringArray(payload.userActivity?.exploredIndustries, 20),
      searchHistory: sanitizeStringArray(payload.userActivity?.searchHistory, MAX_SEARCH_HISTORY),
      clickedCategories: sanitizeStringArray(payload.userActivity?.clickedCategories, 20),
    },
  };
}

function sanitizeSummaryPayload(payload: AISummaryRequest): { text: string; audience?: string } {
  const topic = normalizeText(payload.topic ?? "", MAX_TOPIC_LENGTH);
  const rawText = normalizeText(payload.text ?? topic, MAX_SUMMARY_TEXT_LENGTH);

  const text =
    rawText.length >= 20
      ? rawText
      : normalizeText(
          `Create a concise executive summary for ${rawText || topic || "consulting"} and include practical next steps for business teams.`,
          MAX_SUMMARY_TEXT_LENGTH,
        );

  const audience =
    typeof payload.audience === "string" && payload.audience.trim()
      ? normalizeText(payload.audience, 100)
      : undefined;

  return {
    text,
    ...(audience ? { audience } : {}),
  };
}

function sanitizeIndustryCreationPayload(
  payload: AIIndustryCreationRequest,
): AIIndustryCreationRequest {
  return {
    industryName: normalizeText(payload.industryName ?? "", 120),
  };
}

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
  return { mode: "cold-start", activityCount: 0, experts: [] };
}

function searchFallback(query: string): AISearchResponse {
  return {
    experts: [],
    industries: [],
    testimonials: [],
    trending: [],
    aiSuggestions: [],
    recentSearches: query ? [query] : [],
  };
}

function toSearchType(value: unknown): AISearchResultType | null {
  if (typeof value !== "string") return null;
  if (value === "expert" || value === "industry" || value === "testimonial" || value === "trending") {
    return value;
  }
  return null;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function normalizeSearchItems(value: unknown, expectedType: AISearchResultType): AISearchResultItem[] {
  if (!Array.isArray(value)) return [];

  const items: AISearchResultItem[] = [];

  value.forEach((raw, index) => {
    if (typeof raw === "string") {
      const label = raw.trim();
      if (!label) return;
      items.push({
        id: `${expectedType}-${index}-${slugify(label) || index}`,
        type: expectedType,
        label,
        ...(expectedType === "trending" ? { slug: slugify(label) || String(index) } : {}),
      });
      return;
    }

    if (!raw || typeof raw !== "object") return;

    const candidate = raw as Record<string, unknown>;
    const label =
      (typeof candidate.label === "string" && candidate.label) ||
      (typeof candidate.name === "string" && candidate.name) ||
      (typeof candidate.title === "string" && candidate.title) ||
      (typeof candidate.query === "string" && candidate.query) ||
      "";

    const cleanedLabel = label.trim();
    if (!cleanedLabel) return;

    const type = toSearchType(candidate.type) ?? expectedType;
    const idSource =
      (typeof candidate.id === "string" && candidate.id) ||
      (typeof candidate.expertId === "string" && candidate.expertId) ||
      (typeof candidate.slug === "string" && candidate.slug) ||
      `${expectedType}-${index}-${slugify(cleanedLabel)}`;

    const subLabel =
      (typeof candidate.subLabel === "string" && candidate.subLabel.trim()) ||
      (typeof candidate.description === "string" && candidate.description.trim()) ||
      (typeof candidate.specialization === "string" && candidate.specialization.trim()) ||
      undefined;

    const expertId =
      typeof candidate.expertId === "string"
        ? candidate.expertId
        : typeof candidate.id === "string" && type === "expert"
          ? candidate.id
          : undefined;

    const slug =
      typeof candidate.slug === "string"
        ? candidate.slug
        : type === "trending"
          ? slugify(cleanedLabel) || String(index)
          : undefined;

    const matchScore =
      typeof candidate.matchScore === "number" && Number.isFinite(candidate.matchScore)
        ? candidate.matchScore
        : typeof candidate.score === "number" && Number.isFinite(candidate.score)
          ? candidate.score
          : undefined;

    items.push({
      id: idSource,
      type,
      label: cleanedLabel,
      ...(subLabel ? { subLabel } : {}),
      ...(expertId ? { expertId } : {}),
      ...(slug ? { slug } : {}),
      ...(typeof matchScore === "number" ? { matchScore } : {}),
    });
  });

  return items;
}

function normalizeSearchResponse(raw: unknown, query: string): AISearchResponse {
  if (!raw || typeof raw !== "object") {
    return searchFallback(query);
  }

  const candidate = raw as Record<string, unknown>;

  const recentSearches = Array.isArray(candidate.recentSearches)
    ? candidate.recentSearches
        .map((item) => (typeof item === "string" ? item.trim() : ""))
        .filter(Boolean)
        .slice(0, MAX_SEARCH_HISTORY)
    : query
      ? [query]
      : [];

  return {
    experts: normalizeSearchItems(candidate.experts, "expert"),
    industries: normalizeSearchItems(candidate.industries, "industry"),
    testimonials: normalizeSearchItems(candidate.testimonials, "testimonial"),
    trending: normalizeSearchItems(candidate.trending, "trending"),
    aiSuggestions: normalizeSearchItems(candidate.aiSuggestions, "trending"),
    recentSearches,
  };
}

function summaryFallback(topic: string): AISummaryResponse {
  return { topic, items: [] };
}

function normalizeSummaryResponse(
  topic: string,
  raw: Partial<
    AISummaryResponse & {
      keyPoints?: string[];
      actionItems?: string[];
    }
  >,
): AISummaryResponse {
  if (Array.isArray(raw.items)) {
    return {
      topic,
      headline: typeof raw.headline === "string" ? raw.headline : undefined,
      summary: typeof raw.summary === "string" ? raw.summary : undefined,
      items: raw.items,
    };
  }

  const keyPointItems = Array.isArray(raw.keyPoints)
    ? raw.keyPoints.map((point, index) => ({
        id: `kp-${index}`,
        title: point,
        description: "Key point",
        type: "Key point",
      }))
    : [];

  const actionItems = Array.isArray(raw.actionItems)
    ? raw.actionItems.map((action, index) => ({
        id: `action-${index}`,
        title: action,
        description: "Action item",
        type: "Action item",
      }))
    : [];

  return {
    topic,
    summary: typeof raw.summary === "string" ? raw.summary : undefined,
    headline: typeof raw.summary === "string" ? "AI Summary" : undefined,
    items: [...keyPointItems, ...actionItems].slice(0, 8),
  };
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

function industryCreationFallback(industryName = ""): AIIndustryCreationResponse {
  return {
    industryName,
    industryDescription: "",
    idealExpertTypes: [],
    commonUseCases: [],
    shortTagline: "",
  };
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
    if (
      process.env.NODE_ENV !== "production" &&
      error.reason !== "service-unavailable"
    ) {
      console.warn(`[ai.service] ${endpoint} failed:`, error);
    }
    return { data: fallback(), error };
  }
}

// ---------------------------------------------
// Public API
// ---------------------------------------------
export async function getAIRecommendations(
  payload: Partial<AIRecommendationRequest> & {
    behavior?: {
      recentExpertIds?: string[];
      industryIds?: string[];
      recentSearches?: string[];
      clickedCategories?: string[];
    };
  } = {},
): Promise<AIResult<AIRecommendationResponse>> {
  return postOrFallback(
    ENDPOINTS.recommendations,
    sanitizeRecommendationPayload(payload),
    recommendationsFallback,
  );
}

export async function aiSearch(
  payload: AISearchRequest,
): Promise<AIResult<AISearchResponse>> {
  const safePayload = sanitizeSearchPayload(payload);
  const result = await postOrFallback(
    ENDPOINTS.search,
    safePayload,
    () => searchFallback(safePayload.query),
  );

  return {
    data: normalizeSearchResponse(result.data as unknown, safePayload.query),
    error: result.error,
  };
}

export async function aiSummary(
  payload: AISummaryRequest,
): Promise<AIResult<AISummaryResponse>> {
  const safePayload = sanitizeSummaryPayload(payload);

  const result = await postOrFallback(
    ENDPOINTS.summary,
    safePayload,
    () => summaryFallback(payload.topic),
  );

  return {
    data: normalizeSummaryResponse(payload.topic, result.data as Partial<AISummaryResponse>),
    error: result.error,
  };
}

export async function aiIndustryCreation(
  payload: AIIndustryCreationRequest,
): Promise<AIResult<AIIndustryCreationResponse>> {
  const safePayload = sanitizeIndustryCreationPayload(payload);
  return postOrFallback(
    ENDPOINTS.industryCreation,
    safePayload,
    () => industryCreationFallback(safePayload.industryName),
  );
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

export async function aiRagQuery(
  payload: AIRagQueryRequest,
): Promise<AIResult<AIRagQueryResponse>> {
  const safeContext = Array.isArray(payload.context)
    ? payload.context
        .filter((item) => item?.source_id?.trim() && item?.content?.trim())
        .slice(0, 100)
    : [];

  const safePayload: AIRagQueryRequest = {
    query: normalizeText(payload.query ?? "", 1000),
    topK:
      typeof payload.topK === "number" && Number.isFinite(payload.topK)
        ? Math.min(20, Math.max(1, Math.trunc(payload.topK)))
        : 6,
    context: safeContext,
  };

  if (!safePayload.query || safePayload.context.length === 0) {
    return {
      data: {
        answer: "No matching data found in the system.",
        reasoning: "Insufficient context provided from frontend.",
        sources: [],
        suggestions: [],
      },
      error: null,
    };
  }

  return postOrFallback(
    ENDPOINTS.ragQuery,
    safePayload,
    () => ({
      answer: "No matching data found in the system.",
      reasoning: "RAG service unavailable.",
      sources: [],
      suggestions: [],
    }),
  );
}

// ---------------------------------------------
// Persistent AI Chat (dashboard chatbot)
// ---------------------------------------------

export async function aiChatSendMessage(
  payload: AISendMessageRequest,
): Promise<AISendMessageResponse> {
  const res = await httpClient.post<AISendMessageResponse>(
    "/ai/chat/messages",
    payload,
    {
      silent: true,
      expectedStatuses: [401, 403, 404, 503],
    },
  );
  return res.data as AISendMessageResponse;
}

export async function aiChatListConversations(): Promise<AIConversationSummary[]> {
  const res = await httpClient.get<AIConversationSummary[]>("/ai/chat/conversations", {
    silent: true,
    expectedStatuses: [401, 403, 404, 503],
  });
  const data = res.data;
  return Array.isArray(data) ? data : [];
}

export async function aiChatGetConversation(
  conversationId: string,
): Promise<AIConversationDetail> {
  const res = await httpClient.get<AIConversationDetail>(
    `/ai/chat/conversations/${conversationId}`,
    {
      silent: true,
      expectedStatuses: [401, 403, 404, 503],
    },
  );
  return res.data as AIConversationDetail;
}

export async function aiChatSetFeedback(
  conversationId: string,
  messageId: string,
  feedback: AIMessageFeedback,
): Promise<void> {
  await httpClient.patch(
    `/ai/chat/conversations/${conversationId}/messages/${messageId}/feedback`,
    { feedback },
    {
      silent: true,
      expectedStatuses: [401, 403, 404, 503],
    },
  );
}

export async function aiChatOpenAIFallback(payload: {
  message: string;
  context?: string;
  history?: AIChatHistoryItem[];
}): Promise<AIChatResponse> {
  const response = await fetch("/api/ai/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const json = (await response.json().catch(() => ({}))) as {
    success?: boolean;
    message?: string;
    data?: AIChatResponse;
  };

  if (!response.ok || json.success === false) {
    throw new Error(json.message || "OpenAI fallback unavailable");
  }

  return (
    json.data ?? {
      reply: "I can help with that. Please share a little more detail.",
      suggestedActions: [],
      escalatedToHuman: false,
      timestamp: new Date().toISOString(),
    }
  );
}
