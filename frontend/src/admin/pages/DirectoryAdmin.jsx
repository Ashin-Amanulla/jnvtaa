import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { adminUsersAPI, adminBatchesAPI } from "@/api/admin";
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
  currentCountry: "",
  profession: "",
  company: "",
  industry: "",
  gender: "",
  isVerified: "",
  isActive: "true",
  role: "",
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
          placeholder="Name, email, profession, or company..."
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
            {Array.isArray(batches) &&
              batches.map((batch) => (
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
        <Label htmlFor="dir-country">Country</Label>
        <Input
          id="dir-country"
          value={filters.currentCountry}
          onChange={(e) => updateFilter("currentCountry", e.target.value)}
          placeholder="e.g. India"
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

      <div className="space-y-2">
        <Label htmlFor="dir-company">Company</Label>
        <Input
          id="dir-company"
          value={filters.company}
          onChange={(e) => updateFilter("company", e.target.value)}
          placeholder="e.g. Google"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="dir-industry">Industry</Label>
        <Input
          id="dir-industry"
          value={filters.industry}
          onChange={(e) => updateFilter("industry", e.target.value)}
          placeholder="e.g. Technology"
        />
      </div>

      <div className="space-y-2">
        <Label>Gender</Label>
        <Select
          value={filters.gender || "all"}
          onValueChange={(value) => updateFilter("gender", value === "all" ? "" : value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Any" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any</SelectItem>
            <SelectItem value="male">Male</SelectItem>
            <SelectItem value="female">Female</SelectItem>
            <SelectItem value="other">Other</SelectItem>
            <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Verification</Label>
        <Select
          value={filters.isVerified || "all"}
          onValueChange={(value) =>
            updateFilter("isVerified", value === "all" ? "" : value)
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Any" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any</SelectItem>
            <SelectItem value="true">Verified</SelectItem>
            <SelectItem value="false">Unverified</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Account status</Label>
        <Select
          value={filters.isActive || "all"}
          onValueChange={(value) => updateFilter("isActive", value === "all" ? "" : value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Any" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any</SelectItem>
            <SelectItem value="true">Active</SelectItem>
            <SelectItem value="false">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Role</Label>
        <Select
          value={filters.role || "all"}
          onValueChange={(value) => updateFilter("role", value === "all" ? "" : value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Any" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any</SelectItem>
            <SelectItem value="member">Member</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

export default function DirectoryAdmin() {
  const [page, setPage] = useState(0);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState(defaultFilters);
  const [appliedFilters, setAppliedFilters] = useState(defaultFilters);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "directory", page, appliedFilters],
    queryFn: () =>
      adminUsersAPI.getAll({
        page: page + 1,
        limit: PAGE_SIZE,
        ...Object.fromEntries(
          Object.entries(appliedFilters).filter(([, value]) => value !== "")
        ),
      }),
  });

  const { data: batchesData } = useQuery({
    queryKey: ["admin", "batches-list"],
    queryFn: () => adminBatchesAPI.getAll({ limit: 200 }),
  });

  const users = data?.data?.users ?? [];
  const pageCount = data?.pagination?.totalPages ?? 0;
  const total = data?.pagination?.total ?? 0;
  const batches = batchesData?.data?.batches ?? batchesData?.data ?? [];

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

  const activeFilterCount = Object.entries(appliedFilters).filter(
    ([key, value]) => value !== "" && !(key === "isActive" && value === "true")
  ).length;

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
    { accessorKey: "email", header: "Email" },
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
      accessorKey: "currentCountry",
      header: "Country",
      cell: ({ row }) => row.original.currentCountry || "—",
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
      accessorKey: "industry",
      header: "Industry",
      cell: ({ row }) => row.original.industry || "—",
    },
    {
      accessorKey: "isVerified",
      header: "Verified",
      cell: ({ row }) =>
        row.original.isVerified ? (
          <Badge>Verified</Badge>
        ) : (
          <Badge variant="outline">Pending</Badge>
        ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <Button variant="ghost" size="sm" asChild>
          <Link to={`/alumni/${row.original._id}`} target="_blank" rel="noopener noreferrer">
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
          <h1 className="text-2xl font-semibold">Directory</h1>
          <p className="text-sm text-muted-foreground">
            Browse and filter the full alumni directory.
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
              Narrow results by batch, location, profession, and more.
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
