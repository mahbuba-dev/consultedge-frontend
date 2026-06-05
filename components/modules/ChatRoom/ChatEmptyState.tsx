import Link from "next/link";
import { CalendarClock, MessageCircleMore, ShieldCheck, Sparkles, UserRoundCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { ChatRole } from "@/src/types/chat.types";

interface ChatEmptyStateProps {
  expertId?: string;
  isLoading?: boolean;
  dashboardHref?: string;
  role?: ChatRole | null;
}

export default function ChatEmptyState({
  expertId,
  isLoading = false,
  dashboardHref = "/dashboard",
  role,
}: ChatEmptyStateProps) {
  const isExpert = role === "EXPERT";
  const isAdmin = role === "ADMIN";

  const heading = isLoading
    ? "Preparing your conversations"
    : expertId && !isExpert
      ? "Opening your expert conversation"
      : isExpert
        ? "Your expert inbox is ready"
        : isAdmin
          ? "Your message desk is ready"
          : "Your messages hub is ready";

  const description = expertId && !isExpert
    ? "We’re looking for the matching room so you can message this expert from one polished dashboard workspace."
    : isExpert
      ? "Client threads appear here after a booking, or when you start a conversation from a session card."
      : isAdmin
        ? "Choose a room from the sidebar to review conversations and keep message operations organized."
        : "Choose a room from the sidebar to continue a conversation, share files, or start a secure video call.";

  const primaryAction = isExpert
    ? { href: "/expert/dashboard/my-sessions", label: "Open my sessions" }
    : isAdmin
      ? { href: "/admin/dashboard", label: "Open admin dashboard" }
      : { href: "/experts", label: "Explore experts" };

  const secondaryAction = isExpert
    ? { href: "/expert/dashboard/set-availability", label: "Create availability" }
    : null;

  const EmptyIcon = isExpert
    ? UserRoundCheck
    : isAdmin
      ? ShieldCheck
      : MessageCircleMore;

  const shellToneClass = isExpert
    ? "border-cyan-200/70 from-cyan-50/80 via-background to-blue-50/70 dark:border-cyan-500/20 dark:from-cyan-950/25 dark:via-slate-950/60 dark:to-blue-950/20"
    : isAdmin
      ? "border-amber-200/70 from-amber-50/70 via-background to-orange-50/60 dark:border-amber-500/20 dark:from-amber-950/15 dark:via-slate-950/60 dark:to-orange-950/15"
      : "border-slate-200/70 from-blue-50/70 via-background to-sky-50/70 dark:border-white/10 dark:from-slate-900/60 dark:via-slate-950/60 dark:to-slate-900/60";

  const iconToneClass = isExpert
    ? "from-cyan-500 to-blue-500 shadow-cyan-500/30"
    : isAdmin
      ? "from-amber-500 to-orange-500 shadow-amber-500/25"
      : "from-blue-500 to-cyan-500 shadow-cyan-500/30";

  return (
    <Card className={`flex h-full items-center justify-center border-dashed bg-linear-to-br shadow-sm ${shellToneClass}`}>
      <CardContent className="max-w-xl space-y-4 py-14 text-center">
        <div className={`mx-auto flex size-14 items-center justify-center rounded-2xl bg-linear-to-br text-white shadow-lg ${iconToneClass}`}>
          <EmptyIcon className="size-7" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">
            {heading}
          </h2>
          <p className="text-sm text-muted-foreground md:text-base">
            {description}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button asChild className="bg-linear-to-r from-blue-600 to-cyan-500 text-white shadow-md shadow-cyan-500/25 hover:from-blue-700 hover:to-cyan-600">
            <Link href={primaryAction.href}>
              <Sparkles className="mr-2 size-4" />
              {primaryAction.label}
            </Link>
          </Button>

          {secondaryAction ? (
            <Button asChild variant="outline" className="border-cyan-200/80 bg-cyan-50/60 hover:bg-cyan-100/80 dark:border-cyan-500/25 dark:bg-cyan-500/8 dark:hover:bg-cyan-500/15">
              <Link href={secondaryAction.href}>
                <CalendarClock className="mr-2 size-4" />
                {secondaryAction.label}
              </Link>
            </Button>
          ) : null}

          <Button asChild variant="outline" className="dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10">
            <Link href={dashboardHref}>Back to dashboard</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
