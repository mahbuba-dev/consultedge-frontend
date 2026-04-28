import Link from "next/link";
import { Download, FileText } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { ChatAttachment } from "@/src/types/chat.types";

interface MessageAttachmentCardProps {
  attachment: ChatAttachment;
}

export default function MessageAttachmentCard({ attachment }: MessageAttachmentCardProps) {
  return (
    <Card className="min-w-0 max-w-full border-border/60 bg-background/70 shadow-none">
      <CardContent className="flex min-w-0 items-center justify-between gap-3 p-3">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="rounded-xl bg-blue-100 p-2 text-blue-700">
            <FileText className="size-4" />
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground">{attachment.fileName}</p>
            <p className="text-xs text-muted-foreground">{attachment.mimeType || "Attachment"}</p>
          </div>
        </div>

        <Button asChild size="sm" variant="outline" className="shrink-0">
          <Link href={attachment.url} target="_blank" rel="noreferrer">
            <Download className="mr-2 size-4" />
            Open
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
