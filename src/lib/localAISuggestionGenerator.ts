import {
  type DropdownItem,
  hasLocalSearchHistory,
  readLocalSearchProfile,
} from "@/src/lib/localSearchPersonalization";

const DEFAULT_AI_SUGGESTIONS: DropdownItem[] = [
  {
    id: "default-marketing-01",
    label: "How can we reduce CAC while scaling paid acquisition?",
    subLabel: "AI thinks: prioritize channel mix and creative velocity",
    type: "query",
  },
  {
    id: "default-finance-01",
    label: "Build a 12-month runway plan with lean hiring assumptions",
    subLabel: "AI thinks: optimize burn multiple before expansion",
    type: "query",
  },
  {
    id: "default-legal-01",
    label: "What legal safeguards should a startup set before enterprise deals?",
    subLabel: "AI thinks: contracts, data policy, and liability limits",
    type: "query",
  },
  {
    id: "default-tech-01",
    label: "Where should we add AI automation in customer onboarding?",
    subLabel: "AI thinks: map friction points and handoff moments",
    type: "query",
  },
  {
    id: "default-startup-01",
    label: "How do we validate product-market fit before Series A?",
    subLabel: "AI thinks: retention cohorts and buyer interviews",
    type: "query",
  },
  {
    id: "default-pricing-01",
    label: "Design a value-based pricing strategy for B2B SaaS",
    subLabel: "AI thinks: package by outcomes, not feature volume",
    type: "query",
  },
];

function withQueryContext(item: DropdownItem, query: string): DropdownItem {
  const q = query.trim();
  if (!q) return item;

  return {
    ...item,
    subLabel: `AI context: aligned with \"${q}\"`,
  };
}

export function getAISuggestionMessage(): string {
  return "Not sure what to search? Try these:";
}

export function generateAISuggestions(query = ""): DropdownItem[] {
  const profile = readLocalSearchProfile();

  if (!hasLocalSearchHistory(profile)) {
    return DEFAULT_AI_SUGGESTIONS.slice(0, 5).map((item) =>
      withQueryContext(item, query),
    );
  }

  const suggestions: DropdownItem[] = [];
  const latestSearch = profile.recentSearches[0];
  const latestIndustry = profile.preferredIndustries[0];
  const latestExpert = profile.recentlyViewedExperts[0];

  if (latestSearch) {
    suggestions.push({
      id: "dynamic-continue-search",
      label: `Continue your search: ${latestSearch}`,
      subLabel: "AI thinks: pick up where you left off",
      type: "query",
    });
  }

  if (latestIndustry) {
    suggestions.push({
      id: "dynamic-industry",
      label: `Experts in ${latestIndustry} you may like`,
      subLabel: "AI thinks: aligned with your preferred industry",
      type: "industry",
    });
  }

  if (latestExpert) {
    suggestions.push({
      id: "dynamic-similar-expert",
      label: `Similar to ${latestExpert.name}`,
      subLabel: "AI thinks: related profile and advisory style",
      type: "expert",
    });
  }

  suggestions.push(
    {
      id: "dynamic-top-rated",
      label: "Explore top-rated experts",
      subLabel: "AI thinks: high-confidence recommendations",
      type: "query",
    },
    {
      id: "dynamic-growth-focus",
      label: "Create a growth strategy sprint for next quarter",
      subLabel: "AI thinks: combines marketing, finance, and execution",
      type: "query",
    },
    {
      id: "dynamic-risk-planning",
      label: "Plan legal and compliance risk before expansion",
      subLabel: "AI thinks: reduce hidden execution blockers",
      type: "query",
    },
  );

  const deduped: DropdownItem[] = [];
  const seen = new Set<string>();

  for (const item of suggestions) {
    const signature = item.label.toLowerCase();
    if (seen.has(signature)) continue;
    seen.add(signature);
    deduped.push(withQueryContext(item, query));
  }

  return deduped.slice(0, 5);
}
