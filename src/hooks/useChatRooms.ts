"use client";

import { useMemo } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";

import {
  findOrCreateRoomForExpert,
  getChatRooms,
  sortChatRooms,
} from "@/src/services/chatRoom.service";

export const useChatRooms = (params?: {
  participantId?: string;
  expertId?: string;
  clientId?: string;
}) => {
  const queryScope = params?.participantId ?? params?.expertId ?? params?.clientId ?? "all";

  const roomsQuery = useQuery({
    queryKey: ["chat-rooms", queryScope],
    queryFn: () => getChatRooms(params),
    staleTime: 30 * 1000,
  });

  const ensureRoomMutation = useMutation({
    mutationFn: (participantId: string) => findOrCreateRoomForExpert(participantId),
  });

  const rooms = useMemo(() => sortChatRooms(roomsQuery.data ?? []), [roomsQuery.data]);

  return {
    ...roomsQuery,
    rooms,
    ensureRoom: ensureRoomMutation.mutateAsync,
    isCreatingRoom: ensureRoomMutation.isPending,
  };
};

export default useChatRooms;
