"use client";

import { useEffect, useRef, useState } from "react";
import { Bot, ImagePlus, Loader2, PanelLeft, Send, Sparkles } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { useAiChat } from "@/src/hooks/useAiChat";
import AiChatSidebar from "./AiChatSidebar";
import AiMessageBubble from "./AiMessageBubble";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import type { AIMessageFeedback } from "@/src/types/ai.types";

type AiChatWorkspaceProps = {
  mode?: "page" | "widget";
};

const isMobileViewport = () =>
  typeof window !== "undefined" && window.matchMedia("(max-width: 1023px)").matches;

export default function AiChatWorkspace({ mode = "page" }: AiChatWorkspaceProps) {
  const {
    conversations,
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
  } = useAiChat(mode === "widget" ? "homepage" : "dashboard");

  const [input, setInput] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [attachment, setAttachment] = useState<{ file: File; previewUrl: string } | null>(null);
  const [loadingStep, setLoadingStep] = useState(0);
  const [likeDialogOpen, setLikeDialogOpen] = useState(false);
  const [dislikeDialogOpen, setDislikeDialogOpen] = useState(false);
  const [dislikeMessageId, setDislikeMessageId] = useState<string | null>(null);
  const [improveReason, setImproveReason] = useState("");
  const [expectedResponse, setExpectedResponse] = useState("");
  const [isSubmittingDislike, setIsSubmittingDislike] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const attachmentInputRef = useRef<HTMLInputElement | null>(null);

  const loadingLabels = ["Thinking", "Analyzing", "Crafting reply"];

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, isLoading]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mql = window.matchMedia("(min-width: 1024px)");
    const apply = () => setSidebarOpen(mode === "page" && mql.matches);
    apply();
    mql.addEventListener("change", apply);
    return () => mql.removeEventListener("change", apply);
  }, [mode]);

  useEffect(() => {
    if (!isLoading) {
      setLoadingStep(0);
      return;
    }

    const timer = window.setInterval(() => {
      setLoadingStep((prev) => (prev + 1) % loadingLabels.length);
    }, 900);

    return () => window.clearInterval(timer);
  }, [isLoading]);

  useEffect(() => {
    return () => {
      if (attachment?.previewUrl) {
        URL.revokeObjectURL(attachment.previewUrl);
      }
    };
  }, [attachment]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if ((!trimmed && !attachment) || isLoading) return;
    setInput("");
    await sendMessage(trimmed, { imageFile: attachment?.file ?? null });
    setAttachment(null);
    if (attachmentInputRef.current) {
      attachmentInputRef.current.value = "";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  const handleFeedback = (messageId: string, feedback: AIMessageFeedback) => {
    const targetMessage = messages.find((m) => m.id === messageId);

    if (feedback === "LIKE") {
      void setFeedback(messageId, feedback);
      setLikeDialogOpen(true);
      return;
    }

    if (feedback === "DISLIKE") {
      if (targetMessage?.feedback === "DISLIKE") {
        void setFeedback(messageId, feedback);
        return;
      }

      setDislikeMessageId(messageId);
      setDislikeDialogOpen(true);
      return;
    }

    void setFeedback(messageId, feedback);
  };

  const handleSubmitDislikeFeedback = async () => {
    if (!dislikeMessageId) return;
    if (!improveReason.trim() && !expectedResponse.trim()) {
      toast.error("Please share what should be improved.");
      return;
    }

    const dislikedMessage = messages.find((m) => m.id === dislikeMessageId);

    setIsSubmittingDislike(true);

    try {
      await setFeedback(dislikeMessageId, "DISLIKE");

      setDislikeDialogOpen(false);
      toast.message("Thanks for sharing. Generating a better response now.");

      const refined = await refineDislikedMessage({
        messageId: dislikeMessageId,
        improveReason: improveReason.trim(),
        expectedResponse: expectedResponse.trim(),
      });

      if (!refined && dislikedMessage) {
        toast.error("Could not refine this response right now.");
      } else {
        toast.success("Updated with a better response based on your feedback.");
      }

      setImproveReason("");
      setExpectedResponse("");
      setDislikeMessageId(null);
    } catch {
      toast.error("Could not submit feedback right now.");
    } finally {
      setIsSubmittingDislike(false);
    }
  };

  const handlePickImage = () => {
    attachmentInputRef.current?.click();
  };

  const handleAttachmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isImage = file.type.startsWith("image/");
    if (!isImage) {
      return;
    }

    if (attachment?.previewUrl) {
      URL.revokeObjectURL(attachment.previewUrl);
    }

    setAttachment({
      file,
      previewUrl: URL.createObjectURL(file),
    });
  };

  const handleSelectConversation = (id: string) => {
    void openConversation(id);
    if (isMobileViewport()) {
      setSidebarOpen(false);
    }
  };

  const handleNewConversation = () => {
    newConversation();
    if (isMobileViewport()) {
      setSidebarOpen(false);
    }
  };

  const handleSuggestedPrompt = (prompt: string) => {
    setInput(prompt);
    if (isMobileViewport()) {
      setSidebarOpen(false);
    }
  };

  const isEmpty = messages.length === 0 && !isFetchingMessages;

  return (
    <div
      className={cn(
        "relative flex h-full min-h-0 overflow-hidden",
        mode === "page"
          ? "rounded-2xl border border-cyan-200/55 bg-white/50 shadow-[0_24px_90px_-36px_rgba(14,116,144,0.45)] backdrop-blur-2xl dark:border-cyan-300/15 dark:bg-slate-950/45"
          : "rounded-none border-0 bg-transparent",
      )}
    >
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close chat sidebar"
          className="absolute inset-0 z-10 bg-black/40 backdrop-blur-[1px] lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "absolute inset-y-0 left-0 z-20 transition-transform duration-200 lg:static lg:z-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <AiChatSidebar
          conversations={conversations}
          suggestedPrompts={suggestedPrompts}
          mode={mode}
          activeConversationId={activeConversationId}
          isFetching={isFetchingConversations}
          onSelect={handleSelectConversation}
          onNew={handleNewConversation}
          onSuggestedPrompt={handleSuggestedPrompt}
        />
      </div>

      {/* Main chat area */}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-2 border-b border-cyan-200/40 bg-linear-to-r from-cyan-500/10 via-sky-500/10 to-blue-500/10 px-4 py-3 md:px-6 dark:border-cyan-300/10">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 lg:hidden"
            onClick={() => setSidebarOpen((prev) => !prev)}
            aria-label="Toggle chat sidebar"
          >
            <PanelLeft className="h-4 w-4" />
          </Button>
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold">AI Assistant</span>
          {activeConversationId && (
            <span className="ml-auto max-w-40 truncate text-xs text-muted-foreground md:max-w-xs">
              {conversations.find((c) => c.id === activeConversationId)?.title ?? ""}
            </span>
          )}
        </div>

        {/* Messages */}
        <div
          ref={scrollContainerRef}
          className="consultedge-ai-scrollbar-native min-h-0 flex-1 overflow-y-auto px-4 py-4 md:px-6"
        >
          {isFetchingMessages ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : isEmpty ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Bot className="mb-4 h-12 w-12 text-muted-foreground/50" />
              <p className="text-base font-medium">How can I help you today?</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Ask me anything about experts, bookings, payments, or anything else.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg) => (
                <AiMessageBubble
                  key={msg.id}
                  message={msg}
                  mode={mode}
                  onFeedback={handleFeedback}
                  onSuggestionClick={(prompt) => {
                    setInput(prompt);
                    if (isMobileViewport()) setSidebarOpen(false);
                  }}
                />
              ))}

              {/* AI typing indicator */}
              {isLoading && (
                <div className="flex gap-3">
                  <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-cyan-300/40 bg-cyan-500/10 text-xs font-semibold text-cyan-700 dark:text-cyan-300">
                    AI
                  </div>
                  <div className="rounded-2xl rounded-tl-sm border border-cyan-200/40 bg-white/60 px-4 py-3 shadow-sm backdrop-blur-md dark:border-cyan-300/10 dark:bg-slate-900/40">
                    <div className="mb-2 text-xs font-medium text-cyan-700 dark:text-cyan-300">
                      {loadingLabels[loadingStep]}...
                    </div>
                    <div className="flex gap-1.5">
                      <span className="h-2 w-2 animate-bounce rounded-full bg-cyan-500 [animation-delay:0ms]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-sky-500 [animation-delay:120ms]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-blue-500 [animation-delay:240ms]" />
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}
          </div>

        {/* Input bar */}
        <div className="border-t border-border px-3 py-2 sm:px-4 sm:py-3">
          {attachment && (
            <div className="mb-2 inline-flex items-center gap-2 rounded-lg border border-cyan-200/50 bg-white/70 px-2.5 py-1.5 text-xs text-foreground shadow-sm backdrop-blur-md dark:border-cyan-300/15 dark:bg-slate-900/50">
              <img
                src={attachment.previewUrl}
                alt={attachment.file.name}
                className="h-8 w-8 rounded object-cover"
              />
              <span className="max-w-45 truncate">{attachment.file.name}</span>
              <button
                type="button"
                className="rounded px-1 text-muted-foreground hover:text-foreground"
                onClick={() => {
                  URL.revokeObjectURL(attachment.previewUrl);
                  setAttachment(null);
                  if (attachmentInputRef.current) {
                    attachmentInputRef.current.value = "";
                  }
                }}
              >
                x
              </button>
            </div>
          )}

          <div className="flex items-end gap-1 rounded-xl border border-cyan-200/45 bg-white/60 px-2 py-1.5 shadow-[0_8px_32px_-20px_rgba(2,132,199,0.45)] backdrop-blur-xl transition-all focus-within:border-cyan-400/55 focus-within:ring-1 focus-within:ring-cyan-400/30 sm:gap-2 sm:px-3 sm:py-2 dark:border-cyan-300/15 dark:bg-slate-900/45">
            <input
              ref={attachmentInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAttachmentChange}
            />

            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="h-8 w-7 sm:w-8 shrink-0 mb-0.5 text-cyan-700 hover:text-cyan-800 dark:text-cyan-300"
              onClick={handlePickImage}
              aria-label="Share image"
            >
              <ImagePlus className="h-4 w-4" />
            </Button>

            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Message AI..."
              className={cn(
                "max-h-36 min-h-9 sm:min-h-10 flex-1 min-w-0 resize-none border-0 bg-transparent p-0 text-xs sm:text-sm shadow-none focus-visible:ring-0",
              )}
              rows={1}
              disabled={isLoading}
            />
            <Button
              type="button"
              size="icon"
              className="mb-0.5 h-8 w-8 sm:h-9 sm:w-9 shrink-0 bg-linear-to-br from-fuchsia-500 via-sky-500 to-cyan-400 text-white shadow-[0_10px_24px_-12px_rgba(14,165,233,0.95)] hover:opacity-95"
              onClick={() => void handleSend()}
              disabled={(!input.trim() && !attachment) || isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="mt-1 px-0.5 text-[9px] leading-tight text-muted-foreground sm:text-[10px] md:text-[11px]">
            Enter sends. Shift+Enter for new line.
          </p>
          <p className="mt-0.5 px-0.5 text-[9px] leading-tight text-muted-foreground sm:text-[10px] md:text-[11px]">
            AI may be wrong. Verify important info.
          </p>
        </div>
      </div>

      <Dialog open={likeDialogOpen} onOpenChange={setLikeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Thanks for your feedback</DialogTitle>
            <DialogDescription>
              Thanks! Your feedback helps refine future responses.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" onClick={() => setLikeDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dislikeDialogOpen} onOpenChange={setDislikeDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Help Improve AI Responses</DialogTitle>
            <DialogDescription>
              Sorry this wasn&apos;t helpful. What should I improve, and what kind of response were you expecting?
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div className="space-y-1.5">
              <p className="text-sm font-medium">What should be improved?</p>
              <Textarea
                value={improveReason}
                onChange={(e) => setImproveReason(e.target.value)}
                placeholder="Example: You missed direct booking steps and pricing guidance."
                rows={3}
              />
            </div>

            <div className="space-y-1.5">
              <p className="text-sm font-medium">What response were you expecting?</p>
              <Textarea
                value={expectedResponse}
                onChange={(e) => setExpectedResponse(e.target.value)}
                placeholder="Example: A concise step-by-step answer with actions and links."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDislikeDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={() => void handleSubmitDislikeFeedback()} disabled={isSubmittingDislike}>
              {isSubmittingDislike ? "Submitting..." : "Submit Feedback"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
