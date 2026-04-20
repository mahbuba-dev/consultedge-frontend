import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Briefcase,
  Building2,
  Lightbulb,
  Rocket,
  ShieldCheck,
  Star,
  Users,
  Zap,
} from "lucide-react";

import TestimonialCard from "@/components/modules/shared/TestimonialCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { ITestimonial } from "@/src/types/testimonial.types";

const audiences = [
  {
    title: "Entrepreneurs",
    description: "Turn bold ideas into executable strategies with guidance from proven business leaders.",
    icon: Lightbulb,
    accent: "text-blue-600 bg-blue-50 dark:bg-blue-950/50",
  },
  {
    title: "Small Business Owners",
    description: "Get practical, actionable advice on operations, growth, and scaling your business.",
    icon: Building2,
    accent: "text-sky-600 bg-sky-50 dark:bg-sky-950/50",
  },
  {
    title: "Startup Founders",
    description: "Move faster with investor-ready insights, product strategy, and go-to-market expertise.",
    icon: Rocket,
    accent: "text-cyan-600 bg-cyan-50 dark:bg-cyan-950/50",
  },
  {
    title: "Students & Career Seekers",
    description: "Get mentorship on internships, career pivots, and navigating competitive industries.",
    icon: BookOpen,
    accent: "text-indigo-600 bg-indigo-50 dark:bg-indigo-950/50",
  },
  {
    title: "Working Professionals",
    description: "Access senior experts for quick, high-value answers to complex professional challenges.",
    icon: Briefcase,
    accent: "text-blue-700 bg-blue-50 dark:bg-blue-950/50",
  },
  {
    title: "Anyone Seeking Expertise",
    description: "Whatever your question, find a verified professional who can answer it with clarity.",
    icon: Zap,
    accent: "text-sky-700 bg-sky-50 dark:bg-sky-950/50",
  },
];

const trustSignals = [
  { icon: ShieldCheck, label: "Verified experts only", sub: "Every profile is reviewed and credentialed" },
  { icon: Star, label: "Business-grade quality", sub: "Advice you can act on immediately" },
  { icon: Users, label: "Built for all professionals", sub: "From students to C-suite executives" },
];

type HomeSection2Props = {
  testimonials: ITestimonial[];
};

export default function HomeSection2({ testimonials }: HomeSection2Props) {
  return (
    <>
      <section className="rounded-[2.25rem] border border-border/60 bg-white/75 p-5 shadow-[0_28px_60px_-40px_rgba(15,23,42,0.28)] backdrop-blur md:p-7 dark:border-white/10 dark:bg-slate-950/55">
        {/* Header */}
        <div className="mx-auto max-w-2xl space-y-3 text-center">
          <Badge variant="secondary" className="bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300">
            Who it's built for
          </Badge>
          <h2 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Expert guidance for every professional who moves fast
          </h2>
          <p className="text-sm text-muted-foreground md:text-base">
            ConsultEdge connects you with verified industry professionals across business, technology,
            finance, marketing, and strategy — so you make smarter decisions, faster.
          </p>
        </div>

        {/* Audience cards */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {audiences.map((item, index) => {
            const Icon = item.icon;
            return (
              <Card
                key={item.title}
                style={{ animationDelay: `${120 + index * 70}ms` }}
                className="consultedge-reveal--visible consultedge-card-glow group border-border/60 bg-white/90 shadow-sm dark:border-white/10 dark:bg-slate-900/80"
              >
                <CardContent className="space-y-3 p-5">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${item.accent}`}>
                    <Icon className="size-5" />
                  </div>
                  <p className="font-semibold text-foreground">{item.title}</p>
                  <p className="text-sm leading-relaxed text-muted-foreground">{item.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Trust signals + CTA */}
        <div className="consultedge-reveal--visible mt-8 rounded-[1.8rem] border border-border/60 bg-linear-to-r from-slate-950 via-blue-950 to-cyan-950 text-white shadow-sm dark:border-white/10" style={{ animationDelay: "520ms" }}>
          <div className="grid gap-6 p-6 md:grid-cols-[1fr_auto] md:items-center md:p-8">
            <div className="grid gap-5 sm:grid-cols-3">
              {trustSignals.map((signal) => {
                const Icon = signal.icon;
                return (
                  <div key={signal.label} className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10">
                      <Icon className="size-4 text-cyan-200" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{signal.label}</p>
                      <p className="text-xs text-slate-300">{signal.sub}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex shrink-0 flex-wrap gap-3">
              <Link
                href="/experts"
                className="inline-flex h-11 items-center gap-2 rounded-full bg-white px-5 text-sm font-medium text-slate-900 transition-all hover:bg-white/90"
              >
                Browse experts
                <ArrowRight className="ml-2 size-4" />
              </Link>
              <Link
                href="/register"
                className="inline-flex h-11 items-center gap-2 rounded-full border border-white/20 bg-transparent px-5 text-sm font-medium text-white transition-all hover:bg-white/10"
              >
                Create account
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-6 rounded-[2.25rem] border bg-linear-to-br from-emerald-50/75 via-white to-cyan-50/65 p-5 shadow-[0_26px_60px_-40px_rgba(5,150,105,0.28)] dark:border-white/10 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 md:p-7">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <Badge variant="secondary" className="mb-2 bg-emerald-100 text-emerald-700">
              Testimonials
            </Badge>
            <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
              What clients are saying
            </h2>
            <p className="text-muted-foreground">
              Real feedback from businesses and professionals using ConsultEdge.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-border/60 bg-white px-4 py-3 text-center dark:border-white/10 dark:bg-slate-800/70">
              <p className="text-lg font-semibold text-foreground">Real</p>
              <p className="text-xs text-muted-foreground">Client feedback</p>
            </div>
            <div className="rounded-2xl border border-border/60 bg-white px-4 py-3 text-center dark:border-white/10 dark:bg-slate-800/70">
              <p className="text-lg font-semibold text-foreground">Fast</p>
              <p className="text-xs text-muted-foreground">Booking experience</p>
            </div>
            <div className="rounded-2xl border border-border/60 bg-white px-4 py-3 text-center dark:border-white/10 dark:bg-slate-800/70">
              <p className="text-lg font-semibold text-foreground">Clear</p>
              <p className="text-xs text-muted-foreground">Consultation flow</p>
            </div>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <TestimonialCard key={testimonial.id} testimonial={testimonial} />
          ))}
        </div>
      </section>
    </>
  );
}
