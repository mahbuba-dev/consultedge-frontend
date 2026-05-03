"use client";

import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { paginationMeta } from "@/src/types/api.types";
import { ColumnDef, flexRender, getCoreRowModel, getPaginationRowModel, getSortedRowModel, PaginationState, SortingState, useReactTable } from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown, MoreHorizontal } from "lucide-react";
import { useEffect, useState } from "react";
import DataTableFilters, {
  DataTableFilterConfig,
  DataTableFilterValue,
  DataTableFilterValues,
} from "../Table/DataTableFilters";
import DataTablePagination from "../Table/DataTablePagination";
import DataTableSearch from "../Table/DataTableSearch";

interface DataTableRowAction {
    label: string;
    onClick: () => void | Promise<void>;
    disabled?: boolean;
    destructive?: boolean;
}

interface DataTableActions<TData> {
    onView ?: (data : TData) => void;
    onEdit ?: (data : TData) => void;
    onDelete ?: (data : TData) => void;
    items?: (data: TData) => DataTableRowAction[];
}

interface DataTableProps<TData> {
    data : TData[];
    columns : ColumnDef<TData>[];
    actions ?: DataTableActions<TData>;
  toolbarAction?: React.ReactNode;
    tableClassName?: string;
    headCellClassName?: string;
    bodyCellClassName?: string;
    emptyMessage ?: string;
    isLoading ?: boolean;
    sorting ?: {
      state : SortingState;
      onSortingChange : (state : SortingState) => void;
    };
    pagination?: {
      state: PaginationState;
      onPaginationChange: (state: PaginationState) => void;
    };
    search?: {
      initialValue?: string;
      placeholder?: string;
      debounceMs?: number;
      onDebouncedChange: (value: string) => void;
    };
    filters?: {
      configs: DataTableFilterConfig[];
      values: DataTableFilterValues;
      onFilterChange: (filterId: string, value: DataTableFilterValue | undefined) => void;
      onClearAll?: () => void;
    };
    meta?: paginationMeta;
}


