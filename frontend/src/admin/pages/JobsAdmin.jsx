import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { adminJobsAPI } from "@/api/admin";
import DataTable from "@/components/admin/DataTable";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { formatDate } from "@/utils/format";

export default function JobsAdmin() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "jobs"],
    queryFn: () => adminJobsAPI.getAll({ limit: 100 }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => adminJobsAPI.update(id, payload),
    onSuccess: () => {
      toast.success("Job updated");
      queryClient.invalidateQueries({ queryKey: ["admin", "jobs"] });
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => adminJobsAPI.delete(id),
    onSuccess: () => {
      toast.success("Job deleted");
      queryClient.invalidateQueries({ queryKey: ["admin", "jobs"] });
    },
    onError: (err) => toast.error(err.message),
  });

  const jobs = data?.data?.jobs ?? [];

  const columns = [
    { accessorKey: "title", header: "Title" },
    { accessorKey: "company", header: "Company" },
    {
      accessorKey: "postedBy",
      header: "Posted by",
      cell: ({ row }) =>
        row.original.postedBy
          ? `${row.original.postedBy.firstName} ${row.original.postedBy.lastName}`
          : "—",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <SelectStatus
          value={row.original.status}
          onChange={(status) =>
            updateMutation.mutate({ id: row.original._id, payload: { status } })
          }
        />
      ),
    },
    {
      accessorKey: "isPublished",
      header: "Published",
      cell: ({ row }) => (
        <Switch
          checked={!!row.original.isPublished}
          onCheckedChange={(isPublished) =>
            updateMutation.mutate({
              id: row.original._id,
              payload: { isPublished },
            })
          }
        />
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Posted",
      cell: ({ row }) => formatDate(row.original.createdAt, "PP"),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <Button
          size="sm"
          variant="destructive"
          onClick={() => {
            if (window.confirm("Delete this job listing? ")) {
              deleteMutation.mutate(row.original._id);
            }
          }}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Jobs</h1>
        <p className="text-sm text-muted-foreground">
          Moderate job listings and toggle visibility.
        </p>
      </div>
      <DataTable columns={columns} data={jobs} isLoading={isLoading} />
    </div>
  );
}

function SelectStatus({ value, onChange }) {
  const statuses = ["active", "closed", "filled"];

  return (
    <div className="flex gap-1">
      {statuses.map((status) => (
        <button
          key={status}
          type="button"
          onClick={() => onChange(status)}
          className="focus:outline-none"
        >
          <Badge variant={value === status ? "default" : "outline"}>
            {status}
          </Badge>
        </button>
      ))}
    </div>
  );
}
