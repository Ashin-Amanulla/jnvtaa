import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { fifaAPI } from "@/api";
import { QUERY_KEYS, STALE_TIME } from "@/api/queryKeys";
import MatchPredictionList from "@/components/fifa/MatchPredictionList";
import { SketchButton } from "@/components/SketchButton";

export default function FifaPlay() {
  const queryClient = useQueryClient();
  const [submittingId, setSubmittingId] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: QUERY_KEYS.fifaMyPredictions,
    queryFn: () => fifaAPI.getMyPredictions(),
    staleTime: STALE_TIME.FIFA,
  });

  const mutation = useMutation({
    mutationFn: ({ matchId, payload }) =>
      fifaAPI.submitAlumniPrediction({ matchId, ...payload }),
    onMutate: ({ matchId }) => setSubmittingId(matchId),
    onSuccess: () => {
      toast.success("Prediction saved");
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.fifaMyPredictions });
    },
    onError: (err) => toast.error(err.message),
    onSettled: () => setSubmittingId(null),
  });

  const matches = data?.data?.matches ?? [];

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-12">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold">Your Predictions</h1>
        <SketchButton to="/fifa/leaderboard" variant="ghost">
          Leaderboard
        </SketchButton>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : (
        <MatchPredictionList
          matches={matches}
          submittingId={submittingId}
          onSubmit={(matchId, payload) => mutation.mutate({ matchId, payload })}
        />
      )}
    </div>
  );
}
