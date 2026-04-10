import { httpClient } from "../lib/axious/httpClient";
import type {
  ICreateNotificationPayload,
  INotification,
  IUnreadNotificationCount,
} from "../types/notification.types";

export const getMyNotifications = async () => {
  return httpClient.get<INotification[]>("/notifications/my", {
    silent: true,
  });
};

export const getUnreadNotificationCount = async () => {
  return httpClient.get<IUnreadNotificationCount>("/notifications/unread-count", {
    silent: true,
  });
};

export const markNotificationAsRead = async (id: string) => {
  const response = await httpClient.patch<INotification>(
    `/notifications/${id}/read`,
    undefined,
    { silent: true },
  );

  return response.data;
};

export const markAllNotificationsAsRead = async () => {
  const response = await httpClient.patch<{ count?: number }>(
    "/notifications/read-all",
    undefined,
    { silent: true },
  );

  return response.data;
};

export const deleteNotification = async (id: string) => {
  const response = await httpClient.delete<null>(`/notifications/${id}`, {
    silent: true,
  });

  return response.data;
};

export const createNotification = async (payload: ICreateNotificationPayload) => {
  const response = await httpClient.post<INotification | { count: number }>(
    "/notifications",
    payload,
  );

  return response.data;
};

export const getAllNotifications = async () => {
  return httpClient.get<INotification[]>("/notifications", {
    silent: true,
  });
};
