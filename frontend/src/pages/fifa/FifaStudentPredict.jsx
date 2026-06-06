import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { fifaAPI } from "@/api";
import MatchPredictionList from "@/components/fifa/MatchPredictionList";
import { SketchCard } from "@/components/SketchCard";
import { SketchButton } from "@/components/SketchButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function readSavedCreds() {
  try {
    return JSON.parse(sessionStorage.getItem("fifaStudent")) || null;
  } catch {
    return null;
  }
}

export default function FifaStudentPredict() {
  const saved = readSavedCreds();
  const [creds, setCreds] = useState(
    saved || { rollNumber: "", email: "" }
  );
  const [student, setStudent] = useState(null);
  const [matches, setMatches] = useState(null);
  const [submittingId, setSubmittingId] = useState(null);

  const loadMutation = useMutation({
    mutationFn: (payload) => fifaAPI.getStudentMatches(payload),
    onSuccess: (res) => {
      setStudent(res.data.student);
      setMatches(res.data.matches);
      sessionStorage.setItem("fifaStudent", JSON.stringify(creds));
    },
    onError: (err) => toast.error(err.message),
  });

  const predictMutation = useMutation({
    mutationFn: ({ matchId, payload }) =>
      fifaAPI.submitStudentPrediction({
        rollNumber: creds.rollNumber,
        email: creds.email,
        matchId,
        ...payload,
      }),
    onMutate: ({ matchId }) => setSubmittingId(matchId),
    onSuccess: () => {
      toast.success("Prediction saved");
      loadMutation.mutate(creds); // refresh the list
    },
    onError: (err) => toast.error(err.message),
    onSettled: () => setSubmittingId(null),
  });

  // Auto-load if we already have saved creds.
  const [autoTried, setAutoTried] = useState(false);
  if (saved && !autoTried && !matches) {
    setAutoTried(true);
    loadMutation.mutate(saved);
  }

  const handleLookup = (e) => {
    e.preventDefault();
    loadMutation.mutate(creds);
  };

  if (matches) {
    return (
      <div className="mx-auto max-w-2xl space-y-6 px-4 py-12">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold">Your Predictions</h1>
            {student && (
              <p className="text-sm text-muted-foreground">
                Signed in as {student.name}
              </p>
            )}
          </div>
          <SketchButton to="/fifa/leaderboard" variant="ghost">
            Leaderboard
          </SketchButton>
        </div>
        <MatchPredictionList
          matches={matches}
          submittingId={submittingId}
          onSubmit={(matchId, payload) =>
            predictMutation.mutate({ matchId, payload })
          }
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <SketchCard decoration="tape" className="p-8">
        <h1 className="font-display text-2xl font-bold">Predict</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Enter the roll number and email you registered with.
        </p>
        <form onSubmit={handleLookup} className="mt-6 space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="rollNumber">Roll number</Label>
            <Input
              id="rollNumber"
              required
              value={creds.rollNumber}
              onChange={(e) =>
                setCreds({ ...creds, rollNumber: e.target.value })
              }
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              required
              value={creds.email}
              onChange={(e) => setCreds({ ...creds, email: e.target.value })}
            />
          </div>
          <Button type="submit" className="w-full" disabled={loadMutation.isPending}>
            {loadMutation.isPending ? "Loading…" : "Load my matches"}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Not registered yet?{" "}
          <SketchButton to="/fifa/students" variant="ghost" className="px-1">
            Register
          </SketchButton>
        </p>
      </SketchCard>
    </div>
  );
}
