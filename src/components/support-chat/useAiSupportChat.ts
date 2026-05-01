"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import type {
  QuickActionChip,
  SupportChatContext,
  SupportChatMessage,
  SupportHistoryItem,
} from "./types";
import {
  SUPPORT_QUICK_ACTIONS,
} from "./types";
import { aiSupport } from "@/src/services/ai.service";

const STORAGE_KEY = "consultedge-support-chat:messages";
const OPEN_KEY = "consultedge-support-chat:open";
const MAX_HISTORY_ITEMS = 8;

const createId = () =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

const createWelcomeMessage = (): SupportChatMessage => ({
  id: "support-welcome",
  role: "assistant",
  content: "Hi there! 👋 How can I help you today? I can assist with finding experts, booking consultations, payments, or your account.",
  createdAt: new Date().toISOString(),
});

const toHistory = (messages: SupportChatMessage[]): SupportHistoryItem[] =>
  messages
    .filter((item) => !item.isError)
    .slice(-MAX_HISTORY_ITEMS)
    .map((item) => ({
      role: item.role,
      content: item.content,
    }));

export function useAiSupportChat(initialContext: SupportChatContext = "homepage") {
  const [messages, setMessages] = useState<SupportChatMessage[]>([createWelcomeMessage()]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [context, setContext] = useState<SupportChatContext>(initialContext);
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      const savedMessages = window.localStorage.getItem(STORAGE_KEY);
      const savedOpenState = window.localStorage.getItem(OPEN_KEY);

      if (savedMessages) {
        const parsed = JSON.parse(savedMessages) as SupportChatMessage[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
        }
      }

      if (savedOpenState === "true") {
        setIsOpen(true);
      }
    } catch {
      // ignore localStorage hydration errors
    } finally {
      setHasHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !hasHydrated) {
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }, [hasHydrated, messages]);

  useEffect(() => {
    if (typeof window === "undefined" || !hasHydrated) {
      return;
    }

    window.localStorage.setItem(OPEN_KEY, String(isOpen));
  }, [hasHydrated, isOpen]);
  const sendMessage = useCallback(
    async (content: string, nextContext?: SupportChatContext) => {
      const trimmed = content.trim();

      if (!trimmed || isLoading) {
        return;
      }

      const resolvedContext = nextContext ?? context;
      const history = toHistory(messages);
      const userMessage: SupportChatMessage = {
        id: createId(),
        role: "user",
        content: trimmed,
        createdAt: new Date().toISOString(),
      };

      setMessages((current) => [...current, userMessage]);
      setError(null);
      setContext(resolvedContext);
      setIsLoading(true);

      // Try the on-device FAQ heuristics first — they handle the most common
      // questions without a network round-trip. Only fall through to the
      // backend when no rule matches with sufficient confidence.
      // Heuristic FAQ matcher removed in favour of the backend `/ai/support`
      // endpoint which now owns the routing. We still keep a safety fallback
      // for offline / 5xx scenarios via aiSupport's graceful error path.

      try {
        const { data, error } = await aiSupport({
          message: trimmed,
          context: resolvedContext,
          history,
        });

        if (error) {
          throw new Error(error.message);
        }

        const assistantMessage: SupportChatMessage = {
          id: createId(),
          role: "assistant",
          content: data?.reply || "Ask me about booking, experts, payments, or support.",
          createdAt: data?.timestamp || new Date().toISOString(),
          suggestedActions: data?.suggestedActions ?? [],
          escalatedToHuman: Boolean(data?.escalatedToHuman),
        };

        setMessages((current) => [...current, assistantMessage]);
      } catch (caughtError) {
        const message =
          caughtError instanceof Error
            ? caughtError.message
            : "Support is unavailable right now. Please try again.";

        setError(message);
        setMessages((current) => [
          ...current,
          {
            id: createId(),
            role: "assistant",
            content: "I couldn’t connect. Please try again or contact support.",
            createdAt: new Date().toISOString(),
            escalatedToHuman: true,
            isError: true,
          },
        ]);
        toast.error("AI support is unavailable right now.");
      } finally {
        setIsLoading(false);
      }
    },
    [context, isLoading, messages],
  );

  const sendQuickAction = useCallback(
    async (action: QuickActionChip) => {
      await sendMessage(action.prompt, action.context);
    },
    [sendMessage],
  );

  const resetConversation = useCallback(() => {
    setMessages([createWelcomeMessage()]);
    setError(null);
    setContext(initialContext);
  }, [initialContext]);

  return {
    messages,
    isLoading,
    error,
    isOpen,
    setIsOpen,
    context,
    setContext,
    quickActions: useMemo(() => SUPPORT_QUICK_ACTIONS, []),
    sendMessage,
    sendQuickAction,
    resetConversation,
  };
}

export default useAiSupportChat;