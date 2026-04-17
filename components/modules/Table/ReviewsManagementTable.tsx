// "use client";

// import { useMemo, useState } from "react";
// import { useMutation, useQuery } from "@tanstack/react-query";
// import type { ColumnDef } from "@tanstack/react-table";
// import { RefreshCw } from "lucide-react";
// import { useRouter } from "next/navigation";
// import { toast } from "sonner";

// import ReviewSummaryCards from "@/components/modules/shared/ReviewSummaryCards";
// import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
// } from "@/components/ui/alert-dialog";
// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// import {
//   deleteTestimonialAction,
//   getAllTestimonials,
// } from "@/src/services/testimonial.services";
// import type { ITestimonial } from "@/src/types/testimonial.types";
// import Table, {
//   type DataTableFilterConfig,
//   type DataTableFilterValues,
// } from "./Table";

// const getReviewerName = (review: ITestimonial) =>
//   review.client?.fullName || review.client?.user?.name || "Verified Client";

// const getReviewerEmail = (review: ITestimonial) =>
//   review.client?.email || review.client?.user?.email || "";

// const formatDateTime = (value?: string) => {
//   if (!value) {
//     return "—";
//   }

//   const parsedDate = new Date(value);
//   return Number.isNaN(parsedDate.getTime()) ? "—" : parsedDate.toLocaleString();
// };

// const truncateText = (value?: string | null, maxLength = 120) => {
//   if (!value) {
//     return "No written feedback provided.";
//   }

//   return value.length > maxLength ? `${value.slice(0, maxLength)}…` : value;
// };

// const getErrorMessage = (error: unknown, fallback: string) => {
//   if (typeof error === "object" && error !== null) {
//     const maybeError = error as {
//       response?: { data?: { message?: string } };
//       message?: string;
//     };

//     return maybeError.response?.data?.message ?? maybeError.message ?? fallback;
//   }

//   return fallback;
// };

// const getRatingBadge = (rating?: number) => {
//   const normalizedRating = Number(rating || 0);

//   if (normalizedRating >= 4.5) {
//     return (
//       <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
//         {normalizedRating.toFixed(1)} ★
//       </Badge>
//     );
//   }

//   if (normalizedRating >= 3) {
//     return (
//       <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">
//         {normalizedRating.toFixed(1)} ★
//       </Badge>
//     );
//   }

//   return <Badge variant="destructive">{normalizedRating.toFixed(1)} ★</Badge>;
// };

// const getConsultationStatusBadge = (status?: string | null) => {
//   if (!status) {
//     return <Badge variant="outline">No status</Badge>;
//   }

//   const normalizedStatus = status.toUpperCase();

//   if (normalizedStatus === "COMPLETED") {
//     return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Completed</Badge>;
//   }

//   if (normalizedStatus === "CONFIRMED") {
//     return <Badge className="bg-sky-100 text-sky-700 hover:bg-sky-100">Confirmed</Badge>;
//   }

//   if (normalizedStatus === "CANCELLED") {
//     return <Badge variant="destructive">Cancelled</Badge>;
//   }

//   return <Badge variant="secondary">{normalizedStatus}</Badge>;
// };

// const getVisibilityBadge = (isHidden?: boolean) => {
//   return isHidden ? (
//     <Badge variant="outline" className="border-amber-200 text-amber-700">
//       Hidden
//     </Badge>
//   ) : (
//     <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
//       Visible
//     </Badge>
//   );
// };

// const columns: ColumnDef<ITestimonial>[] = [
//   {
//     accessorKey: "client",
//     header: "Reviewer",
//     cell: ({ row }) => {
//       const review = row.original;
//       const reviewerEmail = getReviewerEmail(review);

//       return (
//         <div className="space-y-1">
//           <p className="font-medium text-foreground">{getReviewerName(review)}</p>
//           <p className="text-xs text-muted-foreground">{reviewerEmail || "Email unavailable"}</p>
//         </div>
//       );
//     },
//   },
//   {
//     accessorKey: "expert",
//     header: "Expert",
//     cell: ({ row }) => {
//       const review = row.original;

//       return (
//         <div className="space-y-1">
//           <p className="font-medium text-foreground">
//             {review.expert?.fullName || "Unknown expert"}
//           </p>
//           <p className="text-xs text-muted-foreground">
//             {review.expert?.title || "Consultation expert"}
//           </p>
//         </div>
//       );
//     },
//   },
//   {
//     accessorKey: "rating",
//     header: "Rating",
//     cell: ({ row }) => getRatingBadge(row.original.rating),
//   },
//   {
//     accessorKey: "visibility",
//     header: "Visibility",
//     cell: ({ row }) => getVisibilityBadge(row.original.isHidden),
//   },
//   {
//     accessorKey: "comment",
//     header: "Feedback",
//     cell: ({ row }) => (
//       <p className="max-w-md text-sm text-muted-foreground">
//         {truncateText(row.original.comment)}
//       </p>
//     ),
//   },
//   {
//     accessorKey: "consultation",
//     header: "Session",
//     cell: ({ row }) => {
//       const review = row.original;

