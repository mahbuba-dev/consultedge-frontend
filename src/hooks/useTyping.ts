"use client";

import { useEffect, useMemo, useRef } from "react";

import { useChatSocket } from "@/src/hooks/useChatSocket";

export const useTyping = (roomId?: string) => {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { currentUser, typingState, emit } = useChatSocket(roomId);

  const typingUsers = useMemo(() => {
    const roomEntries = roomId ? typingState[roomId] ?? [] : [];

    return roomEntries.filter((entry) => entry.userId !== currentUser?.userId && entry.isTyping);
  }, [currentUser?.userId, roomId, typingState]);

  const sendTyping = (isTyping: boolean) => {
    if (!roomId || !currentUser) {
      return;
    }

    emit("typing", {
      roomId,
      userId: currentUser.userId,
      name: currentUser.name,
      isTyping,
    });
  };

  const triggerTyping = () => {
    sendTyping(true);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      sendTyping(false);
    }, 1200);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      sendTyping(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    typingUsers,
    isSomeoneTyping: typingUsers.length > 0,
    triggerTyping,
    stopTyping: () => sendTyping(false),
  };
};

export default useTyping;
