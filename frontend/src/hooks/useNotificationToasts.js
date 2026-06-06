import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { notificationsAPI } from "@/api";
import { useAuthStore } from "@/store/auth";

export function useNotificationToasts() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const seenIds = useRef(new Set());
  const initialized = useRef(false);

  const { data } = useQuery({
    queryKey: ["notifications", "recent"],
    queryFn: () => notificationsAPI.getAll({ limit: 10 }),
    enabled: isAuthenticated,
    refetchInterval: 60000,
  });

  useEffect(() => {
    if (!isAuthenticated) {
      seenIds.current.clear();
      initialized.current = false;
      return;
    }

    const notifications = data?.data?.notifications || [];
    if (!notifications.length) return;

    for (const notification of notifications) {
      const id = notification._id;
      if (!id || seenIds.current.has(id)) continue;

      seenIds.current.add(id);

      if (initialized.current && !notification.isRead) {
        toast.info(notification.title, {
          description: notification.body || undefined,
          duration: 5000,
        });
      }
    }

    initialized.current = true;
  }, [data, isAuthenticated]);
}
