import { getAllIndustries } from "@/src/services/industry.services";
import type { IIndustry } from "@/src/types/industry.types";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

// Render on-demand so build doesn't fail if the backend is unreachable
// during the Vercel build (e.g. Render cold start).
export const dynamic = "force-dynamic";

export default async function IndustriesPage() {
  const industriesResponse = await getAllIndustries();
  const industries: IIndustry[] = Array.isArray(industriesResponse?.data)
    ? industriesResponse.data
    : [];

  return (
    <main className="relative min-h-screen overflow-hidden py-12 px-4 md:px-12">
      {/* Decorative background — works in both themes */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-176 bg-[radial-gradient(circle_at_15%_15%,rgba(37,99,235,0.18),transparent_45%),radial-gradient(circle_at_85%_25%,rgba(34,211,238,0.18),transparent_45%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-linear-to-b from-white via-blue-50/40 to-cyan-50/30 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900"
      />

      <section className="max-w-6xl mx-auto">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-200/70 bg-white/70 px-3 py-1 text-xs font-medium text-blue-700 backdrop-blur dark:border-white/10 dark:bg-white/5 dark:text-cyan-200">
            Industries
          </span>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
            Explore All{" "}
            <span className="bg-linear-to-r from-blue-600 via-cyan-500 to-teal-400 bg-clip-text text-transparent">
              Industries
            </span>
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Discover a wide range of industries and find the right experts for your needs.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {industries.map((industry) => (
            <Link
              key={industry.id}
              href={`/industries/${industry.id}`}
              aria-label={`Explore ${industry.name} industry`}
              className="group relative flex h-full min-h-65 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-[0_18px_45px_-30px_rgba(15,23,42,0.25)] transition duration-300 hover:-translate-y-1 hover:border-cyan-300 hover:shadow-[0_28px_70px_-26px_rgba(34,211,238,0.45)] focus-visible:-translate-y-1 focus-visible:border-cyan-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 dark:border-white/10 dark:bg-slate-900/70 dark:backdrop-blur-xl dark:hover:border-cyan-400/40 dark:hover:bg-slate-900/90 dark:focus-visible:ring-offset-slate-950"
            >
              {/* Top accent bar */}
              <div
                aria-hidden
                className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-blue-500 via-cyan-400 to-teal-400 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100"
              />

              {industry.icon && (
                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-linear-to-br from-blue-50 to-cyan-50 ring-1 ring-blue-100/70 transition-colors group-hover:from-blue-100 group-hover:to-cyan-100 dark:from-blue-500/10 dark:to-cyan-500/10 dark:ring-white/10 dark:group-hover:from-blue-500/20 dark:group-hover:to-cyan-500/20">
                  <Image
                    src={industry.icon}
                    alt={industry.name}
                    width={64}
                    height={64}
                    className="object-contain"
                  />
                </div>
              )}
              <h2 className="mb-2 text-xl font-semibold text-foreground transition-colors group-hover:text-blue-600 dark:group-hover:text-cyan-300">
                {industry.name}
              </h2>
              <p className="line-clamp-3 min-h-15 text-sm text-muted-foreground">
                {industry.description}
              </p>

              <span className="mt-auto inline-flex items-center justify-center gap-1 pt-4 text-sm font-medium text-blue-600 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100 dark:text-cyan-300">
                Explore industry
                <ArrowUpRight className="size-4" aria-hidden="true" />
              </span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
