export type ChatRole = "CLIENT" | "EXPERT" | "ADMIN";

export type ChatMessageType = "TEXT" | "FILE" | "IMAGE" | "SYSTEM";

export type ChatCallStatus = "RINGING" | "ACTIVE" | "ENDED" | "MISSED" | "DECLINED";

export interface ChatParticipant {
  id: string;
  userId?: string;
  role: ChatRole;
  fullName?: string;
  name?: string;
  title?: string;
  email?: string;
  profilePhoto?: string | null;
  avatarUrl?: string | null;
  isOnline?: boolean;
  lastSeen?: string | null;
}

export interface ChatAttachment {
  id?: string;
  fileName: string;
  url: string;
  mimeType?: string;
  size?: number;
}

export interface ChatMessageReaction {
  emoji: string;
  count: number;
  reactorIds?: string[];
  reactedByCurrentUser?: boolean;
}

export interface ChatMessage {
  id: string;
  roomId: string;
  text?: string;
  type: ChatMessageType | string;
  createdAt: string;
  updatedAt?: string;
  senderId: string;
  senderRole?: ChatRole;
  sender?: ChatParticipant | null;
  attachment?: ChatAttachment | null;
  reactions?: ChatMessageReaction[];
  pending?: boolean;
  failed?: boolean;
}

export interface ChatRoom {
  id: string;
  name?: string;
  participants: ChatParticipant[];
  lastMessage?: ChatMessage | null;
  unreadCount?: number;
  updatedAt?: string;
  expertId?: string;
  clientId?: string;
}

export interface PresenceState {
  userId: string;
  isOnline: boolean;
  lastSeen?: string | null;
  role?: ChatRole;
}

export interface TypingState {
  roomId: string;
  userId: string;
  isTyping: boolean;
  name?: string;
}

export interface ChatCall {
  id: string;
  roomId: string;
  status: ChatCallStatus | string;
  startedAt?: string;
  startedBy?: string;
}

