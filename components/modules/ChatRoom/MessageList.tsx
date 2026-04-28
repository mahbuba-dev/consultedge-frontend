"use client";

import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import type { ChatMessage } from "@/src/types/chat.types";
import MessageBubble from "./MessageBubble";
import { deleteRoomMessage } from "@/src/services/chatRoom.service";
import { toast } from "sonner";

interface MessageListProps {
  messages: ChatMessage[];
  currentUserId?: string;
  isLoading?: boolean;
  roomId?: string;
  onToggleReaction?: (messageId: string, emoji: string) => Promise<unknown> | void;
}

export default function MessageList({
  messages,
  currentUserId,
  isLoading = false,
  roomId,
  onToggleReaction,
}: MessageListProps) {
  const endRef = useRef<HTMLDivElement | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length]);

  const handleDelete = async (id: string) => {
    if (!roomId) return;

    const queryKey = ["chat-room-messages", roomId];
    const previous = queryClient.getQueryData<ChatMessage[]>(queryKey) ?? [];

    // Optimistically remove from the query cache so it stays removed even
    // after subsequent refetches or incoming messages merge into the cache.
    queryClient.setQueryData<ChatMessage[]>(queryKey, (current = []) =>
      current.filter((msg) => msg.id !== id),
    );

    try {
      await deleteRoomMessage(roomId, id);
      toast.success("Message deleted");
    } catch (err: any) {
      // Restore the cache on failure.
      queryClient.setQueryData<ChatMessage[]>(queryKey, previous);
      toast.error(err?.message || "Failed to delete message");
    }
  };

  return (
    <ScrollArea className="h-full w-full [&>div>div]:block! [&>div>div]:w-full! [&>div>div]:min-w-0!">
      <div className="w-full min-w-0 space-y-4 px-3 py-4 sm:px-4 md:px-6">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className={`flex ${index % 2 === 0 ? "justify-start" : "justify-end"}`}
            >
              <Skeleton className="h-20 w-[75%] rounded-2xl" />
            </div>
          ))
        ) : messages.length === 0 ? (
          <div className="rounded-2xl border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
            No messages yet. Start the conversation below.
          </div>
        ) : (
          messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              currentUserId={currentUserId}
              onDelete={handleDelete}
              onToggleReaction={onToggleReaction}
            />
          ))
        )}
        <div ref={endRef} />
      </div>
    </ScrollArea>
  );
}
