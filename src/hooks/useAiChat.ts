"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import {
  aiChatSendMessage,
  aiChatListConversations,
  aiChatGetConversation,
  aiChatSetFeedback,
  aiChatOpenAIFallback,
  aiRagQuery,
  type AIRagContextItem,
  type AIRagSource,
} from "@/src/services/ai.service";
import { getUserActivitySignals } from "@/src/lib/aiPersonalization";
import type {
  AIPersistentMessage,
  AIConversationSummary,
  AIMessageFeedback,
  AIChatHistoryItem,
} from "@/src/types/ai.types";

export interface AiChatMessage extends AIPersistentMessage {
  isPending?: boolean;
  imageUrl?: string;
  imageName?: string;
  ragSources?: AIRagSource[];
  ragReasoning?: string;
  ragSuggestions?: string[];
}

type LocalConversationRecord = {
  conversation: AIConversationSummary;
  messages: AiChatMessage[];
};

const LOCAL_CACHE_KEY = "consultedge-ai-chat:local-conversations";
const LOCAL_RECENT_KEY = "consultedge-ai-chat:recent-searches";
const MAX_RECENT_SEARCHES = 8;
const MAX_HISTORY_MESSAGES = 10;
const RAG_NO_MATCH_ANSWER = "No matching data found in the system.";

export const AI_SUGGESTED_PROMPTS = [
  "Find a marketing expert for my startup",
  "How do I book a consultation in ConsultEdge?",
  "Show me the fastest way to schedule a session",
  "Help me choose between strategy and finance experts",
  "What should I ask in my first consultation call?",
];

const createLocalId = () =>
  `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const createDraftId = () =>
  `draft-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const sortConversations = (items: AIConversationSummary[]) =>
  [...items].sort(
    (a, b) =>
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );

const readLocalCache = (): Record<string, LocalConversationRecord> => {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const raw = window.localStorage.getItem(LOCAL_CACHE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, LocalConversationRecord>;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
};

const writeLocalCache = (cache: Record<string, LocalConversationRecord>) => {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(LOCAL_CACHE_KEY, JSON.stringify(cache));
};

const readRecentSearches = (): string[] => {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(LOCAL_RECENT_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as string[];
    return Array.isArray(parsed) ? parsed.filter(Boolean).slice(0, MAX_RECENT_SEARCHES) : [];
  } catch {
    return [];
  }
};

const writeRecentSearches = (items: string[]) => {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(LOCAL_RECENT_KEY, JSON.stringify(items.slice(0, MAX_RECENT_SEARCHES)));
};

const toHistory = (messages: AiChatMessage[], userInput: string): AIChatHistoryItem[] => {
  const mapped = messages
    .filter((m) => !m.isPending && (m.role === "user" || m.role === "assistant"))
    .slice(-MAX_HISTORY_MESSAGES)
    .map((m) => ({ role: m.role, content: m.content }));

  return [...mapped, { role: "user", content: userInput }].slice(-MAX_HISTORY_MESSAGES);
};

const toLocalConversationList = (
  cache: Record<string, LocalConversationRecord>,
): AIConversationSummary[] =>
  sortConversations(Object.values(cache).map((entry) => entry.conversation));

const normalizePrompt = (value: string) =>
  value
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^[-•*\d.\s]+/, "")
    .slice(0, 90);

