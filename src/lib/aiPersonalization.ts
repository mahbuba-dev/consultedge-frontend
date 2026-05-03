/**
 * Lightweight on-device personalization engine.
 *
 * Tracks user behavior in localStorage (no cookies, no backend) so we can
 * deliver AI-flavored features without yet wiring a server. The data shape
 * is forward-compatible with a future /api/v1/recommendations endpoint.
 */

import type { IExpert } from "@/src/types/expert.types";

const STORAGE_KEY = "consultedge:behavior:v1";
const MAX_RECENT_SEARCHES = 8;
const MAX_RECENT_VIEWS = 16;
const MAX_CLICKED_CATEGORIES = 8;
const WEIGHT_DECAY = 0.94;
const STORAGE_USER_SCOPE_KEY = "consultedge:behavior:user-scope";
const VIEWED_EXPERTS_KEY = "viewedExperts";
const EXPLORED_INDUSTRIES_KEY = "exploredIndustries";
const SEARCH_HISTORY_KEY = "searchHistory";
const CLICKED_CATEGORIES_KEY = "clickedCategories";

export interface BehaviorState {
  industryWeights: Record<string, number>;
  recentSearches: string[];
  recentExpertIds: string[];
  clickedCategories: string[];
  updatedAt: number;
}

export type RecommendationMode = "cold-start" | "personalized";

export interface UserActivitySignals {
  viewedExperts: string[];
  exploredIndustries: string[];
  searchHistory: string[];
  clickedCategories: string[];
}

export interface ScoredExpert {
  expert: IExpert;
  score: number;
  reason: string;
}

export interface RecommendationCard {
  name: string;
  title: string;
  specialization: string;
  shortDescription: string;
  experienceYears: number;
  fee: number;
  whyReason: string;
  rankingScore: number;
  expert: IExpert;
}

const empty = (): BehaviorState => ({
  industryWeights: {},
  recentSearches: [],
  recentExpertIds: [],
  clickedCategories: [],
  updatedAt: 0,
});

const isBrowser = () => typeof window !== "undefined" && !!window.localStorage;

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const cookies = document.cookie ? document.cookie.split(";") : [];
  for (const cookie of cookies) {
    const [rawKey, ...rest] = cookie.split("=");
    if (rawKey?.trim() !== name) continue;
    return decodeURIComponent(rest.join("=") || "");
  }
  return null;
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split(".");
    if (parts.length < 2 || !parts[1]) return null;
    const normalized = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
    const json = window.atob(padded);
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function toStorageSafeScope(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

function detectUserScope(): string {
  if (!isBrowser()) return "guest";

  const accessToken = readCookie("accessToken");
  const payload = accessToken ? decodeJwtPayload(accessToken) : null;

  const candidates = [
    payload?.userId,
    payload?.id,
    payload?.sub,
    payload?.email,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim()) {
      return toStorageSafeScope(candidate);
    }
  }

  return "guest";
}

function readLastScope(): string {
  if (!isBrowser()) return "guest";
  const stored = window.localStorage.getItem(STORAGE_USER_SCOPE_KEY)?.trim();
  return stored || "guest";
}

function persistScope(scope: string) {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(STORAGE_USER_SCOPE_KEY, scope);
  } catch {
    // Ignore private mode / quota issues.
  }
}

function getStorageKey(): string {
  if (!isBrowser()) return `${STORAGE_KEY}:guest`;

  const detectedScope = detectUserScope();
  const safeScope = detectedScope || "guest";
  const lastScope = readLastScope();

  if (lastScope !== safeScope) {
    persistScope(safeScope);
    window.dispatchEvent(new CustomEvent("consultedge:behavior-updated"));
  }

  return `${STORAGE_KEY}:${safeScope}`;
}

