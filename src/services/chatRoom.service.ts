// Delete a message from a chat room
export const deleteRoomMessage = async (roomId: string, messageId: string) => {
  const response = await httpClient.delete<{ messageId: string; success: boolean; message: string }>(
    `/chat/rooms/${roomId}/messages/${messageId}`,
    { silent: true }
  );
  return response;
};
import { httpClient } from "../lib/axious/httpClient";
import type {
  ChatAttachment,
  ChatCall,
  ChatCallStatus,
  ChatMessage,
  ChatMessageReaction,
  ChatMessageType,
  ChatParticipant,
  ChatRoom,
  ChatRole,
} from "../types/chat.types";

const CHAT_BASE_PATH = "/chat";

const toArray = (value: unknown, nestedKeys: string[] = []): any[] => {
  if (Array.isArray(value)) {
    return value;
  }

  if (value && typeof value === "object") {
    for (const nestedKey of nestedKeys) {
      const nestedValue = (value as Record<string, unknown>)[nestedKey];

      if (Array.isArray(nestedValue)) {
        return nestedValue;
      }

       if (nestedValue && typeof nestedValue === "object") {
        const nestedArray = toArray(nestedValue, nestedKeys);

        if (nestedArray.length > 0) {
          return nestedArray;
        }
      }
    }
  }

  return [];
};

export const getParticipantDisplayName = (participant?: ChatParticipant | null) =>
  participant?.fullName || participant?.name || participant?.email || "Unknown participant";

export const getParticipantKey = (participant?: ChatParticipant | null) =>
  String(participant?.userId ?? participant?.id ?? "");

const isCurrentParticipant = (
  participant: ChatParticipant,
  currentUserId?: string,
) => {
  if (!currentUserId) {
    return false;
  }

  return [participant.userId, participant.id]
    .filter(Boolean)
    .some((candidate) => String(candidate) === currentUserId);
};

export const getOtherParticipants = ({
  participants,
  currentUserId,
  currentUserRole,
}: {
  participants: ChatParticipant[];
  currentUserId?: string;
  currentUserRole?: ChatRole | null;
}) => {
  const otherParticipantsById = participants.filter(
    (participant) => !isCurrentParticipant(participant, currentUserId),
  );

  if (otherParticipantsById.length > 0 && otherParticipantsById.length < participants.length) {
    return otherParticipantsById;
  }

  if (currentUserRole) {
    const otherParticipantsByRole = participants.filter(
      (participant) => participant.role !== currentUserRole,
    );

    if (otherParticipantsByRole.length > 0) {
      return otherParticipantsByRole;
    }
  }

  return participants.slice(1);
};

const normalizeParticipant = (value: any): ChatParticipant => ({
  id: String(value?.id ?? value?.userId ?? value?.participantId ?? crypto.randomUUID()),
  userId: value?.userId ? String(value.userId) : undefined,
  role: (value?.role ?? "CLIENT") as ChatRole,
  fullName:
    value?.fullName ??
    value?.name ??
    value?.user?.name ??
    value?.admin?.name ??
    value?.client?.fullName ??
    value?.expert?.fullName,
  name:
    value?.name ??
    value?.fullName ??
    value?.user?.name ??
    value?.admin?.name ??
    value?.client?.fullName ??
    value?.expert?.fullName,
  title: value?.title,
  email: value?.email ?? value?.user?.email,
  profilePhoto: value?.profilePhoto ?? value?.image ?? value?.avatarUrl ?? null,
  avatarUrl: value?.avatarUrl ?? value?.profilePhoto ?? value?.image ?? null,
  isOnline: value?.isOnline,
  lastSeen: value?.lastSeen ?? null,
});

const normalizeAttachment = (value: any): ChatAttachment => ({
  id: value?.id,
  fileName: value?.fileName ?? value?.name ?? "Attachment",
  url: value?.url ?? value?.path ?? value?.secure_url ?? "",
  mimeType: value?.mimeType ?? value?.type,
  size: value?.size,
});

const normalizeReactionActorIds = (value: any): string[] => {
  if (!value) {
    return [];
  }

  const entries = Array.isArray(value)
    ? value
    : Array.isArray(value?.users)
      ? value.users
      : Array.isArray(value?.reactors)
        ? value.reactors
        : Array.isArray(value?.participants)
          ? value.participants
          : Array.isArray(value?.items)
            ? value.items
            : [];

  return entries
    .map((entry) => {
      if (typeof entry === "string" || typeof entry === "number") {
        return String(entry);
      }

      return entry?.userId ?? entry?.id ?? entry?.participantId ?? entry?.reactorId;
    })
    .filter(Boolean)
    .map(String);
};

