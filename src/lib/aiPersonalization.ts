/**
 * Lightweight on-device personalization engine.
 *
 * Tracks user behavior in localStorage (no cookies, no backend) so we can
 * deliver AI-flavored features without yet wiring a server. The data shape
 * is forward-compatible with a future /api/v1/recommendations endpoint —
 * swap `recommendExperts` to a server call and the rest still works.
 */

import type { IExpert } from "@/src/types/expert.types";

const STORAGE_KEY = "consultedge:behavior:v1";
const MAX_RECENT_SEARCHES = 8;
const MAX_RECENT_VIEWS = 16;
/** Each new view multiplies older weights by this factor (gentle exponential decay). */
const WEIGHT_DECAY = 0.94;

export interface BehaviorState {
  industryWeights: Record<string, number>;
  recentSearches: string[];
  recentExpertIds: string[];
  updatedAt: number;
}

const empty = (): BehaviorState => ({
  industryWeights: {},
  recentSearches: [],
  recentExpertIds: [],
  updatedAt: 0,
});

const isBrowser = () => typeof window !== "undefined" && !!window.localStorage;

function read(): BehaviorState {
  if (!isBrowser()) return empty();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return empty();
    const parsed = JSON.parse(raw) as Partial<BehaviorState>;
    return {
      industryWeights: parsed.industryWeights ?? {},
      recentSearches: parsed.recentSearches ?? [],
      recentExpertIds: parsed.recentExpertIds ?? [],
      updatedAt: parsed.updatedAt ?? 0,
    };
  } catch {
    return empty();
  }
}

function write(state: BehaviorState) {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    window.dispatchEvent(new CustomEvent("consultedge:behavior-updated"));
  } catch {
    /* quota / private mode — silently ignore */
  }
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

export function trackExpertView(expert: Pick<IExpert, "id" | "industryId" | "industry">) {
  if (!expert?.id) return;
  const state = read();

  // decay all existing industry weights
  for (const key of Object.keys(state.industryWeights)) {
    state.industryWeights[key] = state.industryWeights[key] * WEIGHT_DECAY;
  }

  const industryKey = expert.industry?.id ?? expert.industryId;
  if (industryKey) {
    state.industryWeights[industryKey] =
      (state.industryWeights[industryKey] ?? 0) + 1;
  }

  state.recentExpertIds = [
    expert.id,
    ...state.recentExpertIds.filter((id) => id !== expert.id),
  ].slice(0, MAX_RECENT_VIEWS);

  state.updatedAt = Date.now();
  write(state);
}

export interface ScoredExpert {
  expert: IExpert;
  score: number;
  reason: string;
}

/** Returns true when the user has *any* personalization signal. */
export function hasPersonalSignal(state: BehaviorState = read()): boolean {
  return (
    Object.keys(state.industryWeights).length > 0 ||
    state.recentExpertIds.length > 0
  );
}

/**
 * Score experts using viewed-industry weights + a baseline quality signal
 * (verified, experience). Returns a stable, sorted list.
 */
export function scoreExperts(
  experts: IExpert[],
  state: BehaviorState = read(),
): ScoredExpert[] {
  const weights = state.industryWeights;
  const recent = new Set(state.recentExpertIds.slice(0, 4));
  const totalWeight =
    Object.values(weights).reduce((sum, w) => sum + w, 0) || 1;

  return experts
    .map((expert) => {
      const industryId = expert.industry?.id ?? expert.industryId;
      const affinity = industryId ? (weights[industryId] ?? 0) / totalWeight : 0;

      // quality baseline (0..1)
      const verifiedBoost = expert.isVerified ? 0.18 : 0;
      const expBoost = Math.min(0.22, Number(expert.experience ?? 0) * 0.022);

      // soft penalty so we don't immediately re-show the last expert
      const recentPenalty = recent.has(expert.id) ? -0.25 : 0;

      const score = affinity * 1.0 + verifiedBoost + expBoost + recentPenalty;

      let reason = "Editor's pick";
      if (affinity > 0.05 && expert.industry?.name) {
        reason = `Because you explored ${expert.industry.name}`;
      } else if (expert.isVerified) {
        reason = "Verified specialist";
      } else if ((expert.experience ?? 0) >= 8) {
        reason = `${expert.experience}+ yrs of experience`;
      }

      return { expert, score, reason };
    })
    .sort((a, b) => b.score - a.score);
}

export function recommendExperts(experts: IExpert[], limit = 4): ScoredExpert[] {
  return scoreExperts(experts).slice(0, limit);
}

/**
 * Trending = quality signal + a tiny day-stable noise so the ordering rotates
 * naturally without ever shuffling on every render.
 */
export function getTrendingExperts(experts: IExpert[], limit = 4): IExpert[] {
  const dayKey = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
  const seedNoise = (id: string) => {
    let h = 0;
    const s = `${id}:${dayKey}`;
    for (let i = 0; i < s.length; i++) {
      h = (h * 31 + s.charCodeAt(i)) >>> 0;
    }
    return (h % 1000) / 1000; // 0..1
  };

  return [...experts]
    .map((expert) => {
      const verified = expert.isVerified ? 1 : 0;
      const exp = Math.min(15, Number(expert.experience ?? 0)) / 15;
      const fee = expert.consultationFee ?? expert.price ?? 0;
      const feeQuality = Math.min(1, fee / 200); // higher fee → tends to be senior
      const score =
        verified * 0.4 + exp * 0.35 + feeQuality * 0.15 + seedNoise(expert.id) * 0.1;
      return { expert, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((s) => s.expert);
}

/**
 * Lightweight fuzzy match used by the search bar. Matches if every word in the
 * query appears as a substring (case-insensitive) inside the haystack.
 */
export function fuzzyMatch(haystack: string, query: string): boolean {
  if (!query) return false;
  const h = haystack.toLowerCase();
  return query
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((token) => h.includes(token));
}