const DataTable = <TData,>({
  data = [] as TData[],
  columns,
  actions,
  toolbarAction,
  tableClassName,
  headCellClassName,
  bodyCellClassName,
  emptyMessage,
  isLoading,
  sorting,
  pagination,
  search,
  filters,
  meta,
} : DataTableProps<TData>) => {

    const [hasHydrated, setHasHydrated] = useState(false);

    useEffect(() => {
      setHasHydrated(true);
    }, []);

    const hydratedIsLoading = hasHydrated ? Boolean(isLoading) : false;
    const showLoadingOverlay = hydratedIsLoading;


    const tableColumns : ColumnDef<TData>[] = actions ? [...columns,
        
        // Action column
        {
            id : "actions", // Unique id for the column
            header: "Actions",
            enableSorting: false,
            cell: ({ row }) => {
                const rowData = row.original;

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant={"ghost"} className="h-8 w-8 p-0">
                                <span className="sr-only">Open Menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end">
                            {
                                actions.onView && (
                                    <DropdownMenuItem onClick={() => actions.onView?.(rowData)}>
                                        View
                                    </DropdownMenuItem>
                                )
                            }

                            {
                                actions.onEdit && (
                                    <DropdownMenuItem onClick={() => actions.onEdit?.(rowData)}>
                                        Edit
                                    </DropdownMenuItem>
                                )
                            }

                            {
                                actions.onDelete && (
                                    <DropdownMenuItem
                                      onClick={() => actions.onDelete?.(rowData)}
                                      className="text-destructive focus:text-destructive"
                                    >
                                        Delete
                                    </DropdownMenuItem>
                                )
                            }

                            {actions.items?.(rowData).map((item) => (
                              <DropdownMenuItem
                                key={item.label}
                                disabled={item.disabled}
                                onClick={() => void item.onClick()}
                                className={item.destructive ? "text-destructive focus:text-destructive" : undefined}
                              >
                                {item.label}
                              </DropdownMenuItem>
                            ))}

                        </DropdownMenuContent>
                    </DropdownMenu>
                )
            }
        }
    ] : columns;

    const hasServerPagination =
      Boolean(pagination) &&
      typeof meta?.totalPages === "number" &&
      meta.totalPages > 0;

    // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table is intentionally used here and React Compiler already skips memoization for this hook.
    const table = useReactTable({
      data,
      columns: tableColumns,
      initialState: {
        pagination: {
          pageIndex: 0,
          pageSize: 10,
        },
      },
      getCoreRowModel: getCoreRowModel(),
      getSortedRowModel:getSortedRowModel(),
      getPaginationRowModel: getPaginationRowModel(),
      manualSorting: !!sorting,
      manualPagination: hasServerPagination,
      pageCount: hasServerPagination ? Math.max(meta?.totalPages ?? 0, 0) : undefined,
      state : {
        ...(sorting ? { sorting : sorting.state } : {}),
        ...(pagination ? { pagination: pagination.state } : {}),
      },
      onSortingChange : sorting ? 
        (updater) => {
          const currentSortingState = sorting.state;

          const nextSortingState = typeof updater === "function" ? updater(currentSortingState) : updater;

          sorting.onSortingChange(nextSortingState);
        }
      : undefined,
      onPaginationChange: pagination
        ? (updater) => {
            const currentPaginationState = pagination.state;
            const nextPaginationState =
              typeof updater === "function"
                ? updater(currentPaginationState)
                : updater;

            pagination.onPaginationChange(nextPaginationState);
          }
        : undefined,
    });
    return (
      <div className="relative">
        {showLoadingOverlay && (
          <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-10 flex items-center justify-center">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              <span className="text-sm text-muted-foreground">Loading...</span>
            </div>
          </div>
        )}

        {(search || filters || toolbarAction) && (
          <div className="mb-4 flex flex-wrap items-start gap-3">
            {search && (
              <DataTableSearch
                initialValue={search.initialValue}
                placeholder={search.placeholder}
                debounceMs={search.debounceMs}
                onDebouncedChange={search.onDebouncedChange}
                isLoading={hydratedIsLoading}
              />
            )}

            {filters && (
              <DataTableFilters
                filters={filters.configs}
                values={filters.values}
                onFilterChange={filters.onFilterChange}
                onClearAll={filters.onClearAll}
                isLoading={hydratedIsLoading}
              />
            )}

            {toolbarAction && (
              <div className="ml-auto shrink-0">{toolbarAction}</div>
            )}
          </div>
        )}

        {/* // Table */}
        <div className="rounded-lg border">
          <Table className={tableClassName}>
            <TableHeader>
              {table.getHeaderGroups().map((hg) => (
                <TableRow key={hg.id}>
                  {hg.headers.map((header) => (
                    <TableHead key={header.id} className={headCellClassName}>
                      {header.isPlaceholder ? null : header.column.getCanSort() ? (
                        <Button
                          variant={"ghost"}
                          className="h-auto cursor-pointer p-0 font-semibold hover:bg-transparent hover:text-inherit focus-visible:ring-0"
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}

                          {
                            header.column.getIsSorted() === "asc" ? (
                              <ArrowUp className="ml-1 h-4 w-4" />
                            ) : header.column.getIsSorted() === "desc" ? (
                              <ArrowDown className="ml-1 h-4 w-4" />
                            ) : <ArrowUpDown className="ml-1 h-4 w-4 opacity-50" />
                          }

                        </Button>
                      ) : (
                        flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )
                      )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel()?.rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className={bodyCellClassName}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={tableColumns.length}
                    className={`h-24 text-center ${bodyCellClassName ?? ""}`}
                  >
                    {emptyMessage || "No data available."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          <DataTablePagination
            table={table}
            totalPages={pagination ? meta?.totalPages : undefined}
            totalRows={pagination ? meta?.total : data.length}
            isLoading={hydratedIsLoading}
          />
        </div>
      </div>
    );
}

export default DataTable