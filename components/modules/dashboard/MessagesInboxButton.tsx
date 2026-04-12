"use client";

import Link from "next/link";
import { useMemo } from "react";
import { MessageCircleMore } from "lucide-react";
import { usePathname } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useChatRooms } from "@/src/hooks/useChatRooms";
import type { UserRole } from "@/src/lib/authUtilis";
import { cn } from "@/src/lib/utils";

interface MessagesInboxButtonProps {
  role: UserRole;
}

const getMessagesHref = (role: UserRole) => {
  if (role === "EXPERT") {
    return "/expert/dashboard/messages";
  }

  if (role === "ADMIN") {
    return "/admin/dashboard/messages";
  }

  return "/dashboard/chat";
};

export default function MessagesInboxButton({ role }: MessagesInboxButtonProps) {
  const pathname = usePathname();
  const { rooms } = useChatRooms();

  const href = getMessagesHref(role);
  const isActive = pathname.startsWith(href);

  const { totalUnread, unreadRooms } = useMemo(() => {
    const unreadRooms = rooms.filter((room) => (room.unreadCount ?? 0) > 0).length;
    const totalUnread = rooms.reduce((sum, room) => sum + (room.unreadCount ?? 0), 0);

    return { totalUnread, unreadRooms };
  }, [rooms]);

  return (
    <Button
      asChild
      variant={isActive ? "default" : "outline"}
      className={cn(
        "relative gap-2",
        isActive ? "bg-violet-600 text-white hover:bg-violet-700" : undefined,
      )}
    >
      <Link href={href} aria-label={`Open messages${totalUnread ? ` (${totalUnread} unread)` : ""}`}>
        <MessageCircleMore className="size-4" />
        <span className="hidden lg:inline">Messages</span>

        {totalUnread > 0 ? (
          <Badge
            variant="destructive"
            className="ml-1 min-w-5 justify-center rounded-full px-1.5 text-[10px]"
          >
            {totalUnread > 99 ? "99+" : totalUnread}
          </Badge>
        ) : null}

        {unreadRooms > 0 && !totalUnread ? (
          <span className="absolute right-1 top-1 size-2 rounded-full bg-destructive" />
        ) : null}
      </Link>
    </Button>
  );
}