const normalizeChatMessageReaction = (
  value: any,
  fallbackEmoji?: string,
): ChatMessageReaction | null => {
  if (!value && !fallbackEmoji) {
    return null;
  }

  if (typeof value === "string") {
    return {
      emoji: value,
      count: 1,
      reactorIds: [],
      reactedByCurrentUser: false,
    };
  }

  if (typeof value === "number" && fallbackEmoji) {
    return {
      emoji: fallbackEmoji,
      count: value,
      reactorIds: [],
      reactedByCurrentUser: false,
    };
  }

  const emoji = String(
    value?.emoji ?? value?.reaction ?? value?.value ?? value?.label ?? fallbackEmoji ?? "",
  ).trim();

  if (!emoji) {
    return null;
  }

  const reactorIds = Array.from(
    new Set(
      [
        ...normalizeReactionActorIds(value?.reactorIds),
        ...normalizeReactionActorIds(value?.userIds),
        ...normalizeReactionActorIds(value?.participants),
        ...normalizeReactionActorIds(value?.reactors),
        ...normalizeReactionActorIds(value?.users),
      ],
    ),
  );

  const normalizedCount = Number(
    value?.count ?? value?._count ?? value?.total ?? value?.aggregateCount ?? reactorIds.length ?? 0,
  );

  return {
    emoji,
    count: Number.isFinite(normalizedCount) && normalizedCount > 0 ? normalizedCount : reactorIds.length || 1,
    reactorIds,
    reactedByCurrentUser: Boolean(
      value?.reactedByCurrentUser ??
        value?.hasReacted ??
        value?.userReacted ??
        value?.selected ??
        value?.isOwnReaction,
    ),
  };
};

const normalizeChatMessageReactions = (value: any): ChatMessageReaction[] => {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value
      .map((entry) => normalizeChatMessageReaction(entry))
      .filter((entry): entry is ChatMessageReaction => Boolean(entry));
  }

  if (typeof value === "object") {
    const nestedArray =
      toArray(value, ["reactions", "items", "data", "groups", "groupedReactions"]) ?? [];

    if (nestedArray.length > 0) {
      return nestedArray
        .map((entry) => normalizeChatMessageReaction(entry))
        .filter((entry): entry is ChatMessageReaction => Boolean(entry));
    }

    return Object.entries(value)
      .map(([emoji, reactionValue]) => normalizeChatMessageReaction(reactionValue, emoji))
      .filter((entry): entry is ChatMessageReaction => Boolean(entry));
  }

  return [];
};

export const normalizeChatMessage = (value: any): ChatMessage => {
  const nestedData =
    value?.data && typeof value.data === "object"
      ? value.data.message && typeof value.data.message === "object"
        ? {
            ...value.data.message,
            roomId:
              value.data.message.roomId ??
              value.data.roomId ??
              value?.roomId,
            reactions:
              value.data.message.reactions ??
              value.data.reactions ??
              value.data.reactionGroups ??
              value.data.groupedReactions ??
              value.data.messageReactions,
          }
        : value.data
      : undefined;
  const directMessage =
    value?.message && typeof value.message === "object"
      ? {
          ...value.message,
          roomId: value.message.roomId ?? value?.roomId,
          reactions:
            value.message.reactions ??
            value.reactions ??
            value.reactionGroups ??
            value.groupedReactions ??
            value.messageReactions,
        }
      : undefined;
  const payloadData =
    value?.payload && typeof value.payload === "object"
      ? {
          ...value.payload,
          ...(value.payload.message && typeof value.payload.message === "object"
            ? value.payload.message
            : {}),
          roomId: value.payload.roomId ?? value?.roomId,
          reactions:
            value.payload.message?.reactions ??
            value.payload.reactions ??
            value.payload.reactionGroups ??
            value.payload.groupedReactions ??
            value.payload.messageReactions,
        }
      : undefined;
  const raw = nestedData ?? directMessage ?? payloadData ?? value;
  const sender = raw?.sender || raw?.user || raw?.author ? normalizeParticipant(raw.sender ?? raw.user ?? raw.author) : null;
  const attachment = raw?.attachment || raw?.file || raw?.media;

  return {
    id: String(raw?.id ?? `message-${Date.now()}`),
    roomId: String(raw?.roomId ?? raw?.chatRoomId ?? ""),
    text: raw?.text ?? raw?.content ?? "",
    type: String(raw?.type ?? (attachment ? "FILE" : "TEXT")) as ChatMessageType,
    createdAt: raw?.createdAt ?? new Date().toISOString(),
    updatedAt: raw?.updatedAt,
    senderId: String(raw?.senderId ?? sender?.userId ?? sender?.id ?? "unknown"),
    senderRole: (raw?.senderRole ?? sender?.role ?? "CLIENT") as ChatRole,
    sender,
    attachment: attachment ? normalizeAttachment(attachment) : null,
    reactions: normalizeChatMessageReactions(
      raw?.reactions ?? raw?.reactionGroups ?? raw?.groupedReactions ?? raw?.messageReactions,
    ),
    pending: Boolean(raw?.pending),
    failed: Boolean(raw?.failed),
  };
};

