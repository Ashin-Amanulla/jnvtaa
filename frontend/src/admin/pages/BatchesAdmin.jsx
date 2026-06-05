import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { adminBatchesAPI } from "@/api/admin";
import { QUERY_KEYS, STALE_TIME } from "@/api/queryKeys";
import DataTable from "@/components/admin/DataTable";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const emptyForm = {
  year: "",
  passoutYear: "",
  name: "",
  description: "",
};

export default function BatchesAdmin() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const { data, isLoading } = useQuery({
    queryKey: QUERY_KEYS.adminBatches,
    queryFn: () => adminBatchesAPI.getAll({ limit: 100 }),
    staleTime: STALE_TIME.BATCHES,
  });

  const invalidateBatchQueries = () => {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.batchesRoot });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.adminBatches });
  };

  const saveMutation = useMutation({
    mutationFn: (payload) =>
      editing
        ? adminBatchesAPI.update(editing._id, payload)
        : adminBatchesAPI.create(payload),
    onSuccess: () => {
      toast.success(editing ? "Batch updated" : "Batch created");
      invalidateBatchQueries();
      closeDialog();
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => adminBatchesAPI.delete(id),
    onSuccess: () => {
      toast.success("Batch deleted");
      invalidateBatchQueries();
    },
    onError: (err) => toast.error(err.message),
  });

  const batches = data?.data?.batches ?? data?.data ?? [];

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (batch) => {
    setEditing(batch);
    setForm({
      year: String(batch.year || ""),
      passoutYear: String(batch.passoutYear || ""),
      name: batch.name || "",
      description: batch.description || "",
    });
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditing(null);
    setForm(emptyForm);
  };

  const handleYearChange = (value) => {
    setForm((prev) => {
      const next = { ...prev, year: value };
      if (!editing && value && !prev.passoutYear) {
        const admissionYear = Number(value);
        if (!Number.isNaN(admissionYear)) {
          next.passoutYear = String(admissionYear + 7);
        }
      }
      return next;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const year = Number(form.year);
    const passoutYear = Number(form.passoutYear);

    if (!year || !passoutYear) {
      toast.error("Admission year and passout year are required");
      return;
    }

    saveMutation.mutate({
      name: form.name.trim(),
      description: form.description.trim(),
      year,
      passoutYear,
    });
  };

  const columns = [
    { accessorKey: "year", header: "Admission year" },
    { accessorKey: "passoutYear", header: "Passout year" },
    { accessorKey: "name", header: "Name" },
    {
      accessorKey: "alumniCount",
      header: "Members",
      cell: ({ row }) => row.original.alumniCount ?? "—",
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => openEdit(row.original)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => {
              if (window.confirm("Delete this batch? ")) {
                deleteMutation.mutate(row.original._id);
              }
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Batches</h1>
          <p className="text-sm text-muted-foreground">Manage alumni batch groups.</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Add batch
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={Array.isArray(batches) ? batches : []}
        isLoading={isLoading}
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit batch" : "Create batch"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="year">Admission year</Label>
                <Input
                  id="year"
                  type="number"
                  required
                  min={1985}
                  max={new Date().getFullYear() + 10}
                  value={form.year}
                  onChange={(e) => handleYearChange(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="passoutYear">Passout year</Label>
                <Input
                  id="passoutYear"
                  type="number"
                  required
                  min={1985}
                  max={new Date().getFullYear() + 20}
                  value={form.passoutYear}
                  onChange={(e) =>
                    setForm({ ...form, passoutYear: e.target.value })
                  }
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Passout year is auto-suggested as admission year + 7 when creating a batch.
            </p>
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                required
                placeholder="e.g. Batch of 2010"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeDialog}>
                Cancel
              </Button>
              <Button type="submit" disabled={saveMutation.isPending}>
                Save
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
