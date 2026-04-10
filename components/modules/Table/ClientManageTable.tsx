"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { RefreshCw } from "lucide-react";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  deleteClientAction,
  getAllClients,
  type IUpdateClientPayload,
  updateClientAction,
} from "@/src/services/client.service";
import { type IUserManagementItem, UserStatus } from "@/src/types/user.types";

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

const getStatusBadge = (status?: string) => {
  switch (status) {
    case UserStatus.ACTIVE:
      return (
        <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Active</Badge>
      );
    case UserStatus.BLOCKED:
      return <Badge variant="destructive">Blocked</Badge>;
    case UserStatus.DELETED:
      return <Badge variant="secondary">Deleted</Badge>;
    default:
      return <Badge variant="outline">Unknown</Badge>;
  }
};

const columns: ColumnDef<IUserManagementItem>[] = [
  {
    accessorKey: "name",
    header: "Client",
    cell: ({ row }) => {
      const client = row.original;

      return (
        <div className="space-y-1">
          <p className="font-medium">{client.name || "Unnamed client"}</p>
          <p className="text-xs text-muted-foreground">ID: {client.userId ?? client.id}</p>
        </div>
      );
    },
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => getStatusBadge(row.original.status),
  },
  {
    accessorKey: "emailVerified",
    header: "Email verified",
    cell: ({ row }) =>
      row.original.emailVerified ? (
        <Badge className="bg-sky-100 text-sky-700 hover:bg-sky-100">Verified</Badge>
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

const filterConfigs: DataTableFilterConfig[] = [
  {
    id: "status",
    label: "Status",
    type: "single-select",
    options: [
      { label: "Active", value: UserStatus.ACTIVE },
      { label: "Blocked", value: UserStatus.BLOCKED },
      { label: "Deleted", value: UserStatus.DELETED },
    ],
  },
  {
    id: "emailVerified",
    label: "Email verification",
    type: "single-select",
    options: [
      { label: "Verified", value: "verified" },
      { label: "Pending", value: "pending" },
    ],
  },
];

const buildEditFormState = (client?: IUserManagementItem | null) => ({
  fullName: client?.fullName ?? client?.name ?? "",
  email: client?.email ?? "",
  phone: client?.phone ?? "",
  address: client?.address ?? "",
});

export default function ClientManageTable() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterValues, setFilterValues] = useState<DataTableFilterValues>({});
  const [editTarget, setEditTarget] = useState<IUserManagementItem | null>(null);
  const [editForm, setEditForm] = useState(buildEditFormState());
  const [clientToDelete, setClientToDelete] = useState<IUserManagementItem | null>(null);

  const { data, isLoading, isFetching, isError, error, refetch } = useQuery({
    queryKey: ["client-management-table"],
    queryFn: () => getAllClients(),
  });

  const updateMutation = useMutation({
    mutationFn: ({
      clientId,
      payload,
    }: {
      clientId: string;
      payload: IUpdateClientPayload;
    }) => updateClientAction(clientId, payload),
    onSuccess: () => {
      toast.success("Client updated successfully.");
      void refetch();
    },
    onError: (mutationError) => {
      toast.error(getErrorMessage(mutationError, "Failed to update client."));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (clientId: string) => deleteClientAction(clientId),
    onSuccess: () => {
      toast.success("Client deleted successfully.");
      void refetch();
    },
    onError: (mutationError) => {
      toast.error(getErrorMessage(mutationError, "Failed to delete client."));
    },
  });

  const clients = useMemo(() => (Array.isArray(data?.data) ? data.data : []), [data]);

  const filteredClients = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    const statusFilter = typeof filterValues.status === "string" ? filterValues.status : undefined;
    const emailVerifiedFilter =
      typeof filterValues.emailVerified === "string" ? filterValues.emailVerified : undefined;

    return clients.filter((client) => {
      const matchesSearch =
        !normalizedSearch ||
        [client.name, client.email]
          .filter(Boolean)
          .some((value) => value!.toLowerCase().includes(normalizedSearch));

      const matchesStatus = !statusFilter || client.status === statusFilter;
      const matchesEmailVerified =
        !emailVerifiedFilter ||
        (emailVerifiedFilter === "verified"
          ? Boolean(client.emailVerified)
          : !client.emailVerified);

      return matchesSearch && matchesStatus && matchesEmailVerified;
    });
  }, [clients, filterValues, searchTerm]);

  const isActionPending = updateMutation.isPending || deleteMutation.isPending;

  const openEditDialog = (client: IUserManagementItem) => {
    setEditTarget(client);
    setEditForm(buildEditFormState(client));
  };

  const closeEditDialog = () => {
    setEditTarget(null);
    setEditForm(buildEditFormState());
  };

  const submitEdit = async () => {
    if (!editTarget) {
      return;
    }

    await updateMutation.mutateAsync({
      clientId: editTarget.id,
      payload: {
        fullName: editForm.fullName.trim(),
        email: editForm.email.trim(),
        ...(editForm.phone.trim() ? { phone: editForm.phone.trim() } : {}),
        ...(editForm.address.trim() ? { address: editForm.address.trim() } : {}),
      },
    });

    closeEditDialog();
  };

  const submitDelete = async () => {
    if (!clientToDelete) {
      return;
    }

    await deleteMutation.mutateAsync(clientToDelete.id);
    setClientToDelete(null);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Client management</CardTitle>
          <CardDescription>
            Browse all client accounts with quick search, filters, sorting, and pagination.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {isError ? (
            <Alert variant="destructive">
              <AlertTitle>Could not load clients</AlertTitle>
              <AlertDescription>
                {error instanceof Error
                  ? error.message
                  : "The client list is unavailable right now. Make sure the backend exposes `GET /clients`."}
              </AlertDescription>
            </Alert>
          ) : null}

          <Table
            data={filteredClients}
            columns={columns}
            isLoading={isLoading || isFetching}
            emptyMessage="No clients match the current search or filters."
            actions={{
              items: (client) => [
                {
                  label: "Email client",
                  onClick: () => {
                    window.location.href = `mailto:${client.email}`;
                  },
                },
                {
                  label: "Edit client",
                  onClick: () => openEditDialog(client),
                  disabled: isActionPending,
                },
                {
                  label: "Delete",
                  onClick: () => setClientToDelete(client),
                  disabled: isActionPending,
                  destructive: true,
                },
              ],
            }}
            search={{
              initialValue: searchTerm,
              placeholder: "Search clients by name or email...",
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
        open={Boolean(editTarget)}
        onOpenChange={(open) => {
          if (!open) {
            closeEditDialog();
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit client</DialogTitle>
            <DialogDescription>
              {editTarget
                ? `Update profile information for ${editTarget.fullName || editTarget.name || editTarget.email}.`
                : "Update client account details."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-3">
            <div className="space-y-1.5">
              <p className="text-sm font-medium text-foreground">Full name</p>
              <Input
                value={editForm.fullName}
                onChange={(event) =>
                  setEditForm((current) => ({ ...current, fullName: event.target.value }))
                }
                placeholder="Client full name"
              />
            </div>

            <div className="space-y-1.5">
              <p className="text-sm font-medium text-foreground">Email</p>
              <Input
                type="email"
                value={editForm.email}
                onChange={(event) =>
                  setEditForm((current) => ({ ...current, email: event.target.value }))
                }
                placeholder="client@example.com"
              />
            </div>

            <div className="space-y-1.5">
              <p className="text-sm font-medium text-foreground">Phone</p>
              <Input
                value={editForm.phone}
                onChange={(event) =>
                  setEditForm((current) => ({ ...current, phone: event.target.value }))
                }
                placeholder="Optional phone number"
              />
            </div>

            <div className="space-y-1.5">
              <p className="text-sm font-medium text-foreground">Address</p>
              <Input
                value={editForm.address}
                onChange={(event) =>
                  setEditForm((current) => ({ ...current, address: event.target.value }))
                }
                placeholder="Optional address"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={closeEditDialog}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => void submitEdit()}
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={Boolean(clientToDelete)}
        onOpenChange={(open) => {
          if (!open) {
            setClientToDelete(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete client account?</AlertDialogTitle>
            <AlertDialogDescription>
              {clientToDelete
                ? `This will permanently remove ${clientToDelete.name || clientToDelete.email}.`
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
