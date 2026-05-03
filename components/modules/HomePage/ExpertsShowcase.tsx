"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  Target,
  Wallet,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import RecDebugPanel from "@/components/modules/HomePage/RecDebugPanel";
import {
  getBehavior,
  recommendExperts,
  type BehaviorState,
} from "@/src/lib/aiPersonalization";
import { useUserActivity } from "@/src/hooks/useUserActivity";
import { getAIRecommendations } from "@/src/services/ai.service";
import type { IExpert } from "@/src/types/expert.types";

interface ExpertsShowcaseProps {
  experts: IExpert[];
  /** Maximum cards rendered (capped at 6). */
  limit?: number;
}

type DisplayExpertCard = {
  key: string;
  href: string;
  name: string;
  title: string;
  specialization: string;
  description: string;
  experienceYears: number;
  fee: number;
  whyReason: string;
  profilePhoto?: string | null;
  isVerified?: boolean;
};

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

const normalizeName = (value: string) => value.trim().toLowerCase();

const emptyBehaviorState: BehaviorState = {
  industryWeights: {},
  recentSearches: [],
  recentExpertIds: [],
  clickedCategories: [],
  updatedAt: 0,
};

const formatWhyReason = (value: string) =>
  value
    .replace(/^(?:\s*why\s*:\s*)+/i, "")
    .replace(/^\s*because\s+you\s+/i, "Based on your ")
    .trim();

