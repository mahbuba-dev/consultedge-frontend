"use client";

import { useState } from "react";
import { Loader2, SendHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import UploadAttachmentButton from "./AttachmentUploadButton";

interface MessageComposerProps {
  disabled?: boolean;
  isSending?: boolean;
  isUploading?: boolean;
  placeholder?: string;
  onSendMessage: (text: string) => Promise<void> | void;
  onUploadAttachment: (file: File) => Promise<void> | void;
  onTyping?: () => void;
}

export default function MessageComposer({
  disabled = false,
  isSending = false,
  isUploading = false,
  placeholder = "Write a message…",
  onSendMessage,
  onUploadAttachment,
  onTyping,
}: MessageComposerProps) {
  const [text, setText] = useState("");

  const handleSubmit = async () => {
    const normalizedText = text.trim();

    if (!normalizedText || disabled || isSending) {
      return;
    }

    await onSendMessage(normalizedText);
    setText("");
  };

  return (
    <div className="space-y-3 rounded-2xl border bg-background p-3 shadow-sm">
      <Textarea
        value={text}
        disabled={disabled}
        placeholder={placeholder}
        className="min-h-23 resize-none border-0 bg-transparent p-0 shadow-none focus-visible:ring-0"
        onChange={(event) => {
          setText(event.target.value);
          onTyping?.();
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            void handleSubmit();
          }
        }}
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <UploadAttachmentButton
            disabled={disabled || isUploading}
            onSelectFile={onUploadAttachment}
          />
          {disabled ? (
            <p className="text-xs text-muted-foreground">
              Messaging is currently unavailable for this conversation.
            </p>
          ) : null}
        </div>

        <Button
          type="button"
          className="bg-blue-600 hover:bg-blue-700"
          disabled={disabled || isSending || !text.trim()}
          onClick={() => void handleSubmit()}
        >
          {isSending ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <SendHorizontal className="mr-2 size-4" />
              Send
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
