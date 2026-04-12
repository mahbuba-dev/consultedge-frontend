"use client";

import { useEffect, useRef, useState } from "react";
import {
  Bot,
  Loader2,
  MessageCircleMore,
  RotateCcw,
  SendHorizontal,
  ShieldAlert,
  Sparkles,
  X,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/src/lib/utils";
import { useAiSupportChat } from "@/src/components/support-chat/useAiSupportChat";

export default function SupportChatWidget() {
  const {
    messages,
    isLoading,
    error,
    isOpen,
    setIsOpen,
    quickActions,
    sendMessage,
    sendQuickAction,
    resetConversation,
  } = useAiSupportChat("homepage");

  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isLoading, isOpen]);

  const handleSend = async () => {
    const trimmed = input.trim();

    if (!trimmed || isLoading) {
      return;
    }

    setInput("");
    await sendMessage(trimmed, "homepage");
  };

  const handleKeyDown = async (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      await handleSend();
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-70 flex max-w-[calc(100vw-1rem)] flex-col items-end gap-3 sm:bottom-5 sm:right-5">
      <div
        className={cn(
          "origin-bottom-right transition-all duration-300 ease-out",
          isOpen
            ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
            : "pointer-events-none translate-y-3 scale-95 opacity-0",
        )}
      >
        <div className="h-[min(78vh,640px)] w-[min(92vw,420px)] overflow-hidden rounded-[28px] border border-violet-200/70 bg-white/90 shadow-[0_30px_80px_-28px_rgba(109,40,217,0.45)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/90">
          <div className="border-b border-violet-100 bg-linear-to-r from-violet-600 via-fuchsia-500 to-sky-500 p-4 text-white">
            <div className="flex items-start justify-between gap-3">
              <div>
                <Badge className="border-white/20 bg-white/15 text-white hover:bg-white/15">
                  <Sparkles className="mr-1 size-3.5" />
                  AI
                </Badge>
                <h3 className="mt-2 text-lg font-semibold">Ask AI</h3>
              </div>

              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="size-8 rounded-full text-white hover:bg-white/15 hover:text-white"
                  onClick={resetConversation}
                  aria-label="Reset conversation"
                >
                  <RotateCcw className="size-4" />
                </Button>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="size-8 rounded-full text-white hover:bg-white/15 hover:text-white"
                  onClick={() => setIsOpen(false)}
                  aria-label="Close support chat"
                >
                  <X className="size-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="flex h-[calc(100%-96px)] flex-col bg-linear-to-b from-violet-50/50 via-background to-sky-50/40">
            <div className="border-b px-3 py-3">
              <div className="flex flex-wrap gap-2">
                {quickActions.map((action) => (
                  <button
                    key={action.id}
                    type="button"
                    onClick={() => void sendQuickAction(action)}
                    disabled={isLoading}
                    className="rounded-full border border-violet-200 bg-white px-3 py-1.5 text-xs font-medium text-violet-700 transition hover:border-violet-300 hover:bg-violet-50 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-3 py-3">
              <div className="space-y-3">
                {messages.map((message) => {
                  const isUser = message.role === "user";

                  return (
                    <div
                      key={message.id}
                      className={cn("flex", isUser ? "justify-end" : "justify-start")}
                    >
                      <div
                        className={cn(
                          "max-w-[88%] rounded-2xl px-3.5 py-3 text-sm shadow-sm",
                          isUser
                            ? "bg-violet-600 text-white"
                            : "border border-violet-100 bg-white/90 text-foreground",
                          message.isError && !isUser ? "border-amber-200 bg-amber-50" : undefined,
                        )}
                      >
                        <div className="mb-2 flex items-center gap-2 text-[11px] font-medium opacity-80">
                          {isUser ? (
                            <>
                              <span>You</span>
                              <MessageCircleMore className="size-3.5" />
                            </>
                          ) : (
                            <>
                              <Bot className="size-3.5" />
                              <span>AI</span>
                            </>
                          )}
                        </div>

                        <p className="whitespace-pre-wrap leading-6">{message.content}</p>

                        {message.suggestedActions?.length ? (
                          <ul className="mt-2 list-disc space-y-1 pl-4 text-[12px] opacity-85">
                            {message.suggestedActions.slice(0, 3).map((item) => (
                              <li key={item}>{item}</li>
                            ))}
                          </ul>
                        ) : null}

                        {message.escalatedToHuman ? (
                          <div className="mt-3 space-y-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-[12px] text-amber-800">
                            <div className="flex items-center gap-2 font-medium">
                              <ShieldAlert className="size-3.5" />
                              Need human help?
                            </div>

                            <Button
                              asChild
                              size="sm"
                              variant="outline"
                              className="h-8 border-amber-300 bg-white text-amber-900 hover:bg-amber-100"
                            >
                              <a href="/contact">Contact</a>
                            </Button>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  );
                })}

                {isLoading ? (
                  <div className="flex justify-start">
                    <div className="rounded-2xl border border-violet-100 bg-white/90 px-3.5 py-3 text-sm shadow-sm">
                      <div className="mb-2 flex items-center gap-2 text-[11px] font-medium text-muted-foreground">
                        <Bot className="size-3.5" />
                        Thinking
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="size-2 animate-bounce rounded-full bg-violet-500 [animation-delay:-0.2s]" />
                        <span className="size-2 animate-bounce rounded-full bg-violet-500 [animation-delay:-0.1s]" />
                        <span className="size-2 animate-bounce rounded-full bg-violet-500" />
                      </div>
                    </div>
                  </div>
                ) : null}

                <div ref={endRef} />
              </div>
            </div>

            <div className="border-t bg-background/85 p-3">
              {error ? (
                <div className="mb-2 flex items-center justify-between gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                  <span>{error}</span>
                  <Button asChild size="sm" variant="outline" className="h-7 border-amber-300 bg-white text-amber-900 hover:bg-amber-100">
                    <a href="/contact">Contact</a>
                  </Button>
                </div>
              ) : null}

              <div className="rounded-2xl border bg-white p-2 shadow-sm dark:bg-slate-900">
                <Textarea
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your question..."
                  className="min-h-22 resize-none border-0 bg-transparent px-1 shadow-none focus-visible:ring-0"
                />

                <div className="mt-2 flex items-center justify-end gap-2">
                  <Button
                    type="button"
                    className="bg-linear-to-r from-violet-600 via-fuchsia-500 to-sky-500 text-white shadow-sm hover:opacity-95"
                    disabled={isLoading || !input.trim()}
                    onClick={() => void handleSend()}
                  >
                    {isLoading ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <>
                        <SendHorizontal className="mr-2 size-4" />
                        Send
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="h-12 rounded-full bg-linear-to-r from-violet-600 via-fuchsia-500 to-sky-500 px-4 text-white shadow-[0_16px_40px_-16px_rgba(109,40,217,0.7)] transition hover:scale-[1.02] hover:opacity-95"
      >
        <MessageCircleMore className="mr-2 size-5" />
        {isOpen ? "Close" : "Ask AI"}
      </Button>
    </div>
  );
}
