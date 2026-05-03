"use client";

import { useState } from "react";
import { Check, ChevronDown, Copy, FileSearch, Lightbulb, ThumbsDown, ThumbsUp } from "lucide-react";
import { cn } from "@/src/lib/utils";
import type { AiChatMessage } from "@/src/hooks/useAiChat";
import type { AIMessageFeedback } from "@/src/types/ai.types";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface AiMessageBubbleProps {
  message: AiChatMessage;
  onFeedback: (messageId: string, feedback: AIMessageFeedback) => void;
  onSuggestionClick?: (prompt: string) => void;
  mode?: "page" | "widget";
}

export default function AiMessageBubble({
  message,
  onFeedback,
  onSuggestionClick,
  mode = "page",
}: AiMessageBubbleProps) {
  const isUser = message.role === "user";
  const [copied, setCopied] = useState(false);
  const [sourcesOpen, setSourcesOpen] = useState(false);
  const [reasoningOpen, setReasoningOpen] = useState(false);
  const actionsAlwaysVisible = mode === "widget";

  const hasSources = Array.isArray(message.ragSources) && message.ragSources.length > 0;
  const hasReasoning = Boolean(message.ragReasoning?.trim());
  const hasSuggestions = Array.isArray(message.ragSuggestions) && message.ragSuggestions.length > 0;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <div className={cn("group flex gap-3", isUser ? "flex-row-reverse" : "flex-row")}>
      {/* Avatar dot */}
      <div
        className={cn(
          "mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-muted-foreground border border-border",
        )}
      >
        {isUser ? "U" : "AI"}
      </div>

      <div className={cn("flex max-w-[78%] flex-col gap-1", isUser ? "items-end" : "items-start")}>
        {/* Bubble */}
        <div
          className={cn(
            "rounded-2xl border px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap wrap-break-word shadow-sm backdrop-blur-md",
            isUser
              ? "rounded-tr-sm border-cyan-300/50 bg-linear-to-br from-cyan-500/90 to-blue-600/90 text-white"
              : "rounded-tl-sm border-cyan-200/45 bg-white/70 text-foreground dark:border-cyan-300/15 dark:bg-slate-900/45",
            message.isPending && "opacity-60",
          )}
        >
          {message.imageUrl && (
            <a href={message.imageUrl} target="_blank" rel="noopener noreferrer" className="mb-2 block">
              <img
                src={message.imageUrl}
                alt={message.imageName || "shared image"}
                className="max-h-44 w-full rounded-lg object-cover"
              />
            </a>
          )}
          {message.content}
        </div>

        {/* RAG Sources — collapsible */}
        {!isUser && hasSources && (
          <div className="mt-1 w-full max-w-full overflow-hidden rounded-xl border border-cyan-200/40 bg-cyan-50/60 text-xs dark:border-cyan-300/15 dark:bg-cyan-950/20">
            <button
              type="button"
              onClick={() => setSourcesOpen((o) => !o)}
              className="flex w-full items-center gap-1.5 px-3 py-2 text-left font-medium text-cyan-800 transition hover:bg-cyan-100/60 dark:text-cyan-200 dark:hover:bg-cyan-900/30"
            >
              <FileSearch className="h-3.5 w-3.5 shrink-0" />
              <span>{message.ragSources!.length} source{message.ragSources!.length > 1 ? "s" : ""} retrieved</span>
              <ChevronDown
                className={cn(
                  "ml-auto h-3.5 w-3.5 shrink-0 transition-transform duration-200",
                  sourcesOpen && "rotate-180",
                )}
              />
            </button>
            {sourcesOpen && (
              <ul className="divide-y divide-cyan-100/60 px-3 pb-2 dark:divide-cyan-300/10">
                {message.ragSources!.map((src) => (
                  <li key={src.source_id} className="py-2">
                    <span className="mr-1.5 inline-block rounded-full bg-cyan-200/70 px-1.5 py-0.5 font-mono text-[10px] text-cyan-700 dark:bg-cyan-800/40 dark:text-cyan-300">
                      {src.source_id}
                    </span>
                    <span className="text-muted-foreground">{src.evidence}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* RAG Reasoning — collapsible */}
        {!isUser && hasReasoning && (
          <div className="mt-1 w-full max-w-full overflow-hidden rounded-xl border border-blue-200/40 bg-blue-50/50 text-xs dark:border-blue-300/15 dark:bg-blue-950/20">
            <button
              type="button"
              onClick={() => setReasoningOpen((o) => !o)}
              className="flex w-full items-center gap-1.5 px-3 py-2 text-left font-medium text-blue-800 transition hover:bg-blue-100/60 dark:text-blue-200 dark:hover:bg-blue-900/30"
            >
              <Lightbulb className="h-3.5 w-3.5 shrink-0" />
              <span>How I know this</span>
              <ChevronDown
                className={cn(
                  "ml-auto h-3.5 w-3.5 shrink-0 transition-transform duration-200",
                  reasoningOpen && "rotate-180",
                )}
              />
            </button>
            {reasoningOpen && (
              <p className="px-3 pb-3 leading-relaxed text-muted-foreground">
                {message.ragReasoning}
              </p>
            )}
          </div>
        )}

        {/* RAG Follow-up suggestions */}
        {!isUser && hasSuggestions && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {message.ragSuggestions!.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => onSuggestionClick?.(prompt)}
                className="rounded-full border border-cyan-200/60 bg-white/80 px-2.5 py-1 text-[11px] text-cyan-800 transition hover:border-cyan-400/60 hover:bg-cyan-50 dark:border-cyan-300/20 dark:bg-slate-900/60 dark:text-cyan-200 dark:hover:bg-cyan-900/30"
              >
                {prompt.length > 55 ? `${prompt.slice(0, 55)}…` : prompt}
              </button>
            ))}
          </div>
        )}

        {/* Actions — only for assistant messages */}
        {!isUser && !message.isPending && (
          <TooltipProvider delayDuration={300}>
            <div
              className={cn(
                "flex items-center gap-1 transition-opacity",
                actionsAlwaysVisible ? "opacity-100" : "opacity-0 group-hover:opacity-100",
              )}
            >
              {/* Copy */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6"
                    onClick={handleCopy}
                  >
                    {copied ? (
                      <Check className="h-3.5 w-3.5 text-green-500" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  {copied ? "Copied!" : "Copy response"}
                </TooltipContent>
              </Tooltip>

              {/* Like */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    variant="ghost"
                    className={cn(
                      "h-6 w-6",
                      message.feedback === "LIKE" && "text-green-500",
                    )}
                    onClick={() => onFeedback(message.id, "LIKE")}
                  >
                    <ThumbsUp className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  {message.feedback === "LIKE" ? "Remove like" : "Good response"}
                </TooltipContent>
              </Tooltip>

              {/* Dislike */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    variant="ghost"
                    className={cn(
                      "h-6 w-6",
                      message.feedback === "DISLIKE" && "text-red-500",
                    )}
                    onClick={() => onFeedback(message.id, "DISLIKE")}
                  >
                    <ThumbsDown className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  {message.feedback === "DISLIKE" ? "Remove dislike" : "Bad response"}
                </TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>
        )}
      </div>
    </div>
  );
}
