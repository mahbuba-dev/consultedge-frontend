"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { Socket } from "socket.io-client";
import { toast } from "sonner";

import { getChatSocketClient } from "@/src/lib/chat/socketClient";
import { getMe } from "@/src/services/auth.services";
import {
  getParticipantDisplayName,
  markChatRoomAsRead,
  mergeUniqueMessages,
  normalizeChatMessage,
  upsertChatRoomActivity,
} from "@/src/services/chatRoom.service";
import type { IUserProfile } from "@/src/types/auth.types";
import type {
  ChatMessage,
  ChatRoom,
  ChatRole,
  PresenceState,
  SocketAuthPayload,
  TypingState,
} from "@/src/types/chat.types";

type IncomingCallPayload = {
  roomId: string;
  callId?: string;
  callerId?: string;
  callerName?: string;
};

type CurrentChatUser = {
  userId: string;
  role: ChatRole;
  name: string;
  profilePhoto?: string | null;
};

type ChatSocketContextValue = {
  socket: Socket | null;
  currentUser: CurrentChatUser | null;
  isConnected: boolean;
  presenceMap: Record<string, PresenceState>;
  typingState: Record<string, TypingState[]>;
  activeRoomId: string | null;
  setActiveRoomId: React.Dispatch<React.SetStateAction<string | null>>;
  markRoomAsRead: (roomId: string) => void;
  incomingCall: IncomingCallPayload | null;
  setIncomingCall: React.Dispatch<React.SetStateAction<IncomingCallPayload | null>>;
  clearIncomingCall: () => void;
};

const ChatSocketContext = createContext<ChatSocketContextValue | null>(null);

