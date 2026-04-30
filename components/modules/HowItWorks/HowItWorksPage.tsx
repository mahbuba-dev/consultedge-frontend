"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  CalendarCheck,
  CalendarRange,
  CheckCircle2,
  CreditCard,
  MessageCircle,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  TrendingUp,
  Video,
  Zap,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

/* ─────────────────────────────────────────────────────────────
   COUNT UP COMPONENT
───────────────────────────────────────────────────────────── */
function CountUp({
  value,
  duration = 1200,
  suffix = "",
  decimals = 0,
}: {
  value: number;
  duration?: number;
  suffix?: string;
  decimals?: number;
}) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const startTime = performance.now();

    const animate = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const current = start + (value - start) * progress;
      setCount(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value, duration]);

  return (
    <span>
      {decimals > 0 ? count.toFixed(decimals) : Math.floor(count)}
      {suffix}
    </span>
  );
}

const steps = [
  {
    number: "01",
    icon: Search,
    color: "from-blue-500 to-blue-600",
    glow: "shadow-[0_8px_32px_-8px_rgba(59,130,246,0.55)]",
    title: "Browse & Discover",
    description:
      "Search our curated directory of verified specialists. Filter by expertise, industry, price range, and availability to find the perfect match for your challenge.",
    highlights: ["Advanced filters", "Verified profiles", "Read real reviews"],
  },
  {
    number: "02",
    icon: CalendarCheck,
    color: "from-cyan-500 to-pink-500",
    glow: "shadow-[0_8px_32px_-8px_rgba(217,70,239,0.55)]",
    title: "Book a Session",
    description:
      "Pick a time slot that fits your schedule. Our smart calendar shows real-time availability so you book instantly — no back-and-forth emails.",
    highlights: ["Real-time availability", "Instant confirmation", "Secure payment"],
  },
  {
    number: "03",
    icon: Video,
    color: "from-sky-500 to-cyan-500",
    glow: "shadow-[0_8px_32px_-8px_rgba(14,165,233,0.55)]",
    title: "Meet Your Expert",
    description:
      "Join your session via built-in video call or live chat. Your expert comes prepared — no fluff, straight to actionable insight.",
    highlights: ["Built-in video call", "Live chat option", "Session recording"],
  },
  {
    number: "04",
    icon: TrendingUp,
    color: "from-emerald-500 to-teal-500",
    glow: "shadow-[0_8px_32px_-8px_rgba(16,185,129,0.55)]",
    title: "Act on Insights",
    description:
      "Walk away with a clear plan. Track your follow-ups in your dashboard, re-book the same expert, or explore new specialists as your needs evolve.",
    highlights: ["Dashboard tracking", "Re-book anytime", "Ongoing support"],
  },
];

const whyCards = [
  {
    icon: BadgeCheck,
    label: "Vetted experts",
    desc: "Every specialist goes through identity, credentials, and experience verification before appearing on the platform.",
    color: "text-blue-600 dark:text-blue-400",
    bg: "from-blue-50 to-blue-100/60 dark:from-blue-950/40 dark:to-blue-900/20",
  },
  {
    icon: CreditCard,
    label: "Secure payments",
    desc: "Payments are processed through an encrypted, PCI-compliant gateway. You're charged only after your booking is confirmed.",
    color: "text-cyan-600 dark:text-cyan-400",
    bg: "from-cyan-50 to-cyan-100/60 dark:from-cyan-950/40 dark:to-cyan-900/20",
  },
  {
    icon: Zap,
    label: "Instant scheduling",
    desc: "No waiting. Experts publish their availability in real time so you book, confirm, and join — all in under two minutes.",
    color: "text-sky-600 dark:text-sky-400",
    bg: "from-sky-50 to-sky-100/60 dark:from-sky-950/40 dark:to-sky-900/20",
  },
  {
    icon: MessageCircle,
    label: "Built-in chat",
    desc: "Message your expert before and after the session. No personal emails, everything stays in one organised place.",
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "from-emerald-50 to-emerald-100/60 dark:from-emerald-950/40 dark:to-emerald-900/20",
  },
  {
    icon: Star,
    label: "Honest reviews",
    desc: "Only clients who completed a session can leave a review, so every rating reflects a real experience.",
    color: "text-amber-600 dark:text-amber-400",
    bg: "from-amber-50 to-amber-100/60 dark:from-amber-950/40 dark:to-amber-900/20",
  },
  {
    icon: ShieldCheck,
    label: "Privacy first",
    desc: "Your consultation data, messages, and recordings are private by default. You control who sees what.",
    color: "text-rose-600 dark:text-rose-400",
    bg: "from-rose-50 to-rose-100/60 dark:from-rose-950/40 dark:to-rose-900/20",
  },
];

