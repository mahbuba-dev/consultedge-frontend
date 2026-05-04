"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { Download, ExternalLink, FileText, RefreshCw } from "lucide-react";
import { toast } from "sonner";

import Table, {
  type DataTableFilterConfig,
  type DataTableFilterValues,
} from "./Table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  getNewApplicants,
  reviewExpertApplicationAction,
} from "@/src/services/expert.services";
import type {
  IExpertApplication,
  IReviewExpertApplicationPayload,
} from "@/src/types/expert.types";
import { useServerDataTable } from "@/src/hooks/useServerDataTable";

const formatDate = (value?: string) => {
  if (!value) return "-";
  return new Date(value).toLocaleDateString();
};

const formatCurrency = (value?: number) => {
  if (typeof value !== "number") return "-";
  return `$${value.toLocaleString()}`;
};

const columns: ColumnDef<IExpertApplication>[] = [
  {
    accessorKey: "fullName",
    header: "Applicant",
    cell: ({ row }) => {
      const expert = row.original;
      return (
        <div className="space-y-1">
          <p className="font-medium">{expert.fullName}</p>
          <p className="text-xs text-muted-foreground">{expert.email}</p>
          <p className="text-xs text-muted-foreground">{expert.title || "No title added"}</p>
        </div>
      );
    },
  },
  {
    accessorFn: (row) => row.industry?.name ?? "Unassigned",
    id: "industry",
    header: "Industry",
    cell: ({ row }) => row.original.industry?.name ?? "Unassigned",
  },
  {
    accessorKey: "experience",
    header: "Experience",
    cell: ({ row }) => `${row.original.experience ?? 0} yrs`,
  },
  {
    accessorKey: "consultationFee",
    header: "Fee",
    cell: ({ row }) => formatCurrency(row.original.consultationFee),
  },
  {
    accessorKey: "createdAt",
    header: "Applied",
    cell: ({ row }) => formatDate(row.original.createdAt),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) =>
      row.original.status === "APPROVED" ? (
        <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-500/15 dark:text-emerald-200 dark:hover:bg-emerald-500/15">
          Approved
        </Badge>
      ) : row.original.status === "REJECTED" ? (
        <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-100 dark:bg-rose-500/15 dark:text-rose-200 dark:hover:bg-rose-500/15">
          Rejected
        </Badge>
      ) : (
        <Badge variant="secondary">Pending review</Badge>
      ),
  },
];

const filterConfigs: DataTableFilterConfig[] = [
  {
    id: "industry",
    label: "Industry",
    type: "single-select",
    options: [],
  },
];

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