export const isMessageFromCurrentUser = (
  message: ChatMessage,
  currentUserId?: string,
) => {
  if (!currentUserId) {
    return false;
  }

  return [message.senderId, message.sender?.userId, message.sender?.id]
    .filter(Boolean)
    .some((candidate) => String(candidate) === currentUserId);
};

export const normalizeChatRoom = (value: any): ChatRoom => {
  const raw = value?.room ?? value?.data ?? value;
  const participants = toArray(raw?.participants ?? raw?.members ?? raw?.users).map(normalizeParticipant);
  const lastMessage = raw?.lastMessage ? normalizeChatMessage(raw.lastMessage) : null;
  const resolvedRoomId = raw?.id ?? raw?.roomId ?? raw?.chatRoomId;

  const expertParticipant = participants.find((participant) => participant.role === "EXPERT");
  const clientParticipant = participants.find((participant) => participant.role === "CLIENT");

  return {
    id: resolvedRoomId ? String(resolvedRoomId) : "",
    name:
      raw?.name ??
      raw?.title ??
      (participants.map((participant) => getParticipantDisplayName(participant)).join(", ") ||
        "Conversation"),
    participants,
    lastMessage,
    unreadCount: Number(raw?.unreadCount ?? raw?.unread ?? raw?.unreadMessagesCount ?? 0),
    updatedAt: raw?.updatedAt ?? lastMessage?.createdAt ?? raw?.createdAt ?? new Date().toISOString(),
    expertId: raw?.expertId ?? expertParticipant?.userId ?? expertParticipant?.id,
    clientId: raw?.clientId ?? clientParticipant?.userId ?? clientParticipant?.id,
  };
};

const normalizeChatCall = (value: any): ChatCall => {
  const raw = value?.call ?? value?.data ?? value;

  return {
    id: String(raw?.id ?? raw?.callId ?? `call-${Date.now()}`),
    roomId: String(raw?.roomId ?? raw?.chatRoomId ?? ""),
    status: (raw?.status ?? "RINGING") as ChatCallStatus,
    startedAt: raw?.startedAt ?? raw?.createdAt,
    startedBy: raw?.startedBy ?? raw?.callerId,
  };
};

export const mergeUniqueMessages = (messages: ChatMessage[]) => {
  const merged = new Map<string, ChatMessage>();

  messages.forEach((message) => {
    merged.set(message.id, message);
  });

  return [...merged.values()].sort(
    (left, right) => new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime(),
  );
};

export const replaceChatMessage = (messages: ChatMessage[], message: ChatMessage) =>
  mergeUniqueMessages([...messages.filter((entry) => entry.id !== message.id), message]);

export const getCurrentUserReactionEmoji = (
  message: ChatMessage,
  currentUserId?: string,
) => {
  if (!currentUserId) {
    return null;
  }

  const matchedReaction = (message.reactions ?? []).find(
    (reaction) =>
      reaction.reactedByCurrentUser ||
      reaction.reactorIds?.includes(currentUserId),
  );

  return matchedReaction?.emoji ?? null;
};

