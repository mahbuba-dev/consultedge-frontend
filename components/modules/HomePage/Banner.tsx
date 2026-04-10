import Link from "next/link";
import {
  ArrowRight,
  CalendarRange,
  Globe2,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const platformSignals = ["Cloud & AI", "Cyber security", "Business advisory"];

const valueCards = [
  {
    title: "Trusted expert network",
    description: "Connect with specialists across growth, operations, and digital transformation.",
    icon: Users,
    tone: "text-cyan-300",
  },
  {
    title: "Fast booking journey",
    description: "From discovery to scheduling, every step feels clean, secure, and premium.",
    icon: CalendarRange,
    tone: "text-fuchsia-300",
  },
  {
    title: "Built for modern teams",
    description: "ConsultEdge supports clients, experts, and admins through one polished platform.",
    icon: ShieldCheck,
    tone: "text-emerald-300",
  },
];

export default function Banner() {
  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-slate-800 bg-slate-950 px-6 py-10 text-white shadow-2xl md:px-10 md:py-14">
      <div className="absolute inset-0 bg-linear-to-br from-slate-950 via-violet-950 to-cyan-950" />
      <div className="consultedge-hero-orb absolute -left-10 top-4 h-40 w-40 rounded-full bg-cyan-400/20 blur-3xl" />
      <div className="consultedge-hero-orb consultedge-hero-orb--delay absolute bottom-0 right-0 h-52 w-52 rounded-full bg-fuchsia-500/15 blur-3xl" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:32px_32px] opacity-25" />

      <div className="relative grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
        <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-700">
          <Badge className="border-white/20 bg-white/10 text-white hover:bg-white/10">
            <Sparkles className="mr-1 size-3.5" />
            Transforming ideas into possibilities
          </Badge>

          <div className="space-y-4">
            <h1 className="max-w-3xl text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
              Consult with the right expert and move faster with confidence.
            </h1>
            <p className="max-w-2xl text-base text-slate-200 md:text-lg">
              A premium consultation platform for ambitious teams that want trusted insight,
              smooth booking, and an experience inspired by modern enterprise design.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {platformSignals.map((signal) => (
              <span
                key={signal}
                className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-slate-100 backdrop-blur"
              >
                {signal}
              </span>
            ))}
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href="/experts">
              <Button className="bg-white text-slate-900 hover:bg-white/90">
                Explore experts
                <ArrowRight className="ml-2 size-4" />
              </Button>
            </Link>
            <Link href="/apply-expert">
              <Button
                variant="outline"
                className="border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white"
              >
                Become an expert
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
              <p className="text-2xl font-bold">24/7</p>
              <p className="text-sm text-slate-200">Consultation-ready platform access</p>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
              <p className="text-2xl font-bold">100+</p>
              <p className="text-sm text-slate-200">High-value expert sessions</p>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
              <p className="text-2xl font-bold">Smart</p>
              <p className="text-sm text-slate-200">Role-based dashboards</p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 animate-in fade-in slide-in-from-right-4 duration-700">
          <Card className="border-white/10 bg-white/10 text-white shadow-none backdrop-blur">
            <CardHeader>
              <div className="mb-2 flex items-center gap-2 text-cyan-200">
                <Globe2 className="size-4" />
                <span className="text-xs font-semibold uppercase tracking-[0.2em]">
                  Why teams choose us
                </span>
              </div>
              <CardTitle>Modern consulting, enterprise-level polish</CardTitle>
              <CardDescription className="text-slate-200">
                A refined experience for discovering experts, scheduling consultations, and managing the full journey.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-3">
              {valueCards.map((item) => {
                const Icon = item.icon;

                return (
                  <div key={item.title} className="rounded-2xl bg-white/10 p-3">
                    <div className="mb-2 flex items-center gap-2">
                      <Icon className={`size-4 ${item.tone}`} />
                      <p className="font-semibold text-white">{item.title}</p>
                    </div>
                    <p className="text-sm text-slate-200">{item.description}</p>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
