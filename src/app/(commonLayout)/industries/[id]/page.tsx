import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  BadgeCheck,
  Building2,
  CalendarRange,
  ChevronLeft,
  Sparkles,
  Users,
} from "lucide-react";

import ExpertCard from "@/components/modules/Experts/ExpertCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  IndustryHeroCTA,
  IndustryViewAllCTA,
  IndustryRelatedLink,
} from "./_IndustryCTAs";

import { getExperts } from "@/src/services/expert.services";
import {
  getAllIndustries,
  getIndustryById,
} from "@/src/services/industry.services";
import type { IExpert } from "@/src/types/expert.types";
import type { IIndustry } from "@/src/types/industry.types";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

const formatDate = (iso?: string) => {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(iso));
  } catch {
    return "—";
  }
};

export default async function IndustryDetailPage({ params }: PageProps) {
  const { id } = await params;

  const [industryResult, expertsResult, industriesResult] = await Promise.allSettled([
    getIndustryById(id),
    getExperts(),
    getAllIndustries(),
  ]);

  if (industryResult.status !== "fulfilled" || !industryResult.value?.data) {
    notFound();
  }

  const industry: IIndustry = industryResult.value.data;

  const allExperts: IExpert[] =
    expertsResult.status === "fulfilled" && Array.isArray(expertsResult.value?.data)
      ? expertsResult.value.data
      : [];

  const relatedExperts = allExperts
    .filter((expert) => expert.industryId === industry.id)
    .slice(0, 8);

  const allIndustries: IIndustry[] =
    industriesResult.status === "fulfilled" && Array.isArray(industriesResult.value?.data)
      ? industriesResult.value.data
      : [];

  const relatedIndustries = allIndustries
    .filter((item) => item.id !== industry.id)
    .slice(0, 4);

  const verifiedExpertCount = relatedExperts.filter((expert) => expert.isVerified).length;

  const keyInfo: Array<{ label: string; value: string; icon: typeof Users }> = [
    {
      label: "Available experts",
      value: String(relatedExperts.length),
      icon: Users,
    },
    {
      label: "Verified profiles",
      value: String(verifiedExpertCount),
      icon: BadgeCheck,
    },
    {
      label: "Listed on",
      value: formatDate(industry.createdAt),
      icon: CalendarRange,
    },
    {
      label: "Category",
      value: "Professional consulting",
      icon: Building2,
    },
  ];

  return (
    <main className="relative min-h-screen overflow-hidden pb-20">
      {/* Decorative background */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-136 bg-[radial-gradient(circle_at_15%_15%,rgba(37,99,235,0.18),transparent_45%),radial-gradient(circle_at_85%_25%,rgba(34,211,238,0.18),transparent_45%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-linear-to-b from-white via-blue-50/40 to-cyan-50/30 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900"
      />

      {/* Hero */}
      <section className="relative px-4 pt-10 md:px-12 md:pt-14">
        <div className="mx-auto max-w-360">
          <Link
            href="/industries"
            className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition hover:text-foreground"
          >
            <ChevronLeft className="size-4" aria-hidden="true" />
            All industries
          </Link>

          <div className="mt-6 grid items-center gap-8 rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.35)] backdrop-blur md:grid-cols-[auto_1fr] md:gap-10 md:p-10 dark:border-white/10 dark:bg-slate-900/70">
            {industry.icon ? (
              <div className="mx-auto flex h-32 w-32 items-center justify-center rounded-3xl bg-linear-to-br from-blue-50 to-cyan-50 ring-1 ring-blue-100/70 md:mx-0 md:h-36 md:w-36 dark:from-blue-500/10 dark:to-cyan-500/10 dark:ring-white/10">
                <Image
                  src={industry.icon}
                  alt={industry.name}
                  width={112}
                  height={112}
                  className="object-contain"
                />
              </div>
            ) : (
              <div className="mx-auto flex h-32 w-32 items-center justify-center rounded-3xl bg-linear-to-br from-blue-100 to-cyan-100 text-blue-700 md:mx-0 md:h-36 md:w-36 dark:from-blue-500/20 dark:to-cyan-500/20 dark:text-cyan-200">
                <Building2 className="size-12" aria-hidden="true" />
              </div>
            )}

            <div className="space-y-4 text-center md:text-left">
              <Badge className="border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-50 dark:border-white/10 dark:bg-white/5 dark:text-cyan-200">
                <Sparkles className="mr-1 size-3.5" aria-hidden="true" />
                Industry
              </Badge>
              <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-5xl">
                {industry.name}
              </h1>
              {industry.description ? (
                <p className="mx-auto max-w-2xl text-base leading-7 text-muted-foreground md:mx-0 md:text-lg">
                  {industry.description}
                </p>
              ) : null}

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2 md:justify-start">
                <IndustryHeroCTA
                  industryId={industry.id}
                  industryName={industry.name}
                />
                <Button asChild variant="outline" className="rounded-full">
                  <Link href="/contact">Talk to our team</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key info / Specifications */}
      <section className="px-4 pt-12 md:px-12">
        <div className="mx-auto max-w-360">
          <h2 className="mb-6 text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
            Key information
          </h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {keyInfo.map(({ label, value, icon: Icon }) => (
              <div
                key={label}
                className="flex h-full flex-col justify-between rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-[0_18px_45px_-30px_rgba(15,23,42,0.25)] backdrop-blur dark:border-white/10 dark:bg-slate-900/70"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-cyan-300">
                  <Icon className="size-5" aria-hidden="true" />
                </div>
                <div className="mt-4">
                  <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                    {label}
                  </p>
                  <p className="mt-1 text-xl font-semibold text-foreground md:text-2xl">
                    {value}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Overview */}
      <section className="px-4 pt-12 md:px-12">
        <div className="mx-auto max-w-360">
          <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.25)] backdrop-blur md:p-10 dark:border-white/10 dark:bg-slate-900/70">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
              Overview
            </h2>
            <p className="mt-4 text-base leading-7 text-muted-foreground md:text-lg md:leading-8">
              {industry.description ||
                `Connect with vetted ${industry.name} consultants on ConsultEdge. Browse trusted profiles, compare experience and pricing, and book a session that fits your goals.`}
            </p>
          </div>
        </div>
      </section>

      {/* Related experts */}
      <section className="px-4 pt-12 md:px-12">
        <div className="mx-auto max-w-360">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
                Experts in {industry.name}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Browse trusted consultants specialised in this industry.
              </p>
            </div>
            {relatedExperts.length > 0 ? (
              <IndustryViewAllCTA
                industryId={industry.id}
                industryName={industry.name}
              />
            ) : null}
          </div>

          {relatedExperts.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 p-10 text-center text-muted-foreground dark:border-white/10 dark:bg-slate-900/40">
              <p className="text-base">
                No experts are listed under this industry yet.
              </p>
              <Button asChild variant="outline" className="mt-4 rounded-full">
                <Link href="/experts">Browse all experts</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {relatedExperts.map((expert) => (
                <ExpertCard key={expert.id} expert={expert} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Related industries */}
      {relatedIndustries.length > 0 ? (
        <section className="px-4 pt-12 md:px-12">
          <div className="mx-auto max-w-360">
            <h2 className="mb-6 text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
              Related industries
            </h2>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {relatedIndustries.map((item) => (
                <IndustryRelatedLink
                  key={item.id}
                  industryId={item.id}
                  industryName={item.name}
                  className="group relative flex h-full min-h-55 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white/80 p-6 text-center shadow-[0_18px_45px_-30px_rgba(15,23,42,0.25)] backdrop-blur transition duration-300 hover:-translate-y-1 hover:border-cyan-300 hover:shadow-[0_28px_70px_-26px_rgba(34,211,238,0.45)] focus-visible:-translate-y-1 focus-visible:border-cyan-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 dark:border-white/10 dark:bg-slate-900/70 dark:hover:border-cyan-400/40 dark:focus-visible:ring-offset-slate-950"
                >
                  {item.icon ? (
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-br from-blue-50 to-cyan-50 ring-1 ring-blue-100/70 dark:from-blue-500/10 dark:to-cyan-500/10 dark:ring-white/10">
                      <Image
                        src={item.icon}
                        alt={item.name}
                        width={48}
                        height={48}
                        className="object-contain"
                      />
                    </div>
                  ) : (
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-cyan-300">
                      <Building2 className="size-7" aria-hidden="true" />
                    </div>
                  )}
                  <h3 className="text-lg font-semibold text-foreground transition-colors group-hover:text-blue-600 dark:group-hover:text-cyan-300">
                    {item.name}
                  </h3>
                  {item.description ? (
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                      {item.description}
                    </p>
                  ) : null}
                </IndustryRelatedLink>
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </main>
  );
}
