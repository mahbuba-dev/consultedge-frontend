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
} from "@/components/modules/Table/Table";
import { useServerDataTable } from "@/src/hooks/useServerDataTable";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import type {
  ConsultationStatus,
  IConsultation,
  PaymentStatus,
} from "@/src/types/booking.types";
import { cancelUnpaidBookingsAction, getAllBookings, updateConsultationStatus } from "@/src/services/bookings.service";

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

const formatDateTime = (value?: string) => {
  if (!value) {
    return "—";
  }

  return new Date(value).toLocaleString();
};

const formatCurrency = (value?: number) => {
  if (typeof value !== "number") {
    return "—";
  }

  return `$${value.toLocaleString()}`;
};

const getConsultationStatusBadge = (status: ConsultationStatus) => {
  switch (status) {
    case "CONFIRMED":
      return <Badge className="bg-sky-100 text-sky-700 hover:bg-sky-100 dark:bg-sky-500/15 dark:text-sky-200 dark:hover:bg-sky-500/15">Confirmed</Badge>;
    case "COMPLETED":
      return (
        <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-500/15 dark:text-emerald-200 dark:hover:bg-emerald-500/15">
          Completed
        </Badge>
      );
    case "CANCELLED":
      return <Badge variant="destructive">Cancelled</Badge>;
    default:
      return <Badge variant="secondary">Pending</Badge>;
  }
};

const getPaymentStatusBadge = (status: PaymentStatus) => {
  switch (status) {
    case "PAID":
      return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-500/15 dark:text-emerald-200 dark:hover:bg-emerald-500/15">Paid</Badge>;
    case "FAILED":
      return <Badge variant="destructive">Failed</Badge>;
    case "REFUNDED":
      return <Badge variant="outline">Refunded</Badge>;
    default:
      return <Badge variant="secondary">Unpaid</Badge>;
  }
};

const columns: ColumnDef<IConsultation>[] = [
  {
    accessorKey: "client",
    header: "Client",
    cell: ({ row }) => {
      const booking = row.original;

      return (
        <div className="space-y-1">
          <p className="font-medium">{booking.client?.fullName || "Unknown client"}</p>
          <p className="text-xs text-muted-foreground">{booking.client?.email || "No email"}</p>
        </div>
      );
    },
  },
  {
    accessorKey: "expert",
    header: "Expert",
    cell: ({ row }) => {
      const booking = row.original;

      return (
        <div className="space-y-1">
          <p className="font-medium">{booking.expert?.fullName || "Unknown expert"}</p>
          <p className="text-xs text-muted-foreground">{booking.expert?.title || "No title"}</p>
        </div>
      );
    },
  },
  {
    accessorKey: "date",
    header: "Session time",
    cell: ({ row }) => formatDateTime(row.original.date),
  },
  {
    accessorKey: "status",
    header: "Consultation",
    cell: ({ row }) => getConsultationStatusBadge(row.original.status),
  },
  {
    accessorKey: "paymentStatus",
    header: "Payment",
    cell: ({ row }) => getPaymentStatusBadge(row.original.paymentStatus),
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) =>
      formatCurrency(row.original.payment?.amount ?? row.original.expert?.consultationFee),
  },
  {
    accessorKey: "createdAt",
    header: "Booked on",
    cell: ({ row }) => formatDateTime(row.original.createdAt),
  },
];

const filterConfigs: DataTableFilterConfig[] = [
  {
    id: "status",
    label: "Consultation status",
    type: "single-select",
    options: [
      { label: "Pending", value: "PENDING" },
      { label: "Confirmed", value: "CONFIRMED" },
      { label: "Completed", value: "COMPLETED" },
      { label: "Cancelled", value: "CANCELLED" },
    ],
  },
  {
    id: "paymentStatus",
    label: "Payment status",
    type: "single-select",
    options: [
      { label: "Unpaid", value: "UNPAID" },
      { label: "Paid", value: "PAID" },
      { label: "Failed", value: "FAILED" },
      { label: "Refunded", value: "REFUNDED" },
    ],
  },
];

