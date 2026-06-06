import { useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function DataTable({
  columns,
  data = [],
  searchPlaceholder = "Search...",
  searchKey,
  hideSearch = false,
  searchValue,
  onSearchChange,
  pageSize = 10,
  manualPagination = false,
  pageCount = 0,
  pageIndex: controlledPageIndex,
  onPageChange,
  isLoading = false,
  emptyMessage = "No results found.",
}) {
  const [internalSearch, setInternalSearch] = useState("");
  const [internalPageIndex, setInternalPageIndex] = useState(0);

  const isServerSearch = Boolean(manualPagination && onSearchChange);
  const search =
    isServerSearch && searchValue !== undefined ? searchValue : internalSearch;

  const pageIndex =
    controlledPageIndex !== undefined ? controlledPageIndex : internalPageIndex;

  const handleSearchChange = (value) => {
    if (isServerSearch) {
      onSearchChange(value);
      return;
    }
    setInternalSearch(value);
  };

  const enableClientFilter = !manualPagination && !isServerSearch;

  const table = useReactTable({
    data,
    columns,
    state: {
      ...(enableClientFilter && searchKey
        ? { columnFilters: [{ id: searchKey, value: search }] }
        : enableClientFilter
          ? { globalFilter: search }
          : {}),
      pagination: { pageIndex, pageSize },
    },
    onGlobalFilterChange: setInternalSearch,
    onPaginationChange: (updater) => {
      const next =
        typeof updater === "function"
          ? updater({ pageIndex, pageSize })
          : updater;
      if (onPageChange) {
        onPageChange(next.pageIndex);
      } else {
        setInternalPageIndex(next.pageIndex);
      }
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: enableClientFilter ? getFilteredRowModel() : undefined,
    getPaginationRowModel: manualPagination ? undefined : getPaginationRowModel(),
    manualPagination,
    pageCount: manualPagination ? pageCount : undefined,
  });

  const rows = table.getRowModel().rows;
  const totalPages = manualPagination ? pageCount : table.getPageCount();
  const showSearch = !hideSearch && (enableClientFilter || isServerSearch);

  return (
    <div className="space-y-4">
      {showSearch && (
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : rows.length ? (
              rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {pageIndex + 1} of {totalPages || 1}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
