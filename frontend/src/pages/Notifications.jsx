import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Bell, CheckCheck } from "lucide-react";
import { notificationsAPI } from "@/api";
import LoadingSpinner from "@/components/LoadingSpinner";
import { formatTimeAgo } from "@/utils/format";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Notifications() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => notificationsAPI.getAll({ limit: 50 }),
  });

  const markAllMutation = useMutation({
    mutationFn: () => notificationsAPI.markAllRead(),
    onSuccess: () => {
      queryClient.invalidateQueries(["notifications"]);
      queryClient.invalidateQueries(["notifications", "unread"]);
    },
  });

  const markReadMutation = useMutation({
    mutationFn: (id) => notificationsAPI.markRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["notifications"]);
      queryClient.invalidateQueries(["notifications", "unread"]);
    },
  });

  const notifications = data?.data?.notifications || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Notifications</h1>
          <p className="text-sm text-muted-foreground">
            Updates and alerts from JNVTAA.
          </p>
        </div>
        {notifications.some((n) => !n.isRead) && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => markAllMutation.mutate()}
            disabled={markAllMutation.isPending}
          >
            <CheckCheck className="mr-2 h-4 w-4" />
            Mark all read
          </Button>
        )}
      </div>

      {isLoading && <LoadingSpinner />}

      {!isLoading && notifications.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center py-12 text-center">
            <Bell className="mb-4 h-12 w-12 text-muted-foreground" />
            <CardTitle className="text-lg">All quiet</CardTitle>
            <CardDescription className="mt-2">
              No notifications yet — we&apos;ll nudge you when something happens.
            </CardDescription>
          </CardContent>
        </Card>
      )}

      <div className="space-y-2">
        {notifications.map((n) => {
          const content = (
            <Card className={!n.isRead ? "border-primary/50 bg-primary/5" : ""}>
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div>
                  <CardTitle className="text-base">{n.title}</CardTitle>
                  {n.body && <CardDescription className="mt-1">{n.body}</CardDescription>}
                </div>
                {!n.isRead && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="shrink-0 text-xs"
                    onClick={(e) => {
                      e.preventDefault();
                      markReadMutation.mutate(n._id);
                    }}
                  >
                    Mark read
                  </Button>
                )}
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-xs text-muted-foreground">{formatTimeAgo(n.createdAt)}</p>
              </CardContent>
            </Card>
          );

          return n.link ? (
            <Link
              key={n._id}
              to={n.link}
              onClick={() => !n.isRead && markReadMutation.mutate(n._id)}
              className="block"
            >
              {content}
            </Link>
          ) : (
            <div key={n._id}>{content}</div>
          );
        })}
      </div>
    </div>
  );
}
