"use client";

import { formatDistanceToNow } from "date-fns";
import { MessageSquareText, Paperclip } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/src/lib/utils";
import { getOtherParticipants, getParticipantDisplayName } from "@/src/services/chatRoom.service";
import type { ChatRole, ChatRoom } from "@/src/types/chat.types";

interface ChatRoomListItemProps {
  room: ChatRoom;
  currentUserId?: string;
  currentUserRole?: ChatRole | null;
  isActive?: boolean;
  onSelect?: (roomId: string) => void;
}

export default function ChatRoomListItem({
  room,
  currentUserId,
  currentUserRole,
  isActive = false,
  onSelect,
}: ChatRoomListItemProps) {
  const otherParticipants = getOtherParticipants({
    participants: room.participants,
    currentUserId,
    currentUserRole,
  });

  const primaryParticipant = otherParticipants[0] ?? room.participants[0];
  const otherParticipantsLabel = otherParticipants
    .map((participant) => getParticipantDisplayName(participant))
    .join(", ");
  const isDirectConversation = room.participants.length <= 2 && otherParticipants.length === 1;
  const roomTitle = isDirectConversation
    ? otherParticipantsLabel || room.name || "Conversation"
    : room.name || otherParticipantsLabel || "Conversation";

  const previewText = room.lastMessage?.attachment
    ? room.lastMessage.attachment.fileName
    : room.lastMessage?.text || "No messages yet";

  const previewIcon = room.lastMessage?.attachment ? Paperclip : MessageSquareText;
  const PreviewIcon = previewIcon;

  return (
    <button
      type="button"
      onClick={() => onSelect?.(room.id)}
      className={cn(
        "flex w-full items-start gap-3 rounded-2xl border px-3 py-3 text-left transition-all duration-200",
        isActive
          ? "border-blue-300 bg-blue-50 shadow-sm dark:border-cyan-400/40 dark:bg-cyan-500/10"
          : "border-transparent bg-transparent hover:border-blue-200 hover:bg-blue-50/60 dark:hover:border-white/10 dark:hover:bg-white/5",
      )}
    >
      <Avatar className="size-10 border bg-background">
        {primaryParticipant?.avatarUrl || primaryParticipant?.profilePhoto ? (
          <AvatarImage
            src={primaryParticipant.avatarUrl || primaryParticipant.profilePhoto || undefined}
            alt={getParticipantDisplayName(primaryParticipant)}
          />
        ) : null}
        <AvatarFallback>
          {getParticipantDisplayName(primaryParticipant).slice(0, 1).toUpperCase() || "U"}
        </AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate font-medium text-foreground">{roomTitle}</p>
          <span className="shrink-0 text-[11px] text-muted-foreground">
            {room.updatedAt
              ? formatDistanceToNow(new Date(room.updatedAt), { addSuffix: true })
              : "just now"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <PreviewIcon className="size-3.5 text-muted-foreground" />
          <p className="truncate text-sm text-muted-foreground">{previewText}</p>
        </div>
      </div>

      {room.unreadCount ? (
        <Badge className="bg-blue-600 hover:bg-blue-600">{room.unreadCount}</Badge>
      ) : null}
    </button>
  );
}
