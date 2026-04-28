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
  onToggleReaction?: (messageId: string, emoji: string) => Promise<unknown> | void;
}

export default function MessageBubble({
  message,
  currentUserId,
  onDelete,
  onToggleReaction,
}: MessageBubbleProps) {
  const isOwnMessage = isMessageFromCurrentUser(message, currentUserId);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const canReactToMessage = !isOwnMessage;
  const reactionsDisabled =
    !canReactToMessage ||
    !onToggleReaction ||
    message.pending ||
    message.failed ||
    !message.id ||
    message.id.startsWith("temp-");

  const hasCurrentUserReaction = (reaction: NonNullable<ChatMessage["reactions"]>[number]) => {
    if (reaction.reactedByCurrentUser) {
      return true;
    }

    if (!currentUserId) {
      return false;
    }

    return reaction.reactorIds?.some((reactorId) => reactorId === currentUserId) ?? false;
  };

  if (message.type === "SYSTEM") {
    return (
      <div className="flex justify-center py-2">
        <Badge variant="secondary">{message.text || "System update"}</Badge>
      </div>
    );
  }

  return (
    <div className={cn("flex w-full min-w-0", isOwnMessage ? "justify-end" : "justify-start")}>
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <div className="flex min-w-0 max-w-[78%] flex-col gap-2 sm:max-w-[85%] md:max-w-[70%]">
          <PopoverTrigger asChild>
            <div
              className={cn(
                "space-y-2 rounded-2xl border px-4 py-3 shadow-sm relative cursor-pointer min-w-0 max-w-full",
                isOwnMessage
                  ? "border-blue-500 bg-linear-to-br from-blue-600 to-cyan-500 text-white"
                  : "border-border/60 bg-background dark:border-white/10 dark:bg-slate-900/70",
              )}
              onClick={() => setPopoverOpen(true)}
            >
              {!isOwnMessage ? (
                <p className="text-xs font-semibold uppercase tracking-wide text-blue-700 dark:text-cyan-300">
                  {getParticipantDisplayName(message.sender)}
                </p>
              ) : null}

              {message.text ? (
                <p
                  className={cn(
                    "text-sm leading-6 wrap-break-word",
                    isOwnMessage ? "text-white" : "text-foreground",
                  )}
                  style={{ overflowWrap: "anywhere" }}
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

          {message.reactions?.length ? (
            <div
              className={cn(
                "flex flex-wrap gap-2",
                isOwnMessage ? "justify-end" : "justify-start",
              )}
            >
              {message.reactions.map((reaction) => (
                <button
                  key={`${message.id}-${reaction.emoji}`}
                  type="button"
                  disabled={reactionsDisabled}
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs transition-colors disabled:cursor-not-allowed disabled:opacity-60",
                    hasCurrentUserReaction(reaction)
                      ? "border-blue-300 bg-blue-50 text-blue-700 dark:border-cyan-400/40 dark:bg-cyan-500/15 dark:text-cyan-200"
                      : "border-border/60 bg-background text-foreground hover:border-blue-200 hover:bg-blue-50/60 dark:border-white/10 dark:bg-white/5 dark:hover:border-cyan-400/30 dark:hover:bg-white/10",
                  )}
                  onClick={(event) => {
                    event.stopPropagation();
                    if (reactionsDisabled) {
                      return;
                    }
                    void onToggleReaction?.(message.id, reaction.emoji);
                  }}
                >
                  <span>{reaction.emoji}</span>
                  <span>{reaction.count}</span>
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <PopoverContent
          align="center"
          sideOffset={8}
          className="w-auto p-2 flex flex-col items-center"
        >
          {canReactToMessage ? (
            <div className="mb-2 flex gap-2">
              {["👍", "😂", "😮", "😢", "❤️"].map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  disabled={reactionsDisabled}
                  className="text-xl transition-transform hover:scale-125 disabled:cursor-not-allowed disabled:opacity-50"
                  onClick={(event) => {
                    event.stopPropagation();
                    if (reactionsDisabled) {
                      return;
                    }
                    setPopoverOpen(false);
                    void onToggleReaction?.(message.id, emoji);
                  }}
                >
                  {emoji}
                </button>
              ))}
              <span className="sr-only">Add reaction</span>
            </div>
          ) : null}

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
