import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { usersAPI, batchesAPI } from "@/api";
import { QUERY_KEYS, STALE_TIME, BATCH_LIST_PARAMS } from "@/api/queryKeys";
import DataTable from "@/components/admin/DataTable";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ExternalLink, Filter, RotateCcw } from "lucide-react";
import { getBatchDisplayYear, formatBatchOf } from "@/utils/format";

const PAGE_SIZE = 20;

const defaultFilters = {
  search: "",
  batch: "",
  currentCity: "",
  profession: "",
};

function DirectoryFiltersForm({ filters, batches, updateFilter, onKeyApply }) {
  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="dir-search">Search</Label>
        <Input
          id="dir-search"
          value={filters.search}
          onChange={(e) => updateFilter("search", e.target.value)}
          placeholder="Name, email, or profession..."
          onKeyDown={(e) => e.key === "Enter" && onKeyApply?.()}
        />
      </div>

      <div className="space-y-2">
        <Label>Batch</Label>
        <Select
          value={filters.batch || "all"}
          onValueChange={(value) => updateFilter("batch", value === "all" ? "" : value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="All batches" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All batches</SelectItem>
            {batches.map((batch) => (
              <SelectItem key={batch._id} value={batch._id}>
                Batch of {getBatchDisplayYear(batch)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="dir-city">City</Label>
        <Input
          id="dir-city"
          value={filters.currentCity}
          onChange={(e) => updateFilter("currentCity", e.target.value)}
          placeholder="e.g. Bangalore"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="dir-profession">Profession</Label>
        <Input
          id="dir-profession"
          value={filters.profession}
          onChange={(e) => updateFilter("profession", e.target.value)}
          placeholder="e.g. Engineer"
        />
      </div>
    </div>
  );
}

export default function Directory() {
  const [page, setPage] = useState(0);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState(defaultFilters);
  const [appliedFilters, setAppliedFilters] = useState(defaultFilters);

  const { data, isLoading } = useQuery({
    queryKey: QUERY_KEYS.usersDirectory(page, appliedFilters),
    queryFn: () =>
      usersAPI.getAllUsers({
        page: page + 1,
        limit: PAGE_SIZE,
        ...Object.fromEntries(
          Object.entries(appliedFilters).filter(([, value]) => value !== "")
        ),
      }),
    staleTime: STALE_TIME.DIRECTORY,
  });

  const { data: batchesData } = useQuery({
    queryKey: QUERY_KEYS.batches(BATCH_LIST_PARAMS),
    queryFn: () => batchesAPI.getAll(BATCH_LIST_PARAMS),
    staleTime: STALE_TIME.BATCHES,
  });

  const users = data?.data?.users ?? [];
  const pageCount = data?.pagination?.totalPages ?? 0;
  const total = data?.pagination?.total ?? 0;
  const batches = batchesData?.data?.batches ?? [];

  const updateFilter = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const applyFilters = () => {
    setPage(0);
    setAppliedFilters(filters);
    setFiltersOpen(false);
  };

  const resetFilters = () => {
    setFilters(defaultFilters);
    setAppliedFilters(defaultFilters);
    setPage(0);
  };

  const hasPendingChanges =
    JSON.stringify(filters) !== JSON.stringify(appliedFilters);

  const activeFilterCount = Object.values(appliedFilters).filter(Boolean).length;

  const columns = [
    {
      accessorKey: "name",
      header: "Alumni",
      cell: ({ row }) => {
        const user = row.original;
        const initials = `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase();
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9">
              <AvatarImage src={user.avatar} alt="" />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">
                {user.firstName} {user.lastName}
              </p>
              {user.rollNumber && (
                <p className="text-xs text-muted-foreground">Roll {user.rollNumber}</p>
              )}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "batch",
      header: "Batch",
      cell: ({ row }) => formatBatchOf(row.original.batch) ?? "—",
    },
    {
      accessorKey: "currentCity",
      header: "City",
      cell: ({ row }) => row.original.currentCity || "—",
    },
    {
      accessorKey: "profession",
      header: "Profession",
      cell: ({ row }) => row.original.profession || "—",
    },
    {
      accessorKey: "company",
      header: "Company",
      cell: ({ row }) => row.original.company || "—",
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <Button variant="ghost" size="sm" asChild>
          <Link to={`/dashboard/alumni/${row.original._id}`}>
            <ExternalLink className="h-4 w-4" />
          </Link>
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Directory</h1>
          <p className="text-sm text-muted-foreground">
            Search fellow Navodayans by batch, city, or profession.
            {total > 0 && ` ${total} alumni match your filters.`}
          </p>
        </div>
        <Button variant="outline" onClick={() => setFiltersOpen(true)} className="relative">
          <Filter className="mr-2 h-4 w-4" />
          Filters
          {activeFilterCount > 0 && (
            <Badge variant="default" className="ml-2 h-5 min-w-5 px-1.5">
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </div>

      <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
        <SheetContent side="right" className="flex w-full flex-col sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Filter directory</SheetTitle>
            <SheetDescription>
              Narrow results by batch, location, or profession.
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto py-4 pr-1">
            <DirectoryFiltersForm
              filters={filters}
              batches={batches}
              updateFilter={updateFilter}
              onKeyApply={applyFilters}
            />
            {hasPendingChanges && (
              <p className="mt-4 text-xs text-muted-foreground">
                You have unapplied filter changes.
              </p>
            )}
          </div>

          <SheetFooter className="gap-2 border-t pt-4 sm:justify-between">
            <Button type="button" variant="outline" onClick={resetFilters}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset
            </Button>
            <Button type="button" onClick={applyFilters}>
              Apply filters
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <DataTable
        columns={columns}
        data={users}
        isLoading={isLoading}
        manualPagination
        pageCount={pageCount}
        pageIndex={page}
        onPageChange={setPage}
        pageSize={PAGE_SIZE}
        emptyMessage="No alumni match your filters."
      />
    </div>
  );
}
