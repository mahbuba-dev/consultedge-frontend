"use client";

import { AnimatePresence, motion } from "framer-motion";

import type { NavigationSuggestion } from "@/components/modules/HomePage/search/NavigationSuggestionList";
import { cn } from "@/src/lib/utils";

interface HomeSearchDropdownProps {
  open: boolean;
  suggestions: NavigationSuggestion[];
  activeIndex: number;
  onHover: (index: number) => void;
  onSelect: (item: NavigationSuggestion) => void;
}

export default function HomeSearchDropdown({
  open,
  suggestions,
  activeIndex,
  onHover,
  onSelect,
}: HomeSearchDropdownProps) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          id="home-nav-search-listbox"
          role="listbox"
          initial={{ opacity: 0, y: -6, scale: 0.985 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -6, scale: 0.985 }}
          transition={{ duration: 0.18, ease: [0.2, 0.9, 0.25, 1] }}
          className="absolute left-0 right-0 top-[calc(100%+10px)] z-70 overflow-hidden rounded-2xl border border-slate-200/80 bg-white/95 p-2 shadow-[0_24px_70px_-40px_rgba(15,23,42,0.7)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/90"
        >
          {suggestions.length ? (
            <ul className="max-h-85 overflow-y-auto pr-0.5">
              {suggestions.map((item, index) => {
                const Icon = item.icon;
                const active = index === activeIndex;

                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={active}
                      onMouseEnter={() => onHover(index)}
                      onClick={() => onSelect(item)}
                      className={cn(
                        "flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition",
                        active
                          ? "bg-cyan-50 text-slate-900 dark:bg-cyan-500/10 dark:text-cyan-100"
                          : "text-slate-700 hover:bg-slate-100/80 dark:text-slate-200 dark:hover:bg-white/5",
                      )}
                    >
                      <span
                        className={cn(
                          "mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-lg border",
                          active
                            ? "border-cyan-200 bg-white text-cyan-700 dark:border-cyan-400/30 dark:bg-cyan-500/15 dark:text-cyan-200"
                            : "border-slate-200 bg-white/80 text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-400",
                        )}
                      >
                        <Icon className="size-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold">{item.label}</span>
                        {item.description ? (
                          <span className="mt-0.5 block truncate text-xs text-slate-500 dark:text-slate-400">
                            {item.description}
                          </span>
                        ) : null}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-300/80 px-3 py-4 text-center text-xs text-slate-500 dark:border-white/10 dark:text-slate-400">
              No page matches that query.
            </div>
          )}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
