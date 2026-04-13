"use client";

import { useEffect, useRef, useState } from "react";

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
}

export default function MessageList({
  messages,
  currentUserId,
  isLoading = false,
  roomId,
}: MessageListProps) {
  const endRef = useRef<HTMLDivElement | null>(null);
  const [localMessages, setLocalMessages] = useState(messages);

  useEffect(() => {
    setLocalMessages(messages);
  }, [messages]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [localMessages.length]);

  const handleDelete = async (id: string) => {
    if (!roomId) return;
    try {
      await deleteRoomMessage(roomId, id);
      setLocalMessages((msgs) => msgs.filter((msg) => msg.id !== id));
      toast.success("Message deleted");
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete message");
    }
  };

  return (
    <ScrollArea className="h-full">
      <div className="space-y-4 px-4 py-4 md:px-6">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className={`flex ${index % 2 === 0 ? "justify-start" : "justify-end"}`}
            >
              <Skeleton className="h-20 w-[75%] rounded-2xl" />
            </div>
          ))
        ) : localMessages.length === 0 ? (
          <div className="rounded-2xl border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
            No messages yet. Start the conversation below.
          </div>
        ) : (
          localMessages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              currentUserId={currentUserId}
              onDelete={handleDelete}
            />
          ))
        )}
        <div ref={endRef} />
      </div>
    </ScrollArea>
  );
}
