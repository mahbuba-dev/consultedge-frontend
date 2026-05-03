import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  CalendarDays,
  Wallet,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { IExpert } from "@/src/types/expert.types";

const getInitials = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 1)
    .toUpperCase();

const formatCurrency = (value?: number) =>
  typeof value === "number"
    ? new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
      }).format(value)
    : "Contact";

const fallbackBio =
  "Focused 1:1 guidance for strategy, growth, operations, and decision-making support.";

const buildProfessionalHeadshot = (expert: IExpert) => {
  const currentPhoto = (expert.profilePhoto ?? "").trim();
  const isCartoonSeed = /api\.dicebear\.com\/9\.x\/adventurer/i.test(currentPhoto);

  if (currentPhoto && !isCartoonSeed) {
    return currentPhoto;
  }

  const identitySeed = `${expert.id}-${expert.fullName}`;
  let hash = 0;
  for (let i = 0; i < identitySeed.length; i += 1) {
    hash = (hash * 31 + identitySeed.charCodeAt(i)) % 1_000_000;
  }

  const collection = hash % 2 === 0 ? "men" : "women";
  const photoId = hash % 90;
  return `https://randomuser.me/api/portraits/${collection}/${photoId}.jpg`;
};

export default function ExpertCard({ expert }: { expert: IExpert }) {
  const expertPrice = expert.price ?? expert.consultationFee;
  const bio = expert.bio?.trim() || fallbackBio;
  const profilePhoto = buildProfessionalHeadshot(expert);

  return (
    <Card className="consultedge-card-glow group relative h-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_20px_50px_-30px_rgba(15,23,42,0.25)] transition duration-300 hover:-translate-y-1 hover:border-cyan-400 hover:shadow-[0_28px_70px_-26px_rgba(34,211,238,0.45)] dark:border-white/10 dark:bg-slate-900/80 dark:shadow-black/20 dark:hover:border-cyan-400/40">
      <CardContent className="flex h-full flex-col gap-4 p-5">
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
              {profilePhoto ? (
                <AvatarImage src={profilePhoto} alt={expert.fullName} />
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
            <h3 className="line-clamp-1 flex items-center gap-1.5 text-base font-semibold tracking-tight text-foreground">
              {expert.fullName}
              {expert.isVerified ? (
                <BadgeCheck className="size-3.5 shrink-0 text-cyan-600 dark:text-cyan-300" />
              ) : null}
            </h3>
            <p className="line-clamp-1 text-sm text-muted-foreground">{expert.title}</p>
            {expert.industry?.name ? (
              <p className="line-clamp-1 text-xs font-medium text-cyan-700 dark:text-cyan-300">
                {expert.industry.name}
              </p>
            ) : null}
          </div>
        </div>

        <p className="line-clamp-3 min-h-[4.5rem] text-sm leading-6 text-slate-600 dark:text-slate-300">{bio}</p>

        <div className="grid grid-cols-2 gap-2.5">
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
              {formatCurrency(expertPrice)}
            </p>
          </div>
        </div>

        <div className="mt-auto grid gap-2.5 sm:grid-cols-2">
          <Button
            asChild
            size="sm"
            className="h-9 w-full bg-linear-to-r from-blue-600 to-cyan-500 text-xs text-white shadow-md shadow-cyan-500/25 transition-all hover:from-blue-700 hover:to-cyan-600 hover:shadow-lg hover:shadow-cyan-500/30"
          >
            <Link href={`/experts/${expert.id}`}>
              View profile
              <ArrowRight className="ml-1.5 size-3.5" />
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
