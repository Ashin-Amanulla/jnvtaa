import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { mentorshipAPI } from "@/api";
import LoadingSpinner from "@/components/LoadingSpinner";
import { formatTimeAgo } from "@/utils/format";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const STATUS_VARIANT = {
  pending: "secondary",
  accepted: "default",
  declined: "destructive",
  completed: "outline",
};

export default function MyMentorship() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["mentorship", "requests"],
    queryFn: () => mentorshipAPI.getMyRequests(),
  });

  const respondMutation = useMutation({
    mutationFn: ({ id, status }) =>
      mentorshipAPI.respondToRequest(id, { status }),
    onSuccess: () => queryClient.invalidateQueries(["mentorship", "requests"]),
  });

  const asMentee = data?.data?.asMentee || [];
  const asMentor = data?.data?.asMentor || [];

  const RequestCard = ({ request, role }) => {
    const person = role === "mentor" ? request.mentee : request.mentor;
    return (
      <Card>
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
          <div>
            <CardDescription className="text-xs uppercase tracking-wide">
              {role === "mentor" ? "From mentee" : "To mentor"}
            </CardDescription>
            <CardTitle className="text-base">
              {person?.firstName} {person?.lastName}
            </CardTitle>
          </div>
          <Badge variant={STATUS_VARIANT[request.status] || "secondary"} className="capitalize">
            {request.status}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">{request.message}</p>
          <p className="text-xs text-muted-foreground">
            {formatTimeAgo(request.createdAt)}
          </p>
          {role === "mentor" && request.status === "pending" && (
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() =>
                  respondMutation.mutate({ id: request._id, status: "accepted" })
                }
                disabled={respondMutation.isPending}
              >
                Accept
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  respondMutation.mutate({ id: request._id, status: "declined" })
                }
                disabled={respondMutation.isPending}
              >
                Decline
              </Button>
            </div>
          )}
          {role === "mentor" && request.status === "accepted" && (
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                respondMutation.mutate({ id: request._id, status: "completed" })
              }
              disabled={respondMutation.isPending}
            >
              Mark completed
            </Button>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">My mentorship</h1>
          <p className="text-sm text-muted-foreground">
            Requests you&apos;ve sent and received as a mentor.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link to="/mentorship/become">Become a mentor</Link>
        </Button>
      </div>

      {isLoading && <LoadingSpinner />}

      {!isLoading && (
        <div className="space-y-8">
          <section className="space-y-4">
            <h2 className="text-lg font-semibold">Requests I sent</h2>
            {asMentee.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No mentorship requests yet.{" "}
                <Link to="/mentorship" className="text-primary underline">
                  Browse mentors
                </Link>
              </p>
            ) : (
              asMentee.map((req) => (
                <RequestCard key={req._id} request={req} role="mentee" />
              ))
            )}
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-semibold">Requests as mentor</h2>
            {asMentor.length === 0 ? (
              <p className="text-sm text-muted-foreground">No incoming requests yet.</p>
            ) : (
              asMentor.map((req) => (
                <RequestCard key={req._id} request={req} role="mentor" />
              ))
            )}
          </section>
        </div>
      )}
    </div>
  );
}
