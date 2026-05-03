import Link from "next/link";
import { ArrowRight, BookOpen, Clock3, Compass, LineChart, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const toInsightSlug = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

export const metadata = {
  title: "Insights | ConsultEdge",
  description:
    "Read curated industry insights, playbooks, and trend reports from the ConsultEdge ecosystem.",
};

const insightCards = [
  {
    id: "insight-1",
    type: "Playbook",
    title: "How high-growth teams structure expert consultations for faster decisions",
    readTime: "7 min",
  },
  {
    id: "insight-2",
    type: "Guide",
    title: "A practical checklist before booking your first strategy expert",
    readTime: "6 min",
  },
  {
    id: "insight-3",
    type: "Trend Report",
    title: "What founders are prioritizing this quarter across operations and GTM",
    readTime: "5 min",
  },
  {
    id: "insight-4",
    type: "Case Study",
    title: "From unclear roadmap to clear execution: a 30-day consultation sprint",
    readTime: "8 min",
  },
  {
    id: "insight-5",
    type: "Playbook",
    title: "How to evaluate advisory fit in less than 20 minutes",
    readTime: "4 min",
  },
  {
    id: "insight-6",
    type: "Guide",
    title: "Questions to ask before scaling your team or product scope",
    readTime: "6 min",
  },
];

export default function InsightsPage() {
  return (
    <main className="relative overflow-hidden pb-16 pt-6">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-160 bg-[radial-gradient(circle_at_12%_16%,rgba(16,185,129,0.16),transparent_40%),radial-gradient(circle_at_84%_18%,rgba(34,211,238,0.16),transparent_38%)]"
      />

      <section className="rounded-[2.2rem] border border-emerald-100/60 bg-linear-to-br from-slate-950 via-emerald-950 to-cyan-950 p-6 shadow-[0_30px_90px_-44px_rgba(16,185,129,0.5)] md:p-8 lg:p-10">
        <div className="mb-7 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl space-y-2">
            <Badge className="border-white/20 bg-white/10 text-white hover:bg-white/10">
              <Compass className="mr-1 size-3.5" />
              Insights
            </Badge>
            <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl lg:text-5xl">
              Strategic reads for smarter execution
            </h1>
            <p className="text-sm text-slate-200/90 md:text-base">
              Explore playbooks, trend reports, and practical guides curated for teams that want faster, better decisions.
            </p>
          </div>

          <Link
            href="/experts"
            className="inline-flex h-11 items-center gap-2 rounded-full bg-white px-5 text-sm font-semibold text-slate-900 transition hover:bg-white/90"
          >
            Browse experts
            <ArrowRight className="size-4" />
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {insightCards.map((item) => (
            <Link
              key={item.id}
              href={`/insights/${toInsightSlug(item.title)}?topic=consulting&type=${encodeURIComponent(item.type)}&read=${encodeURIComponent(item.readTime)}`}
              className="group block"
            >
              <Card
                className="overflow-hidden border border-white/20 bg-white/10 shadow-[0_20px_56px_-32px_rgba(15,23,42,0.8)] backdrop-blur transition-transform duration-300 hover:-translate-y-1"
              >
                <CardContent className="space-y-4 p-5">
                  <div className="flex items-center justify-between gap-3">
                    <span className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-cyan-100">
                      <BookOpen className="size-3" />
                      {item.type}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs text-slate-200/85">
                      <Clock3 className="size-3.5" />
                      {item.readTime}
                    </span>
                  </div>

                  <h2 className="text-xl font-semibold leading-snug text-white">{item.title}</h2>

                  <div className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-200">
                    Read insight
                    <LineChart className="size-4 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <div className="mt-6 flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-xs text-slate-200/90">
          <Sparkles className="size-3.5 text-cyan-200" />
          New insights are continuously curated from real booking and consultation patterns.
        </div>
      </section>
    </main>
  );
}
