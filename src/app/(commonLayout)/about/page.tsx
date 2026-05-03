import Link from "next/link";
import {
  ArrowRight,
  Bot,
  BrainCircuit,
  CalendarCheck,
  Globe2,
  Layers,
  LineChart,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  Users,
  Zap,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const metadata = {
  title: "About Us | ConsultEdge",
  description:
    "Learn how ConsultEdge connects forward-thinking teams with verified expert consultants through an AI-powered, end-to-end consultation platform.",
};

const stats = [
  { label: "Verified experts", value: "500+" },
  { label: "Sessions completed", value: "12,000+" },
  { label: "Industries covered", value: "40+" },
  { label: "Countries served", value: "60+" },
];

const values = [
  {
    icon: ShieldCheck,
    title: "Trust first",
    description:
      "Every expert is manually reviewed and verified before joining the platform. Credentials, track records, and client outcomes are all scrutinized.",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: Zap,
    title: "Speed without sacrifice",
    description:
      "From discovering an expert to booking a confirmed session, we've removed every friction point. Most bookings complete in under 3 minutes.",
    color: "from-amber-500 to-orange-500",
  },
  {
    icon: BrainCircuit,
    title: "Intelligent by default",
    description:
      "Our AI engine personalises every search, recommendation, and suggestion — so you always see the most relevant experts first.",
    color: "from-purple-500 to-indigo-500",
  },
  {
    icon: Globe2,
    title: "Global reach, local insight",
    description:
      "ConsultEdge connects clients and experts across 60+ countries, with deep expertise in regional markets and global industries.",
    color: "from-emerald-500 to-teal-500",
  },
];

const milestones = [
  {
    year: "2022",
    title: "Founded",
    description: "ConsultEdge was created to solve one problem: making expert advice accessible to every team.",
  },
  {
    year: "2023",
    title: "AI-powered search",
    description: "We launched personalised AI search, surfacing the right expert for each unique query.",
  },
  {
    year: "2024",
    title: "500 verified experts",
    description: "Our expert network reached 500 vetted specialists spanning 40+ industries globally.",
  },
  {
    year: "2025",
    title: "RAG intelligence",
    description: "Retrieval-augmented AI introduced, grounding every chat response in real platform data.",
  },
  {
    year: "2026",
    title: "Enterprise ready",
    description: "Team plans, multi-seat dashboards, and enterprise SLAs — serving organisations of every size.",
  },
];

const aiFeatures = [
  {
    icon: Bot,
    title: "AI chat assistant",
    description: "Ask anything about bookings, experts, payments, or process. Answers grounded in real platform data via RAG.",
  },
  {
    icon: Sparkles,
    title: "Personalised recommendations",
    description: "Your activity shapes a unique feed of experts and topics — the more you explore, the smarter it gets.",
  },
  {
    icon: Target,
    title: "Smart search",
    description: "Semantic search understands intent, not just keywords — finding experts you'd never have thought to search for.",
  },
  {
    icon: LineChart,
    title: "Trending analysis",
    description: "Platform-wide activity signals surface trending experts and emerging industries in real time.",
  },
  {
    icon: Layers,
    title: "Content suggestions",
    description: "AI-curated playbooks and insights arrive tailored to your industry focus and recent searches.",
  },
  {
    icon: CalendarCheck,
    title: "Predictive booking nudges",
    description: "The platform anticipates your next need and surfaces relevant offers and availability proactively.",
  },
];

const teamMembers = [
  {
    name: "Sarah Chen",
    role: "CEO & Co-Founder",
    bio: "Former McKinsey partner with 14 years in strategy consulting. Built ConsultEdge to give every team access to senior-level guidance.",
    initials: "SC",
    accent: "from-blue-500 to-cyan-500",
  },
  {
    name: "Marcus Reid",
    role: "CTO & Co-Founder",
    bio: "Ex-Google engineer and AI researcher. Designed the personalization engine and RAG architecture powering ConsultEdge's intelligence layer.",
    initials: "MR",
    accent: "from-purple-500 to-indigo-500",
  },
  {
    name: "Priya Nair",
    role: "Head of Expert Success",
    bio: "Spent 8 years building expert networks at top advisory firms. Oversees every expert's onboarding, verification, and ongoing quality.",
    initials: "PN",
    accent: "from-emerald-500 to-teal-500",
  },
  {
    name: "Daniel Torres",
    role: "VP Product",
    bio: "Product leader with a background in marketplace platforms. Drives ConsultEdge's end-to-end booking and discovery experience.",
    initials: "DT",
    accent: "from-orange-500 to-amber-500",
  },
];

export default function AboutPage() {
  return (
    <main className="relative overflow-hidden pb-20 pt-4">
      {/* background glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-200 bg-[radial-gradient(circle_at_10%_10%,rgba(37,99,235,0.14),transparent_40%),radial-gradient(circle_at_90%_14%,rgba(34,211,238,0.14),transparent_40%)]"
      />

      <div className="mx-auto max-w-6xl space-y-24 px-4 md:px-6">
        {/* ── HERO ─────────────────────────────────────── */}
        <section className="relative overflow-hidden rounded-[2.2rem] border border-blue-200/50 bg-linear-to-br from-slate-950 via-blue-950 to-cyan-950 px-8 py-14 text-center text-white shadow-[0_40px_100px_-30px_rgba(34,211,238,0.4)] md:px-16 md:py-20 dark:border-white/10">
          <div aria-hidden className="pointer-events-none absolute -left-28 -top-28 size-96 rounded-full bg-blue-500/25 blur-[120px]" />
          <div aria-hidden className="pointer-events-none absolute -bottom-24 -right-20 size-80 rounded-full bg-cyan-400/25 blur-[100px]" />

          <div className="relative mx-auto max-w-3xl space-y-6">
            <Badge className="border-white/20 bg-white/10 text-white hover:bg-white/10">
              <Sparkles className="mr-1.5 size-3.5" />
              Our story
            </Badge>

            <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl lg:text-6xl">
              Expert advice,{" "}
              <span className="bg-linear-to-r from-cyan-300 via-sky-300 to-blue-300 bg-clip-text text-transparent">
                intelligently delivered
              </span>
            </h1>

            <p className="mx-auto max-w-2xl text-base text-white/75 md:text-lg">
              ConsultEdge is the AI-powered consultation marketplace that connects ambitious teams with
              verified experts — making high-quality advisory accessible, fast, and personal.
            </p>

            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <Button asChild className="h-11 rounded-full bg-white px-6 text-slate-900 font-semibold hover:bg-white/90">
                <Link href="/experts">
                  Browse experts <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-11 rounded-full border-white/20 bg-white/10 px-6 text-white hover:bg-white/15">
                <Link href="/contact">Get in touch</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* ── STATS ─────────────────────────────────────── */}
        <section>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="flex flex-col items-center justify-center gap-1 rounded-2xl border border-blue-100/60 bg-linear-to-br from-blue-50/80 to-cyan-50/60 p-6 text-center shadow-sm dark:border-white/10 dark:from-slate-900/80 dark:to-slate-800/60"
              >
                <span className="text-3xl font-extrabold tracking-tight text-blue-700 dark:text-cyan-300 md:text-4xl">
                  {stat.value}
                </span>
                <span className="text-xs font-medium text-muted-foreground md:text-sm">{stat.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── MISSION ─────────────────────────────────────── */}
        <section className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div className="space-y-5">
            <Badge variant="secondary" className="gap-1.5 bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-200">
              <Target className="size-3.5" />
              Our mission
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Making great advice accessible to every team
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              For too long, access to senior expert guidance has been limited to large enterprises with big
              advisory budgets. ConsultEdge changes that. By building an AI-first marketplace, we've made
              it possible for any team — a two-person startup or a 200-person scaleup — to get the exact
              expertise they need, when they need it.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Every feature we build serves one goal: to reduce the distance between a question and the
              expert who can answer it best.
            </p>
            <Button asChild className="h-11 rounded-full bg-blue-600 px-6 text-white hover:bg-blue-700">
              <Link href="/how-it-works">
                See how it works <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {values.map((v) => {
              const Icon = v.icon;
              return (
                <Card key={v.title} className="border-border/70 bg-card/80 backdrop-blur-sm">
                  <CardContent className="space-y-3 p-5">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br ${v.color} text-white shadow-lg`}>
                      <Icon className="size-5" />
                    </div>
                    <h3 className="font-semibold">{v.title}</h3>
                    <p className="text-xs leading-relaxed text-muted-foreground">{v.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* ── AI FEATURES ─────────────────────────────────────── */}
        <section className="rounded-[2rem] border border-blue-200/50 bg-linear-to-br from-blue-50/60 via-background to-cyan-50/40 p-8 dark:border-white/10 dark:from-slate-950 dark:via-[#071326] dark:to-slate-950 md:p-12">
          <div className="mb-10 text-center">
            <Badge variant="secondary" className="mb-3 gap-1.5 bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-200">
              <BrainCircuit className="size-3.5" />
              AI-powered platform
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Intelligence built into every interaction
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm text-muted-foreground md:text-base">
              ConsultEdge uses AI throughout the platform — from the moment you search to the moment you
              book — to save time and surface better matches.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {aiFeatures.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="flex gap-4 rounded-2xl border border-blue-100/70 bg-white/80 p-5 shadow-sm dark:border-white/10 dark:bg-slate-900/50"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white">
                    <Icon className="size-4.5" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-semibold">{feature.title}</h3>
                    <p className="text-xs leading-relaxed text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── TIMELINE ─────────────────────────────────────── */}
        <section>
          <div className="mb-10 text-center">
            <Badge variant="secondary" className="mb-3 gap-1.5 bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200">
              <Star className="size-3.5" />
              Our journey
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight">Built with purpose, milestone by milestone</h2>
          </div>

          <div className="relative">
            <div className="absolute left-6 top-0 bottom-0 w-px bg-linear-to-b from-blue-400 via-cyan-400 to-transparent opacity-30 md:left-1/2" />
            <div className="space-y-8">
              {milestones.map((m, i) => (
                <div
                  key={m.year}
                  className={`relative flex gap-6 md:w-[46%] ${i % 2 === 0 ? "md:ml-0" : "md:ml-auto md:flex-row-reverse"}`}
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-blue-400/50 bg-blue-600 text-xs font-bold text-white">
                    {m.year.slice(2)}
                  </div>
                  <div className="flex-1 rounded-2xl border border-border/60 bg-card/80 p-5 shadow-sm">
                    <div className="mb-1 text-xs font-semibold text-blue-600 dark:text-blue-400">{m.year}</div>
                    <h3 className="font-semibold">{m.title}</h3>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{m.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── TEAM ─────────────────────────────────────── */}
        <section>
          <div className="mb-10 text-center">
            <Badge variant="secondary" className="mb-3 gap-1.5 bg-purple-100 text-purple-700 dark:bg-purple-500/15 dark:text-purple-200">
              <Users className="size-3.5" />
              Leadership team
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight">The people building ConsultEdge</h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground">
              A small, focused team with deep expertise in consulting, AI, and product — obsessed with
              making advisory radically more accessible.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {teamMembers.map((member) => (
              <Card key={member.name} className="border-border/70 text-center">
                <CardContent className="space-y-3 pt-6">
                  <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-linear-to-br ${member.accent} text-xl font-bold text-white shadow-lg`}>
                    {member.initials}
                  </div>
                  <div>
                    <h3 className="font-semibold">{member.name}</h3>
                    <p className="text-xs text-blue-600 dark:text-blue-400">{member.role}</p>
                  </div>
                  <p className="text-xs leading-relaxed text-muted-foreground">{member.bio}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* ── CTA ─────────────────────────────────────── */}
        <section className="relative overflow-hidden rounded-[2rem] border border-cyan-400/20 bg-linear-to-r from-blue-950 via-slate-900 to-cyan-950 p-10 text-center text-white shadow-[0_30px_80px_-24px_rgba(34,211,238,0.35)] md:p-14">
          <div aria-hidden className="pointer-events-none absolute -left-20 top-0 size-72 rounded-full bg-blue-500/20 blur-[100px]" />
          <div aria-hidden className="pointer-events-none absolute -right-16 bottom-0 size-64 rounded-full bg-cyan-400/20 blur-[90px]" />
          <div className="relative mx-auto max-w-2xl space-y-5">
            <h2 className="text-3xl font-bold md:text-4xl">Ready to find your expert?</h2>
            <p className="text-sm text-white/70 md:text-base">
              Browse hundreds of verified specialists and book your first session today.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button asChild className="h-11 rounded-full bg-white px-6 text-slate-900 font-semibold hover:bg-white/90">
                <Link href="/experts">
                  Explore experts <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-11 rounded-full border-white/20 bg-white/10 px-6 text-white hover:bg-white/15">
                <Link href="/contact">Contact us</Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
