"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { RefreshCw } from "lucide-react";

import ExpertConsultationCard from "@/components/modules/Bokings/ExpertConsultationCard";
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

  const upcoming = useMemo(() => {
    return consultations.filter(
      (item) =>
        item.status === "CONFIRMED" || item.status === "PENDING"
    );
  }, [consultations]);

  const completed = useMemo(() => {
    return consultations.filter(
      (item) => item.status === "COMPLETED"
    );
  }, [consultations]);

  const stats = useMemo(
    () => ({
      total: consultations.length,
      upcoming: upcoming.length,
      completed: completed.length,
    }),
    [consultations, upcoming, completed]
  );

  // ---------------- UI ----------------

  return (
    <div className="space-y-6 px-4 py-6 md:px-6">
      {/* HEADER */}
      <section className="rounded-3xl bg-linear-to-r from-slate-900 via-blue-900 to-cyan-800 p-6 text-white shadow-xl">
        <div className="flex flex-col gap-4 md:flex-row md:sessionustify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              My consultations
            </h1>
            <p className="mt-2 text-white/80">
              Track upcoming and completed sessions in one place.
            </p>
          </div>

          <Button
            variant="secondary"
            className="bg-white/15 text-white hover:bg-white/20"
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
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Total</p>
            <p className="text-3xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Upcoming</p>
            <p className="text-3xl font-bold">{stats.upcoming}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Completed</p>
            <p className="text-3xl font-bold">{stats.completed}</p>
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
        <Card>
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
          {/* UPCOMING */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold">
                Upcoming Sessions
              </h2>
              <Badge>{upcoming.length}</Badge>
            </div>

            {upcoming.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No upcoming sessions
              </p>
            ) : (
              <div className="grid gap-4 xl:grid-cols-2">
                {upcoming.map((consultation) => (
                  <ExpertConsultationCard
                    key={consultation.id}
                    consultation={consultation}
                  />
                ))}
              </div>
            )}
          </div>

          {/* COMPLETED */}
          <div className="mt-10 space-y-3">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold">
                Completed Sessions
              </h2>
              <Badge>{completed.length}</Badge>
            </div>

            {completed.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No completed sessions
              </p>
            ) : (
              <div className="grid gap-4 xl:grid-cols-2">
                {completed.map((consultation) => (
                  <ExpertConsultationCard
                    key={consultation.id}
                    consultation={consultation}
                  />
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}