export default function NewApplicantsTable() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterValues, setFilterValues] = useState<DataTableFilterValues>({});
  const [applicationTarget, setApplicationTarget] = useState<IExpertApplication | null>(null);
  const [decisionTarget, setDecisionTarget] = useState<{
    application: IExpertApplication;
    status: IReviewExpertApplicationPayload["status"];
  } | null>(null);
  // Track applications the admin already acted on so the row UI updates the
  // moment they click Approve / Reject — even before the network round-trip.
  const [optimisticDecisions, setOptimisticDecisions] = useState<
    Record<string, "APPROVED" | "REJECTED">
  >({});

  const {
    paginationState,
    onPaginationChange,
    sortingState,
    onSortingChange,
    queryParams,
  } = useServerDataTable({ defaultPageSize: 10 });

  const { data, isLoading, isFetching, isError, error, refetch } = useQuery({
    queryKey: ["new-applicants-table", queryParams, searchTerm],
    queryFn: () =>
      getNewApplicants({
        page: queryParams.page,
        limit: queryParams.limit,
        sortBy: queryParams.sortBy,
        sortOrder: queryParams.sortOrder,
        searchTerm: searchTerm.trim() || undefined,
      }),
    staleTime: 60 * 1000,
    placeholderData: (prev) => prev,
  });

  const verifyMutation = useMutation({
    mutationFn: ({
      applicationId,
      payload,
    }: {
      applicationId: string;
      payload: IReviewExpertApplicationPayload;
    }) => reviewExpertApplicationAction(applicationId, payload),
    // Optimistic: immediately reflect the decision in the table + toast, so the
    // admin doesn't sit through a 30-second cold start spinner.
    onMutate: ({ applicationId, payload }) => {
      const status = payload.status as "APPROVED" | "REJECTED";
      setOptimisticDecisions((prev) => ({ ...prev, [applicationId]: status }));
      toast.success(
        status === "APPROVED"
          ? "Applicant approved. They are now an expert."
          : "Applicant rejected.",
      );
      return { applicationId };
    },
    onSuccess: () => {
      // Refresh the pending list + the sidebar badge in the background.
      void queryClient.invalidateQueries({ queryKey: ["new-applicants-table"] });
      void queryClient.invalidateQueries({ queryKey: ["pending-applicants-count"] });
    },
    onError: (mutationError, variables, context) => {
      const message = getErrorMessage(mutationError, "Failed to review application.");
      // The very common race when the optimistic toast already fired AND the
      // server confirms the previous click — treat as success and keep the row
      // in its decided state.
      if (/already reviewed|already approved|already rejected/i.test(message)) {
        void queryClient.invalidateQueries({ queryKey: ["new-applicants-table"] });
        return;
      }
      // Real failure — roll back the optimistic state and surface a single
      // error toast (replaces the optimistic success).
      if (context?.applicationId) {
        setOptimisticDecisions((prev) => {
          const next = { ...prev };
          delete next[context.applicationId];
          return next;
        });
      }
      toast.dismiss();
      toast.error(message);
    },
  });

  const applicants = useMemo<IExpertApplication[]>(() => {
    return Array.isArray(data?.data) ? data.data : [];
  }, [data]);

  const decoratedApplicants = useMemo<IExpertApplication[]>(
    () =>
      applicants.map((applicant) => {
        const decision = optimisticDecisions[applicant.id];
        return decision ? { ...applicant, status: decision } : applicant;
      }),
    [applicants, optimisticDecisions],
  );

  const industryOptions = useMemo(
    () =>
      [...new Set(applicants.map((expert) => expert.industry?.name).filter(Boolean))]
        .sort()
        .map((name) => ({ label: name as string, value: name as string })),
    [applicants],
  );

  const effectiveFilters: DataTableFilterConfig[] = useMemo(
    () => [
      {
        ...filterConfigs[0],
        options: industryOptions,
      },
    ],
    [industryOptions],
  );

  const filteredApplicants = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    const industryFilter =
      typeof filterValues.industry === "string" ? filterValues.industry : undefined;

    return decoratedApplicants.filter((expert) => {
      const matchesSearch =
        !normalizedSearch ||
        [expert.fullName, expert.email, expert.title, expert.industry?.name]
          .filter(Boolean)
          .some((value) => value!.toLowerCase().includes(normalizedSearch));

      const matchesIndustry = !industryFilter || expert.industry?.name === industryFilter;
      return matchesSearch && matchesIndustry;
    });
  }, [decoratedApplicants, filterValues, searchTerm]);

  const submitDecision = () => {
    if (!decisionTarget) return;

    // Fire-and-forget: optimistic UI handles the rest. Close the dialog
    // immediately so the admin gets instant feedback.
    verifyMutation.mutate({
      applicationId: decisionTarget.application.id,
      payload: { status: decisionTarget.status },
    });

    setDecisionTarget(null);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>New applicants</CardTitle>
          <CardDescription>
            Review fresh expert applications. Approved applicants will appear in Expert management.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {isError ? (
            <Alert variant="destructive">
              <AlertTitle>Could not load applicants</AlertTitle>
              <AlertDescription>
                {error instanceof Error
                  ? error.message
                  : "The applicants list is unavailable right now."}
              </AlertDescription>
            </Alert>
          ) : null}

          <Table
            data={filteredApplicants}
            columns={columns}
            meta={data?.meta}
            isLoading={isLoading || isFetching}
            emptyMessage="No pending applicants found."
            pagination={{
              state: paginationState,
              onPaginationChange,
            }}
            sorting={{
              state: sortingState,
              onSortingChange,
            }}
            search={{
              initialValue: searchTerm,
              placeholder: "Search applicants by name, email, title...",
              onDebouncedChange: setSearchTerm,
            }}
            filters={{
              configs: effectiveFilters,
              values: filterValues,
              onFilterChange: (filterId, value) => {
                setFilterValues((current) => ({
                  ...current,
                  [filterId]: value,
                }));
              },
              onClearAll: () => setFilterValues({}),
            }}
            toolbarAction={
              <Button
                type="button"
                variant="outline"
                onClick={() => void refetch()}
                disabled={isLoading || isFetching || verifyMutation.isPending}
              >
                <RefreshCw className={`mr-2 size-4 ${isFetching ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            }
            actions={{
              items: (application) => [
                {
                  label: "View application",
                  onClick: () => setApplicationTarget(application),
                  disabled: verifyMutation.isPending,
                },
                {
                  label: "Approve",
                  onClick: () => setDecisionTarget({ application, status: "APPROVED" }),
                  disabled: verifyMutation.isPending,
                },
                {
                  label: "Reject",
                  onClick: () => setDecisionTarget({ application, status: "REJECTED" }),
                  disabled: verifyMutation.isPending,
                  destructive: true,
                },
              ],
            }}
          />
        </CardContent>
      </Card>

      <Dialog
        open={Boolean(applicationTarget)}
        onOpenChange={(open) => {
          if (!open) setApplicationTarget(null);
        }}
      >
        <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Application Overview
            </DialogTitle>
            <DialogDescription>
              Submitted application details for {applicationTarget?.fullName}.
            </DialogDescription>
          </DialogHeader>

          {applicationTarget && (
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Full Name</p>
                  <p className="mt-0.5">{applicationTarget.fullName}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Email</p>
                  <p className="mt-0.5 break-all">{applicationTarget.email}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Phone</p>
                  <p className="mt-0.5">{applicationTarget.phone || "—"}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Industry</p>
                  <p className="mt-0.5">{applicationTarget.industry?.name || "—"}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Title</p>
                  <p className="mt-0.5">{applicationTarget.title || "—"}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Experience</p>
                  <p className="mt-0.5">{applicationTarget.experience ?? 0} years</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Consultation Fee</p>
                  <p className="mt-0.5">{formatCurrency(applicationTarget.consultationFee)}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Applied On</p>
                  <p className="mt-0.5">{formatDate(applicationTarget.createdAt)}</p>
                </div>
              </div>

              {applicationTarget.bio ? (
                <div>
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Bio</p>
                  <p className="rounded-lg border border-border bg-muted/40 px-3 py-2.5 text-sm leading-relaxed">
                    {applicationTarget.bio}
                  </p>
                </div>
              ) : null}

              <div className="border-t border-border pt-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Resume / CV</p>
                {applicationTarget.resumeUrl ? (
                  <div className="flex flex-wrap gap-2">
                    <a
                      href={applicationTarget.resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-md border border-border bg-muted/50 px-3 py-1.5 text-sm transition hover:bg-muted"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      View Resume
                    </a>
                    <a
                      href={applicationTarget.resumeUrl}
                      download
                      className="inline-flex items-center gap-1.5 rounded-md border border-primary/40 bg-primary/10 px-3 py-1.5 text-sm text-primary transition hover:bg-primary/20"
                    >
                      <Download className="h-3.5 w-3.5" />
                      Download Resume
                    </a>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No resume uploaded.</p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={Boolean(decisionTarget)}
        onOpenChange={(open) => {
          if (!open) setDecisionTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {decisionTarget?.status === "APPROVED" ? "Approve applicant" : "Reject applicant"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {decisionTarget
                ? `${decisionTarget.status === "APPROVED" ? "Approve" : "Reject"} ${decisionTarget.application.fullName}'s application?`
                : "Confirm your decision."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={verifyMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => submitDecision()} disabled={verifyMutation.isPending}>
              {decisionTarget?.status === "APPROVED" ? "Approve" : "Reject"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
