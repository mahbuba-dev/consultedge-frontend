"use client";

import { useChatSocketContext } from "@/src/providers/ChatSocketProvider";

export const useChatSocket = (_roomId?: string) => {
  const context = useChatSocketContext();
  const { socket } = context;

  return {
    ...context,
    emit: (event: string, payload?: unknown) => {
      socket?.emit(event, payload);
    },
  };
};

export default useChatSocket;
