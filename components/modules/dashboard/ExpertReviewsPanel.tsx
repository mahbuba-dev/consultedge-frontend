"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Copy, Mail, MessageSquareReply, RefreshCw, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";

import ReviewSummaryCards from "@/components/modules/shared/ReviewSummaryCards";
import TestimonialCard from "@/components/modules/shared/TestimonialCard";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
import { getMe } from "@/src/services/auth.services";
import { useReviewOverrides } from "@/src/hooks/useReviewOverrides";
import { getTestimonialsByExpert } from "@/src/services/testimonial.services";
import type { IUserProfile } from "@/src/types/auth.types";
import type { ITestimonial } from "@/src/types/testimonial.types";

const getReviewerName = (review: ITestimonial) =>
  review.client?.fullName || review.client?.user?.name || "Verified Client";

const getReviewerEmail = (review: ITestimonial) =>
  review.client?.email || review.client?.user?.email || "";

const formatDate = (value?: string) => {
  if (!value) {
    return "Recently";
  }

  const parsedDate = new Date(value);
  return Number.isNaN(parsedDate.getTime()) ? "Recently" : parsedDate.toLocaleDateString();
};

const getErrorMessage = (error: unknown, fallback: string) => {
  if (typeof error === "object" && error !== null) {
    const maybeError = error as {
      response?: { data?: { message?: string } };
      message?: string;
    };

    return maybeError.response?.data?.message ?? maybeError.message ?? fallback;
  }

  return fallback;
};