export const toggleReactionLocally = ({
  message,
  emoji,
  currentUserId,
}: {
  message: ChatMessage;
  emoji: string;
  currentUserId?: string;
}): ChatMessage => {
  if (!emoji || !currentUserId) {
    return message;
  }

  const currentReactionEmoji = getCurrentUserReactionEmoji(message, currentUserId);

  const nextReactions = (message.reactions ?? [])
    .map((reaction) => {
      const reactorIds = Array.from(new Set(reaction.reactorIds ?? []));
      const hasCurrentUser =
        reaction.reactedByCurrentUser || reactorIds.includes(currentUserId);

      if (!hasCurrentUser) {
        return reaction;
      }

      const remainingIds = reactorIds.filter((reactorId) => reactorId !== currentUserId);
      const nextCount = Math.max(0, (reaction.count ?? reactorIds.length ?? 1) - 1);

      if (nextCount === 0) {
        return null;
      }

      return {
        ...reaction,
        count: nextCount,
        reactorIds: remainingIds,
        reactedByCurrentUser: false,
      };
    })
    .filter((reaction): reaction is NonNullable<ChatMessage["reactions"]>[number] => Boolean(reaction));

  if (currentReactionEmoji !== emoji) {
    const targetIndex = nextReactions.findIndex((reaction) => reaction.emoji === emoji);

    if (targetIndex === -1) {
      nextReactions.push({
        emoji,
        count: 1,
        reactorIds: [currentUserId],
        reactedByCurrentUser: true,
      });
    } else {
      const targetReaction = nextReactions[targetIndex];
      const reactorIds = Array.from(new Set(targetReaction.reactorIds ?? []));

      nextReactions[targetIndex] = {
        ...targetReaction,
        count: Math.max(0, targetReaction.count ?? reactorIds.length ?? 0) + 1,
        reactorIds: reactorIds.includes(currentUserId)
          ? reactorIds
          : [...reactorIds, currentUserId],
        reactedByCurrentUser: true,
      };
    }
  }

  return {
    ...message,
    reactions: nextReactions,
  };
};

export const sortChatRooms = (rooms: ChatRoom[]) => {
  return [...rooms].sort(
    (left, right) =>
      new Date(right.updatedAt ?? right.lastMessage?.createdAt ?? 0).getTime() -
      new Date(left.updatedAt ?? left.lastMessage?.createdAt ?? 0).getTime(),
  );
};

export const markChatRoomAsRead = (rooms: ChatRoom[], roomId: string) => {
  return sortChatRooms(
    rooms.map((room) =>
      room.id === roomId
        ? {
            ...room,
            unreadCount: 0,
          }
        : room,
    ),
  );
};

type UpsertChatRoomActivityOptions = {
  rooms: ChatRoom[];
  message: ChatMessage;
  currentUserId?: string;
  activeRoomId?: string | null;
  roomData?: unknown;
};

export const upsertChatRoomActivity = ({
  rooms,
  message,
  currentUserId,
  activeRoomId,
  roomData,
}: UpsertChatRoomActivityOptions) => {
  const updatedRooms = [...rooms];
  const roomIndex = updatedRooms.findIndex((room) => room.id === message.roomId);
  const normalizedRoom = roomData ? normalizeChatRoom(roomData) : null;
  const safeNormalizedRoom = normalizedRoom?.id ? normalizedRoom : null;
  const shouldIncrementUnread =
    Boolean(message.senderId) &&
    Boolean(currentUserId) &&
    message.senderId !== currentUserId &&
    activeRoomId !== message.roomId;

  if (roomIndex >= 0) {
    const existingRoom = updatedRooms[roomIndex];
    updatedRooms[roomIndex] = {
      ...existingRoom,
      ...(safeNormalizedRoom ?? {}),
      participants:
        safeNormalizedRoom?.participants?.length
          ? safeNormalizedRoom.participants
          : existingRoom.participants,
      lastMessage: message,
      updatedAt: message.createdAt,
      unreadCount: shouldIncrementUnread
        ? (existingRoom.unreadCount ?? 0) + 1
        : activeRoomId === message.roomId
          ? 0
          : existingRoom.unreadCount ?? 0,
    };

    return sortChatRooms(updatedRooms);
  }

  const fallbackParticipants = safeNormalizedRoom?.participants?.length
    ? safeNormalizedRoom.participants
    : message.sender
      ? [message.sender]
      : [];

  updatedRooms.unshift({
    id: message.roomId,
    name:
      safeNormalizedRoom?.name ||
      fallbackParticipants.map((participant) => getParticipantDisplayName(participant)).join(", ") ||
      "Conversation",
    participants: fallbackParticipants,
    lastMessage: message,
    unreadCount: shouldIncrementUnread ? 1 : 0,
    updatedAt: message.createdAt,
    expertId:
      safeNormalizedRoom?.expertId ??
      fallbackParticipants.find((participant) => participant.role === "EXPERT")?.userId ??
      fallbackParticipants.find((participant) => participant.role === "EXPERT")?.id,
    clientId:
      safeNormalizedRoom?.clientId ??
      fallbackParticipants.find((participant) => participant.role === "CLIENT")?.userId ??
      fallbackParticipants.find((participant) => participant.role === "CLIENT")?.id,
  });

  return sortChatRooms(updatedRooms);
};

