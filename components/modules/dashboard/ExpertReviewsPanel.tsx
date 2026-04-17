"use client";

import { useMemo, useState } from "react";
import {
  Copy,
  Mail,
  MessageSquareReply,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

import ReviewSummaryCards from "@/components/modules/shared/ReviewSummaryCards";
import TestimonialCard from "@/components/modules/shared/TestimonialCard";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

import type { IUserProfile } from "@/src/types/auth.types";
import type { ITestimonial } from "@/src/types/testimonial.types";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getTestimonialsByExpert,
  replyToTestimonial,
} from "@/src/services/testimonial.services";

type Props = {
  profile: IUserProfile;
};

export default function ExpertReviewsPanel({ profile }: Props) {
  const [replyTarget, setReplyTarget] = useState<ITestimonial | null>(null);
  const [replyText, setReplyText] = useState("");

  const expertId = profile?.expert?.id ?? null;
  const expertName = profile?.expert?.fullName ?? "your expert";

  const queryClient = useQueryClient();

  // ✅ FETCH REVIEWS (React Query owns data now)
  const { data: reviews = [] } = useQuery({
    queryKey: ["testimonials", expertId],
    queryFn: () => getTestimonialsByExpert(expertId!),
    enabled: !!expertId,
  });

  // ✅ MUTATION
  const replyMutation = useMutation({
    mutationFn: ({
      id,
      reply,
    }: {
      id: string;
      reply: string;
    }) => replyToTestimonial(id, { expertReply: reply }),

    onsuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["testimonials", expertId],
      });
    },
  });

  const sortedReviews = useMemo(() => {
    return [...reviews].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime()
    );
  }, [reviews]);

  const getReviewerName = (r: ITestimonial) =>
    r.client?.fullName || r.client?.user?.name || "Verified Client";

  const getReviewerEmail = (r: ITestimonial) =>
    r.client?.email || r.client?.user?.email || "";

  const handleCopy = async (r: ITestimonial) => {
    try {
      await navigator.clipboard.writeText(
        `${getReviewerName(r)} • ${r.rating}/5\n${r.comment ?? ""}`
      );
      toast.success("Copied");
    } catch {
      toast.error("Copy failed");
    }
  };

  const handleEmail = (r: ITestimonial) => {
    const email = getReviewerEmail(r);
    if (!email) return toast.error("No email");

    window.location.href = `mailto:${email}`;
  };

  const openReply = (r: ITestimonial) => {
    setReplyTarget(r);
    setReplyText(r.expertReply || "");
  };

  const closeReply = () => {
    setReplyTarget(null);
    setReplyText("");
  };

  // ✅ FIXED SAVE (REAL BACKEND + CACHE UPDATE)
  const saveReply = async () => {
    if (!replyTarget?.id) return;

    const text = replyText.trim();
    if (!text) return toast.error("Reply cannot be empty");

    try {
      await replyMutation.mutateAsync({
        id: replyTarget.id,
        reply: text,
      });

      toast.success("Reply published successfully");
      closeReply();
    } catch {
      toast.error("Failed to save reply");
    }
  };

  return (
    <>
      <div className="space-y-6">
        {/* HEADER */}
        <section className="rounded-3xl bg-linear-to-r from-slate-900 via-blue-900 to-cyan-800 p-6 text-white">
          <Badge className="bg-white/10 text-white">
            <Sparkles className="mr-1 size-3.5" />
            Expert Dashboard
          </Badge>

          <h1 className="mt-2 text-3xl font-bold">My reviews</h1>

          <p className="text-sm text-white/80">
            Reviews for {expertName}
          </p>
        </section>

        {/* SUMMARY */}
        <ReviewSummaryCards reviews={sortedReviews} />

        {/* EMPTY */}
        {sortedReviews.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              No reviews yet
            </CardContent>
          </Card>
        )}

        {/* LIST */}
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {sortedReviews.map((r) => (
            <div key={r.id} className="space-y-3">
              <TestimonialCard testimonial={r} compact />

              <div className="flex gap-2">
                <Button size="sm" onClick={() => openReply(r)}>
                  <MessageSquareReply className="mr-2 size-4" />
                  Reply
                </Button>

                <Button size="sm" onClick={() => void handleCopy(r)}>
                  <Copy className="mr-2 size-4" />
                  Copy
                </Button>

                <Button size="sm" onClick={() => handleEmail(r)}>
                  <Mail className="mr-2 size-4" />
                  Email
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* DIALOG */}
      <Dialog open={!!replyTarget} onOpenChange={closeReply}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reply</DialogTitle>
            <DialogDescription>
              Write a response to this review
            </DialogDescription>
          </DialogHeader>

          <Textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            rows={5}
          />

          <DialogFooter>
            <Button variant="outline" onClick={closeReply}>
              Cancel
            </Button>
            <Button onClick={saveReply}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}