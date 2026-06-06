import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  Users,
  UserCheck,
  Clock,
  Banknote,
  Inbox,
  ArrowRight,
  Calendar,
  MapPin,
  Sun,
  Moon,
  Sunrise,
  RefreshCw,
} from "lucide-react";
import { adminUsersAPI, adminDonationsAPI, adminContactAPI } from "@/api/admin";
import { QUERY_KEYS, STALE_TIME } from "@/api/queryKeys";
import { useAuthStore } from "@/store/auth";
import { formatCurrency, formatBatchOf } from "@/utils/format";
import {
  hasPermission,
  formatRoleLabel,
  PERMISSIONS,
} from "@/utils/roles";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

function getGreeting(hour) {
  if (hour < 12) return { text: "Good morning", Icon: Sunrise };
  if (hour < 17) return { text: "Good afternoon", Icon: Sun };
  return { text: "Good evening", Icon: Moon };
}

function LiveClock() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const hour = now.getHours();
  const { text, Icon } = getGreeting(hour);

  return (
    <div className="rounded-xl border bg-background/80 px-4 py-3 text-right backdrop-blur-sm">
      <div className="flex items-center justify-end gap-2 text-sm font-medium text-muted-foreground">
        <Icon className="h-4 w-4 text-primary" aria-hidden />
        {text}
      </div>
      <p className="mt-1 font-mono text-2xl font-semibold tabular-nums tracking-tight">
        {format(now, "h:mm:ss a")}
      </p>
      <p className="text-xs text-muted-foreground">
        {format(now, "EEEE, MMMM d, yyyy")}
      </p>
    </div>
  );
}

function StatWidget({ label, value, icon: Icon, href, permission, user, accent, isLoading }) {
  if (permission && !hasPermission(user, permission)) return null;

  const content = (
    <>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {label}
        </CardTitle>
        <div
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-lg",
            accent
          )}
        >
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{isLoading ? "—" : value}</div>
        {href && (
          <p className="mt-2 flex items-center gap-1 text-xs font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
            View details
            <ArrowRight className="h-3 w-3" />
          </p>
        )}
      </CardContent>
    </>
  );

  if (!href) {
    return <Card>{content}</Card>;
  }

  return (
    <Link to={href} className="group block outline-none">
      <Card className="h-full transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring">
        {content}
      </Card>
    </Link>
  );
}

