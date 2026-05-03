"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CalendarClock, CheckCircle2, Clock, RefreshCw, Sparkles, AlertTriangle } from "lucide-react";

import ExpertConsultationCard from "@/components/modules/Bokings/ExpertConsultationCard";
import ConsultationTabs from "@/components/modules/Tabs/ConsultationTabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getMyExpertBookings } from "@/src/services/bookings.service";
import { IConsultation } from "@/src/types/booking.types";

type ConsultationResponseShape = {
  data?: unknown;
  consultations?: unknown;
  items?: unknown;
  result?: unknown;
  results?: unknown;
};

const extractConsultations = (payload: unknown): IConsultation[] => {
  if (Array.isArray(payload)) {
    return payload as IConsultation[];
  }

  if (!payload || typeof payload !== "object") {
    return [];
  }

  const candidate = payload as ConsultationResponseShape;
  const pools = [
    candidate.data,
    candidate.consultations,
    candidate.items,
    candidate.result,
    candidate.results,
  ];

  for (const pool of pools) {
    if (Array.isArray(pool)) {
      return pool as IConsultation[];
    }

    if (pool && typeof pool === "object") {
      const nested = pool as ConsultationResponseShape;

      if (Array.isArray(nested.data)) return nested.data as IConsultation[];
      if (Array.isArray(nested.consultations)) return nested.consultations as IConsultation[];
      if (Array.isArray(nested.items)) return nested.items as IConsultation[];
      if (Array.isArray(nested.result)) return nested.result as IConsultation[];
      if (Array.isArray(nested.results)) return nested.results as IConsultation[];
    }
  }

  return [];
};

