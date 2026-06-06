import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Trophy } from "lucide-react";
import { adminFifaAPI } from "@/api/admin";
import { QUERY_KEYS } from "@/api/queryKeys";
import DataTable from "@/components/admin/DataTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import { formatDate } from "@/utils/format";

function toDatetimeLocalValue(value) {
  if (!value) return "";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${parsed.getFullYear()}-${pad(parsed.getMonth() + 1)}-${pad(parsed.getDate())}T${pad(parsed.getHours())}:${pad(parsed.getMinutes())}`;
}

function toIsoDate(value) {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString();
}

const STAGES = [
  { value: "group", label: "Group" },
  { value: "r16", label: "Round of 16" },
  { value: "qf", label: "Quarterfinal" },
  { value: "sf", label: "Semifinal" },
  { value: "final", label: "Final" },
];

export default function FifaAdmin() {
  const queryClient = useQueryClient();

  const { data: campaignData } = useQuery({
    queryKey: QUERY_KEYS.fifaCampaign,
    queryFn: () => adminFifaAPI.getCampaign(),
  });

  const campaign = campaignData?.data?.campaign;
  const matches = campaignData?.data?.matches ?? [];

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.fifaCampaign });
    queryClient.invalidateQueries({ queryKey: ["admin", "fifa", "students"] });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Trophy className="h-6 w-6 text-house-yellow" />
        <div>
          <h1 className="text-2xl font-semibold">FIFA Predictions</h1>
          <p className="text-sm text-muted-foreground">
            Manage the campaign, fixtures, results and student registrations.
          </p>
        </div>
      </div>

      {!campaign ? (
        <CampaignForm campaign={null} onSaved={invalidate} />
      ) : (
        <Tabs defaultValue="matches">
          <TabsList>
            <TabsTrigger value="matches">Matches</TabsTrigger>
            <TabsTrigger value="students">Students</TabsTrigger>
            <TabsTrigger value="campaign">Campaign</TabsTrigger>
          </TabsList>

          <TabsContent value="matches" className="pt-4">
            <MatchesTab
              campaign={campaign}
              matches={matches}
              onChanged={invalidate}
            />
          </TabsContent>

          <TabsContent value="students" className="pt-4">
            <StudentsTab />
          </TabsContent>

          <TabsContent value="campaign" className="pt-4">
            <CampaignForm campaign={campaign} onSaved={invalidate} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

/* ----------------------------- Campaign form ----------------------------- */

function CampaignForm({ campaign, onSaved }) {
  const [form, setForm] = useState({
    name: campaign?.name || "",
    description: campaign?.description || "",
    status: campaign?.status || "upcoming",
    registrationCloseAt: toDatetimeLocalValue(campaign?.registrationCloseAt),
  });

  const mutation = useMutation({
    mutationFn: (payload) =>
      campaign
        ? adminFifaAPI.updateCampaign(campaign._id, payload)
        : adminFifaAPI.createCampaign(payload),
    onSuccess: () => {
      toast.success(campaign ? "Campaign updated" : "Campaign created");
      onSaved();
    },
    onError: (err) => toast.error(err.message),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate({
      ...form,
      registrationCloseAt: toIsoDate(form.registrationCloseAt),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-lg space-y-4">
      <div className="grid gap-2">
        <Label htmlFor="name">Campaign name</Label>
        <Input
          id="name"
          required
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
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label>Status</Label>
          <Select
            value={form.status}
            onValueChange={(status) => setForm({ ...form, status })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="upcoming">Upcoming</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="regClose">Registration closes</Label>
          <Input
            id="regClose"
            type="datetime-local"
            value={form.registrationCloseAt}
            onChange={(e) =>
              setForm({ ...form, registrationCloseAt: e.target.value })
            }
          />
        </div>
      </div>
      <Button type="submit" disabled={mutation.isPending}>
        {campaign ? "Save changes" : "Create campaign"}
      </Button>
    </form>
  );
}

/* ------------------------------ Matches tab ------------------------------ */

const emptyMatch = {
  teamA: "",
  teamB: "",
  kickoffAt: "",
  stage: "group",
};

function MatchesTab({ campaign, matches, onChanged }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyMatch);

  const [resultOpen, setResultOpen] = useState(false);
  const [resultMatch, setResultMatch] = useState(null);
  const [result, setResult] = useState({ a: "", b: "" });

  const saveMutation = useMutation({
    mutationFn: (payload) =>
      editing
        ? adminFifaAPI.updateMatch(editing._id, payload)
        : adminFifaAPI.createMatch({ ...payload, campaign: campaign._id }),
    onSuccess: () => {
      toast.success(editing ? "Match updated" : "Match created");
      onChanged();
      setDialogOpen(false);
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => adminFifaAPI.deleteMatch(id),
    onSuccess: () => {
      toast.success("Match deleted");
      onChanged();
    },
    onError: (err) => toast.error(err.message),
  });

  const resultMutation = useMutation({
    mutationFn: ({ id, payload }) => adminFifaAPI.enterResult(id, payload),
    onSuccess: (res) => {
      toast.success(
        `Result saved — ${res.data?.scoredCount ?? 0} predictions scored`
      );
      onChanged();
      setResultOpen(false);
    },
    onError: (err) => toast.error(err.message),
  });

  const openCreate = () => {
    setEditing(null);
    setForm(emptyMatch);
    setDialogOpen(true);
  };

  const openEdit = (m) => {
    setEditing(m);
    setForm({
      teamA: m.teamA,
      teamB: m.teamB,
      kickoffAt: toDatetimeLocalValue(m.kickoffAt),
      stage: m.stage || "group",
    });
    setDialogOpen(true);
  };

  const openResult = (m) => {
    setResultMatch(m);
    setResult({
      a: m.resultTeamAScore ?? "",
      b: m.resultTeamBScore ?? "",
    });
    setResultOpen(true);
  };

  const columns = [
    {
      id: "match",
      header: "Match",
      cell: ({ row }) => `${row.original.teamA} vs ${row.original.teamB}`,
    },
    {
      accessorKey: "kickoffAt",
      header: "Kickoff",
      cell: ({ row }) => formatDate(row.original.kickoffAt, "PPp"),
    },
    {
      accessorKey: "stage",
      header: "Stage",
      cell: ({ row }) => (
        <Badge variant="outline">{row.original.stage}</Badge>
      ),
    },
    {
      id: "result",
      header: "Result",
      cell: ({ row }) =>
        row.original.resultEntered ? (
          <span className="font-medium">
            {row.original.resultTeamAScore}–{row.original.resultTeamBScore}
          </span>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button size="sm" onClick={() => openResult(row.original)}>
            Result
          </Button>
          <Button size="sm" variant="outline" onClick={() => openEdit(row.original)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => {
              if (window.confirm("Delete this match and its predictions?")) {
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
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Add match
        </Button>
      </div>

      <DataTable columns={columns} data={matches} />

      {/* Create / edit match */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit match" : "Add match"}</DialogTitle>
            <DialogDescription>
              Set teams, kickoff time, and tournament stage. Predictions lock one
              hour before kickoff.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              saveMutation.mutate({
                ...form,
                kickoffAt: toIsoDate(form.kickoffAt),
              });
            }}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="teamA">Team A</Label>
                <Input
                  id="teamA"
                  required
                  value={form.teamA}
                  onChange={(e) => setForm({ ...form, teamA: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="teamB">Team B</Label>
                <Input
                  id="teamB"
                  required
                  value={form.teamB}
                  onChange={(e) => setForm({ ...form, teamB: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="kickoffAt">Kickoff</Label>
                <Input
                  id="kickoffAt"
                  type="datetime-local"
                  required
                  value={form.kickoffAt}
                  onChange={(e) =>
                    setForm({ ...form, kickoffAt: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label>Stage</Label>
                <Select
                  value={form.stage}
                  onValueChange={(stage) => setForm({ ...form, stage })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STAGES.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Predictions lock automatically one hour before kickoff.
            </p>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saveMutation.isPending}>
                Save
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Enter result */}
      <Dialog open={resultOpen} onOpenChange={setResultOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>
              Enter result
              {resultMatch && (
                <span className="block text-sm font-normal text-muted-foreground">
                  {resultMatch.teamA} vs {resultMatch.teamB}
                </span>
              )}
            </DialogTitle>
            <DialogDescription>
              Save the final score to score all predictions for this match.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              resultMutation.mutate({
                id: resultMatch._id,
                payload: {
                  resultTeamAScore: Number(result.a),
                  resultTeamBScore: Number(result.b),
                },
              });
            }}
            className="space-y-4"
          >
            <div className="flex items-end justify-center gap-3">
              <div className="grid gap-2 text-center">
                <Label>{resultMatch?.teamA}</Label>
                <Input
                  type="number"
                  min="0"
                  required
                  className="w-20"
                  value={result.a}
                  onChange={(e) => setResult({ ...result, a: e.target.value })}
                />
              </div>
              <span className="pb-2 text-xl">–</span>
              <div className="grid gap-2 text-center">
                <Label>{resultMatch?.teamB}</Label>
                <Input
                  type="number"
                  min="0"
                  required
                  className="w-20"
                  value={result.b}
                  onChange={(e) => setResult({ ...result, b: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={resultMutation.isPending}>
                Save &amp; score
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ------------------------------ Students tab ----------------------------- */

function StudentsTab() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "fifa", "students"],
    queryFn: () => adminFifaAPI.getStudents(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => adminFifaAPI.deleteStudent(id),
    onSuccess: () => {
      toast.success("Student removed");
      queryClient.invalidateQueries({ queryKey: ["admin", "fifa", "students"] });
    },
    onError: (err) => toast.error(err.message),
  });

  const students = data?.data?.students ?? [];

  const columns = [
    { accessorKey: "name", header: "Name" },
    { accessorKey: "rollNumber", header: "Roll number" },
    { accessorKey: "email", header: "Email" },
    {
      accessorKey: "classSection",
      header: "Class",
      cell: ({ row }) => row.original.classSection || "—",
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <Button
          size="sm"
          variant="destructive"
          onClick={() => {
            if (window.confirm("Remove this student and their predictions?")) {
              deleteMutation.mutate(row.original._id);
            }
          }}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  return <DataTable columns={columns} data={students} isLoading={isLoading} />;
}
