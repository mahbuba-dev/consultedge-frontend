import Link from "next/link";

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
    <section className="space-y-5">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <Badge variant="secondary" className="mb-2 bg-violet-100 text-violet-700 dark:bg-violet-500/10 dark:text-violet-200">
            Industry focus
          </Badge>
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Explore top consulting industries</h2>
          <p className="text-muted-foreground">
            Browse key sectors through a clean, fast-moving single-line showcase.
          </p>
        </div>

        <Link href="/industries">
          <Button variant="outline" className="rounded-full dark:border-white/10 dark:bg-slate-950/60 dark:text-slate-100">View all industries</Button>
        </Link>
      </div>

      {tickerItems.length > 0 ? (
        <div className="relative overflow-hidden rounded-[2rem] border border-violet-100 bg-linear-to-r from-slate-950 via-violet-950 to-slate-950 px-2 py-3 shadow-lg shadow-violet-500/10 sm:py-4">
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
