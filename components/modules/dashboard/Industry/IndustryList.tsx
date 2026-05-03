// "use client";

// import { useState } from "react";
// import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
// import { deleteIndustry, getAllIndustries } from "@/src/services/industry.services";
// import Link from "next/link";
// import { toast } from "sonner";
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
// import DateCell from "../../shared/Cell/DataCell";

// export default function IndustryList() {
//   const queryClient = useQueryClient();
//   const [selectedIndustry, setSelectedIndustry] = useState<{
//     id: string;
//     name?: string;
//   } | null>(null);

//   const { data: industriesResponse } = useQuery({
//     queryKey: ["industries"],
//     queryFn: getAllIndustries,
//     refetchOnWindowFocus: "always",
//   });

//   const deleteMutation = useMutation({
//     mutationFn: async (id: string) => deleteIndustry(id),
//   });

//   const industries = industriesResponse?.data || [];

//   const handleDelete = () => {
//     if (!selectedIndustry?.id) return;

//     deleteMutation.mutate(selectedIndustry.id, {
//       onSuccess: async () => {
//         toast.success("Industry deleted successfully");
//         await queryClient.invalidateQueries({ queryKey: ["industries"] });
//         setSelectedIndustry(null);
//       },
//       onError: (error: unknown) => {
//         let message = "Failed to delete industry";

//         if (typeof error === "object" && error !== null) {
//           const maybeError = error as {
//             response?: { data?: { message?: string } };
//             message?: string;
//           };

//           message = maybeError.response?.data?.message ?? maybeError.message ?? message;
//         }

//         toast.error(message);
//       },
//     });
//   };

//   return (
//     <div className="border rounded-lg overflow-x-auto bg-white">
//       {/* Responsive table wrapper */}
//       <div className="min-w-150 md:min-w-0 w-full">
//         <table className="w-full border-collapse text-sm md:text-base">
//           <thead className="bg-gray-100">
//             <tr>
//               <th className="p-2 md:p-3 text-left whitespace-nowrap">Icon</th>
//               <th className="p-2 md:p-3 text-left whitespace-nowrap">Name</th>
//               <th className="p-2 md:p-3 text-left whitespace-nowrap">Description</th>
//               <th className="p-2 md:p-3 text-left whitespace-nowrap">Created</th>
//               <th className="p-2 md:p-3 text-left whitespace-nowrap">Updated</th>
//               <th className="p-2 md:p-3 text-left whitespace-nowrap">Actions</th>
//             </tr>
//           </thead>

//           <tbody>
//             {industries.map((industry: any) => (
//               <tr key={industry.id} className="border-t hover:bg-gray-50 transition-colors">
//                 <td className="p-2 md:p-3 align-middle">
//                   {industry.icon ? (
//                     <img src={industry.icon} className="w-8 h-8 md:w-10 md:h-10 rounded object-cover" />
//                   ) : (
//                     <span className="text-gray-400">No Icon</span>
//                   )}
//                 </td>

//                 <td className="p-2 md:p-3 font-medium align-middle max-w-30 md:max-w-xs truncate">
//                   {industry.name}
//                 </td>
//                 <td className="p-2 md:p-3 text-gray-600 align-middle max-w-45 md:max-w-md truncate">
//                   {industry.description}
//                 </td>

//                 <td className="p-2 md:p-3 align-middle">
//                   <DateCell date={industry.createdAt} />
//                 </td>

//                 <td className="p-2 md:p-3 align-middle">
//                   <DateCell date={industry.updatedAt} />
//                 </td>

//                 <td className="p-2 md:p-3 space-x-2 md:space-x-3 align-middle">
//                   <Link
//                     href={`/admin/dashboard/industries-management/${industry.id}/edit`}
//                     className="text-blue-600 hover:underline"
//                   >
//                     Edit
//                   </Link>

//                   <button
//                     type="button"
//                     onClick={() =>
//                       setSelectedIndustry({
//                         id: industry.id,
//                         name: industry.name,
//                       })
//                     }
//                     disabled={deleteMutation.isPending}
//                     className="text-red-600 hover:underline disabled:cursor-not-allowed disabled:opacity-60"
//                   >
//                     {deleteMutation.isPending ? "Deleting..." : "Delete"}
//                   </button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>

//       <AlertDialog
//         open={Boolean(selectedIndustry)}
//         onOpenChange={(open) => {
//           if (!open) setSelectedIndustry(null);
//         }}
//       >
//         <AlertDialogContent size="sm">
//           <AlertDialogHeader>
//             <AlertDialogTitle>Delete industry?</AlertDialogTitle>
//             <AlertDialogDescription>
//               {selectedIndustry?.name
//                 ? `You are about to delete ${selectedIndustry.name}. This action cannot be undone.`
//                 : "This action cannot be undone."}
//             </AlertDialogDescription>
//           </AlertDialogHeader>
//           <AlertDialogFooter>
//             <AlertDialogCancel disabled={deleteMutation.isPending}>Cancel</AlertDialogCancel>
//             <AlertDialogAction
//               variant="destructive"
//               onClick={handleDelete}
//               disabled={deleteMutation.isPending}
//             >
//               {deleteMutation.isPending ? "Deleting..." : "Delete"}
//             </AlertDialogAction>
//           </AlertDialogFooter>
//         </AlertDialogContent>
//       </AlertDialog>
//     </div>
//   );
// }