//       return (
//         <div className="space-y-1">
//           <p className="text-sm font-medium text-foreground">
//             {formatDateTime(review.consultation?.date)}
//           </p>
//           {getConsultationStatusBadge(review.consultation?.status)}
//         </div>
//       );
//     },
//   },
//   {
//     accessorKey: "createdAt",
//     header: "Submitted",
//     cell: ({ row }) => (
//       <span className="text-sm text-muted-foreground">
//         {formatDateTime(row.original.createdAt)}
//       </span>
//     ),
//   },
// ];

// export default function ReviewsManagementTable() {
//   const router = useRouter();
//   const [searchTerm, setSearchTerm] = useState("");
//   const [filterValues, setFilterValues] = useState<DataTableFilterValues>({});
//   const [reviewToDelete, setReviewToDelete] = useState<ITestimonial | null>(null);

//   const { data: reviews = [], isLoading, isFetching, isError, error, refetch } = useQuery<
//     ITestimonial[]
//   >({
//     queryKey: ["reviews-management-table"],
//     queryFn: () => getAllTestimonials(100),
//     staleTime: 60 * 1000,
//   });

//   // const { mergedReviews, setReviewHidden } = useReviewOverrides(reviews);

//   const deleteMutation = useMutation({
//     mutationFn: (testimonialId: string) => deleteTestimonialAction(testimonialId),
//     onSuccess: () => {
//       toast.success("Review removed successfully.");
//       void refetch();
//     },
//     onError: (mutationError) => {
//       toast.error(getErrorMessage(mutationError, "Failed to delete the review."));
//     },
//   });

//   const filterConfigs = useMemo<DataTableFilterConfig[]>(
//     () => [
//       {
//         id: "rating",
//         label: "Rating",
//         type: "single-select",
//         options: [
//           { label: "5 stars", value: "5" },
//           { label: "4 stars", value: "4" },
//           { label: "3 stars", value: "3" },
//           { label: "2 stars", value: "2" },
//           { label: "1 star", value: "1" },
//         ],
//       },
//       {
//         id: "visibility",
//         label: "Visibility",
//         type: "single-select",
//         options: [
//           { label: "Visible", value: "visible" },
//           { label: "Hidden", value: "hidden" },
//         ],
//       },
//       {
//         id: "timeframe",
//         label: "Submitted",
//         type: "single-select",
//         options: [
//           { label: "Last 30 days", value: "last-30" },
//           { label: "Older than 30 days", value: "older" },
//         ],
//       },
//     ],
//     [],
//   );

//   const filteredReviews = useMemo(() => {
//     const normalizedSearch = searchTerm.trim().toLowerCase();
//     const ratingFilter = typeof filterValues.rating === "string" ? filterValues.rating : undefined;
//     const visibilityFilter =
//       typeof filterValues.visibility === "string" ? filterValues.visibility : undefined;
//     const timeframeFilter =
//       typeof filterValues.timeframe === "string" ? filterValues.timeframe : undefined;
//     const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;

//   //   return mergedReviews.filter((review) => {
//   //     const reviewDate = new Date(review.createdAt).getTime();
//   //     const matchesSearch =
//   //       !normalizedSearch ||
//   //       [
//   //         getReviewerName(review),
//   //         getReviewerEmail(review),
//   //         review.expert?.fullName,
//   //         review.expert?.title,
//   //         review.comment,
//   //       ]
//   //         .filter(Boolean)
//   //         .some((value) => value!.toLowerCase().includes(normalizedSearch));

//   //     const matchesRating =
//   //       !ratingFilter || Number(Math.round(review.rating || 0)) === Number(ratingFilter);

//   //     const matchesVisibility =
//   //       !visibilityFilter ||
//   //       (visibilityFilter === "hidden" ? Boolean(review.isHidden) : !review.isHidden);

//   //     const matchesTimeframe =
//   //       !timeframeFilter ||
//   //       (timeframeFilter === "last-30"
//   //         ? reviewDate >= thirtyDaysAgo
//   //         : Number.isNaN(reviewDate) || reviewDate < thirtyDaysAgo);

//   //     return matchesSearch && matchesRating && matchesVisibility && matchesTimeframe;
//   //   });
//   // }, [filterValues, mergedReviews, searchTerm]);

//   const handleCopyReview = async (review: ITestimonial) => {
//     try {
//       if (!navigator.clipboard?.writeText) {
//         throw new Error("Clipboard access is not available.");
//       }

//       await navigator.clipboard.writeText(
//         [
//           `Reviewer: ${getReviewerName(review)}`,
//           `Expert: ${review.expert?.fullName || "Unknown expert"}`,
//           `Rating: ${Number(review.rating || 0).toFixed(1)} / 5`,
//           `Comment: ${review.comment || "No written feedback provided."}`,
//         ].join("\n"),
//       );

//       toast.success("Review copied to clipboard.");
//     } catch (copyError) {
//       toast.error(getErrorMessage(copyError, "Unable to copy this review right now."));
//     }
//   };