function syncActivityArrays(state: BehaviorState) {
  if (!isBrowser()) return;
  const exploredIndustries = Object.keys(state.industryWeights);

  try {
    window.localStorage.setItem(VIEWED_EXPERTS_KEY, JSON.stringify(state.recentExpertIds));
    window.localStorage.setItem(EXPLORED_INDUSTRIES_KEY, JSON.stringify(exploredIndustries));
    window.localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(state.recentSearches));
    window.localStorage.setItem(CLICKED_CATEGORIES_KEY, JSON.stringify(state.clickedCategories));
  } catch {
    // Ignore private mode / quota issues.
  }
}

function read(): BehaviorState {
  if (!isBrowser()) return empty();
  try {
    const raw = window.localStorage.getItem(getStorageKey());
    if (!raw) {
      const value = empty();
      syncActivityArrays(value);
      return value;
    }
    const parsed = JSON.parse(raw) as Partial<BehaviorState>;
    const value = {
      industryWeights: parsed.industryWeights ?? {},
      recentSearches: parsed.recentSearches ?? [],
      recentExpertIds: parsed.recentExpertIds ?? [],
      clickedCategories: parsed.clickedCategories ?? [],
      updatedAt: parsed.updatedAt ?? 0,
    };
    syncActivityArrays(value);
    return value;
  } catch {
    const value = empty();
    syncActivityArrays(value);
    return value;
  }
}

function write(state: BehaviorState) {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(getStorageKey(), JSON.stringify(state));
    syncActivityArrays(state);
    window.dispatchEvent(new CustomEvent("consultedge:behavior-updated"));
  } catch {
    // quota/private mode safety
  }
}

function normalizeText(value: string): string {
  return value.toLowerCase().trim();
}

function includesToken(value: string, token: string): boolean {
  return normalizeText(value).includes(normalizeText(token));
}

function clampLimit(limit: number): number {
  return Math.max(4, Math.min(6, Math.floor(limit)));
}

export function getBehavior(): BehaviorState {
  return read();
}

export function trackSearch(query: string) {
  const trimmed = query.trim();
  if (!trimmed || trimmed.length < 2) return;
  const state = read();
  state.recentSearches = [
    trimmed,
    ...state.recentSearches.filter((q) => q.toLowerCase() !== trimmed.toLowerCase()),
  ].slice(0, MAX_RECENT_SEARCHES);
  state.updatedAt = Date.now();
  write(state);
}

export function clearRecentSearches() {
  const state = read();
  state.recentSearches = [];
  write(state);
}

export function trackCategoryClick(category: string) {
  const normalized = category.trim();
  if (!normalized) return;
  const state = read();
  state.clickedCategories = [
    normalized,
    ...state.clickedCategories.filter(
      (item) => item.toLowerCase() !== normalized.toLowerCase(),
    ),
  ].slice(0, MAX_CLICKED_CATEGORIES);
  state.updatedAt = Date.now();
  write(state);
}

export function trackIndustryExplore(industry: string) {
  const normalized = industry.trim();
  if (!normalized) return;

  const state = read();

  for (const key of Object.keys(state.industryWeights)) {
    state.industryWeights[key] = state.industryWeights[key] * WEIGHT_DECAY;
  }

  state.industryWeights[normalized] = (state.industryWeights[normalized] ?? 0) + 1;
  state.updatedAt = Date.now();
  write(state);
}

export function trackExpertView(expert: Pick<IExpert, "id" | "industryId" | "industry">) {
  if (!expert?.id) return;
  const state = read();

  for (const key of Object.keys(state.industryWeights)) {
    state.industryWeights[key] = state.industryWeights[key] * WEIGHT_DECAY;
  }

  const industryKey = expert.industry?.id ?? expert.industryId;
  if (industryKey) {
    state.industryWeights[industryKey] = (state.industryWeights[industryKey] ?? 0) + 1;
  }

  state.recentExpertIds = [
    expert.id,
    ...state.recentExpertIds.filter((id) => id !== expert.id),
  ].slice(0, MAX_RECENT_VIEWS);

  state.updatedAt = Date.now();
  write(state);
}

