"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ArrowRight, Flame, TrendingUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import dynamic from "next/dynamic";
const Card = dynamic(() => import("@/components/ui/card").then(mod => mod.Card), { ssr: false });
const CardContent = dynamic(() => import("@/components/ui/card").then(mod => mod.CardContent), { ssr: false });

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

const getInitials = (name: string) =>
  name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const buildAvatarUrl = (name: string) =>
  `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(
    name
  )}&radius=50&backgroundType=gradientLinear`;

const normalizeName = (value: string) => value.trim().toLowerCase();

const getFeaturedScore = (expert: IExpert) => {
  const verified = expert.isVerified ? 4 : 0;
  const hasPhoto = expert.profilePhoto ? 2 : 0;
  const hasBio = expert.bio?.trim() ? 1 : 0;
  const hasTitle = expert.title?.trim() ? 0.5 : 0;
  const experience = Math.min(Number(expert.experience ?? 0), 15) / 15;

  return verified + hasPhoto + hasBio + hasTitle + experience;
};

export default function TrendingExperts({ experts }: TrendingExpertsProps) {
  const { data: fallbackExpertsResult } = useQuery({
    queryKey: ["homepage-trending-fallback-experts"],
    queryFn: () =>
      getExperts({
        page: 1,
        limit: 24,
        sortBy: "createdAt",
        sortOrder: "desc",
      }),
    enabled: experts.length === 0,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 20,
  });

  const allExpertsPool = useMemo(() => {
    const pool = [
      ...experts,
      ...(fallbackExpertsResult?.data ?? []),
    ];

    const seen = new Set<string>();
    const unique: IExpert[] = [];

    for (const expert of pool) {
      if (!expert?.id || seen.has(expert.id)) continue;
      seen.add(expert.id);
      unique.push(expert);
    }

    return unique;
  }, [experts, fallbackExpertsResult]);

  const cards: TrendingCard[] = useMemo(() => {
    const sorted = [...allExpertsPool]
      .sort((a, b) => getFeaturedScore(b) - getFeaturedScore(a))
      .slice(0, MAX);

    return sorted.map((expert) => ({
      key: expert.id,
      href: `/experts/${expert.id}`,
      name: expert.fullName,
      title: expert.title || "Consultant",
      industry: expert.industry?.name,
      bio: expert.bio?.trim() || fallbackBio,
      profilePhoto: expert.profilePhoto || null,
    }));
  }, [allExpertsPool]);

  return (
    <section
      id="trending-experts"
      className="relative overflow-hidden rounded-xl border border-orange-100/70 bg-white/60 p-6 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/40"
    >
      <div className="mb-6 flex items-end justify-between">
        <div className="space-y-2">
          <Badge className="gap-1 bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-200">
            <Flame className="size-3.5" />
            Trending now
          </Badge>
          <h2 className="text-2xl font-bold">
            Experts gaining traction this week
          </h2>
          <p className="text-sm text-muted-foreground">
            Based on profile activity & engagement signals
          </p>
        </div>

        <div className="hidden items-center gap-2 text-xs font-medium text-orange-700 md:flex">
          <TrendingUp className="size-4" />
          Updated daily
        </div>
      </div>

      {cards.length === 0 ? (
        <div className="rounded-lg border bg-orange-50 p-4 text-sm text-orange-800 dark:border-orange-500/20 dark:bg-orange-500/10 dark:text-orange-100">
          No trending experts available yet.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((card, idx) => (
            <Link key={card.key} href={card.href} className="group block">
              <Card className="h-full border transition hover:-translate-y-1 hover:border-orange-400 hover:shadow-lg dark:border-white/10 dark:bg-slate-900/60">
                <CardContent className="flex h-full flex-col gap-3 p-4">
                  <div className="flex items-center justify-between">
                    <Badge className="bg-orange-500/10 text-xs text-orange-700 dark:text-orange-200">
                      #{idx + 1}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground">
                      Trending
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <Avatar className="size-12 border">
                      <AvatarImage
                        src={card.profilePhoto || buildAvatarUrl(card.name)}
                        alt={card.name}
                      />
                      <AvatarFallback>
                        {getInitials(card.name)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-semibold">
                        {card.name}
                      </h3>
                      <p className="truncate text-xs text-muted-foreground">
                        {card.title}
                      </p>
                      {card.industry && (
                        <p className="truncate text-[11px] text-orange-600 dark:text-orange-300">
                          {card.industry}
                        </p>
                      )}
                    </div>
                  </div>

                  <p className="line-clamp-2 text-sm text-muted-foreground">
                    {card.bio}
                  </p>

                  <div className="mt-auto flex items-center justify-between text-xs font-medium text-orange-700 group-hover:text-orange-600">
                    <span>View profile</span>
                    <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
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