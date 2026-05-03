"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import {
  CheckCircle2,
  Loader2,
  Mail,
  Newspaper,
  Send,
  TrendingUp,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getBehavior, hasPersonalSignal } from "@/src/lib/aiPersonalization";
import { aiSummary } from "@/src/services/ai.service";
import type { IIndustry } from "@/src/types/industry.types";

interface SmartNewsletterProps {
  industries: IIndustry[];
}

const STORAGE_KEY = "consultedge:newsletter:v1";

const BASE_TOPICS = [
  "New experts joining each week",
  "Trending sessions on the platform",
  "Curated reads & playbooks",
];

export default function SmartNewsletter({ industries }: SmartNewsletterProps) {
  const [hydrated, setHydrated] = useState(false);
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    setHydrated(true);
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as { email?: string; subscribed?: boolean };
      setEmail(parsed.email ?? "");
      setSubscribed(Boolean(parsed.subscribed));
    } catch {
      // Ignore malformed localStorage payloads.
    }
  }, []);

  useEffect(() => {
    const handler = () => setTick((t) => t + 1);
    window.addEventListener("consultedge:behavior-updated", handler);
    return () => window.removeEventListener("consultedge:behavior-updated", handler);
  }, []);

  const personalised = useMemo(
    () => (hydrated ? hasPersonalSignal(getBehavior()) : false),
    [hydrated, tick],
  );

  /** Top 2 industries from behavior (by weight) intersected with the catalog. */
  const topIndustries: IIndustry[] = useMemo(() => {
    if (!hydrated) return [];
    const { industryWeights } = getBehavior();
    return Object.entries(industryWeights)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([id]) => industries.find((i) => i.id === id))
      .filter((x): x is IIndustry => Boolean(x));
  }, [hydrated, industries, tick]);

  const dynamicTopics = useMemo(() => {
    if (topIndustries.length === 0) return BASE_TOPICS;
    return [
      `Top ${topIndustries[0].name} experts of the week`,
      topIndustries[1]
        ? `${topIndustries[1].name} trends & playbooks`
        : "Curated playbooks for your focus areas",
      "Exclusive booking discounts (subscribers only)",
    ];
  }, [topIndustries]);

  // Ask backend for a richer preview when there's a personal signal.
  const previewTopic = topIndustries[0]?.name ?? "";
  const { data: aiResult } = useQuery({
    queryKey: ["ai-newsletter-summary", previewTopic, topIndustries.map((i) => i.id).join(",")],
    queryFn: () =>
      aiSummary({
        topic: previewTopic || "consulting",
        industryIds: topIndustries.map((i) => i.id),
        kind: "newsletter-preview",
        source: "newsletter",
      }),
    enabled: previewTopic.length > 0,
    staleTime: 1000 * 60 * 30,
    gcTime: 1000 * 60 * 60,
  });

  const aiTopics = useMemo(() => {
    const items = aiResult?.data?.items ?? [];
    if (items.length === 0) return null;
    return items.slice(0, 4).map((it) => it.title).filter(Boolean);
  }, [aiResult]);

  const previewTopics = aiTopics && aiTopics.length > 0 ? aiTopics : dynamicTopics;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) return;
    // simple HTML5-grade validation; backend will revalidate
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      toast.error("That email doesn\'t look right.");
      return;
    }

    setSubmitting(true);
    // Simulated submit — wire to /api/v1/newsletter when backend is ready.
    await new Promise((resolve) => setTimeout(resolve, 650));
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          email: trimmed,
          subscribed: true,
          industries: topIndustries.map((i) => i.id),
          subscribedAt: new Date().toISOString(),
        }),
      );
    } catch {
      /* ignore */
    }
    setSubmitting(false);
    setSubscribed(true);
    toast.success("You're in. Welcome aboard.");
  };

  return (
    <section id="newsletter-section" className="relative scroll-mt-28 overflow-hidden rounded-(--ce-shell-radius) border border-blue-100/70 bg-white/50 p-6 shadow-(--ce-shell-shadow-strong) backdrop-blur-2xl md:rounded-(--ce-shell-radius-md) md:p-9 dark:rounded-(--ce-shell-radius-dark) dark:border-white/10 dark:bg-slate-950/44">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(128deg,rgba(255,255,255,0.45),rgba(255,255,255,0.08)_44%,rgba(56,189,248,0.1)_100%)] dark:bg-[linear-gradient(128deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02)_44%,rgba(56,189,248,0.08)_100%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-20 right-0 size-60 rounded-full bg-cyan-300/20 blur-3xl dark:bg-cyan-500/10"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-20 left-0 size-60 rounded-full bg-blue-300/20 blur-3xl dark:bg-blue-500/10"
      />

      <div className="relative grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:items-center">
        <div className="space-y-4">
          <Badge variant="secondary" className="gap-1 bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-200">
            <Mail className="size-3.5" />
            ConsultEdge weekly
          </Badge>
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl lg:text-4xl">
            {personalised
              ? "A weekly digest, tailored to what you actually care about"
              : "A weekly digest from the best industry experts"}
          </h2>
          <p className="text-sm text-muted-foreground md:text-base">
            One short email, every Tuesday. Trending experts, curated playbooks, and subscriber-only offers — no fluff, easy to unsubscribe.
          </p>

          {!subscribed ? (
            <form onSubmit={handleSubmit} className="flex flex-col gap-2 sm:flex-row">
              <label className="sr-only" htmlFor="newsletter-email">
                Email address
              </label>
              <input
                id="newsletter-email"
                type="email"
                inputMode="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
                className="h-11 flex-1 rounded-full border border-slate-200/80 bg-white px-4 text-sm outline-none transition focus:border-cyan-400 focus:shadow-[0_0_0_4px_rgba(34,211,238,0.15)] dark:border-white/10 dark:bg-slate-900/70 dark:text-slate-100"
              />
              <Button
                type="submit"
                disabled={submitting}
                className="h-11 rounded-full bg-linear-to-r from-blue-600 to-cyan-500 px-6 text-sm font-semibold text-white hover:from-blue-700 hover:to-cyan-600"
              >
                {submitting ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <>
                    Subscribe <Send className="ml-1.5 size-4" />
                  </>
                )}
              </Button>
            </form>
          ) : (
            <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200">
              <CheckCircle2 className="size-5 shrink-0" />
              <div>
                <p className="font-medium">You&apos;re subscribed</p>
                <p className="text-xs opacity-80">
                  Look out for the next issue - we&apos;ll keep it short.
                </p>
              </div>
            </div>
          )}

          <p className="text-[11px] text-muted-foreground">
            We respect your inbox. One email a week · unsubscribe anytime.
          </p>
        </div>

        <div className="rounded-2xl border border-blue-200/60 bg-white/80 p-5 backdrop-blur dark:border-white/10 dark:bg-slate-900/70">
          <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-blue-700 dark:text-blue-200">
            <Newspaper className="size-3.5" />
            {personalised ? "Your next issue will include" : "What you'll get"}
          </div>
          <ul className="space-y-2.5">
            {previewTopics.map((topic) => (
              <li key={topic} className="flex items-start gap-2 text-sm">
                <TrendingUp className="mt-0.5 size-4 shrink-0 text-cyan-600 dark:text-cyan-300" />
                <span>{topic}</span>
              </li>
            ))}
          </ul>
          {personalised && topIndustries.length > 0 ? (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {topIndustries.map((ind) => (
                <span
                  key={ind.id}
                  className="rounded-full bg-cyan-100 px-2.5 py-0.5 text-[11px] font-medium text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-200"
                >
                  #{ind.name.toLowerCase().replace(/\s+/g, "-")}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
