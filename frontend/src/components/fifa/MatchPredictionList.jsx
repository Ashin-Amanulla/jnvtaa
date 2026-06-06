import { useState } from "react";
import { SketchCard } from "@/components/SketchCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/utils/format";

/**
 * Renders a list of matches with an inline winner + optional exact-score
 * predictor. Used by both the student and alumni prediction views.
 *
 * Props:
 *  - matches: [{ _id, teamA, teamB, kickoffAt, locked, resultEntered,
 *               resultTeamAScore, resultTeamBScore, prediction }]
 *  - onSubmit: (matchId, { predictedWinner, predictedTeamAScore, predictedTeamBScore }) => Promise
 *  - submittingId: id of the match currently saving (for button state)
 */
export default function MatchPredictionList({ matches, onSubmit, submittingId }) {
  if (!matches?.length) {
    return (
      <p className="text-center text-muted-foreground">
        No matches have been scheduled yet. Check back soon.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {matches.map((m) => (
        <MatchRow
          key={m._id}
          match={m}
          onSubmit={onSubmit}
          submitting={submittingId === m._id}
        />
      ))}
    </div>
  );
}

function MatchRow({ match, onSubmit, submitting }) {
  const p = match.prediction;
  const [winner, setWinner] = useState(p?.predictedWinner || "");
  const [scoreA, setScoreA] = useState(
    p?.predictedTeamAScore ?? ""
  );
  const [scoreB, setScoreB] = useState(
    p?.predictedTeamBScore ?? ""
  );

  const locked = match.locked;

  const handleSave = () => {
    if (!winner) return;
    const payload = { predictedWinner: winner };
    if (scoreA !== "" && scoreB !== "") {
      payload.predictedTeamAScore = Number(scoreA);
      payload.predictedTeamBScore = Number(scoreB);
    }
    onSubmit(match._id, payload);
  };

  const winnerOptions = [
    { value: "teamA", label: match.teamA },
    { value: "draw", label: "Draw" },
    { value: "teamB", label: match.teamB },
  ];

  return (
    <SketchCard decoration="tape" tilt={false} className="p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="font-display text-lg font-semibold">
          {match.teamA} <span className="text-muted-foreground">vs</span>{" "}
          {match.teamB}
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {formatDate(match.kickoffAt, "PPp")}
          {locked && <Badge variant="outline">Locked</Badge>}
        </div>
      </div>

      {match.resultEntered && (
        <p className="mt-1 text-sm font-medium text-house-green">
          Result: {match.resultTeamAScore}–{match.resultTeamBScore}
          {p?.scored != null && (
            <span className="ml-2 text-muted-foreground">
              You earned {p.pointsAwarded} pt{p.pointsAwarded === 1 ? "" : "s"}
            </span>
          )}
        </p>
      )}

      {!locked && (
        <div className="mt-4 space-y-3">
          <div className="flex flex-wrap gap-2">
            {winnerOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setWinner(opt.value)}
                className={`rounded-xl border px-3 py-1.5 text-sm transition-colors ${
                  winner === opt.value
                    ? "border-brand bg-brand text-white"
                    : "border-border hover:bg-muted"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div className="flex items-end gap-3">
            <div className="grid gap-1">
              <Label className="text-xs">Exact score (optional)</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min="0"
                  className="w-16"
                  value={scoreA}
                  onChange={(e) => setScoreA(e.target.value)}
                  placeholder={match.teamA.slice(0, 3)}
                />
                <span>–</span>
                <Input
                  type="number"
                  min="0"
                  className="w-16"
                  value={scoreB}
                  onChange={(e) => setScoreB(e.target.value)}
                  placeholder={match.teamB.slice(0, 3)}
                />
              </div>
            </div>
            <Button
              onClick={handleSave}
              disabled={!winner || submitting}
            >
              {p ? "Update" : "Predict"}
            </Button>
          </div>
        </div>
      )}

      {locked && p && (
        <p className="mt-3 text-sm text-muted-foreground">
          Your pick:{" "}
          <span className="font-medium text-foreground">
            {winnerOptions.find((o) => o.value === p.predictedWinner)?.label}
          </span>
          {p.predictedTeamAScore != null &&
            ` (${p.predictedTeamAScore}–${p.predictedTeamBScore})`}
        </p>
      )}

      {locked && !p && (
        <p className="mt-3 text-sm text-muted-foreground">
          You didn't predict this match.
        </p>
      )}
    </SketchCard>
  );
}
