"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowUpRight,
  BadgeCheck,
  Clock,
  Flame,
  History,
  Loader2,
  Search,
  Sparkles,
  X,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/src/lib/utils";
import { getExperts } from "@/src/services/expert.services";
import { getAllIndustries } from "@/src/services/industry.services";
import { aiSearch } from "@/src/services/ai.service";
import {
  clearRecentSearches,
  fuzzyMatch,
  getBehavior,
  getTrendingExperts,
  recommendExperts,
  trackExpertView,
  trackSearch,
} from "@/src/lib/aiPersonalization";
import type { IExpert } from "@/src/types/expert.types";
import type { IIndustry } from "@/src/types/industry.types";

interface AISearchBarProps {
  /** Visual variant — "navbar" sits inside the navbar, "mobile" inside the sheet. */
  variant?: "navbar" | "mobile";
  className?: string;
  onNavigate?: () => void;
}

const getInitials = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

export default function AISearchBar({
  variant = "navbar",
  className,
  onNavigate,
}: AISearchBarProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [behaviorTick, setBehaviorTick] = useState(0);

  // Debounce the query so we don't hammer the AI endpoint on every keystroke.
  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedQuery(query.trim()), 220);
    return () => window.clearTimeout(t);
  }, [query]);

  const { data: experts = [] } = useQuery({
    queryKey: ["ai-search-experts"],
    queryFn: async () => {
      try {
        const res = await getExperts();
        return Array.isArray(res?.data) ? res.data : [];
      } catch {
        return [] as IExpert[];
      }
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });

  const { data: industries = [] } = useQuery({
    queryKey: ["ai-search-industries"],
    queryFn: async () => {
      try {
        const res = await getAllIndustries();
        return Array.isArray(res?.data) ? res.data : [];
      } catch {
        return [] as IIndustry[];
      }
    },
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
  });

  // Backend AI search — only fires when there's something meaningful to search.
  const { data: aiSearchResult, isFetching: aiSearching } = useQuery({
    queryKey: ["ai-search", debouncedQuery],
    queryFn: () =>
      aiSearch({
        query: debouncedQuery,
        limit: 5,
        source: "navbar",
      }),
    enabled: debouncedQuery.length >= 2,
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 5,
  });

  // listen for behavior updates so recents refresh after a click
  useEffect(() => {
    const handler = () => setBehaviorTick((t) => t + 1);
    window.addEventListener("consultedge:behavior-updated", handler);
    return () => window.removeEventListener("consultedge:behavior-updated", handler);
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

  const behavior = useMemo(() => getBehavior(), [behaviorTick, open]);

  const trending = useMemo(() => getTrendingExperts(experts, 4), [experts]);
  const personalized = useMemo(
    () => recommendExperts(experts, 4).map((s) => s.expert),
    [experts, behaviorTick],
  );

  const expertMatches = useMemo<IExpert[]>(() => {
    const q = query.trim();
    if (!q) return [];
    // Prefer backend results when available, else heuristic fuzzy match.
    const backend = aiSearchResult?.data?.experts ?? [];
    if (backend.length > 0) return backend.slice(0, 5);
    return experts
      .filter((e) =>
        fuzzyMatch(
          `${e.fullName} ${e.title ?? ""} ${e.industry?.name ?? ""} ${e.bio ?? ""}`,
          q,
        ),
      )
      .slice(0, 5);
  }, [experts, query, aiSearchResult]);

  const industryMatches = useMemo<IIndustry[]>(() => {
    const q = query.trim();
    if (!q) return [];
    return industries
      .filter((ind) => fuzzyMatch(`${ind.name} ${ind.description ?? ""}`, q))
      .slice(0, 3);
  }, [industries, query]);

  const semanticSuggestions = useMemo<string[]>(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];
    // Backend topic suggestions take priority.
    const backend =
      aiSearchResult?.data?.suggestions
        ?.filter((s) => s.type === "topic")
        .map((s) => s.label) ?? [];
    if (backend.length > 0) {
      return Array.from(new Set(backend))
        .filter((s) => s.toLowerCase() !== q)
        .slice(0, 3);
    }
    const seeds: string[] = [];
    industries.forEach((ind) => {
      if (fuzzyMatch(ind.name, q)) {
        seeds.push(`${ind.name} experts`);
        seeds.push(`Top-rated ${ind.name.toLowerCase()} consultants`);
      }
    });
    if (seeds.length === 0) {
      seeds.push(`${query} expert`, `${query} consultant`, `${query} advisor`);
    }
    return Array.from(new Set(seeds))
      .filter((s) => s.toLowerCase() !== q)
      .slice(0, 3);
  }, [industries, query, aiSearchResult]);

  // flatten everything into a navigable list of items for arrow-keys
  type Row =
    | { kind: "suggestion"; label: string }
    | { kind: "expert"; expert: IExpert }
    | { kind: "industry"; industry: IIndustry }
    | { kind: "recent"; label: string };

  const rows: Row[] = useMemo(() => {
    if (query.trim()) {
      return [
        ...semanticSuggestions.map<Row>((label) => ({ kind: "suggestion", label })),
        ...expertMatches.map<Row>((expert) => ({ kind: "expert", expert })),
        ...industryMatches.map<Row>((industry) => ({ kind: "industry", industry })),
      ];
    }
    return [
      ...behavior.recentSearches.map<Row>((label) => ({ kind: "recent", label })),
      ...(personalized.length ? personalized : trending).map<Row>((expert) => ({
        kind: "expert",
        expert,
      })),
    ];
  }, [
    query,
    semanticSuggestions,
    expertMatches,
    industryMatches,
    behavior.recentSearches,
    personalized,
    trending,
  ]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query, open]);

  const goTo = (path: string, opts?: { search?: string; expert?: IExpert }) => {
    if (opts?.search) trackSearch(opts.search);
    if (opts?.expert) trackExpertView(opts.expert);
    setOpen(false);
    setQuery("");
    onNavigate?.();
    router.push(path);
  };

  const submitFreeText = (raw: string) => {
    const q = raw.trim();
    if (!q) return;
    trackSearch(q);
    setOpen(false);
    setQuery("");
    onNavigate?.();
    router.push(`/experts?q=${encodeURIComponent(q)}`);
  };

  const handleRowActivate = (row: Row) => {
    switch (row.kind) {
      case "expert":
        return goTo(`/experts/${row.expert.id}`, { expert: row.expert });
      case "industry":
        return goTo(`/industries`, { search: row.industry.name });
      case "suggestion":
      case "recent":
        return submitFreeText(row.label);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActiveIndex((i) => Math.min(rows.length - 1, i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(0, i - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const row = rows[activeIndex];
      if (row) handleRowActivate(row);
      else submitFreeText(query);
    } else if (e.key === "Escape") {
      setOpen(false);
      inputRef.current?.blur();
    }
  };

  const sectionLabel = (icon: React.ReactNode, label: string, action?: React.ReactNode) => (
    <div className="flex items-center justify-between px-3 pb-1.5 pt-3 first:pt-2">
      <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {icon}
        {label}
      </div>
      {action}
    </div>
  );

  // --- track which absolute row index each rendered item maps to ---
  let rowCursor = 0;
  const nextIdx = () => rowCursor++;

  const renderRow = (
    idx: number,
    children: React.ReactNode,
    onClick: () => void,
    key: string,
  ) => (
    <button
      key={key}
      type="button"
      onMouseEnter={() => setActiveIndex(idx)}
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 px-3 py-2 text-left text-sm transition-colors",
        idx === activeIndex
          ? "bg-cyan-50 text-foreground dark:bg-cyan-500/10"
          : "hover:bg-slate-50 dark:hover:bg-white/5",
      )}
    >
      {children}
    </button>
  );

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
            {aiSearching ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <X className="size-3.5" />
            )}
          </button>
        ) : !isMobile ? (
          <kbd className="hidden rounded border border-slate-200/70 bg-slate-50 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground dark:border-white/10 dark:bg-slate-800 md:inline-block">
            /
          </kbd>
        ) : null}
      </div>

      {open ? (
        <div
          id="ai-search-listbox"
          role="listbox"
          className={cn(
            "absolute z-60 mt-2 w-full overflow-hidden rounded-2xl border border-slate-200/80 bg-white/95 shadow-[0_24px_60px_-24px_rgba(15,23,42,0.45)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/95",
            isMobile ? "max-h-[60vh]" : "max-h-[70vh] min-w-88 md:w-104",
          )}
        >
          <div className="max-h-[inherit] overflow-y-auto">
            {/* Empty-state ribbon */}
            <div className="flex items-center gap-2 border-b border-slate-100 bg-linear-to-r from-cyan-50 via-white to-blue-50 px-3 py-2 text-[11px] font-medium text-cyan-800 dark:border-white/10 dark:from-cyan-500/10 dark:via-slate-950 dark:to-blue-500/10 dark:text-cyan-200">
              <Sparkles className="size-3" />
              {query
                ? "AI suggestions tailored to your query"
                : behavior.recentSearches.length || personalized.length
                ? "Picks based on your activity"
                : "Trending on ConsultEdge"}
            </div>

            {!query && behavior.recentSearches.length > 0 ? (
              <>
                {sectionLabel(
                  <History className="size-3" />,
                  "Recent searches",
                  <button
                    type="button"
                    onClick={() => {
                      clearRecentSearches();
                      setBehaviorTick((t) => t + 1);
                    }}
                    className="text-[10px] font-medium text-muted-foreground hover:text-foreground"
                  >
                    Clear
                  </button>,
                )}
                {behavior.recentSearches.map((label) => {
                  const idx = nextIdx();
                  return renderRow(
                    idx,
                    <>
                      <Clock className="size-3.5 text-muted-foreground" />
                      <span className="flex-1 truncate">{label}</span>
                      <ArrowUpRight className="size-3.5 text-muted-foreground" />
                    </>,
                    () => submitFreeText(label),
                    `recent-${label}`,
                  );
                })}
              </>
            ) : null}

            {query && semanticSuggestions.length > 0 ? (
              <>
                {sectionLabel(<Sparkles className="size-3" />, "Suggested searches")}
                {semanticSuggestions.map((label) => {
                  const idx = nextIdx();
                  return renderRow(
                    idx,
                    <>
                      <Search className="size-3.5 text-cyan-600 dark:text-cyan-300" />
                      <span className="flex-1 truncate">{label}</span>
                      <ArrowUpRight className="size-3.5 text-muted-foreground" />
                    </>,
                    () => submitFreeText(label),
                    `sug-${label}`,
                  );
                })}
              </>
            ) : null}

            {(query ? expertMatches : personalized.length ? personalized : trending).length > 0 ? (
              <>
                {sectionLabel(
                  query ? (
                    <Search className="size-3" />
                  ) : personalized.length ? (
                    <Sparkles className="size-3" />
                  ) : (
                    <Flame className="size-3" />
                  ),
                  query
                    ? "Experts"
                    : personalized.length
                    ? "Recommended for you"
                    : "Trending experts",
                )}
                {(query ? expertMatches : personalized.length ? personalized : trending).map(
                  (expert) => {
                    const idx = nextIdx();
                    return renderRow(
                      idx,
                      <>
                        <Avatar size="default" className="size-8 border border-slate-200 dark:border-white/10">
                          {expert.profilePhoto ? (
                            <AvatarImage src={expert.profilePhoto} alt={expert.fullName} />
                          ) : null}
                          <AvatarFallback className="text-[10px]">
                            {getInitials(expert.fullName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <p className="truncate text-sm font-medium text-foreground">
                              {expert.fullName}
                            </p>
                            {expert.isVerified ? (
                              <BadgeCheck className="size-3 shrink-0 text-cyan-600 dark:text-cyan-300" />
                            ) : null}
                          </div>
                          <p className="truncate text-[11px] text-muted-foreground">
                            {expert.title}
                            {expert.industry?.name ? ` · ${expert.industry.name}` : ""}
                          </p>
                        </div>
                      </>,
                      () => goTo(`/experts/${expert.id}`, { expert }),
                      `exp-${expert.id}`,
                    );
                  },
                )}
              </>
            ) : null}

            {query && industryMatches.length > 0 ? (
              <>
                {sectionLabel(<Badge className="h-3 rounded-sm px-1 text-[8px]">i</Badge>, "Industries")}
                {industryMatches.map((industry) => {
                  const idx = nextIdx();
                  return renderRow(
                    idx,
                    <>
                      <span className="flex size-7 items-center justify-center rounded-full bg-linear-to-br from-blue-500 to-cyan-400 text-[10px] font-semibold text-white">
                        {industry.name.slice(0, 2).toUpperCase()}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">{industry.name}</p>
                        {industry.description ? (
                          <p className="truncate text-[11px] text-muted-foreground">
                            {industry.description}
                          </p>
                        ) : null}
                      </div>
                    </>,
                    () => goTo(`/industries`, { search: industry.name }),
                    `ind-${industry.id}`,
                  );
                })}
              </>
            ) : null}

            {query && rows.length === 0 ? (
              <div className="flex flex-col items-center gap-2 px-4 py-6 text-center">
                <Search className="size-5 text-muted-foreground" />
                <p className="text-sm text-foreground">No matches yet</p>
                <p className="text-xs text-muted-foreground">
                  Try “marketing strategy”, “fintech”, or browse all experts.
                </p>
                <Button asChild size="sm" variant="outline" className="mt-1 rounded-full text-xs">
                  <Link href="/experts" onClick={() => setOpen(false)}>
                    Browse experts
                  </Link>
                </Button>
              </div>
            ) : null}

            <div className="flex items-center justify-between border-t border-slate-100 px-3 py-2 text-[10px] text-muted-foreground dark:border-white/10">
              <span className="flex items-center gap-1">
                <kbd className="rounded border border-slate-200/70 bg-slate-50 px-1 dark:border-white/10 dark:bg-slate-800">
                  ↑
                </kbd>
                <kbd className="rounded border border-slate-200/70 bg-slate-50 px-1 dark:border-white/10 dark:bg-slate-800">
                  ↓
                </kbd>
                navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="rounded border border-slate-200/70 bg-slate-50 px-1 dark:border-white/10 dark:bg-slate-800">
                  Enter
                </kbd>
                open
              </span>
              <span className="flex items-center gap-1">
                <Sparkles className="size-3 text-cyan-500" />
                AI ranking
              </span>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
