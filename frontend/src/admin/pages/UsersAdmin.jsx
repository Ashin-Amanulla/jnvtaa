import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  MoreHorizontal,
  Pencil,
  BadgeCheck,
  UserX,
  ExternalLink,
} from "lucide-react";
import { adminUsersAPI } from "@/api/admin";
import { useAuthStore } from "@/store/auth";
import { hasPermission, PERMISSIONS } from "@/utils/roles";
import DataTable from "@/components/admin/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDate, formatBatchOf } from "@/utils/format";

function UserActionsMenu({
  user,
  canManage,
  canVerify,
  canDeactivate,
  onEdit,
  onVerify,
  onDeactivate,
}) {
  const hasMenuItems =
    canManage ||
    (canVerify && !user.isVerified) ||
    (canDeactivate && user.isActive);

  if (!hasMenuItems) {
    return (
      <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
        <Link to={`/alumni/${user._id}`} target="_blank" rel="noopener noreferrer">
          <ExternalLink className="h-4 w-4" />
        </Link>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuItem asChild>
          <Link to={`/alumni/${user._id}`} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="mr-2 h-4 w-4" />
            View profile
          </Link>
        </DropdownMenuItem>
        {canManage && (
          <DropdownMenuItem onClick={() => onEdit(user)}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
        )}
        {canVerify && !user.isVerified && (
          <DropdownMenuItem onClick={() => onVerify(user._id)}>
            <BadgeCheck className="mr-2 h-4 w-4" />
            Verify
          </DropdownMenuItem>
        )}
        {canDeactivate && user.isActive && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => onDeactivate(user._id)}
            >
              <UserX className="mr-2 h-4 w-4" />
              Deactivate
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function UsersAdmin() {
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuthStore();
  const [page, setPage] = useState(0);
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    isVerified: false,
  });
  const pageSize = 10;
  const canManage = hasPermission(currentUser, PERMISSIONS.USERS_MANAGE);
  const canVerify = hasPermission(currentUser, PERMISSIONS.USERS_VERIFY);
  const canDeactivate = hasPermission(currentUser, PERMISSIONS.USERS_DEACTIVATE);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "users", page],
    queryFn: () =>
      adminUsersAPI.getAll({ page: page + 1, limit: pageSize, membersOnly: true }),
  });

  const verifyMutation = useMutation({
    mutationFn: (id) => adminUsersAPI.verify(id),
    onSuccess: () => {
      toast.success("User verified");
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
    onError: (err) => toast.error(err.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => adminUsersAPI.update(id, data),
    onSuccess: () => {
      toast.success("User updated");
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      setEditingUser(null);
    },
    onError: (err) => toast.error(err.message),
  });

  const deactivateMutation = useMutation({
    mutationFn: (id) => adminUsersAPI.deactivate(id),
    onSuccess: () => {
      toast.success("User deactivated");
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
    onError: (err) => toast.error(err.message),
  });

  const users = data?.data?.users ?? [];
  const pageCount = data?.pagination?.totalPages ?? 0;

  const openEdit = (user) => {
    setEditingUser(user);
    setEditForm({
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      email: user.email || "",
      phone: user.phone || "",
      isVerified: user.isVerified || false,
    });
  };

  const handleDeactivate = (id) => {
    if (window.confirm("Deactivate this user?")) {
      deactivateMutation.mutate(id);
    }
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editingUser) return;
    updateMutation.mutate({ id: editingUser._id, data: editForm });
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
      accessorKey: "batch",
      header: "Batch",
      cell: ({ row }) => formatBatchOf(row.original.batch) ?? "—",
    },
    {
      accessorKey: "isVerified",
      header: "Status",
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="flex items-center gap-2">
            {user.isVerified ? (
              <Badge variant="default">Verified</Badge>
            ) : (
              <Badge variant="secondary">Unverified</Badge>
            )}
            {!user.isActive && <Badge variant="destructive">Inactive</Badge>}
            {canVerify && !user.isVerified && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-green-600 hover:bg-green-50 hover:text-green-700"
                title="Verify user"
                onClick={() => verifyMutation.mutate(user._id)}
                disabled={verifyMutation.isPending}
              >
                <BadgeCheck className="h-4 w-4" />
                <span className="sr-only">Verify user</span>
              </Button>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Joined",
      cell: ({ row }) => formatDate(row.original.createdAt, "PP"),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <UserActionsMenu
          user={row.original}
          canManage={canManage}
          canVerify={canVerify}
          canDeactivate={canDeactivate}
          onEdit={openEdit}
          onVerify={(id) => verifyMutation.mutate(id)}
          onDeactivate={handleDeactivate}
        />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Users</h1>
        <p className="text-sm text-muted-foreground">
          Manage alumni member accounts and verification. Staff and admin access
          is assigned separately under Staff Access.
        </p>
      </div>
      <DataTable
        columns={columns}
        data={users}
        isLoading={isLoading}
        manualPagination
        pageCount={pageCount}
        pageIndex={page}
        onPageChange={setPage}
        pageSize={pageSize}
      />

      <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit user</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="edit-firstName">First name</Label>
                <Input
                  id="edit-firstName"
                  value={editForm.firstName}
                  onChange={(e) =>
                    setEditForm({ ...editForm, firstName: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-lastName">Last name</Label>
                <Input
                  id="edit-lastName"
                  value={editForm.lastName}
                  onChange={(e) =>
                    setEditForm({ ...editForm, lastName: e.target.value })
                  }
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-phone">Phone</Label>
              <Input
                id="edit-phone"
                value={editForm.phone}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <Label htmlFor="edit-verified">Verified</Label>
              <Switch
                id="edit-verified"
                checked={editForm.isVerified}
                onCheckedChange={(checked) =>
                  setEditForm({ ...editForm, isVerified: checked })
                }
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditingUser(null)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                Save changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
