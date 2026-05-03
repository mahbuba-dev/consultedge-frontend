"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { Search, Sparkles, X } from "lucide-react";

import SearchDropdown from "@/components/AI/local-search/SearchDropdown";
import type { SearchDropdownItem } from "@/components/AI/local-search/types";
import { useSearchHistoryManager } from "@/components/AI/SearchHistoryManager";
import { useSearchResultRouter } from "@/components/AI/SearchResultRouter";
import { useDebounce } from "@/hooks/use-mobile";
import { useSearch } from "@/src/hooks/useSearch";
import { cn } from "@/src/lib/utils";
import {
  trackCategoryClick,
  trackIndustryExplore,
  trackSearch,
} from "@/src/lib/aiPersonalization";

interface SearchBarProps {
  variant?: "navbar" | "mobile";
  className?: string;
  onNavigate?: () => void;
}

export default function SearchBar({
  variant = "navbar",
  className,
  onNavigate,
}: SearchBarProps) {
  const router = useRouter();
  const historyManager = useSearchHistoryManager();
  const { routeResult, routeDirectMatchOrResults } = useSearchResultRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const debouncedQuery = useDebounce(query, 300);

  const {
    isSearching,
    recentSearches,
    trending,
    aiSuggestions,
    topMatches,
    grouped,
  } = useSearch({ query: debouncedQuery, open });

  const allItems = useMemo(
    () => [...recentSearches, ...topMatches, ...trending, ...aiSuggestions],
    [recentSearches, topMatches, trending, aiSuggestions],
  );

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  useEffect(() => {
    if (variant !== "navbar") return;

    const handler = (e: KeyboardEvent) => {
      if (e.key !== "/" || e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName?.toLowerCase();
      if (tag === "input" || tag === "textarea" || target?.isContentEditable) return;
      e.preventDefault();
      inputRef.current?.focus();
      setOpen(true);
    };

    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [variant]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query, open, recentSearches, topMatches, trending, aiSuggestions]);

  const closeAndReset = () => {
    setOpen(false);
    setQuery("");
    onNavigate?.();
  };

  const submitQuery = (value: string) => {
    const normalized = value.trim();
    if (!normalized) return;

    historyManager.add(normalized);
    trackSearch(normalized);
    closeAndReset();

    if (debouncedQuery.trim().toLowerCase() === normalized.toLowerCase()) {
      routeDirectMatchOrResults(normalized, grouped.experts);
      return;
    }

    router.push(`/search?q=${encodeURIComponent(normalized)}`);
  };

  const onSelectItem = (item: SearchDropdownItem) => {
    if (item.type === "industry") {
      trackCategoryClick(item.label);
      trackIndustryExplore(item.label);
    }

    if (item.type === "recent") {
      return submitQuery(item.label);
    }

    if (item.type === "trending") {
      historyManager.add(item.label);
      trackSearch(item.label);
    }

    closeAndReset();
    routeResult(item);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActiveIndex((value) => Math.min(Math.max(allItems.length - 1, 0), value + 1));
      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((value) => Math.max(0, value - 1));
      return;
    }

    if (e.key === "Enter") {
      e.preventDefault();
      const selected = allItems[activeIndex];
      if (selected) {
        onSelectItem(selected);
      } else {
        submitQuery(query);
      }
      return;
    }

    if (e.key === "Escape") {
      setOpen(false);
      inputRef.current?.blur();
    }
  };

  const isMobile = variant === "mobile";
  const hasLiveResults =
    topMatches.length > 0 || trending.length > 0 || aiSuggestions.length > 0;

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      <div
        className={cn(
          "group flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/80 px-3 backdrop-blur transition-all",
          "focus-within:border-cyan-400 focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(34,211,238,0.15)]",
          "dark:border-white/10 dark:bg-slate-900/70 dark:focus-within:bg-slate-900",
          isMobile ? "h-10" : "h-9",
        )}
      >
        <Search className="size-4 shrink-0 text-muted-foreground" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search experts, industries..."
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          aria-label="Universal AI search"
          aria-expanded={open}
          aria-controls="ai-search-listbox"
          role="combobox"
        />
        {query ? (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              inputRef.current?.focus();
            }}
            className="rounded-full p-0.5 text-muted-foreground hover:bg-slate-100 hover:text-foreground dark:hover:bg-white/10"
            aria-label="Clear search"
          >
            <X className="size-3.5" />
          </button>
        ) : !isMobile ? (
          <kbd className="hidden rounded border border-slate-200/70 bg-slate-50 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground dark:border-white/10 dark:bg-slate-800 md:inline-block">
            /
          </kbd>
        ) : null}
      </div>

      <SearchDropdown
        open={open}
        recentItems={recentSearches}
        topMatches={topMatches}
        trendingItems={trending}
        aiItems={aiSuggestions}
        activeIndex={activeIndex}
        onHover={setActiveIndex}
        onSelect={onSelectItem}
        onClearRecents={historyManager.clear}
        isLoading={isSearching}
        isLiveAI={hasLiveResults}
      />

      {open ? (
        <div className="mt-1.5 flex items-center justify-between px-1 text-[10px] text-slate-500 dark:text-slate-400">
          <span className="inline-flex items-center gap-1">
            <kbd className="rounded border border-slate-200/70 bg-slate-50 px-1 dark:border-white/10 dark:bg-slate-800">
              ↑
            </kbd>
            <kbd className="rounded border border-slate-200/70 bg-slate-50 px-1 dark:border-white/10 dark:bg-slate-800">
              ↓
            </kbd>
            navigate
          </span>
          <span className="inline-flex items-center gap-1 text-blue-700 dark:text-blue-300">
            <Sparkles className="size-3" />
            Universal DB search
          </span>
        </div>
      ) : null}
    </div>
  );
}
