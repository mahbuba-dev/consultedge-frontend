"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  type ChatSocketConnectionState,
  getChatSocketClient,
} from "@/src/lib/chat/socketClient";
import { getMe } from "@/src/services/auth.services";
import {
  getParticipantDisplayName,
  isMessageFromCurrentUser,
  markChatRoomAsRead,
  mergeUniqueMessages,
  normalizeChatMessage,
  replaceChatMessage,
  upsertChatRoomActivity,
} from "@/src/services/chatRoom.service";
import type { IUserProfile } from "@/src/types/auth.types";
import type {
  ChatMessage,
  ChatRoom,
  ChatRole,
  PresenceState,
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

type ChatEventHandler = (payload: any) => void;

type ChatSocketContextValue = {
  currentUser: CurrentChatUser | null;
  connectionState: ChatSocketConnectionState;
  isConnected: boolean;
  isFallbackPolling: boolean;
  presenceMap: Record<string, PresenceState>;
  typingState: Record<string, TypingState[]>;
  activeRoomId: string | null;
  roomSubscriptions: Record<string, "subscribed" | "unsubscribed">;
  setActiveRoomId: React.Dispatch<React.SetStateAction<string | null>>;
  subscribeRoom: (roomId: string) => void;
  unsubscribeRoom: (roomId: string) => void;
  markRoomAsRead: (roomId: string) => void;
  emit: (event: string, payload?: unknown) => void;
  onEvent: (event: string, handler: ChatEventHandler) => void;
  offEvent: (event: string, handler: ChatEventHandler) => void;
  incomingCall: IncomingCallPayload | null;
  setIncomingCall: React.Dispatch<React.SetStateAction<IncomingCallPayload | null>>;
  clearIncomingCall: () => void;
};

const ChatSocketContext = createContext<ChatSocketContextValue | null>(null);

const isRealtimeConnected = (state: ChatSocketConnectionState) => state === "connected";

export function ChatSocketProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const previousConnectionStateRef = useRef<ChatSocketConnectionState>("disconnected");

  const [connectionState, setConnectionState] =
    useState<ChatSocketConnectionState>("disconnected");
  const [presenceMap, setPresenceMap] = useState<Record<string, PresenceState>>({});
  const [typingState, setTypingState] = useState<Record<string, TypingState[]>>({});
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const [roomSubscriptions, setRoomSubscriptions] = useState<
    Record<string, "subscribed" | "unsubscribed">
  >({});
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
        updateRoomsCache(
          current as ChatRoom[] | { data?: ChatRoom[] } | undefined,
          (rooms) => markChatRoomAsRead(rooms, roomId),
        ),
      );
    },
    [queryClient, updateRoomsCache],
  );

  const subscribeRoom = useCallback((roomId: string) => {
    if (!roomId) {
      return;
    }

    const client = getChatSocketClient();
    client?.subscribeRoom(roomId);

    setRoomSubscriptions((current) => ({
      ...current,
      [roomId]: "subscribed",
    }));
  }, []);

  const unsubscribeRoom = useCallback((roomId: string) => {
    if (!roomId) {
      return;
    }

    const client = getChatSocketClient();
    client?.unsubscribeRoom(roomId);

    setRoomSubscriptions((current) => ({
      ...current,
      [roomId]: "unsubscribed",
    }));
  }, []);

  const emit = useCallback((event: string, payload?: unknown) => {
    const client = getChatSocketClient();
    client?.emit(event, payload);
  }, []);

  const onEvent = useCallback((event: string, handler: ChatEventHandler) => {
    const client = getChatSocketClient();
    client?.on(event, handler);
  }, []);

  const offEvent = useCallback((event: string, handler: ChatEventHandler) => {
    const client = getChatSocketClient();
    client?.off(event, handler);
  }, []);

  useEffect(() => {
    if (!currentUser) {
      const client = getChatSocketClient();
      client?.disconnect();
      previousConnectionStateRef.current = "disconnected";
      return;
    }

    const client = getChatSocketClient();

    if (!client) {
      return;
    }

    client.setUserId(currentUser.userId);

    const handleConnectionStateChange = (nextState: ChatSocketConnectionState) => {
      const previous = previousConnectionStateRef.current;
      previousConnectionStateRef.current = nextState;
      setConnectionState(nextState);

      // Only announce a successful reconnection after we were previously connected.
      if (nextState === "connected" && previous === "reconnecting") {
        toast.success("Realtime connected", {
          description: "Live chat updates are active again.",
        });
      }
    };

    const handleReceiveMessage = (payload: any) => {
      const message = normalizeChatMessage(payload);

      if (!message?.roomId) {
        return;
      }

      const existingMessages =
        queryClient.getQueryData<ChatMessage[]>(["chat-room-messages", message.roomId]) ?? [];
      const isDuplicate = existingMessages.some((entry) => entry.id === message.id);
      const isOwnMessage = isMessageFromCurrentUser(message, currentUser.userId);
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
            roomData: payload?.room,
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

    const handleMessageReactionUpdated = (payload: any) => {
      const message = normalizeChatMessage(payload);

      if (!message?.roomId || !message?.id) {
        return;
      }

      queryClient.setQueryData<ChatMessage[]>(["chat-room-messages", message.roomId], (current = []) =>
        replaceChatMessage(current, message),
      );

      queryClient.setQueriesData({ queryKey: ["chat-rooms"] }, (current) =>
        updateRoomsCache(current as ChatRoom[] | { data?: ChatRoom[] } | undefined, (rooms) =>
          rooms.map((room) =>
            room.id === message.roomId && room.lastMessage?.id === message.id
              ? {
                  ...room,
                  lastMessage: message,
                }
              : room,
          ),
        ),
      );
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
        text: `${payload?.callerName || "A participant"} started a call`,
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
            roomData: payload?.room,
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
        toast.message(`Incoming call from ${payload?.callerName || "a participant"}`, {
          description: "Open the room to answer the secure consultation call.",
        });
      }
    };

    const handleCallUpdated = (_payload: any) => {
      // Call state updates are handled by the call hook and REST responses.
    };

    const handleCallEnded = () => {
      setIncomingCall(null);
    };

    const handleChatError = (payload: any) => {
      const message = String(payload?.message || "A realtime chat error occurred.");
      const statusCode = Number(payload?.status ?? 0);
      const ablyCode = Number(payload?.code ?? 0);

      // Ably channel capability denial (code 40160) reports statusCode 401 but
      // is NOT a user session problem — it means the realtime token didn't
      // grant access to the requested channel. Ignore these; the backend owns
      // fixing the capability. Logging only.
      const isAblyCapabilityError =
        ablyCode === 40160 || /denied access based on given capability/i.test(message);

      if (isAblyCapabilityError) {
        if (process.env.NODE_ENV !== "production") {
          console.warn("[realtime] capability denied:", message);
        }
        return;
      }

      // Treat as session expiry only when the app's own token endpoint returns
      // 401, not when Ably returns 401 for channel capability.
      const isTokenEndpointAuthError =
        /realtime token request failed \(401\)/i.test(message) ||
        /token expired|invalid token/i.test(message);

      if (isTokenEndpointAuthError) {
        // Don't kick the user out — realtime chat can fail for many reasons
        // (backend /realtime/token not reachable, missing ABLY_API_KEY, etc.)
        // that are NOT actual session expiry. The HTTP layer will handle real
        // auth failures on regular API calls.
        if (process.env.NODE_ENV !== "production") {
          console.warn("[realtime] token endpoint auth error:", message);
        }
        return;
      }

      // Everything else: stay silent in production (transient reconnect errors
      // are noisy). Only surface during development.
      if (process.env.NODE_ENV !== "production") {
        console.warn("[realtime]", message, { statusCode, ablyCode });
      }
    };

    client.onStateChange(handleConnectionStateChange);
    client.on("receive_message", handleReceiveMessage);
    client.on("message_reaction_updated", handleMessageReactionUpdated);
    client.on("presence_update", handlePresenceUpdate);
    client.on("typing", handleTyping);
    client.on("call_started", handleCallStarted);
    client.on("call_updated", handleCallUpdated);
    client.on("call_ended", handleCallEnded);
    client.on("chat_error", handleChatError);
    client.connect();

    return () => {
      client.offStateChange(handleConnectionStateChange);
      client.off("receive_message", handleReceiveMessage);
      client.off("message_reaction_updated", handleMessageReactionUpdated);
      client.off("presence_update", handlePresenceUpdate);
      client.off("typing", handleTyping);
      client.off("call_started", handleCallStarted);
      client.off("call_updated", handleCallUpdated);
      client.off("call_ended", handleCallEnded);
      client.off("chat_error", handleChatError);
    };
  }, [activeRoomId, currentUser, markRoomAsRead, queryClient, updateRoomsCache]);

  const value = useMemo<ChatSocketContextValue>(
    () => ({
      currentUser,
      connectionState,
      isConnected: isRealtimeConnected(connectionState),
      isFallbackPolling: connectionState !== "connected",
      presenceMap,
      typingState,
      activeRoomId,
      roomSubscriptions,
      setActiveRoomId,
      subscribeRoom,
      unsubscribeRoom,
      markRoomAsRead,
      emit,
      onEvent,
      offEvent,
      incomingCall,
      setIncomingCall,
      clearIncomingCall: () => setIncomingCall(null),
    }),
    [
      activeRoomId,
      connectionState,
      currentUser,
      emit,
      incomingCall,
      markRoomAsRead,
      offEvent,
      onEvent,
      presenceMap,
      roomSubscriptions,
      subscribeRoom,
      typingState,
      unsubscribeRoom,
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
