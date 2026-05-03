import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

import type { SearchDropdownItem } from "@/components/AI/local-search/types";

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function resolveSearchResultHref(item: SearchDropdownItem): string {
  if (item.type === "recent") {
    return `/search?q=${encodeURIComponent(item.label)}`;
  }

  if (item.type === "expert") {
    return `/experts/${item.id}`;
  }

  if (item.type === "industry") {
    return `/industries/${item.id}`;
  }

  if (item.type === "testimonial") {
    const expertId = item.expertId?.trim();
    if (expertId) {
      return `/experts/${expertId}#testimonials`;
    }
    return `/search?q=${encodeURIComponent(item.label)}`;
  }

  const slug = item.slug?.trim() || slugify(item.label);
  return `/trending/${slug || item.id}`;
}

export function routeSearchResult(router: AppRouterInstance, item: SearchDropdownItem) {
  router.push(resolveSearchResultHref(item));
}

export function resolveDirectMatchResult(
  query: string,
  experts: SearchDropdownItem[],
): SearchDropdownItem | null {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return null;

  const exactMatch = experts.find(
    (expert) => expert.label.trim().toLowerCase() === normalizedQuery,
  );
  if (exactMatch) return exactMatch;

  if (experts.length === 1) {
    return experts[0];
  }

  const topExpert = experts[0];
  if (topExpert && typeof topExpert.matchScore === "number" && topExpert.matchScore > 0.9) {
    return topExpert;
  }

  return null;
}

export function routeDirectMatchOrResults(args: {
  router: AppRouterInstance;
  query: string;
  experts: SearchDropdownItem[];
}) {
  const directMatch = resolveDirectMatchResult(args.query, args.experts);
  if (directMatch) {
    routeSearchResult(args.router, directMatch);
    return true;
  }

  args.router.push(`/search?q=${encodeURIComponent(args.query.trim())}`);
  return false;
}
