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

  const getExpectedSlotCount = () => {
    const { startDate, endDate, startTime, endTime } = formState;

    if (!startDate || !endDate || !startTime || !endTime) {
      return null;
    }

    const startDateValue = new Date(startDate);
    const endDateValue = new Date(endDate);

    if (Number.isNaN(startDateValue.getTime()) || Number.isNaN(endDateValue.getTime())) {
      return null;
    }

    const daySpan = differenceInCalendarDays(endDateValue, startDateValue);
    if (daySpan < 0) {
      return null;
    }

    const [startHour, startMinute] = startTime.split(":").map(Number);
    const [endHour, endMinute] = endTime.split(":").map(Number);

    if (
      Number.isNaN(startHour) ||
      Number.isNaN(startMinute) ||
      Number.isNaN(endHour) ||
      Number.isNaN(endMinute)
    ) {
      return null;
    }

    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;
    const minutesPerDay = endMinutes - startMinutes;

    if (minutesPerDay <= 0) {
      return null;
    }

    const slotsPerDay = Math.floor(minutesPerDay / 30);
    if (slotsPerDay <= 0) {
      return null;
    }

    const totalDays = daySpan + 1;
    return slotsPerDay * totalDays;
  };

  const expectedSlotCount = getExpectedSlotCount();

  const createMutation = useMutation({
    mutationFn: () => createScheduleSlot(formState),
    onSuccess: (createdSlots) => {
      toast.success("Schedule slots created successfully.", {
        description: `${createdSlots.length} slot${createdSlots.length === 1 ? "" : "s"} added to your schedule.`,
      });
      void queryClient.invalidateQueries({ queryKey: ["expert-my-schedules"] });
      router.push("/expert/dashboard/my-schedules");
      router.refresh();
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Unable to create this schedule right now.";

      toast.error(message);
    },
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (
      !formState.startDate ||
      !formState.endDate ||
      !formState.startTime ||
      !formState.endTime
    ) {
      toast.error("Please fill in the date and time for your schedule.");
      return;
    }

    const start = new Date(`${formState.startDate}T${formState.startTime}`);
    const end = new Date(`${formState.endDate}T${formState.endTime}`);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) {
      toast.error("Please choose a valid time range where the end is after the start.");
      return;
    }

    createMutation.mutate();
  };

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
                value={formState.startDate}
                onChange={(event) =>
                  setFormState((current) => ({ ...current, startDate: event.target.value }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">End date</Label>
              <Input
                id="endDate"
                type="date"
                value={formState.endDate}
                onChange={(event) =>
                  setFormState((current) => ({ ...current, endDate: event.target.value }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="startTime">Start time</Label>
              <Input
                id="startTime"
                type="time"
                value={formState.startTime}
                onChange={(event) =>
                  setFormState((current) => ({ ...current, startTime: event.target.value }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endTime">End time</Label>
              <Input
                id="endTime"
                type="time"
                value={formState.endTime}
                onChange={(event) =>
                  setFormState((current) => ({ ...current, endTime: event.target.value }))
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
