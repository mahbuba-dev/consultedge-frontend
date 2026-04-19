"use client";

import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useChatSocket } from "@/src/hooks/useChatSocket";
import {
  getRoomMessages,
  isMessageFromCurrentUser,
  mergeUniqueMessages,
  sendRoomMessage,
  sortChatRooms,
  uploadRoomAttachment,
} from "@/src/services/chatRoom.service";
import type { ChatMessage } from "@/src/types/chat.types";

const hydrateOwnMessage = (message: ChatMessage, currentUser?: { userId: string; role: ChatMessage["senderRole"]; name: string } | null) => {
  if (!currentUser) {
    return message;
  }

  if (message.sender && message.text) {
    return message;
  }

  return {
    ...message,
    senderId:
      message.senderId && message.senderId !== "unknown"
        ? message.senderId
        : currentUser.userId,
    senderRole: message.senderRole ?? currentUser.role,
    sender:
      message.sender ?? {
        id: currentUser.userId,
        userId: currentUser.userId,
        role: currentUser.role ?? "ADMIN",
        fullName: currentUser.name,
        name: currentUser.name,
      },
  };
};

const updateRoomPreview = (
  current: any,
  roomId: string,
  message: ChatMessage,
  currentUserId?: string,
) => {
  if (!current) {
    return current;
  }

  const rooms = Array.isArray(current) ? current : Array.isArray(current?.data) ? current.data : [];

  if (!Array.isArray(rooms)) {
    return current;
  }

  const updatedRooms = [...rooms];
  const roomIndex = updatedRooms.findIndex((room) => room.id === roomId);

  if (roomIndex >= 0) {
    updatedRooms[roomIndex] = {
      ...updatedRooms[roomIndex],
      lastMessage: message,
      updatedAt: message.createdAt,
      unreadCount: isMessageFromCurrentUser(message, currentUserId)
        ? 0
        : updatedRooms[roomIndex].unreadCount ?? 0,
    };
  }

  const sortedRooms = sortChatRooms(updatedRooms);
  return Array.isArray(current) ? sortedRooms : { ...current, data: sortedRooms };
};

export const useRoomMessages = (roomId?: string) => {
  const queryClient = useQueryClient();
  const { currentUser, isFallbackPolling } = useChatSocket(roomId);

  const messagesQuery = useQuery({
    queryKey: ["chat-room-messages", roomId],
    queryFn: () => getRoomMessages(roomId as string),
    enabled: Boolean(roomId),
    staleTime: 10 * 1000,
    refetchInterval: roomId && isFallbackPolling ? 4000 : false,
    refetchIntervalInBackground: true,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (payload: { text: string }) => sendRoomMessage(roomId as string, payload),
    onMutate: async (payload) => {
      if (!roomId || !currentUser) {
        return { previousMessages: [] as ChatMessage[] };
      }

      await queryClient.cancelQueries({ queryKey: ["chat-room-messages", roomId] });
      const previousMessages = queryClient.getQueryData<ChatMessage[]>(["chat-room-messages", roomId]) ?? [];

      const optimisticMessage: ChatMessage = {
        id: `temp-${Date.now()}`,
        roomId,
        text: payload.text,
        type: "TEXT",
        createdAt: new Date().toISOString(),
        senderId: currentUser.userId,
        senderRole: currentUser.role,
        sender: {
          id: currentUser.userId,
          userId: currentUser.userId,
          role: currentUser.role,
          fullName: currentUser.name,
          name: currentUser.name,
        },
        pending: true,
      };

      queryClient.setQueryData<ChatMessage[]>(
        ["chat-room-messages", roomId],
        mergeUniqueMessages([...previousMessages, optimisticMessage]),
      );

      queryClient.setQueriesData({ queryKey: ["chat-rooms"] }, (current) =>
        updateRoomPreview(current, roomId, optimisticMessage, currentUser.userId),
      );

      return { previousMessages, optimisticId: optimisticMessage.id };
    },
    onSuccess: (message, _payload, context) => {
      if (!roomId) {
        return;
      }

      const resolvedMessage = hydrateOwnMessage(message, currentUser);

      queryClient.setQueryData<ChatMessage[]>(["chat-room-messages", roomId], (current = []) =>
        mergeUniqueMessages([
          ...current.filter((item) => item.id !== context?.optimisticId),
          resolvedMessage,
        ]),
      );

      queryClient.setQueriesData({ queryKey: ["chat-rooms"] }, (current) =>
        updateRoomPreview(current, roomId, resolvedMessage, currentUser?.userId),
      );
    },
    onError: (_error, _payload, context) => {
      if (!roomId) {
        return;
      }

      queryClient.setQueryData(["chat-room-messages", roomId], context?.previousMessages ?? []);
    },
  });

  const uploadAttachmentMutation = useMutation({
    mutationFn: async (file: File) => uploadRoomAttachment(roomId as string, file),
    onSuccess: (message) => {
      if (!roomId) {
        return;
      }

      const resolvedMessage = hydrateOwnMessage(message, currentUser);

      queryClient.setQueryData<ChatMessage[]>(["chat-room-messages", roomId], (current = []) =>
        mergeUniqueMessages([...current, resolvedMessage]),
      );

      queryClient.setQueriesData({ queryKey: ["chat-rooms"] }, (current) =>
        updateRoomPreview(current, roomId, resolvedMessage, currentUser?.userId),
      );
    },
  });

  return {
    ...messagesQuery,
    messages: useMemo(() => mergeUniqueMessages(messagesQuery.data ?? []), [messagesQuery.data]),
    sendMessage: sendMessageMutation.mutateAsync,
    uploadAttachment: uploadAttachmentMutation.mutateAsync,
    isSending: sendMessageMutation.isPending,
    isUploading: uploadAttachmentMutation.isPending,
  };
};

export default useRoomMessages;
