"use client";

import { useChatSocketContext } from "@/src/providers/ChatSocketProvider";

export const useChatSocket = (_roomId?: string) => {
  const context = useChatSocketContext();

  return {
    ...context,
    emit: (event: string, payload?: unknown) => {
      context.emit(event, payload);
    },
  };
};

export default useChatSocket;
