"use client";

import { Bot, MessageSquarePlus, Loader2 } from "lucide-react";
import { cn } from "@/src/lib/utils";
import type { AIConversationSummary } from "@/src/types/ai.types";
import { Button } from "@/components/ui/button";

interface AiChatSidebarProps {
  conversations: AIConversationSummary[];
  suggestedPrompts: string[];
  mode?: "page" | "widget";
  activeConversationId: string | null;
  isFetching: boolean;
  onSelect: (id: string) => void;
  onNew: () => void;
  onSuggestedPrompt: (prompt: string) => void;
}

export default function AiChatSidebar({
  conversations,
  suggestedPrompts,
  mode = "page",
  activeConversationId,
  isFetching,
  onSelect,
  onNew,
  onSuggestedPrompt,
}: AiChatSidebarProps) {
  return (
    <aside
      className={cn(
        "pointer-events-auto flex h-full min-h-0 shrink-0 flex-col overflow-hidden border-r border-border bg-muted/30",
        mode === "widget" ? "w-44 sm:w-52 md:w-60 lg:w-72" : "w-64 lg:w-72",
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Bot className="h-4 w-4 text-primary" />
          AI Assistant
        </div>
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className="h-8 w-8"
          onClick={onNew}
          title="New conversation"
          aria-label="Start a new chat"
        >
          <MessageSquarePlus className="h-4.5 w-4.5" />
        </Button>
      </div>

      <div className="border-b border-border px-3 py-3">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          Suggested
        </p>
        <div className="flex flex-wrap gap-1.5">
          {suggestedPrompts.slice(0, 3).map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => onSuggestedPrompt(prompt)}
              className="rounded-full border border-border bg-background px-2.5 py-1 text-[11px] text-muted-foreground transition hover:bg-muted"
            >
              {prompt.length > 24 ? `${prompt.slice(0, 24)}...` : prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Recent messages (conversation history) */}
      <div className="consultedge-ai-scrollbar-native min-h-0 flex-1 overflow-y-auto">
        <div className="p-2 pt-3">
          <p className="mb-1.5 px-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Recent messages
          </p>

          {isFetching ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          ) : conversations.length === 0 ? (
            <p className="px-2 py-4 text-xs text-muted-foreground">
              No messages yet. Start chatting!
            </p>
          ) : (
            <ul className="space-y-1.5 pb-2">
              {conversations.map((conv) => (
                <li key={conv.id}>
                  <button
                    type="button"
                    onClick={() => onSelect(conv.id)}
                    title={conv.title}
                    className={cn(
                      "w-full overflow-hidden rounded-xl px-3 py-2.5 text-left transition-all hover:bg-muted",
                      conv.id === activeConversationId
                        ? "bg-cyan-50/80 ring-1 ring-cyan-200/60 dark:bg-cyan-500/10 dark:ring-cyan-400/20"
                        : "hover:bg-muted",
                    )}
                  >
                    <p className="line-clamp-1 wrap-break-word text-sm font-medium leading-5">
                      {conv.title}
                    </p>
                    <p className="mt-1 line-clamp-2 wrap-break-word text-xs leading-4 text-muted-foreground">
                      {conv.preview || "No messages yet"}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </aside>
  );
}
