"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, RefreshCw, Sparkles } from "lucide-react";

import ExpertConsultationCard from "@/components/modules/Bokings/ExpertConsultationCard";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getMyExpertBookings } from "@/src/services/bookings";

export default function MyConsultationsPage() {
  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["expert-consultations"],
    queryFn: () => getMyExpertBookings({ limit: 50, sortBy: "date", sortOrder: "desc" }),
  });

  const consultations = useMemo(
    () => (Array.isArray(data?.data) ? data.data : []),
    [data],
  );

  const stats = useMemo(
    () => ({
      total: consultations.length,
      active: consultations.filter((item) => item.status === "CONFIRMED" || item.status === "PENDING").length,
      completed: consultations.filter((item) => item.status === "COMPLETED").length,
    }),
    [consultations],
  );

  return (
    <div className="space-y-6 px-4 py-6 md:px-6">
      <section className="overflow-hidden rounded-3xl border-0 bg-linear-to-r from-slate-900 via-violet-900 to-fuchsia-800 p-6 text-white shadow-xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="mb-2 text-sm font-medium text-white/80">Expert Dashboard</p>
            <h1 className="text-3xl font-bold tracking-tight">My consultations</h1>
            <p className="mt-2 max-w-2xl text-white/80">
              Review upcoming client sessions, payment status, and consultation activity in one polished workspace.
            </p>
          </div>

          <Button variant="secondary" className="bg-white/15 text-white hover:bg-white/20 hover:text-white" onClick={() => void refetch()} disabled={isFetching}>
            <RefreshCw className={`mr-2 size-4 ${isFetching ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-violet-200/70 bg-linear-to-br from-violet-50 to-white shadow-sm">
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Total consultations</p>
            <p className="mt-2 text-3xl font-bold text-foreground">{stats.total}</p>
          </CardContent>
        </Card>

        <Card className="border-sky-200/70 bg-linear-to-br from-sky-50 to-white shadow-sm">
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Active sessions</p>
            <p className="mt-2 text-3xl font-bold text-foreground">{stats.active}</p>
          </CardContent>
        </Card>

        <Card className="border-emerald-200/70 bg-linear-to-br from-emerald-50 to-white shadow-sm">
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Completed</p>
            <p className="mt-2 text-3xl font-bold text-foreground">{stats.completed}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-violet-200/70 bg-linear-to-r from-violet-50 via-white to-cyan-50 shadow-sm">
        <CardHeader>
          <Badge className="mb-2 w-fit bg-violet-100 text-violet-700 hover:bg-violet-100">
            <Sparkles className="mr-1 size-3.5" />
            Expert consultations
          </Badge>
          <CardTitle className="text-2xl">Client consultation activity</CardTitle>
          <CardDescription>
            Stay on top of upcoming sessions, monitor payment progress, and keep client communication flowing.
          </CardDescription>
        </CardHeader>
      </Card>

      {isError ? (
        <Alert variant="destructive">
          <AlertTitle>Could not load consultations</AlertTitle>
          <AlertDescription>
            {error instanceof Error
              ? error.message
              : "Expert consultation data is unavailable right now. Please try again shortly."}
          </AlertDescription>
        </Alert>
      ) : null}

      {isLoading ? (
        <div className="grid gap-4 xl:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={index} className="h-64 animate-pulse bg-muted/40" />
          ))}
        </div>
      ) : consultations.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
            <div>
              <h3 className="text-lg font-semibold">No consultations yet</h3>
              <p className="text-sm text-muted-foreground">
                When clients book your availability, the sessions will appear here automatically.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {consultations.map((consultation) => (
            <ExpertConsultationCard key={consultation.id} consultation={consultation} />
          ))}
        </div>
      )}
    </div>
  );
}