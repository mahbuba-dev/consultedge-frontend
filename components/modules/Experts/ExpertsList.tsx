// "use client";

// import { getExperts } from "@/src/app/(commonLayout)/experts/_actions";
// import { IExpert } from "@/src/types/expert.types";
// import { useQuery } from "@tanstack/react-query";
// import { useRouter } from "next/navigation";


// const ExpertList = () => {
//      const router = useRouter();
//  const { data, isLoading } = useQuery({
//     queryKey: ["experts"],
//     queryFn: () => getExperts(),
//   });

//   console.log("Experts:", data?.data); // <-- correct

//   if (isLoading) return <p>Loading...</p>;

//   return (
//     <div>
//       <h1 className="text-2xl font-bold">Experts List</h1>

//       <div className="mt-4 space-y-4">
//         {data?.data?.map((expert:IExpert) => (
//           <div key={expert.id} className="p-4 border rounded-lg">
//             <h2 className="text-lg font-semibold">{expert.fullName}</h2>
//             <p className="text-gray-600">{expert.title}</p>
//             <p className="text-sm">{expert.industry?.name}</p>
//             <button
//   onClick={() => router.push(`/experts/${expert.id}`)}
//   className="mt-3 rounded-md bg-[#5624d0] text-white px-3 py-1.5 text-sm font-semibold hover:bg-[#3b1a99] transition"
// >
//   View Details
// </button>

//           </div>
          
//         ))}
//       </div>
//     </div>
//   );
// };

// export default ExpertList;



"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getAllIndustries, getIndustries } from "@/src/services/industry.services";
import { getExperts } from "@/src/services/expert.services";
import { IIndustry } from "@/src/types/industry.types";
import { cn } from "@/src/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpDown, Sparkles } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";
import ExpertCard from "./ExpertCard";
import DataTableSearch from "../shared/Table/DataTableSearch";

type RangeField = "experience" | "price";
type RangePreset = {
  label: string;
  gte?: string;
  lte?: string;
};

const sortOptions = [
  { label: "Newest first", value: "createdAt:desc" },
  { label: "Most experience", value: "experience:desc" },
  { label: "Lowest price", value: "price:asc" },
  { label: "Highest price", value: "price:desc" },
];

const experiencePresets: RangePreset[] = [
  { label: "0-2 yrs", gte: "0", lte: "2" },
  { label: "3-5 yrs", gte: "3", lte: "5" },
  { label: "6-10 yrs", gte: "6", lte: "10" },
  { label: "10+ yrs", gte: "10" },
];

const pricePresets: RangePreset[] = [
  { label: "Budget", gte: "0", lte: "100" },
  { label: "Standard", gte: "101", lte: "300" },
  { label: "Premium", gte: "301" },
];

