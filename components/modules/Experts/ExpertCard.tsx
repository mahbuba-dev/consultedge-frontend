import Link from "next/link";
import {
  ArrowUpRight,
  BadgeCheck,
  BriefcaseBusiness,
  CalendarDays,
  ShieldCheck,
  Sparkles,
  Wallet,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { IExpert } from "@/src/types/expert.types";
import { cn } from "@/src/lib/utils";

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
};

const formatCurrency = (value?: number) =>
  typeof value === "number"
    ? new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
      }).format(value)
    : "Contact for pricing";

export default function ExpertCard({ expert }: { expert: IExpert }) {
  const expertPrice = expert.price ?? expert.consultationFee;
  const shortBio = expert.bio?.trim()
    ? expert.bio.length > 150
      ? `${expert.bio.slice(0, 150)}...`
      : expert.bio
    : "Focused 1:1 guidance for strategy, growth, operations, and decision-making support.";
  const detailCards = [
    {
      label: "Experience",
      value: `${expert.experience} years`,
      icon: BriefcaseBusiness,
      tone: "text-blue-700 bg-blue-50/80 dark:text-blue-300 dark:bg-blue-500/10",
    },
    {
      label: "Session fee",
      value: formatCurrency(expertPrice),
      icon: Wallet,
      tone: "text-cyan-700 bg-cyan-50/80 dark:text-cyan-300 dark:bg-cyan-500/10",
    },
    {
      label: "Profile",
      value: expert.isVerified ? "Trusted profile" : "Open for consultation",
      icon: ShieldCheck,
      tone: "text-sky-700 bg-sky-50/80 dark:text-sky-300 dark:bg-sky-500/10",
    },
  ];

  return (
    <Card className="group flex h-full flex-col overflow-visible border-blue-200/70 bg-white/92 shadow-[0_20px_50px_-24px_rgba(37,99,235,0.35)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_28px_80px_-28px_rgba(37,99,235,0.5)] dark:border-white/10 dark:bg-slate-900/92 dark:shadow-[0_22px_60px_-30px_rgba(15,23,42,0.9)]">
      <div className="relative overflow-visible border-b border-blue-100/70 bg-linear-to-br from-slate-950 via-blue-950 to-cyan-900 p-4 text-white dark:border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.16),transparent_0%,transparent_42%)]" />
        <div className="relative space-y-4">

          <div className="flex items-start gap-3">
            <div className="relative flex flex-col items-center">
              <div className="relative">
                <Avatar size="lg" className="mt-3 border-2 border-white/20 ring-2 ring-white/10">
                  {expert.profilePhoto ? (
                    <AvatarImage src={expert.profilePhoto} alt={expert.fullName} />
                  ) : null}
                  <AvatarFallback className="font-semibold text-slate-900">
                    {getInitials(expert.fullName)}
                  </AvatarFallback>
                </Avatar>
                {/* Animated Active icon, attached inside bottom-left of avatar */}
                <span className="absolute z-20 bottom-0 left-1 flex items-end justify-start">
                  <span className="inline-flex h-3 w-3 items-center justify-center rounded-full bg-emerald-900/90 ring-2 ring-white/70 shadow-lg">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400 shadow" />
                    </span>
                  </span>
                </span>
              </div>
            </div>
            <div className="min-w-0 space-y-2 flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-semibold tracking-tight text-white ">
                  {expert.fullName}
                </h2>
                {expert.isVerified && (
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-900/60 ring-2 ring-white/20">
                    <BadgeCheck className="size-5 text-emerald-300" />
                  </span>
                )}
              </div>
              <p className="text-xs text-white/80">{expert.title}</p>
            </div>
            <div className="ml-auto rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
              {formatCurrency(expertPrice)}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge className="border-white/15 bg-white/10 text-white hover:bg-white/10">
              {expert.industry?.name || "General consulting"}
            </Badge>
            <Badge className="border-white/15 bg-white/10 text-white hover:bg-white/10">
              {expert.experience}+ years experience
            </Badge>
          </div>
        </div>
      </div>

      <CardContent className="flex flex-1 flex-col space-y-4 p-5">
        <p className="min-h-18 text-sm leading-6 text-muted-foreground dark:text-slate-300/80">{shortBio}</p>

        <div className="grid gap-3 sm:grid-cols-3">
          {detailCards.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.label}
                className="rounded-2xl border border-border/70 bg-background/80 p-3 dark:border-white/10 dark:bg-slate-950/70"
              >
                <div className={cn("mb-2 inline-flex rounded-xl p-2", item.tone)}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="space-y-1">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    {item.label}
                  </p>
                  <p className="text-sm font-semibold text-foreground">{item.value}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-auto grid gap-2 sm:grid-cols-2">
          <Button asChild className="w-full bg-blue-600 text-white hover:bg-blue-700">
            <Link href={`/experts/${expert.id}`}>
              View profile
              <ArrowUpRight className="ml-2 size-4" />
            </Link>
          </Button>

          <Button asChild variant="outline" className="w-full border-blue-200 text-blue-700 hover:bg-blue-50 dark:border-white/10 dark:bg-slate-950/60 dark:text-blue-200 dark:hover:bg-slate-800/80 dark:hover:text-blue-100">
            <Link href={`/experts/${expert.id}#book-session`} scroll>
              <CalendarDays className="mr-2 size-4" />
              Book now
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