//   const handleEmailClient = (review: ITestimonial) => {
//     const email = getReviewerEmail(review);

//     if (!email) {
//       toast.error("This reviewer does not have a contact email available.");
//       return;
//     }

//     window.location.href = `mailto:${email}?subject=${encodeURIComponent("ConsultEdge review follow-up")}`;
//   };

//   const toggleVisibility = (review: ITestimonial) => {
//     if (!review.id) {
//       toast.error("This review cannot be moderated yet.");
//       return;
//     }

//     const nextHiddenState = !review.isHidden;
//     setReviewHidden(review.id, nextHiddenState);
//     toast.success(
//       nextHiddenState
//         ? "Review hidden from the public expert page."
//         : "Review restored to public view.",
//     );
//   };

//   const submitDelete = async () => {
//     if (!reviewToDelete?.id) {
//       return;
//     }

//     await deleteMutation.mutateAsync(reviewToDelete.id);
//     setReviewToDelete(null);
//   };

//   const hasActiveFilters = Boolean(searchTerm.trim()) || Object.values(filterValues).some(Boolean);
//   const deleteTargetName = reviewToDelete ? getReviewerName(reviewToDelete) : "this reviewer";

//   return (
//     <>
//       <div className="space-y-6">
//         <ReviewSummaryCards reviews={mergedReviews} />

//         <Card>
//           <CardHeader>
//             <CardTitle>Review moderation workspace</CardTitle>
//             <CardDescription>
//               Admins can moderate visibility and manage review records, while experts publish the actual replies.
//             </CardDescription>
//           </CardHeader>

//           <CardContent className="space-y-4">
//             {isError ? (
//               <Alert variant="destructive">
//                 <AlertTitle>Could not load reviews</AlertTitle>
//                 <AlertDescription>
//                   {error instanceof Error
//                     ? error.message
//                     : "The reviews feed is unavailable right now."}
//                 </AlertDescription>
//               </Alert>
//             ) : null}

//             <Table
//               data={filteredReviews}
//               columns={columns}
//               isLoading={isLoading || isFetching}
//               emptyMessage={
//                 hasActiveFilters
//                   ? "No reviews match the current search or filters."
//                   : "No client reviews have been submitted yet."
//               }
//               search={{
//                 initialValue: searchTerm,
//                 placeholder: "Search by client, expert, or feedback...",
//                 onDebouncedChange: setSearchTerm,
//               }}
//               filters={{
//                 configs: filterConfigs,
//                 values: filterValues,
//                 onFilterChange: (filterId, value) => {
//                   setFilterValues((previous) => ({ ...previous, [filterId]: value }));
//                 },
//                 onClearAll: () => setFilterValues({}),
//               }}
//               toolbarAction={
//                 <Button variant="outline" onClick={() => void refetch()} disabled={isFetching}>
//                   <RefreshCw className={`mr-2 size-4 ${isFetching ? "animate-spin" : ""}`} />
//                   Refresh
//                 </Button>
//               }
//               actions={{
//                 onView: (review) => {
//                   if (review.expert?.id) {
//                     router.push(`/experts/${review.expert.id}`);
//                     return;
//                   }

//                   toast.error("This review is not linked to a public expert profile.");
//                 },
//                 onDelete: (review) => {
//                   if (!review.id) {
//                     toast.error("This review cannot be deleted yet.");
//                     return;
//                   }

//                   setReviewToDelete(review);
//                 },
//                 items: (review) => [
//                   {
//                     label: review.isHidden ? "Unhide review" : "Hide review",
//                     onClick: () => toggleVisibility(review),
//                     disabled: !review.id,
//                   },
//                   {
//                     label: "Email client",
//                     onClick: () => handleEmailClient(review),
//                     disabled: !getReviewerEmail(review),
//                   },
//                   {
//                     label: "Copy feedback",
//                     onClick: () => void handleCopyReview(review),
//                   },
//                 ],
//               }}
//             />
//           </CardContent>
//         </Card>
//       </div>

//       <AlertDialog
//         open={Boolean(reviewToDelete)}
//         onOpenChange={(open) => !open && setReviewToDelete(null)}
//       >
//         <AlertDialogContent>
//           <AlertDialogHeader>
//             <AlertDialogTitle>Delete this review?</AlertDialogTitle>
//             <AlertDialogDescription>
//               This will remove the feedback left by {deleteTargetName}. This action cannot be undone.
//             </AlertDialogDescription>
//           </AlertDialogHeader>

//           <AlertDialogFooter>
//             <AlertDialogCancel disabled={deleteMutation.isPending}>Cancel</AlertDialogCancel>
//             <AlertDialogAction
//               variant="destructive"
//               onClick={() => void submitDelete()}
//               disabled={deleteMutation.isPending}
//             >
//               {deleteMutation.isPending ? "Deleting..." : "Delete review"}
//             </AlertDialogAction>
//           </AlertDialogFooter>
//         </AlertDialogContent>
//       </AlertDialog>
//     </>
//   );
// }
