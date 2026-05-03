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
import { getAllIndustries } from "@/src/services/industry.services";
import { getExperts } from "@/src/services/expert.services";
import { aiChatOpenAIFallback } from "@/src/services/ai.service";
import {
  trackCategoryClick,
  trackIndustryExplore,
} from "@/src/lib/aiPersonalization";
import { IExpert } from "@/src/types/expert.types";
import { IIndustry, IIndustryListResponse } from "@/src/types/industry.types";
import { cn } from "@/src/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpDown, Users } from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ExpertCard from "./ExpertCard";
import DataTableSearch, {
  type SearchSuggestion,
} from "../shared/Table/DataTableSearch";

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

const getSortableTimestamp = (expert: IExpert) => {
  const createdAt = Date.parse(expert.createdAt ?? "");

  if (Number.isFinite(createdAt)) {
    return createdAt;
  }

  const updatedAt = Date.parse(expert.updatedAt ?? "");

  return Number.isFinite(updatedAt) ? updatedAt : 0;
};

const isSeededExpert = (expert: IExpert) => {
  if (typeof expert.isSeeded === "boolean") {
    return expert.isSeeded;
  }

  // Backward-compatible fallback for old payloads before seeded flag rollout.
  const email = (expert.email ?? expert.user?.email ?? "").toLowerCase();
  return email.endsWith("@consultedge.test");
};

const getQuickFilterButtonClass = (isActive: boolean) =>
  cn(
    "h-auto min-h-9 rounded-full border px-3 py-2 text-xs font-medium whitespace-nowrap transition-all duration-300 hover:-translate-y-0.5 sm:px-4 sm:text-sm",
    isActive
      ? "border-blue-600 bg-blue-600 text-white shadow-lg shadow-blue-500/25 hover:bg-blue-600 dark:border-blue-500 dark:bg-blue-500"
      : "border-blue-200 bg-white/80 text-blue-700 hover:border-blue-300 hover:bg-blue-50 dark:border-white/15 dark:bg-slate-900/85 dark:text-blue-200 dark:hover:border-blue-400/50 dark:hover:bg-slate-800/90",
  );

const buildAISuggestions = (
  value: string,
  experts: IExpert[],
  industries: IIndustry[],
): SearchSuggestion[] => {
  const trimmed = value.trim().toLowerCase();

  const byName = experts
    .filter((expert) => {
      if (!expert.fullName) return false;
      return trimmed ? expert.fullName.toLowerCase().includes(trimmed) : true;
    })
    .slice(0, 3)
    .map((expert) => ({
      id: `ai-name-${expert.id}`,
      label: expert.fullName,
      value: expert.fullName,
      kind: "name" as const,
      helperText: `AI found this expert · ${expert.title || "Consultant"}${expert.industry?.name ? ` · ${expert.industry.name}` : ""}`,
    }));

  const byTitle = Array.from(
    new Set(
      experts
        .map((expert) => expert.title?.trim())
        .filter((title): title is string => Boolean(title)),
    ),
  )
    .filter((title) => (trimmed ? title.toLowerCase().includes(trimmed) : true))
    .slice(0, 2)
    .map((title) => ({
      id: `ai-title-${title.toLowerCase().replace(/\s+/g, "-")}`,
      label: title,
      value: title,
      kind: "title" as const,
      helperText: "AI suggestion based on recurring expert titles",
    }));

  const byIndustry = industries
    .filter((industry) =>
      trimmed ? industry.name.toLowerCase().includes(trimmed) : true,
    )
    .slice(0, 2)
    .map((industry) => ({
      id: `ai-industry-${industry.id}`,
      label: industry.name,
      value: industry.name,
      kind: "industry" as const,
      helperText: "AI suggestion to explore this industry cluster",
    }));

  return [...byName, ...byTitle, ...byIndustry].slice(0, 6);
};

