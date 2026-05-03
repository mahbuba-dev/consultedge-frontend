"use client";

/**
 * useServerDataTable
 * ------------------
 * A reusable hook that bridges TanStack Table's PaginationState with URL
 * search-params.  Pagination position survives page refresh and is
 * shareable via the browser URL.
 *
 * Usage:
 *   const { paginationState, onPaginationChange, queryParams } = useServerDataTable();
 *
 *   useQuery({
 *     queryKey: ["my-table", queryParams],
 *     queryFn: () => myService(queryParams),
 *   });
 *
 *   <DataTable
 *     data={data}
 *     meta={meta}
 *     pagination={{ state: paginationState, onPaginationChange }}
 *   />
 */

import {
  useCallback,
  useMemo,
  useTransition,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { PaginationState, SortingState } from "@tanstack/react-table";

// ----------------------------------------------------------------
// Public types
// ----------------------------------------------------------------
export interface ServerDataTableQueryParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  searchTerm?: string;
  [key: string]: unknown;
}

export interface UseServerDataTableOptions {
  /** Default page size (rows per page). Defaults to 10. */
  defaultPageSize?: number;
  /** URL param name for the page number. Defaults to "page". */
  pageParam?: string;
  /** URL param name for the page size. Defaults to "limit". */
  limitParam?: string;
  /** URL param name for sort field. Defaults to "sortBy". */
  sortByParam?: string;
  /** URL param name for sort direction. Defaults to "sortOrder". */
  sortOrderParam?: string;
}

export interface UseServerDataTableReturn {
  /** TanStack Table compatible PaginationState (0-based pageIndex). */
  paginationState: PaginationState;
  /** Pass this to DataTable's pagination.onPaginationChange prop. */
  onPaginationChange: (state: PaginationState) => void;
  /** TanStack Table compatible SortingState. */
  sortingState: SortingState;
  /** Pass this to DataTable's sorting.onSortingChange prop. */
  onSortingChange: (state: SortingState) => void;
  /**
   * 1-based query params ready to send to the API.
   * Spread these into your useQuery queryKey so React Query
   * automatically refetches when the user changes pages.
   */
  queryParams: ServerDataTableQueryParams;
  /** True while the URL transition is pending. */
  isPending: boolean;
}

// ----------------------------------------------------------------
// Implementation
// ----------------------------------------------------------------
export function useServerDataTable(
  options: UseServerDataTableOptions = {},
): UseServerDataTableReturn {
  const {
    defaultPageSize = 10,
    pageParam = "page",
    limitParam = "limit",
    sortByParam = "sortBy",
    sortOrderParam = "sortOrder",
  } = options;

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // ----------------------------------------------------------------
  // Read current state from URL
  // ----------------------------------------------------------------
  const rawPage = searchParams.get(pageParam);
  const rawLimit = searchParams.get(limitParam);
  const rawSortBy = searchParams.get(sortByParam) ?? undefined;
  const rawSortOrder = searchParams.get(sortOrderParam);

  // page is 1-based in the URL; TanStack Table pageIndex is 0-based.
  const pageIndex = Math.max(0, (parseInt(rawPage ?? "1", 10) || 1) - 1);
  const pageSize = Math.max(1, parseInt(rawLimit ?? String(defaultPageSize), 10) || defaultPageSize);
  const sortOrder =
    rawSortOrder === "asc" || rawSortOrder === "desc" ? rawSortOrder : undefined;

  const paginationState = useMemo<PaginationState>(
    () => ({ pageIndex, pageSize }),
    [pageIndex, pageSize],
  );

  const sortingState = useMemo<SortingState>(() => {
    if (!rawSortBy) return [];
    return [{ id: rawSortBy, desc: sortOrder === "desc" }];
  }, [rawSortBy, sortOrder]);

  // ----------------------------------------------------------------
  // URL updater — preserves all other existing params
  // ----------------------------------------------------------------
  const updateUrl = useCallback(
    (updates: Record<string, string | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());

      for (const [key, value] of Object.entries(updates)) {
        if (value === undefined || value === "") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      }

      startTransition(() => {
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
      });
    },
    [pathname, router, searchParams],
  );

  // ----------------------------------------------------------------
  // Callbacks for DataTable
  // ----------------------------------------------------------------
  const onPaginationChange = useCallback(
    (next: PaginationState) => {
      const updates: Record<string, string | undefined> = {};

      // Convert 0-based pageIndex back to 1-based page number
      updates[pageParam] = String(next.pageIndex + 1);

      if (next.pageSize !== pageSize) {
        updates[limitParam] = String(next.pageSize);
        // Reset to first page whenever limit changes
        updates[pageParam] = "1";
      }

      updateUrl(updates);
    },
    [limitParam, pageParam, pageSize, updateUrl],
  );

  const onSortingChange = useCallback(
    (next: SortingState) => {
      if (next.length === 0) {
        updateUrl({ [sortByParam]: undefined, [sortOrderParam]: undefined, [pageParam]: "1" });
      } else {
        updateUrl({
          [sortByParam]: next[0].id,
          [sortOrderParam]: next[0].desc ? "desc" : "asc",
          [pageParam]: "1",
        });
      }
    },
    [pageParam, sortByParam, sortOrderParam, updateUrl],
  );

  // ----------------------------------------------------------------
  // Query params (1-based page, ready for the API)
  // ----------------------------------------------------------------
  const queryParams = useMemo<ServerDataTableQueryParams>(
    () => ({
      page: pageIndex + 1,
      limit: pageSize,
      ...(rawSortBy ? { sortBy: rawSortBy } : {}),
      ...(sortOrder ? { sortOrder } : {}),
    }),
    [pageIndex, pageSize, rawSortBy, sortOrder],
  );

  return {
    paginationState,
    onPaginationChange,
    sortingState,
    onSortingChange,
    queryParams,
    isPending,
  };
}
