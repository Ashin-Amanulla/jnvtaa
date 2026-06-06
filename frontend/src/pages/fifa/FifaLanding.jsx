import { useQuery } from "@tanstack/react-query";
import { Trophy } from "lucide-react";
import { fifaAPI } from "@/api";
import { QUERY_KEYS, STALE_TIME } from "@/api/queryKeys";
import { useAuthStore } from "@/store/auth";
import { SketchCard } from "@/components/SketchCard";
import { SketchButton } from "@/components/SketchButton";
import { formatDate } from "@/utils/format";

export default function FifaLanding() {
  const { isAuthenticated } = useAuthStore();
  const { data } = useQuery({
    queryKey: QUERY_KEYS.fifaCampaign,
    queryFn: () => fifaAPI.getCampaign(),
    staleTime: STALE_TIME.FIFA,
  });

  const campaign = data?.data?.campaign;

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-12">
      <div className="text-center">
        <Trophy className="mx-auto mb-3 h-12 w-12 text-house-yellow" />
        <h1 className="font-display text-3xl font-bold">
          {campaign?.name || "FIFA Prediction Campaign"}
        </h1>
        {campaign?.description && (
          <p className="mt-2 text-muted-foreground">{campaign.description}</p>
        )}
        {campaign?.registrationCloseAt && (
          <p className="mt-2 text-sm text-muted-foreground">
            Registration closes {formatDate(campaign.registrationCloseAt, "PPp")}
          </p>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <SketchCard decoration="tape" className="flex flex-col p-6">
          <h2 className="font-display text-xl font-semibold">Students</h2>
          <p className="mt-2 flex-1 text-sm text-muted-foreground">
            Register with your name, roll number and email. Your roll number is
            your key — use it to come back and predict each match.
          </p>
          <SketchButton to="/fifa/students" className="mt-4">
            Register to play
          </SketchButton>
          <SketchButton
            to="/fifa/students/predict"
            variant="outline"
            className="mt-2"
          >
            Already registered? Predict
          </SketchButton>
        </SketchCard>

        <SketchCard decoration="tack" className="flex flex-col p-6">
          <h2 className="font-display text-xl font-semibold">Alumni</h2>
          <p className="mt-2 flex-1 text-sm text-muted-foreground">
            Play with your JNVTAA account. Your batch is read automatically for
            the batch-vs-batch standings.
          </p>
          {isAuthenticated ? (
            <SketchButton to="/fifa/play" className="mt-4">
              Make your predictions
            </SketchButton>
          ) : (
            <SketchButton to="/login?next=/fifa/play" className="mt-4">
              Log in & play
            </SketchButton>
          )}
        </SketchCard>
      </div>

      <div className="text-center">
        <SketchButton to="/fifa/leaderboard" variant="ghost">
          View the leaderboard →
        </SketchButton>
      </div>
    </div>
  );
}
