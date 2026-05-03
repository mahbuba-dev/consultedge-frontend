"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ArrowRight, Flame, TrendingUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getTrendingExperts } from "@/src/lib/aiPersonalization";
import { getAIRecommendations } from "@/src/services/ai.service";
import { getExperts } from "@/src/services/expert.services";
import type { IExpert } from "@/src/types/expert.types";

interface TrendingExpertsProps {
  experts: IExpert[];
}

type TrendingCard = {
  key: string;
  href: string;
  name: string;
  title: string;
  industry?: string;
  bio: string;
  profilePhoto?: string | null;
};

const MAX = 4;
const fallbackBio =
  "Trusted operator helping teams move faster with focused 1:1 sessions.";

const variedFallbackBios = [
  "Builds practical operating systems for teams that need cleaner execution under growth pressure.",
  "Advises leaders on prioritization, stakeholder alignment, and measurable quarterly outcomes.",
  "Designs repeatable client-delivery playbooks that improve quality without slowing momentum.",
  "Supports founders with offer strategy, positioning, and retention-focused customer journeys.",
] as const;

const getInitials = (name: string) =>
  name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const buildAvatarUrl = (name: string) =>
  `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(name)}&radius=50&backgroundType=gradientLinear`;

  const normalizeName = (value: string) => value.trim().toLowerCase();

const isSeededExpert = (expert: IExpert) => {
  if (typeof expert.isSeeded === "boolean") {
    return expert.isSeeded;
  }

  const email = (expert.email ?? expert.user?.email ?? "").toLowerCase();
  return email.endsWith("@consultedge.test");
};

