import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Send } from "lucide-react";
import { adminNewsletterAPI } from "@/api/admin";
import DataTable from "@/components/admin/DataTable";
import RichTextEditor from "@/components/admin/RichTextEditor";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/utils/format";

export default function NewsletterAdmin() {
  const queryClient = useQueryClient();
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [campaignId, setCampaignId] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "newsletter", "subscribers"],
    queryFn: () => adminNewsletterAPI.getSubscribers({ limit: 100 }),
  });

  const createMutation = useMutation({
    mutationFn: () => adminNewsletterAPI.createCampaign({ subject, body }),
    onSuccess: (res) => {
      toast.success("Campaign draft saved");
      setCampaignId(res.data?.campaign?._id);
    },
    onError: (err) => toast.error(err.message),
  });

  const sendMutation = useMutation({
    mutationFn: (id) => adminNewsletterAPI.sendCampaign(id),
    onSuccess: (res) => {
      toast.success(`Campaign sent to ${res.data?.sent ?? 0} subscribers`);
      setSubject("");
      setBody("");
      setCampaignId(null);
      queryClient.invalidateQueries({ queryKey: ["admin", "newsletter"] });
    },
    onError: (err) => toast.error(err.message),
  });

  const subscribers = data?.data?.subscribers ?? [];

  const columns = [
    { accessorKey: "email", header: "Email" },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={row.original.status === "active" ? "default" : "secondary"}>
          {row.original.status}
        </Badge>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Subscribed",
      cell: ({ row }) => formatDate(row.original.createdAt, "PP"),
    },
  ];

  const handleSend = async () => {
    if (!subject || !body) {
      toast.error("Subject and body are required");
      return;
    }

    if (!window.confirm("Send this campaign to all active subscribers? ")) return;

    if (campaignId) {
      sendMutation.mutate(campaignId);
    } else {
      createMutation.mutate(undefined, {
        onSuccess: (res) => {
          const id = res.data?.campaign?._id;
          if (id) sendMutation.mutate(id);
        },
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Newsletter</h1>
        <p className="text-sm text-muted-foreground">
          Manage subscribers and send email campaigns.
        </p>
      </div>

      <Tabs defaultValue="subscribers">
        <TabsList>
          <TabsTrigger value="subscribers">Subscribers</TabsTrigger>
          <TabsTrigger value="compose">Compose campaign</TabsTrigger>
        </TabsList>

        <TabsContent value="subscribers" className="mt-4">
          <DataTable columns={columns} data={subscribers} isLoading={isLoading} />
        </TabsContent>

        <TabsContent value="compose" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">New campaign</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Newsletter subject line"
                />
              </div>
              <div className="grid gap-2">
                <Label>Body</Label>
                <RichTextEditor value={body} onChange={setBody} />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => createMutation.mutate()}
                  disabled={createMutation.isPending}
                >
                  Save draft
                </Button>
                <Button
                  onClick={handleSend}
                  disabled={sendMutation.isPending || createMutation.isPending}
                >
                  <Send className="mr-2 h-4 w-4" />
                  Send campaign
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
