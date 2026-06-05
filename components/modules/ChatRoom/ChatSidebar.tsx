"use client";

import { BriefcaseBusiness, RefreshCw, ShieldCheck, UserCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import type { ChatRole, ChatRoom } from "@/src/types/chat.types";
import ChatRoomListItem from "./ChatRoomListItem";

interface ChatSidebarProps {
  rooms: ChatRoom[];
  currentUserId?: string;
  currentUserRole?: ChatRole | null;
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
  currentUserRole,
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

  const roleMeta =
    role === "EXPERT"
      ? {
          label: "Expert inbox",
          icon: BriefcaseBusiness,
          panelClass:
            "border-cyan-200/70 bg-cyan-50/40 dark:border-cyan-500/20 dark:bg-cyan-500/6",
          badgeClass:
            "border-cyan-200 bg-cyan-100 text-cyan-700 dark:border-cyan-500/25 dark:bg-cyan-500/10 dark:text-cyan-200",
        }
      : role === "ADMIN"
        ? {
            label: "Admin desk",
            icon: ShieldCheck,
            panelClass:
              "border-amber-200/70 bg-amber-50/35 dark:border-amber-500/20 dark:bg-amber-500/6",
            badgeClass:
              "border-amber-200 bg-amber-100 text-amber-700 dark:border-amber-500/25 dark:bg-amber-500/10 dark:text-amber-200",
          }
        : {
            label: "Client chat",
            icon: UserCircle2,
            panelClass:
              "border-slate-200/70 bg-white/70 dark:border-white/10 dark:bg-slate-900/60",
            badgeClass:
              "border-blue-200 bg-blue-100 text-blue-700 dark:border-blue-500/25 dark:bg-blue-500/10 dark:text-blue-200",
          };

  const RoleIcon = roleMeta.icon;

  return (
    <aside className={`flex min-h-[70vh] flex-col rounded-2xl border shadow-sm backdrop-blur ${roleMeta.panelClass}`}>
      <div className="flex items-start justify-between gap-3 border-b border-slate-200/70 p-4 dark:border-white/10">
        <div>
          <div className={`mb-1.5 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium tracking-wide uppercase ${roleMeta.badgeClass}`}>
            <RoleIcon className="size-3.5" />
            {roleMeta.label}
          </div>
          <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>

        <Button
          type="button"
          size="icon-sm"
          variant="outline"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
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
            <div className="rounded-2xl border border-dashed border-slate-200/70 bg-white/40 px-4 py-8 text-center text-sm text-muted-foreground dark:border-white/10 dark:bg-white/5">
              {emptyMessage}
            </div>
          ) : (
            rooms.map((room) => (
              <ChatRoomListItem
                key={room.id}
                room={room}
                currentUserId={currentUserId}
                currentUserRole={currentUserRole}
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
