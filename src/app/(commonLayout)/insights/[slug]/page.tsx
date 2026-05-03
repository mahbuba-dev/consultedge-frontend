import Link from "next/link";
import { ArrowLeft, ArrowRight, CalendarClock, Clock3, Compass, Sparkles, Tag } from "lucide-react";

import { Badge } from "@/components/ui/badge";

type InsightDetailPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ topic?: string; type?: string; read?: string }>;
};

const toHeadline = (slug: string) =>
  slug
    .split("-")
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(" ");

const slugSeed = (slug: string) =>
  slug.split("").reduce((sum, ch) => sum + ch.charCodeAt(0), 0);

export async function generateMetadata({ params }: InsightDetailPageProps) {
  const { slug } = await params;
  const title = toHeadline(slug);

  return {
    title: `${title} | Insights | ConsultEdge`,
    description: `Practical insight on ${title.toLowerCase()} from the ConsultEdge knowledge hub.`,
  };
}

export default async function InsightDetailPage({ params, searchParams }: InsightDetailPageProps) {
  const { slug } = await params;
  const query = await searchParams;

  const headline = toHeadline(slug);
  const topic = (query.topic || "consulting").toLowerCase();
  const type = query.type || "Insight";
  const read = query.read || "6 min";
  const seed = slugSeed(slug);

  const publishedDate = new Date(Date.UTC(2026, seed % 12, (seed % 27) + 1)).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const keyPoints = [
    `Why ${topic} teams are prioritizing this shift now and what changed in the last two quarters.`,
    "A practical framework you can apply within a single planning cycle.",
    "Execution checkpoints to reduce risk while maintaining momentum.",
  ];

  const bodyParagraphs = [
    `${headline} is no longer just a nice-to-have playbook. Teams adopting this approach are making clearer decisions faster because they align the right expert input with narrow execution windows.`,
    `The highest-performing operators treat expert consultations as decision accelerators, not discussion sessions. They define one measurable outcome per session, gather constraints ahead of time, and convert advice into a 7-day action brief.`,
    `In practice, the biggest win comes from sequencing. Start with clarity, move to trade-offs, then define ownership. This prevents the common pattern of collecting insights without converting them into execution velocity.`,
    `If your team is navigating ${topic}, the practical edge comes from consistency: short cycles, documented assumptions, and focused follow-up with domain specialists.`
  ];

  return (
    <main className="relative overflow-hidden pb-16 pt-6">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-160 bg-[radial-gradient(circle_at_12%_12%,rgba(56,189,248,0.16),transparent_40%),radial-gradient(circle_at_86%_18%,rgba(16,185,129,0.16),transparent_38%)]"
      />

      <section className="relative overflow-hidden border border-cyan-100/70 bg-white/50 p-6 shadow-[0_30px_70px_-40px_rgba(15,23,42,0.3)] backdrop-blur-2xl md:p-8 lg:p-10">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(126deg,rgba(255,255,255,0.42),rgba(255,255,255,0.08)_44%,rgba(34,211,238,0.1)_100%)]"
        />

        <div className="relative mx-auto max-w-4xl space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Badge className="border-cyan-200 bg-cyan-50 text-cyan-800 hover:bg-cyan-50">
              <Compass className="mr-1 size-3.5" />
              {type}
            </Badge>

            <Link
              href="/insights"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-cyan-800 transition hover:text-cyan-700"
            >
              <ArrowLeft className="size-4" />
              Back to insights
            </Link>
          </div>

          <h1 className="text-3xl font-bold leading-tight tracking-tight text-slate-900 md:text-4xl lg:text-5xl">
            {headline}
          </h1>

          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 md:text-sm">
            <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white/85 px-3 py-1.5">
              <Tag className="size-3.5" />
              Topic: {topic}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white/85 px-3 py-1.5">
              <Clock3 className="size-3.5" />
              {read}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white/85 px-3 py-1.5">
              <CalendarClock className="size-3.5" />
              {publishedDate}
            </span>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
            <article className="space-y-4 rounded-2xl border border-slate-200 bg-white/82 p-5 shadow-sm backdrop-blur">
              {bodyParagraphs.map((paragraph) => (
                <p key={paragraph} className="text-[15px] leading-7 text-slate-700">
                  {paragraph}
                </p>
              ))}
            </article>

            <aside className="space-y-3 rounded-2xl border border-cyan-200/70 bg-white/82 p-4 shadow-sm backdrop-blur">
              <p className="inline-flex items-center gap-1 text-sm font-semibold text-cyan-800">
                <Sparkles className="size-4" />
                Key takeaways
              </p>

              <ul className="space-y-2">
                {keyPoints.map((point) => (
                  <li key={point} className="rounded-xl border border-cyan-100 bg-cyan-50/70 px-3 py-2 text-sm text-slate-700">
                    {point}
                  </li>
                ))}
              </ul>
            </aside>
          </div>

          <div className="pt-2">
            <Link
              href="/experts"
              className="inline-flex h-11 items-center gap-2 rounded-full bg-linear-to-r from-blue-600 to-cyan-500 px-5 text-sm font-semibold text-white shadow-[0_14px_34px_-14px_rgba(34,211,238,0.55)] transition hover:from-blue-700 hover:to-cyan-600"
            >
              Talk to an expert on this topic
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
