"use client";

import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useChatSocket } from "@/src/hooks/useChatSocket";
import {
  getRoomMessages,
  isMessageFromCurrentUser,
  mergeUniqueMessages,
  replaceChatMessage,
  sendRoomMessage,
  sortChatRooms,
  toggleReactionLocally,
  toggleMessageReaction,
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

const replaceMessageInPreview = (current: any, roomId: string, message: ChatMessage) => {
  if (!current) {
    return current;
  }

  const rooms = Array.isArray(current) ? current : Array.isArray(current?.data) ? current.data : [];

  if (!Array.isArray(rooms)) {
    return current;
  }

  const updatedRooms = rooms.map((room) =>
    room.id === roomId && room.lastMessage?.id === message.id
      ? {
          ...room,
          lastMessage: message,
        }
      : room,
  );

  return Array.isArray(current) ? updatedRooms : { ...current, data: updatedRooms };
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

  const toggleReactionMutation = useMutation({
    mutationFn: async ({ messageId, emoji }: { messageId: string; emoji: string }) =>
      toggleMessageReaction(roomId as string, messageId, emoji),
    onSuccess: (message) => {
      if (!roomId) {
        return;
      }

      queryClient.setQueryData<ChatMessage[]>(["chat-room-messages", roomId], (current = []) =>
        replaceChatMessage(current, message),
      );

      queryClient.setQueriesData({ queryKey: ["chat-rooms"] }, (current) =>
        replaceMessageInPreview(current, roomId, message),
      );
    },
  });

  const applyOptimisticReaction = ({
    messageId,
    emoji,
  }: {
    messageId: string;
    emoji: string;
  }) => {
    if (!roomId || !currentUser) {
      return () => undefined;
    }

    const previousMessages =
      queryClient.getQueryData<ChatMessage[]>(["chat-room-messages", roomId]) ?? [];

    let optimisticMessage: ChatMessage | null = null;

    queryClient.setQueryData<ChatMessage[]>(["chat-room-messages", roomId], (current = []) =>
      current.map((message) => {
        if (message.id !== messageId) {
          return message;
        }

        optimisticMessage = toggleReactionLocally({
          message,
          emoji,
          currentUserId: currentUser.userId,
        });

        return optimisticMessage;
      }),
    );

    if (optimisticMessage) {
      queryClient.setQueriesData({ queryKey: ["chat-rooms"] }, (current) =>
        replaceMessageInPreview(current, roomId, optimisticMessage as ChatMessage),
      );
    }

    return () => {
      queryClient.setQueryData(["chat-room-messages", roomId], previousMessages);

      const previousMessage = previousMessages.find((message) => message.id === messageId);

      if (previousMessage) {
        queryClient.setQueriesData({ queryKey: ["chat-rooms"] }, (current) =>
          replaceMessageInPreview(current, roomId, previousMessage),
        );
      }
    };
  };

  return {
    data: messagesQuery.data,
    isLoading: messagesQuery.isLoading,
    isPending: messagesQuery.isPending,
    isFetching: messagesQuery.isFetching,
    isError: messagesQuery.isError,
    error: messagesQuery.error,
    refetch: messagesQuery.refetch,
    status: messagesQuery.status,
    messages: useMemo(() => mergeUniqueMessages(messagesQuery.data ?? []), [messagesQuery.data]),
    applyOptimisticReaction,
    sendMessage: sendMessageMutation.mutateAsync,
    uploadAttachment: uploadAttachmentMutation.mutateAsync,
    toggleReaction: toggleReactionMutation.mutateAsync,
    isSending: sendMessageMutation.isPending,
    isUploading: uploadAttachmentMutation.isPending,
    isTogglingReaction: toggleReactionMutation.isPending,
  };
};

export default useRoomMessages;
