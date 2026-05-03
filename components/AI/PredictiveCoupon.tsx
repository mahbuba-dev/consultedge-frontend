"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Copy, Sparkles, Tag } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { getBehavior } from "@/src/lib/aiPersonalization";

interface PredictiveCouponProps {
  industryName?: string | null;
  consultationFee?: number | null;
  /** Force the coupon to render even when no signal yet. */
  forceShow?: boolean;
}

const STORAGE_KEY = "consultedge:coupon-shown:v1";

interface CouponOffer {
  code: string;
  percent: number;
  reason: string;
  tone: "first-visit" | "loyal" | "industry" | "abandoned";
}

/**
 * Heuristically pick the most-relevant coupon for the current visitor based on
 * their on-device behavior. Pure function, no network.
 */
function pickCoupon(opts: { industryName?: string | null }): CouponOffer | null {
  if (typeof window === "undefined") return null;

  const behavior = getBehavior();
  const viewedCount = behavior.recentExpertIds.length;
  const searchCount = behavior.recentSearches.length;
  const totalAffinity = Object.values(behavior.industryWeights).reduce(
    (sum, v) => sum + v,
    0,
  );

  // 1. Returning visitor with strong affinity → loyalty discount
  if (totalAffinity >= 4 || viewedCount >= 5) {
    return {
      code: "EDGE10",
      percent: 10,
        reason: "Your first booking, made easy. Save 10% when you book today.",
      tone: "loyal",
    };
  }

  // 2. Industry-focused: searched + viewed within same niche
  if (opts.industryName && totalAffinity > 0) {
    return {
      code: `${opts.industryName.replace(/\s+/g, "").toUpperCase().slice(0, 6)}8`,
      percent: 8,
        reason: `Exclusive offer for ${opts.industryName} expertise — save 8% on your session.`,
      tone: "industry",
    };
  }

  // 3. Mid-funnel browser
  if (viewedCount >= 2 || searchCount >= 2) {
    return {
      code: "BOOK5",
      percent: 5,
        reason: "Ready to move forward? Use this code for 5% off your next booking.",
      tone: "abandoned",
    };
  }

  // 4. First-visit nudge — only if explicitly forced
  return {
    code: "WELCOME5",
    percent: 5,
      reason: "Welcome to ConsultEdge — here's 5% off your first expert session.",
    tone: "first-visit",
  };
}

export default function PredictiveCoupon({
  industryName,
  consultationFee,
  forceShow,
}: PredictiveCouponProps) {
  const [tick, setTick] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handler = () => setTick((t) => t + 1);
    window.addEventListener("consultedge:behavior-updated", handler);
    return () => window.removeEventListener("consultedge:behavior-updated", handler);
  }, []);

  const offer = useMemo<CouponOffer | null>(() => {
    const picked = pickCoupon({ industryName: industryName ?? null });

    // Only show first-visit on the first session unless explicitly forced.
    if (picked?.tone === "first-visit" && !forceShow) return null;
    return picked;
  }, [industryName, forceShow, tick]);

  // Track impression
  useEffect(() => {
    if (!offer) return;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      const seen = raw ? (JSON.parse(raw) as Record<string, number>) : {};
      seen[offer.code] = (seen[offer.code] ?? 0) + 1;
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seen));
    } catch {
      /* ignore */
    }
  }, [offer]);

  if (!offer) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(offer.code);
      setCopied(true);
      toast.success(`Code ${offer.code} copied — apply at checkout.`);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error("Couldn't copy. Long-press the code instead.");
    }
  };

  // Compute the saved fee preview if we have a price
  const fee = consultationFee;
  const savedAmount =
    typeof fee === "number" && fee > 0
      ? new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
          maximumFractionDigits: 0,
        }).format(Math.round(fee * (offer.percent / 100)))
      : null;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-amber-200 bg-linear-to-r from-amber-50 via-orange-50 to-amber-50 p-3.5 shadow-[0_18px_45px_-30px_rgba(251,191,36,0.6)] dark:border-amber-500/20 dark:from-amber-500/5 dark:via-orange-500/5 dark:to-amber-500/5">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-6 -top-6 size-20 rounded-full bg-amber-300/30 blur-2xl dark:bg-amber-400/10"
      />
      <div className="relative flex items-center gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-amber-400 to-orange-500 text-white shadow">
          <Sparkles className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge className="gap-1 rounded-full bg-amber-500/15 text-[10px] font-bold text-amber-800 hover:bg-amber-500/20 dark:bg-amber-500/15 dark:text-amber-200">
              <Tag className="size-3" /> {offer.percent}% off
            </Badge>
            {savedAmount ? (
              <span className="text-[11px] font-medium text-amber-800 dark:text-amber-200">
                Save ~{savedAmount}
              </span>
            ) : null}
          </div>
          <p className="mt-0.5 line-clamp-2 text-xs text-amber-900/90 dark:text-amber-100/90">
            {offer.reason}
          </p>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="group inline-flex h-8 shrink-0 items-center gap-1.5 rounded-xl border border-amber-300 bg-white px-2.5 text-xs font-semibold text-amber-800 shadow-sm transition hover:bg-amber-100 dark:border-amber-500/30 dark:bg-slate-900 dark:text-amber-200 dark:hover:bg-amber-500/10"
          aria-label={`Copy code ${offer.code}`}
        >
          {copied ? (
            <>
              <Check className="size-3.5" /> Copied
            </>
          ) : (
            <>
              <Copy className="size-3.5" /> {offer.code}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
