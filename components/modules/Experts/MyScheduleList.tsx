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

const parseDateTimeValue = (value: string) => {
  let parsed = parseISO(value);
  if (!Number.isNaN(parsed.getTime())) return parsed;

  const fallback = new Date(value);
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

    return (
      <Card key={item.id} className="shadow-sm">
        <CardContent className="p-5 space-y-4">
          <div className="flex justify-between">
            <LocalizedDateTime
              start={getScheduleStart(item, scheduleLookup)}
              end={getScheduleEnd(item, scheduleLookup)}
            />

            <Badge variant={item.isBooked ? "secondary" : "default"}>
              {item.isBooked ? "Booked" : "Open"}
            </Badge>
          </div>

          <div className="text-sm border rounded-xl p-3">
            <div className="flex items-center gap-2 text-muted-foreground">
              <CalendarDays className="size-4" />
              ID
            </div>
            <p className="font-medium break-all">{recordId}</p>
          </div>

          <div className="flex gap-2">
            <Button size="sm" variant="outline" asChild>
              <Link href="/expert/dashboard/set-availability">
                <PencilLine className="mr-2 size-4" />
                Manage
              </Link>
            </Button>

            <Button
              size="sm"
              variant="destructive"
              disabled={item.isBooked || isDeleting}
              onClick={() => recordId && deleteMutation.mutate(recordId)}
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
    <div className="space-y-4">
      <div className="flex justify-between">
        <Button variant="outline" onClick={() => refetch()}>
          <RefreshCw className="mr-2 size-4" />
          Refresh
        </Button>

        <Button asChild>
          <Link href="/expert/dashboard/set-availability">
            <PlusCircle className="mr-2 size-4" />
            Add
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="available" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="available">
            Available ({available.length})
          </TabsTrigger>
          <TabsTrigger value="booked">
            Booked ({Booked.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="available" className="mt-4">
          {available.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No available sessions
            </p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {available.map((x) => renderCard(x.item))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="booked" className="mt-4">
          {Booked.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No booked sessions
            </p>
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