import Link from "next/link";
import { ArrowUpRight, BadgeCheck, CalendarDays } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { IExpert } from "@/src/types/expert.types";

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
    ? expert.bio
    : "Focused 1:1 guidance for strategy, growth, operations, and decision-making support.";

  return (
    <Card className="group flex h-full flex-col overflow-visible border-blue-200/70 bg-white/92 shadow-[0_20px_50px_-24px_rgba(37,99,235,0.35)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_28px_80px_-28px_rgba(37,99,235,0.5)] dark:border-white/10 dark:bg-slate-900/92 dark:shadow-[0_22px_60px_-30px_rgba(15,23,42,0.9)]">
      <div className="relative overflow-visible border-b border-blue-100/70 bg-linear-to-br from-slate-950 via-blue-950 to-cyan-900 p-3.5 text-white dark:border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.16),transparent_0%,transparent_42%)]" />
        <div className="relative space-y-3">

          <div className="flex items-start gap-3">
            <div className="relative flex flex-col items-center">
              <div className="relative">
                <Avatar size="default" className="border-2 border-white/20 ring-2 ring-white/10">
                  {expert.profilePhoto ? (
                    <AvatarImage src={expert.profilePhoto} alt={expert.fullName} />
                  ) : null}
                  <AvatarFallback className="font-semibold text-slate-900">
                    {getInitials(expert.fullName)}
                  </AvatarFallback>
                </Avatar>
                {/* Animated Active icon, attached inside bottom-left of avatar */}
                <span className="absolute z-20 bottom-0 left-0.5 flex items-end justify-start">
                  <span className="inline-flex h-3 w-3 items-center justify-center rounded-full bg-emerald-900/90 ring-2 ring-white/70 shadow-lg">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400 shadow" />
                    </span>
                  </span>
                </span>
              </div>
            </div>
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex items-center gap-1.5">
                <h2 className="truncate text-base font-semibold leading-tight tracking-tight text-white">
                  {expert.fullName}
                </h2>
                {expert.isVerified && (
                  <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-900/60 ring-1 ring-white/20">
                    <BadgeCheck className="size-3.5 text-emerald-300" />
                  </span>
                )}
              </div>
              <p className="line-clamp-1 text-[11px] text-white/75">{expert.title}</p>
            </div>
            <div className="ml-1 shrink-0 rounded-full border border-white/15 bg-white/10 px-2.5 py-0.5 text-[11px] font-semibold text-white backdrop-blur">
              {formatCurrency(expertPrice)}
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5">
            <Badge className="border-white/15 bg-white/10 px-2 py-0.5 text-[10px] font-medium text-white hover:bg-white/10">
              {expert.industry?.name || "General consulting"}
            </Badge>
            <Badge className="border-white/15 bg-white/10 px-2 py-0.5 text-[10px] font-medium text-white hover:bg-white/10">
              {expert.experience}+ yrs
            </Badge>
          </div>
        </div>
      </div>

      <CardContent className="flex flex-1 flex-col gap-4 p-4">
        <p className="line-clamp-2 text-xs leading-5 text-muted-foreground dark:text-slate-300/80">
          {shortBio}
        </p>

        <div className="mt-auto grid gap-2 sm:grid-cols-2">
          <Button
            asChild
            size="sm"
            className="h-9 w-full bg-linear-to-r from-blue-600 to-cyan-500 text-xs text-white shadow-md shadow-cyan-500/25 transition-all hover:from-blue-700 hover:to-cyan-600 hover:shadow-lg hover:shadow-cyan-500/30"
          >
            <Link href={`/experts/${expert.id}`}>
              View profile
              <ArrowUpRight className="ml-1.5 size-3.5" />
            </Link>
          </Button>

          <Button
            asChild
            size="sm"
            className="h-9 w-full bg-linear-to-r from-emerald-500 to-teal-500 text-xs text-white shadow-md shadow-emerald-500/25 transition-all hover:from-emerald-600 hover:to-teal-600 hover:shadow-lg hover:shadow-emerald-500/30"
          >
            <Link href={`/experts/${expert.id}#book-session`} scroll>
              <CalendarDays className="mr-1.5 size-3.5" />
              Book now
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
