import { getAllIndustries } from "@/src/services/industry.services";
import type { IIndustry } from "@/src/types/industry.types";
import IndustriesHybridClient from "./IndustriesHybridClient";

// Render on-demand so build doesn't fail if the backend is unreachable
// during the Vercel build (e.g. Render cold start).
export const dynamic = "force-dynamic";

const PAGE_SIZE = 12;

export default async function IndustriesPage() {
  const industriesResponse = await getAllIndustries({
    page: 1,
    limit: 500,
    sortBy: "createdAt",
    sortOrder: "desc",
  });
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

      <section className="mx-auto max-w-360">
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

        <IndustriesHybridClient industries={industries} pageSize={PAGE_SIZE} />
      </section>
    </main>
  );
}
