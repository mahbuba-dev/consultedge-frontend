"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteIndustry, getAllIndustries } from "@/src/services/industry.services";
import Link from "next/link";
import { toast } from "sonner";
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
import DateCell from "../../shared/Cell/DataCell";

export default function IndustryList() {
  const queryClient = useQueryClient();
  const [selectedIndustry, setSelectedIndustry] = useState<{
    id: string;
    name?: string;
  } | null>(null);

  const { data: industriesResponse } = useQuery({
    queryKey: ["industries"],
    queryFn: getAllIndustries,
    refetchOnWindowFocus: "always",
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => deleteIndustry(id),
  });

  const industries = industriesResponse?.data || [];

  const handleDelete = () => {
    if (!selectedIndustry?.id) return;

    deleteMutation.mutate(selectedIndustry.id, {
      onSuccess: async () => {
        toast.success("Industry deleted successfully");
        await queryClient.invalidateQueries({ queryKey: ["industries"] });
        setSelectedIndustry(null);
      },
      onError: (error: unknown) => {
        let message = "Failed to delete industry";

        if (typeof error === "object" && error !== null) {
          const maybeError = error as {
            response?: { data?: { message?: string } };
            message?: string;
          };

          message = maybeError.response?.data?.message ?? maybeError.message ?? message;
        }

        toast.error(message);
      },
    });
  };

  return (
    <div className="border rounded-lg overflow-x-auto bg-white">
      {/* Responsive table wrapper */}
      <div className="min-w-150 md:min-w-0 w-full">
        <table className="w-full border-collapse text-sm md:text-base">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 md:p-3 text-left whitespace-nowrap">Icon</th>
              <th className="p-2 md:p-3 text-left whitespace-nowrap">Name</th>
              <th className="p-2 md:p-3 text-left whitespace-nowrap">Description</th>
              <th className="p-2 md:p-3 text-left whitespace-nowrap">Created</th>
              <th className="p-2 md:p-3 text-left whitespace-nowrap">Updated</th>
              <th className="p-2 md:p-3 text-left whitespace-nowrap">Actions</th>
            </tr>
          </thead>

          <tbody>
            {industries.map((industry: any) => (
              <tr key={industry.id} className="border-t hover:bg-gray-50 transition-colors">
                <td className="p-2 md:p-3 align-middle">
                  {industry.icon ? (
                    <img src={industry.icon} className="w-8 h-8 md:w-10 md:h-10 rounded object-cover" />
                  ) : (
                    <span className="text-gray-400">No Icon</span>
                  )}
                </td>

                <td className="p-2 md:p-3 font-medium align-middle max-w-30 md:max-w-xs truncate">
                  {industry.name}
                </td>
                <td className="p-2 md:p-3 text-gray-600 align-middle max-w-45 md:max-w-md truncate">
                  {industry.description}
                </td>

                <td className="p-2 md:p-3 align-middle">
                  <DateCell date={industry.createdAt} />
                </td>

                <td className="p-2 md:p-3 align-middle">
                  <DateCell date={industry.updatedAt} />
                </td>

                <td className="p-2 md:p-3 space-x-2 md:space-x-3 align-middle">
                  <Link
                    href={`/admin/dashboard/industries-management/${industry.id}/edit`}
                    className="text-blue-600 hover:underline"
                  >
                    Edit
                  </Link>

                  <button
                    type="button"
                    onClick={() =>
                      setSelectedIndustry({
                        id: industry.id,
                        name: industry.name,
                      })
                    }
                    disabled={deleteMutation.isPending}
                    className="text-red-600 hover:underline disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {deleteMutation.isPending ? "Deleting..." : "Delete"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AlertDialog
        open={Boolean(selectedIndustry)}
        onOpenChange={(open) => {
          if (!open) setSelectedIndustry(null);
        }}
      >
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete industry?</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedIndustry?.name
                ? `You are about to delete ${selectedIndustry.name}. This action cannot be undone.`
                : "This action cannot be undone."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
