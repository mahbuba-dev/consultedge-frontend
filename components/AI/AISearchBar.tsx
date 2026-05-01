"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { Search, Sparkles, X } from "lucide-react";

import SearchDropdown from "@/components/AI/local-search/SearchDropdown";
import { cn } from "@/src/lib/utils";
import {
  addPreferredIndustry,
  addRecentSearch,
  addRecentlyViewedExpert,
  buildDropdownSections,
  clearRecentSearches,
  readLocalSearchProfile,
  type DropdownItem,
} from "@/src/lib/localSearchPersonalization";
import {
  generateAISuggestions,
} from "@/src/lib/localAISuggestionGenerator";

interface AISearchBarProps {
  /** Visual variant — "navbar" sits inside the navbar, "mobile" inside the sheet. */
  variant?: "navbar" | "mobile";
  className?: string;
  onNavigate?: () => void;
}

const RECENT_FALLBACK_ITEMS: DropdownItem[] = [
  {
    id: "recent-fallback-1",
    label: "Try: marketing strategy for B2B launch",
    subLabel: "No recent searches yet",
    type: "query",
  },
  {
    id: "recent-fallback-2",
    label: "Try: startup financial planning template",
    subLabel: "No recent searches yet",
    type: "query",
  },
  {
    id: "recent-fallback-3",
    label: "Try: legal checklist before fundraising",
    subLabel: "No recent searches yet",
    type: "query",
  },
];

const TRENDING_FALLBACK_ITEMS: DropdownItem[] = [
  {
    id: "trending-fallback-1",
    label: "GTM roadmap for a niche SaaS product",
    subLabel: "Trending business query",
    type: "query",
  },
  {
    id: "trending-fallback-2",
    label: "Finance KPIs founders should track weekly",
    subLabel: "Trending business query",
    type: "query",
  },
  {
    id: "trending-fallback-3",
    label: "Scaling engineering without delivery slowdown",
    subLabel: "Trending business query",
    type: "query",
  },
];

function ensureMinItems(
  items: DropdownItem[],
  fallbacks: DropdownItem[],
  min = 3,
  max = 5,
): DropdownItem[] {
  const combined = [...items];
  if (combined.length < min) {
    for (const fallback of fallbacks) {
      if (combined.some((item) => item.label === fallback.label)) continue;
      combined.push(fallback);
      if (combined.length >= min) break;
    }
  }
  return combined.slice(0, max);
}

export default function AISearchBar({
  variant = "navbar",
  className,
  onNavigate,
}: AISearchBarProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [profileTick, setProfileTick] = useState(0);

  useEffect(() => {
    const handler = () => setProfileTick((t) => t + 1);
    window.addEventListener("consultedge:local-ai-search-updated", handler);
    return () =>
      window.removeEventListener("consultedge:local-ai-search-updated", handler);
  }, []);

  // close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // global "/" shortcut to focus
  useEffect(() => {
    if (variant !== "navbar") return;
    const handler = (e: KeyboardEvent) => {
      if (e.key !== "/" || e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName?.toLowerCase();
      if (tag === "input" || tag === "textarea" || target?.isContentEditable) return;
      e.preventDefault();
      inputRef.current?.focus();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [variant]);

  const profile = useMemo(() => readLocalSearchProfile(), [profileTick, open]);

  const sections = useMemo(() => buildDropdownSections(query), [query, profileTick]);

  const aiSuggestions = useMemo(() => generateAISuggestions(query), [query, profileTick]);

  const recentItems = useMemo(() => {
    if (sections.recentSearches.length >= 3) {
      return sections.recentSearches.slice(0, 5);
    }

    const fallback = profile.recentlyViewedExperts.map((expert) => ({
      id: `recent-expert-${expert.id}`,
      label: `Similar to ${expert.name}`,
      subLabel: `Recently viewed in ${expert.industry}`,
      type: "expert" as const,
    }));

    return [...sections.recentSearches, ...fallback].slice(0, 5);
  }, [sections.recentSearches, profile.recentlyViewedExperts]);

  const trendingItems = useMemo(() => {
    return ensureMinItems(sections.trendingNow, TRENDING_FALLBACK_ITEMS);
  }, [sections.trendingNow]);

  const aiItems = useMemo(() => {
    const base = aiSuggestions;

    if (base.length >= 3) return base.slice(0, 5);

    const extraFromIndustry = profile.preferredIndustries.map((industry) => ({
      id: `ai-industry-${industry.toLowerCase().replace(/\s+/g, "-")}`,
      label: `Experts in ${industry} you may like`,
      subLabel: "AI thinks: local personalization detected this preference",
      type: "industry" as const,
    }));

    return ensureMinItems(
      [...base, ...extraFromIndustry],
      generateAISuggestions(),
    );
  }, [aiSuggestions, profile.preferredIndustries]);

  const safeRecentItems = useMemo(() => {
    return ensureMinItems(recentItems, RECENT_FALLBACK_ITEMS);
  }, [recentItems]);

  const allItems = useMemo(
    () => [...recentItems, ...trendingItems, ...aiItems],
    [recentItems, trendingItems, aiItems],
  );

  useEffect(() => {
    setActiveIndex(0);
  }, [query, open]);

  const goTo = (path: string) => {
    setOpen(false);
    setQuery("");
    onNavigate?.();
    router.push(path);
  };

  const submitQuery = (raw: string) => {
    const q = raw.trim();
    if (!q) return;
    addRecentSearch(q);
    setOpen(false);
    setQuery("");
    onNavigate?.();
    router.push(`/experts?q=${encodeURIComponent(q)}`);
  };

  const handleItemActivate = (item: DropdownItem) => {
    if (item.type === "industry") {
      const industry = item.label.replace(/^Experts in\s+/i, "").replace(/\s+you may like$/i, "");
      addPreferredIndustry(industry || item.label);
      return goTo(`/experts?industry=${encodeURIComponent(industry || item.label)}`);
    }

    if (item.type === "expert") {
      const expertName = item.label.replace(/^Similar to\s+/i, "").trim();
      if (expertName) {
        const known = profile.recentlyViewedExperts.find(
          (expert) => expert.name.toLowerCase() === expertName.toLowerCase(),
        );
        if (known) {
          addRecentlyViewedExpert(known);
        }
      }
      return submitQuery(expertName || item.label);
    }

    return submitQuery(item.label);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActiveIndex((i) => Math.min(allItems.length - 1, i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(0, i - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const item = allItems[activeIndex];
      if (item) handleItemActivate(item);
      else submitQuery(query);
    } else if (e.key === "Escape") {
      setOpen(false);
      inputRef.current?.blur();
    }
  };

  const isMobile = variant === "mobile";

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
          placeholder={isMobile ? "Search experts, industries…" : "Search experts, industries…"}
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          aria-label="AI-powered search"
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
            aria-label="Clear"
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
        recentItems={safeRecentItems}
        trendingItems={trendingItems}
        aiItems={ensureMinItems(aiItems, generateAISuggestions(), 3, 5)}
        activeIndex={activeIndex}
        onHover={setActiveIndex}
        onSelect={handleItemActivate}
        onClearRecents={() => {
          clearRecentSearches();
          setProfileTick((t) => t + 1);
        }}
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
            100% local AI suggestions
          </span>
        </div>
      ) : null}
    </div>
  );
}