export function getUserActivitySignals(state: BehaviorState = read()): UserActivitySignals {
  return {
    viewedExperts: state.recentExpertIds,
    exploredIndustries: Object.keys(state.industryWeights),
    searchHistory: state.recentSearches,
    clickedCategories: state.clickedCategories,
  };
}

export function getActivityCount(state: BehaviorState = read()): number {
  const signals = getUserActivitySignals(state);
  return (
    signals.viewedExperts.length +
    signals.exploredIndustries.length +
    signals.searchHistory.length +
    signals.clickedCategories.length
  );
}

export function getRecommendationMode(state: BehaviorState = read()): RecommendationMode {
  return getActivityCount(state) === 0 ? "cold-start" : "personalized";
}

export function hasPersonalSignal(state: BehaviorState = read()): boolean {
  return getRecommendationMode(state) === "personalized";
}

function getColdStartReason(expert: IExpert, index: number): string {
  const reasons = [
    "Popular among new users",
    "Trending this week",
    "Verified specialist",
    "High success rate",
    "Frequently booked by founders",
  ];

  if (expert.isVerified) return "Verified specialist";
  if ((expert.experience ?? 0) >= 8) return "High success rate";
  return reasons[index % reasons.length];
}

function getPersonalizedReason(args: {
  expert: IExpert;
  matchedSearch?: string;
  matchedCategory?: string;
  viewedExpertName?: string;
  hasIndustryAffinity: boolean;
  hasSimilaritySignal: boolean;
}): string {
  const {
    expert,
    matchedSearch,
    matchedCategory,
    viewedExpertName,
    hasIndustryAffinity,
    hasSimilaritySignal,
  } = args;

  if (matchedSearch) return `Because you searched "${matchedSearch}"`;
  if (matchedCategory) return `Because you clicked on ${matchedCategory}`;
  if (hasIndustryAffinity && expert.industry?.name) {
    return `Because you explored ${expert.industry.name}`;
  }
  if (viewedExpertName) return `Because you viewed ${viewedExpertName}`;
  if (hasSimilaritySignal) return "Because you interacted with similar experts";
  return "Because you interacted with similar experts";
}

function scoreColdStartExperts(experts: IExpert[]): ScoredExpert[] {
  const dayKey = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
  const seedNoise = (id: string) => {
    let hash = 0;
    const seed = `${id}:${dayKey}`;
    for (let i = 0; i < seed.length; i++) {
      hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
    }
    return (hash % 1000) / 1000;
  };

  return experts
    .map((expert, index) => {
      const verifiedBoost = expert.isVerified ? 0.34 : 0;
      const experience = Math.min(15, Number(expert.experience ?? 0)) / 15;
      const fee = Number(expert.consultationFee ?? expert.price ?? 0);
      const bookingProxy = Math.min(1, fee / 220);
      const score =
        verifiedBoost + experience * 0.38 + bookingProxy * 0.18 + seedNoise(expert.id) * 0.1;
      return {
        expert,
        score,
        reason: getColdStartReason(expert, index),
      };
    })
    .sort((a, b) => b.score - a.score);
}

