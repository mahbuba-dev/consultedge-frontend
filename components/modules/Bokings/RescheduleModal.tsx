"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function RescheduleModal({ open, onClose, booking, onConfirm }:{ open: boolean; onClose: () => void; booking: any; onConfirm: (newSlot: string) => void }) {
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Reschedule Consultation</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Choose a new available time slot for your consultation.
          </p>

          {/* TODO: Replace with real available slots */}
          <div className="grid gap-2">
            {["slot1", "slot2", "slot3"].map((slot) => (
              <button
                key={slot}
                onClick={() => setSelectedSlot(slot)}
                className={`p-3 border rounded ${
                  selectedSlot === slot ? "border-blue-600 bg-blue-50" : ""
                }`}
              >
                {slot}
              </button>
            ))}
          </div>

          <Button
            disabled={!selectedSlot}
            onClick={() => onConfirm(selectedSlot!)}
            className="w-full"
          >
            Confirm Reschedule
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
