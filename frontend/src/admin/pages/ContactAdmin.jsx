import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { adminContactAPI } from "@/api/admin";
import DataTable from "@/components/admin/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDate } from "@/utils/format";

export default function ContactAdmin() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("");
  const [selected, setSelected] = useState(null);
  const [note, setNote] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "contact", statusFilter],
    queryFn: () =>
      adminContactAPI.getAll({
        limit: 100,
        ...(statusFilter ? { status: statusFilter } : {}),
      }),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => adminContactAPI.updateStatus(id, status),
    onSuccess: () => {
      toast.success("Status updated");
      queryClient.invalidateQueries({ queryKey: ["admin", "contact"] });
    },
    onError: (err) => toast.error(err.message),
  });

  const noteMutation = useMutation({
    mutationFn: ({ id, note: replyNote }) =>
      adminContactAPI.addReplyNote(id, replyNote),
    onSuccess: () => {
      toast.success("Reply note added");
      setNote("");
      queryClient.invalidateQueries({ queryKey: ["admin", "contact"] });
      if (selected) {
        adminContactAPI.getById(selected._id).then((res) => {
          setSelected(res.data?.contactMessage);
        });
      }
    },
    onError: (err) => toast.error(err.message),
  });

  const messages = data?.data?.contactMessages ?? [];

  const openMessage = async (msg) => {
    try {
      const res = await adminContactAPI.getById(msg._id);
      setSelected(res.data?.contactMessage);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const columns = [
    { accessorKey: "name", header: "From" },
    { accessorKey: "email", header: "Email" },
    { accessorKey: "subject", header: "Subject" },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge
          variant={
            row.original.status === "new"
              ? "default"
              : row.original.status === "resolved"
                ? "secondary"
                : "outline"
          }
        >
          {row.original.status}
        </Badge>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Received",
      cell: ({ row }) => formatDate(row.original.createdAt, "PPp"),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <Button size="sm" variant="outline" onClick={() => openMessage(row.original)}>
          View
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Contact Inbox</h1>
          <p className="text-sm text-muted-foreground">
            Read and respond to contact form submissions.
          </p>
        </div>
        <Select value={statusFilter || "all"} onValueChange={(v) => setStatusFilter(v === "all" ? "" : v)}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="read">Read</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable columns={columns} data={messages} isLoading={isLoading} />

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{selected?.subject}</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                <p>
                  From: {selected.name} ({selected.email})
                </p>
                <p>Received: {formatDate(selected.createdAt, "PPp")}</p>
              </div>
              <p className="whitespace-pre-wrap text-sm">{selected.message}</p>

              <div className="flex items-center gap-2">
                <Select
                  value={selected.status}
                  onValueChange={(status) => {
                    statusMutation.mutate({ id: selected._id, status });
                    setSelected({ ...selected, status });
                  }}
                >
                  <SelectTrigger className="w-36">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="read">Read</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {selected.replyNotes?.length > 0 && (
                <div className="space-y-2 rounded-md border p-3">
                  <p className="text-sm font-medium">Internal notes</p>
                  {selected.replyNotes.map((n) => (
                    <div key={n._id} className="text-sm text-muted-foreground">
                      <p>{n.note}</p>
                      <p className="text-xs">
                        {n.author
                          ? `${n.author.firstName} ${n.author.lastName}`
                          : "Staff"}{" "}
                        · {formatDate(n.createdAt, "PPp")}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-2">
                <Textarea
                  placeholder="Add internal reply note..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
                <Button
                  size="sm"
                  disabled={!note.trim() || noteMutation.isPending}
                  onClick={() => noteMutation.mutate({ id: selected._id, note })}
                >
                  Add note
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
