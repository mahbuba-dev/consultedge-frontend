import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Wallet,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { IExpert } from "@/src/types/expert.types";

interface ExpertAnimatedProps {
  experts: IExpert[];
}

const getInitials = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

export default function ExpertAnimated({ experts }: ExpertAnimatedProps) {
  const tickerExperts = experts.length > 0 ? [...experts, ...experts] : [];
  const verifiedCount = experts.filter((expert) => Boolean(expert.isVerified)).length;
  const averageExperience = experts.length
    ? Math.round(
        experts.reduce((total, expert) => total + Number(expert.experience ?? 0), 0) /
          experts.length,
      )
    : 0;

  return (
    <section className="space-y-5">
      <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-3">
          <Badge variant="secondary" className="mb-2 gap-1 bg-cyan-100 text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-200">
            <Sparkles className="size-3.5" />
            Featured experts
          </Badge>
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl lg:text-4xl">
            Meet standout professionals ready for high-impact consulting
          </h2>
          <p className="max-w-2xl text-muted-foreground md:text-base">
            Explore trusted specialists in a premium expert showcase, compare profiles quickly, and open the right consultation flow in one click.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
          <Card className="border-cyan-200/70 bg-white/85 shadow-sm dark:border-white/10 dark:bg-slate-900/80">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="rounded-full bg-cyan-100 p-2 text-cyan-700">
                <TrendingUp className="size-4" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Experts</p>
                <p className="text-xl font-semibold text-foreground">{experts.length}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-violet-200/70 bg-white/85 shadow-sm dark:border-white/10 dark:bg-slate-900/80">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="rounded-full bg-violet-100 p-2 text-violet-700">
                <ShieldCheck className="size-4" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Verified</p>
                <p className="text-xl font-semibold text-foreground">{verifiedCount}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-emerald-200/70 bg-white/85 shadow-sm dark:border-white/10 dark:bg-slate-900/80">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="rounded-full bg-emerald-100 p-2 text-emerald-700">
                <BriefcaseBusiness className="size-4" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Avg. experience</p>
                <p className="text-xl font-semibold text-foreground">{averageExperience}+ yrs</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex justify-end">
        <Link href="/experts">
          <Button variant="outline" className="rounded-full border-cyan-200 text-cyan-700 hover:bg-cyan-50 dark:border-cyan-400/30 dark:text-cyan-200 dark:hover:bg-cyan-950/30">
            Browse experts
          </Button>
        </Link>
      </div>

      {tickerExperts.length > 0 ? (
        <div className="relative overflow-hidden rounded-[2rem] border border-cyan-100 bg-linear-to-r from-slate-950 via-violet-950 to-cyan-950 px-2 py-4 shadow-[0_24px_70px_-26px_rgba(34,211,238,0.35)]">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-linear-to-r from-slate-950 to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-linear-to-l from-cyan-950 to-transparent" />

          <div
            className="industry-marquee-track flex w-max items-stretch gap-4 py-1"
            style={{ animationDuration: `${Math.max(20, experts.length * 5)}s` }}
          >
            {tickerExperts.map((expert, index) => {
              const expertPrice = expert.price ?? expert.consultationFee;

              return (
                <Link
                  key={`${expert.id}-${index}`}
                  href={`/experts/${expert.id}`}
                  className="block w-64 shrink-0 sm:w-70"
                >
                  <Card className="h-full border-white/10 bg-white/10 text-white backdrop-blur transition duration-300 hover:-translate-y-1 hover:border-cyan-300/70 hover:bg-white/15 hover:shadow-[0_24px_60px_-28px_rgba(34,211,238,0.45)]">
                    <CardContent className="space-y-4 p-4">
                      <div className="flex items-start gap-3">
                        <Avatar size="lg" className="size-14 border border-white/20 ring-2 ring-white/10">
                          {expert.profilePhoto ? (
                            <AvatarImage src={expert.profilePhoto} alt={expert.fullName} />
                          ) : null}
                          <AvatarFallback className="text-slate-900">
                            {getInitials(expert.fullName)}
                          </AvatarFallback>
                        </Avatar>

                        <div className="min-w-0 flex-1 space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-500/15 px-2 py-1 text-[10px] font-semibold text-sky-100">
                              <span className="relative flex h-2 w-2">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-300 opacity-75" />
                                <span className="relative inline-flex h-2 w-2 rounded-full bg-sky-300" />
                              </span>
                              Active
                            </span>

                            {expert.isVerified ? (
                              <Badge className="bg-emerald-500/20 text-white hover:bg-emerald-500/20">
                                <BadgeCheck className="mr-1 size-3" />
                                Verified
                              </Badge>
                            ) : null}
                          </div>

                          <h3 className="line-clamp-1 text-base font-semibold">{expert.fullName}</h3>

                          <p className="line-clamp-1 text-sm text-white/75">{expert.title}</p>
                          {expert.industry?.name ? (
                            <p className="text-xs text-cyan-200">{expert.industry.name}</p>
                          ) : null}
                        </div>
                      </div>

                      <div className="grid gap-2 sm:grid-cols-2">
                        <div className="rounded-xl border border-white/10 bg-white/10 p-2.5">
                          <div className="mb-1 flex items-center gap-1.5 text-cyan-200">
                            <BriefcaseBusiness className="size-3.5" />
                            <span className="text-[10px] uppercase tracking-wide">Experience</span>
                          </div>
                          <p className="text-sm font-semibold">{expert.experience} years</p>
                        </div>

                        <div className="rounded-xl border border-white/10 bg-white/10 p-2.5">
                          <div className="mb-1 flex items-center gap-1.5 text-cyan-200">
                            <Wallet className="size-3.5" />
                            <span className="text-[10px] uppercase tracking-wide">Fee</span>
                          </div>
                          <p className="text-sm font-semibold">
                            {typeof expertPrice === "number"
                              ? new Intl.NumberFormat("en-US", {
                                  style: "currency",
                                  currency: "USD",
                                  maximumFractionDigits: 0,
                                }).format(expertPrice)
                              : "Contact"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm font-medium text-cyan-100">
                        <span>View profile</span>
                        <ArrowRight className="size-4" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      ) : (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            Featured experts will appear here once expert data is available.
          </CardContent>
        </Card>
      )}
    </section>
  );
}