const dedupePrompts = (items: string[]) => {
  const seen = new Set<string>();

  return items
    .map(normalizePrompt)
    .filter((item) => {
      if (!item || item.length < 8) return false;
      const key = item.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
};

const buildRagContext = ({
  signals,
  recentSearches,
  conversations,
  latestMessage,
}: {
  signals: ReturnType<typeof getUserActivitySignals>;
  recentSearches: string[];
  conversations: AIConversationSummary[];
  latestMessage?: string;
}): AIRagContextItem[] => {
  const items: AIRagContextItem[] = [];

  recentSearches.slice(0, 6).forEach((query, index) => {
    items.push({
      source_id: `chat-search-${index + 1}`,
      content: `Recent user query: ${query}`,
      metadata: { type: "search" },
    });
  });

  signals.searchHistory.slice(0, 6).forEach((query, index) => {
    items.push({
      source_id: `behavior-search-${index + 1}`,
      content: `Behavior signal search intent: ${query}`,
      metadata: { type: "behavior_search" },
    });
  });

  signals.clickedCategories.slice(0, 5).forEach((category, index) => {
    items.push({
      source_id: `behavior-category-${index + 1}`,
      content: `Preferred category: ${category}`,
      metadata: { type: "category" },
    });
  });

  signals.exploredIndustries.slice(0, 5).forEach((industry, index) => {
    items.push({
      source_id: `behavior-industry-${index + 1}`,
      content: `Explored industry: ${industry}`,
      metadata: { type: "industry" },
    });
  });

  conversations.slice(0, 5).forEach((conversation, index) => {
    items.push({
      source_id: `chat-conversation-${index + 1}`,
      content: `Conversation title: ${conversation.title}. Preview: ${conversation.preview || "No preview"}`,
      metadata: { type: "conversation" },
    });
  });

  if (latestMessage?.trim()) {
    items.push({
      source_id: "chat-latest-message",
      content: `Latest message in chat: ${latestMessage.trim()}`,
      metadata: { type: "latest_message" },
    });
  }

  return items.slice(0, 50);
};

const buildPersonalizedFallbackPrompts = ({
  signals,
  recentSearches,
}: {
  signals: ReturnType<typeof getUserActivitySignals>;
  recentSearches: string[];
}) => {
  const prompts: string[] = [];

  if (recentSearches[0]) {
    prompts.push(`Find top experts related to ${recentSearches[0]}`);
  }

  if (signals.clickedCategories[0]) {
    prompts.push(`Show consultants for ${signals.clickedCategories[0]}`);
  }

  if (signals.searchHistory[0]) {
    prompts.push(`Give me a shortlist based on ${signals.searchHistory[0]}`);
  }

  prompts.push("Suggest 3 experts I can book this week");
  prompts.push("Compare two experts by experience and pricing");

  return dedupePrompts(prompts).slice(0, 4);
};

export function useAiChat(chatContext: "dashboard" | "homepage" = "dashboard") {
  const [conversations, setConversations] = useState<AIConversationSummary[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<AiChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingConversations, setIsFetchingConversations] = useState(false);
  const [isFetchingMessages, setIsFetchingMessages] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [suggestedPrompts, setSuggestedPrompts] = useState<string[]>(AI_SUGGESTED_PROMPTS);
  const [behaviorRevision, setBehaviorRevision] = useState(0);

  const optimisticIdRef = useRef(0);
  const localCacheRef = useRef<Record<string, LocalConversationRecord>>({});

  const createOptimisticId = () => `optimistic-${++optimisticIdRef.current}`;

  const syncConversationList = useCallback((serverItems: AIConversationSummary[]) => {
    const localItems = toLocalConversationList(localCacheRef.current);
    const merged = new Map<string, AIConversationSummary>();

    localItems.forEach((item) => merged.set(item.id, item));
    serverItems.forEach((item) => merged.set(item.id, item));

    setConversations(sortConversations(Array.from(merged.values())));
  }, []);

  const upsertLocalConversation = useCallback(
    (conversation: AIConversationSummary, nextMessages: AiChatMessage[]) => {
      localCacheRef.current = {
        ...localCacheRef.current,
        [conversation.id]: {
          conversation,
          messages: nextMessages,
        },
      };

      writeLocalCache(localCacheRef.current);
      syncConversationList(conversations);
    },
    [conversations, syncConversationList],
  );

  const rememberSearch = useCallback((query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;

    setRecentSearches((prev) => {
      const next = [trimmed, ...prev.filter((item) => item !== trimmed)].slice(0, MAX_RECENT_SEARCHES);
      writeRecentSearches(next);
      return next;
    });
  }, []);

  useEffect(() => {
    localCacheRef.current = readLocalCache();
    setRecentSearches(readRecentSearches());

    const onBehaviorUpdated = () => {
      setBehaviorRevision((prev) => prev + 1);
    };

    window.addEventListener("consultedge:behavior-updated", onBehaviorUpdated);

    return () => {
      window.removeEventListener("consultedge:behavior-updated", onBehaviorUpdated);
    };
  }, []);

  const fetchConversations = useCallback(async () => {
    setIsFetchingConversations(true);
    try {
      const data = await aiChatListConversations();
      syncConversationList(data);
    } catch {
      setConversations(toLocalConversationList(localCacheRef.current));
    } finally {
      setIsFetchingConversations(false);
    }
  }, [syncConversationList]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    let isCancelled = false;

    const updatePrompts = async () => {
      const signals = getUserActivitySignals();
      const latestMessage = messages[messages.length - 1]?.content;
      const ragContext = buildRagContext({
        signals,
        recentSearches,
        conversations,
        latestMessage,
      });

      if (ragContext.length === 0) {
        setSuggestedPrompts(AI_SUGGESTED_PROMPTS);
        return;
      }

      const ragQuery = [
        "Generate short, user-specific suggested prompts for a consulting marketplace AI assistant.",
        "Use the provided context and return practical prompts users can click next.",
        "Each suggestion should be concise and actionable.",
      ].join(" ");

      const result = await aiRagQuery({
        query: ragQuery,
        topK: 6,
        context: ragContext,
      });

      if (isCancelled) {
        return;
      }

      const ragSuggestions =
        result.data.answer === RAG_NO_MATCH_ANSWER
          ? []
          : dedupePrompts(Array.isArray(result.data.suggestions) ? result.data.suggestions : []);

      const personalizedFallback = buildPersonalizedFallbackPrompts({
        signals,
        recentSearches,
      });

      const nextPrompts = dedupePrompts([
        ...ragSuggestions,
        ...personalizedFallback,
        ...AI_SUGGESTED_PROMPTS,
      ]).slice(0, 6);

      setSuggestedPrompts(nextPrompts.length ? nextPrompts : AI_SUGGESTED_PROMPTS);
    };

    void updatePrompts();

    return () => {
      isCancelled = true;
    };
  }, [behaviorRevision, chatContext, conversations, messages, recentSearches]);

  const openConversation = useCallback(
    async (conversationId: string) => {
      if (conversationId === activeConversationId) return;

      setActiveConversationId(conversationId);
      setMessages([]);

      // Local and draft conversations should never hit the backend endpoint.
      if (
        conversationId.startsWith("local-") ||
        conversationId.startsWith("draft-")
      ) {
        const localMatch = localCacheRef.current[conversationId];
        setMessages(localMatch?.messages ?? []);
        setIsFetchingMessages(false);
        return;
      }

      setIsFetchingMessages(true);

      try {
        const detail = await aiChatGetConversation(conversationId);
        const serverMessages = detail.messages as AiChatMessage[];
        setMessages(serverMessages);

        const summary: AIConversationSummary = {
          id: detail.id,
          title: detail.title,
          preview: serverMessages[serverMessages.length - 1]?.content.slice(0, 120) || "",
          lastMessageRole:
            serverMessages[serverMessages.length - 1]?.role === "assistant" ? "assistant" : "user",
          lastMessageAt:
            serverMessages[serverMessages.length - 1]?.createdAt || detail.updatedAt,
          messageCount: serverMessages.length,
          createdAt: detail.createdAt,
          updatedAt: detail.updatedAt,
        };

        upsertLocalConversation(summary, serverMessages);
      } catch (error: unknown) {
        const status =
          typeof error === "object" && error !== null && "response" in error
            ? (error as { response?: { status?: number } }).response?.status
            : undefined;

        if (status === 404) {
          // Conversation no longer exists on backend; remove stale entry and avoid toast spam.
          setConversations((prev) => prev.filter((item) => item.id !== conversationId));

          if (localCacheRef.current[conversationId]) {
            const nextCache = { ...localCacheRef.current };
            delete nextCache[conversationId];
            localCacheRef.current = nextCache;
            writeLocalCache(nextCache);
          }

          setActiveConversationId((prev) =>
            prev === conversationId ? null : prev,
          );
          setMessages([]);
          return;
        }

        const localMatch = localCacheRef.current[conversationId];
        if (localMatch) {
          setMessages(localMatch.messages);
        } else {
          toast.error("Failed to load conversation.");
        }
      } finally {
        setIsFetchingMessages(false);
      }
    },
    [activeConversationId, upsertLocalConversation],
  );

  const newConversation = useCallback(() => {
    const now = new Date().toISOString();
    const draftId = createDraftId();

    const draftConversation: AIConversationSummary = {
      id: draftId,
      title: "New chat",
      preview: "",
      lastMessageRole: "assistant",
      lastMessageAt: now,
      messageCount: 0,
      createdAt: now,
      updatedAt: now,
    };

    setActiveConversationId(draftId);
    setMessages([]);
    upsertLocalConversation(draftConversation, []);
  }, [upsertLocalConversation]);

  const sendMessage = useCallback(
    async (
      content: string,
      options?: {
        imageFile?: File | null;
      },
    ) => {
      const trimmed = content.trim();
      const imageFile = options?.imageFile ?? null;
      const hasImage = Boolean(imageFile);
      const imagePreviewUrl = imageFile ? URL.createObjectURL(imageFile) : undefined;

      if ((!trimmed && !hasImage) || isLoading) return;

      const messageForAI = hasImage
        ? `${trimmed || "Please help me with this image."}\n\n[User shared an image: ${imageFile?.name || "image"}]`
        : trimmed;

      if (trimmed) {
        rememberSearch(trimmed);
      }

      const optimisticUserMsg: AiChatMessage = {
        id: createOptimisticId(),
        role: "user",
        content: trimmed || (imageFile?.name ? `Shared image: ${imageFile.name}` : "Shared an image"),
        feedback: null,
        model: null,
        provider: null,
        tokensUsed: 0,
        latencyMs: 0,
        createdAt: new Date().toISOString(),
        isPending: true,
        ...(imagePreviewUrl ? { imageUrl: imagePreviewUrl, imageName: imageFile?.name || "image" } : {}),
      };

      setMessages((prev) => [...prev, optimisticUserMsg]);
      setIsLoading(true);

      try {
        const result = await aiChatSendMessage({
          message: messageForAI,
          context: chatContext,
          conversationId:
            activeConversationId &&
            !activeConversationId.startsWith("draft-") &&
            !activeConversationId.startsWith("local-")
              ? activeConversationId
              : undefined,
        });

        const nextMessages = [
          ...messages,
          { ...result.userMessage, isPending: false },
          { ...result.assistantMessage, isPending: false },
        ];

        setMessages((prev) => {
          const withoutOptimistic = prev.filter((m) => m.id !== optimisticUserMsg.id);
          return [
            ...withoutOptimistic,
            { ...result.userMessage, isPending: false },
            { ...result.assistantMessage, isPending: false },
          ];
        });

        const newConvId = result.conversation.id;
        if (newConvId !== activeConversationId) {
          setActiveConversationId(newConvId);
        }

        const conversationSummary: AIConversationSummary = {
          id: result.conversation.id,
          title: result.conversation.title,
          preview: result.assistantMessage.content.slice(0, 120),
          lastMessageRole: "assistant",
          lastMessageAt: result.assistantMessage.createdAt,
          messageCount: nextMessages.length,
          createdAt: result.conversation.createdAt,
          updatedAt: result.conversation.updatedAt,
        };

        upsertLocalConversation(conversationSummary, nextMessages);
        syncConversationList(conversations);

        // Background RAG enrichment — attach sources/reasoning/suggestions to the
        // assistant message without blocking the main send flow.
        if (trimmed) {
          const assistantMsgId = result.assistantMessage.id;
          const signals = getUserActivitySignals();
          const ragContext = buildRagContext({
            signals,
            recentSearches,
            conversations,
            latestMessage: result.assistantMessage.content.slice(0, 400),
          });

          void aiRagQuery({ query: trimmed, topK: 6, context: ragContext }).then(
            (ragResult) => {
              if (ragResult.data.answer === RAG_NO_MATCH_ANSWER) return;
              const hasSources =
                Array.isArray(ragResult.data.sources) && ragResult.data.sources.length > 0;
              const hasSuggestions =
                Array.isArray(ragResult.data.suggestions) && ragResult.data.suggestions.length > 0;
              const hasReasoning = Boolean(ragResult.data.reasoning?.trim());
              if (!hasSources && !hasSuggestions && !hasReasoning) return;

              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantMsgId
                    ? {
                        ...m,
                        ...(hasSources ? { ragSources: ragResult.data.sources } : {}),
                        ...(hasReasoning ? { ragReasoning: ragResult.data.reasoning } : {}),
                        ...(hasSuggestions
                          ? { ragSuggestions: ragResult.data.suggestions.slice(0, 5) }
                          : {}),
                      }
                    : m,
                ),
              );
            },
          );
        }
      } catch {
        try {
          const fallback = await aiChatOpenAIFallback({
            message: messageForAI,
            context: chatContext,
            history: toHistory(messages, messageForAI),
          });

          const now = new Date().toISOString();
          const resolvedConversationId = activeConversationId ?? createLocalId();

          const persistedUserMessage: AiChatMessage = {
            id: createLocalId(),
            role: "user",
            content: trimmed || (imageFile?.name ? `Shared image: ${imageFile.name}` : "Shared an image"),
            feedback: null,
            model: null,
            provider: null,
            tokensUsed: 0,
            latencyMs: 0,
            createdAt: now,
            ...(imagePreviewUrl ? { imageUrl: imagePreviewUrl, imageName: imageFile?.name || "image" } : {}),
          };

          const persistedAssistantMessage: AiChatMessage = {
            id: createLocalId(),
            role: "assistant",
            content: fallback.reply,
            feedback: null,
            model: fallback.model ?? "gpt-4o-mini",
            provider: fallback.provider ?? "openai",
            tokensUsed: 0,
            latencyMs: 0,
            createdAt: fallback.timestamp ?? new Date().toISOString(),
          };

          const nextMessages = [...messages, persistedUserMessage, persistedAssistantMessage];

          setMessages((prev) => {
            const withoutOptimistic = prev.filter((m) => m.id !== optimisticUserMsg.id);
            return [...withoutOptimistic, persistedUserMessage, persistedAssistantMessage];
          });

          setActiveConversationId(resolvedConversationId);

          const existingSummary = conversations.find((item) => item.id === resolvedConversationId);
          const conversationSummary: AIConversationSummary = {
            id: resolvedConversationId,
            title: existingSummary?.title || (trimmed || "Image shared").slice(0, 60),
            preview: persistedAssistantMessage.content.slice(0, 120),
            lastMessageRole: "assistant",
            lastMessageAt: persistedAssistantMessage.createdAt,
            messageCount: nextMessages.length,
            createdAt: existingSummary?.createdAt || now,
            updatedAt: now,
          };

          upsertLocalConversation(conversationSummary, nextMessages);
          syncConversationList(conversations);
          if (fallback.provider === "local-fallback") {
            toast.message("AI backend unavailable. Using local fallback mode.");
          }
        } catch {
          const now = new Date().toISOString();
          const resolvedConversationId = activeConversationId ?? createLocalId();

          const persistedUserMessage: AiChatMessage = {
            id: createLocalId(),
            role: "user",
            content: trimmed || (imageFile?.name ? `Shared image: ${imageFile.name}` : "Shared an image"),
            feedback: null,
            model: null,
            provider: null,
            tokensUsed: 0,
            latencyMs: 0,
            createdAt: now,
            ...(imagePreviewUrl ? { imageUrl: imagePreviewUrl, imageName: imageFile?.name || "image" } : {}),
          };

          const persistedAssistantMessage: AiChatMessage = {
            id: createLocalId(),
            role: "assistant",
            content:
              "I could not reach AI services right now, but I can still help. Share your goal, timeline, and budget and I will suggest the next best step.",
            feedback: null,
            model: "heuristic",
            provider: "local-fallback",
            tokensUsed: 0,
            latencyMs: 0,
            createdAt: now,
          };

          const nextMessages = [...messages, persistedUserMessage, persistedAssistantMessage];

          setMessages((prev) => {
            const withoutOptimistic = prev.filter((m) => m.id !== optimisticUserMsg.id);
            return [...withoutOptimistic, persistedUserMessage, persistedAssistantMessage];
          });

          setActiveConversationId(resolvedConversationId);

          const existingSummary = conversations.find((item) => item.id === resolvedConversationId);
          const conversationSummary: AIConversationSummary = {
            id: resolvedConversationId,
            title: existingSummary?.title || (trimmed || "Image shared").slice(0, 60),
            preview: persistedAssistantMessage.content.slice(0, 120),
            lastMessageRole: "assistant",
            lastMessageAt: persistedAssistantMessage.createdAt,
            messageCount: nextMessages.length,
            createdAt: existingSummary?.createdAt || now,
            updatedAt: now,
          };

          upsertLocalConversation(conversationSummary, nextMessages);
          syncConversationList(conversations);
          toast.error("AI service is temporarily unavailable. Responding in local fallback mode.");
        }
      } finally {
        setIsLoading(false);
      }
    },
    [
      activeConversationId,
      chatContext,
      conversations,
      isLoading,
      messages,
      rememberSearch,
      syncConversationList,
      upsertLocalConversation,
    ],
  );

  const setFeedback = useCallback(
    async (messageId: string, feedback: AIMessageFeedback) => {
      if (!activeConversationId) {
        return;
      }

      const previousFeedback = messages.find((m) => m.id === messageId)?.feedback ?? null;
      const nextFeedback = previousFeedback === feedback ? null : feedback;

      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId
            ? { ...m, feedback: nextFeedback }
            : m,
        ),
      );

      const localMatch = localCacheRef.current[activeConversationId];
      if (localMatch) {
        const updatedMessages = localMatch.messages.map((m) =>
          m.id === messageId ? { ...m, feedback: nextFeedback } : m,
        );
        upsertLocalConversation(localMatch.conversation, updatedMessages);
      }

      if (
        activeConversationId.startsWith("local-") ||
        activeConversationId.startsWith("draft-")
      ) {
        return;
      }

      try {
        await aiChatSetFeedback(activeConversationId, messageId, nextFeedback);
      } catch {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === messageId
              ? { ...m, feedback: previousFeedback }
              : m,
          ),
        );

        if (localMatch) {
          const revertedMessages = localMatch.messages.map((m) =>
            m.id === messageId ? { ...m, feedback: previousFeedback } : m,
          );
          upsertLocalConversation(localMatch.conversation, revertedMessages);
        }

        toast.error("Could not save feedback right now.");
      }
    },
    [activeConversationId, messages, upsertLocalConversation],
  );

  const refineDislikedMessage = useCallback(
    async ({
      messageId,
      improveReason,
      expectedResponse,
    }: {
      messageId: string;
      improveReason: string;
      expectedResponse: string;
    }) => {
      const target = messages.find((m) => m.id === messageId);
      if (!target || target.role !== "assistant") {
        return false;
      }

      const improvementPrompt = [
        "Improve the following assistant response based on user feedback.",
        `Original response: ${target.content}`,
        `What to improve: ${improveReason || "Not provided"}`,
        `Expected response: ${expectedResponse || "Not provided"}`,
        "Return only the improved response.",
      ].join("\n");

      const refined = await aiChatOpenAIFallback({
        context: chatContext,
        message: improvementPrompt,
        history: toHistory(messages, improvementPrompt),
      });

      const refinedContent = refined.reply?.trim();
      if (!refinedContent) {
        return false;
      }

      const updatedAt = new Date().toISOString();

      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId
            ? {
                ...m,
                content: refinedContent,
                feedback: null,
                model: refined.model ?? m.model,
                provider: refined.provider ?? m.provider,
                createdAt: refined.timestamp ?? m.createdAt,
              }
            : m,
        ),
      );

      if (activeConversationId) {
        const localMatch = localCacheRef.current[activeConversationId];
        if (localMatch) {
          const updatedMessages = localMatch.messages.map((m) =>
            m.id === messageId
              ? {
                  ...m,
                  content: refinedContent,
                  feedback: null,
                  model: refined.model ?? m.model,
                  provider: refined.provider ?? m.provider,
                  createdAt: refined.timestamp ?? m.createdAt,
                }
              : m,
          );

          const lastMessage = updatedMessages[updatedMessages.length - 1];
          const updatedConversation: AIConversationSummary = {
            ...localMatch.conversation,
            preview: (lastMessage?.content || localMatch.conversation.preview).slice(0, 120),
            lastMessageRole: lastMessage?.role || localMatch.conversation.lastMessageRole,
            lastMessageAt: lastMessage?.createdAt || localMatch.conversation.lastMessageAt,
            messageCount: updatedMessages.length,
            updatedAt,
          };

          upsertLocalConversation(updatedConversation, updatedMessages);
        }
      }

      return true;
    },
    [activeConversationId, chatContext, messages, upsertLocalConversation],
  );

  return {
    conversations,
    recentSearches,
    suggestedPrompts,
    activeConversationId,
    messages,
    isLoading,
    isFetchingConversations,
    isFetchingMessages,
    sendMessage,
    openConversation,
    newConversation,
    setFeedback,
    refineDislikedMessage,
    refreshConversations: fetchConversations,
  };
}
