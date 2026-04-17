"use client";

import Link from "next/link";
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

  const now = new Date();

  // ---------------- SPLIT DATA ----------------

  const available = schedules
    .map((item) => {
      const start = getScheduleStart(item, scheduleLookup);
      const date = start ? parseDateTimeValue(start) : null;
      return { item, date };
    })
    .filter((x) => x.date && x.date >= now)
    .sort((a, b) => a.date!.getTime() - b.date!.getTime());

  const Booked = schedules
    .map((item) => {
      const start = getScheduleStart(item, scheduleLookup);
      const date = start ? parseDateTimeValue(start) : null;
      return { item, date };
    })
    .filter((x) => x.date && x.date < now)
    .sort((a, b) => b.date!.getTime() - a.date!.getTime());

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