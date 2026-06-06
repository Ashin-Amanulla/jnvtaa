import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Flame } from "lucide-react";
import { fifaAPI } from "@/api";
import { QUERY_KEYS, STALE_TIME } from "@/api/queryKeys";
import { SketchCard } from "@/components/SketchCard";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";

export default function FifaLeaderboard() {
  const [track, setTrack] = useState("student");

  const { data, isLoading } = useQuery({
    queryKey: QUERY_KEYS.fifaLeaderboard(track),
    queryFn: () => fifaAPI.getLeaderboard({ track }),
    staleTime: STALE_TIME.FIFA,
  });

  const rows = data?.data?.leaderboard ?? [];

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-12">
      <h1 className="text-center font-display text-3xl font-bold">Leaderboard</h1>

      <div className="flex justify-center gap-2">
        {[
          { value: "student", label: "Students" },
          { value: "alumni", label: "Alumni" },
        ].map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => setTrack(t.value)}
            className={`rounded-xl border px-4 py-2 text-sm transition-colors ${
              track === t.value
                ? "border-brand bg-brand text-white"
                : "border-border hover:bg-muted"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <SketchCard className="p-2">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>{track === "alumni" ? "Batch" : "Class"}</TableHead>
              <TableHead className="text-right">Points</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  Loading…
                </TableCell>
              </TableRow>
            )}
            {!isLoading && rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  No scores yet. Points appear once results are entered.
                </TableCell>
              </TableRow>
            )}
            {rows.map((r) => (
              <TableRow key={`${r.rank}-${r.name}`}>
                <TableCell className="font-medium">{r.rank}</TableCell>
                <TableCell className="flex items-center gap-2">
                  {r.name}
                  {r.hotStreak && (
                    <span title="Hot streak (3+ correct in a row)">
                      <Flame className="h-4 w-4 text-house-red" />
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {r.group || "—"}
                </TableCell>
                <TableCell className="text-right font-semibold">
                  {r.points}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </SketchCard>
    </div>
  );
}
