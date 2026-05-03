"use client";

import { useRouter } from "next/navigation";

import type { SearchDropdownItem } from "@/components/AI/local-search/types";
import {
  routeDirectMatchOrResults,
  routeSearchResult,
} from "@/src/lib/searchResultRouter";

export function useSearchResultRouter() {
  const router = useRouter();

  return {
    routeResult: (item: SearchDropdownItem) => routeSearchResult(router, item),
    routeDirectMatchOrResults: (query: string, experts: SearchDropdownItem[]) =>
      routeDirectMatchOrResults({ router, query, experts }),
  };
}

export default function SearchResultRouter() {
  return null;
}
