"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { RefreshCw } from "lucide-react";
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
import type { IExpert, IVerifyExpertPayload } from "@/src/types/expert.types";

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
        <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
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
  const [filterValues, setFilterValues] = useState<DataTableFilterValues>({});
  const [verificationTarget, setVerificationTarget] = useState<{
    expert: IExpert;
    status: IVerifyExpertPayload["status"];
  } | null>(null);
  const [verificationNotes, setVerificationNotes] = useState("");
  const [expertToDelete, setExpertToDelete] = useState<IExpert | null>(null);

  const { data, isLoading, isFetching, isError, error, refetch } = useQuery({
    queryKey: ["expert-management-table"],
    queryFn: () => getExperts(),
  });

  const verifyMutation = useMutation({
    mutationFn: ({
      expertId,
      payload,
    }: {
      expertId: string;
      payload: IVerifyExpertPayload;
    }) => verifyExpertAction(expertId, payload),
    onSuccess: (_, variables) => {
      toast.success(
        variables.payload.status === "APPROVED"
          ? "Expert approved successfully."
          : "Expert rejected successfully.",
      );
      void refetch();
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
            isLoading={isLoading || isFetching}
            emptyMessage="No experts match the current search or filters."
            actions={{
              items: (expert) => [
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
