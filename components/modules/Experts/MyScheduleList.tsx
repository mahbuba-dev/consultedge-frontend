"use client";

import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";

import LocalizedDateTime from "./LocalizedDateTime";
import { CalendarDays, PencilLine, PlusCircle, RefreshCw, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  deleteExpertAvailability,
  getMyExpertAvailability,
  getScheduleCatalog,
} from "@/src/services/expertAvailability";
import type { IExpertAvailability } from "@/src/types/expert.types";

const getScheduleStart = (
  item: IExpertAvailability,
  scheduleLookup?: Map<string, { startDateTime?: string | null; endDateTime?: string | null }>,
) => {
  const rawItem = item as IExpertAvailability & {
    startDateTime?: string | null;
    date?: string | null;
    startTime?: string | null;
  };
  const fallbackSchedule = scheduleLookup?.get(item.scheduleId);

  return (
    item.schedule?.startDateTime ??
    fallbackSchedule?.startDateTime ??
    rawItem.startDateTime ??
    (rawItem.date && rawItem.startTime ? `${rawItem.date}T${rawItem.startTime}` : "")
  );
};

const getScheduleEnd = (
  item: IExpertAvailability,
  scheduleLookup?: Map<string, { startDateTime?: string | null; endDateTime?: string | null }>,
) => {
  const rawItem = item as IExpertAvailability & {
    endDateTime?: string | null;
    date?: string | null;
    endTime?: string | null;
  };
  const fallbackSchedule = scheduleLookup?.get(item.scheduleId);

  return (
    item.schedule?.endDateTime ??
    fallbackSchedule?.endDateTime ??
    rawItem.endDateTime ??
    (rawItem.date && rawItem.endTime ? `${rawItem.date}T${rawItem.endTime}` : null)
  );
};

const parseDateTimeValue = (value: string) => {
  let parsed = parseISO(value);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed;
  }
  const fallback = new Date(value);
  if (!Number.isNaN(fallback.getTime())) {
    return fallback;
  }
  return null;
};


// Helper to get ISO strings for start/end
const getScheduleStartISO = (item: IExpertAvailability, scheduleLookup: Map<string, { startDateTime?: string | null; endDateTime?: string | null; }> | undefined) => getScheduleStart(item, scheduleLookup);
const getScheduleEndISO = (item: IExpertAvailability, scheduleLookup: Map<string, { startDateTime?: string | null; endDateTime?: string | null; }> | undefined) => getScheduleEnd(item, scheduleLookup);

export default function MyScheduleList() {
  const queryClient = useQueryClient();

  const {
    data: response,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["expert-my-schedules"],
    queryFn: () =>
      getMyExpertAvailability({
        limit: 500,
        sortBy: "createdAt",
        sortOrder: "desc",
      }),
    staleTime: 5 * 1000,
  });

  const schedules = (response?.data ?? []).filter((item) => item.scheduleId && !item.isDeleted);

  const { data: scheduleCatalog = [] } = useQuery({
    queryKey: ["schedule-catalog"],
    queryFn: () => getScheduleCatalog({ limit: 2000, sortBy: "createdAt", sortOrder: "desc" }),
    staleTime: 30 * 1000,
  });

  const scheduleLookup = new Map(
    scheduleCatalog
      .filter((slot) => slot?.id)
      .map((slot) => [
        slot.id,
        {
          startDateTime: slot.startDateTime,
          endDateTime: slot.endDateTime,
        },
      ]),
  );

  const totalSchedules = schedules.length;
  const availableSchedules = schedules.filter((item) => !item.isBooked).length;

  const deleteMutation = useMutation({
    mutationFn: (scheduleId: string) => deleteExpertAvailability(scheduleId),
    onSuccess: (_, deletedScheduleId) => {
      queryClient.setQueryData(["expert-my-schedules"], (current: any) => {
        if (!current || !Array.isArray(current.data)) {
          return current;
        }

        const nextData = current.data.filter((item: any) => item?.scheduleId !== deletedScheduleId);

        return {
          ...current,
          data: nextData,
          meta: current.meta
            ? {
                ...current.meta,
                total: Math.max(0, Number(current.meta.total ?? nextData.length) - 1),
              }
            : current.meta,
        };
      });

      toast.success("Schedule removed successfully.");
      void queryClient.invalidateQueries({ queryKey: ["expert-my-schedules"] });
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to delete this schedule right now.",
      );
    },
  });

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index}>
            <CardContent className="space-y-3 p-5">
              <Skeleton className="h-5 w-1/2" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle>Unable to load your schedules</CardTitle>
          <CardDescription>
            We could not fetch your expert schedule list right now.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex gap-3">
          <Button type="button" variant="outline" onClick={() => void refetch()}>
            <RefreshCw className="mr-2 size-4" />
            Try again
          </Button>
          <Button asChild>
            <Link href="/expert/dashboard/set-availability">
              <PlusCircle className="mr-2 size-4" />
              Add schedule
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!schedules.length) {
    return (
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle>No schedules added yet</CardTitle>
          <CardDescription>
            Create your first slot, and it will appear here for easy review and deletion.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link href="/expert/dashboard/set-availability">
              <PlusCircle className="mr-2 size-4" />
              Create first schedule
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
            {totalSchedules} total slot{totalSchedules === 1 ? "" : "s"}
          </Badge>
          <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
            {availableSchedules} available
          </Badge>
        </div>

        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={() => void refetch()}>
            <RefreshCw className="mr-2 size-4" />
            Refresh
          </Button>
          <Button asChild>
            <Link href="/expert/dashboard/set-availability">
              <PlusCircle className="mr-2 size-4" />
              Add more
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {schedules.map((item) => {
          const recordId = item.scheduleId;
          const expertScheduleId = item.id;
          const isDeleting = deleteMutation.isPending && deleteMutation.variables === recordId;

          return (
            <Card key={item.id} className="border-border/70 shadow-sm">
              <CardContent className="space-y-4 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <LocalizedDateTime
                      start={getScheduleStartISO(item, scheduleLookup)}
                      end={getScheduleEndISO(item, scheduleLookup)}
                    />
                  </div>

                  <Badge
                    variant={item.isBooked ? "secondary" : "default"}
                    className={item.isBooked ? undefined : "bg-emerald-600 hover:bg-emerald-600"}
                  >
                    {item.isBooked ? "Booked" : "Open"}
                  </Badge>
                </div>

                <div className="rounded-2xl border bg-muted/30 p-3 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <CalendarDays className="size-4" />
                    <span>Schedule ID:</span>
                  </div>
                  <p className="mt-1 break-all font-medium text-foreground">{recordId}</p>
                  <p className="mt-2 text-xs text-muted-foreground">Expert schedule: {expertScheduleId}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button asChild variant="outline" size="sm">
                    <Link href="/expert/dashboard/set-availability">
                      <PencilLine className="mr-2 size-4" />
                      Manage
                    </Link>
                  </Button>

                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    disabled={item.isBooked || isDeleting || !recordId}
                    onClick={() => recordId && deleteMutation.mutate(recordId)}
                  >
                    <Trash2 className="mr-2 size-4" />
                    {isDeleting ? "Deleting..." : "Delete"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