export default function Dashboard() {
  const { user } = useAuthStore();

  const {
    data: userStats,
    isLoading: statsLoading,
    refetch: refetchUserStats,
    isFetching: userStatsFetching,
  } = useQuery({
    queryKey: QUERY_KEYS.userStats,
    queryFn: () => adminUsersAPI.getStats(),
    staleTime: STALE_TIME.USER_STATS,
  });

  const { data: donationStats, refetch: refetchDonations } = useQuery({
    queryKey: ["admin", "donation-stats"],
    queryFn: () => adminDonationsAPI.getStats(),
    staleTime: STALE_TIME.USER_STATS,
  });

  const { data: contactData, refetch: refetchContact } = useQuery({
    queryKey: ["admin", "contact-count"],
    queryFn: () => adminContactAPI.getAll({ status: "new", limit: 1 }),
    staleTime: STALE_TIME.DEFAULT,
  });

  const stats = userStats?.data?.stats;
  const donations = donationStats?.data?.stats;
  const newMessages = contactData?.pagination?.total ?? 0;

  const topBatches = stats?.usersByBatch?.slice(0, 5) ?? [];
  const maxBatchCount = topBatches[0]?.count ?? 1;
  const topLocations = stats?.usersByLocation?.slice(0, 5) ?? [];

  const kpis = useMemo(
    () => [
      {
        label: "Total alumni",
        value: stats?.totalUsers ?? 0,
        icon: Users,
        href: "/admin/users",
        permission: PERMISSIONS.USERS_READ,
        accent: "bg-blue-100 text-blue-700",
      },
      {
        label: "Verified",
        value: stats?.verifiedUsers ?? 0,
        icon: UserCheck,
        href: "/admin/users",
        permission: PERMISSIONS.USERS_READ,
        accent: "bg-emerald-100 text-emerald-700",
      },
      {
        label: "Pending verification",
        value: stats?.unverifiedUsers ?? 0,
        icon: Clock,
        href: "/admin/users",
        permission: PERMISSIONS.USERS_READ,
        accent: "bg-amber-100 text-amber-700",
      },
      {
        label: "Total raised",
        value: formatCurrency(donations?.totalRaised ?? 0),
        icon: Banknote,
        href: "/admin/donations",
        permission: PERMISSIONS.DONATIONS_MANAGE,
        accent: "bg-violet-100 text-violet-700",
      },
      {
        label: "New contact messages",
        value: newMessages,
        icon: Inbox,
        href: "/admin/contact",
        permission: PERMISSIONS.CONTACT_MANAGE,
        accent: "bg-rose-100 text-rose-700",
      },
    ],
    [stats, donations, newMessages]
  );

  const quickActions = useMemo(
    () =>
      [
        {
          label: "Review pending alumni",
          description: `${stats?.unverifiedUsers ?? 0} awaiting verification`,
          href: "/admin/users",
          permission: PERMISSIONS.USERS_READ,
          show: (stats?.unverifiedUsers ?? 0) > 0,
        },
        {
          label: "Open contact inbox",
          description: `${newMessages} new message${newMessages === 1 ? "" : "s"}`,
          href: "/admin/contact",
          permission: PERMISSIONS.CONTACT_MANAGE,
          show: newMessages > 0,
        },
        {
          label: "Browse directory",
          description: "Search and filter alumni",
          href: "/admin/directory",
          permission: PERMISSIONS.USERS_READ,
          show: true,
        },
        {
          label: "Manage events",
          description: "Upcoming reunions & gatherings",
          href: "/admin/events",
          permission: PERMISSIONS.EVENTS_MANAGE,
          show: true,
        },
      ].filter(
        (action) =>
          action.show && hasPermission(user, action.permission)
      ),
    [stats, newMessages, user]
  );

  const handleRefresh = () => {
    refetchUserStats();
    refetchDonations();
    refetchContact();
  };

  const isRefreshing = userStatsFetching;

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-primary/15 bg-gradient-to-br from-primary/5 via-background to-background">
        <CardContent className="p-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
                Welcome back, {user?.firstName || "Admin"}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="capitalize">
                  {formatRoleLabel(user?.role)}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {user?.email}
                </span>
              </div>
            </div>

            <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="shrink-0"
              >
                <RefreshCw
                  className={cn("mr-2 h-4 w-4", isRefreshing && "animate-spin")}
                />
                Refresh stats
              </Button>
              <LiveClock />
            </div>
          </div>
        </CardContent>
      </Card>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Platform overview</h2>
          <p className="text-sm text-muted-foreground">
            Click a card to jump to that section
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {kpis.map((kpi) => (
            <StatWidget
              key={kpi.label}
              {...kpi}
              user={user}
              isLoading={statsLoading && kpi.label === "Total alumni"}
            />
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {topBatches.length > 0 && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Top batches by members</CardTitle>
              {hasPermission(user, PERMISSIONS.BATCHES_MANAGE) && (
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/admin/batches">
                    All batches
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              )}
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {topBatches.map((item, index) => {
                  const label =
                    formatBatchOf(item.batch) ||
                    item.batch?.name ||
                    "Unknown batch";
                  const pct = Math.round((item.count / maxBatchCount) * 100);

                  return (
                    <li key={item.batch?._id || label}>
                      <div className="mb-1.5 flex items-center justify-between text-sm">
                        <span className="font-medium">{label}</span>
                        <span className="tabular-nums text-muted-foreground">
                          {item.count} members
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary transition-all duration-700 ease-out"
                          style={{
                            width: `${pct}%`,
                            transitionDelay: `${index * 80}ms`,
                          }}
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>
            </CardContent>
          </Card>
        )}

        <div className="space-y-6">
          {quickActions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Quick actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {quickActions.map((action) => (
                  <Link
                    key={action.href + action.label}
                    to={action.href}
                    className="group flex items-center justify-between rounded-lg border px-4 py-3 transition-colors hover:border-primary/30 hover:bg-muted/50"
                  >
                    <div>
                      <p className="text-sm font-medium">{action.label}</p>
                      <p className="text-xs text-muted-foreground">
                        {action.description}
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                  </Link>
                ))}
              </CardContent>
            </Card>
          )}

          {topLocations.length > 0 && (
            <Card>
              <CardHeader className="flex flex-row items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-base">Top locations</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {topLocations.map((item) => (
                    <li
                      key={item._id}
                      className="flex items-center justify-between rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-muted/60"
                    >
                      <span>{item._id}</span>
                      <Badge variant="outline">{item.count}</Badge>
                    </li>
                  ))}
                </ul>
                {hasPermission(user, PERMISSIONS.USERS_READ) && (
                  <Button variant="link" size="sm" className="mt-3 px-0" asChild>
                    <Link to="/admin/directory">
                      Explore in directory
                      <ArrowRight className="ml-1 h-3 w-3" />
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {hasPermission(user, PERMISSIONS.EVENTS_MANAGE) && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-start justify-between gap-4 p-5 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">Plan your next alumni event</p>
                <p className="text-sm text-muted-foreground">
                  Create reunions, meetups, and association gatherings.
                </p>
              </div>
            </div>
            <Button asChild>
              <Link to="/admin/events">
                Go to Events
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
