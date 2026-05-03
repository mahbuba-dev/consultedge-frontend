"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { Download, ExternalLink, FileText, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import Table, {
  type DataTableFilterConfig,
  type DataTableFilterValues,
  type DataTableRangeValue,
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  deleteExpertAction,
  getExperts,
  verifyExpertAction,
} from "@/src/services/expert.services";
import { createNotification } from "@/src/services/notification.service";
import type { IExpert, IVerifyExpertPayload } from "@/src/types/expert.types";
import { useServerDataTable } from "@/src/hooks/useServerDataTable";

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

const formatDate = (value?: string) => {
  if (!value) {
    return "—";
  }

  return new Date(value).toLocaleDateString();
};

const formatCurrency = (value?: number) => {
  if (typeof value !== "number") {
    return "—";
  }

  return `$${value.toLocaleString()}`;
};

const columns: ColumnDef<IExpert>[] = [
  {
    accessorKey: "fullName",
    header: "Expert",
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
    cell: ({ row }) => formatCurrency(row.original.consultationFee ?? row.original.price),
  },
  {
    accessorKey: "isVerified",
    header: "Verification",
    cell: ({ row }) =>
      row.original.isVerified ? (
        <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-500/15 dark:text-emerald-200 dark:hover:bg-emerald-500/15">
          Verified
        </Badge>
      ) : (
        <Badge variant="secondary">Pending</Badge>
      ),
  },
  {
    accessorKey: "createdAt",
    header: "Joined",
    cell: ({ row }) => formatDate(row.original.createdAt),
  },
];

