"use client";

import { formatDistanceToNow } from "date-fns";
import { BriefcaseBusiness, MessageSquareText, Paperclip, ShieldCheck, UserCircle2 } from "lucide-react";

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
  const lastMessageSenderId = room.lastMessage?.senderId;
  const lastMessageSenderRole = room.lastMessage?.senderRole;
  const isIncomingLastMessage = Boolean(lastMessageSenderId && currentUserId && String(lastMessageSenderId) !== String(currentUserId));
  const isClientIncomingForExpert =
    currentUserRole === "EXPERT" &&
    (
      lastMessageSenderRole === "CLIENT" ||
      (room.unreadCount ?? 0) > 0 ||
      isIncomingLastMessage
    );

  const roleTheme =
    currentUserRole === "EXPERT"
      ? {
          label: "Client",
          panelActive: "border-cyan-400/55 bg-cyan-500/12 shadow-[0_10px_24px_-14px_rgba(6,182,212,0.55)]",
          panelIdle: "border-transparent bg-transparent hover:border-cyan-300/40 hover:bg-cyan-500/8",
          unread: "bg-cyan-500 text-white hover:bg-cyan-500",
          badge: "border-cyan-300/50 bg-cyan-100 text-cyan-700 dark:border-cyan-500/25 dark:bg-cyan-500/10 dark:text-cyan-200",
          icon: BriefcaseBusiness,
          metaPrefix: "Client thread",
        }
      : currentUserRole === "ADMIN"
        ? {
            label: "Room",
            panelActive: "border-amber-400/55 bg-amber-500/10 shadow-[0_10px_24px_-14px_rgba(245,158,11,0.55)]",
            panelIdle: "border-transparent bg-transparent hover:border-amber-300/40 hover:bg-amber-500/8",
            unread: "bg-amber-500 text-white hover:bg-amber-500",
            badge: "border-amber-300/50 bg-amber-100 text-amber-700 dark:border-amber-500/25 dark:bg-amber-500/10 dark:text-amber-200",
            icon: ShieldCheck,
            metaPrefix: "Monitored room",
          }
        : {
            label: "Expert",
            panelActive: "border-blue-400/55 bg-blue-500/10 shadow-[0_10px_24px_-14px_rgba(37,99,235,0.55)]",
            panelIdle: "border-transparent bg-transparent hover:border-blue-300/40 hover:bg-blue-500/8",
            unread: "bg-blue-600 text-white hover:bg-blue-600",
            badge: "border-blue-300/50 bg-blue-100 text-blue-700 dark:border-blue-500/25 dark:bg-blue-500/10 dark:text-blue-200",
            icon: UserCircle2,
            metaPrefix: "Expert consultation",
          };

  const RoleIcon = roleTheme.icon;
  const participantRoleLabel = primaryParticipant?.role ? primaryParticipant.role.toLowerCase() : roleTheme.label.toLowerCase();
  const participantMeta = primaryParticipant?.title || roleTheme.metaPrefix;
  const previewPrefix =
    currentUserRole === "EXPERT"
      ? isClientIncomingForExpert
        ? "Client"
        : "You"
      : currentUserRole === "CLIENT"
        ? isIncomingLastMessage
          ? "Expert"
          : "You"
        : "Thread";

  return (
    <button
      type="button"
      onClick={() => onSelect?.(room.id)}
      className={cn(
        "flex w-full items-start gap-3 rounded-2xl border px-3 py-3 text-left transition-all duration-200",
        isActive
          ? roleTheme.panelActive
          : roleTheme.panelIdle,
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
          <div className="flex min-w-0 items-center gap-2">
            <p className="truncate font-medium text-foreground">{roomTitle}</p>
            <Badge variant="outline" className={cn("hidden h-5 items-center gap-1 rounded-full px-1.5 text-[10px] sm:inline-flex", roleTheme.badge)}>
              <RoleIcon className="size-3" />
              {participantRoleLabel}
            </Badge>
          </div>
          <span className="shrink-0 text-[11px] text-muted-foreground">
            {room.updatedAt
              ? formatDistanceToNow(new Date(room.updatedAt), { addSuffix: true })
              : "just now"}
          </span>
        </div>

        <p className="truncate text-[11px] text-muted-foreground">{participantMeta}</p>

        <div className="flex items-center gap-2">
          <PreviewIcon className="size-3.5 text-muted-foreground" />
          <p className="truncate text-sm text-muted-foreground">
            <span className={cn("mr-1 text-[11px] font-semibold", isClientIncomingForExpert && "text-cyan-600 dark:text-cyan-300")}>
              {previewPrefix}:
            </span>
            {previewText}
          </p>
        </div>

        {isClientIncomingForExpert ? (
          <div className="pt-0.5">
            <Badge variant="outline" className="h-5 border-cyan-300/50 bg-cyan-100 px-1.5 text-[10px] font-medium text-cyan-700 dark:border-cyan-500/25 dark:bg-cyan-500/10 dark:text-cyan-200">
              New client message
            </Badge>
          </div>
        ) : null}
      </div>

      {room.unreadCount ? (
        <Badge className={roleTheme.unread}>{room.unreadCount}</Badge>
      ) : null}
    </button>
  );
}
