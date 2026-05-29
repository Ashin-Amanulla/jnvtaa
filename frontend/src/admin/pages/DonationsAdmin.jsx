import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { adminDonationsAPI } from "@/api/admin";
import DataTable from "@/components/admin/DataTable";
import ImageUploader from "@/components/admin/ImageUploader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { formatCurrency, formatDate } from "@/utils/format";

const emptyCampaign = {
  title: "",
  description: "",
  goal: "",
  coverImage: "",
  isActive: true,
};

export default function DonationsAdmin() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyCampaign);

  const { data: campaignsData, isLoading: campaignsLoading } = useQuery({
    queryKey: ["admin", "campaigns"],
    queryFn: () => adminDonationsAPI.getCampaigns({ limit: 100 }),
  });

  const { data: donationsData, isLoading: donationsLoading } = useQuery({
    queryKey: ["admin", "donations"],
    queryFn: () => adminDonationsAPI.getAllDonations({ limit: 100 }),
  });

  const saveMutation = useMutation({
    mutationFn: (payload) =>
      editing
        ? adminDonationsAPI.updateCampaign(editing._id, payload)
        : adminDonationsAPI.createCampaign(payload),
    onSuccess: () => {
      toast.success(editing ? "Campaign updated" : "Campaign created");
      queryClient.invalidateQueries({ queryKey: ["admin", "campaigns"] });
      closeDialog();
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => adminDonationsAPI.deleteCampaign(id),
    onSuccess: () => {
      toast.success("Campaign deleted");
      queryClient.invalidateQueries({ queryKey: ["admin", "campaigns"] });
    },
    onError: (err) => toast.error(err.message),
  });

  const campaigns = campaignsData?.data?.campaigns ?? [];
  const donations = donationsData?.data?.donations ?? [];

  const openCreate = () => {
    setEditing(null);
    setForm(emptyCampaign);
    setDialogOpen(true);
  };

  const openEdit = (campaign) => {
    setEditing(campaign);
    setForm({
      title: campaign.title || "",
      description: campaign.description || "",
      goal: String(campaign.goal || ""),
      coverImage: campaign.coverImage || "",
      isActive: campaign.isActive !== false,
    });
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditing(null);
    setForm(emptyCampaign);
  };

  const campaignColumns = [
    { accessorKey: "title", header: "Campaign" },
    {
      accessorKey: "goal",
      header: "Goal",
      cell: ({ row }) => formatCurrency(row.original.goal || 0),
    },
    {
      accessorKey: "raised",
      header: "Raised",
      cell: ({ row }) => formatCurrency(row.original.raised || 0),
    },
    {
      accessorKey: "isActive",
      header: "Active",
      cell: ({ row }) =>
        row.original.isActive ? (
          <Badge>Active</Badge>
        ) : (
          <Badge variant="secondary">Inactive</Badge>
        ),
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
              if (window.confirm("Delete this campaign? ")) {
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

  const donationColumns = [
    {
      accessorKey: "donor",
      header: "Donor",
      cell: ({ row }) =>
        row.original.donor
          ? `${row.original.donor.firstName} ${row.original.donor.lastName}`
          : "Anonymous",
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }) => formatCurrency(row.original.amount || 0),
    },
    {
      accessorKey: "campaign",
      header: "Campaign",
      cell: ({ row }) => row.original.campaign?.title || "—",
    },
    {
      accessorKey: "paymentStatus",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant="outline">{row.original.paymentStatus}</Badge>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Date",
      cell: ({ row }) => formatDate(row.original.createdAt, "PP"),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Donations</h1>
          <p className="text-sm text-muted-foreground">
            Manage fundraising campaigns and view donations.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Add campaign
        </Button>
      </div>

      <Tabs defaultValue="campaigns">
        <TabsList>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="donations">Donations</TabsTrigger>
        </TabsList>
        <TabsContent value="campaigns" className="mt-4">
          <DataTable
            columns={campaignColumns}
            data={campaigns}
            isLoading={campaignsLoading}
          />
        </TabsContent>
        <TabsContent value="donations" className="mt-4">
          <DataTable
            columns={donationColumns}
            data={donations}
            isLoading={donationsLoading}
          />
        </TabsContent>
      </Tabs>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit campaign" : "Create campaign"}</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              saveMutation.mutate({
                ...form,
                goal: Number(form.goal),
              });
            }}
            className="space-y-4"
          >
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
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
            <div className="grid gap-2">
              <Label htmlFor="goal">Goal (INR)</Label>
              <Input
                id="goal"
                type="number"
                required
                value={form.goal}
                onChange={(e) => setForm({ ...form, goal: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label>Cover image</Label>
              <ImageUploader
                value={form.coverImage}
                onChange={(url) => setForm({ ...form, coverImage: url })}
                folder="campaigns"
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="active"
                checked={form.isActive}
                onCheckedChange={(isActive) => setForm({ ...form, isActive })}
              />
              <Label htmlFor="active">Active</Label>
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
