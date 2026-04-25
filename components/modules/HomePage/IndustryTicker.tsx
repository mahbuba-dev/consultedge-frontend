import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { IIndustry } from "@/src/types/industry.types";

interface IndustryTickerProps {
  industries: IIndustry[];
}

export default function IndustryTicker({ industries }: IndustryTickerProps) {
  const tickerItems = industries.length > 0 ? [...industries, ...industries] : [];

  return (
    <section className="rounded-[2rem] border border-white/70 bg-white/70 p-5 shadow-[0_22px_50px_-34px_rgba(15,23,42,0.3)] backdrop-blur md:p-7 dark:border-white/10 dark:bg-slate-950/60">
      <div className="mb-6 grid gap-5 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-end">
        <div className="space-y-3">
          <Badge variant="secondary" className="mb-2 bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-200">
            Industry focus
          </Badge>
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl lg:text-[2.15rem]">
            Explore the sectors where teams need sharper guidance most
          </h2>
          <p className="max-w-2xl text-muted-foreground md:text-base">
            Start with the industries clients search most often, then move into expert profiles built for strategy, growth, operations, and decision support.
          </p>
        </div>

        <Button
          asChild
          variant="outline"
          className="h-11 w-full rounded-full border-blue-200 bg-white/80 px-5 text-sm font-medium text-slate-900 shadow-sm hover:bg-blue-50 sm:w-auto dark:border-white/15 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
        >
          <Link href="/industries">
            All industries
            <ArrowRight className="ml-2 size-4" />
          </Link>
        </Button>
      </div>

      {tickerItems.length > 0 ? (
        <div className="relative overflow-hidden rounded-[2rem] border border-blue-100 bg-linear-to-r from-slate-950 via-blue-950 to-slate-950 px-2 py-3 shadow-lg shadow-blue-500/10 sm:py-4">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-linear-to-r from-slate-950 to-transparent sm:w-16" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-linear-to-l from-slate-950 to-transparent sm:w-16" />

          <div
            className="industry-marquee-track flex w-max items-center gap-4 py-1"
            style={{ animationDuration: `${Math.max(18, industries.length * 4)}s` }}
          >
            {tickerItems.map((industry, index) => (
              <Link
                key={`${industry.id}-${index}`}
                href={`/experts?industryId=${industry.id}`}
                className="shrink-0"
              >
                <div className="whitespace-nowrap rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold text-white backdrop-blur transition duration-300 hover:-translate-y-0.5 hover:border-cyan-300/70 hover:bg-white/15 hover:text-cyan-100 sm:px-5 sm:py-3 sm:text-sm">
                  {industry.name}
                </div>
              </Link>
            ))}
          </div>
        </div>
      ) : (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            Industry highlights will appear here once data is available.
          </CardContent>
        </Card>
      )}
    </section>
  );
}
