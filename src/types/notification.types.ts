export type NotificationType =
  | "bookings"
  | "schedule"
  | "system"
  | "user"
  | "BOOKING"
  | "BOOKINGS"
  | "SCHEDULE"
  | "SYSTEM"
  | "USER"
  | "EXPERT_APPLICATION"
  | "EXPERT_APPROVED"
  | "EXPERT_REJECTED"
  | "EXPERT_VERIFIED"
  | "VERIFICATION_UPDATE";

export interface INotification {
  id: string;
  type: NotificationType | string;
  message: string;
  userId: string;
  createdAt: string;
  updatedAt?: string;
  read?: boolean;
  isRead?: boolean;
}

export interface IUnreadNotificationCount {
  unreadCount: number;
}

export interface ICreateNotificationPayload {
  type: string;
  message: string;
  userId?: string;
  role?: "ADMIN" | "EXPERT" | "CLIENT";
}
