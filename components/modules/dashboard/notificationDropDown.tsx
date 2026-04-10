"use client";

import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import {
  Bell,
  Calendar,
  CheckCheck,
  CheckCircle,
  Clock,
  Loader2,
  Trash2,
  UserPlus,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  deleteNotification,
  getMyNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "@/src/services/notification.service";
import type { INotification, NotificationType } from "@/src/types/notification.types";

type NotificationCollection =
  | INotification[]
  | {
      notifications?: INotification[];
      items?: INotification[];
      data?: INotification[];
    }
  | undefined;

const getNormalizedNotificationType = (type: NotificationType | string) =>
  String(type ?? "").toUpperCase();

const normalizeNotifications = (payload: NotificationCollection): INotification[] => {
  if (!payload) {
    return [];
  }

  const notifications = Array.isArray(payload)
    ? payload
    : Array.isArray(payload.notifications)
      ? payload.notifications
      : Array.isArray(payload.items)
        ? payload.items
        : Array.isArray(payload.data)
          ? payload.data
          : [];

  return notifications
    .map((notification) => ({
      ...notification,
      createdAt:
        notification.createdAt ?? notification.updatedAt ?? new Date().toISOString(),
      read: Boolean(notification.read ?? notification.isRead),
    }))
    .sort(
      (left, right) =>
        new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
    );
};

const getNotificationIcon = (type: NotificationType | string) => {
  const normalizedType = getNormalizedNotificationType(type);

  if (normalizedType.includes("BOOK")) {
    return <Calendar className="h-4 w-4 text-blue-600" />;
  }

  if (normalizedType.includes("SCHEDULE")) {
    return <Clock className="h-4 w-4 text-amber-600" />;
  }

  if (normalizedType.includes("SYSTEM")) {
    return <CheckCircle className="h-4 w-4 text-purple-600" />;
  }

  if (normalizedType.includes("EXPERT") || normalizedType.includes("USER")) {
    return <UserPlus className="h-4 w-4 text-green-600" />;
  }

  return <Bell className="h-4 w-4 text-gray-600" />;
};

const getNotificationTitle = (notification: INotification) => {
  const normalizedType = getNormalizedNotificationType(notification.type);

  if (normalizedType.includes("BOOK")) {
    return "Booking update";
  }

  if (normalizedType.includes("SCHEDULE")) {
    return "Schedule update";
  }

  if (normalizedType.includes("SYSTEM")) {
    return "System notice";
  }

  if (normalizedType.includes("APPLICATION")) {
    return "Expert application";
  }

  if (normalizedType.includes("APPROV") || normalizedType.includes("VERIF")) {
    return "Expert approved";
  }

  if (normalizedType.includes("REJECT") || normalizedType.includes("DECLIN")) {
    return "Expert rejected";
  }

  if (normalizedType.includes("EXPERT") || normalizedType.includes("USER")) {
    return "User activity";
  }

  return "Notification";
};

const NotificationDropdown = () => {
  const queryClient = useQueryClient();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["my-notifications"],
    queryFn: getMyNotifications,
    retry: false,
    staleTime: 0,
    refetchOnWindowFocus: true,
    refetchInterval: 15000,
  });

  const notifications = useMemo(() => normalizeNotifications(data?.data), [data?.data]);
  const unreadCount = notifications.filter((notification) => !notification.read).length;

  const markAllMutation = useMutation({
    mutationFn: markAllNotificationsAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-notifications"] });
      toast.success("All notifications marked as read.");
    },
  });

  const markOneMutation = useMutation({
    mutationFn: (id: string) => markNotificationAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-notifications"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-notifications"] });
      toast.success("Notification deleted.");
    },
  });

  return (
    <DropdownMenu
      onOpenChange={(open) => {
        if (open) {
          void refetch();
        }
      }}
    >
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 ? (
            <Badge
              className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full p-0"
              variant="destructive"
            >
              <span className="text-[10px]">{unreadCount > 9 ? "9+" : unreadCount}</span>
            </Badge>
          ) : null}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-88">
        <DropdownMenuLabel className="flex items-center justify-between gap-3">
          <div>
            <span>Notifications</span>
            {unreadCount > 0 ? (
              <Badge variant="secondary" className="ml-2">
                {unreadCount} new
              </Badge>
            ) : null}
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={!unreadCount || markAllMutation.isPending}
            onClick={() => markAllMutation.mutate()}
          >
            {markAllMutation.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <CheckCheck className="size-4" />
            )}
          </Button>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <ScrollArea className="h-80">
          {isLoading ? (
            <div className="space-y-2 p-3">
              {[1, 2, 3].map((item) => (
                <div key={item} className="h-16 animate-pulse rounded-xl bg-muted" />
              ))}
            </div>
          ) : isError ? (
            <div className="space-y-3 p-4 text-center text-sm text-muted-foreground">
              <p>Could not load notifications right now.</p>
              <Button type="button" variant="outline" size="sm" onClick={() => void refetch()}>
                Try again
              </Button>
            </div>
          ) : notifications.length > 0 ? (
            notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className="flex items-start gap-3 p-3"
                onSelect={(event) => event.preventDefault()}
              >
                <div className="mt-0.5 rounded-full bg-muted p-2">
                  {getNotificationIcon(notification.type)}
                </div>

                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium leading-none">
                        {getNotificationTitle(notification)}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                        {notification.message}
                      </p>
                    </div>

                    {!notification.read ? (
                      <div className="mt-1 h-2 w-2 rounded-full bg-blue-600" />
                    ) : null}
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1">
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(notification.createdAt), {
                        addSuffix: true,
                      })}
                    </p>

                    <div className="flex items-center gap-1">
                      {!notification.read ? (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => markOneMutation.mutate(notification.id)}
                        >
                          <CheckCheck className="size-4" />
                        </Button>
                      ) : null}

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive hover:text-destructive"
                        onClick={() => deleteMutation.mutate(notification.id)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </DropdownMenuItem>
            ))
          ) : (
            <div className="p-6 text-center text-sm text-muted-foreground">
              No notifications yet.
            </div>
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationDropdown