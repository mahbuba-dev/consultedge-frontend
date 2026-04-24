"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { differenceInCalendarDays } from "date-fns";
import { CalendarPlus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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

  const expectedSlotCount = getExpectedSlotCount();

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
    <Card className="max-w-3xl border-border/70 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarPlus className="size-5 text-blue-600" />
          Create a new availability slot
        </CardTitle>
        <CardDescription>
          Add date and time range. The backend creates 30-minute slots and links them to your expert schedule.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start date</Label>
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
              <Label htmlFor="endDate">End date</Label>
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

            <div className="space-y-2">
              <Label htmlFor="startTime">Start time</Label>
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
              <Label htmlFor="endTime">End time</Label>
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

          <div className="flex flex-wrap gap-3">
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? "Saving schedule..." : "Create schedule"}
            </Button>

            <Button asChild type="button" variant="outline">
              <a href="/expert/dashboard/my-schedules">View my schedules</a>
            </Button>
          </div>

          {expectedSlotCount ? (
            <p className="text-sm text-muted-foreground">
              This will create approximately {expectedSlotCount} slot
              {expectedSlotCount === 1 ? "" : "s"} (30 minutes each).
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              Select a valid date range and time window to preview slot count.
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
}