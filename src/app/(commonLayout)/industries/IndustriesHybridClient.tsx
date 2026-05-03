"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import type { IIndustry } from "@/src/types/industry.types";
import { Button } from "@/components/ui/button";

type IndustriesHybridClientProps = {
  industries: IIndustry[];
  pageSize?: number;
};

export default function IndustriesHybridClient({
  industries,
  pageSize = 12,
}: IndustriesHybridClientProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [isMobileViewport, setIsMobileViewport] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 767px)");
    const updateViewportMode = () => setIsMobileViewport(mediaQuery.matches);

    updateViewportMode();
    mediaQuery.addEventListener("change", updateViewportMode);

    return () => mediaQuery.removeEventListener("change", updateViewportMode);
  }, []);

  const totalItems = industries.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  const desktopVisibleIndustries = useMemo(
    () => industries.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [industries, currentPage, pageSize]
  );

  const mobileVisibleIndustries = useMemo(
    () => industries.slice(0, currentPage * pageSize),
    [industries, currentPage, pageSize]
  );

  const renderedIndustries = isMobileViewport
    ? mobileVisibleIndustries
    : desktopVisibleIndustries;

  const canLoadMoreOnMobile = mobileVisibleIndustries.length < industries.length;

  useEffect(() => {
    // Prefetch next chunk icons so page transitions feel instant.
    const nextChunk = industries.slice(
      currentPage * pageSize,
      (currentPage + 1) * pageSize
    );

    nextChunk.forEach((industry) => {
      const iconSrc = (industry.icon ?? "").trim();
      if (!iconSrc) return;

      const img = new window.Image();
      img.src = iconSrc;
    });
  }, [industries, currentPage, pageSize]);

  return (
    <>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {renderedIndustries.map((industry) => (
          <Link
            key={industry.id}
            href={`/industries/${industry.id}`}
            aria-label={`Explore ${industry.name} industry`}
            className="group relative flex h-full min-h-65 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-[0_18px_45px_-30px_rgba(15,23,42,0.25)] transition duration-300 hover:-translate-y-1 hover:border-cyan-300 hover:shadow-[0_28px_70px_-26px_rgba(34,211,238,0.45)] focus-visible:-translate-y-1 focus-visible:border-cyan-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 dark:border-white/10 dark:bg-slate-900/70 dark:backdrop-blur-xl dark:hover:border-cyan-400/40 dark:hover:bg-slate-900/90 dark:focus-visible:ring-offset-slate-950"
          >
            <div
              aria-hidden
              className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-blue-500 via-cyan-400 to-teal-400 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100"
            />

            {industry.icon ? (
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-linear-to-br from-blue-50 to-cyan-50 ring-1 ring-blue-100/70 transition-colors group-hover:from-blue-100 group-hover:to-cyan-100 dark:from-blue-500/10 dark:to-cyan-500/10 dark:ring-white/10 dark:group-hover:from-blue-500/20 dark:group-hover:to-cyan-500/20">
                <Image
                  src={industry.icon}
                  alt={industry.name}
                  width={64}
                  height={64}
                  className="object-contain"
                />
              </div>
            ) : null}

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

      <div className="mt-8 flex flex-col gap-3">
        <p className="text-center text-sm text-muted-foreground">
          {isMobileViewport
            ? `Showing ${renderedIndustries.length} of ${totalItems}`
            : `Showing ${Math.min((currentPage - 1) * pageSize + 1, totalItems)}–${Math.min(
                currentPage * pageSize,
                totalItems
              )} of ${totalItems}`}
        </p>

        {!isMobileViewport && totalPages > 1 ? (
          <div className="hidden items-center justify-between rounded-2xl border border-blue-200/70 bg-white/70 px-4 py-3 md:flex dark:border-white/10 dark:bg-slate-950/50">
            <Button
              variant="outline"
              className="rounded-xl"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>

            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(
                  (page) =>
                    page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1
                )
                .reduce<(number | "...")[]>((acc, page, idx, arr) => {
                  if (idx > 0 && (page as number) - (arr[idx - 1] as number) > 1) {
                    acc.push("...");
                  }
                  acc.push(page);
                  return acc;
                }, [])
                .map((item, idx) =>
                  item === "..." ? (
                    <span key={`ellipsis-${idx}`} className="px-1 text-sm text-muted-foreground">
                      …
                    </span>
                  ) : (
                    <Button
                      key={item}
                      variant={currentPage === item ? "default" : "outline"}
                      size="sm"
                      className="h-9 w-9 rounded-xl p-0"
                      onClick={() => setCurrentPage(item as number)}
                    >
                      {item}
                    </Button>
                  )
                )}
            </div>

            <Button
              variant="outline"
              className="rounded-xl"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
            </Button>
          </div>
        ) : null}

        {isMobileViewport && canLoadMoreOnMobile ? (
          <div className="md:hidden">
            <Button
              variant="outline"
              className="w-full rounded-xl"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            >
              Load more industries
            </Button>
          </div>
        ) : null}
      </div>
    </>
  );
}