export function ChatSocketProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [presenceMap, setPresenceMap] = useState<Record<string, PresenceState>>({});
  const [typingState, setTypingState] = useState<Record<string, TypingState[]>>({});
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const [incomingCall, setIncomingCall] = useState<IncomingCallPayload | null>(null);

  const { data: profile } = useQuery<IUserProfile>({
    queryKey: ["me"],
    queryFn: getMe,
    staleTime: 5 * 60 * 1000,
  });

  const currentUser = useMemo<CurrentChatUser | null>(() => {
    if (!profile?.id || !profile.role) {
      return null;
    }

    return {
      userId: profile.id,
      role: profile.role as ChatRole,
      name:
        profile.expert?.fullName ||
        profile.client?.fullName ||
        profile.admin?.name ||
        profile.name ||
        "ConsultEdge user",
      profilePhoto: null,
    };
  }, [profile]);

  const updateRoomsCache = useCallback(
    (
      current: ChatRoom[] | { data?: ChatRoom[] } | undefined,
      updater: (rooms: ChatRoom[]) => ChatRoom[],
    ) => {
      const rooms = Array.isArray(current)
        ? current
        : Array.isArray(current?.data)
          ? current.data
          : [];

      const updatedRooms = updater(rooms);

      if (Array.isArray(current)) {
        return updatedRooms;
      }

      if (current && typeof current === "object") {
        return { ...current, data: updatedRooms };
      }

      return updatedRooms;
    },
    [],
  );

  const markRoomAsRead = useCallback(
    (roomId: string) => {
      queryClient.setQueriesData({ queryKey: ["chat-rooms"] }, (current) =>
        updateRoomsCache(current as ChatRoom[] | { data?: ChatRoom[] } | undefined, (rooms) =>
          markChatRoomAsRead(rooms, roomId),
        ),
      );
    },
    [queryClient, updateRoomsCache],
  );

  useEffect(() => {
    if (!currentUser) {
      return;
    }

    const authPayload: SocketAuthPayload = {
      userId: currentUser.userId,
      role: currentUser.role,
    };

    const client = getChatSocketClient(authPayload);

    if (!client) {
      return;
    }

    setSocket(client);

    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);

    const handleReceiveMessage = (payload: any) => {
      const message = normalizeChatMessage(payload);

      if (!message?.roomId) {
        return;
      }

      const existingMessages =
        queryClient.getQueryData<ChatMessage[]>(["chat-room-messages", message.roomId]) ?? [];
      const isDuplicate = existingMessages.some((entry) => entry.id === message.id);
      const isOwnMessage = message.senderId === currentUser.userId;
      const isActiveRoom = activeRoomId === message.roomId;

      queryClient.setQueryData<ChatMessage[]>(["chat-room-messages", message.roomId], (current) =>
        mergeUniqueMessages([...(current ?? []), message]),
      );

      queryClient.setQueriesData({ queryKey: ["chat-rooms"] }, (current) =>
        updateRoomsCache(current as ChatRoom[] | { data?: ChatRoom[] } | undefined, (rooms) =>
          upsertChatRoomActivity({
            rooms,
            message,
            currentUserId: currentUser.userId,
            activeRoomId,
            roomData: payload?.room ?? payload,
          }),
        ),
      );

      if (isActiveRoom) {
        markRoomAsRead(message.roomId);
      }

      if (!isDuplicate && !isOwnMessage && !isActiveRoom) {
        const senderName = getParticipantDisplayName(message.sender);
        toast.message(`New message from ${senderName}`, {
          description: message.attachment
            ? `${senderName} sent ${message.attachment.fileName}.`
            : message.text || "You have a new unread message.",
        });
      }
    };

    const handlePresenceUpdate = (payload: any) => {
      const entries = Array.isArray(payload) ? payload : [payload];

      setPresenceMap((current) => {
        const next = { ...current };

        entries.forEach((entry) => {
          if (!entry?.userId) {
            return;
          }

          next[String(entry.userId)] = {
            userId: String(entry.userId),
            isOnline: Boolean(entry.isOnline ?? entry.online),
            lastSeen: entry.lastSeen ?? null,
            role: entry.role,
          };
        });

        return next;
      });
    };

    const handleTyping = (payload: any) => {
      if (!payload?.roomId || !payload?.userId) {
        return;
      }

      setTypingState((current) => {
        const roomKey = String(payload.roomId);
        const existingEntries = current[roomKey] ?? [];
        const filteredEntries = existingEntries.filter((entry) => entry.userId !== String(payload.userId));

        if (!payload.isTyping) {
          return {
            ...current,
            [roomKey]: filteredEntries,
          };
        }

        return {
          ...current,
          [roomKey]: [
            ...filteredEntries,
            {
              roomId: roomKey,
              userId: String(payload.userId),
              isTyping: true,
              name: payload.name,
            },
          ],
        };
      });
    };

    const handleCallStarted = (payload: any) => {
      const roomId = String(payload?.roomId ?? "");
      const callerId = payload?.callerId ? String(payload.callerId) : undefined;

      if (!roomId || callerId === currentUser.userId) {
        return;
      }

      const callNotice: ChatMessage = {
        id: `call-${payload?.callId ?? roomId}-${Date.now()}`,
        roomId,
        text: `${payload?.callerName || "A client"} started a call`,
        type: "SYSTEM",
        createdAt: new Date().toISOString(),
        senderId: callerId ?? "system",
        senderRole: (payload?.callerRole ?? "CLIENT") as ChatRole,
        sender: callerId
          ? {
              id: callerId,
              userId: callerId,
              role: (payload?.callerRole ?? "CLIENT") as ChatRole,
              fullName: payload?.callerName,
              name: payload?.callerName,
            }
          : null,
      };

      queryClient.setQueriesData({ queryKey: ["chat-rooms"] }, (current) =>
        updateRoomsCache(current as ChatRoom[] | { data?: ChatRoom[] } | undefined, (rooms) =>
          upsertChatRoomActivity({
            rooms,
            message: callNotice,
            currentUserId: currentUser.userId,
            activeRoomId,
            roomData: payload?.room ?? payload,
          }),
        ),
      );

      setIncomingCall({
        roomId,
        callId: payload?.callId,
        callerId,
        callerName: payload?.callerName,
      });

      if (activeRoomId !== roomId) {
        toast.message(`Incoming call from ${payload?.callerName || "a client"}`, {
          description: "Open the room to answer the secure consultation call.",
        });
      }
    };

    const handleCallEnded = () => {
      setIncomingCall(null);
    };

    const handleChatError = (payload: any) => {
      toast.error(payload?.message || "A realtime chat error occurred.");
    };

    client.on("connect", handleConnect);
    client.on("disconnect", handleDisconnect);
    client.on("receive_message", handleReceiveMessage);
    client.on("presence_update", handlePresenceUpdate);
    client.on("typing", handleTyping);
    client.on("call_started", handleCallStarted);
    client.on("call_ended", handleCallEnded);
    client.on("chat_error", handleChatError);

    if (!client.connected) {
      client.connect();
    }

    return () => {
      client.off("connect", handleConnect);
      client.off("disconnect", handleDisconnect);
      client.off("receive_message", handleReceiveMessage);
      client.off("presence_update", handlePresenceUpdate);
      client.off("typing", handleTyping);
      client.off("call_started", handleCallStarted);
      client.off("call_ended", handleCallEnded);
      client.off("chat_error", handleChatError);
    };
  }, [activeRoomId, currentUser, markRoomAsRead, queryClient, updateRoomsCache]);

  const value = useMemo<ChatSocketContextValue>(
    () => ({
      socket,
      currentUser,
      isConnected,
      presenceMap,
      typingState,
      activeRoomId,
      setActiveRoomId,
      markRoomAsRead,
      incomingCall,
      setIncomingCall,
      clearIncomingCall: () => setIncomingCall(null),
    }),
    [
      socket,
      currentUser,
      isConnected,
      presenceMap,
      typingState,
      activeRoomId,
      markRoomAsRead,
      incomingCall,
    ],
  );

  return <ChatSocketContext.Provider value={value}>{children}</ChatSocketContext.Provider>;
}

export const useChatSocketContext = () => {
  const context = useContext(ChatSocketContext);

  if (!context) {
    throw new Error("useChatSocketContext must be used within ChatSocketProvider.");
  }

  return context;
};
