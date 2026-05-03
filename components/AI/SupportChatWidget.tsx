"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import {
  Bot,
  MessageCircleMore,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/src/lib/utils";
import AiChatWorkspace from "@/components/modules/AiChat/AiChatWorkspace";

export default function SupportChatWidget() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [showGreeting, setShowGreeting] = useState(false);
  const hideOnRoute =
    pathname === "/apply-expert" ||
    pathname === "/experts/apply-expert" ||
    pathname.startsWith("/admin/dashboard") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/forgot-password") ||
    pathname.startsWith("/reset-password") ||
    pathname.startsWith("/verify-email") ||
    pathname.startsWith("/forgetPassword");

  useEffect(() => {
    if (hideOnRoute) {
      setShowGreeting(false);
      setIsOpen(false);
      return;
    }

    if (isOpen) {
      setShowGreeting(false);
      return;
    }
    const showTimer = setTimeout(() => setShowGreeting(true), 3000);
    const hideTimer = setTimeout(() => setShowGreeting(false), 11000);
    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [isOpen, hideOnRoute]);

  if (hideOnRoute) {
    return null;
  }

  return (
    // The outer container is sized by its tallest child (the always-rendered
    // 78vh chat panel), so it ends up covering the whole bottom-right of the
    // viewport. We MUST mark it `pointer-events-none` here, otherwise it
    // silently blocks clicks on every CTA in that area (Browse experts,
    // Get started, Contact us, footer links, Book now, etc.). Each
    // interactive child re-enables pointer events on itself below.
    <div className="pointer-events-none fixed bottom-4 right-4 z-70 flex max-w-[calc(100vw-1rem)] flex-col items-end gap-3 sm:bottom-5 sm:right-5">
      {isOpen ? (
        <div className={cn("pointer-events-auto origin-bottom-right transition-all duration-300 ease-out translate-y-0 scale-100 opacity-100")}>
          <div className="relative h-[min(86vh,760px)] w-[min(96vw,1080px)] overflow-hidden rounded-2xl border border-cyan-200/70 bg-white/75 shadow-[0_30px_90px_-28px_rgba(14,116,144,0.55)] backdrop-blur-2xl sm:rounded-[28px] dark:border-cyan-300/20 dark:bg-slate-950/75">
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute -left-16 top-8 h-56 w-56 rounded-full bg-cyan-400/20 blur-3xl" />
              <div className="absolute -right-10 bottom-12 h-52 w-52 rounded-full bg-blue-500/20 blur-3xl" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(255,255,255,0.35)_0%,transparent_45%),radial-gradient(circle_at_85%_80%,rgba(56,189,248,0.20)_0%,transparent_40%)]" />
            </div>
            <div className="border-b border-blue-100 bg-linear-to-r from-blue-600 via-cyan-500 to-sky-500 p-4 text-white">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold">Ask AI</h3>
                  <p className="mt-1 text-xs text-white/80">
                    OpenAI-powered assistant with chat history, suggested prompts, and feedback actions.
                  </p>
                </div>

                <div className="flex items-center gap-1">
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

            <div className="relative h-[calc(100%-84px)] min-h-0 bg-linear-to-b from-blue-50/50 via-background to-sky-50/40 dark:from-slate-950 dark:via-slate-950 dark:to-slate-950">
              <AiChatWorkspace mode="widget" />
            </div>
          </div>
        </div>
      ) : null}

      {showGreeting && !isOpen && (
        <button
          type="button"
          onClick={() => { setShowGreeting(false); setIsOpen(true); }}
          className="pointer-events-auto animate-in fade-in slide-in-from-bottom-2 duration-300 flex items-start gap-2.5 rounded-2xl border border-blue-200/80 bg-white px-4 py-3 text-sm text-slate-700 shadow-[0_8px_32px_-8px_rgba(37,99,235,0.35)] backdrop-blur-sm transition hover:border-blue-300 hover:shadow-[0_8px_32px_-4px_rgba(37,99,235,0.45)] dark:border-white/10 dark:bg-slate-900 dark:text-slate-200"
        >
          <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-blue-600 to-cyan-500">
            <Bot className="size-3.5 text-white" />
          </span>
          <span>
            <span className="font-semibold text-blue-700 dark:text-blue-400">AI Assistant</span>
            <br />
            <span>
              How can I help you? <span className="consultedge-hand-wave">👋</span>
            </span>
          </span>
          <span
            role="button"
            aria-label="Dismiss"
            tabIndex={0}
            onClick={(e) => { e.stopPropagation(); setShowGreeting(false); }}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.stopPropagation(); setShowGreeting(false); } }}
            className="ml-1 mt-0.5 cursor-pointer rounded-full p-0.5 text-slate-400 hover:text-slate-600"
          >
            <X className="size-3.5" />
          </span>
        </button>
      )}

      <Button
        type="button"
        onClick={() => { setShowGreeting(false); setIsOpen((current) => !current); }}
        className="pointer-events-auto h-12 rounded-full bg-linear-to-r from-blue-600 via-cyan-500 to-sky-500 px-4 text-white shadow-[0_16px_40px_-16px_rgba(37,99,235,0.7)] transition hover:scale-[1.02] hover:opacity-95"
      >
        <MessageCircleMore className="mr-2 size-5" />
        {isOpen ? "Close" : "Ask AI"}
      </Button>
    </div>
  );
}
