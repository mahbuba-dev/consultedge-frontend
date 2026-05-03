"use client";

import { ArrowUpRight, Clock, Flame, Sparkles } from "lucide-react";

import type { SearchDropdownItem } from "@/components/AI/local-search/types";
import { cn } from "@/src/lib/utils";

interface SuggestionListProps {
  items: SearchDropdownItem[];
  activeIndexOffset: number;
  activeIndex: number;
  section: "recent" | "trending" | "ai" | "matches";
  onHover: (absoluteIndex: number) => void;
  onSelect: (item: SearchDropdownItem) => void;
}

function getItemIcon(section: SuggestionListProps["section"]) {
  if (section === "recent") return <Clock className="size-3.5 text-slate-500" />;
  if (section === "trending") return <Flame className="size-3.5 text-orange-500" />;
  if (section === "matches") return <Sparkles className="size-3.5 text-cyan-500" />;
  return <Sparkles className="size-3.5 text-blue-600" />;
}

export default function SuggestionList({
  items,
  activeIndexOffset,
  activeIndex,
  section,
  onHover,
  onSelect,
}: SuggestionListProps) {
  return (
    <div className="space-y-1 px-2 pb-2">
      {items.map((item, index) => {
        const absoluteIndex = activeIndexOffset + index;
        const selected = absoluteIndex === activeIndex;

        return (
          <button
            key={item.id}
            type="button"
            onMouseEnter={() => onHover(absoluteIndex)}
            onClick={() => onSelect(item)}
            className={cn(
              "group flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left transition-all duration-200",
              section === "ai" || section === "matches"
                ? "hover:bg-blue-50 hover:shadow-[0_8px_24px_-16px_rgba(37,99,235,0.65)] dark:hover:bg-blue-500/10"
                : "hover:bg-slate-50 dark:hover:bg-white/5",
              selected
                ? section === "ai" || section === "matches"
                  ? "bg-blue-50 shadow-[0_10px_24px_-14px_rgba(37,99,235,0.75)] dark:bg-blue-500/10"
                  : "bg-slate-100 dark:bg-white/10"
                : "",
            )}
          >
            <span className="shrink-0">{getItemIcon(section)}</span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium text-slate-900 dark:text-slate-100">
                {item.label}
              </span>
              {item.subLabel ? (
                <span className="block truncate text-[11px] text-slate-500 dark:text-slate-400">
                  {item.subLabel}
                </span>
              ) : null}
            </span>
            <ArrowUpRight className="size-3.5 shrink-0 text-slate-400 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </button>
        );
      })}
    </div>
  );
}
