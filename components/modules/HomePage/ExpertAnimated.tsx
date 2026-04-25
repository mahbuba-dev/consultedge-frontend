import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  Sparkles,
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
  return (
    <section className="rounded-[2.25rem] border border-blue-100/70 bg-linear-to-br from-white via-cyan-50/40 to-blue-50/55 p-5 shadow-[0_30px_70px_-42px_rgba(37,99,235,0.35)] md:p-7 lg:p-8 dark:border-white/10 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900">
      <div className="space-y-8 md:space-y-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl space-y-3">
            <Badge variant="secondary" className="mb-2 gap-1 bg-cyan-100 text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-200">
              <Sparkles className="size-3.5" />
              Featured experts
            </Badge>
            <h2 className="text-2xl font-bold tracking-tight md:text-3xl lg:text-4xl">
              Meet standout professionals ready for high-impact consulting
            </h2>
            <p className="text-muted-foreground md:text-base">
              Explore trusted specialists, compare profiles quickly, and open the right consultation flow in one click.
            </p>
          </div>

          <Button
            asChild
            variant="outline"
            className="h-11 rounded-full border-cyan-200 bg-white/80 px-5 text-sm font-medium text-slate-900 shadow-sm hover:bg-cyan-50 dark:border-white/15 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
          >
            <Link href="/experts">
              View all experts <ArrowRight className="ml-2 size-4" />
            </Link>
          </Button>
        </div>

        {experts.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {experts.map((expert, index) => {
              const expertPrice = expert.price ?? expert.consultationFee;

              return (
                <Link
                  key={expert.id}
                  href={`/experts/${expert.id}`}
                  className="group block h-full"
                  style={{ animationDelay: `${110 + index * 80}ms` }}
                >
                  <Card className="consultedge-reveal--visible consultedge-card-glow h-full overflow-hidden border border-slate-200 bg-white shadow-[0_20px_50px_-30px_rgba(15,23,42,0.25)] transition duration-300 hover:-translate-y-1 hover:border-cyan-400 hover:shadow-[0_28px_70px_-26px_rgba(34,211,238,0.45)] dark:border-white/10 dark:bg-slate-900/80 dark:shadow-black/20 dark:hover:border-cyan-400/40">
                    <CardContent className="flex h-full flex-col gap-4 p-5">
                      <div className="-mx-5 -mt-5 mb-1 h-1.5 bg-linear-to-r from-blue-500 via-cyan-400 to-teal-400" aria-hidden="true" />
                      <div className="flex items-center gap-4">
                        <div className="relative flex items-center justify-center">
                          <Avatar size="lg" className="size-16 border-2 border-cyan-100 ring-2 ring-cyan-50 dark:border-white/15 dark:ring-white/10">
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

                        <div className="min-w-0 flex-1 space-y-1">
                          <h3 className="line-clamp-1 flex items-center gap-1.5 text-base font-semibold text-foreground">
                            {expert.fullName}
                            {expert.isVerified && (
                              <BadgeCheck className="size-4 shrink-0 text-cyan-600 dark:text-cyan-300" />
                            )}
                          </h3>
                          <p className="line-clamp-1 text-sm text-muted-foreground">{expert.title}</p>
                          {expert.industry?.name ? (
                            <p className="line-clamp-1 text-xs font-medium text-cyan-700 dark:text-cyan-300">
                              {expert.industry.name}
                            </p>
                          ) : null}
                        </div>
                      </div>

                      <div className="grid gap-2 sm:grid-cols-2">
                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5 dark:border-white/10 dark:bg-white/5">
                          <div className="mb-1 flex items-center gap-1.5 text-cyan-700 dark:text-cyan-300">
                            <BriefcaseBusiness className="size-3.5" />
                            <span className="text-[10px] font-medium uppercase tracking-wide">Experience</span>
                          </div>
                          <p className="text-sm font-semibold text-foreground">
                            {expert.experience} {Number(expert.experience) === 1 ? "year" : "years"}
                          </p>
                        </div>

                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5 dark:border-white/10 dark:bg-white/5">
                          <div className="mb-1 flex items-center gap-1.5 text-cyan-700 dark:text-cyan-300">
                            <Wallet className="size-3.5" />
                            <span className="text-[10px] font-medium uppercase tracking-wide">Fee</span>
                          </div>
                          <p className="text-sm font-semibold text-foreground">
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

                      <div className="mt-auto flex items-center justify-between text-sm font-medium text-cyan-700 transition-colors group-hover:text-cyan-600 dark:text-cyan-300">
                        <span>View profile</span>
                        <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="py-10 text-center text-muted-foreground">
              Featured experts will appear here once expert data is available.
            </CardContent>
          </Card>
        )}
      </div>
    </section>
  );
}
