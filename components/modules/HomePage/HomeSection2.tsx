import Link from "next/link";
import { ArrowRight, CalendarRange, CheckCircle2, Rocket, ShieldCheck } from "lucide-react";

import TestimonialCard from "@/components/modules/shared/TestimonialCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ITestimonial } from "@/src/types/testimonial.types";

const featureCards = [
  {
    title: "Verified expert network",
    description: "Review trusted profiles across strategy, technology, operations, and growth-focused domains.",
    icon: ShieldCheck,
    tone: "from-cyan-100 to-sky-100 text-cyan-700",
  },
  {
    title: "Fast booking experience",
    description: "Choose a time, confirm securely, and keep your consultation details organized in one place.",
    icon: CalendarRange,
    tone: "from-violet-100 to-fuchsia-100 text-violet-700",
  },
  {
    title: "Built for momentum",
    description: "A modern platform experience that helps teams move from questions to confident next steps.",
    icon: Rocket,
    tone: "from-emerald-100 to-cyan-100 text-emerald-700",
  },
];

const collaborationHighlights = [
  "Verified expert profiles and clear specialization",
  "Secure booking and payment-ready consultation flow",
  "Simple dashboards for clients, experts, and admins",
];

type HomeSection2Props = {
  testimonials: ITestimonial[];
};

export default function HomeSection2({ testimonials }: HomeSection2Props) {
  return (
    <>
      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card className="overflow-hidden border-slate-900 bg-linear-to-br from-slate-950 via-violet-950 to-cyan-950 text-white shadow-[0_24px_70px_-30px_rgba(124,58,237,0.45)]">
          <CardContent className="relative space-y-5 p-6 md:p-8">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.08),transparent_40%)]" />

            <div className="relative space-y-5">
              <div>
                <Badge className="mb-3 border-white/15 bg-white/10 text-white hover:bg-white/10">
                  Platform experience
                </Badge>
                <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
                  Designed for teams that want clarity, speed, and credible advice
                </h2>
              </div>

              <p className="text-sm text-slate-200 md:text-base">
                ConsultEdge blends premium UI, expert discovery, and smooth booking so every
                consultation feels intentional from the first click.
              </p>

              <div className="space-y-3">
                {collaborationHighlights.map((item) => (
                  <div key={item} className="flex items-start gap-2 rounded-2xl border border-white/10 bg-white/5 p-3">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-300" />
                    <span className="text-sm text-slate-100">{item}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-3">
                <Link href="/experts">
                  <Button className="bg-white text-slate-900 hover:bg-white/90">
                    Explore experts
                    <ArrowRight className="ml-2 size-4" />
                  </Button>
                </Link>
                <Link href="/register">
                  <Button
                    variant="outline"
                    className="border-white/25 bg-transparent text-white hover:bg-white/10 hover:text-white"
                  >
                    Create account
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 sm:grid-cols-2">
          {featureCards.map((feature) => {
            const Icon = feature.icon;

            return (
              <Card
                key={feature.title}
                className="border-border/60 bg-white/85 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-white/10 dark:bg-slate-900/80 dark:shadow-black/20"
              >
                <CardHeader>
                  <div
                    className={`mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-linear-to-br ${feature.tone}`}
                  >
                    <Icon className="size-5" />
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            );
          })}

          <Card className="border-violet-200/70 bg-linear-to-r from-violet-50 via-white to-cyan-50 shadow-sm sm:col-span-2 dark:border-violet-500/20 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900">
            <CardContent className="grid gap-4 p-5 md:grid-cols-3 md:p-6">
              <div>
                <p className="text-sm font-semibold text-violet-700">Why it feels better</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  A cleaner, smarter consultation journey for modern teams and professionals.
                </p>
              </div>

              <div className="rounded-2xl border border-white/70 bg-white/80 p-4">
                <p className="text-sm font-semibold text-foreground">Simple discovery</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Find the right expert without friction.
                </p>
              </div>

              <div className="rounded-2xl border border-white/70 bg-white/80 p-4">
                <p className="text-sm font-semibold text-foreground">Clear next steps</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Keep bookings, payments, and progress easy to follow.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="space-y-6 rounded-[2rem] border bg-linear-to-br from-emerald-50/70 via-white to-cyan-50/60 p-5 shadow-sm dark:border-white/10 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 md:p-6">
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
            <div className="rounded-2xl border border-white/70 bg-white/80 px-4 py-3 text-center">
              <p className="text-lg font-semibold text-foreground">Real</p>
              <p className="text-xs text-muted-foreground">Client feedback</p>
            </div>
            <div className="rounded-2xl border border-white/70 bg-white/80 px-4 py-3 text-center">
              <p className="text-lg font-semibold text-foreground">Fast</p>
              <p className="text-xs text-muted-foreground">Booking experience</p>
            </div>
            <div className="rounded-2xl border border-white/70 bg-white/80 px-4 py-3 text-center">
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
