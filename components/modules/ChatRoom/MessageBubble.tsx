"use client";

import { useState } from "react";
import { format } from "date-fns";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/src/lib/utils";
import { getParticipantDisplayName, isMessageFromCurrentUser } from "@/src/services/chatRoom.service";
import type { ChatMessage } from "@/src/types/chat.types";
import MessageAttachmentCard from "./MessageAttachmentCard";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";

interface MessageBubbleProps {
  message: ChatMessage;
  currentUserId?: string;
  onDelete?: (id: string) => void;
}

export default function MessageBubble({
  message,
  currentUserId,
  onDelete,
}: MessageBubbleProps) {
  const isOwnMessage = isMessageFromCurrentUser(message, currentUserId);
  const [popoverOpen, setPopoverOpen] = useState(false);

  if (message.type === "SYSTEM") {
    return (
      <div className="flex justify-center py-2">
        <Badge variant="secondary">{message.text || "System update"}</Badge>
      </div>
    );
  }

  return (
    <div className={cn("flex", isOwnMessage ? "justify-end" : "justify-start")}>
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger asChild>
          <div
            className={cn(
              "max-w-[85%] space-y-2 rounded-2xl border px-4 py-3 shadow-sm md:max-w-[70%] relative cursor-pointer",
              isOwnMessage
                ? "border-blue-500 bg-blue-600 text-white"
                : "border-border/60 bg-background",
            )}
            onClick={() => setPopoverOpen(true)}
          >
            {!isOwnMessage ? (
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
                {getParticipantDisplayName(message.sender)}
              </p>
            ) : null}

            {message.text ? (
              <p
                className={cn(
                  "text-sm leading-6",
                  isOwnMessage ? "text-white" : "text-foreground",
                )}
              >
                {message.text}
              </p>
            ) : null}

            {message.attachment ? (
              <MessageAttachmentCard attachment={message.attachment} />
            ) : null}

            <div
              className={cn(
                "flex items-center justify-end gap-2 text-[11px]",
                isOwnMessage ? "text-white/80" : "text-muted-foreground",
              )}
            >
              <span>{format(new Date(message.createdAt), "p")}</span>
              {message.pending ? <span>Sending…</span> : null}
              {message.failed ? <span>Failed</span> : null}
            </div>
          </div>
        </PopoverTrigger>

        <PopoverContent
          align="center"
          sideOffset={8}
          className="w-auto p-2 flex flex-col items-center"
        >
          <div className="flex gap-2 mb-2">
            {["👍", "😂", "😮", "😢", "❤️"].map((emoji) => (
              <button
                key={emoji}
                className="text-xl hover:scale-125 transition-transform"
                onClick={() => {
                  setPopoverOpen(false);
                  // TODO: handle emoji reaction
                }}
              >
                {emoji}
              </button>
            ))}
          </div>

          {isOwnMessage && (
            <button
              className="w-full bg-red-500 text-white rounded px-3 py-1 text-xs hover:bg-red-600"
              onClick={(e) => {
                e.stopPropagation();
                setPopoverOpen(false);
                if (typeof onDelete === "function") onDelete(message.id);
              }}
            >
              Delete
            </button>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}
