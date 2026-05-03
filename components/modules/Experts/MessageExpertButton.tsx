"use client";

import Link from "next/link";
import { MessageCircleMore } from "lucide-react";

import { Button } from "@/components/ui/button";

interface MessageExpertButtonProps {
  expertId: string;
  isLoggedIn?: boolean;
  userRole?: string | null;
}

export default function MessageExpertButton({
  expertId,
  isLoggedIn = false,
  userRole,
}: MessageExpertButtonProps) {
  const normalizedRole = userRole?.toUpperCase();

  const href = !isLoggedIn
    ? `/login?redirect=${encodeURIComponent(`/dashboard/chat?expertId=${expertId}`)}`
    : normalizedRole === "ADMIN"
      ? `/admin/dashboard/messages?expertId=${expertId}`
      : normalizedRole === "EXPERT"
        ? "/expert/dashboard/messages"
        : `/dashboard/chat?expertId=${expertId}`;

  const label =
    normalizedRole === "EXPERT"
      ? "Open Messages"
      : normalizedRole === "ADMIN"
        ? "Open Message Desk"
        : "Message Expert";

  return (
    <Button
      asChild
      variant="outline"
      className="w-full border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white md:w-auto"
    >
      <Link href={href}>
        <MessageCircleMore className="mr-2 size-4" />
        {label}
      </Link>
    </Button>
  );
}
