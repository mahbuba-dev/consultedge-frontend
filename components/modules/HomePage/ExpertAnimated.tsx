import Link from "next/link";
import { ArrowRight, BadgeCheck, BriefcaseBusiness, Wallet } from "lucide-react";

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

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <Badge variant="secondary" className="mb-2 bg-cyan-100 text-cyan-700">
            Featured experts
          </Badge>
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Meet standout professionals</h2>
          <p className="text-muted-foreground">
            Explore trusted experts in a smooth single-line showcase and open their full profile in one click.
          </p>
        </div>

        <Link href="/experts">
          <Button variant="outline" className="rounded-full">Browse experts</Button>
        </Link>
      </div>

      {tickerExperts.length > 0 ? (
        <div className="relative overflow-hidden rounded-[2rem] border border-cyan-100 bg-linear-to-r from-slate-950 via-slate-900 to-cyan-950 px-2 py-4 shadow-lg shadow-cyan-500/10">
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
                  <Card className="h-full border-white/10 bg-white/10 text-white backdrop-blur transition duration-300 hover:-translate-y-1 hover:border-cyan-300/70 hover:bg-white/15">
                    <CardContent className="space-y-4 p-4">
                      <div className="flex items-start gap-3">
                        <Avatar size="lg" className="size-14 border border-white/20">
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
                        <div className="rounded-xl bg-white/10 p-2.5">
                          <div className="mb-1 flex items-center gap-1.5 text-cyan-200">
                            <BriefcaseBusiness className="size-3.5" />
                            <span className="text-[10px] uppercase tracking-wide">Experience</span>
                          </div>
                          <p className="text-sm font-semibold">{expert.experience} years</p>
                        </div>

                        <div className="rounded-xl bg-white/10 p-2.5">
                          <div className="mb-1 flex items-center gap-1.5 text-cyan-200">
                            <Wallet className="size-3.5" />
                            <span className="text-[10px] uppercase tracking-wide">Fee</span>
                          </div>
                          <p className="text-sm font-semibold">
                            {typeof expertPrice === "number" ? `$${expertPrice}` : "Contact"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm font-medium text-cyan-100">
                        <span>View details</span>
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
