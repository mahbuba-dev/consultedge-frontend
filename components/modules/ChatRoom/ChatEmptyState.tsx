import Link from "next/link";
import { MessageCircleMore, Sparkles } from "lucide-react";

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
        ? "Your client inbox is ready"
        : isAdmin
          ? "Your message desk is ready"
          : "Your messages hub is ready";

  const description = expertId && !isExpert
    ? "We’re looking for the matching room so you can message this expert from one polished dashboard workspace."
    : isExpert
      ? "Client conversations will appear here as soon as someone messages you or books a consultation."
      : isAdmin
        ? "Choose a room from the sidebar to review conversations and keep message operations organized."
        : "Choose a room from the sidebar to continue a conversation, share files, or start a secure video call.";

  const primaryAction = isExpert
    ? { href: "/expert/dashboard/my-consultations", label: "View consultations" }
    : isAdmin
      ? { href: "/admin/dashboard", label: "Open admin dashboard" }
      : { href: "/experts", label: "Explore experts" };

  return (
    <Card className="flex h-full items-center justify-center border-dashed bg-linear-to-br from-blue-50/70 via-background to-sky-50/70 shadow-sm">
      <CardContent className="max-w-xl space-y-4 py-14 text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
          <MessageCircleMore className="size-7" />
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
          <Button asChild className="bg-blue-600 hover:bg-blue-700">
            <Link href={primaryAction.href}>
              <Sparkles className="mr-2 size-4" />
              {primaryAction.label}
            </Link>
          </Button>

          <Button asChild variant="outline">
            <Link href={dashboardHref}>Back to dashboard</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
