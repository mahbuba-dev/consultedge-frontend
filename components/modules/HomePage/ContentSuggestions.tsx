"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  Clock,
  Lightbulb,
  LineChart,
  Mail,
  Target,
  Wand2,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  getBehavior,
  hasPersonalSignal,
  trackCategoryClick,
  trackIndustryExplore,
} from "@/src/lib/aiPersonalization";
import { aiSummary } from "@/src/services/ai.service";
import type { IIndustry } from "@/src/types/industry.types";

interface ContentSuggestionsProps {
  industries: IIndustry[];
}

interface InsightTemplate {
  id: string;
  type: "Playbook" | "Guide" | "Trend report" | "Case study";
  title: (industry: string) => string;
  description: (industry: string) => string;
  readMinutes: number;
  icon: typeof BookOpen;
}

const toInsightSlug = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

const TEMPLATES: InsightTemplate[] = [
  {
    id: "playbook",
    type: "Playbook",
    title: (i) => `The 7-step ${i} growth playbook for 2026`,
    description: (i) =>
      `A pragmatic blueprint built from how top ${i} consultants on ConsultEdge advise founders right now.`,
    readMinutes: 8,
    icon: Target,
  },
  {
    id: "guide",
    type: "Guide",
    title: (i) => `Hiring your first ${i} advisor — what to ask`,
    description: (i) =>
      `Vetting checklist, sample briefs, and red flags to watch for when bringing a ${i} expert onto your team.`,
    readMinutes: 6,
    icon: BookOpen,
  },
  {
    id: "trends",
    type: "Trend report",
    title: (i) => `What's shifting in ${i} this quarter`,
    description: (i) =>
      `A short, opinionated look at the moves real ${i} operators are making, with anonymised session takeaways.`,
    readMinutes: 5,
    icon: LineChart,
  },
  {
    id: "case",
    type: "Case study",
    title: (i) => `From idea to launch: a ${i} sprint that worked`,
    description: (i) =>
      `Behind-the-scenes of a 30-day ${i} engagement — goals, traps, and the deliverables that actually moved the needle.`,
    readMinutes: 7,
    icon: Wand2,
  },
];

const ICON_BY_TYPE: Record<string, typeof BookOpen> = {
  Playbook: Target,
  Guide: BookOpen,
  "Trend report": LineChart,
  "Case study": Wand2,
};

