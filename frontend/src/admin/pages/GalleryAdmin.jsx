import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Check, Trash2 } from "lucide-react";
import { adminGalleryAPI } from "@/api/admin";
import DataTable from "@/components/admin/DataTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDate } from "@/utils/format";

export default function GalleryAdmin() {
  const queryClient = useQueryClient();

  const { data: pendingData, isLoading: pendingLoading } = useQuery({
    queryKey: ["admin", "gallery", "pending"],
    queryFn: () => adminGalleryAPI.getAll({ limit: 100 }),
    select: (res) => ({
      ...res,
      data: {
        items: (res.data?.items ?? []).filter((item) => !item.isApproved),
      },
    }),
  });

  const { data: allData, isLoading: allLoading } = useQuery({
    queryKey: ["admin", "gallery", "all"],
    queryFn: () => adminGalleryAPI.getAll({ limit: 100 }),
  });

  const approveMutation = useMutation({
    mutationFn: (id) => adminGalleryAPI.approve(id),
    onSuccess: () => {
      toast.success("Gallery item approved");
      queryClient.invalidateQueries({ queryKey: ["admin", "gallery"] });
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => adminGalleryAPI.delete(id),
    onSuccess: () => {
      toast.success("Gallery item deleted");
      queryClient.invalidateQueries({ queryKey: ["admin", "gallery"] });
    },
    onError: (err) => toast.error(err.message),
  });

  const buildColumns = (showApprove) => [
    {
      accessorKey: "thumbnail",
      header: "Preview",
      cell: ({ row }) => (
        <img
          src={row.original.thumbnail || row.original.url}
          alt=""
          className="h-12 w-12 rounded object-cover"
        />
      ),
    },
    { accessorKey: "title", header: "Title" },
    {
      accessorKey: "uploadedBy",
      header: "Uploaded by",
      cell: ({ row }) =>
        row.original.uploadedBy
          ? `${row.original.uploadedBy.firstName} ${row.original.uploadedBy.lastName}`
          : "—",
    },
    {
      accessorKey: "isApproved",
      header: "Status",
      cell: ({ row }) =>
        row.original.isApproved ? (
          <Badge>Approved</Badge>
        ) : (
          <Badge variant="secondary">Pending</Badge>
        ),
    },
    {
      accessorKey: "createdAt",
      header: "Submitted",
      cell: ({ row }) => formatDate(row.original.createdAt, "PP"),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex gap-2">
          {showApprove && !row.original.isApproved && (
            <Button
              size="sm"
              onClick={() => approveMutation.mutate(row.original._id)}
            >
              <Check className="mr-1 h-4 w-4" />
              Approve
            </Button>
          )}
          <Button
            size="sm"
            variant="destructive"
            onClick={() => {
              if (window.confirm("Delete this item? ")) {
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

  const pendingItems = pendingData?.data?.items ?? [];
  const allItems = allData?.data?.items ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Gallery</h1>
        <p className="text-sm text-muted-foreground">
          Review and approve community photo submissions.
        </p>
      </div>

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">
            Pending ({pendingItems.length})
          </TabsTrigger>
          <TabsTrigger value="all">All items</TabsTrigger>
        </TabsList>
        <TabsContent value="pending" className="mt-4">
          <DataTable
            columns={buildColumns(true)}
            data={pendingItems}
            isLoading={pendingLoading}
            emptyMessage="No pending submissions."
          />
        </TabsContent>
        <TabsContent value="all" className="mt-4">
          <DataTable
            columns={buildColumns(false)}
            data={allItems}
            isLoading={allLoading}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