/* ─────────────────────────────────────────────────────────────
   UPDATED STATS (for animation)
───────────────────────────────────────────────────────────── */
const stats = [
  { value: 500, suffix: "+", label: "Verified experts" },
  { value: 12000, suffix: "+", label: "Sessions completed" },
  { value: 4.9, suffix: "", label: "Average rating", decimals: 1 },
  { value: 98, suffix: "%", label: "Satisfaction rate" },
];

export default function HowItWorksPage() {
  return (
    <div className="space-y-20 pb-16">
      {/* ── Page header ─────────────────────────────────────────────── */}
      <section className="space-y-5 text-center">
        <Badge className="border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/50 dark:text-blue-300">
          <Sparkles className="mr-1.5 size-3.5" />
          Simple by design
        </Badge>
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white md:text-5xl">
          How{" "}
          <span className="bg-linear-to-r from-blue-600 via-cyan-500 to-sky-500 bg-clip-text text-transparent">
            ConsultEdge
          </span>{" "}
          works
        </h1>
        <p className="mx-auto max-w-xl text-base text-slate-500 dark:text-slate-400 md:text-lg">
          Four steps from problem to clarity. No friction, no guesswork — just the right expert at
          the right time.
        </p>
      </section>

      {/* ── Stats strip (ANIMATED) ─────────────────────────────────── */}
      <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {stats.map(({ value, label, suffix, decimals }) => (
          <div
            key={label}
            className="group relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white/80 py-6 text-center shadow-sm backdrop-blur transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-white/10 dark:bg-slate-900/70 dark:shadow-cyan-500/5 dark:hover:border-cyan-400/30 dark:hover:shadow-cyan-500/10"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 h-0.5 bg-linear-to-r from-blue-500 via-cyan-500 to-sky-500 opacity-60"
            />
            <p className="bg-linear-to-r from-blue-600 via-cyan-500 to-sky-500 bg-clip-text text-3xl font-extrabold text-transparent md:text-4xl dark:from-blue-400 dark:via-cyan-300 dark:to-sky-300">
              <CountUp value={value} suffix={suffix} decimals={decimals ?? 0} />
            </p>
            <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">
              {label}
            </p>
          </div>
        ))}
      </section>

      {/* ── Steps ───────────────────────────────────────────────────── */}
      <section className="space-y-6">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-blue-500 dark:text-blue-400">
            The journey
          </p>
          <h2 className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
            Four steps to expert guidance
          </h2>
        </div>

        <div className="grid gap-5 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-4">
          {steps.map(({ number, icon: Icon, color, glow, title, description, highlights }) => (
            <div
              key={number}
              className="group relative overflow-hidden rounded-[24px] border border-slate-200/70 bg-white/80 p-7 shadow-sm backdrop-blur transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-white/10 dark:bg-slate-900/70 dark:hover:border-cyan-400/30 dark:hover:shadow-cyan-500/10"
            >
              <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-[radial-gradient(ellipse_at_top_left,rgba(59,130,246,0.06),transparent_60%)] dark:bg-[radial-gradient(ellipse_at_top_left,rgba(34,211,238,0.12),transparent_60%)]" />

              <div className="relative space-y-4">
                <div className="flex items-center gap-4">
                  <span
                    className={`flex size-12 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br ${color} ${glow} text-white`}
                  >
                    <Icon className="size-5" />
                  </span>
                  <span className="select-none bg-linear-to-br from-slate-200 to-slate-100 bg-clip-text text-4xl font-black text-transparent dark:from-white/10 dark:to-cyan-400/20">
                    {number}
                  </span>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h3>
                  <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                    {description}
                  </p>
                </div>

                <ul className="space-y-1.5">
                  {highlights.map((h) => (
                    <li
                      key={h}
                      className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300"
                    >
                      <CheckCircle2 className="size-3.5 shrink-0 text-blue-500 dark:text-cyan-400" />
                      {h}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Why ConsultEdge ─────────────────────────────────────────── */}
      <section className="space-y-8">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-blue-500 dark:text-blue-400">
            Built right
          </p>
          <h2 className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
            Why clients trust ConsultEdge
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {whyCards.map(({ icon: Icon, label, desc, color, bg }) => (
            <div
              key={label}
              className="group rounded-2xl border border-slate-200/70 bg-white/80 p-5 shadow-sm backdrop-blur transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-white/10 dark:bg-slate-900/70 dark:hover:border-cyan-400/30 dark:hover:shadow-cyan-500/10"
            >
              <span
                className={`mb-3 flex size-10 items-center justify-center rounded-xl bg-linear-to-br ${bg}`}
              >
                <Icon className={`size-4.5 ${color}`} />
              </span>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{label}</p>
              <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                {desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA banner ──────────────────────────────────────────────── */}
      <section className="relative overflow-hidden rounded-[28px] bg-slate-950 px-8 py-14 shadow-[0_40px_100px_-24px_rgba(59,130,246,0.4)] md:py-20">
        <div className="pointer-events-none absolute -left-24 -top-24 size-96 rounded-full bg-blue-600/30 blur-[90px]" />
        <div className="pointer-events-none absolute -bottom-20 right-0 size-80 rounded-full bg-sky-500/25 blur-[80px]" />
        <div className="pointer-events-none absolute left-1/2 top-1/2 size-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500/20 blur-[70px]" />

        <div className="relative flex flex-col items-center gap-8 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 px-3.5 py-1.5 text-xs font-semibold tracking-wide text-blue-300">
            <Sparkles className="size-3" />
            Start in under 2 minutes
          </span>

          <div className="space-y-4">
            <h2 className="text-4xl font-black leading-tight tracking-tight text-white md:text-5xl">
              The right expert is{" "}
              <span className="bg-linear-to-r from-blue-400 via-cyan-400 to-sky-400 bg-clip-text text-transparent">
                waiting for you.
              </span>
            </h2>
            <p className="mx-auto max-w-md text-sm leading-relaxed text-slate-400 md:text-base">
              Browse verified specialists across every domain, pick a time that suits you, and walk
              away with a clear plan.
            </p>
          </div>

          <div className="flex flex-col items-center gap-3 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="rounded-xl bg-linear-to-r from-blue-500 via-cyan-500 to-sky-500 px-7 font-semibold text-white shadow-[0_8px_32px_-8px_rgba(59,130,246,0.7)] hover:opacity-90"
            >
              <Link href="/experts">
                Browse experts
                <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>

            <Button
              asChild
              size="lg"
              variant="ghost"
              className="rounded-xl border border-white/10 bg-white/5 px-7 text-slate-200 backdrop-blur hover:bg-white/10 hover:text-white"
            >
              <Link href="/apply-expert">
                <CalendarRange className="mr-2 size-4" />
                Become an expert
              </Link>
            </Button>
          </div>

          <div className="text-left flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-slate-500">
            <span className="flex gap-1.5">
              <CheckCircle2 className="size-3.5 text-blue-400" />
              No credit card required
            </span>
            <span className="flex mr-2  gap-1.5">
              <CheckCircle2 className="size-3.5 text-cyan-400" />
              500+ verified experts
            </span>
            <span className="flex  gap-1.5 mr-7">
              <CheckCircle2 className="size-3.5 text-sky-400" />
              Cancel any time
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}