export const getChatRooms = async (params?: Record<string, unknown>): Promise<ChatRoom[]> => {
  try {
    const response = await httpClient.get<ChatRoom[] | { rooms?: ChatRoom[] }>(
      `${CHAT_BASE_PATH}/rooms`,
      {
        params,
        silent: true,
      },
    );

    const rooms = toArray(response, ["rooms", "items", "data"]);
    return sortChatRooms(
      rooms
        .map(normalizeChatRoom)
        .filter((room) => Boolean(room.id)),
    );
  } catch (error: any) {
    if (error?.response?.status === 404) {
      return [];
    }

    throw error;
  }
};

const findMatchingRoom = (rooms: ChatRoom[], participantId: string) => {
  return (
    rooms.find(
      (room) =>
        room.id === participantId ||
        room.expertId === participantId ||
        room.clientId === participantId ||
        room.participants.some(
          (participant) => participant.id === participantId || participant.userId === participantId,
        ),
    ) ?? null
  );
};

export const findOrCreateRoomForExpert = async (participantId: string): Promise<ChatRoom | null> => {
  if (!participantId) {
    return null;
  }

  const createPayloads = [
    { expertId: participantId },
    { clientId: participantId },
    { participantId },
    { userId: participantId },
  ];

  for (const payload of createPayloads) {
    try {
      const response = await httpClient.post<ChatRoom | { room?: ChatRoom }>(
        `${CHAT_BASE_PATH}/rooms`,
        payload,
        { silent: true },
      );

      if (response) {
        const normalizedRoom = normalizeChatRoom(response);
        if (normalizedRoom.id) {
          return normalizedRoom;
        }
      }
    } catch {
      // Try the next supported payload shape.
    }
  }

  const queryVariants = [
    { participantId },
    { expertId: participantId },
    { clientId: participantId },
    { userId: participantId },
  ];

  for (const params of queryVariants) {
    try {
      const rooms = await getChatRooms(params);
      const matchedRoom = findMatchingRoom(rooms, participantId);

      if (matchedRoom) {
        return matchedRoom;
      }
    } catch {
      // Keep trying available query shapes.
    }
  }

  return null;
};

export const getRoomMessages = async (roomId: string): Promise<ChatMessage[]> => {
  try {
    const response = await httpClient.get<ChatMessage[] | { messages?: ChatMessage[] }>(
      `${CHAT_BASE_PATH}/rooms/${roomId}/messages`,
      { silent: true },
    );

    const messages = toArray(response, ["messages", "items", "data"]);
    return mergeUniqueMessages(messages.map(normalizeChatMessage));
  } catch (error: any) {
    if (error?.response?.status === 404) {
      return [];
    }

    throw error;
  }
};

export const toggleMessageReaction = async (
  roomId: string,
  messageId: string,
  emoji: string,
): Promise<ChatMessage> => {
  const response = await httpClient.post<ChatMessage>(
    `${CHAT_BASE_PATH}/rooms/${roomId}/messages/${messageId}/reactions`,
    { emoji },
    { silent: true },
  );

  return normalizeChatMessage(response);
};

export const sendRoomMessage = async (
  roomId: string,
  payload: { text: string },
): Promise<ChatMessage> => {
  const response = await httpClient.post<ChatMessage>(
    `${CHAT_BASE_PATH}/rooms/${roomId}/messages`,
    { text: payload.text },
    { silent: true },
  );

  return normalizeChatMessage(response);
};

export const uploadRoomAttachment = async (
  roomId: string,
  file: File,
): Promise<ChatMessage> => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await httpClient.post<ChatMessage>(
    `${CHAT_BASE_PATH}/rooms/${roomId}/attachments`,
    formData,
    {
      silent: true,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );

  return normalizeChatMessage(response);
};

export const startRoomCall = async (roomId: string): Promise<ChatCall> => {
  const response = await httpClient.post<ChatCall>(
    `${CHAT_BASE_PATH}/rooms/${roomId}/calls`,
    {},
    { silent: true },
  );

  return normalizeChatCall(response);
};

export const updateCallStatus = async (
  callId: string,
  status: ChatCallStatus = "ENDED",
): Promise<ChatCall> => {
  const response = await httpClient.patch<ChatCall>(
    `${CHAT_BASE_PATH}/calls/${callId}/status`,
    { status },
    { silent: true },
  );

  return normalizeChatCall(response);
};