const parseOptionalNumber = (value: string | null) => {
  if (!value) {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const getQuickFilterButtonClass = (isActive: boolean) =>
  cn(
    "rounded-full border px-4 transition-all duration-300 hover:-translate-y-0.5",
    isActive
      ? "border-violet-600 bg-violet-600 text-white shadow-lg shadow-violet-500/25 hover:bg-violet-600"
      : "border-violet-200 bg-white/80 text-violet-700 hover:border-violet-300 hover:bg-violet-50",
  );

export default function ExpertsPageClient() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const queryString = searchParams.toString();
  const searchTerm = searchParams.get("searchTerm") ?? "";
  const activeSortValue = `${searchParams.get("sortBy") ?? "createdAt"}:${searchParams.get("sortOrder") ?? "desc"}`;
  const hasExperienceRange = Boolean(
    searchParams.get("experience[gte]") || searchParams.get("experience[lte]"),
  );
  const hasPriceRange = Boolean(
    searchParams.get("price[gte]") || searchParams.get("price[lte]"),
  );

  const { data, isLoading, isError } = useQuery({
    queryKey: ["experts", queryString],
    queryFn: () => getExperts(queryString),
  });

  const { data: industries = [] } = useQuery<IIndustry[]>({
    queryKey: ["industries", "options"],
    queryFn: getIndustries,
    initialData: [],
    staleTime: 5 * 60 * 1000,
  });

  const experts = Array.isArray(data?.data) ? data.data : [];
  const meta = data?.meta;
  const selectedIndustryId = searchParams.get("industryId") ?? "all";
  const selectedVerification = searchParams.get("isVerified") ?? "all";

  const displayedExperts = useMemo(() => {
    const minExperience = parseOptionalNumber(searchParams.get("experience[gte]"));
    const maxExperience = parseOptionalNumber(searchParams.get("experience[lte]"));
    const minPrice = parseOptionalNumber(searchParams.get("price[gte]"));
    const maxPrice = parseOptionalNumber(searchParams.get("price[lte]"));
    const normalizedSearch = searchTerm.trim().toLowerCase();
    const [sortBy, sortOrder] = activeSortValue.split(":") as [
      string,
      "asc" | "desc",
    ];

    return [...experts]
      .filter((expert) => {
        if (normalizedSearch) {
          const searchableText = [
            expert.fullName,
            expert.title,
            expert.bio,
            expert.industry?.name,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

          if (!searchableText.includes(normalizedSearch)) {
            return false;
          }
        }

        if (
          selectedIndustryId !== "all" &&
          expert.industryId !== selectedIndustryId &&
          expert.industry?.id !== selectedIndustryId
        ) {
          return false;
        }

        if (
          selectedVerification !== "all" &&
          Boolean(expert.isVerified) !== (selectedVerification === "true")
        ) {
          return false;
        }

        const expertExperience = Number(expert.experience ?? 0);
        const expertPrice = Number(expert.price ?? expert.consultationFee ?? 0);

        if (
          typeof minExperience === "number" &&
          expertExperience < minExperience
        ) {
          return false;
        }

        if (
          typeof maxExperience === "number" &&
          expertExperience > maxExperience
        ) {
          return false;
        }

        if (typeof minPrice === "number" && expertPrice < minPrice) {
          return false;
        }

        if (typeof maxPrice === "number" && expertPrice > maxPrice) {
          return false;
        }

        return true;
      })
      .sort((leftExpert, rightExpert) => {
        let comparison = 0;

        switch (sortBy) {
          case "experience":
            comparison =
              Number(leftExpert.experience ?? 0) -
              Number(rightExpert.experience ?? 0);
            break;
          case "price":
            comparison =
              Number(leftExpert.price ?? leftExpert.consultationFee ?? 0) -
              Number(rightExpert.price ?? rightExpert.consultationFee ?? 0);
            break;
          case "fullName":
            comparison = leftExpert.fullName.localeCompare(rightExpert.fullName);
            break;
          default:
            comparison =
              new Date(leftExpert.createdAt).getTime() -
              new Date(rightExpert.createdAt).getTime();
        }

        return sortOrder === "asc" ? comparison : -comparison;
      });
  }, [
    activeSortValue,
    experts,
    searchParams,
    searchTerm,
    selectedIndustryId,
    selectedVerification,
  ]);

  const totalExperts = displayedExperts.length;

  const updateUrlParams = useCallback(
    (
      updater: (params: URLSearchParams) => void,
      options?: { resetPage?: boolean },
    ) => {
      const params = new URLSearchParams(searchParams.toString());
      updater(params);

      if (options?.resetPage ?? true) {
        params.delete("page");
      }

      const nextQuery = params.toString();
      router.replace(nextQuery ? `/experts?${nextQuery}` : "/experts", {
        scroll: false,
      });
    },
    [router, searchParams],
  );

  const handleSearch = useCallback(
    (value: string) => {
      updateUrlParams((params) => {
        const trimmedValue = value.trim();

        if (trimmedValue) {
          params.set("searchTerm", trimmedValue);
          return;
        }

        params.delete("searchTerm");
      });
    },
    [updateUrlParams],
  );

  const handleSortChange = useCallback(
    (value: string) => {
      updateUrlParams((params) => {
        const [sortBy, sortOrder] = value.split(":");

        if (sortBy === "createdAt" && sortOrder === "desc") {
          params.delete("sortBy");
          params.delete("sortOrder");
          return;
        }

        params.set("sortBy", sortBy);
        params.set("sortOrder", sortOrder);
      });
    },
    [updateUrlParams],
  );

  const handleSelectFilterChange = useCallback(
    (filterId: "industryId" | "isVerified", value: string) => {
      updateUrlParams((params) => {
        if (value === "all") {
          params.delete(filterId);
          return;
        }

        params.set(filterId, value);
      });
    },
    [updateUrlParams],
  );

  const handleQuickRange = useCallback(
    (field: RangeField, preset?: RangePreset) => {
      updateUrlParams((params) => {
        params.delete(`${field}[gte]`);
        params.delete(`${field}[lte]`);

        if (preset?.gte) {
          params.set(`${field}[gte]`, preset.gte);
        }

        if (preset?.lte) {
          params.set(`${field}[lte]`, preset.lte);
        }
      });
    },
    [updateUrlParams],
  );

  const handlePageChange = useCallback(
    (page: number) => {
      updateUrlParams(
        (params) => {
          if (page <= 1) {
            params.delete("page");
            return;
          }

          params.set("page", String(page));
        },
        { resetPage: false },
      );
    },
    [updateUrlParams],
  );

  const clearAllFilters = useCallback(() => {
    router.replace("/experts", { scroll: false });
  }, [router]);

  const hasActiveFilters =
    Boolean(searchTerm) ||
    Boolean(searchParams.get("industryId")) ||
    Boolean(searchParams.get("isVerified")) ||
    hasExperienceRange ||
    hasPriceRange ||
    Boolean(searchParams.get("sortBy")) ||
    Boolean(searchParams.get("sortOrder"));

  const isActivePreset = (field: RangeField, preset: RangePreset) => {
    return (
      (searchParams.get(`${field}[gte]`) ?? "") === (preset.gte ?? "") &&
      (searchParams.get(`${field}[lte]`) ?? "") === (preset.lte ?? "")
    );
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 py-6">
      <div className="animate-in slide-in-from-top-2 fade-in-0 rounded-3xl border border-violet-200/70 bg-linear-to-br from-violet-500/10 via-background to-fuchsia-500/10 p-5 shadow-lg shadow-violet-500/5 duration-500 md:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <Badge
              variant="secondary"
              className="w-fit gap-1 bg-violet-100 text-violet-700"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Expert network
            </Badge>

            <div className="space-y-2">
              <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                Find the right expert faster
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
                Search by name, title, or industry, then refine results with
                verification, experience, and price filters.
              </p>
            </div>
          </div>

          <Card className="border-violet-200/70 bg-white/80 shadow-sm shadow-violet-500/10 lg:min-w-56">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Showing</p>
              <p className="text-2xl font-semibold text-foreground">{totalExperts}</p>
              <p className="text-sm text-muted-foreground">
                {totalExperts === 1 ? "expert" : "experts"} available
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="w-full xl:max-w-md">
            <DataTableSearch
              key={searchTerm}
              initialValue={searchTerm}
              placeholder="Search by name, title, or industry"
              onDebouncedChange={handleSearch}
              isLoading={isLoading}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={selectedIndustryId}
              onValueChange={(value) =>
                handleSelectFilterChange("industryId", value)
              }
            >
              <SelectTrigger className="h-11 min-w-38 rounded-full border-violet-200 bg-white/90 text-violet-950 shadow-sm transition-all duration-200 hover:border-violet-300 focus:ring-2 focus:ring-violet-500/20">
                <SelectValue placeholder="Industry" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All industries</SelectItem>
                {industries.map((industry: IIndustry) => (
                  <SelectItem key={industry.id} value={industry.id}>
                    {industry.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={selectedVerification}
              onValueChange={(value) =>
                handleSelectFilterChange("isVerified", value)
              }
            >
              <SelectTrigger className="h-11 min-w-36 rounded-full border-violet-200 bg-white/90 text-violet-950 shadow-sm transition-all duration-200 hover:border-violet-300 focus:ring-2 focus:ring-violet-500/20">
                <SelectValue placeholder="Verification" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All experts</SelectItem>
                <SelectItem value="true">Verified only</SelectItem>
                <SelectItem value="false">Unverified</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2 rounded-full border border-violet-200 bg-white/90 px-3 py-1.5 shadow-sm shadow-violet-500/10 transition-all duration-200 hover:border-violet-300">
              <ArrowUpDown className="h-4 w-4 text-violet-600" />
              <Select value={activeSortValue} onValueChange={handleSortChange}>
                <SelectTrigger className="h-8 w-45 border-0 px-0 text-violet-950 shadow-none focus:ring-0">
                  <SelectValue placeholder="Sort experts" />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {hasActiveFilters ? (
              <Button
                variant="ghost"
                size="sm"
                className="text-violet-700 hover:bg-violet-50 hover:text-violet-800"
                onClick={clearAllFilters}
              >
                Clear all
              </Button>
            ) : null}
          </div>
        </div>

        <div className="mt-4 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Experience
            </span>
            {experiencePresets.map((preset) => (
              <Button
                key={preset.label}
                type="button"
                size="sm"
                variant="ghost"
                className={getQuickFilterButtonClass(
                  isActivePreset("experience", preset),
                )}
                onClick={() => handleQuickRange("experience", preset)}
              >
                {preset.label}
              </Button>
            ))}
            {hasExperienceRange ? (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="text-violet-700 hover:bg-violet-50 hover:text-violet-800"
                onClick={() => handleQuickRange("experience")}
              >
                Reset
              </Button>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Price
            </span>
            {pricePresets.map((preset) => (
              <Button
                key={preset.label}
                type="button"
                size="sm"
                variant="ghost"
                className={getQuickFilterButtonClass(
                  isActivePreset("price", preset),
                )}
                onClick={() => handleQuickRange("price", preset)}
              >
                {preset.label}
              </Button>
            ))}
            {hasPriceRange ? (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="text-violet-700 hover:bg-violet-50 hover:text-violet-800"
                onClick={() => handleQuickRange("price")}
              >
                Reset
              </Button>
            ) : null}
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={index} className="border-border/70">
              <CardContent className="space-y-4 p-5">
                <div className="h-6 w-1/2 animate-pulse rounded bg-muted" />
                <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
                <div className="grid grid-cols-2 gap-3">
                  <div className="h-20 animate-pulse rounded-2xl bg-muted" />
                  <div className="h-20 animate-pulse rounded-2xl bg-muted" />
                </div>
                <div className="h-10 animate-pulse rounded-xl bg-muted" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : isError ? (
        <Card className="border-destructive/30">
          <CardContent className="py-10 text-center text-sm text-red-500">
            Failed to load experts.
          </CardContent>
        </Card>
      ) : displayedExperts.length > 0 ? (
        <>
          <div className="flex flex-col gap-2 px-1 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              {totalExperts} result{totalExperts === 1 ? "" : "s"}
              {searchTerm ? (
                <>
                  {" "}for <span className="font-medium text-foreground">“{searchTerm}”</span>
                </>
              ) : null}
            </p>

            {meta ? (
              <p className="text-sm text-muted-foreground">
                Page {meta.page} of {meta.totalPages}
              </p>
            ) : null}
          </div>

          <div className="animate-in fade-in-0 slide-in-from-bottom-2 grid grid-cols-1 gap-4 duration-500 md:grid-cols-2">
            {displayedExperts.map((expert) => (
              <ExpertCard key={expert.id} expert={expert} />
            ))}
          </div>
        </>
      ) : (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <p className="text-lg font-semibold text-foreground">No experts found</p>
            <p className="max-w-md text-sm text-muted-foreground">
              Try adjusting your search, changing the sort, or clearing a few
              filters to see more experts.
            </p>
            <Button variant="outline" onClick={clearAllFilters}>
              Reset search and filters
            </Button>
          </CardContent>
        </Card>
      )}

      {meta && meta.totalPages > 1 ? (
        <div className="flex items-center justify-between rounded-2xl border px-4 py-3">
          <Button
            variant="outline"
            disabled={meta.page <= 1}
            onClick={() => handlePageChange(meta.page - 1)}
          >
            Previous
          </Button>

          <p className="text-sm text-muted-foreground">
            Page <span className="font-medium text-foreground">{meta.page}</span> of {meta.totalPages}
          </p>

          <Button
            variant="outline"
            disabled={meta.page >= meta.totalPages}
            onClick={() => handlePageChange(meta.page + 1)}
          >
            Next
          </Button>
        </div>
      ) : null}
    </div>
  );
}
