"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BadgeCheck,
  BriefcaseBusiness,
  CalendarDays,
  DollarSign,
  Mail,
  Phone,
  ShieldCheck,
  Sparkles,
  Star,
  TrendingUp,
} from "lucide-react";

import BookSessionPanel from "@/components/modules/Bokings/BookSessionPanel";
import MessageExpertButton from "@/components/modules/Experts/MessageExpertButton";
import ExpertTestimonialsSection from "@/components/modules/shared/ExpertTestimonialsSection";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { IExpert, IExpertAvailability } from "@/src/types/expert.types";
import type { ITestimonial } from "@/src/types/testimonial.types";

type ExpertDetailsProps = {
  expert: IExpert;
  availability?: IExpertAvailability[];
  testimonials?: ITestimonial[];
  isLoggedIn?: boolean;
  userRole?: string | null;
};

const getInitials = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const formatCurrency = (value?: number) =>
  typeof value === "number"
    ? new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
      }).format(value)
    : "Contact for pricing";

export default function ExpertDetails({
  expert,
  availability = [],
  testimonials = [],
  isLoggedIn = false,
  userRole,
}: ExpertDetailsProps) {
  const [openBookingSignal, setOpenBookingSignal] = useState(0);
  const availableSlots = availability.filter((slot) => !slot.isBooked && !slot.isDeleted).length;
  const reviewCount = testimonials.length;
  const consultationFee = formatCurrency(expert.consultationFee ?? expert.price);

  const handleOpenBookingFromHero = () => {
    setOpenBookingSignal((previous) => previous + 1);

    window.setTimeout(() => {
      document.getElementById("book-session")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 50);
  };

  return (
    <div className="mx-auto max-w-360 space-y-8 px-4 py-6 md:px-6 lg:py-8">
      <Link
        href="/experts"
        className="inline-flex items-center gap-2 text-sm font-medium text-blue-700 transition hover:text-blue-900"
      >
        <ArrowLeft className="size-4" />
        Back to experts
      </Link>

      <section className="relative overflow-visible rounded-[32px] border border-blue-200/60 bg-linear-to-br from-slate-950 via-blue-950 to-cyan-900 text-white shadow-[0_30px_80px_-28px_rgba(91,33,182,0.55)]">
        <div className="navbar-gradient-motion pointer-events-none"  aria-hidden="true" />
        <div className="absolute pointer-events-none inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_0%,transparent_42%)]" />
        <div className="absolute -left-20 top-10 size-56 rounded-full bg-cyan-500/15 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 size-64 rounded-full bg-cyan-400/10 blur-3xl pointer-events-none" />

        <div className="relative pointer-events-auto grid gap-6 p-6 lg:grid-cols-[1.2fr_0.8fr] lg:p-8">
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="bg-white/10 text-white hover:bg-white/10">
                <Sparkles className="mr-1 size-3.5" />
                ConsultEdge expert
              </Badge>

              {expert.isVerified ? (
                <Badge className="bg-emerald-500/20 text-white hover:bg-emerald-500/20">
                  <BadgeCheck className="mr-1 size-3.5" />
                  Verified profile
                </Badge>
              ) : null}
            </div>

            <div className="flex items-start gap-4">
              <div className="relative flex flex-col items-center">
                <div className="relative">
                  <Avatar  className="size-28 border-4 border-white/20 shadow-2xl md:size-36">
                    {expert.profilePhoto ? (
                      <AvatarImage src={expert.profilePhoto} alt={expert.fullName} />
                    ) : null}
                    <AvatarFallback className="text-lg font-semibold text-slate-900">
                      {getInitials(expert.fullName)}
                    </AvatarFallback>
                  </Avatar>
                  {/* Animated Active icon, attached inside bottom-left of avatar */}
                  <span className="absolute z-20 bottom-1 left-5 flex items-end justify-start">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-900/90 ring-2 ring-white/70 shadow-lg">
                      <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400 shadow" />
                      </span>
                    </span>
                  </span>
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
                    {expert.fullName}
                  </h1>
                  {expert.isVerified && (
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-900/60 ring-2 ring-white/20">
                      <BadgeCheck className="size-5 text-emerald-300" />
                    </span>
                  )}
                </div>
                <p className="mt-2 text-base text-white/85 md:text-lg">{expert.title}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Badge className="border-white/15 bg-white/10 text-white hover:bg-white/10">
                    {expert.industry?.name || "General consulting"}
                  </Badge>
                  <Badge className="border-white/15 bg-white/10 text-white hover:bg-white/10">
                    {expert.experience}+ years experience
                  </Badge>
                  <Badge className="border-white/15 bg-white/10 text-white hover:bg-white/10">
                    {availableSlots} open slots
                  </Badge>
                </div>
              </div>
            </div>

            <p className="max-w-2xl text-sm leading-7 text-white/80 md:text-base">
              {expert.bio ||
                `Work with ${expert.fullName} for focused guidance on ${expert.industry?.name || "business"} challenges, planning, and next-step decision making.`}
            </p>

            <div className="flex flex-wrap gap-3">
              <Button
                className="bg-white text-slate-900 hover:bg-white/90"
                onClick={handleOpenBookingFromHero}
              >
                <CalendarDays className="mr-2 size-4" />
                Book a consultation
              </Button>

              <MessageExpertButton
                expertId={expert.id}
                isLoggedIn={isLoggedIn}
                userRole={userRole}
              />

              <Button
                asChild
                variant="outline"
                className="border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white"
              >
                <a href={`mailto:${expert.email}`}>
                  <Mail className="mr-2 size-4" />
                  Email
                </a>
              </Button>

              {expert.phone ? (
                <Button
                  asChild
                  variant="outline"
                  className="border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white"
                >
                  <a href={`tel:${expert.phone}`}>
                    <Phone className="mr-2 size-4" />
                    Call
                  </a>
                </Button>
              ) : null}
            </div>
          </div>

          <Card className="border-white/10 bg-white/10 text-white shadow-none backdrop-blur-md">
            <CardContent className="space-y-4 p-5">
              <div>
                <p className="text-sm text-white/70">Consultation fee</p>
                <p className="mt-1 text-3xl font-bold">{consultationFee}</p>
                <p className="text-sm text-white/70">Per session</p>
              </div>

              <div className="grid gap-3">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                  <p className="text-xs uppercase tracking-wide text-white/65">Industry focus</p>
                  <p className="mt-1 font-medium text-white">
                    {expert.industry?.name || "General consulting"}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                  <p className="text-xs uppercase tracking-wide text-white/65">Contact email</p>
                  <p className="mt-1 font-medium text-white break-all">{expert.email}</p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                  <p className="text-xs uppercase tracking-wide text-white/65">Phone</p>
                  <p className="mt-1 font-medium text-white">{expert.phone || "Not provided"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="group relative overflow-hidden border-blue-200/70 bg-linear-to-br from-blue-50 to-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-blue-500/20 dark:from-blue-500/10 dark:to-slate-900/80">
          <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-blue-600 to-cyan-500" />
          <CardContent className="flex items-center gap-3 p-5">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-linear-to-br from-blue-600 to-cyan-500 text-white shadow-md shadow-cyan-500/25 transition-transform group-hover:scale-110">
              <BriefcaseBusiness className="size-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Experience</p>
              <p className="text-lg font-bold text-foreground">{expert.experience}+ years</p>
            </div>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden border-amber-200/70 bg-linear-to-br from-amber-50 to-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-amber-500/20 dark:from-amber-500/10 dark:to-slate-900/80">
          <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-amber-500 to-orange-500" />
          <CardContent className="flex items-center gap-3 p-5">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-linear-to-br from-amber-500 to-orange-500 text-white shadow-md shadow-amber-500/25 transition-transform group-hover:scale-110">
              <Star className="size-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Client reviews</p>
              <p className="text-lg font-bold text-foreground">{reviewCount} review{reviewCount === 1 ? "" : "s"}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden border-emerald-200/70 bg-linear-to-br from-emerald-50 to-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-emerald-500/20 dark:from-emerald-500/10 dark:to-slate-900/80">
          <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-emerald-500 to-teal-500" />
          <CardContent className="flex items-center gap-3 p-5">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-linear-to-br from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-500/25 transition-transform group-hover:scale-110">
              <TrendingUp className="size-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Session fee</p>
              <p className="text-lg font-bold text-foreground">{consultationFee}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden border-cyan-200/70 bg-linear-to-br from-cyan-50 to-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-cyan-500/20 dark:from-cyan-500/10 dark:to-slate-900/80">
          <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-cyan-500 to-sky-500" />
          <CardContent className="flex items-center gap-3 p-5">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-linear-to-br from-cyan-500 to-sky-500 text-white shadow-md shadow-cyan-500/25 transition-transform group-hover:scale-110">
              <ShieldCheck className="size-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Availability</p>
              <p className="text-lg font-bold text-foreground">{availableSlots} open slots</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="relative overflow-hidden border-border/60 bg-white/90 shadow-sm backdrop-blur dark:border-white/10 dark:bg-slate-900/70">
          <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-blue-600 via-cyan-500 to-teal-400" />
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="inline-flex size-8 items-center justify-center rounded-full bg-linear-to-br from-blue-600 to-cyan-500 text-white shadow-md shadow-cyan-500/25">
                <BriefcaseBusiness className="size-4" />
              </span>
              About this expert
            </CardTitle>
            <CardDescription>
              Learn more about the expert’s background, focus, and consulting approach.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="leading-7 text-muted-foreground">
              {expert.bio || "This expert has not added a bio yet."}
            </p>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="relative overflow-hidden rounded-2xl border border-blue-200/60 bg-linear-to-br from-blue-50 via-white to-cyan-50 p-4 dark:border-blue-500/20 dark:from-blue-500/10 dark:via-slate-900/40 dark:to-cyan-500/10">
                <div className="absolute inset-x-0 top-0 h-0.5 bg-linear-to-r from-blue-600 to-cyan-500" />
                <p className="text-xs font-semibold uppercase tracking-wider text-blue-700 dark:text-cyan-300">Best fit for</p>
                <p className="mt-1 font-medium text-foreground">
                  {expert.industry?.name || "Business and strategy"} planning, decisions, and growth conversations
                </p>
              </div>

              <div className="relative overflow-hidden rounded-2xl border border-cyan-200/60 bg-linear-to-br from-cyan-50 via-white to-teal-50 p-4 dark:border-cyan-500/20 dark:from-cyan-500/10 dark:via-slate-900/40 dark:to-teal-500/10">
                <div className="absolute inset-x-0 top-0 h-0.5 bg-linear-to-r from-cyan-500 to-teal-500" />
                <p className="text-xs font-semibold uppercase tracking-wider text-cyan-700 dark:text-cyan-300">Clients can expect</p>
                <p className="mt-1 font-medium text-foreground">
                  Focused 1:1 guidance, clear next steps, and a smooth booking flow
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-border/60 bg-white/90 shadow-sm backdrop-blur dark:border-white/10 dark:bg-slate-900/70">
          <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-cyan-500 via-sky-500 to-blue-500" />
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="inline-flex size-8 items-center justify-center rounded-full bg-linear-to-br from-cyan-500 to-sky-500 text-white shadow-md shadow-cyan-500/25">
                <Star className="size-4" />
              </span>
              Quick profile summary
            </CardTitle>
            <CardDescription>A modern snapshot to help clients decide faster.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-2xl border border-border/60 bg-muted/40 p-4 dark:border-white/10 dark:bg-white/5">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Industry</p>
              <p className="mt-1 font-semibold text-foreground">
                {expert.industry?.name || "General consulting"}
              </p>
              {expert.industry?.description ? (
                <p className="mt-2 text-sm text-muted-foreground">{expert.industry.description}</p>
              ) : null}
            </div>

            <div className="rounded-2xl border border-border/60 bg-muted/40 p-4 dark:border-white/10 dark:bg-white/5">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Contact</p>
              <p className="mt-1 font-semibold text-foreground break-all">{expert.email}</p>
              <p className="text-sm text-muted-foreground">{expert.phone || "Phone not provided"}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <section className="space-y-4">
        <div>
          <Badge variant="secondary" className="mb-2 bg-cyan-100 text-cyan-700 dark:bg-cyan-500/15 dark:text-cyan-200">
            Book a session
          </Badge>
          <h2 className="text-2xl font-bold tracking-tight">Live availability & booking</h2>
          <p className="text-muted-foreground">
            Choose an open slot, review the session summary, and continue with a secure consultation flow.
          </p>
        </div>

        <BookSessionPanel
          expertId={expert.id}
          expertName={expert.fullName}
          expertTitle={expert.title}
          consultationFee={expert.consultationFee ?? expert.price}
          availability={availability}
          isLoggedIn={isLoggedIn}
          userRole={userRole}
          openSignal={openBookingSignal}
        />
      </section>

      <section className="space-y-4">
        <div>
          <Badge variant="secondary" className="mb-2 bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-200">
            Reviews
          </Badge>
          <h2 className="text-2xl font-bold tracking-tight">Client feedback</h2>
          <p className="text-muted-foreground">
            Reviews shared by clients who have worked with this expert.
          </p>
        </div>

        <ExpertTestimonialsSection testimonials={testimonials} />
      </section>
    </div>
  );
}
