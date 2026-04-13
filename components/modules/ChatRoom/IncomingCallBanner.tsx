import { PhoneIncoming, PhoneOff, Video } from "lucide-react";
import { Button } from "@/components/ui/button";

interface IncomingCallBannerProps {
  isVisible?: boolean;
  callerName?: string;
  onAccept: () => void;
  onDecline: () => void;
}

export default function IncomingCallBanner({
  isVisible = false,
  callerName,
  onAccept,
  onDecline,
}: IncomingCallBannerProps) {
  if (!isVisible) return null;

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 md:flex-row md:items-center md:justify-between">
      {/* Left side: icon + text */}
      <div className="flex items-start gap-3">
        <div className="flex size-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
          <PhoneIncoming className="size-5" />
        </div>

        <div>
          <p className="font-semibold text-foreground">Incoming video call</p>
          <p className="text-sm text-muted-foreground">
            {callerName || "Someone"} is inviting you to join a secure consultation call.
          </p>
        </div>
      </div>

      {/* Right side: buttons */}
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          onClick={onAccept}
          className="bg-emerald-600 text-white hover:bg-emerald-700"
        >
          <Video className="mr-2 size-4" />
          Accept
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={onDecline}
        >
          <PhoneOff className="mr-2 size-4" />
          Decline
        </Button>
      </div>
    </div>
  );
}