export default function BookingsManageTable() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterValues, setFilterValues] = useState<DataTableFilterValues>({});
  const [statusTarget, setStatusTarget] = useState<IConsultation | null>(null);
  const [nextStatus, setNextStatus] = useState<ConsultationStatus>("PENDING");
  const [isCancelUnpaidOpen, setIsCancelUnpaidOpen] = useState(false);

  // Server-side pagination with URL sync
  const {
    paginationState,
    onPaginationChange,
    sortingState,
    onSortingChange,
    queryParams,
  } = useServerDataTable({ defaultPageSize: 10 });

  const { data, isLoading, isFetching, isError, error, refetch } = useQuery({
    queryKey: ["bookings-management-table", queryParams],
    queryFn: () =>
      getAllBookings({
        page: queryParams.page,
        limit: queryParams.limit,
        sortBy: queryParams.sortBy,
        sortOrder: queryParams.sortOrder,
        searchTerm: searchTerm.trim() || undefined,
      }),
    staleTime: 60 * 1000,
    placeholderData: (prev) => prev,
  });

  const updateMutation = useMutation({
    mutationFn: ({ consultationId, status }: { consultationId: string; status: ConsultationStatus }) =>
      updateConsultationStatus(consultationId, status),
    onSuccess: (_, variables) => {
      toast.success(`Booking marked as ${variables.status.toLowerCase()}.`);
      void refetch();
    },
    onError: (mutationError) => {
      toast.error(getErrorMessage(mutationError, "Failed to update booking status."));
    },
  });

  const cancelUnpaidMutation = useMutation({
    mutationFn: cancelUnpaidBookingsAction,
    onSuccess: () => {
      toast.success("Unpaid consultations were cancelled successfully.");
      void refetch();
    },
    onError: (mutationError) => {
      toast.error(getErrorMessage(mutationError, "Failed to cancel unpaid consultations."));
    },
  });

  const bookings = useMemo(() => (Array.isArray(data?.data) ? data.data : []), [data]);

  const filteredBookings = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    const statusFilter = typeof filterValues.status === "string" ? filterValues.status : undefined;
    const paymentStatusFilter =
      typeof filterValues.paymentStatus === "string" ? filterValues.paymentStatus : undefined;

    return bookings.filter((booking) => {
      const matchesSearch =
        !normalizedSearch ||
        [
          booking.client?.fullName,
          booking.client?.email,
          booking.expert?.fullName,
          booking.expert?.email,
          booking.videoCallId,
        ]
          .filter(Boolean)
          .some((value) => value!.toLowerCase().includes(normalizedSearch));

      const matchesStatus = !statusFilter || booking.status === statusFilter;
      const matchesPaymentStatus =
        !paymentStatusFilter || booking.paymentStatus === paymentStatusFilter;

      return matchesSearch && matchesStatus && matchesPaymentStatus;
    });
  }, [bookings, filterValues, searchTerm]);

  const isActionPending = updateMutation.isPending || cancelUnpaidMutation.isPending;

  const openStatusDialog = (booking: IConsultation) => {
    setStatusTarget(booking);
    setNextStatus(booking.status);
  };

  const closeStatusDialog = () => {
    setStatusTarget(null);
    setNextStatus("PENDING");
  };

  const submitStatusChange = async () => {
    if (!statusTarget) {
      return;
    }

    await updateMutation.mutateAsync({
      consultationId: statusTarget.id,
      status: nextStatus,
    });

    closeStatusDialog();
  };

  const submitCancelUnpaid = async () => {
    await cancelUnpaidMutation.mutateAsync();
    setIsCancelUnpaidOpen(false);
  };

  return (
    <>
      <Card className="relative overflow-hidden border-slate-200/70 bg-white/70 shadow-sm backdrop-blur dark:border-white/10 dark:bg-slate-900/60">
        <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-blue-600 via-cyan-500 to-teal-400" />
        <div className="pointer-events-none absolute -right-24 -top-24 hidden size-72 rounded-full bg-cyan-500/10 blur-3xl dark:block" />

        <CardHeader className="relative">
          <CardTitle className="text-2xl font-bold tracking-tight">Bookings management</CardTitle>
          <CardDescription>
            Review consultation bookings, track payment state, and update statuses from one place.
          </CardDescription>
        </CardHeader>

        <CardContent className="relative space-y-4">
          {isError ? (
            <Alert variant="destructive">
              <AlertTitle>Could not load bookings</AlertTitle>
              <AlertDescription>
                {error instanceof Error
                  ? error.message
                  : "The bookings list is unavailable right now. Make sure the backend exposes `GET /consultations`."}
              </AlertDescription>
            </Alert>
          ) : null}

          <Table
            data={filteredBookings}
            columns={columns}
            meta={data?.meta}
            isLoading={isLoading || isFetching}
            emptyMessage="No bookings match the current search or filters."
            pagination={{
              state: paginationState,
              onPaginationChange,
            }}
            sorting={{
              state: sortingState,
              onSortingChange,
            }}
            actions={{
              items: (booking) => [
                {
                  label: booking.client?.email ? "Email client" : "No client email",
                  onClick: () => {
                    if (booking.client?.email) {
                      window.location.href = `mailto:${booking.client.email}`;
                    }
                  },
                  disabled: !booking.client?.email,
                },
                {
                  label: booking.expert?.id ? "Open expert" : "No expert profile",
                  onClick: () => {
                    if (booking.expert?.id) {
                      router.push(`/experts/${booking.expert.id}`);
                    }
                  },
                  disabled: !booking.expert?.id,
                },
                {
                  label: "Change status",
                  onClick: () => openStatusDialog(booking),
                  disabled: isActionPending,
                },
              ],
            }}
            search={{
              initialValue: searchTerm,
              placeholder: "Search by client, expert, email, or video call ID...",
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
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => void refetch()}
                  disabled={isLoading || isFetching || isActionPending}
                >
                  <RefreshCw className={`mr-2 size-4 ${isFetching ? "animate-spin" : ""}`} />
                  Refresh
                </Button>

                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => setIsCancelUnpaidOpen(true)}
                  disabled={isActionPending}
                >
                  Cancel unpaid
                </Button>
              </div>
            }
          />
        </CardContent>
      </Card>

      <Dialog
        open={Boolean(statusTarget)}
        onOpenChange={(open) => {
          if (!open) {
            closeStatusDialog();
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update booking status</DialogTitle>
            <DialogDescription>
              {statusTarget
                ? `Change the consultation status for ${statusTarget.client?.fullName || "this booking"}.`
                : "Update booking status."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">New status</p>
            <Select value={nextStatus} onValueChange={(value) => setNextStatus(value as ConsultationStatus)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select consultation status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={closeStatusDialog}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => void submitStatusChange()}
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isCancelUnpaidOpen} onOpenChange={setIsCancelUnpaidOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel all unpaid bookings?</AlertDialogTitle>
            <AlertDialogDescription>
              This will run the admin action that cancels consultations which are still unpaid and too close to their start time.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={cancelUnpaidMutation.isPending}>Keep bookings</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => void submitCancelUnpaid()}
              disabled={cancelUnpaidMutation.isPending}
            >
              {cancelUnpaidMutation.isPending ? "Cancelling..." : "Cancel unpaid"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