"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteIndustry, getAllIndustries } from "@/src/services/industry.services";
import Link from "next/link";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight } from "lucide-react";
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
import { Button } from "@/components/ui/button";
import DateCell from "../../shared/Cell/DataCell";
import { useServerDataTable } from "@/src/hooks/useServerDataTable";

export default function IndustryList() {
  const queryClient = useQueryClient();
  const [selectedIndustry, setSelectedIndustry] = useState<{
    id: string;
    name?: string;
  } | null>(null);

  const {
    paginationState,
    onPaginationChange,
    queryParams,
  } = useServerDataTable({ defaultPageSize: 10 });

  const { data: industriesResponse } = useQuery({
    queryKey: ["industries-management-table", queryParams],
    queryFn: () =>
      getAllIndustries({
        page: queryParams.page,
        limit: queryParams.limit,
        sortBy: queryParams.sortBy,
        sortOrder: queryParams.sortOrder,
      }),
    refetchOnWindowFocus: "always",
    placeholderData: (prev) => prev,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteIndustry(id),
  });

  const industries = industriesResponse?.data || [];
  const meta = industriesResponse?.meta;
  const currentPage = paginationState.pageIndex + 1;
  const totalPages = Math.max(meta?.totalPages ?? 1, 1);
  const totalRows = meta?.total ?? industries.length;

  const handleDelete = () => {
    if (!selectedIndustry?.id) return;

    deleteMutation.mutate(selectedIndustry.id, {
      onSuccess: async () => {
        toast.success("Industry deleted successfully");
        await queryClient.invalidateQueries({ queryKey: ["industries-management-table"] });
        setSelectedIndustry(null);
      },
      onError: (error: unknown) => {
        let message = "Failed to delete industry";

        if (typeof error === "object" && error !== null) {
          const err = error as any;
          message = err?.response?.data?.message ?? err?.message ?? message;
        }

        toast.error(message);
      },
    });
  };

  return (
    <div className="relative w-full overflow-hidden rounded-3xl border border-slate-200/70 bg-white/70 shadow-sm backdrop-blur dark:border-white/10 dark:bg-slate-900/60">
      <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-blue-600 via-cyan-500 to-teal-400" />
      <div className="pointer-events-none absolute -right-24 -top-24 hidden size-72 rounded-full bg-cyan-500/10 blur-3xl dark:block" />

      {/* ================= DESKTOP TABLE ================= */}
      <div className="relative hidden lg:block overflow-x-auto">
        <table className="w-full text-sm md:text-base">
          <thead className="bg-slate-100/70 text-slate-700 dark:bg-white/5 dark:text-slate-200">
            <tr>
              <th className="p-3 text-left text-xs font-semibold uppercase tracking-wider">Icon</th>
              <th className="p-3 text-left text-xs font-semibold uppercase tracking-wider">Name</th>
              <th className="p-3 text-left text-xs font-semibold uppercase tracking-wider">Description</th>
              <th className="p-3 text-left text-xs font-semibold uppercase tracking-wider">Created</th>
              <th className="p-3 text-left text-xs font-semibold uppercase tracking-wider">Updated</th>
              <th className="p-3 text-left text-xs font-semibold uppercase tracking-wider">Actions</th>
            </tr>
          </thead>

          <tbody>
            {industries.map((industry: any) => (
              <tr
                key={industry.id}
                className="border-t border-slate-200/60 transition-colors hover:bg-blue-50/40 dark:border-white/10 dark:hover:bg-white/5"
              >
                <td className="p-3">
                  {industry.icon ? (
                    <img
                      src={industry.icon}
                      className="w-10 h-10 rounded-xl object-cover ring-1 ring-slate-200/70 dark:ring-white/10"
                    />
                  ) : (
                    <span className="text-muted-foreground text-xs">No Icon</span>
                  )}
                </td>

                <td className="max-w-50 p-3 font-semibold text-foreground truncate">
                  {industry.name}
                </td>

                <td className="max-w-75 p-3 text-muted-foreground truncate">
                  {industry.description}
                </td>

                <td className="p-3 text-muted-foreground">
                  <DateCell date={industry.createdAt} />
                </td>

                <td className="p-3 text-muted-foreground">
                  <DateCell date={industry.updatedAt} />
                </td>

                <td className="p-3 space-x-3">
                  <Link
                    href={`/admin/dashboard/industries-management/${industry.id}/edit`}
                    className="font-medium text-blue-600 hover:underline dark:text-cyan-300"
                  >
                    Edit
                  </Link>

                  <button
                    onClick={() =>
                      setSelectedIndustry({
                        id: industry.id,
                        name: industry.name,
                      })
                    }
                    disabled={deleteMutation.isPending}
                    className="font-medium text-rose-600 hover:underline disabled:opacity-50 dark:text-rose-300"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ================= MOBILE / TABLET CARD VIEW ================= */}
      <div className="relative space-y-4 p-3 sm:p-4 lg:hidden">
        {industries.map((industry: any) => (
          <div
            key={industry.id}
            className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white/70 p-4 shadow-sm backdrop-blur dark:border-white/10 dark:bg-slate-900/60"
          >
            <div className="flex items-start gap-3 sm:gap-4">
              {industry.icon ? (
                <img
                  src={industry.icon}
                  alt={industry.name}
                  className="h-14 w-14 shrink-0 rounded-xl object-cover ring-1 ring-slate-200/70 dark:ring-white/10"
                />
              ) : (
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-xs text-muted-foreground dark:bg-white/5">
                  No Icon
                </div>
              )}

              <div className="min-w-0 flex-1">
                <p className="wrap-break-word text-base leading-snug font-semibold text-foreground sm:text-lg">
                  {industry.name}
                </p>
                <p className="wrap-break-word mt-1 text-sm leading-6 text-muted-foreground sm:text-[15px]">
                  {industry.description}
                </p>
              </div>
            </div>

            <div className="mt-4 grid gap-2 rounded-xl border border-slate-200/60 bg-white/50 p-3 text-sm sm:grid-cols-2 dark:border-white/10 dark:bg-white/5">
              <div className="min-w-0">
                <span className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Created
                </span>
                <span className="wrap-break-word mt-1 block text-sm text-foreground">
                  <DateCell date={industry.createdAt} />
                </span>
              </div>
              <div className="min-w-0">
                <span className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Updated
                </span>
                <span className="wrap-break-word mt-1 block text-sm text-foreground">
                  <DateCell date={industry.updatedAt} />
                </span>
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
              <Link
                href={`/admin/dashboard/industries-management/${industry.id}/edit`}
                className="inline-flex min-h-11 items-center justify-center rounded-xl bg-linear-to-r from-blue-600 to-cyan-500 px-4 text-sm font-semibold text-white shadow-md shadow-cyan-500/25 transition hover:from-blue-700 hover:to-cyan-600"
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
                className="inline-flex min-h-11 items-center justify-center rounded-xl border border-rose-200/70 bg-rose-50/70 px-4 text-sm font-semibold text-rose-700 transition-colors hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300 dark:hover:bg-rose-500/15"
              >
                {deleteMutation.isPending ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        ))}

        {industries.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-200/70 bg-white/40 px-4 py-10 text-center text-sm text-muted-foreground dark:border-white/10 dark:bg-white/5">
            No industries found.
          </div>
        )}
      </div>

      <div className="relative flex flex-wrap items-center justify-between gap-3 border-t border-slate-200/70 bg-white/60 px-4 py-3 text-sm dark:border-white/10 dark:bg-slate-900/50">
        <p className="text-muted-foreground">
          Page {currentPage} of {totalPages} • {totalRows} industries
        </p>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={currentPage <= 1}
            onClick={() =>
              onPaginationChange({
                ...paginationState,
                pageIndex: Math.max(0, paginationState.pageIndex - 1),
              })
            }
          >
            <ChevronLeft className="mr-1 size-4" /> Prev
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={currentPage >= totalPages}
            onClick={() =>
              onPaginationChange({
                ...paginationState,
                pageIndex: Math.min(totalPages - 1, paginationState.pageIndex + 1),
              })
            }
          >
            Next <ChevronRight className="ml-1 size-4" />
          </Button>

          <select
            value={paginationState.pageSize}
            onChange={(event) =>
              onPaginationChange({
                pageIndex: 0,
                pageSize: Number(event.target.value),
              })
            }
            className="h-9 rounded-md border border-slate-200 bg-white px-2 text-xs dark:border-white/15 dark:bg-slate-900"
            aria-label="Industries per page"
          >
            {[10, 20, 30, 50].map((size) => (
              <option key={size} value={size}>
                {size} / page
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ================= ALERT DIALOG ================= */}
      <AlertDialog
        open={Boolean(selectedIndustry)}
        onOpenChange={(open) => {
          if (!open) setSelectedIndustry(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete industry?</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedIndustry?.name
                ? `You are about to delete ${selectedIndustry.name}. This action cannot be undone.`
                : "This action cannot be undone."}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>
              Cancel
            </AlertDialogCancel>

            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="bg-red-600"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}