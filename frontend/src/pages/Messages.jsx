import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { MessageCircle } from "lucide-react";
import { messagesAPI } from "@/api";
import LoadingSpinner from "@/components/LoadingSpinner";
import { formatTimeAgo } from "@/utils/format";
import { useAuthStore } from "@/store/auth";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Messages() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const startUserId = searchParams.get("user");
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const startedRef = useRef(false);

  const { data, isLoading } = useQuery({
    queryKey: ["conversations"],
    queryFn: () => messagesAPI.getConversations(),
  });

  const startMutation = useMutation({
    mutationFn: (userId) => messagesAPI.startConversation(userId),
    onSuccess: (response) => {
      queryClient.invalidateQueries(["conversations"]);
      const conv = response?.data?.conversation;
      if (conv?._id) {
        navigate(`/messages/${conv._id}`, { replace: true });
      }
    },
  });

  useEffect(() => {
    if (startUserId && !startedRef.current) {
      startedRef.current = true;
      startMutation.mutate(startUserId);
      setSearchParams({}, { replace: true });
    }
  }, [startUserId, setSearchParams, startMutation]);

  const conversations = data?.data?.conversations || [];

  const getOtherParticipant = (participants) =>
    participants?.find((p) => p._id !== user?._id) || participants?.[0];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Messages</h1>
        <p className="text-sm text-muted-foreground">
          Conversations with fellow alumni.
        </p>
      </div>

      {isLoading && <LoadingSpinner />}

      {!isLoading && conversations.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center py-12 text-center">
            <MessageCircle className="mb-4 h-12 w-12 text-muted-foreground" />
            <CardTitle className="text-lg">No conversations yet</CardTitle>
            <CardDescription className="mt-2">
              Start a chat from an alumni profile.
            </CardDescription>
            <Button asChild className="mt-6">
              <Link to="/dashboard/directory">Browse directory</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="space-y-2">
        {conversations.map((conv) => {
          const other = getOtherParticipant(conv.participants);
          const initials = other
            ? `${other.firstName?.[0] || ""}${other.lastName?.[0] || ""}`.toUpperCase()
            : "?";

          return (
            <Link key={conv._id} to={`/messages/${conv._id}`} className="block">
              <Card className="transition-colors hover:bg-muted/50">
                <CardContent className="flex items-center gap-4 p-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={other?.avatar} alt="" />
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">
                      {other?.firstName} {other?.lastName}
                    </p>
                    <p className="truncate text-sm text-muted-foreground">
                      {conv.lastMessage || "No messages yet"}
                    </p>
                  </div>
                  {conv.lastMessageAt && (
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {formatTimeAgo(conv.lastMessageAt)}
                    </span>
                  )}
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
