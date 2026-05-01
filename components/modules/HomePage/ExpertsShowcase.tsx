"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  Sparkles,
  Wallet,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  getBehavior,
  hasPersonalSignal,
  recommendExperts,
  type ScoredExpert,
} from "@/src/lib/aiPersonalization";
import { getAIRecommendations } from "@/src/services/ai.service";
import type { IExpert } from "@/src/types/expert.types";

interface ExpertsShowcaseProps {
  experts: IExpert[];
  /** Maximum cards rendered (capped at 4). */
  limit?: number;
}

const getInitials = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const formatFee = (value?: number | null) =>
  typeof value === "number"
    ? new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
      }).format(value)
    : "Contact";

const fallbackBio =
  "Focused 1:1 guidance for strategy, growth, operations, and decision-making support.";

export default function ExpertsShowcase({ experts, limit = 4 }: ExpertsShowcaseProps) {
  const cap = Math.min(limit, 4);
  const [tick, setTick] = useState(0);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
    const handler = () => setTick((t) => t + 1);
    window.addEventListener("consultedge:behavior-updated", handler);
    return () => window.removeEventListener("consultedge:behavior-updated", handler);
  }, []);

  const isPersonalised = useMemo(
    () => hydrated && hasPersonalSignal(getBehavior()),
    [hydrated, tick],
  );

  const behaviorPayload = useMemo(() => {
    if (!hydrated) return undefined;
    const b = getBehavior();
    return {
      industryIds: Object.entries(b.industryWeights)
        .sort((a, c) => c[1] - a[1])
        .map(([id]) => id),
      recentSearches: b.recentSearches,
      recentExpertIds: b.recentExpertIds,
      hasSignal: hasPersonalSignal(b),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, tick]);

  const { data: aiResult, isPending: aiLoading } = useQuery({
    queryKey: ["ai-recommendations", cap, behaviorPayload],
    queryFn: () =>
      getAIRecommendations({
        limit: cap,
        source: "homepage",
        behavior: behaviorPayload,
      }),
    enabled: hydrated,
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
  });

  const expertsById = useMemo(() => {
    const m = new Map<string, IExpert>();
    for (const e of experts) m.set(e.id, e);
    return m;
  }, [experts]);

  const items: Array<{ expert: IExpert; reason?: string }> = useMemo(() => {
    const backendItems = aiResult?.data?.items ?? [];
    if (backendItems.length > 0) {
      const resolved = backendItems
        .map((it) => {
          const expert = it.expert ?? expertsById.get(it.expertId);
          return expert ? { expert, reason: it.reason } : null;
        })
        .filter((x): x is { expert: IExpert; reason?: string } => Boolean(x))
        .slice(0, cap);
      if (resolved.length > 0) return resolved;
    }

    if (isPersonalised) {
      return recommendExperts(experts, cap).map((s: ScoredExpert) => ({
        expert: s.expert,
        reason: s.reason,
      }));
    }
    return experts.slice(0, cap).map((expert) => ({ expert }));
  }, [aiResult, expertsById, isPersonalised, experts, cap]);

  const showSkeleton = hydrated && aiLoading && items.length === 0;

  if (!showSkeleton && !items.length) return null;

  return (
    <section className="relative overflow-hidden rounded-[2.25rem] border border-cyan-100/70 bg-linear-to-br from-white via-cyan-50/40 to-blue-50/55 p-5 shadow-[0_30px_70px_-42px_rgba(37,99,235,0.35)] md:p-7 lg:p-8 dark:border-white/10 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 -right-20 size-72 rounded-full bg-cyan-300/20 blur-3xl dark:bg-cyan-500/10"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-24 -left-16 size-72 rounded-full bg-blue-300/15 blur-3xl dark:bg-blue-500/10"
      />

      <div className="relative mb-6 flex flex-col gap-5 md:mb-8 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl space-y-3">
          <Badge
            variant="secondary"
            className="gap-1 bg-cyan-100 text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-200"
          >
            <Sparkles className="size-3.5" />
            {isPersonalised ? "Recommended for you" : "Top experts today"}
          </Badge>
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl lg:text-4xl">
            {isPersonalised
              ? "Curated from the industries you’ve been exploring"
              : "Meet standout professionals ready for high-impact consulting"}
          </h2>
          <p className="text-sm text-muted-foreground md:text-base">
            {isPersonalised
              ? "Our AI ranks specialists that match your recent activity. We fall back to a fast on-device model if the service is offline."
              : "Browse a couple of profiles and this row will quietly tailor itself to what you’re looking for."}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="hidden items-center gap-1.5 rounded-full border border-cyan-200/70 bg-white/80 px-3 py-1.5 text-[11px] font-medium text-cyan-800 backdrop-blur dark:border-white/10 dark:bg-slate-900/70 dark:text-cyan-200 md:inline-flex">
            <span className="relative flex size-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400/70 opacity-70" />
              <span className="relative inline-flex size-2 rounded-full bg-cyan-500" />
            </span>
            {isPersonalised ? "Personalised live" : "Updated today"}
          </span>
          <Button
            asChild
            variant="outline"
            className="h-10 rounded-full border-cyan-200 bg-white/80 px-5 text-sm font-medium text-slate-900 shadow-sm hover:bg-cyan-50 dark:border-white/15 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
          >
            <Link href="/experts">
              View all <ArrowRight className="ml-1.5 size-4" />
            </Link>
          </Button>
        </div>
      </div>

      <div className="relative grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {showSkeleton
          ? Array.from({ length: cap }).map((_, i) => <ExpertCardSkeleton key={i} />)
          : items.map(({ expert, reason }, index) => {
              const expertPrice = expert.price ?? expert.consultationFee;
              const bio = expert.bio?.trim() || fallbackBio;
              return (
                <Link
                  key={expert.id}
                  href={`/experts/${expert.id}`}
                  className="group block h-full"
                  style={{ animationDelay: `${110 + index * 70}ms` }}
                >
                  <Card className="consultedge-reveal--visible consultedge-card-glow relative h-full overflow-hidden border border-slate-200 bg-white shadow-[0_20px_50px_-30px_rgba(15,23,42,0.25)] transition duration-300 hover:-translate-y-1 hover:border-cyan-400 hover:shadow-[0_28px_70px_-26px_rgba(34,211,238,0.45)] dark:border-white/10 dark:bg-slate-900/80 dark:shadow-black/20 dark:hover:border-cyan-400/40">
                    <CardContent className="flex h-full flex-col gap-3 p-4">
                      <div
                        className="-mx-4 -mt-4 mb-1 h-1.5 bg-linear-to-r from-blue-500 via-cyan-400 to-teal-400"
                        aria-hidden="true"
                      />

                      <div className="flex items-center gap-3">
                        <div className="relative flex items-center justify-center">
                          <Avatar
                            size="default"
                            className="size-12 border-2 border-cyan-100 ring-2 ring-cyan-50 dark:border-white/15 dark:ring-white/10"
                          >
                            {expert.profilePhoto ? (
                              <AvatarImage src={expert.profilePhoto} alt={expert.fullName} />
                            ) : null}
                            <AvatarFallback className="text-slate-900">
                              {getInitials(expert.fullName)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="absolute -bottom-0.5 -right-0.5 z-20 flex">
                            <span className="relative flex h-2.5 w-2.5">
                              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
                            </span>
                          </span>
                        </div>

                        <div className="min-w-0 flex-1 space-y-0.5">
                          <h3 className="line-clamp-1 flex items-center gap-1.5 text-sm font-semibold text-foreground">
                            {expert.fullName}
                            {expert.isVerified ? (
                              <BadgeCheck className="size-3.5 shrink-0 text-cyan-600 dark:text-cyan-300" />
                            ) : null}
                          </h3>
                          <p className="line-clamp-1 text-xs text-muted-foreground">{expert.title}</p>
                          {expert.industry?.name ? (
                            <p className="line-clamp-1 text-[11px] font-medium text-cyan-700 dark:text-cyan-300">
                              {expert.industry.name}
                            </p>
                          ) : null}
                        </div>
                      </div>

                      <p className="line-clamp-2 text-sm text-gray-600 dark:text-gray-300">{bio}</p>

                      {reason ? (
                        <div className="rounded-lg border border-cyan-100 bg-cyan-50/60 px-2 py-1.5 text-[11px] text-cyan-800 dark:border-cyan-500/20 dark:bg-cyan-500/5 dark:text-cyan-200">
                          <span className="font-medium">Why:</span>{" "}
                          <span className="opacity-90">{reason}</span>
                        </div>
                      ) : null}

                      <div className="grid grid-cols-2 gap-2">
                        <div className="rounded-lg border border-slate-200 bg-slate-50 p-2 dark:border-white/10 dark:bg-white/5">
                          <div className="mb-0.5 flex items-center gap-1 text-cyan-700 dark:text-cyan-300">
                            <BriefcaseBusiness className="size-3" />
                            <span className="text-[9px] font-medium uppercase tracking-wide">Exp</span>
                          </div>
                          <p className="text-xs font-semibold text-foreground">
                            {expert.experience} {Number(expert.experience) === 1 ? "yr" : "yrs"}
                          </p>
                        </div>

                        <div className="rounded-lg border border-slate-200 bg-slate-50 p-2 dark:border-white/10 dark:bg-white/5">
                          <div className="mb-0.5 flex items-center gap-1 text-cyan-700 dark:text-cyan-300">
                            <Wallet className="size-3" />
                            <span className="text-[9px] font-medium uppercase tracking-wide">Fee</span>
                          </div>
                          <p className="text-xs font-semibold text-foreground">
                            {formatFee(expertPrice)}
                          </p>
                        </div>
                      </div>

                      <div className="mt-auto flex items-center justify-between text-xs font-medium text-cyan-700 transition-colors group-hover:text-cyan-600 dark:text-cyan-300">
                        <span>View profile</span>
                        <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
      </div>
    </section>
  );
}

function ExpertCardSkeleton() {
  return (
    <div className="relative h-full overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-slate-900/80">
      <div className="-mx-4 -mt-4 mb-3 h-1.5 bg-linear-to-r from-blue-500/30 via-cyan-400/30 to-teal-400/30" />
      <div className="flex items-center gap-3">
        <div className="size-12 animate-pulse rounded-full bg-slate-200 dark:bg-white/10" />
        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="h-3 w-3/4 animate-pulse rounded bg-slate-200 dark:bg-white/10" />
          <div className="h-2.5 w-1/2 animate-pulse rounded bg-slate-200 dark:bg-white/10" />
          <div className="h-2.5 w-1/3 animate-pulse rounded bg-slate-200 dark:bg-white/10" />
        </div>
      </div>
      <div className="mt-3 space-y-1.5">
        <div className="h-2.5 w-full animate-pulse rounded bg-slate-200 dark:bg-white/10" />
        <div className="h-2.5 w-4/5 animate-pulse rounded bg-slate-200 dark:bg-white/10" />
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="h-12 animate-pulse rounded-lg bg-slate-100 dark:bg-white/5" />
        <div className="h-12 animate-pulse rounded-lg bg-slate-100 dark:bg-white/5" />
      </div>
    </div>
  );
}
