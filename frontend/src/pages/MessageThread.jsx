import { useState, useRef, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Send } from "lucide-react";
import { messagesAPI } from "@/api";
import { useAuthStore } from "@/store/auth";
import LoadingSpinner from "@/components/LoadingSpinner";
import { formatTimeAgo } from "@/utils/format";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export default function MessageThread() {
  const { conversationId } = useParams();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [body, setBody] = useState("");
  const bottomRef = useRef(null);

  const { data: convData } = useQuery({
    queryKey: ["conversations"],
    queryFn: () => messagesAPI.getConversations(),
  });

  const { data, isLoading } = useQuery({
    queryKey: ["messages", conversationId],
    queryFn: () => messagesAPI.getMessages(conversationId),
  });

  const sendMutation = useMutation({
    mutationFn: (text) => messagesAPI.sendMessage(conversationId, text),
    onSuccess: () => {
      setBody("");
      queryClient.invalidateQueries(["messages", conversationId]);
      queryClient.invalidateQueries(["conversations"]);
    },
  });

  const messages = data?.data?.messages || [];
  const conversations = convData?.data?.conversations || [];
  const conversation = conversations.find((c) => c._id === conversationId);
  const other = conversation?.participants?.find((p) => p._id !== user?._id);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!body.trim()) return;
    sendMutation.mutate(body.trim());
  };

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/messages">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Inbox
          </Link>
        </Button>
        {other && (
          <h1 className="text-lg font-semibold">
            {other.firstName} {other.lastName}
          </h1>
        )}
      </div>

      <Card className="flex min-h-[420px] flex-col">
        <CardContent className="flex flex-1 flex-col p-4">
          {isLoading ? (
            <LoadingSpinner />
          ) : (
            <div className="flex-1 space-y-3 overflow-y-auto pb-4">
              {messages.length === 0 && (
                <p className="text-center text-sm text-muted-foreground">
                  Say hello — first message sets the tone.
                </p>
              )}
              {messages.map((msg) => {
                const isMine = msg.sender?._id === user?._id;
                return (
                  <div
                    key={msg._id}
                    className={cn("flex", isMine ? "justify-end" : "justify-start")}
                  >
                    <div
                      className={cn(
                        "max-w-[85%] rounded-lg px-3 py-2 text-sm",
                        isMine
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-foreground",
                      )}
                    >
                      <p>{msg.body}</p>
                      <p
                        className={cn(
                          "mt-1 text-xs",
                          isMine ? "text-primary-foreground/70" : "text-muted-foreground",
                        )}
                      >
                        {formatTimeAgo(msg.createdAt)}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-auto flex gap-2 border-t pt-4">
            <Input
              type="text"
              placeholder="Type a message…"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="flex-1"
            />
            <Button
              type="submit"
              disabled={sendMutation.isPending || !body.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
