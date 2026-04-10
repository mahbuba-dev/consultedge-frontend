"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format, isAfter, parseISO } from "date-fns";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Loader2,
  RefreshCw,
  Sparkles,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/src/lib/utils";
import {
  createScheduleSlot,
  deleteExpertAvailability,
  getMyExpertAvailability,
  getScheduleCatalog,
  publishExpertAvailability,
} from "@/src/services/expertAvailavility";
import type { IAvailabilitySlot, IExpertAvailability } from "@/src/types/expert.types";

type ExpertAvailavilityFormProps = {
  mode?: "manage" | "overview";
};

type DateGroup<T> = {
  key: string;
  label: string;
  items: T[];
};

const formatTimeRange = (startValue?: string | null, endValue?: string | null) => {
  if (!startValue) return "Time unavailable";

  const start = parseISO(startValue);
  const end = endValue ? parseISO(endValue) : null;

  return end
    ? `${format(start, "h:mm a")} - ${format(end, "h:mm a")}`
    : format(start, "h:mm a");
};

const groupByDate = <T,>(
  items: T[],
  getStartDate: (item: T) => string | null | undefined,
): DateGroup<T>[] => {
  const grouped = new Map<string, DateGroup<T>>();

  for (const item of items) {
    const startValue = getStartDate(item);
    if (!startValue) continue;

    const parsed = parseISO(startValue);
    const key = format(parsed, "yyyy-MM-dd");
    const existing = grouped.get(key);

    if (existing) {
      existing.items.push(item);
      continue;
    }

    grouped.set(key, {
      key,
      label: format(parsed, "EEEE, MMM d"),
      items: [item],
    });
  }

  return [...grouped.values()].sort((left, right) => left.key.localeCompare(right.key));
};

