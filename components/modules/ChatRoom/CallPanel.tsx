"use client";
import { PhoneOff, Video } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface CallPanelProps {
  open: boolean;
  callState: "idle" | "ringing" | "incoming" | "active";
  isCaller: boolean;
  onAcceptCall?: () => void;
  onRejectCall?: () => void;
  localVideoRef: React.RefObject<HTMLVideoElement | null>;
  remoteVideoRef: React.RefObject<HTMLVideoElement | null>;
  remoteName?: string;
  onEndCall: () => void;
}

export default function CallPanel({
  open,
  callState,
  localVideoRef,
  remoteVideoRef,
  remoteName,
  onEndCall,
  isCaller,
  onAcceptCall,
  onRejectCall,
}: CallPanelProps) {
  const description =
    callState === "active"
      ? `You’re live with ${remoteName || "your contact"}.`
      : callState === "ringing"
        ? `Calling ${remoteName || "your contact"}...`
        : callState === "incoming"
          ? `${remoteName || "Your contact"} is calling you...`
          : "Preparing your video session...";

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onEndCall()}>
      <DialogContent className="max-w-4xl p-0 sm:max-w-4xl" showCloseButton={false}>
        <div className="overflow-hidden rounded-xl">
          <DialogHeader className="border-b bg-background px-6 py-4">
            <DialogTitle className="flex items-center gap-2">
              <Video className="size-4 text-blue-600" />
              Secure consultation call
            </DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 bg-slate-950 p-4 md:grid-cols-2">
            {/* Remote panel */}
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900">
              <div className="flex items-center justify-between border-b border-white/10 px-4 py-2 text-sm text-white/80">
                <span>{remoteName || "Remote participant"}</span>
                <span className="capitalize">{callState}</span>
              </div>

              <div className="relative aspect-video bg-slate-950">
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  className="h-full w-full object-cover"
                />
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm text-white/60">
                  Waiting for remote video...
                </div>
              </div>

              {/* Incoming call UI (receiver side) */}
              {callState === "incoming" && !isCaller && (
                <div className="flex justify-center gap-4 px-4 py-3">
                  <Button
                    onClick={() => onAcceptCall?.()}
                    className="bg-green-600 text-white"
                  >
                    Accept
                  </Button>
                  <Button
                    onClick={() => onRejectCall?.()}
                    variant="destructive"
                  >
                    Reject
                  </Button>
                </div>
              )}

              {/* Caller ringing UI */}
              {isCaller && callState === "ringing" && (
                <div className="text-center text-white/70 py-2">
                  Ringing...
                </div>
              )}
            </div>

            {/* Local panel */}
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900">
              <div className="border-b border-white/10 px-4 py-2 text-sm text-white/80">
                You
              </div>
              <div className="relative aspect-video bg-slate-950">
                <video
                  ref={localVideoRef}
                  autoPlay
                  muted
                  playsInline
                  className="h-full w-full object-cover"
                />
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm text-white/60">
                  Camera preview
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end border-t bg-background px-6 py-4">
            <Button type="button" variant="destructive" onClick={onEndCall}>
              <PhoneOff className="mr-2 size-4" />
              End call
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
