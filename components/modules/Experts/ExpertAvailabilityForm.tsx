"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { differenceInCalendarDays, format } from "date-fns";
import {
  CalendarPlus,
  CalendarRange,
  Clock,
  Loader2,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createScheduleSlot } from "@/src/services/expertAvailability";

export default function ExpertAvailabilityForm() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [formState, setFormState] = useState({
    startDate: "",
    endDate: "",
    startTime: "",
    endTime: "",
  });

  // Min attribute for <input type="date"> is today's local date (YYYY-MM-DD).
  // Prevents picking any date before today in the browser's native calendar.
  const todayIso = (() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  })();

  // ⭐ SAFE LOCAL DATETIME BUILDER (NO UTC SHIFT)
  const buildLocalDateTime = (dateStr: string, timeStr: string) => {
    const [y, m, d] = dateStr.split("-").map(Number);
    const [hh, mm] = timeStr.split(":").map(Number);
    return new Date(y, m - 1, d, hh, mm, 0, 0);
  };

  // ⭐ SLOT COUNT CALCULATION
  const getExpectedSlotCount = () => {
    const { startDate, endDate, startTime, endTime } = formState;

    if (!startDate || !endDate || !startTime || !endTime) return null;

    const startDateValue = buildLocalDateTime(startDate, startTime);
    const endDateValue = buildLocalDateTime(endDate, endTime);

    if (Number.isNaN(startDateValue.getTime()) || Number.isNaN(endDateValue.getTime())) {
      return null;
    }

    const daySpan = differenceInCalendarDays(endDateValue, startDateValue);
    if (daySpan < 0) return null;

    const [startHour, startMinute] = startTime.split(":").map(Number);
    const [endHour, endMinute] = endTime.split(":").map(Number);

    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;
    const minutesPerDay = endMinutes - startMinutes;

    if (minutesPerDay <= 0) return null;

    const slotsPerDay = Math.floor(minutesPerDay / 30);
    if (slotsPerDay <= 0) return null;

    const totalDays = daySpan + 1;
    return slotsPerDay * totalDays;
  };

  const _expectedSlotCount = getExpectedSlotCount();

  // Helpers for the live preview panel
  const _formatPreviewDate = (iso: string) => {
    if (!iso) return "—";
    const [y, m, d] = iso.split("-").map(Number);
    if (!y || !m || !d) return "—";
    return format(new Date(y, m - 1, d), "EEE, MMM d");
  };

  const _formatPreviewTime = (time: string) => {
    if (!time) return "—";
    const [hh, mm] = time.split(":").map(Number);
    if (Number.isNaN(hh) || Number.isNaN(mm)) return "—";
    return format(new Date(2000, 0, 1, hh, mm), "h:mm a");
  };

  const _daySpanForPreview = (() => {
    const { startDate, endDate } = formState;
    if (!startDate || !endDate) return null;
    const [y1, m1, d1] = startDate.split("-").map(Number);
    const [y2, m2, d2] = endDate.split("-").map(Number);
    if (!y1 || !y2) return null;
    const span =
      differenceInCalendarDays(
        new Date(y2, m2 - 1, d2),
        new Date(y1, m1 - 1, d1),
      ) + 1;
    return span > 0 ? span : null;
  })();

  // ---------------- MUTATION ----------------

  const createMutation = useMutation({
    mutationFn: () => createScheduleSlot(formState),

    onSuccess: async (createdSlots) => {
      toast.success("Schedule slots created successfully.", {
        description: `${createdSlots.length} slot${
          createdSlots.length === 1 ? "" : "s"
        } added to your schedule.`,
      });

      // ✅ IMPORTANT: wait for cache invalidation
      await queryClient.invalidateQueries({
        queryKey: ["expert-my-schedules"],
      });

      // ✅ navigate AFTER cache is refreshed
      router.push("/expert/dashboard/my-schedules");
    },

    onError: (error: any) => {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Unable to create this schedule right now.";

      toast.error(message);
    },
  });

  // ---------------- SUBMIT ----------------

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const { startDate, endDate, startTime, endTime } = formState;

    if (!startDate || !endDate || !startTime || !endTime) {
      toast.error("Please fill in the date and time for your schedule.");
      return;
    }

    const start = buildLocalDateTime(startDate, startTime);
    const end = buildLocalDateTime(endDate, endTime);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) {
      toast.error("Please choose a valid time range where the end is after the start.");
      return;
    }

    // Block past-dated slots. Compare against the start of today so slots
    // beginning later today are still allowed.
    const now = new Date();
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );
    if (start < startOfToday) {
      toast.error("You can't create slots for a date that has already passed.");
      return;
    }
    if (start <= now) {
      toast.error("The slot start time must be in the future.");
      return;
    }

    createMutation.mutate();
  };

  // ---------------- UI ----------------

  return (
    <div className="mx-auto w-full max-w-3xl">
      {/* Form card */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200/70 bg-white/70 shadow-sm backdrop-blur dark:border-white/10 dark:bg-slate-900/60">
        {/* gradient accent bar */}
        <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-blue-600 via-cyan-500 to-teal-400" />
        {/* dark-mode glow */}
        <div className="pointer-events-none absolute -right-24 -top-24 hidden size-72 rounded-full bg-cyan-500/15 blur-3xl dark:block" />

        <div className="relative p-6 md:p-8">
          <div className="mb-6 flex items-start gap-4">
            <div className="inline-flex size-12 items-center justify-center rounded-full bg-linear-to-br from-blue-600 to-cyan-500 text-white shadow-md shadow-cyan-500/25">
              <CalendarPlus className="size-6" />
            </div>
            <div className="space-y-1">
              <h2 className="flex items-center gap-2 text-xl font-bold tracking-tight">
                Create availability slots
                <span className="hidden rounded-full border border-blue-200/60 bg-blue-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-blue-700 sm:inline-flex dark:border-blue-500/30 dark:bg-blue-500/15 dark:text-blue-200">
                  Auto 30-min split
                </span>
              </h2>
              <p className="text-sm text-muted-foreground">
                Define a date and time range — we&apos;ll generate 30-minute
                bookable slots for your clients automatically.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Date range */}
            <div className="rounded-2xl border border-slate-200/70 bg-white/60 p-4 dark:border-white/10 dark:bg-white/5">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                <CalendarRange className="size-4 text-blue-600 dark:text-cyan-300" />
                Date range
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="startDate" className="text-xs uppercase tracking-wider text-muted-foreground">
                    Start date
                  </Label>
                  <Input
                    id="startDate"
                    type="date"
                    min={todayIso}
                    value={formState.startDate}
                    onChange={(e) =>
                      setFormState((p) => ({ ...p, startDate: e.target.value }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endDate" className="text-xs uppercase tracking-wider text-muted-foreground">
                    End date
                  </Label>
                  <Input
                    id="endDate"
                    type="date"
                    min={formState.startDate || todayIso}
                    value={formState.endDate}
                    onChange={(e) =>
                      setFormState((p) => ({ ...p, endDate: e.target.value }))
                    }
                  />
                </div>
              </div>
            </div>

            {/* Time window */}
            <div className="rounded-2xl border border-slate-200/70 bg-white/60 p-4 dark:border-white/10 dark:bg-white/5">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                <Clock className="size-4 text-cyan-600 dark:text-cyan-300" />
                Daily time window
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="startTime" className="text-xs uppercase tracking-wider text-muted-foreground">
                    Start time
                  </Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={formState.startTime}
                    onChange={(e) =>
                      setFormState((p) => ({ ...p, startTime: e.target.value }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endTime" className="text-xs uppercase tracking-wider text-muted-foreground">
                    End time
                  </Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={formState.endTime}
                    onChange={(e) =>
                      setFormState((p) => ({ ...p, endTime: e.target.value }))
                    }
                  />
                </div>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                This window applies to every day in your selected date range.
              </p>
            </div>

            <div className="flex flex-wrap gap-3 pt-1">
              <Button
                type="submit"
                disabled={createMutation.isPending}
                className="bg-linear-to-r from-blue-600 to-cyan-500 text-white shadow-md shadow-cyan-500/25 hover:from-blue-700 hover:to-cyan-600"
              >
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Saving schedule...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 size-4" />
                    Create schedule
                  </>
                )}
              </Button>

              <Button asChild type="button" variant="outline">
                <a href="/expert/dashboard/my-schedules">View my schedules</a>
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}