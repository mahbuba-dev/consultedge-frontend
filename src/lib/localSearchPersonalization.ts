export interface RecentExpert {
  id: string;
  name: string;
  industry: string;
}

export interface LocalSearchProfile {
  recentSearches: string[];
  recentlyViewedExperts: RecentExpert[];
  preferredIndustries: string[];
  updatedAt: number;
}

export interface DropdownItem {
  id: string;
  label: string;
  subLabel?: string;
  type: "query" | "industry" | "expert";
}

export interface DropdownSections {
  recentSearches: DropdownItem[];
  trendingNow: DropdownItem[];
}

const STORAGE_KEY = "consultedge:local-ai-search:v1";
const MAX_RECENT_SEARCHES = 5;
const MAX_RECENT_EXPERTS = 5;
const MAX_PREFERRED_INDUSTRIES = 5;

const TRENDING_NOW: DropdownItem[] = [
  {
    id: "trend-growth-marketing",
    label: "Growth marketing playbook for seed-stage SaaS",
    subLabel: "Marketing strategy",
    type: "query",
  },
  {
    id: "trend-finance-pricing",
    label: "Financial model for subscription pricing",
    subLabel: "Finance planning",
    type: "query",
  },
  {
    id: "trend-legal-contracts",
    label: "Startup contract and compliance checklist",
    subLabel: "Legal operations",
    type: "query",
  },
  {
    id: "trend-tech-automation",
    label: "AI workflow automation for support teams",
    subLabel: "Tech operations",
    type: "query",
  },
  {
    id: "trend-fundraising",
    label: "Investor-ready GTM narrative in 30 days",
    subLabel: "Startup growth",
    type: "query",
  },
];

const emptyProfile = (): LocalSearchProfile => ({
  recentSearches: [],
  recentlyViewedExperts: [],
  preferredIndustries: [],
  updatedAt: 0,
});

const isBrowser = () => typeof window !== "undefined";

export function readLocalSearchProfile(): LocalSearchProfile {
  if (!isBrowser()) return emptyProfile();

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyProfile();
    const parsed = JSON.parse(raw) as Partial<LocalSearchProfile>;
    return {
      recentSearches: Array.isArray(parsed.recentSearches)
        ? parsed.recentSearches.slice(0, MAX_RECENT_SEARCHES)
        : [],
      recentlyViewedExperts: Array.isArray(parsed.recentlyViewedExperts)
        ? parsed.recentlyViewedExperts.slice(0, MAX_RECENT_EXPERTS)
        : [],
      preferredIndustries: Array.isArray(parsed.preferredIndustries)
        ? parsed.preferredIndustries.slice(0, MAX_PREFERRED_INDUSTRIES)
        : [],
      updatedAt: Number(parsed.updatedAt ?? 0),
    };
  } catch {
    return emptyProfile();
  }
}

function writeLocalSearchProfile(profile: LocalSearchProfile) {
  if (!isBrowser()) return;

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    window.dispatchEvent(new CustomEvent("consultedge:local-ai-search-updated"));
  } catch {
    // Ignore localStorage quota and private mode failures.
  }
}

export function addRecentSearch(rawQuery: string) {
  const query = rawQuery.trim();
  if (!query) return;

  const profile = readLocalSearchProfile();
  profile.recentSearches = [
    query,
    ...profile.recentSearches.filter(
      (item) => item.toLowerCase() !== query.toLowerCase(),
    ),
  ].slice(0, MAX_RECENT_SEARCHES);
  profile.updatedAt = Date.now();
  writeLocalSearchProfile(profile);
}

export function addRecentlyViewedExpert(expert: RecentExpert) {
  if (!expert?.id || !expert.name || !expert.industry) return;

  const profile = readLocalSearchProfile();
  profile.recentlyViewedExperts = [
    expert,
    ...profile.recentlyViewedExperts.filter((item) => item.id !== expert.id),
  ].slice(0, MAX_RECENT_EXPERTS);

  profile.preferredIndustries = [
    expert.industry,
    ...profile.preferredIndustries.filter(
      (industry) => industry.toLowerCase() !== expert.industry.toLowerCase(),
    ),
  ].slice(0, MAX_PREFERRED_INDUSTRIES);

  profile.updatedAt = Date.now();
  writeLocalSearchProfile(profile);
}

export function addPreferredIndustry(rawIndustry: string) {
  const industry = rawIndustry.trim();
  if (!industry) return;

  const profile = readLocalSearchProfile();
  profile.preferredIndustries = [
    industry,
    ...profile.preferredIndustries.filter(
      (item) => item.toLowerCase() !== industry.toLowerCase(),
    ),
  ].slice(0, MAX_PREFERRED_INDUSTRIES);

  profile.updatedAt = Date.now();
  writeLocalSearchProfile(profile);
}

export function clearRecentSearches() {
  const profile = readLocalSearchProfile();
  profile.recentSearches = [];
  profile.updatedAt = Date.now();
  writeLocalSearchProfile(profile);
}

export function getTrendingNowItems(query = ""): DropdownItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return TRENDING_NOW.slice(0, 5);

  return TRENDING_NOW.filter((item) => {
    const target = `${item.label} ${item.subLabel ?? ""}`.toLowerCase();
    return q
      .split(/\s+/)
      .filter(Boolean)
      .every((token) => target.includes(token));
  }).slice(0, 5);
}

export function buildDropdownSections(query = ""): DropdownSections {
  const profile = readLocalSearchProfile();
  const q = query.trim().toLowerCase();

  const recentSearches = profile.recentSearches
    .filter((item) => (q ? item.toLowerCase().includes(q) : true))
    .slice(0, 5)
    .map((label) => ({
      id: `recent-${label.toLowerCase().replace(/\s+/g, "-")}`,
      label,
      type: "query" as const,
    }));

  const trendingNow = getTrendingNowItems(query);

  return {
    recentSearches,
    trendingNow,
  };
}

export function hasLocalSearchHistory(profile = readLocalSearchProfile()): boolean {
  return (
    profile.recentSearches.length > 0 ||
    profile.recentlyViewedExperts.length > 0 ||
    profile.preferredIndustries.length > 0
  );
}
