"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/src/lib/utils";
import { Brain, Briefcase, Building2, Search, User, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export type SearchSuggestionKind = "name" | "title" | "industry";

export interface SearchSuggestion {
  id: string;
  label: string;
  value: string;
  kind: SearchSuggestionKind;
  helperText?: string;
}

interface DataTableSearchProps {
  initialValue?: string;
  placeholder?: string;
  debounceMs?: number;
  isLoading?: boolean;
  suggestions?: SearchSuggestion[];
  suggestionTitle?: string;
  onValueChange?: (value: string) => void;
  onSuggestionSelect?: (suggestion: SearchSuggestion) => void;
  onDebouncedChange: (value: string) => void;
}

const DataTableSearch = ({
  initialValue = "",
  placeholder = "Search...",
  debounceMs = 700,
  isLoading,
  suggestions = [],
  suggestionTitle = "AI suggestions",
  onValueChange,
  onSuggestionSelect,
  onDebouncedChange,
}: DataTableSearchProps) => {
  const [value, setValue] = useState(initialValue);
  const [isFocused, setIsFocused] = useState(false);
  const skipNextDebounceRef = useRef(false);
  const previousInitialValueRef = useRef(initialValue);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsFocused(false);
      }
    };

    window.addEventListener("mousedown", onPointerDown);
    return () => window.removeEventListener("mousedown", onPointerDown);
  }, []);

  useEffect(() => {
    if (previousInitialValueRef.current === initialValue) {
      return;
    }

    previousInitialValueRef.current = initialValue;
    skipNextDebounceRef.current = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setValue(initialValue);
  }, [initialValue]);

  useEffect(() => {
    if (skipNextDebounceRef.current) {
      skipNextDebounceRef.current = false;
      return;
    }

    const timer = setTimeout(() => {
      onDebouncedChange(value.trim());
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [value, debounceMs, onDebouncedChange]);

  const handleClear = () => {
    skipNextDebounceRef.current = true;
    setValue("");
    onValueChange?.("");
    onDebouncedChange("");
  };

  const showSuggestions = isFocused && suggestions.length > 0;

  const getSuggestionIcon = (kind: SearchSuggestionKind) => {
    if (kind === "name") return <User className="h-3.5 w-3.5 text-blue-600 dark:text-blue-300" />;
    if (kind === "title") return <Briefcase className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-300" />;
    return <Building2 className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-300" />;
  };

  return (
    <div ref={containerRef} className="relative w-full md:max-w-sm">
      <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
      <Input
        value={value}
        onChange={(event) => {
          const nextValue = event.target.value;
          setValue(nextValue);
          onValueChange?.(nextValue);
        }}
        onFocus={() => setIsFocused(true)}
        placeholder={placeholder}
        className="h-9 pr-9 pl-9"
      />

      {value.length > 0 && (
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          className="absolute top-1/2 right-1 -translate-y-1/2"
          onClick={handleClear}
          aria-label="Clear search"
          disabled={isLoading}
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      )}

      {showSuggestions ? (
        <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-2xl border border-blue-100/80 bg-white/95 shadow-[0_18px_45px_-24px_rgba(15,23,42,0.6)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/95">
          <div className="flex items-center justify-between border-b border-blue-100/60 bg-linear-to-r from-blue-50/90 via-cyan-50/80 to-white/60 px-3 py-2 dark:border-white/10 dark:from-blue-500/10 dark:via-cyan-500/10 dark:to-slate-950">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-blue-700 dark:text-blue-200">
              <Brain className="h-3.5 w-3.5" />
              {suggestionTitle}
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">Name · Title · Industry</span>
          </div>

          <div className="max-h-64 overflow-y-auto p-1.5">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion.id}
                type="button"
                onClick={() => {
                  setValue(suggestion.value);
                  setIsFocused(false);
                  onValueChange?.(suggestion.value);
                  onDebouncedChange(suggestion.value);
                  onSuggestionSelect?.(suggestion);
                }}
                className={cn(
                  "group flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left transition-all duration-200",
                  "hover:-translate-y-px hover:bg-blue-50/80 dark:hover:bg-blue-500/10",
                )}
              >
                <span className="shrink-0 rounded-full bg-white/75 p-1 shadow-sm dark:bg-slate-900/70">
                  {getSuggestionIcon(suggestion.kind)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-slate-900 dark:text-slate-100">
                    {suggestion.label}
                  </span>
                  {suggestion.helperText ? (
                    <span className="block truncate text-[11px] text-slate-500 dark:text-slate-400">
                      {suggestion.helperText}
                    </span>
                  ) : null}
                </span>
                <span className="rounded-full border border-blue-200/70 bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-700 dark:border-blue-400/30 dark:bg-blue-500/10 dark:text-blue-200">
                  AI
                </span>
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default DataTableSearch;