export default function MySessionPage() {
  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["expert-consultations"],
    queryFn: () =>
      getMyExpertBookings({
        limit: 50,
        sortBy: "date",
        sortOrder: "desc",
      }),
  });

  // ---------------- DATA ----------------

  const consultations = useMemo(
    () => extractConsultations(data),
    [data]
  );

  const getEndTime = (item: IConsultation) => {
    const raw = item as IConsultation & {
      endDateTime?: string | null;
      schedule?: { endDateTime?: string | null } | null;
    };
    const endIso =
      item.expertSchedule?.schedule?.endDateTime ??
      raw.schedule?.endDateTime ??
      raw.endDateTime ??
      null;
    if (endIso) return new Date(endIso);
    return item.date ? new Date(item.date) : null;
  };

  const isMissed = (item: IConsultation) => {
    const end = getEndTime(item);
    if (!end) return false;
    return end < new Date();
  };

  const upcoming = useMemo(
    () =>
      consultations.filter(
        (item) =>
          (item.status === "CONFIRMED" || item.status === "PENDING") &&
          !isMissed(item)
      ),
    [consultations]
  );

  const completed = useMemo(
    () => consultations.filter((item) => item.status === "COMPLETED"),
    [consultations]
  );

  const missed = useMemo(
    () =>
      consultations.filter(
        (item) =>
          (item.status === "CONFIRMED" || item.status === "PENDING") &&
          isMissed(item)
      ),
    [consultations]
  );

  const stats = useMemo(
    () => ({
      total: consultations.length,
      upcoming: upcoming.length,
      completed: completed.length,
      missed: missed.length,
    }),
    [consultations, upcoming, completed, missed]
  );

  const [activeTab, setActiveTab] = useState<"upcoming" | "completed" | "missed">("upcoming");

  const resolvedActiveTab =
    activeTab === "missed" && missed.length === 0 && upcoming.length > 0
      ? "upcoming"
      : activeTab;

  const visibleList =
    resolvedActiveTab === "upcoming"
      ? upcoming
      : resolvedActiveTab === "completed"
        ? completed
        : missed;

  // ---------------- UI ----------------

  return (
    <div className="space-y-6 px-4 py-6 md:px-6">
      {/* HEADER */}
      <section className="relative overflow-hidden rounded-3xl bg-linear-to-r from-slate-900 via-blue-900 to-cyan-800 p-8 text-white shadow-xl">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.25),transparent_55%),radial-gradient(circle_at_bottom_left,rgba(37,99,235,0.25),transparent_55%)]"
        />
        <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <Badge className="border-white/20 bg-white/10 text-white backdrop-blur">
              <Sparkles className="mr-1 size-3.5" />
              Expert Dashboard
            </Badge>
            <h1 className="text-3xl font-bold tracking-tight">
              My consultations
            </h1>
            <p className="text-white/80">
              Track upcoming and completed sessions in one place.
            </p>
          </div>

          <Button
            className="rounded-full border border-white/20 bg-white/10 text-white backdrop-blur hover:bg-white/20"
            onClick={() => void refetch()}
            disabled={isFetching}
          >
            <RefreshCw
              className={`mr-2 size-4 ${isFetching ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
      </section>

      {/* STATS */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="relative overflow-hidden border-blue-200/60 bg-linear-to-br from-blue-50 to-white shadow-sm dark:border-blue-500/20 dark:from-blue-500/10 dark:to-slate-900/80">
          <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-blue-600 to-cyan-500" />
          <CardContent className="flex items-start justify-between gap-3 p-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total</p>
              <p className="mt-2 text-3xl font-bold text-foreground">{stats.total}</p>
            </div>
            <div className="inline-flex size-10 items-center justify-center rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300">
              <CalendarClock className="size-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-emerald-200/60 bg-linear-to-br from-emerald-50 to-white shadow-sm dark:border-emerald-500/20 dark:from-emerald-500/10 dark:to-slate-900/80">
          <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-emerald-500 to-teal-500" />
          <CardContent className="flex items-start justify-between gap-3 p-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Upcoming</p>
              <p className="mt-2 text-3xl font-bold text-foreground">{stats.upcoming}</p>
            </div>
            <div className="inline-flex size-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300">
              <Clock className="size-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-violet-200/60 bg-linear-to-br from-violet-50 to-white shadow-sm dark:border-violet-500/20 dark:from-violet-500/10 dark:to-slate-900/80">
          <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-violet-500 to-fuchsia-500" />
          <CardContent className="flex items-start justify-between gap-3 p-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Completed</p>
              <p className="mt-2 text-3xl font-bold text-foreground">{stats.completed}</p>
            </div>
            <div className="inline-flex size-10 items-center justify-center rounded-full bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300">
              <CheckCircle2 className="size-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-rose-200/60 bg-linear-to-br from-rose-50 to-white shadow-sm dark:border-rose-500/20 dark:from-rose-500/10 dark:to-slate-900/80">
          <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-rose-500 to-orange-500" />
          <CardContent className="flex items-start justify-between gap-3 p-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Missed</p>
              <p className="mt-2 text-3xl font-bold text-foreground">{stats.missed}</p>
            </div>
            <div className="inline-flex size-10 items-center justify-center rounded-full bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300">
              <AlertTriangle className="size-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ERROR */}
      {isError && (
        <Alert variant="destructive">
          <AlertTitle>Failed to load sessions</AlertTitle>
          <AlertDescription>
            {error instanceof Error
              ? error.message
              : "Something went wrong."}
          </AlertDescription>
        </Alert>
      )}

      {/* LOADING */}
      {isLoading ? (
        <div className="grid gap-4 xl:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="h-64 animate-pulse" />
          ))}
        </div>
      ) : consultations.length === 0 ? (
        <Card className="border-dashed border-slate-200/70 bg-white/60 dark:border-white/10 dark:bg-slate-900/60">
          <CardContent className="py-12 text-center">
            <h3 className="text-lg font-semibold">
              No consultations yet
            </h3>
            <p className="text-sm text-muted-foreground">
              Your booked sessions will appear here automatically.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <ConsultationTabs
            activeTab={resolvedActiveTab}
            setActiveTab={setActiveTab}
            upcomingCount={upcoming.length}
            completedCount={completed.length}
            missedCount={missed.length}
          />

          {visibleList.length === 0 ? (
            <Card className="border-dashed border-slate-200/70 bg-white/60 dark:border-white/10 dark:bg-slate-900/60">
              <CardContent className="py-10 text-center text-sm text-muted-foreground">
                {resolvedActiveTab === "upcoming"
                  ? "No upcoming sessions."
                  : resolvedActiveTab === "completed"
                    ? "No completed sessions yet."
                    : "No missed sessions."}
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 xl:grid-cols-2">
              {visibleList.map((consultation) => (
                <ExpertConsultationCard
                  key={consultation.id}
                  consultation={consultation}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}