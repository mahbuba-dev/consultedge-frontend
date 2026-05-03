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
  Quote,
  Users,
  Zap,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { ITestimonial } from "@/src/types/testimonial.types";

const audiences = [
  {
    title: "Entrepreneurs",
    description: "Turn bold ideas into executable strategies with guidance from proven business leaders.",
    icon: Lightbulb,
    accent: "from-blue-500 to-cyan-500",
    glow: "shadow-cyan-500/20",
  },
  {
    title: "Small Business Owners",
    description: "Get practical, actionable advice on operations, growth, and scaling your business.",
    icon: Building2,
    accent: "from-sky-500 to-blue-500",
    glow: "shadow-sky-500/20",
  },
  {
    title: "Startup Founders",
    description: "Move faster with investor-ready insights, product strategy, and go-to-market expertise.",
    icon: Rocket,
    accent: "from-cyan-500 to-teal-500",
    glow: "shadow-cyan-500/20",
  },
  {
    title: "Students & Career Seekers",
    description: "Get mentorship on internships, career pivots, and navigating competitive industries.",
    icon: BookOpen,
    accent: "from-blue-600 to-indigo-500",
    glow: "shadow-blue-500/20",
  },
  {
    title: "Working Professionals",
    description: "Access senior experts for quick, high-value answers to complex professional challenges.",
    icon: Briefcase,
    accent: "from-teal-500 to-emerald-500",
    glow: "shadow-emerald-500/20",
  },
  {
    title: "Anyone Seeking Expertise",
    description: "Whatever your question, find a verified professional who can answer it with clarity.",
    icon: Zap,
    accent: "from-amber-500 to-rose-500",
    glow: "shadow-rose-500/20",
  },
  {
    title: "Investors & Advisors",
    description: "Validate decisions with sector specialists before committing capital or making strategic moves.",
    icon: ShieldCheck,
    accent: "from-violet-500 to-fuchsia-500",
    glow: "shadow-violet-500/20",
  },
  {
    title: "Teams & Agencies",
    description: "Plug in expert reviewers and on-demand mentors to ship faster and raise the bar on every deliverable.",
    icon: Users,
    accent: "from-emerald-500 to-cyan-500",
    glow: "shadow-emerald-500/20",
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
  const homeTestimonials = testimonials.slice(0, 4);
  const scrollingTestimonials = homeTestimonials.length > 0 ? [...homeTestimonials, ...homeTestimonials] : [];

  const getReviewerName = (testimonial: ITestimonial) => {
    const namedReviewer =
      testimonial.reviewerName ||
      testimonial.client?.fullName ||
      testimonial.client?.user?.name;
    if (namedReviewer) return namedReviewer;

    // Keep reviewer identity readable even if profile details are partially missing.
    return "Verified Client";
  };

  return (
    <>
      <section className="relative overflow-hidden rounded-(--ce-shell-radius) border border-border/60 bg-white/52 p-5 shadow-(--ce-shell-shadow-soft) backdrop-blur-2xl md:rounded-(--ce-shell-radius-md) md:p-7 dark:rounded-(--ce-shell-radius-dark) dark:border-white/10 dark:bg-slate-950/45">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(124deg,rgba(255,255,255,0.45),rgba(255,255,255,0.1)_45%,rgba(59,130,246,0.08)_100%)] dark:bg-[linear-gradient(124deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02)_45%,rgba(56,189,248,0.08)_100%)]"
        />
        {/* Header */}
        <div className="relative mx-auto max-w-2xl space-y-3 text-center">
          <Badge variant="secondary" className="bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300">
            Who it&apos;s built for
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
        <div className="relative mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {audiences.map((item, index) => {
            const Icon = item.icon;
            return (
              <Card
                key={item.title}
                style={{ animationDelay: `${120 + index * 70}ms` }}
                className="consultedge-reveal--visible group relative overflow-hidden border-border/60 bg-white/90 shadow-sm transition-all hover:-translate-y-1 hover:border-blue-300 hover:shadow-lg dark:border-white/10 dark:bg-slate-900/80 dark:hover:border-cyan-400/30 dark:hover:shadow-cyan-500/10"
              >
                <div
                  aria-hidden
                  className={`pointer-events-none absolute inset-x-0 top-0 h-1 bg-linear-to-r ${item.accent} opacity-80`}
                />
                <div
                  aria-hidden
                  className={`pointer-events-none absolute -right-12 -top-12 size-32 rounded-full bg-linear-to-br ${item.accent} opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-20`}
                />
                <CardContent className="relative space-y-3 p-6">
                  <div
                    className={`flex size-11 items-center justify-center rounded-2xl bg-linear-to-br ${item.accent} text-white shadow-md ${item.glow} transition-transform group-hover:scale-110`}
                  >
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
        <div className="consultedge-reveal--visible relative mt-8 rounded-[1.8rem] border border-border/60 bg-linear-to-r from-slate-950 via-blue-950 to-cyan-950 text-white shadow-sm dark:border-white/10" style={{ animationDelay: "520ms" }}>
          <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[1fr_auto] lg:items-center lg:p-8">
            <div className="grid gap-4 sm:grid-cols-3">
              {trustSignals.map((signal) => {
                const Icon = signal.icon;
                return (
                  <div key={signal.label} className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10">
                      <Icon className="size-4 text-cyan-200" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white">{signal.label}</p>
                      <p className="text-xs text-slate-300">{signal.sub}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex w-full shrink-0 flex-col gap-3 sm:flex-row sm:flex-wrap lg:w-auto">
              <Link
                href="/experts"
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-white px-5 text-sm font-medium text-slate-900 transition-all hover:bg-white/90 sm:w-auto"
              >
                Browse experts
                <ArrowRight className="ml-1 size-4" />
              </Link>
              <Link
                href="/register"
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full border border-white/20 bg-transparent px-6 text-sm font-medium text-white transition-all hover:bg-white/10 sm:w-auto"
              >
                Create account
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section id="home-testimonials" className="mt-6 scroll-mt-28 overflow-hidden rounded-(--ce-shell-radius) border border-blue-200/70 bg-linear-to-br from-slate-950 via-blue-950 to-cyan-950 p-5 text-white shadow-(--ce-shell-shadow-strong) md:rounded-(--ce-shell-radius-md) md:p-7 lg:p-9 dark:rounded-(--ce-shell-radius-dark) dark:border-white/10">
        <div className="relative overflow-hidden rounded-[1.8rem] border border-white/15 bg-white/6 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.28)] backdrop-blur-xl md:p-7">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_8%_10%,rgba(147,197,253,0.35),transparent_32%),radial-gradient(circle_at_86%_80%,rgba(34,211,238,0.24),transparent_34%)]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(rgba(191,219,254,0.34)_1px,transparent_1px)] bg-size-[18px_18px] opacity-30"
          />

          {["8% 12%", "21% 78%", "34% 28%", "48% 86%", "63% 18%", "76% 62%", "89% 32%"].map((position, index) => {
            const [left, top] = position.split(" ");
            return (
              <span
                key={position}
                aria-hidden
                style={{ left, top, animationDelay: `${index * 0.45}s` }}
                className="pointer-events-none absolute h-1.5 w-1.5 rounded-full bg-cyan-100/65 shadow-[0_0_14px_rgba(165,243,252,0.85)] animate-pulse"
              />
            );
          })}

          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl space-y-2">
              <Badge className="border-white/20 bg-white/10 text-white hover:bg-white/10">
                Testimonials
              </Badge>
              <h2 className="text-2xl font-bold tracking-tight text-white md:text-3xl lg:text-4xl">
                Stories from teams who moved faster with ConsultEdge
              </h2>
              <p className="text-sm text-slate-200/90 md:text-base">
                Real client outcomes, shared by founders, operators, and professionals who booked expert sessions.
              </p>
            </div>

            <div className="flex items-center justify-between gap-3 sm:justify-end">
              <p className="text-sm font-semibold text-slate-100">{homeTestimonials.length} client stories</p>
              <span className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold tracking-wide text-cyan-100">
                Live client voices
              </span>
            </div>
          </div>

          <div className="relative mt-6 overflow-hidden rounded-[1.8rem] border border-white/15 bg-slate-950/30 px-2 py-3">
            <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-linear-to-r from-slate-950 via-slate-950/70 to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-linear-to-l from-slate-950 via-slate-950/70 to-transparent" />

            <div className="industry-marquee-track flex w-max items-stretch gap-4 py-1" style={{ animationDuration: `${Math.max(24, homeTestimonials.length * 8)}s` }}>
              {scrollingTestimonials.map((testimonial, index) => (
                <article
                  key={`${testimonial.id}-${index}`}
                  className="w-[68vw] shrink-0 rounded-3xl border border-white/25 bg-linear-to-b from-white/22 to-white/10 p-4 shadow-[0_24px_56px_-34px_rgba(15,23,42,0.85)] backdrop-blur-md sm:w-72 sm:p-5 lg:w-64 xl:w-64"
                >
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-base font-semibold text-white">
                        {getReviewerName(testimonial)}
                      </p>
                      <p className="text-xs text-cyan-100/90">Verified client</p>
                    </div>
                    <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/10 text-cyan-100">
                      <Quote className="size-4" />
                    </div>
                  </div>

                  <div className="mb-3 flex items-center gap-1 text-amber-300">
                    {Array.from({ length: 5 }).map((_, starIndex) => (
                      <Star
                        key={starIndex}
                        className={`size-4 ${starIndex < Number(testimonial.rating || 0) ? "fill-current" : "text-white/30"}`}
                      />
                    ))}
                  </div>

                  <p className="line-clamp-4 text-sm leading-6 text-slate-100/95">
                    {testimonial.comment || "A positive consultation experience shared by the client."}
                  </p>

                  {testimonial.expert?.fullName ? (
                    <div className="mt-3 text-xs font-medium text-cyan-100/90">For {testimonial.expert.fullName}</div>
                  ) : null}
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