export default function TrendingExperts({ experts }: TrendingExpertsProps) {
  const { data: fallbackExpertsResult } = useQuery({
    queryKey: ["homepage-trending-fallback-experts", MAX],
    queryFn: () =>
      getExperts({
        page: 1,
        limit: 24,
        sortBy: "createdAt",
        sortOrder: "desc",
      }),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 20,
  });

  const candidateExperts = useMemo(() => {
    const pool = [
      ...experts,
      ...(Array.isArray(fallbackExpertsResult?.data) ? fallbackExpertsResult.data : []),
    ];
    const seen = new Set<string>();
    const nonSeeded: IExpert[] = [];

    for (const expert of pool) {
      if (!expert?.id || seen.has(expert.id)) continue;
      seen.add(expert.id);
      if (isSeededExpert(expert)) {
        continue;
      } else {
        nonSeeded.push(expert);
      }
    }

    return nonSeeded;
  }, [experts, fallbackExpertsResult]);

  const expertsById = useMemo(() => {
    const m = new Map<string, IExpert>();
    for (const e of candidateExperts) m.set(e.id, e);
    return m;
  }, [candidateExperts]);

  const { data: aiResult } = useQuery({
    queryKey: ["ai-trending", MAX],
    queryFn: () =>
      getAIRecommendations({
        limit: MAX,
        source: "homepage",
      }),
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
  });

  const heuristicTrending = useMemo(
    () => getTrendingExperts(candidateExperts, MAX),
    [candidateExperts],
  );

  const trending: IExpert[] = useMemo(() => {
    const backendItems = aiResult?.data?.items ?? [];
    if (backendItems.length > 0) {
      const resolved = backendItems
        .map((it) => it.expert ?? expertsById.get(it.expertId))
        .filter((e): e is IExpert => Boolean(e))
        .slice(0, MAX);
      if (resolved.length > 0) return resolved;
    }
    return heuristicTrending;
  }, [aiResult, expertsById, heuristicTrending]);

  const cards: TrendingCard[] = useMemo(() => {
    const used = new Set<string>();
    return trending
      .filter((expert) => {
        const key = normalizeName(expert.fullName);
        if (used.has(key)) return false;
        used.add(key);
        return true;
      })
      .slice(0, MAX)
      .map((expert, index) => ({
        key: expert.id,
        href: `/experts/${expert.id}`,
        name: expert.fullName,
        title: expert.title || "Consultant",
        industry: expert.industry?.name,
        bio:
          expert.bio?.trim() ||
          variedFallbackBios[index % variedFallbackBios.length] ||
          fallbackBio,
        profilePhoto: expert.profilePhoto || null,
      }));
  }, [trending]);
  const isDevFallbackActive =
    process.env.NODE_ENV !== "production" && (aiResult?.data?.items?.length ?? 0) === 0;

  return (
    <section
      id="trending-experts"
      className="relative scroll-mt-28 overflow-hidden rounded-(--ce-shell-radius) border border-orange-100/70 bg-white/55 p-5 shadow-(--ce-shell-shadow-strong) backdrop-blur-2xl md:rounded-(--ce-shell-radius-md) md:p-7 lg:p-8 dark:rounded-(--ce-shell-radius-dark) dark:border-white/10 dark:bg-slate-950/45"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(128deg,rgba(255,255,255,0.34),rgba(255,255,255,0.08)_42%,rgba(251,146,60,0.1)_100%)] dark:bg-[linear-gradient(128deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02)_42%,rgba(251,146,60,0.08)_100%)]"
      />
      <div className="mb-6 flex flex-col gap-3 md:mb-8 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl space-y-2">
          <Badge variant="secondary" className="gap-1 bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-200">
            <Flame className="size-3.5" />
            Trending now
          </Badge>
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
            Experts gaining traction this week
          </h2>
          <p className="text-sm text-muted-foreground md:text-base">
            Powered by our AI ranking with heuristic fallback for resilience.
          </p>
          {isDevFallbackActive ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-amber-300/70 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:border-amber-400/30 dark:bg-amber-500/10 dark:text-amber-200">
              Fallback mode active
            </span>
          ) : null}
        </div>
        <div className="hidden items-center gap-2 rounded-full border border-orange-200/70 bg-white/80 px-3 py-1.5 text-xs font-medium text-orange-700 dark:border-white/10 dark:bg-slate-900/70 dark:text-orange-200 md:inline-flex">
          <TrendingUp className="size-3.5" />
          Updates daily
        </div>
      </div>

      {cards.length === 0 ? (
        <div className="rounded-xl border border-orange-100 bg-orange-50/40 p-5 text-sm text-orange-900 dark:border-orange-500/20 dark:bg-orange-500/5 dark:text-orange-100">
          No trending experts available yet.
        </div>
      ) : (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {cards.map((card, idx) => (
          <Link
            key={card.key}
            href={card.href}
            className="group block h-full"
          >
            <Card className="relative h-full overflow-hidden border border-slate-200 bg-white transition duration-300 hover:-translate-y-1 hover:border-orange-400 hover:shadow-[0_28px_70px_-26px_rgba(251,146,60,0.4)] dark:border-white/10 dark:bg-slate-900/80 dark:hover:border-orange-400/40">
              <CardContent className="flex h-full flex-col gap-3 p-4">
                <div className="flex items-center justify-between">
                  <Badge className="gap-1 rounded-full bg-orange-500/10 text-[10px] font-bold text-orange-700 hover:bg-orange-500/20 dark:bg-orange-500/15 dark:text-orange-200">
                    <Flame className="size-3" />#{idx + 1}
                  </Badge>
                  <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                    Trending
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <Avatar size="default" className="size-12 border-2 border-orange-100 ring-2 ring-orange-50 dark:border-white/15 dark:ring-white/10">
                    <AvatarImage src={card.profilePhoto || buildAvatarUrl(card.name)} alt={card.name} />
                    <AvatarFallback>{getInitials(card.name)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <h3 className="line-clamp-1 text-sm font-semibold">{card.name}</h3>
                    <p className="line-clamp-1 text-xs text-muted-foreground">{card.title}</p>
                    {card.industry ? (
                      <p className="line-clamp-1 text-[11px] font-medium text-orange-700 dark:text-orange-300">
                        {card.industry}
                      </p>
                    ) : null}
                  </div>
                </div>

                <p className="line-clamp-2 text-sm text-gray-600 dark:text-gray-300">{card.bio}</p>

                <div className="mt-auto flex items-center justify-between text-xs font-medium text-orange-700 transition-colors group-hover:text-orange-600 dark:text-orange-300">
                  <span>View profile</span>
                  <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
      )}
    </section>
  );
}