export default function ExpertsPageClient() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [queryString, setQueryString] = useState(() => searchParams.toString());
  const effectiveQueryString = useMemo(() => {
    const params = new URLSearchParams(queryString);
    if (!params.get("limit")) {
      params.set("limit", "500");
    }
    return params.toString();
  }, [queryString]);
  const currentSearchParams = useMemo(
    () => new URLSearchParams(effectiveQueryString),
    [effectiveQueryString],
  );
  const [aiSearchSuggestions, setAiSearchSuggestions] = useState<SearchSuggestion[]>([]);
  const aiSearchAbortRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const PAGE_SIZE = 12;

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 767px)");
    const updateViewportMode = () => setIsMobileViewport(mediaQuery.matches);
    updateViewportMode();
    mediaQuery.addEventListener("change", updateViewportMode);

    return () => mediaQuery.removeEventListener("change", updateViewportMode);
  }, []);

  useEffect(() => {
    const nextQueryString = searchParams.toString();

    setQueryString((currentValue) =>
      currentValue === nextQueryString ? currentValue : nextQueryString,
    );
  }, [searchParams]);

  useEffect(() => {
    const handlePopState = () => {
      setQueryString(window.location.search.replace(/^\?/, ""));
    };

    window.addEventListener("popstate", handlePopState);

    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const searchTerm = currentSearchParams.get("searchTerm") ?? "";
  const [liveSearchValue, setLiveSearchValue] = useState(searchTerm);
  const activeSortValue = `${currentSearchParams.get("sortBy") ?? "createdAt"}:${currentSearchParams.get("sortOrder") ?? "desc"}`;
  const hasExperienceRange = Boolean(
    currentSearchParams.get("experience[gte]") ||
      currentSearchParams.get("experience[lte]"),
  );
  const hasPriceRange = Boolean(
    currentSearchParams.get("price[gte]") || currentSearchParams.get("price[lte]"),
  );

  const { data, isLoading, isError } = useQuery({
    queryKey: ["experts", effectiveQueryString],
    queryFn: () => getExperts(effectiveQueryString),
    staleTime: 60 * 1000,
  });

  const { data: industries = [] } = useQuery<
    IIndustryListResponse,
    Error,
    IIndustry[]
  >({
    queryKey: ["industries", "experts-filter-options"],
    queryFn: () => getAllIndustries({ page: 1, limit: 100 }),
    select: (response) =>
      Array.isArray(response?.data) ? response.data : [],
    staleTime: 5 * 60 * 1000,
  });

  const experts = useMemo<IExpert[]>(() => (Array.isArray(data?.data) ? data.data : []), [data]);
  const meta = data?.meta;
  const selectedIndustryId = currentSearchParams.get("industryId") ?? "all";
  const selectedVerification = currentSearchParams.get("isVerified") ?? "all";

  useEffect(() => {
    setLiveSearchValue(searchTerm);
  }, [searchTerm]);

  useEffect(() => {
    if (aiSearchAbortRef.current) {
      clearTimeout(aiSearchAbortRef.current);
    }

    const trimmed = liveSearchValue.trim();

    if (trimmed.length < 2) {
      setAiSearchSuggestions([]);
      return;
    }

    aiSearchAbortRef.current = setTimeout(async () => {
      try {
        const resp = await aiChatOpenAIFallback({
          context: "expert-search",
          message: [
            `A user on a consulting platform typed this search query: "${trimmed}".`,
            "Suggest 4 relevant expert titles or specializations they might be looking for.",
            "Return ONLY a comma-separated list, e.g.: Financial Advisor, Investment Strategist, CFO Consultant, Capital Markets Expert",
          ].join("\n"),
        });

        const raw = resp.reply ?? "";
        const parsed: SearchSuggestion[] = raw
          .split(/,|\n/)
          .map((s) => s.replace(/^\s*[-•*\d.]+\s*/, "").trim())
          .filter((s) => s.length > 2 && s.length < 60)
          .slice(0, 4)
          .map((label, i) => ({
            id: `openai-${i}-${label}`,
            label,
            value: label,
            kind: "title" as const,
            helperText: "OpenAI suggestion based on your query",
          }));

        setAiSearchSuggestions(parsed);
      } catch {
        setAiSearchSuggestions([]);
      }
    }, 600);

    return () => {
      if (aiSearchAbortRef.current) {
        clearTimeout(aiSearchAbortRef.current);
      }
    };
  }, [liveSearchValue]);

  const displayedExperts = useMemo(() => {
    const minExperience = parseOptionalNumber(
      currentSearchParams.get("experience[gte]"),
    );
    const maxExperience = parseOptionalNumber(
      currentSearchParams.get("experience[lte]"),
    );
    const minPrice = parseOptionalNumber(currentSearchParams.get("price[gte]"));
    const maxPrice = parseOptionalNumber(currentSearchParams.get("price[lte]"));
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
        if (sortBy === "createdAt") {
          const seededDelta = Number(isSeededExpert(leftExpert)) - Number(isSeededExpert(rightExpert));
          if (seededDelta !== 0) {
            return seededDelta;
          }
        }

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
              getSortableTimestamp(leftExpert) -
              getSortableTimestamp(rightExpert);
        }

        return sortOrder === "asc" ? comparison : -comparison;
      });
  }, [
    activeSortValue,
    currentSearchParams,
    experts,
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
      const params = new URLSearchParams(queryString);
      updater(params);

      if (options?.resetPage ?? true) {
        params.delete("page");
      }

      const nextQuery = params.toString();
      const currentQuery = queryString;

      if (nextQuery === currentQuery) {
        return;
      }

      setQueryString(nextQuery);
      window.history.replaceState(
        null,
        "",
        nextQuery ? `${pathname}?${nextQuery}` : pathname,
      );
    },
    [pathname, queryString],
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
      if (filterId === "industryId") {
        if (value === "all") {
          trackCategoryClick("All industries");
        } else {
          const selectedIndustry = industries.find((industry) => industry.id === value);
          if (selectedIndustry?.name) {
            trackCategoryClick(selectedIndustry.name);
            trackIndustryExplore(selectedIndustry.name);
          }
        }
      }

      if (filterId === "isVerified") {
        if (value === "true") trackCategoryClick("Verified experts");
        if (value === "false") trackCategoryClick("Unverified experts");
      }

      updateUrlParams((params) => {
        if (value === "all") {
          params.delete(filterId);
          return;
        }

        params.set(filterId, value);
      });
    },
    [industries, updateUrlParams],
  );

  const handleQuickRange = useCallback(
    (field: RangeField, preset?: RangePreset) => {
      if (!preset) {
        trackCategoryClick(field === "experience" ? "Experience (reset)" : "Price (reset)");
      } else {
        trackCategoryClick(
          field === "experience"
            ? `Experience ${preset.label}`
            : `Price ${preset.label}`,
        );
      }

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

  const clearAllFilters = useCallback(() => {
    if (!queryString) {
      return;
    }

    setQueryString("");
    window.history.replaceState(null, "", pathname);
  }, [pathname, queryString]);

  const hasActiveFilters =
    Boolean(searchTerm) ||
    Boolean(currentSearchParams.get("industryId")) ||
    Boolean(currentSearchParams.get("isVerified")) ||
    hasExperienceRange ||
    hasPriceRange ||
    Boolean(currentSearchParams.get("sortBy")) ||
    Boolean(currentSearchParams.get("sortOrder"));

  const isActivePreset = (field: RangeField, preset: RangePreset) => {
    return (
      (currentSearchParams.get(`${field}[gte]`) ?? "") === (preset.gte ?? "") &&
      (currentSearchParams.get(`${field}[lte]`) ?? "") === (preset.lte ?? "")
    );
  };

  const aiSuggestions = useMemo(() => {
    const local = buildAISuggestions(liveSearchValue, experts, industries);
    const openaiIds = new Set(aiSearchSuggestions.map((s) => s.label.toLowerCase()));
    const dedupedLocal = local.filter((s) => !openaiIds.has(s.label.toLowerCase()));
    return [...aiSearchSuggestions, ...dedupedLocal].slice(0, 8);
  }, [liveSearchValue, experts, industries, aiSearchSuggestions]);

  useEffect(() => {
    setCurrentPage(1);
  }, [displayedExperts.length, queryString]);

  const totalPages = Math.max(1, Math.ceil(displayedExperts.length / PAGE_SIZE));

  const visibleExperts = useMemo(
    () => displayedExperts.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [displayedExperts, currentPage, PAGE_SIZE],
  );

  const mobileVisibleExperts = useMemo(
    () => displayedExperts.slice(0, currentPage * PAGE_SIZE),
    [displayedExperts, currentPage, PAGE_SIZE],
  );

  const renderedExperts = isMobileViewport ? mobileVisibleExperts : visibleExperts;
  const canLoadMoreOnMobile = mobileVisibleExperts.length < displayedExperts.length;

  useEffect(() => {
    // Prefetch next page card images so transitions feel instant.
    const nextPageExperts = displayedExperts.slice(
      currentPage * PAGE_SIZE,
      (currentPage + 1) * PAGE_SIZE,
    );

    nextPageExperts.forEach((expert) => {
      const imageSrc = (expert.profilePhoto ?? "").trim();
      if (!imageSrc) return;

      const img = new Image();
      img.src = imageSrc;
    });
  }, [displayedExperts, currentPage, PAGE_SIZE]);

  return (
    <div className="mx-auto max-w-6xl space-y-6 py-6">
      <div className="animate-in slide-in-from-top-2 fade-in-0 rounded-3xl border border-blue-200/70 bg-linear-to-br from-blue-500/10 via-background to-cyan-500/10 p-5 shadow-lg shadow-blue-500/5 duration-500 dark:border-white/10 dark:from-slate-950 dark:via-[#071326] dark:to-slate-950 dark:shadow-[0_20px_60px_-28px_rgba(34,211,238,0.28)] md:p-6">
        <div className="space-y-3">
            <Badge
              variant="secondary"
              className="w-fit gap-1 bg-blue-100 text-blue-700 dark:border-white/10 dark:bg-blue-500/15 dark:text-blue-200"
            >
              <Users className="h-3.5 w-3.5" />
              Expert network
            </Badge>

            <div className="space-y-2">
              <h1 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
                Discover experts with a premium consulting profile
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-muted-foreground md:text-base">
                Explore vetted experts by industry, experience, and pricing, then book the right consultant with a polished end-to-end flow.
              </p>
            </div>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] lg:items-start">
          <div className="min-w-0">
            <DataTableSearch
              initialValue={searchTerm}
              placeholder="Search by name, title, or industry"
              suggestionTitle="AI-powered suggestions"
              suggestions={aiSuggestions}
              onValueChange={setLiveSearchValue}
              onSuggestionSelect={(suggestion) => {
                if (suggestion.kind === "industry") {
                  trackCategoryClick(suggestion.value);
                }
                handleSearch(suggestion.value);
              }}
              onDebouncedChange={handleSearch}
              isLoading={isLoading}
            />
          </div>

          <div className="grid gap-2 grid-cols-1 sm:grid-cols-3 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto]">
            <Select
              value={selectedIndustryId}
              onValueChange={(value) =>
                handleSelectFilterChange("industryId", value)
              }
            >
              <SelectTrigger className="h-11 w-full min-w-0 rounded-2xl border-blue-200 bg-white/90 text-left text-blue-950 shadow-sm transition-all duration-200 hover:border-blue-300 focus:ring-2 focus:ring-blue-500/20 dark:border-white/15 dark:bg-slate-900/90 dark:text-slate-100 dark:hover:border-blue-400/40 dark:focus:ring-blue-400/30">
                <SelectValue placeholder="Industry" />
              </SelectTrigger>
              <SelectContent position="popper" className="min-w-48">
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
              <SelectTrigger className="h-11 w-full min-w-0 rounded-2xl border-blue-200 bg-white/90 text-left text-blue-950 shadow-sm transition-all duration-200 hover:border-blue-300 focus:ring-2 focus:ring-blue-500/20 dark:border-white/15 dark:bg-slate-900/90 dark:text-slate-100 dark:hover:border-blue-400/40 dark:focus:ring-blue-400/30">
                <SelectValue placeholder="Verification" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All experts</SelectItem>
                <SelectItem value="true">Verified only</SelectItem>
                <SelectItem value="false">Unverified</SelectItem>
              </SelectContent>
            </Select>

            <Select value={activeSortValue} onValueChange={handleSortChange}>
              <SelectTrigger className="h-11 w-full min-w-0 rounded-2xl border-blue-200 bg-white/90 text-left text-blue-950 shadow-sm transition-all duration-200 hover:border-blue-300 focus:ring-2 focus:ring-blue-500/20 dark:border-white/15 dark:bg-slate-900/90 dark:text-slate-100 dark:hover:border-blue-400/40 dark:focus:ring-blue-400/30">
                <div className="flex min-w-0 items-center gap-2">
                  <ArrowUpDown className="h-4 w-4 shrink-0 text-blue-600 dark:text-blue-300" />
                  <SelectValue placeholder="Sort experts" />
                </div>
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {hasActiveFilters ? (
              <Button
                variant="ghost"
                size="sm"
                className="h-11 justify-center rounded-2xl px-4 text-blue-700 hover:bg-blue-50 hover:text-blue-800 sm:justify-self-start xl:self-stretch dark:text-blue-300 dark:hover:bg-blue-500/15 dark:hover:text-blue-200"
                onClick={clearAllFilters}
              >
                Clear all
              </Button>
            ) : null}
          </div>
        </div>

        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          <div className="rounded-2xl border border-blue-100/80 bg-white/70 p-3 shadow-sm shadow-blue-500/5 dark:border-white/10 dark:bg-slate-950/40">
            <div className="mb-3 flex items-center justify-between gap-3">
              <span className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                Experience
              </span>
              {hasExperienceRange ? (
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="h-auto px-2 py-1 text-xs text-blue-700 hover:bg-blue-50 hover:text-blue-800 dark:text-blue-300 dark:hover:bg-blue-500/15 dark:hover:text-blue-200"
                  onClick={() => handleQuickRange("experience")}
                >
                  Reset
                </Button>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-2">
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
            </div>
          </div>

          <div className="rounded-2xl border border-blue-100/80 bg-white/70 p-3 shadow-sm shadow-blue-500/5 dark:border-white/10 dark:bg-slate-950/40">
            <div className="mb-3 flex items-center justify-between gap-3">
              <span className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                Price
              </span>
              {hasPriceRange ? (
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="h-auto px-2 py-1 text-xs text-blue-700 hover:bg-blue-50 hover:text-blue-800 dark:text-blue-300 dark:hover:bg-blue-500/15 dark:hover:text-blue-200"
                  onClick={() => handleQuickRange("price")}
                >
                  Reset
                </Button>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-2">
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
            </div>
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

            <p className="text-sm text-muted-foreground">
              {isMobileViewport
                ? `Showing ${mobileVisibleExperts.length} of ${totalExperts}`
                : `Showing ${Math.min((currentPage - 1) * PAGE_SIZE + 1, totalExperts)}–${Math.min(
                    currentPage * PAGE_SIZE,
                    totalExperts,
                  )} of ${totalExperts}`}
            </p>
          </div>

          <div className="animate-in fade-in-0 slide-in-from-bottom-2 grid grid-cols-1 gap-4 duration-500 md:grid-cols-2 xl:grid-cols-4">
            {renderedExperts.map((expert) => (
              <ExpertCard key={expert.id} expert={expert} />
            ))}
          </div>

          {!isMobileViewport && totalPages > 1 ? (
            <div className="hidden flex-wrap items-center justify-center gap-1 pt-2 md:flex">
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((page) => page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1)
                .reduce<(number | "...")[]>((acc, page, idx, arr) => {
                  if (idx > 0 && (page as number) - (arr[idx - 1] as number) > 1) acc.push("...");
                  acc.push(page);
                  return acc;
                }, [])
                .map((item, idx) =>
                  item === "..." ? (
                    <span key={`ellipsis-${idx}`} className="px-1 text-sm text-muted-foreground">…</span>
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
                  ),
                )}
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              >
                Next
              </Button>
            </div>
          ) : null}

          {isMobileViewport && canLoadMoreOnMobile ? (
            <div className="pt-2 md:hidden">
              <Button
                variant="outline"
                className="w-full rounded-xl"
                onClick={() => setCurrentPage((page) => Math.min(page + 1, totalPages))}
              >
                Load more experts
              </Button>
            </div>
          ) : null}
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


    </div>
  );
}
