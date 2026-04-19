// 





"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import ReviewSummaryCards from "@/components/modules/shared/ReviewSummaryCards";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import {
  getAllTestimonialsForAdmin,
  updateTestimonialStatus,
} from "@/src/services/testimonial.services";
import type { ITestimonial } from "@/src/types/testimonial.types";
import Table, { type DataTableFilterValues } from "./Table";

const getReviewerName = (review: ITestimonial) =>
  review.client?.fullName || review.client?.user?.name || "Verified Client";

const getReviewerEmail = (review: ITestimonial) =>
  review.client?.email || review.client?.user?.email || "";

const formatDateTime = (value?: string) => {
  if (!value) return "—";
  const parsedDate = new Date(value);
  return Number.isNaN(parsedDate.getTime()) ? "—" : parsedDate.toLocaleString();
};

const truncateText = (value?: string | null, maxLength = 120) => {
  if (!value) return "No written feedback provided.";
  return value.length > maxLength ? `${value.slice(0, maxLength)}…` : value;
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

const getRatingBadge = (rating?: number) => {
  const normalizedRating = Number(rating || 0);

  if (normalizedRating >= 4.5) {
    return (
      <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
        {normalizedRating.toFixed(1)} ★
      </Badge>
    );
  }

  if (normalizedRating >= 3) {
    return (
      <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">
        {normalizedRating.toFixed(1)} ★
      </Badge>
    );
  }

  return <Badge variant="destructive">{normalizedRating.toFixed(1)} ★</Badge>;
};

const getConsultationStatusBadge = (status?: string | null) => {
  if (!status) return <Badge variant="outline">No status</Badge>;

  const normalizedStatus = status.toUpperCase();

  if (normalizedStatus === "COMPLETED") {
    return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Completed</Badge>;
  }

  if (normalizedStatus === "CONFIRMED") {
    return <Badge className="bg-sky-100 text-sky-700 hover:bg-sky-100">Confirmed</Badge>;
  }

  if (normalizedStatus === "CANCELLED") {
    return <Badge variant="destructive">Cancelled</Badge>;
  }

  return <Badge variant="secondary">{normalizedStatus}</Badge>;
};

const getVisibilityBadge = (status?: string) => {
  if (status === "HIDDEN") {
    return (
      <Badge variant="outline" className="border-amber-200 text-amber-700">
        Hidden
      </Badge>
    );
  }
  if (status === "APPROVED") {
    return (
      <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
        Visible
      </Badge>
    );
  }
  return <Badge variant="secondary">{status || "Unknown"}</Badge>;
};

const columns: ColumnDef<ITestimonial>[] = [
  {
    accessorKey: "client",
    header: "Reviewer",
    cell: ({ row }) => {
      const review = row.original;
      const reviewerEmail = getReviewerEmail(review);

      return (
        <div className="space-y-1">
          <p className="font-medium text-foreground">{getReviewerName(review)}</p>
          <p className="text-xs text-muted-foreground">{reviewerEmail || "Email unavailable"}</p>
        </div>
      );
    },
  },
  {
    accessorKey: "rating",
    header: "Rating",
    cell: ({ row }) => getRatingBadge(row.original.rating),
  },
  {
    accessorKey: "status",
    header: "Visibility",
    cell: ({ row }) => getVisibilityBadge(row.original.status),
  },
  {
    accessorKey: "comment",
    header: "Feedback",
    cell: ({ row }) => (
      <p className="max-w-md text-sm text-muted-foreground">
        {truncateText(row.original.comment)}
      </p>
    ),
  },
  {
    accessorKey: "consultation",
    header: "Session",
    cell: ({ row }) => {
      const review = row.original;
      return (
        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">
            {formatDateTime(review.consultation?.date)}
          </p>
          {getConsultationStatusBadge(review.consultation?.status)}
        </div>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Submitted",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {formatDateTime(row.original.createdAt)}
      </span>
    ),
  },
];

export default function ReviewsManagementTable() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterValues, setFilterValues] = useState<DataTableFilterValues>({});

  const { data: reviews = [], isLoading, isFetching, isError, error, refetch } =
    useQuery<ITestimonial[]>({
      queryKey: ["reviews-management-table"],
      queryFn: () => getAllTestimonialsForAdmin(100),
      staleTime: 60 * 1000,
    });

  const filteredReviews = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    const ratingFilter = typeof filterValues.rating === "string" ? filterValues.rating : undefined;
    const visibilityFilter =
      typeof filterValues.visibility === "string" ? filterValues.visibility : undefined;
    const timeframeFilter =
      typeof filterValues.timeframe === "string" ? filterValues.timeframe : undefined;
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;

    return reviews.filter((review) => {
      const reviewDate = new Date(review.createdAt).getTime();
      const matchesSearch =
        !normalizedSearch ||
        [
          getReviewerName(review),
          getReviewerEmail(review),
          review.expert?.fullName,
          review.expert?.title,
          review.comment,
        ]
          .filter(Boolean)
          .some((value) => value!.toLowerCase().includes(normalizedSearch));

      const matchesRating =
        !ratingFilter || Number(Math.round(review.rating || 0)) === Number(ratingFilter);

      const matchesVisibility =
        !visibilityFilter ||
        (visibilityFilter === "hidden"
          ? review.status === "HIDDEN"
          : review.status !== "HIDDEN");

      const matchesTimeframe =
        !timeframeFilter ||
        (timeframeFilter === "last-30"
          ? reviewDate >= thirtyDaysAgo
          : Number.isNaN(reviewDate) || reviewDate < thirtyDaysAgo);

      return matchesSearch && matchesRating && matchesVisibility && matchesTimeframe;
    });
  }, [filterValues, reviews, searchTerm]);

  const handleCopyReview = async (review: ITestimonial) => {
    try {
      await navigator.clipboard.writeText(
        [
          `Reviewer: ${getReviewerName(review)}`,
          `Expert: ${review.expert?.fullName || "Unknown expert"}`,
          `Rating: ${Number(review.rating || 0).toFixed(1)} / 5`,
          `Comment: ${review.comment || "No written feedback provided."}`,
        ].join("\n"),
      );

      toast.success("Review copied to clipboard.");
    } catch (copyError) {
      toast.error(getErrorMessage(copyError, "Unable to copy this review right now."));
    }
  };

  const handleEmailClient = (review: ITestimonial) => {
    const email = getReviewerEmail(review);

    if (!email) {
      toast.error("This reviewer does not have a contact email available.");
      return;
    }

    window.location.href = `mailto:${email}?subject=${encodeURIComponent(
      "ConsultEdge review follow-up",
    )}`;
  };

  const updateStatusMutation = useMutation({
    mutationFn: async ({
      testimonialId,
      status,
    }: {
      testimonialId: string;
      status: "APPROVED" | "HIDDEN";
    }) => updateTestimonialStatus(testimonialId, status),

    onSuccess: async (_, variables) => {
      toast.success(
        variables.status === "HIDDEN"
          ? "Review hidden from the admin listing."
          : "Review approved successfully.",
      );
      await queryClient.invalidateQueries({ queryKey: ["reviews-management-table"] });
    },

    onError: (mutationError) => {
      toast.error(getErrorMessage(mutationError, "Failed to update review visibility."));
    },
  });

  const hasActiveFilters =
    Boolean(searchTerm.trim()) || Object.values(filterValues).some(Boolean);

  return (
    <>
      <div className="space-y-6">
        <ReviewSummaryCards reviews={reviews} />

        <Card>
          <CardHeader>
            <CardTitle>Review moderation workspace</CardTitle>
            <CardDescription>
              Admins can moderate visibility and manage review records, while experts publish the
              actual replies.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {isError ? (
              <Alert variant="destructive">
                <AlertTitle>Could not load reviews</AlertTitle>
                <AlertDescription>
                  {error instanceof Error
                    ? error.message
                    : "The reviews feed is unavailable right now."}
                </AlertDescription>
              </Alert>
            ) : null}

            <Table
              data={filteredReviews}
              columns={columns}
              isLoading={isLoading || isFetching}
              emptyMessage={
                hasActiveFilters
                  ? "No reviews match the current search or filters."
                  : "No client reviews have been submitted yet."
              }
              search={{
                initialValue: searchTerm,
                placeholder: "Search by client, expert, or feedback...",
                onDebouncedChange: setSearchTerm,
              }}
              filters={{
                configs: [
                  {
                    id: "rating",
                    label: "Rating",
                    type: "single-select",
                    options: [
                      { label: "5 stars", value: "5" },
                      { label: "4 stars", value: "4" },
                      { label: "3 stars", value: "3" },
                      { label: "2 stars", value: "2" },
                      { label: "1 star", value: "1" },
                    ],
                  },
                  {
                    id: "visibility",
                    label: "Visibility",
                    type: "single-select",
                    options: [
                      { label: "Visible", value: "visible" },
                      { label: "Hidden", value: "hidden" },
                    ],
                  },
                  {
                    id: "timeframe",
                    label: "Submitted",
                    type: "single-select",
                    options: [
                      { label: "Last 30 days", value: "last-30" },
                      { label: "Older than 30 days", value: "older" },
                    ],
                  },
                ],
                values: filterValues,
                onFilterChange: (filterId, value) =>
                  setFilterValues((previous) => ({ ...previous, [filterId]: value })),
                onClearAll: () => setFilterValues({}),
              }}
              toolbarAction={
                <Button variant="outline" onClick={() => void refetch()} disabled={isFetching}>
                  <RefreshCw className={`mr-2 size-4 ${isFetching ? "animate-spin" : ""}`} />
                  Refresh
                </Button>
              }
              actions={{
                onView: (review) => {
                  if (review.expert?.id) {
                    router.push(`/experts/${review.expert.id}`);
                    return;
                  }
                  toast.error("This review is not linked to a public expert profile.");
                },

                items: (review) => {
                  const isHidden = review.status === "HIDDEN";
                  const isApproved = review.status === "APPROVED";
                  const isPending = review.status === "PENDING";

                  return [
                    ...(isPending || isHidden
                      ? [
                          {
                            label: "Approve review",
                            onClick: () =>
                              updateStatusMutation.mutate({
                                testimonialId: review.id!,
                                status: "APPROVED",
                              }),
                            disabled: updateStatusMutation.isPending,
                          },
                        ]
                      : []),

                    ...(isApproved
                      ? [
                          {
                            label: "Hide review",
                            onClick: () =>
                              updateStatusMutation.mutate({
                                testimonialId: review.id!,
                                status: "HIDDEN",
                              }),
                            disabled: updateStatusMutation.isPending,
                          },
                        ]
                      : []),

                    ...(isHidden
                      ? [
                          {
                            label: "Unhide review",
                            onClick: () =>
                              updateStatusMutation.mutate({
                                testimonialId: review.id!,
                                status: "APPROVED",
                              }),
                            disabled: updateStatusMutation.isPending,
                          },
                        ]
                      : []),

                    {
                      label: "Email client",
                      onClick: () => handleEmailClient(review),
                      disabled: !getReviewerEmail(review),
                    },

                    {
                      label: "Copy feedback",
                      onClick: () => void handleCopyReview(review),
                    },
                  ];
                },
              }}
            />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
