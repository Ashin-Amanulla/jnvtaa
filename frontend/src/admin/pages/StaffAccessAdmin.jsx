import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, ShieldOff, Search } from "lucide-react";
import { adminUsersAPI, adminRolesAPI } from "@/api/admin";
import DataTable from "@/components/admin/DataTable";
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
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatRoleLabel } from "@/utils/roles";
import { formatDate } from "@/utils/format";

const PAGE_SIZE = 10;

export default function StaffAccessAdmin() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [assignOpen, setAssignOpen] = useState(false);
  const [memberSearch, setMemberSearch] = useState("");
  const [selectedMember, setSelectedMember] = useState(null);
  const [selectedRole, setSelectedRole] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "staff", page],
    queryFn: () =>
      adminUsersAPI.getAll({
        page: page + 1,
        limit: PAGE_SIZE,
        staffOnly: true,
      }),
  });

  const { data: rolesData } = useQuery({
    queryKey: ["admin", "roles"],
    queryFn: () => adminRolesAPI.getAll(),
  });

  const { data: searchData, isFetching: isSearching } = useQuery({
    queryKey: ["admin", "staff-search", memberSearch],
    queryFn: () =>
      adminUsersAPI.getAll({
        membersOnly: true,
        search: memberSearch,
        limit: 8,
        page: 1,
      }),
    enabled: assignOpen && memberSearch.trim().length >= 2,
  });

  const staffRoles =
    rolesData?.data?.assignableRoles?.filter((role) => role !== "member") ?? [
      "admin",
    ];

  const roleMutation = useMutation({
    mutationFn: ({ id, role }) => adminUsersAPI.updateRole(id, role),
    onSuccess: (_, { role }) => {
      toast.success(
        role === "member" ? "Staff access removed" : "Role updated"
      );
      queryClient.invalidateQueries({ queryKey: ["admin", "staff"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
    onError: (err) => toast.error(err.message),
  });

  const staff = data?.data?.users ?? [];
  const pageCount = data?.pagination?.totalPages ?? 0;
  const searchResults = searchData?.data?.users ?? [];

  const openAssign = () => {
    setMemberSearch("");
    setSelectedMember(null);
    setSelectedRole(staffRoles[0] || "admin");
    setAssignOpen(true);
  };

  const handleAssign = () => {
    if (!selectedMember || !selectedRole) {
      toast.error("Select a member and role");
      return;
    }
    roleMutation.mutate(
      { id: selectedMember._id, role: selectedRole },
      {
        onSuccess: () => {
          setAssignOpen(false);
          setSelectedMember(null);
        },
      }
    );
  };

  const handleRevoke = (user) => {
    if (
      window.confirm(
        `Remove staff access for ${user.firstName} ${user.lastName}? They will become a regular member.`
      )
    ) {
      roleMutation.mutate({ id: user._id, role: "member" });
    }
  };

  const columns = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <span className="font-medium">
          {row.original.firstName} {row.original.lastName}
        </span>
      ),
    },
    { accessorKey: "email", header: "Email" },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => (
        <Select
          value={row.original.role}
          onValueChange={(role) =>
            roleMutation.mutate({ id: row.original._id, role })
          }
        >
          <SelectTrigger className="h-8 w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {staffRoles.map((role) => (
              <SelectItem key={role} value={role}>
                {formatRoleLabel(role)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ),
    },
    {
      accessorKey: "isVerified",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={row.original.isActive ? "default" : "destructive"}>
          {row.original.isActive ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Added",
      cell: ({ row }) => formatDate(row.original.createdAt, "PP"),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="sm"
          className="text-destructive hover:text-destructive"
          onClick={() => handleRevoke(row.original)}
        >
          <ShieldOff className="mr-2 h-4 w-4" />
          Revoke
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Staff Access</h1>
          <p className="text-sm text-muted-foreground">
            Search members and assign admin or sub-admin roles. Only users with
            staff access are listed here.
          </p>
        </div>
        <Button onClick={openAssign}>
          <Plus className="mr-2 h-4 w-4" />
          Assign access
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={staff}
        isLoading={isLoading}
        manualPagination
        pageCount={pageCount}
        pageIndex={page}
        onPageChange={setPage}
        pageSize={PAGE_SIZE}
        emptyMessage="No staff members assigned yet."
      />

      <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Assign staff access</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="member-search">Search member</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="member-search"
                  value={memberSearch}
                  onChange={(e) => {
                    setMemberSearch(e.target.value);
                    setSelectedMember(null);
                  }}
                  placeholder="Name or email..."
                  className="pl-9"
                />
              </div>
              {memberSearch.trim().length >= 2 && (
                <div className="max-h-48 overflow-y-auto rounded-md border">
                  {isSearching ? (
                    <p className="p-3 text-sm text-muted-foreground">Searching...</p>
                  ) : searchResults.length === 0 ? (
                    <p className="p-3 text-sm text-muted-foreground">No members found</p>
                  ) : (
                    searchResults.map((user) => (
                      <button
                        key={user._id}
                        type="button"
                        className={`flex w-full flex-col items-start px-3 py-2 text-left text-sm hover:bg-muted ${
                          selectedMember?._id === user._id ? "bg-muted" : ""
                        }`}
                        onClick={() => setSelectedMember(user)}
                      >
                        <span className="font-medium">
                          {user.firstName} {user.lastName}
                        </span>
                        <span className="text-muted-foreground">{user.email}</span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            {selectedMember && (
              <div className="rounded-lg border bg-muted/40 p-3 text-sm">
                Selected:{" "}
                <span className="font-medium">
                  {selectedMember.firstName} {selectedMember.lastName}
                </span>{" "}
                ({selectedMember.email})
              </div>
            )}

            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {staffRoles.map((role) => (
                    <SelectItem key={role} value={role}>
                      {formatRoleLabel(role)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setAssignOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleAssign}
              disabled={!selectedMember || !selectedRole || roleMutation.isPending}
            >
              Assign role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