export default function ExpertsShowcase({ experts, limit = 4 }: ExpertsShowcaseProps) {
  const cap = Math.max(4, Math.min(limit, 6));
  const { hydrated, signals, mode, activityCount } = useUserActivity();
  const isPersonalized = hydrated && mode === "personalized";

  const recommendationPayload = useMemo(
    () => ({
      viewedExperts: signals.viewedExperts,
      exploredIndustries: signals.exploredIndustries,
      searchHistory: signals.searchHistory,
      clickedCategories: signals.clickedCategories,
    }),
    [signals],
  );

  const { data: aiResult, isPending: aiLoading } = useQuery({
    queryKey: ["ai-recommendations", cap, recommendationPayload],
    queryFn: () => getAIRecommendations(recommendationPayload),
    enabled: hydrated,
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
  });

  const expertsByName = useMemo(() => {
    const map = new Map<string, IExpert>();
    for (const expert of experts) {
      map.set(normalizeName(expert.fullName), expert);
    }
    return map;
  }, [experts]);

  const localRanked = useMemo(
    () => recommendExperts(experts, cap, hydrated ? getBehavior() : emptyBehaviorState),
    [experts, cap, hydrated, signals],
  );

  const localReasonByName = useMemo(() => {
    const map = new Map<string, string>();
    for (const item of localRanked) {
      map.set(normalizeName(item.expert.fullName), item.reason);
    }
    return map;
  }, [localRanked]);

  const items: DisplayExpertCard[] = useMemo(() => {
    const backendExperts = aiResult?.data?.experts ?? [];

    if (backendExperts.length > 0) {
      return backendExperts.slice(0, cap).map((expert, index) => {
        const matched = expertsByName.get(normalizeName(expert.name));
        return {
          key: `ai-${index}-${expert.name}`,
          href: matched ? `/experts/${matched.id}` : "/experts",
          name: expert.name,
          title: expert.title || "Consultant",
          specialization: expert.specialization || "General Consulting",
          description: expert.description || fallbackBio,
          experienceYears: Number(expert.experienceYears ?? 0),
          fee: Number(expert.fee ?? 0),
          whyReason:
            expert.whyReason || localReasonByName.get(normalizeName(expert.name)) || "",
          profilePhoto: matched?.profilePhoto,
          isVerified: matched?.isVerified,
        };
      });
    }

    return localRanked.map((item) => ({
      key: item.expert.id,
      href: `/experts/${item.expert.id}`,
      name: item.expert.fullName,
      title: item.expert.title || "Consultant",
      specialization: item.expert.industry?.name || "General Consulting",
      description: item.expert.bio?.trim() || fallbackBio,
      experienceYears: Number(item.expert.experience ?? 0),
      fee: Number(item.expert.consultationFee ?? item.expert.price ?? 0),
      whyReason: item.reason,
      profilePhoto: item.expert.profilePhoto,
      isVerified: item.expert.isVerified,
    }));
  }, [aiResult, cap, expertsByName, localReasonByName, localRanked]);

  const showSkeleton = hydrated && aiLoading && items.length === 0;

  if (!showSkeleton && !items.length) return null;

  return (
    <section id="experts-showcase" className="relative scroll-mt-28 overflow-hidden rounded-(--ce-shell-radius) border border-cyan-100/70 bg-white/52 p-5 shadow-(--ce-shell-shadow-strong) backdrop-blur-2xl md:rounded-(--ce-shell-radius-md) md:p-7 lg:p-8 dark:rounded-(--ce-shell-radius-dark) dark:border-white/10 dark:bg-slate-950/42">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(126deg,rgba(255,255,255,0.42),rgba(255,255,255,0.1)_42%,rgba(34,211,238,0.12)_100%)] dark:bg-[linear-gradient(126deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03)_42%,rgba(34,211,238,0.08)_100%)]"
      />
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
            <Target className="size-3.5" />
            {isPersonalized ? "Picked for your interests" : "Great first matches"}
          </Badge>
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl lg:text-4xl">
            {isPersonalized
              ? "Curated from the industries you've been exploring"
              : "Start with proven experts trusted by growing teams"}
          </h2>
          <p className="text-sm text-muted-foreground md:text-base">
            {isPersonalized
              ? "Our AI ranks specialists that match your recent activity."
              : "Selected from verified specialists, weekly momentum, and quality signals so you can book with confidence."}
          </p>
          <RecDebugPanel mode={mode} activityCount={activityCount} />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="hidden items-center gap-1.5 rounded-full border border-cyan-200/70 bg-white/80 px-3 py-1.5 text-[11px] font-medium text-cyan-800 backdrop-blur dark:border-white/10 dark:bg-slate-900/70 dark:text-cyan-200 md:inline-flex">
            <span className="relative flex size-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400/70 opacity-70" />
              <span className="relative inline-flex size-2 rounded-full bg-cyan-500" />
            </span>
            {mode === "personalized"
              ? `Learning from your activity • ${activityCount} signals`
              : "Smart starter picks"}
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
          : items.map((item, index) => {
              return (
                <Link
                  key={item.key}
                  href={item.href}
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
                            {item.profilePhoto ? (
                              <AvatarImage src={item.profilePhoto} alt={item.name} />
                            ) : null}
                            <AvatarFallback className="text-slate-900">
                              {getInitials(item.name)}
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
                            {item.name}
                            {item.isVerified ? (
                              <BadgeCheck className="size-3.5 shrink-0 text-cyan-600 dark:text-cyan-300" />
                            ) : null}
                          </h3>
                          <p className="line-clamp-1 text-xs text-muted-foreground">{item.title}</p>
                          <p className="line-clamp-1 text-[11px] font-medium text-cyan-700 dark:text-cyan-300">
                            {item.specialization}
                          </p>
                        </div>
                      </div>

                      <p className="line-clamp-2 text-sm text-gray-600 dark:text-gray-300">
                        {item.description || fallbackBio}
                      </p>

                      {item.whyReason ? (
                        <div className="rounded-lg border border-cyan-100 bg-cyan-50/60 px-2 py-1.5 text-[11px] text-cyan-800 dark:border-cyan-500/20 dark:bg-cyan-500/5 dark:text-cyan-200">
                          <span className="font-medium">Why this pick:</span>{" "}
                          <span className="opacity-90">{formatWhyReason(item.whyReason)}</span>
                        </div>
                      ) : null}

                      <div className="grid grid-cols-2 gap-2">
                        <div className="rounded-lg border border-slate-200 bg-slate-50 p-2 dark:border-white/10 dark:bg-white/5">
                          <div className="mb-0.5 flex items-center gap-1 text-cyan-700 dark:text-cyan-300">
                            <BriefcaseBusiness className="size-3" />
                            <span className="text-[9px] font-medium uppercase tracking-wide">Exp</span>
                          </div>
                          <p className="text-xs font-semibold text-foreground">
                            {item.experienceYears} {item.experienceYears === 1 ? "yr" : "yrs"}
                          </p>
                        </div>

                        <div className="rounded-lg border border-slate-200 bg-slate-50 p-2 dark:border-white/10 dark:bg-white/5">
                          <div className="mb-0.5 flex items-center gap-1 text-cyan-700 dark:text-cyan-300">
                            <Wallet className="size-3" />
                            <span className="text-[9px] font-medium uppercase tracking-wide">Fee</span>
                          </div>
                          <p className="text-xs font-semibold text-foreground">
                            {formatFee(item.fee)}
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
