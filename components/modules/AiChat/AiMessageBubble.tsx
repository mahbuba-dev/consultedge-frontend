"use client";

import { useState } from "react";
import { Check, Copy, ThumbsDown, ThumbsUp } from "lucide-react";
import { cn } from "@/src/lib/utils";
import type { AiChatMessage } from "@/src/hooks/useAiChat";
import type { AIMessageFeedback } from "@/src/types/ai.types";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface AiMessageBubbleProps {
  message: AiChatMessage;
  onFeedback: (messageId: string, feedback: AIMessageFeedback) => void;
  mode?: "page" | "widget";
}

export default function AiMessageBubble({
  message,
  onFeedback,
  mode = "page",
}: AiMessageBubbleProps) {
  const isUser = message.role === "user";
  const [copied, setCopied] = useState(false);
  const actionsAlwaysVisible = mode === "widget";

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
