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

  return (
    <Card className="group overflow-hidden border-violet-200/70 bg-white/90 shadow-[0_20px_50px_-24px_rgba(109,40,217,0.35)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_28px_80px_-28px_rgba(109,40,217,0.5)]">
      <div className="relative overflow-hidden border-b bg-linear-to-br from-slate-950 via-violet-950 to-fuchsia-900 p-4 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.16),transparent_0%,transparent_42%)]" />
        <div className="relative space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <Avatar size="lg" className="size-16 border-2 border-white/20 ring-2 ring-white/10">
                {expert.profilePhoto ? (
                  <AvatarImage src={expert.profilePhoto} alt={expert.fullName} />
                ) : null}
                <AvatarFallback className="font-semibold text-slate-900">
                  {getInitials(expert.fullName)}
                </AvatarFallback>
              </Avatar>

              <div className="min-w-0 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                 

                  {expert.isVerified ? (
                    <Badge className="bg-emerald-500/20 text-white hover:bg-emerald-500/20">
                      <BadgeCheck className="mr-1 size-3.5" />
                      Verified
                    </Badge>
                  ) : null}
                </div>

                <div>
                  <h2 className="text-xl font-semibold tracking-tight text-white">
                    {expert.fullName}
                  </h2>
                  <p className="text-sm text-white/80">{expert.title}</p>
                </div>
              </div>
            </div>

            <div className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
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

      <CardContent className="space-y-4 p-5">
        <p className="min-h-[72px] text-sm leading-6 text-muted-foreground">{shortBio}</p>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border bg-violet-50/80 p-3">
            <div className="mb-1 flex items-center gap-2 text-violet-700">
              <BriefcaseBusiness className="h-4 w-4" />
              <span className="text-[11px] font-semibold uppercase tracking-wide">
                Experience
              </span>
            </div>
            <p className="text-sm font-semibold text-foreground">{expert.experience} years</p>
          </div>

          <div className="rounded-2xl border bg-fuchsia-50/80 p-3">
            <div className="mb-1 flex items-center gap-2 text-fuchsia-700">
              <Wallet className="h-4 w-4" />
              <span className="text-[11px] font-semibold uppercase tracking-wide">
                Session fee
              </span>
            </div>
            <p className="text-sm font-semibold text-foreground">{formatCurrency(expertPrice)}</p>
          </div>

          <div className="rounded-2xl border bg-sky-50/80 p-3">
            <div className="mb-1 flex items-center gap-2 text-sky-700">
              <ShieldCheck className="h-4 w-4" />
              <span className="text-[11px] font-semibold uppercase tracking-wide">
                Profile
              </span>
            </div>
            <p className="text-sm font-semibold text-foreground">
              {expert.isVerified ? "Verified expert" : "Open for consultation"}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button asChild className="flex-1 bg-violet-600 text-white hover:bg-violet-700">
            <Link href={`/experts/${expert.id}`}>
              View profile
              <ArrowUpRight className="ml-2 size-4" />
            </Link>
          </Button>

          <Button asChild variant="outline" className="flex-1 border-violet-200 text-violet-700 hover:bg-violet-50">
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
