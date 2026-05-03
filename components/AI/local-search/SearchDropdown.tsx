"use client";

import { AnimatePresence, motion } from "framer-motion";
import { History, Sparkles, TrendingUp, Zap } from "lucide-react";

import SuggestionList from "@/components/AI/local-search/SuggestionList";
import type { SearchDropdownItem } from "@/components/AI/local-search/types";
import { Button } from "@/components/ui/button";

interface SearchDropdownProps {
  open: boolean;
  recentItems: SearchDropdownItem[];
  topMatches: SearchDropdownItem[];
  trendingItems: SearchDropdownItem[];
  aiItems: SearchDropdownItem[];
  activeIndex: number;
  onHover: (absoluteIndex: number) => void;
  onSelect: (item: SearchDropdownItem) => void;
  onClearRecents: () => void;
  /** True while AI endpoints are fetching. */
  isLoading?: boolean;
  /** True when at least one live AI result has arrived from the backend. */
  isLiveAI?: boolean;
}

const sectionHeaderClass =
  "flex items-center justify-between px-3 pb-1.5 pt-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400";

/** Skeleton row shown while the AI section is loading. */
function AISkeleton() {
  return (
    <div className="space-y-1 px-2 pb-2" aria-label="Loading AI suggestions">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="flex items-center gap-2.5 rounded-xl px-2.5 py-2"
        >
          <div className="size-3.5 shrink-0 animate-pulse rounded-full bg-blue-200/60 dark:bg-blue-500/20" />
          <div className="flex-1 space-y-1.5">
            <div
              className="h-3 animate-pulse rounded-full bg-slate-200/80 dark:bg-white/10"
              style={{ width: `${60 + i * 10}%` }}
            />
            <div className="h-2.5 w-2/5 animate-pulse rounded-full bg-slate-100 dark:bg-white/5" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function SearchDropdown({
  open,
  recentItems,
  topMatches,
  trendingItems,
  aiItems,
  activeIndex,
  onHover,
  onSelect,
  onClearRecents,
  isLoading = false,
  isLiveAI = false,
}: SearchDropdownProps) {
  const recentOffset = 0;
  const matchesOffset = recentItems.length;
  const trendingOffset = recentItems.length + topMatches.length;
  const aiOffset = recentItems.length + topMatches.length + trendingItems.length;

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          id="ai-search-listbox"
          role="listbox"
          initial={{ opacity: 0, y: -10, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.98 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="absolute z-70 mt-2 w-full overflow-hidden rounded-2xl border border-slate-200/80 bg-white/95 shadow-[0_28px_80px_-28px_rgba(15,23,42,0.5)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/95"
        >
          {/* Header banner */}
          <div className="flex items-center justify-between border-b border-blue-100 bg-linear-to-r from-blue-50 via-cyan-50 to-blue-100 px-3 py-2 text-xs font-medium text-blue-800 dark:border-blue-500/20 dark:from-blue-500/10 dark:via-cyan-500/10 dark:to-blue-500/10 dark:text-blue-200">
            <span className="inline-flex items-center gap-1.5">
              <Sparkles className="size-3.5" />
              Find experts, industries, and insights instantly
            </span>
            {isLiveAI && (
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
              >
                <Zap className="size-2.5" />
                Live AI
              </motion.span>
            )}
          </div>

          <div className="max-h-[68vh] overflow-y-auto pb-1">
            {/* Recent searches */}
            <div className={sectionHeaderClass}>
              <span className="inline-flex items-center gap-1.5">
                <History className="size-3.5" />
                Recent Searches
              </span>
              {recentItems.length > 0 ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={onClearRecents}
                  className="h-auto px-1.5 py-0.5 text-[10px] text-slate-500 hover:bg-transparent hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                >
                  Clear
                </Button>
              ) : null}
            </div>
            <SuggestionList
              items={recentItems}
              activeIndexOffset={recentOffset}
              activeIndex={activeIndex}
              section="recent"
              onHover={onHover}
              onSelect={onSelect}
            />
            {recentItems.length === 0 ? (
              <div className="px-4 pb-3 text-xs text-slate-500 dark:text-slate-400">
                No recent searches yet. Your real searches will appear here.
              </div>
            ) : null}

            {/* Top matches */}
            {topMatches.length > 0 ? (
              <>
                <div className={sectionHeaderClass}>
                  <span className="inline-flex items-center gap-1.5">
                    <Sparkles className="size-3.5" />
                    Top Matches
                  </span>
                </div>
                <SuggestionList
                  items={topMatches}
                  activeIndexOffset={matchesOffset}
                  activeIndex={activeIndex}
                  section="matches"
                  onHover={onHover}
                  onSelect={onSelect}
                />
              </>
            ) : null}

            {/* Trending */}
            <div className={sectionHeaderClass}>
              <span className="inline-flex items-center gap-1.5">
                <TrendingUp className="size-3.5" />
                Trending Now
              </span>
            </div>
            <SuggestionList
              items={trendingItems}
              activeIndexOffset={trendingOffset}
              activeIndex={activeIndex}
              section="trending"
              onHover={onHover}
              onSelect={onSelect}
            />

            {/* AI section */}
            <div className={sectionHeaderClass}>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-2 py-0.5 text-blue-700 dark:bg-blue-500/20 dark:text-blue-200">
                <Sparkles className="size-3.5" />
                AI Suggestions
              </span>
            </div>

            <AnimatePresence mode="wait">
              {isLoading && aiItems.length === 0 ? (
                <motion.div
                  key="skeleton"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <AISkeleton />
                </motion.div>
              ) : (
                <motion.div
                  key="items"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <SuggestionList
                    items={aiItems}
                    activeIndexOffset={aiOffset}
                    activeIndex={activeIndex}
                    section="ai"
                    onHover={onHover}
                    onSelect={onSelect}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-slate-100 px-3 py-2 text-[10px] text-slate-500 dark:border-white/10 dark:text-slate-400">
            <span>Powered by ConsultEdge AI Search</span>
            <span>{isLiveAI ? "Live suggestions" : "Waiting for query"}</span>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