export default function ExpertReviewsPanel() {
  const [replyTarget, setReplyTarget] = useState<ITestimonial | null>(null);
  const [replyText, setReplyText] = useState("");

  const {
    data: profile,
    isLoading: isProfileLoading,
  } = useQuery<IUserProfile>({
    queryKey: ["me"],
    queryFn: getMe,
    staleTime: 5 * 60 * 1000,
  });

  const expertId = profile?.expert?.id;
  const expertName = profile?.expert?.fullName || "your expert profile";

  const {
    data: reviews = [],
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useQuery<ITestimonial[]>({
    queryKey: ["expert-my-reviews", expertId],
    queryFn: () => getTestimonialsByExpert(expertId as string),
    enabled: Boolean(expertId),
    staleTime: 60 * 1000,
  });

  const { mergedReviews, saveExpertReply, clearExpertReply } = useReviewOverrides(reviews);

  const sortedReviews = useMemo(
    () =>
      [...mergedReviews].sort(
        (left, right) =>
          new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
      ),
    [mergedReviews],
  );

  const handleCopyReview = async (review: ITestimonial) => {
    try {
      if (!navigator.clipboard?.writeText) {
        throw new Error("Clipboard access is not available.");
      }

      await navigator.clipboard.writeText(
        `${getReviewerName(review)} • ${Number(review.rating || 0).toFixed(1)} / 5\n${review.comment || "No written feedback provided."}`,
      );

      toast.success("Review copied to clipboard.");
    } catch (copyError) {
      toast.error(getErrorMessage(copyError, "Unable to copy this review right now."));
    }
  };

  const handleEmailClient = (review: ITestimonial) => {
    const email = getReviewerEmail(review);

    if (!email) {
      toast.error("This reviewer does not have an email address on file.");
      return;
    }

    window.location.href = `mailto:${email}?subject=${encodeURIComponent("Thanks for your ConsultEdge feedback")}`;
  };

  const openReplyDialog = (review: ITestimonial) => {
    setReplyTarget(review);
    setReplyText(review.expertReply || "");
  };

  const closeReplyDialog = () => {
    setReplyTarget(null);
    setReplyText("");
  };

  const submitReply = () => {
    if (!replyTarget?.id) {
      return;
    }

    const normalizedReply = replyText.trim();

    if (!normalizedReply) {
      toast.error("Write a short reply before saving.");
      return;
    }

    const isEditing = Boolean(replyTarget.expertReply);
    saveExpertReply(replyTarget.id, normalizedReply);
    toast.success(isEditing ? "Reply updated successfully." : "Reply published successfully.");
    closeReplyDialog();
  };

  const handleRemoveReply = (review: ITestimonial) => {
    if (!review.id || !review.expertReply) {
      return;
    }

    clearExpertReply(review.id);
    toast.success("Reply removed.");
  };

  const isBusy = isProfileLoading || isLoading;

  return (
    <>
      <div className="space-y-6">
        <section className="overflow-hidden rounded-3xl border-0 bg-linear-to-r from-slate-900 via-blue-900 to-cyan-800 p-6 text-white shadow-xl">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-3">
              <Badge className="w-fit border-white/20 bg-white/10 text-white hover:bg-white/10">
                <Sparkles className="mr-1 size-3.5" />
                Expert Dashboard
              </Badge>

              <div className="space-y-1">
                <h1 className="text-3xl font-bold tracking-tight">My reviews</h1>
                <p className="max-w-2xl text-sm text-white/80 md:text-base">
                  See how clients describe their experience with {expertName}, track your ratings, and publish your own follow-up replies.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                variant="outline"
                className="border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white"
                onClick={() => void refetch()}
                disabled={isFetching}
              >
                <RefreshCw className={`mr-2 size-4 ${isFetching ? "animate-spin" : ""}`} />
                Refresh
              </Button>

              {expertId ? (
                <Link href={`/experts/${expertId}`}>
                  <Button className="bg-white text-slate-900 hover:bg-white/90">
                    View public profile
                  </Button>
                </Link>
              ) : null}
            </div>
          </div>
        </section>

        <ReviewSummaryCards reviews={sortedReviews} />

        {isError ? (
          <Alert variant="destructive">
            <AlertTitle>Could not load reviews</AlertTitle>
            <AlertDescription>
              {error instanceof Error
                ? error.message
                : "Your review feed is unavailable right now. Please try again shortly."}
            </AlertDescription>
          </Alert>
        ) : null}

        {!isBusy && !expertId ? (
          <Card>
            <CardContent className="py-10 text-center text-muted-foreground">
              Your expert profile is still being prepared, so review data is not available yet.
            </CardContent>
          </Card>
        ) : isBusy ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <Card key={index} className="h-64 animate-pulse bg-muted/40" />
            ))}
          </div>
        ) : sortedReviews.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <h3 className="text-lg font-semibold">No reviews yet</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Once clients leave feedback after completed consultations, it will appear here.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {sortedReviews.map((review) => (
              <div key={review.id} className="space-y-3">
                <TestimonialCard testimonial={review} compact />

                <div className="flex flex-wrap items-center gap-2 px-1">
                  <Button variant="outline" size="sm" onClick={() => openReplyDialog(review)}>
                    <MessageSquareReply className="mr-2 size-4" />
                    {review.expertReply ? "Edit reply" : "Reply"}
                  </Button>

                  {review.expertReply ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveReply(review)}
                    >
                      <Trash2 className="mr-2 size-4" />
                      Remove reply
                    </Button>
                  ) : null}

                  <Button variant="outline" size="sm" onClick={() => void handleCopyReview(review)}>
                    <Copy className="mr-2 size-4" />
                    Copy review
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEmailClient(review)}
                    disabled={!getReviewerEmail(review)}
                  >
                    <Mail className="mr-2 size-4" />
                    Email client
                  </Button>
                </div>

                <p className="px-1 text-xs text-muted-foreground">
                  Session date: {formatDate(review.consultation?.date)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={Boolean(replyTarget)} onOpenChange={(open) => !open && closeReplyDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{replyTarget?.expertReply ? "Edit expert reply" : "Reply to this review"}</DialogTitle>
            <DialogDescription>
              This message will appear under the review on your public expert profile.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div className="rounded-2xl border bg-muted/20 p-3 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">{replyTarget ? getReviewerName(replyTarget) : "Client review"}</p>
              <p className="mt-1">{replyTarget?.comment || "No written feedback provided."}</p>
            </div>

            <Textarea
              value={replyText}
              onChange={(event) => setReplyText(event.target.value)}
              placeholder="Thank the client and share a short, professional follow-up..."
              rows={5}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeReplyDialog}>
              Cancel
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={submitReply}>
              Save reply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
