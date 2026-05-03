"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { parseISO } from "date-fns";

import LocalizedDateTime from "./LocalizedDateTime";
import { CalendarDays, PencilLine, PlusCircle, RefreshCw, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
  deleteExpertAvailability,
  getMyExpertAvailability,
  getScheduleCatalog,
} from "@/src/services/expertAvailability";
import type { IExpertAvailability } from "@/src/types/expert.types";

// ---------------- HELPERS ----------------

const getScheduleStart = (item: IExpertAvailability, lookup?: Map<string, any>) => {
  const raw = item as any;
  const fallback = lookup?.get(item.scheduleId);

  return (
    item.schedule?.startDateTime ??
    fallback?.startDateTime ??
    raw.startDateTime ??
    (raw.date && raw.startTime ? `${raw.date}T${raw.startTime}` : "")
  );
};

const getScheduleEnd = (item: IExpertAvailability, lookup?: Map<string, any>) => {
  const raw = item as any;
  const fallback = lookup?.get(item.scheduleId);

  return (
    item.schedule?.endDateTime ??
    fallback?.endDateTime ??
    raw.endDateTime ??
    (raw.date && raw.endTime ? `${raw.date}T${raw.endTime}` : null)
  );
};

const stripTimezone = (value: string) =>
  value.trim().replace(/Z$/i, "").replace(/[+-]\d{2}:?\d{2}$/, "");

const parseDateTimeValue = (value: string) => {
  const cleaned = stripTimezone(value);
  const parsed = parseISO(cleaned);
  if (!Number.isNaN(parsed.getTime())) return parsed;

  const fallback = new Date(cleaned);
  if (!Number.isNaN(fallback.getTime())) return fallback;

  return null;
};

// ---------------- COMPONENT ----------------

