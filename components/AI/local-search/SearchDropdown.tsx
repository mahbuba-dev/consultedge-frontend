"use client";

import { AnimatePresence, motion } from "framer-motion";
import { History, Sparkles, TrendingUp } from "lucide-react";

import SuggestionList from "@/components/AI/local-search/SuggestionList";
import { Button } from "@/components/ui/button";
import type { DropdownItem } from "@/src/lib/localSearchPersonalization";

interface SearchDropdownProps {
  open: boolean;
  recentItems: DropdownItem[];
  trendingItems: DropdownItem[];
  aiItems: DropdownItem[];
  activeIndex: number;
  onHover: (absoluteIndex: number) => void;
  onSelect: (item: DropdownItem) => void;
  onClearRecents: () => void;
}

const sectionHeaderClass =
  "flex items-center justify-between px-3 pb-1.5 pt-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400";

export default function SearchDropdown({
  open,
  recentItems,
  trendingItems,
  aiItems,
  activeIndex,
  onHover,
  onSelect,
  onClearRecents,
}: SearchDropdownProps) {
  const recentOffset = 0;
  const trendingOffset = recentItems.length;
  const aiOffset = recentItems.length + trendingItems.length;

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
          <div className="border-b border-blue-100 bg-linear-to-r from-blue-50 via-cyan-50 to-blue-100 px-3 py-2 text-xs font-medium text-blue-800 dark:border-blue-500/20 dark:from-blue-500/10 dark:via-cyan-500/10 dark:to-blue-500/10 dark:text-blue-200">
            <span className="inline-flex items-center gap-1.5">
              <Sparkles className="size-3.5" />
              Not sure what to search? Try these:
            </span>
          </div>

          <div className="max-h-[68vh] overflow-y-auto pb-1">
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

            <div className={sectionHeaderClass}>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-2 py-0.5 text-blue-700 dark:bg-blue-500/20 dark:text-blue-200">
                <Sparkles className="size-3.5" />
                AI Suggestions
              </span>
            </div>
            <SuggestionList
              items={aiItems}
              activeIndexOffset={aiOffset}
              activeIndex={activeIndex}
              section="ai"
              onHover={onHover}
              onSelect={onSelect}
            />
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 px-3 py-2 text-[10px] text-slate-500 dark:border-white/10 dark:text-slate-400">
            <span>Premium local AI mode</span>
            <span>No backend cost · no API calls</span>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