export default function ExpertManageTable() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterValues, setFilterValues] = useState<DataTableFilterValues>({
    verification: "verified",
  });
  const [verificationTarget, setVerificationTarget] = useState<{
    expert: IExpert;
    status: IVerifyExpertPayload["status"];
  } | null>(null);
  const [verificationNotes, setVerificationNotes] = useState("");
  const [expertToDelete, setExpertToDelete] = useState<IExpert | null>(null);
  const [applicationTarget, setApplicationTarget] = useState<IExpert | null>(null);

  // -------------------------------------------------------------------
  // Server-side pagination with URL sync
  // -------------------------------------------------------------------
  const {
    paginationState,
    onPaginationChange,
    sortingState,
    onSortingChange,
    queryParams,
  } = useServerDataTable({ defaultPageSize: 10 });

  const { data, isLoading, isFetching, isError, error, refetch } = useQuery({
    queryKey: ["expert-management-table", queryParams],
    queryFn: () =>
      getExperts({
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
      expertId,
      payload,
      expert,
    }: {
      expertId: string;
      payload: IVerifyExpertPayload;
      expert: IExpert;
    }) => verifyExpertAction(expertId, payload),
    onSuccess: async (_, variables) => {
      toast.success(
        variables.payload.status === "APPROVED"
          ? "Expert approved successfully."
          : "Expert rejected successfully.",
      );

      if (variables.expert.userId) {
        try {
          await createNotification({
            type:
              variables.payload.status === "APPROVED"
                ? "EXPERT_APPROVED"
                : "EXPERT_REJECTED",
            userId: variables.expert.userId,
            message:
              variables.payload.status === "APPROVED"
                ? "Your expert application has been approved. You are now part of the ConsultEdge expert team."
                : "Your expert application has been reviewed and is currently not approved. Please check your dashboard for details.",
          });
        } catch {
          // Notification failure should not block moderation flow.
        }
      }

      await refetch();
    },
    onError: (mutationError) => {
      toast.error(getErrorMessage(mutationError, "Failed to update expert verification."));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (expertId: string) => deleteExpertAction(expertId),
    onSuccess: () => {
      toast.success("Expert deleted successfully.");
      void refetch();
    },
    onError: (mutationError) => {
      toast.error(getErrorMessage(mutationError, "Failed to delete expert."));
    },
  });

  const experts = useMemo<IExpert[]>(() => {
    return Array.isArray(data?.data) ? data.data : [];
  }, [data]);

  const industryOptions = useMemo(
    () =>
      [...new Set(experts.map((expert) => expert.industry?.name).filter(Boolean))]
        .sort()
        .map((name) => ({ label: name as string, value: name as string })),
    [experts],
  );

  const filterConfigs = useMemo<DataTableFilterConfig[]>(
    () => [
      {
        id: "verification",
        label: "Verification",
        type: "single-select",
        options: [
          { label: "Verified", value: "verified" },
          { label: "Pending", value: "pending" },
        ],
      },
      {
        id: "industry",
        label: "Industry",
        type: "single-select",
        options: industryOptions,
      },
      {
        id: "experience",
        label: "Experience",
        type: "range",
      },
    ],
    [industryOptions],
  );

  const filteredExperts = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    const verificationFilter =
      typeof filterValues.verification === "string" ? filterValues.verification : undefined;
    const industryFilter =
      typeof filterValues.industry === "string" ? filterValues.industry : undefined;
    const experienceFilter =
      filterValues.experience &&
      !Array.isArray(filterValues.experience) &&
      typeof filterValues.experience === "object"
        ? (filterValues.experience as DataTableRangeValue)
        : undefined;

    const minExperience = Number(experienceFilter?.gte ?? Number.NaN);
    const maxExperience = Number(experienceFilter?.lte ?? Number.NaN);

    return experts.filter((expert) => {
      const matchesSearch =
        !normalizedSearch ||
        [expert.fullName, expert.email, expert.title, expert.industry?.name]
          .filter(Boolean)
          .some((value) => value!.toLowerCase().includes(normalizedSearch));

      const matchesVerification =
        !verificationFilter ||
        (verificationFilter === "verified" ? Boolean(expert.isVerified) : !expert.isVerified);

      const matchesIndustry = !industryFilter || expert.industry?.name === industryFilter;
      const matchesMinExperience = Number.isNaN(minExperience) || expert.experience >= minExperience;
      const matchesMaxExperience = Number.isNaN(maxExperience) || expert.experience <= maxExperience;

      return (
        matchesSearch &&
        matchesVerification &&
        matchesIndustry &&
        matchesMinExperience &&
        matchesMaxExperience
      );
    });
  }, [experts, filterValues, searchTerm]);

  const isActionPending = verifyMutation.isPending || deleteMutation.isPending;

  const openVerificationDialog = (
    expert: IExpert,
    status: IVerifyExpertPayload["status"],
  ) => {
    setVerificationTarget({ expert, status });
    setVerificationNotes("");
  };

  const closeVerificationDialog = () => {
    setVerificationTarget(null);
    setVerificationNotes("");
  };

  const submitVerification = async () => {
    if (!verificationTarget) {
      return;
    }

    await verifyMutation.mutateAsync({
      expertId: verificationTarget.expert.id,
      expert: verificationTarget.expert,
      payload: {
        status: verificationTarget.status,
        ...(verificationNotes.trim() ? { notes: verificationNotes.trim() } : {}),
      },
    });

    closeVerificationDialog();
  };

  const submitDelete = async () => {
    if (!expertToDelete) {
      return;
    }

    await deleteMutation.mutateAsync(expertToDelete.id);
    setExpertToDelete(null);
  };

  const verificationActionLabel =
    verificationTarget?.status === "APPROVED" ? "Approve expert" : "Reject expert";

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Expert management</CardTitle>
          <CardDescription>
            Search, filter, sort, and paginate through the expert directory.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {isError ? (
            <Alert variant="destructive">
              <AlertTitle>Could not load experts</AlertTitle>
              <AlertDescription>
                {error instanceof Error
                  ? error.message
                  : "The expert list is unavailable right now."}
              </AlertDescription>
            </Alert>
          ) : null}

          <Table
            data={filteredExperts}
            columns={columns}
            meta={data?.meta}
            isLoading={isLoading || isFetching}
            emptyMessage="No experts match the current search or filters."
            pagination={{
              state: paginationState,
              onPaginationChange,
            }}
            sorting={{
              state: sortingState,
              onSortingChange,
            }}
            actions={{
              items: (expert) => [
                {
                  label: "View application",
                  onClick: () => setApplicationTarget(expert),
                },
                {
                  label: "Open profile",
                  onClick: () => router.push(`/experts/${expert.id}`),
                },
                {
                  label: expert.isVerified ? "Already approved" : "Approve",
                  onClick: () => openVerificationDialog(expert, "APPROVED"),
                  disabled: isActionPending || Boolean(expert.isVerified),
                },
                {
                  label: expert.isVerified ? "Reject / revoke" : "Reject",
                  onClick: () => openVerificationDialog(expert, "REJECTED"),
                  disabled: isActionPending,
                  destructive: true,
                },
                {
                  label: "Delete",
                  onClick: () => setExpertToDelete(expert),
                  disabled: isActionPending,
                  destructive: true,
                },
              ],
            }}
            search={{
              initialValue: searchTerm,
              placeholder: "Search experts by name, email, title...",
              onDebouncedChange: setSearchTerm,
            }}
            filters={{
              configs: filterConfigs,
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
                disabled={isLoading || isFetching || isActionPending}
              >
                <RefreshCw className={`mr-2 size-4 ${isFetching ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            }
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
                  <p className="mt-0.5">{formatCurrency(applicationTarget.consultationFee ?? applicationTarget.price)}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Applied On</p>
                  <p className="mt-0.5">{formatDate(applicationTarget.createdAt)}</p>
                </div>
              </div>

              {applicationTarget.bio && (
                <div>
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Bio</p>
                  <p className="rounded-lg border border-border bg-muted/40 px-3 py-2.5 text-sm leading-relaxed">
                    {applicationTarget.bio}
                  </p>
                </div>
              )}

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

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setApplicationTarget(null)}>
              Close
            </Button>
            {applicationTarget && !applicationTarget.isVerified && (
              <Button
                type="button"
                onClick={() => {
                  setApplicationTarget(null);
                  openVerificationDialog(applicationTarget, "APPROVED");
                }}
              >
                Approve expert
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(verificationTarget)}
        onOpenChange={(open) => {
          if (!open) {
            closeVerificationDialog();
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{verificationActionLabel}</DialogTitle>
            <DialogDescription>
              {verificationTarget
                ? `Update verification for ${verificationTarget.expert.fullName}. You can optionally include a note for the expert.`
                : "Update expert verification."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">Admin note</p>
            <Textarea
              value={verificationNotes}
              onChange={(event) => setVerificationNotes(event.target.value)}
              placeholder={
                verificationTarget?.status === "REJECTED"
                  ? "Why was this expert rejected?"
                  : "Optional note for this approval"
              }
              rows={5}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={closeVerificationDialog}>
              Cancel
            </Button>
            <Button
              type="button"
              variant={verificationTarget?.status === "REJECTED" ? "destructive" : "default"}
              onClick={() => void submitVerification()}
              disabled={verifyMutation.isPending}
            >
              {verifyMutation.isPending ? "Saving..." : verificationActionLabel}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={Boolean(expertToDelete)}
        onOpenChange={(open) => {
          if (!open) {
            setExpertToDelete(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete expert record?</AlertDialogTitle>
            <AlertDialogDescription>
              {expertToDelete
                ? `This will permanently remove ${expertToDelete.fullName} from the expert list.`
                : "This action cannot be undone."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => void submitDelete()}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
