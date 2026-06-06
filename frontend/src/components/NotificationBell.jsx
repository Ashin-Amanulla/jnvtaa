import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bell } from "lucide-react";
import { notificationsAPI } from "@/api";
import { useAuthStore } from "@/store/auth";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { formatTimeAgo } from "@/utils/format";
import { cn } from "@/utils/cn";

export default function NotificationBell() {
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const { data: countData } = useQuery({
    queryKey: ["notifications", "unread"],
    queryFn: () => notificationsAPI.getUnreadCount(),
    enabled: isAuthenticated,
    refetchInterval: isAuthenticated ? 60000 : false,
  });

  const { data: listData, isLoading } = useQuery({
    queryKey: ["notifications", "recent"],
    queryFn: () => notificationsAPI.getAll({ limit: 8 }),
    enabled: isAuthenticated,
  });

  const markReadMutation = useMutation({
    mutationFn: (id) => notificationsAPI.markRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["notifications"]);
    },
  });

  const unreadCount = countData?.data?.count || 0;
  const notifications = listData?.data?.notifications || [];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="relative inline-flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-white shadow-card focus-ring "
          aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ""}`}
        >
          <Bell size={20} strokeWidth={2.5} />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full border border-border bg-accent px-1 font-sans text-xs font-bold text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-80 rounded-xl border border-border bg-white p-0 shadow-card"
      >
        <div className="border-b border-border px-4 py-3">
          <h3 className="font-display text-lg font-bold">Notifications</h3>
        </div>
        <div className="max-h-80 overflow-y-auto">
          {isLoading && (
            <p className="p-4 font-sans text-sm text-muted-foreground">Loading…</p>
          )}
          {!isLoading && notifications.length === 0 && (
            <p className="p-4 font-sans text-sm text-muted-foreground">
              No notifications yet.
            </p>
          )}
          {notifications.map((n) => (
            <Link
              key={n._id}
              to={n.link || "/notifications"}
              onClick={() => !n.isRead && markReadMutation.mutate(n._id)}
              className={cn(
                "block border-b border-border px-4 py-3 font-sans text-sm hover:bg-muted/50 focus-ring",
                !n.isRead && "bg-house-yellow-soft"
              )}
            >
              <p className="font-medium">{n.title}</p>
              {n.body && (
                <p className="mt-0.5 line-clamp-2 text-muted-foreground">{n.body}</p>
              )}
              <p className="mt-1 text-xs text-muted-foreground">
                {formatTimeAgo(n.createdAt)}
              </p>
            </Link>
          ))}
        </div>
        <div className="border-t border-border p-2">
          <Link
            to="/notifications"
            className="block rounded-xl px-3 py-2 text-center font-sans text-sm text-brand font-medium"
          >
            View all
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}