export default function ExpertAvailavilityForm({
  mode = "manage",
}: ExpertAvailavilityFormProps) {
  const queryClient = useQueryClient();
  const [selectedScheduleIds, setSelectedScheduleIds] = useState<string[]>([]);
  const [customAvailability, setCustomAvailability] = useState({
    date: "",
    startTime: "",
    endTime: "",
  });

  const {
    data: scheduleCatalogResponse,
    isLoading: isCatalogLoading,
    isError: isCatalogError,
    refetch: refetchCatalog,
  } = useQuery({
    queryKey: ["schedule-catalog", "expert-availability"],
    queryFn: () => getScheduleCatalog({ limit: 300 }),
    retry: false,
  });

  const {
    data: myAvailabilityResponse,
    isLoading: isMyAvailabilityLoading,
    refetch: refetchMyAvailability,
  } = useQuery({
    queryKey: ["expert-availability", "my"],
    queryFn: () => getMyExpertAvailability({ limit: 300 }),
    retry: false,
  });

  const rawCatalog = Array.isArray(scheduleCatalogResponse?.data)
    ? scheduleCatalogResponse.data
    : [];
  const myAvailability = Array.isArray(myAvailabilityResponse?.data)
    ? myAvailabilityResponse.data
    : [];
  const availabilityMessage =
    myAvailabilityResponse && myAvailabilityResponse.success === false
      ? myAvailabilityResponse.message
      : null;

  const upcomingCatalog = useMemo(
    () =>
      rawCatalog
        .filter(
          (slot) =>
            !slot.isDeleted &&
            Boolean(slot.startDateTime) &&
            isAfter(parseISO(slot.startDateTime), new Date()),
        )
        .sort(
          (left, right) =>
            new Date(left.startDateTime).getTime() - new Date(right.startDateTime).getTime(),
        ),
    [rawCatalog],
  );

  const publishedScheduleIds = useMemo(
    () => new Set(myAvailability.map((item) => item.scheduleId)),
    [myAvailability],
  );

  const catalogGroups = useMemo(
    () => groupByDate(upcomingCatalog, (slot) => slot.startDateTime),
    [upcomingCatalog],
  );

  const availabilityGroups = useMemo(
    () =>
      groupByDate(myAvailability, (slot) => slot.schedule?.startDateTime).map((group) => ({
        ...group,
        items: [...group.items].sort((left, right) => {
          const leftTime = new Date(left.schedule?.startDateTime || "").getTime();
          const rightTime = new Date(right.schedule?.startDateTime || "").getTime();
          return leftTime - rightTime;
        }),
      })),
    [myAvailability],
  );

  const publishMutation = useMutation({
    mutationFn: (payload: { scheduleIds: string[] }) =>
      publishExpertAvailability({ scheduleIds: payload.scheduleIds }),
    onSuccess: (created) => {
      setSelectedScheduleIds([]);
      queryClient.invalidateQueries({ queryKey: ["expert-availability"] });
      toast.success(
        `${created.length || 0} availability slot${created.length === 1 ? "" : "s"} published successfully.`,
      );
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to publish expert availability right now.",
      );
    },
  });

  const createCustomSlotMutation = useMutation({
    mutationFn: async () => {
      if (
        !customAvailability.date ||
        !customAvailability.startTime ||
        !customAvailability.endTime
      ) {
        throw new Error("Please choose a date, start time, and end time first.");
      }

      const start = new Date(
        `${customAvailability.date}T${customAvailability.startTime}`,
      );
      const end = new Date(`${customAvailability.date}T${customAvailability.endTime}`);

      if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
        throw new Error("Please provide a valid availability time range.");
      }

      if (end <= start) {
        throw new Error("End time must be later than start time.");
      }

      const createdSlot = await createScheduleSlot({
        startDateTime: start.toISOString(),
        endDateTime: end.toISOString(),
      });

      await publishExpertAvailability({ scheduleIds: [createdSlot.id] });
      return createdSlot;
    },
    onSuccess: () => {
      setCustomAvailability({ date: "", startTime: "", endTime: "" });
      queryClient.invalidateQueries({ queryKey: ["schedule-catalog"] });
      queryClient.invalidateQueries({ queryKey: ["expert-availability"] });
      toast.success("New availability slot created and published successfully.");
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to create a new availability slot right now.",
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (scheduleId: string) => deleteExpertAvailability(scheduleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expert-availability"] });
      toast.success("Availability slot removed successfully.");
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to remove this slot right now.",
      );
    },
  });

  const stats = {
    total: myAvailability.length,
    open: myAvailability.filter((item) => !item.isBooked).length,
    booked: myAvailability.filter((item) => item.isBooked).length,
  };

  const toggleSchedule = (scheduleId: string) => {
    setSelectedScheduleIds((current) =>
      current.includes(scheduleId)
        ? current.filter((id) => id !== scheduleId)
        : [...current, scheduleId],
    );
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-violet-200/70 bg-linear-to-br from-violet-50 to-white shadow-sm">
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Published slots</p>
            <p className="mt-2 text-3xl font-bold text-foreground">{stats.total}</p>
          </CardContent>
        </Card>

        <Card className="border-emerald-200/70 bg-linear-to-br from-emerald-50 to-white shadow-sm">
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Open for booking</p>
            <p className="mt-2 text-3xl font-bold text-foreground">{stats.open}</p>
          </CardContent>
        </Card>

        <Card className="border-sky-200/70 bg-linear-to-br from-sky-50 to-white shadow-sm">
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Already booked</p>
            <p className="mt-2 text-3xl font-bold text-foreground">{stats.booked}</p>
          </CardContent>
        </Card>
      </div>

      {mode === "manage" ? (
        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <Card className="border-violet-200/70 shadow-lg shadow-violet-500/5">
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <Badge className="mb-2 bg-violet-100 text-violet-700 hover:bg-violet-100">
                    <Sparkles className="mr-1 size-3.5" />
                    Set Availability
                  </Badge>
                  <CardTitle>Choose schedule blocks</CardTitle>
                  <CardDescription>
                    Select from the schedule catalog and publish the slots you want clients to book.
                  </CardDescription>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => refetchCatalog()}
                    className="border-violet-200 text-violet-700"
                  >
                    <RefreshCw className="mr-2 size-4" />
                    Refresh
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="rounded-2xl border border-violet-200/70 bg-linear-to-r from-violet-50 via-white to-fuchsia-50 p-4">
                <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-violet-800">Create a custom slot</p>
                    <p className="text-sm text-muted-foreground">
                      Add a brand-new availability window and publish it instantly.
                    </p>
                  </div>
                  <Badge className="bg-white text-violet-700">Direct create</Badge>
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                  <Input
                    type="date"
                    min={format(new Date(), "yyyy-MM-dd")}
                    value={customAvailability.date}
                    onChange={(event) =>
                      setCustomAvailability((current) => ({
                        ...current,
                        date: event.target.value,
                      }))
                    }
                  />
                  <Input
                    type="time"
                    value={customAvailability.startTime}
                    onChange={(event) =>
                      setCustomAvailability((current) => ({
                        ...current,
                        startTime: event.target.value,
                      }))
                    }
                  />
                  <Input
                    type="time"
                    value={customAvailability.endTime}
                    onChange={(event) =>
                      setCustomAvailability((current) => ({
                        ...current,
                        endTime: event.target.value,
                      }))
                    }
                  />
                </div>

                <div className="mt-3 flex justify-end">
                  <Button
                    type="button"
                    className="bg-violet-600 hover:bg-violet-700"
                    disabled={createCustomSlotMutation.isPending}
                    onClick={() => createCustomSlotMutation.mutate()}
                  >
                    {createCustomSlotMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 size-4 animate-spin" />
                        Creating slot...
                      </>
                    ) : (
                      "Create & publish slot"
                    )}
                  </Button>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-violet-50/60 px-4 py-3">
                <p className="text-sm text-violet-800">
                  <strong>{selectedScheduleIds.length}</strong> slot
                  {selectedScheduleIds.length === 1 ? "" : "s"} selected for publishing.
                </p>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={!selectedScheduleIds.length}
                    onClick={() => setSelectedScheduleIds([])}
                  >
                    Clear
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    className="bg-violet-600 hover:bg-violet-700"
                    disabled={!selectedScheduleIds.length || publishMutation.isPending}
                    onClick={() =>
                      publishMutation.mutate({ scheduleIds: selectedScheduleIds })
                    }
                  >
                    {publishMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 size-4 animate-spin" />
                        Publishing...
                      </>
                    ) : (
                      "Publish selected slots"
                    )}
                  </Button>
                </div>
              </div>

              {isCatalogError ? (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                  Could not load the schedule catalog. Make sure your backend exposes
                  <code className="mx-1 rounded bg-white px-1 py-0.5">GET /schedules</code>
                  for expert availability setup.
                </div>
              ) : null}

              {availabilityMessage ? (
                <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-800">
                  {availabilityMessage}
                </div>
              ) : null}

              {isCatalogLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((item) => (
                    <div key={item} className="h-20 animate-pulse rounded-2xl bg-muted" />
                  ))}
                </div>
              ) : catalogGroups.length > 0 ? (
                <div className="space-y-4">
                  {catalogGroups.map((group) => (
                    <div key={group.key} className="space-y-2">
                      <div className="flex items-center gap-2">
                        <CalendarDays className="size-4 text-violet-700" />
                        <p className="font-medium text-foreground">{group.label}</p>
                        <Badge variant="outline">{group.items.length} slots</Badge>
                      </div>

                      <div className="grid gap-2 sm:grid-cols-2">
                        {group.items.map((slot) => {
                          const isLive = publishedScheduleIds.has(slot.id);
                          const isSelected = selectedScheduleIds.includes(slot.id);

                          return (
                            <button
                              key={slot.id}
                              type="button"
                              disabled={isLive}
                              onClick={() => toggleSchedule(slot.id)}
                              className={cn(
                                "rounded-2xl border px-4 py-3 text-left transition-all duration-300",
                                isLive
                                  ? "cursor-not-allowed border-emerald-200 bg-emerald-50 text-emerald-800"
                                  : isSelected
                                    ? "border-violet-500 bg-violet-600 text-white shadow-lg shadow-violet-500/15"
                                    : "border-violet-200 bg-white hover:border-violet-300 hover:bg-violet-50",
                              )}
                            >
                              <div className="flex items-center justify-between gap-3">
                                <div>
                                  <p className="font-medium">
                                    {formatTimeRange(slot.startDateTime, slot.endDateTime)}
                                  </p>
                                  <p className="text-xs opacity-80">
                                    Slot ID: {slot.id.slice(0, 8)}...
                                  </p>
                                </div>

                                <Badge
                                  className={cn(
                                    isLive
                                      ? "bg-emerald-100 text-emerald-700"
                                      : isSelected
                                        ? "bg-white/15 text-white"
                                        : "bg-violet-100 text-violet-700",
                                  )}
                                >
                                  {isLive ? "Live" : isSelected ? "Selected" : "Add"}
                                </Badge>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
                  No reusable schedule catalog items are available yet. You can still use the
                  <strong className="mx-1 text-foreground">Create a custom slot</strong>
                  section above to publish your own availability.
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-violet-200/70 shadow-lg shadow-violet-500/5">
            <CardHeader>
              <Badge className="mb-2 w-fit bg-fuchsia-100 text-fuchsia-700 hover:bg-fuchsia-100">
                Live view
              </Badge>
              <CardTitle>Your published availability</CardTitle>
              <CardDescription>
                Monitor active slots, see booked ones, and remove unbooked availability when needed.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AvailabilityList
                groups={availabilityGroups}
                isLoading={isMyAvailabilityLoading}
                isDeleting={deleteMutation.isPending}
                onDelete={(scheduleId) => deleteMutation.mutate(scheduleId)}
                onRefresh={() => refetchMyAvailability()}
              />
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card className="border-violet-200/70 shadow-lg shadow-violet-500/5">
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <Badge className="mb-2 bg-violet-100 text-violet-700 hover:bg-violet-100">
                  <CheckCircle2 className="mr-1 size-3.5" />
                  My Schedule
                </Badge>
                <CardTitle>Upcoming availability</CardTitle>
                <CardDescription>
                  Review the slots you have already published and keep your calendar fresh.
                </CardDescription>
              </div>

              <Link href="/expert/dashboard/set-availability">
                <Button className="bg-violet-600 hover:bg-violet-700">Set availability</Button>
              </Link>
            </div>
          </CardHeader>

          <CardContent>
            <AvailabilityList
              groups={availabilityGroups}
              isLoading={isMyAvailabilityLoading}
              isDeleting={deleteMutation.isPending}
              onDelete={(scheduleId) => deleteMutation.mutate(scheduleId)}
              onRefresh={() => refetchMyAvailability()}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

type AvailabilityListProps = {
  groups: DateGroup<IExpertAvailability>[];
  isLoading: boolean;
  isDeleting: boolean;
  onDelete: (scheduleId: string) => void;
  onRefresh: () => void;
};

function AvailabilityList({
  groups,
  isLoading,
  isDeleting,
  onDelete,
  onRefresh,
}: AvailabilityListProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((item) => (
          <div key={item} className="h-20 animate-pulse rounded-2xl bg-muted" />
        ))}
      </div>
    );
  }

  if (!groups.length) {
    return (
      <div className="rounded-2xl border border-dashed px-4 py-8 text-center">
        <p className="text-lg font-semibold text-foreground">No availability published yet</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Add your first available slot to start receiving consultation bookings.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button type="button" variant="outline" size="sm" onClick={onRefresh}>
          <RefreshCw className="mr-2 size-4" />
          Refresh list
        </Button>
      </div>

      {groups.map((group) => (
        <div key={group.key} className="space-y-2">
          <div className="flex items-center gap-2">
            <CalendarDays className="size-4 text-violet-700" />
            <p className="font-medium text-foreground">{group.label}</p>
            <Badge variant="outline">{group.items.length} items</Badge>
          </div>

          <div className="space-y-2">
            {group.items.map((slot) => (
              <div
                key={slot.id}
                className="flex flex-col gap-3 rounded-2xl border bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <Clock3 className="size-4 text-violet-700" />
                    <p className="font-medium text-foreground">
                      {formatTimeRange(
                        slot.schedule?.startDateTime,
                        slot.schedule?.endDateTime,
                      )}
                    </p>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Status: {slot.isBooked ? "Booked by a client" : "Available for booking"}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Badge
                    className={cn(
                      slot.isBooked
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-violet-100 text-violet-700",
                    )}
                  >
                    {slot.isBooked ? "Booked" : "Open"}
                  </Badge>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={slot.isBooked || isDeleting}
                    onClick={() => onDelete(slot.scheduleId)}
                  >
                    {isDeleting ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Trash2 className="size-4" />
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