export default function MyScheduleList() {
  const queryClient = useQueryClient();

  const { data: response, isLoading, isError, refetch } = useQuery({
    queryKey: ["expert-my-schedules"],
    queryFn: () =>
      getMyExpertAvailability({
        limit: 500,
        sortBy: "createdAt",
        sortOrder: "desc",
      }),
  });

  const schedules = (response?.data ?? []).filter(
    (item) => item.scheduleId && !item.isDeleted,
  );

  const { data: scheduleCatalog = [] } = useQuery({
    queryKey: ["schedule-catalog"],
    queryFn: () =>
      getScheduleCatalog({
        limit: 2000,
        sortBy: "createdAt",
        sortOrder: "desc",
      }),
  });

  const scheduleLookup = new Map(
    scheduleCatalog
      .filter((s) => s?.id)
      .map((s) => [
        s.id,
        { startDateTime: s.startDateTime, endDateTime: s.endDateTime },
      ]),
  );

  // ---------------- SPLIT DATA ----------------
  // Partition by actual booking status, not by time. A slot whose start has
  // already passed today is still "Available" unless someone actually booked
  // it. Within each group we hide deleted slots and sort upcoming ascending,
  // past descending.

  const now = new Date();
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  );

  const decorated = schedules
    .map((item) => {
      const start = getScheduleStart(item, scheduleLookup);
      const date = start ? parseDateTimeValue(start) : null;
      return { item, date };
    })
    .filter((x) => !x.item.isDeleted);

  // Slots whose date is before today and were never booked are expired —
  // hide them from the UI and auto-delete them on the server.
  const expired = decorated.filter(
    (x) => !x.item.isBooked && x.date != null && x.date < startOfToday,
  );

  const visible = decorated.filter((x) => !expired.includes(x));

  const available = visible
    .filter((x) => !x.item.isBooked)
    .sort((a, b) => {
      const ta = a.date ? a.date.getTime() : 0;
      const tb = b.date ? b.date.getTime() : 0;
      return ta - tb;
    });

  const Booked = visible
    .filter((x) => x.item.isBooked)
    .sort((a, b) => {
      const ta = a.date ? a.date.getTime() : 0;
      const tb = b.date ? b.date.getTime() : 0;
      return tb - ta;
    });

  // ---------------- DELETE ----------------

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteExpertAvailability(id),
    onSuccess: (_, id) => {
      queryClient.setQueryData(["expert-my-schedules"], (current: any) => {
        if (!current?.data) return current;
        return {
          ...current,
          data: current.data.filter((i: any) => i.scheduleId !== id),
        };
      });

      toast.success("Schedule removed");
    },
    onError: () => toast.error("Delete failed"),
  });

  // Auto-cleanup: silently delete any slot whose date has already passed and
  // was never booked. Each expired id is attempted only once per session.
  const autoDeletedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!expired.length) return;

    expired.forEach((x) => {
      const id = x.item.scheduleId;
      if (!id || autoDeletedRef.current.has(id)) return;
      autoDeletedRef.current.add(id);

      // Fire-and-forget: remove from cache optimistically and hit the API.
      queryClient.setQueryData(["expert-my-schedules"], (current: any) => {
        if (!current?.data) return current;
        return {
          ...current,
          data: current.data.filter((i: any) => i.scheduleId !== id),
        };
      });

      deleteExpertAvailability(id).catch(() => {
        // Silent: if the API call fails we just stop retrying this id.
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expired.map((x) => x.item.scheduleId).join(",")]);

  // ---------------- UI STATES ----------------

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-5 space-y-3">
              <Skeleton className="h-5 w-1/2" />
              <Skeleton className="h-4 w-2/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error loading schedules</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={() => refetch()}>
            <RefreshCw className="mr-2 size-4" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!schedules.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No schedules yet</CardTitle>
          <CardDescription>Create your first session</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link href="/expert/dashboard/set-availability">
              <PlusCircle className="mr-2 size-4" />
              Create
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  // ---------------- CARD ----------------

  const renderCard = (item: IExpertAvailability) => {
    const recordId = item.scheduleId;
    const isDeleting =
      deleteMutation.isPending && deleteMutation.variables === recordId;
    const isBooked = item.isBooked;

    return (
      <Card
        key={item.id}
        className="group relative overflow-hidden border-slate-200/70 bg-white/70 shadow-sm backdrop-blur transition-all hover:shadow-md dark:border-white/10 dark:bg-slate-900/60"
      >
        <div
          className={`absolute inset-x-0 top-0 h-1 ${
            isBooked
              ? "bg-linear-to-r from-amber-500 via-orange-500 to-rose-500"
              : "bg-linear-to-r from-emerald-500 via-teal-500 to-cyan-500"
          }`}
        />
        <div
          className={`pointer-events-none absolute -right-16 -top-16 hidden size-44 rounded-full blur-3xl dark:block ${
            isBooked ? "bg-amber-500/10" : "bg-emerald-500/10"
          }`}
        />

        <CardContent className="relative space-y-4 p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div
                className={`inline-flex size-10 items-center justify-center rounded-full text-white shadow-md ${
                  isBooked
                    ? "bg-linear-to-br from-amber-500 to-orange-500 shadow-amber-500/30"
                    : "bg-linear-to-br from-emerald-500 to-teal-500 shadow-emerald-500/30"
                }`}
              >
                <CalendarDays className="size-5" />
              </div>
              <LocalizedDateTime
                start={getScheduleStart(item, scheduleLookup)}
                end={getScheduleEnd(item, scheduleLookup)}
              />
            </div>

            <Badge
              className={
                isBooked
                  ? "border-amber-200/60 bg-amber-100 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/15 dark:text-amber-200"
                  : "border-emerald-200/60 bg-emerald-100 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-200"
              }
            >
              {isBooked ? "Booked" : "Open"}
            </Badge>
          </div>

          <div className="rounded-xl border border-slate-200/70 bg-white/50 p-3 text-sm dark:border-white/10 dark:bg-white/5">
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              <span className="inline-flex size-6 items-center justify-center rounded-full border border-slate-200/80 bg-white/85 text-emerald-600 shadow-sm dark:border-white/15 dark:bg-slate-900/80 dark:text-emerald-300">
                <CalendarDays className="size-3.5" />
              </span>
              Slot ID
            </div>
            <p className="mt-1 break-all font-mono text-xs text-foreground/80">
              {recordId}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              asChild
              className="border-slate-200/70 bg-white/70 backdrop-blur dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
            >
              <Link href="/expert/dashboard/set-availability">
                <PencilLine className="mr-2 size-4" />
                Manage
              </Link>
            </Button>

            <Button
              size="sm"
              disabled={isBooked || isDeleting}
              onClick={() => recordId && deleteMutation.mutate(recordId)}
              className="bg-linear-to-r from-rose-500 to-red-500 text-white shadow-md shadow-rose-500/25 hover:from-rose-600 hover:to-red-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Trash2 className="mr-2 size-4" />
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  // ---------------- FINAL UI ----------------

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button
          variant="outline"
          onClick={() => refetch()}
          className="rounded-full border-slate-200/70 bg-white/70 backdrop-blur dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
        >
          <RefreshCw className="mr-2 size-4" />
          Refresh
        </Button>

        <Button
          asChild
          className="rounded-full bg-linear-to-r from-blue-600 to-cyan-500 text-white shadow-md shadow-cyan-500/25 hover:from-blue-700 hover:to-cyan-600"
        >
          <Link href="/expert/dashboard/set-availability">
            <PlusCircle className="mr-2 size-4" />
            Add new
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="available" className="w-full">
        <TabsList className="grid w-full grid-cols-2 rounded-full border border-slate-200/70 bg-white/70 p-1 backdrop-blur dark:border-white/10 dark:bg-slate-900/60">
          <TabsTrigger
            value="available"
            className="rounded-full data-[state=active]:bg-linear-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500 data-[state=active]:text-white data-[state=active]:shadow-md"
          >
            Available ({available.length})
          </TabsTrigger>
          <TabsTrigger
            value="booked"
            className="rounded-full data-[state=active]:bg-linear-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-500 data-[state=active]:text-white data-[state=active]:shadow-md"
          >
            Booked ({Booked.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="available" className="mt-5">
          {available.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200/70 bg-white/40 p-8 text-center text-sm text-muted-foreground dark:border-white/10 dark:bg-white/5">
              No available sessions yet — add one to get started.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {available.map((x) => renderCard(x.item))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="booked" className="mt-5">
          {Booked.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200/70 bg-white/40 p-8 text-center text-sm text-muted-foreground dark:border-white/10 dark:bg-white/5">
              No booked sessions yet.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {Booked.map((x) => renderCard(x.item))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}