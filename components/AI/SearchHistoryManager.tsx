"use client";

import {
  addSearchHistory,
  clearSearchHistory,
  readSearchHistory,
  syncSearchHistoryFromBackend,
} from "@/src/lib/searchHistoryManager";

export function useSearchHistoryManager() {
  return {
    read: readSearchHistory,
    add: addSearchHistory,
    clear: clearSearchHistory,
    syncFromBackend: syncSearchHistoryFromBackend,
  };
}

export default function SearchHistoryManager() {
  return null;
}
