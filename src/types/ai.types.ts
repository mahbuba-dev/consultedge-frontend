import type { IExpert } from "./expert.types";

export type AIRequestSource = "homepage" | "navbar" | "experts-page" | "newsletter" | "content";

export interface AIBehaviorContext {
  /** Top industry IDs by weight (most-relevant first). */
  industryIds?: string[];
  recentSearches?: string[];
  recentExpertIds?: string[];
  hasSignal?: boolean;
}

// ---------------------------------------------
// Recommendations
// ---------------------------------------------
export interface AIRecommendationRequest {
  limit?: number;
  source?: AIRequestSource;
  behavior?: AIBehaviorContext;
  /** Optional industry filter id. */
  industryId?: string;
}

export interface AIRecommendationItem {
  expertId: string;
  /** Optional pre-resolved expert payload from backend. */
  expert?: IExpert;
  score: number;
  reason?: string;
}

export interface AIRecommendationResponse {
  items: AIRecommendationItem[];
  generatedAt: string;
  /** Optional hint for what the recommendation is for. */
  intent?: "personalized" | "trending" | "fallback";
}

// ---------------------------------------------
// Search
// ---------------------------------------------
export interface AISearchRequest {
  query: string;
  limit?: number;
  source?: AIRequestSource;
  behavior?: AIBehaviorContext;
}

export interface AISearchSuggestion {
  label: string;
  type: "expert" | "industry" | "topic";
  href?: string;
  /** Linked entity id when type !== "topic". */
  refId?: string;
}

export interface AISearchResponse {
  query: string;
  suggestions: AISearchSuggestion[];
  experts: IExpert[];
  rewrittenQuery?: string;
}

// ---------------------------------------------
// Summary (used by content suggestions + newsletter preview)
// ---------------------------------------------
export interface AISummaryRequest {
  /** Free-form topic, industry name, or query string. */
  topic: string;
  industryIds?: string[];
  /** Optional summary kind so backend can pick a template. */
  kind?: "newsletter-preview" | "content-suggestions" | "expert-bio" | "generic";
  source?: AIRequestSource;
}

export interface AISummaryItem {
  id: string;
  title: string;
  description: string;
  type?: string;
  readMinutes?: number;
  href?: string;
}

export interface AISummaryResponse {
  topic: string;
  headline?: string;
  summary?: string;
  items: AISummaryItem[];
}

// ---------------------------------------------
// Chat (support widget)
// ---------------------------------------------
export interface AIChatHistoryItem {
  role: "user" | "assistant";
  content: string;
}

export interface AIChatRequest {
  message: string;
  context?: string;
  history?: AIChatHistoryItem[];
}

export interface AIChatSuggestedAction {
  id: string;
  label: string;
  href?: string;
  intent?: string;
}

export interface AIChatResponse {
  reply: string;
  suggestedActions?: AIChatSuggestedAction[];
  escalatedToHuman?: boolean;
  timestamp?: string;
}

// ---------------------------------------------
// Document analysis
// ---------------------------------------------
export interface AIDocumentAnalysisRequest {
  /** Either provide raw text or a URL to a hosted document. */
  text?: string;
  documentUrl?: string;
  /** Hint for the kind of analysis: `summary`, `keypoints`, `risk`, etc. */
  mode?: "summary" | "keypoints" | "risk" | "extract";
}

export interface AIDocumentAnalysisResponse {
  summary?: string;
  keyPoints?: string[];
  risks?: string[];
  metadata?: Record<string, unknown>;
}

// ---------------------------------------------
// Shared error envelope
// ---------------------------------------------
export type AIErrorReason =
  | "rate-limited"
  | "service-unavailable"
  | "model-error"
  | "network-error"
  | "unknown";

export interface AIServiceError {
  reason: AIErrorReason;
  message: string;
  retryAfterSeconds?: number;
}
