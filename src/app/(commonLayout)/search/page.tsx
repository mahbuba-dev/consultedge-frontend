"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSearch } from "@/src/hooks/useSearch";

function ResultGroup({
  title,
  items,
}: {
  title: string;
  items: Array<{ id: string; label: string; subLabel?: string; href: string }>;
}) {
  if (items.length === 0) return null;

  return (
    <Card className="border-slate-200/70 bg-white/70 dark:border-white/10 dark:bg-slate-900/70">
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {items.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className="block rounded-xl border border-slate-200/80 px-3 py-2 text-sm transition hover:border-cyan-300 hover:bg-cyan-50/60 dark:border-white/10 dark:hover:border-cyan-400/40 dark:hover:bg-cyan-500/5"
          >
            <p className="font-medium text-foreground">{item.label}</p>
            {item.subLabel ? (
              <p className="text-xs text-muted-foreground">{item.subLabel}</p>
            ) : null}
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

export default function SearchPage() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q") ?? "";

  const { grouped, isSearching } = useSearch({ query: q, open: true });

  const experts = useMemo(
    () =>
      grouped.experts.map((item) => ({
        ...item,
        href: `/experts/${item.id}`,
      })),
    [grouped.experts],
  );

  const industries = useMemo(
    () =>
      grouped.industries.map((item) => ({
        ...item,
        href: `/industries/${item.id}`,
      })),
    [grouped.industries],
  );

  const testimonials = useMemo(
    () =>
      grouped.testimonials.map((item) => ({
        ...item,
        href: item.expertId ? `/experts/${item.expertId}#testimonials` : `/search?q=${encodeURIComponent(item.label)}`,
      })),
    [grouped.testimonials],
  );

  const trending = useMemo(
    () =>
      grouped.trending.map((item) => ({
        ...item,
        href: `/trending/${item.slug || slugify(item.label)}`,
      })),
    [grouped.trending],
  );

  const aiSuggestions = useMemo(
    () =>
      grouped.aiSuggestions.map((item) => ({
        ...item,
        href:
          item.type === "expert"
            ? `/experts/${item.id}`
            : item.type === "industry"
              ? `/industries/${item.id}`
              : item.type === "testimonial"
                ? item.expertId
                  ? `/experts/${item.expertId}#testimonials`
                  : `/search?q=${encodeURIComponent(item.label)}`
                : `/trending/${item.slug || slugify(item.label)}`,
      })),
    [grouped.aiSuggestions],
  );

  return (
    <main className="min-h-screen px-4 py-8 md:px-8">
      <div className="mx-auto max-w-360 space-y-6">
        <div className="space-y-2">
          <Badge className="bg-cyan-100 text-cyan-800 dark:bg-cyan-500/15 dark:text-cyan-200">
            Universal Search
          </Badge>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            Search results for "{q || ""}"
          </h1>
          <p className="text-sm text-muted-foreground">
            {isSearching
              ? "Fetching live results from ConsultEdge AI search..."
              : "Grouped live results from experts, industries, testimonials, trending, and AI suggestions."}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <ResultGroup title="Experts" items={experts} />
          <ResultGroup title="Industries" items={industries} />
          <ResultGroup title="Testimonials" items={testimonials} />
          <ResultGroup title="Trending" items={trending} />
          <ResultGroup title="AI Suggestions" items={aiSuggestions} />
        </div>
      </div>
    </main>
  );
}
