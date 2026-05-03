"use client";

import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  trackCategoryClick,
  trackIndustryExplore,
} from "@/src/lib/aiPersonalization";

interface IndustryCTAProps {
  industryId: string;
  industryName: string;
}

export function IndustryHeroCTA({ industryId, industryName }: IndustryCTAProps) {
  return (
    <Button asChild className="rounded-full">
      <Link
        href={`/experts?industryId=${industryId}`}
        onClick={() => {
          trackCategoryClick(industryName);
          trackIndustryExplore(industryName);
        }}
      >
        Find experts in {industryName}
        <ArrowRight className="ml-2 size-4" aria-hidden="true" />
      </Link>
    </Button>
  );
}

export function IndustryViewAllCTA({ industryId, industryName }: IndustryCTAProps) {
  return (
    <Link
      href={`/experts?industryId=${industryId}`}
      onClick={() => {
        trackCategoryClick(industryName);
        trackIndustryExplore(industryName);
      }}
      className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-cyan-300 dark:hover:text-cyan-200"
    >
      View all
      <ArrowUpRight className="size-4" aria-hidden="true" />
    </Link>
  );
}

export function IndustryRelatedLink({
  industryId,
  industryName,
  children,
  className,
}: IndustryCTAProps & { children: React.ReactNode; className?: string }) {
  return (
    <Link
      href={`/industries/${industryId}`}
      onClick={() => {
        trackCategoryClick(industryName);
        trackIndustryExplore(industryName);
      }}
      className={className}
    >
      {children}
    </Link>
  );
}
