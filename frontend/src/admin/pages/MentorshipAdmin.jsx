import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Check } from "lucide-react";
import { adminMentorshipAPI } from "@/api/admin";
import { QUERY_KEYS } from "@/api/queryKeys";
import DataTable from "@/components/admin/DataTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function MentorshipAdmin() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState("pending");

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "mentorship", tab],
    queryFn: () =>
      adminMentorshipAPI.getProfiles({
        limit: 100,
        isApproved: tab === "approved" ? "true" : "false",
      }),
  });

  const approveMutation = useMutation({
    mutationFn: (id) => adminMentorshipAPI.approve(id),
    onSuccess: () => {
      toast.success("Mentor approved");
      queryClient.invalidateQueries({ queryKey: ["admin", "mentorship"] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.mentors });
    },
    onError: (err) => toast.error(err.message),
  });

  const profiles = data?.data?.profiles ?? [];

  const columns = [
    {
      accessorKey: "user",
      header: "Mentor",
      cell: ({ row }) => {
        const user = row.original.user;
        return user ? `${user.firstName} ${user.lastName}` : "—";
      },
    },
    {
      accessorKey: "domains",
      header: "Domains",
      cell: ({ row }) => (row.original.domains || []).join(", ") || "—",
    },
    {
      accessorKey: "availability",
      header: "Availability",
      cell: ({ row }) => (
        <Badge variant="outline">{row.original.availability || "open"}</Badge>
      ),
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
      id: "actions",
      header: "Actions",
      cell: ({ row }) =>
        !row.original.isApproved ? (
          <Button
            size="sm"
            onClick={() => approveMutation.mutate(row.original._id)}
          >
            <Check className="mr-1 h-4 w-4" />
            Approve
          </Button>
        ) : null,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Mentorship</h1>
        <p className="text-sm text-muted-foreground">
          Review mentor applications and approve profiles.
        </p>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
        </TabsList>
        <TabsContent value={tab} className="mt-4">
          <DataTable
            columns={columns}
            data={profiles}
            isLoading={isLoading}
            emptyMessage={
              tab === "pending"
                ? "No pending mentor applications."
                : "No approved mentors yet."
            }
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