function scorePersonalizedExperts(experts: IExpert[], state: BehaviorState): ScoredExpert[] {
  const weights = state.industryWeights;
  const totalWeight = Object.values(weights).reduce((sum, w) => sum + w, 0) || 1;
  const recentViewed = new Set(state.recentExpertIds.slice(0, 5));
  const expertsById = new Map(experts.map((expert) => [expert.id, expert]));
  const viewedIndustryIds = new Set(
    state.recentExpertIds
      .slice(0, 6)
      .map((id) => {
        const found = expertsById.get(id);
        return found?.industry?.id ?? found?.industryId ?? "";
      })
      .filter(Boolean),
  );

  return experts
    .map((expert) => {
      const haystack = [expert.fullName, expert.title, expert.bio, expert.industry?.name]
        .filter(Boolean)
        .join(" ");

      const industryId = expert.industry?.id ?? expert.industryId;
      const industryAffinity = industryId ? (weights[industryId] ?? 0) / totalWeight : 0;
      const similarityBoost = industryId && viewedIndustryIds.has(industryId) ? 0.2 : 0;

      let searchIntentBoost = 0;
      let matchedSearch: string | undefined;
      for (const query of state.recentSearches.slice(0, 4)) {
        if (includesToken(haystack, query)) {
          searchIntentBoost = Math.min(searchIntentBoost + 0.14, 0.28);
          matchedSearch = matchedSearch ?? query;
        }
      }

      let categoryBoost = 0;
      let matchedCategory: string | undefined;
      for (const category of state.clickedCategories.slice(0, 4)) {
        if (includesToken(haystack, category)) {
          categoryBoost = Math.min(categoryBoost + 0.12, 0.24);
          matchedCategory = matchedCategory ?? category;
        }
      }

      const verifiedBoost = expert.isVerified ? 0.14 : 0;
      const expBoost = Math.min(0.2, Number(expert.experience ?? 0) * 0.02);
      const recentPenalty = recentViewed.has(expert.id) ? -0.2 : 0;

      const score =
        industryAffinity * 0.95 +
        similarityBoost +
        searchIntentBoost +
        categoryBoost +
        verifiedBoost +
        expBoost +
        recentPenalty;

      const viewedExpertName = state.recentExpertIds
        .slice(0, 3)
        .map((id) => expertsById.get(id)?.fullName)
        .find(Boolean);

      return {
        expert,
        score,
        reason: getPersonalizedReason({
          expert,
          matchedSearch,
          matchedCategory,
          viewedExpertName,
          hasIndustryAffinity: industryAffinity > 0.04,
          hasSimilaritySignal: similarityBoost > 0,
        }),
      };
    })
    .sort((a, b) => b.score - a.score);
}

export function scoreExperts(
  experts: IExpert[],
  state: BehaviorState = read(),
): ScoredExpert[] {
  return getRecommendationMode(state) === "cold-start"
    ? scoreColdStartExperts(experts)
    : scorePersonalizedExperts(experts, state);
}

export function recommendExperts(
  experts: IExpert[],
  limit = 4,
  state?: BehaviorState,
): ScoredExpert[] {
  return scoreExperts(experts, state ?? read()).slice(0, clampLimit(limit));
}

export function buildRecommendationCards(
  experts: IExpert[],
  limit = 4,
  state: BehaviorState = read(),
): RecommendationCard[] {
  return scoreExperts(experts, state)
    .slice(0, clampLimit(limit))
    .map(({ expert, score, reason }) => ({
      name: expert.fullName,
      title: expert.title || "Consultant",
      specialization: expert.industry?.name || "General Consulting",
      shortDescription:
        expert.bio?.trim() ||
        "Focused 1:1 guidance for strategy, growth, and execution.",
      experienceYears: Number(expert.experience ?? 0),
      fee: Number(expert.consultationFee ?? expert.price ?? 0),
      whyReason: reason,
      rankingScore: Number(score.toFixed(4)),
      expert,
    }));
}

export function getTrendingExperts(experts: IExpert[], limit = 4): IExpert[] {
  const dayKey = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
  const seedNoise = (id: string) => {
    let h = 0;
    const s = `${id}:${dayKey}`;
    for (let i = 0; i < s.length; i++) {
      h = (h * 31 + s.charCodeAt(i)) >>> 0;
    }
    return (h % 1000) / 1000;
  };

  return [...experts]
    .map((expert) => {
      const verified = expert.isVerified ? 1 : 0;
      const exp = Math.min(15, Number(expert.experience ?? 0)) / 15;
      const fee = expert.consultationFee ?? expert.price ?? 0;
      const feeQuality = Math.min(1, fee / 200);
      const score = verified * 0.4 + exp * 0.35 + feeQuality * 0.15 + seedNoise(expert.id) * 0.1;
      return { expert, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, clampLimit(limit))
    .map((s) => s.expert);
}

export function fuzzyMatch(haystack: string, query: string): boolean {
  if (!query) return false;
  const h = haystack.toLowerCase();
  return query
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((token) => h.includes(token));
}