export default function ContentSuggestions({ industries }: ContentSuggestionsProps) {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const handler = () => setTick((t) => t + 1);
    window.addEventListener("consultedge:behavior-updated", handler);
    return () => window.removeEventListener("consultedge:behavior-updated", handler);
  }, []);

  const focusIndustry = useMemo<IIndustry | null>(() => {
    if (industries.length === 0) return industries[0] ?? null;
    const { industryWeights } = getBehavior();
    const sorted = Object.entries(industryWeights).sort((a, b) => b[1] - a[1]);
    for (const [id] of sorted) {
      const found = industries.find((i) => i.id === id);
      if (found) return found;
    }
    return industries[0] ?? null;
  }, [industries, tick]);

  const personalised = !!focusIndustry && hasPersonalSignal(getBehavior());
  const industryName = focusIndustry?.name ?? "consulting";

  const { data: aiResult, isPending: aiLoading } = useQuery({
    queryKey: ["ai-content-summary", industryName, focusIndustry ?? null],
    queryFn: () =>
      aiSummary({
        topic: industryName,
        industryIds: focusIndustry ? [focusIndustry.id] : [],
        kind: "content-suggestions",
        source: "homepage",
      }),
    enabled: true,
    staleTime: 1000 * 60 * 30, // 30 minutes
    gcTime: 1000 * 60 * 60,
  });

  type DisplayItem = {
    id: string;
    type: string;
    title: string;
    description: string;
    readMinutes: number;
    icon: typeof BookOpen;
    href: string;
  };

  const items: DisplayItem[] = useMemo(() => {
    const backend = aiResult?.data?.items ?? [];
    if (backend.length > 0) {
      return backend.slice(0, 4).map((it, i) => ({
        id: it.id || `ai-${i}`,
        type: it.type || "Insight",
        title: it.title,
        description: it.description,
        readMinutes: it.readMinutes ?? 6,
        icon: ICON_BY_TYPE[it.type ?? ""] ?? BookOpen,
        href: `/insights/${toInsightSlug(it.title)}?topic=${encodeURIComponent(industryName)}&type=${encodeURIComponent(it.type || "Insight")}`,
      }));
    }
    // Heuristic fallback: deterministic from industry name for SSR/CSR consistency.
    const baseHash = industryName
      .split("")
      .reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
    const offset = baseHash % TEMPLATES.length;
    return Array.from({ length: 4 }, (_, i) => {
      const t = TEMPLATES[(offset + i) % TEMPLATES.length];
      const title = t.title(industryName);
      return {
        id: t.id,
        type: t.type,
        title,
        description: t.description(industryName),
        readMinutes: t.readMinutes,
        icon: t.icon,
        href: `/insights/${toInsightSlug(title)}?topic=${encodeURIComponent(industryName)}&type=${encodeURIComponent(t.type)}`,
      };
    });
  }, [aiResult, industryName]);

  const showSkeleton = aiLoading && items.length === 0;

  return (
    <section id="insights-section" className="relative scroll-mt-28 overflow-hidden rounded-(--ce-shell-radius) border border-emerald-100/70 bg-white/50 p-5 shadow-(--ce-shell-shadow-strong) backdrop-blur-2xl md:rounded-(--ce-shell-radius-md) md:p-7 lg:p-8 dark:rounded-(--ce-shell-radius-dark) dark:border-white/10 dark:bg-slate-950/44">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(126deg,rgba(255,255,255,0.42),rgba(255,255,255,0.08)_44%,rgba(16,185,129,0.09)_100%)] dark:bg-[linear-gradient(126deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02)_44%,rgba(16,185,129,0.07)_100%)]"
      />

      <div className="relative mb-6 flex flex-col gap-4 md:mb-8 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl space-y-2">
          <Badge variant="secondary" className="gap-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200">
            <Lightbulb className="size-3.5" />
            {personalised ? `Insights tuned to ${industryName}` : "Insights to read next"}
          </Badge>
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
            {personalised
              ? `Hand-picked reads on ${industryName}`
              : "A short reading list to get sharper, faster"}
          </h2>
          <p className="text-sm text-muted-foreground md:text-base">
            {aiResult?.data?.headline
              ? aiResult.data.headline
              : personalised
              ? "Surfaced from your recent activity. New entries refresh daily — bookmark a card to revisit it."
              : "Click around an industry or expert and this row will tailor itself to what you care about."}
          </p>
        </div>
        <Button asChild variant="outline" className="h-10 rounded-full border-emerald-200 px-5 text-sm dark:border-white/15">
          <Link
            href="/insights"
            onClick={() => {
              trackCategoryClick(industryName);
              trackIndustryExplore(industryName);
            }}
          >
            Browse all insights <ArrowRight className="ml-1.5 size-4" />
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {showSkeleton
          ? Array.from({ length: 4 }).map((_, i) => <ContentSkeleton key={i} />)
          : items.map(({ id, type, title, description, readMinutes, icon: Icon, href }) => (
              <Link key={id} href={href} className="group block h-full">
                <Card className="relative h-full overflow-hidden border border-slate-200 bg-white transition duration-300 hover:-translate-y-1 hover:border-emerald-400 hover:shadow-[0_28px_70px_-26px_rgba(16,185,129,0.4)] dark:border-white/10 dark:bg-slate-900/80 dark:hover:border-emerald-400/40">
                  <CardContent className="flex h-full flex-col gap-3 p-5">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
                        <Icon className="size-3" />
                        {type}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                        <Clock className="size-3" /> {readMinutes} min
                      </span>
                    </div>
                    <h3 className="text-base font-semibold leading-snug text-foreground line-clamp-3">
                      {title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3">
                      {description}
                    </p>
                    <div className="mt-auto flex items-center justify-between text-xs font-medium text-emerald-700 transition-colors group-hover:text-emerald-600 dark:text-emerald-300">
                      <span>Read insight</span>
                      <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
      </div>

      <div className="mt-5 flex items-center gap-2 rounded-2xl border border-emerald-200/60 bg-white/70 px-4 py-3 text-xs text-emerald-900 dark:border-white/10 dark:bg-slate-900/60 dark:text-emerald-200">
        <Mail className="size-3.5 shrink-0" />
        <span className="flex-1">Want these landing in your inbox once a week? Subscribe below — fully personalised to the industries you explore.</span>
      </div>
    </section>
  );
}

function ContentSkeleton() {
  return (
    <div className="relative h-full overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-slate-900/80">
      <div className="flex items-center justify-between">
        <div className="h-5 w-20 animate-pulse rounded-full bg-emerald-200/50" />
        <div className="h-3 w-10 animate-pulse rounded bg-slate-200 dark:bg-white/10" />
      </div>
      <div className="mt-3 space-y-2">
        <div className="h-4 w-11/12 animate-pulse rounded bg-slate-200 dark:bg-white/10" />
        <div className="h-4 w-3/4 animate-pulse rounded bg-slate-200 dark:bg-white/10" />
      </div>
      <div className="mt-3 space-y-1.5">
        <div className="h-2.5 w-full animate-pulse rounded bg-slate-200 dark:bg-white/10" />
        <div className="h-2.5 w-5/6 animate-pulse rounded bg-slate-200 dark:bg-white/10" />
        <div className="h-2.5 w-2/3 animate-pulse rounded bg-slate-200 dark:bg-white/10" />
      </div>
    </div>
  );
}
