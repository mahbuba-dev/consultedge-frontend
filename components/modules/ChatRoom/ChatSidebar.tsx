"use client";

import { RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import type { ChatRole, ChatRoom } from "@/src/types/chat.types";
import ChatRoomListItem from "./ChatRoomListItem";

interface ChatSidebarProps {
  rooms: ChatRoom[];
  currentUserId?: string;
  selectedRoomId?: string;
  isLoading?: boolean;
  isRefreshing?: boolean;
  title?: string;
  description?: string;
  role?: ChatRole | null;
  onSelectRoom: (roomId: string) => void;
  onRefresh?: () => void;
}

export default function ChatSidebar({
  rooms,
  currentUserId,
  selectedRoomId,
  isLoading = false,
  isRefreshing = false,
  title = "Messages",
  description = "Stay close to your active conversations.",
  role,
  onSelectRoom,
  onRefresh,
}: ChatSidebarProps) {
  const emptyMessage =
    role === "EXPERT"
      ? "No client conversations yet. New consultation threads will appear here when clients message you."
      : role === "ADMIN"
        ? "No conversation threads yet. Active message rooms will appear here automatically."
        : "No conversations yet. Open a room from an expert profile to get started.";

  return (
    <aside className="flex min-h-[70vh] flex-col rounded-2xl border bg-background shadow-sm">
      <div className="flex items-start justify-between gap-3 border-b p-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>

        <Button
          type="button"
          size="icon-sm"
          variant="outline"
          onClick={onRefresh}
          disabled={isRefreshing}
        >
          <RefreshCw className={`size-4 ${isRefreshing ? "animate-spin" : ""}`} />
          <span className="sr-only">Refresh conversations</span>
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-2 p-3">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="rounded-2xl border p-3">
                <div className="flex items-start gap-3">
                  <Skeleton className="size-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-3 w-full" />
                  </div>
                </div>
              </div>
            ))
          ) : rooms.length === 0 ? (
            <div className="rounded-2xl border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
              {emptyMessage}
            </div>
          ) : (
            rooms.map((room) => (
              <ChatRoomListItem
                key={room.id}
                room={room}
                currentUserId={currentUserId}
                isActive={selectedRoomId === room.id}
                onSelect={onSelectRoom}
              />
            ))
          )}
        </div>
      </ScrollArea>
    </aside>
  );
}
