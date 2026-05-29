import { useQuery } from "@tanstack/react-query";
import {
  Users,
  UserCheck,
  Clock,
  Banknote,
  Inbox,
} from "lucide-react";
import { adminUsersAPI, adminDonationsAPI, adminContactAPI } from "@/api/admin";
import { formatCurrency } from "@/utils/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Dashboard() {
  const { data: userStats, isLoading: statsLoading } = useQuery({
    queryKey: ["admin", "user-stats"],
    queryFn: () => adminUsersAPI.getStats(),
  });

  const { data: donationStats } = useQuery({
    queryKey: ["admin", "donation-stats"],
    queryFn: () => adminDonationsAPI.getStats(),
  });

  const { data: contactData } = useQuery({
    queryKey: ["admin", "contact-count"],
    queryFn: () => adminContactAPI.getAll({ status: "new", limit: 1 }),
  });

  const stats = userStats?.data?.stats;
  const donations = donationStats?.data?.stats;
  const newMessages = contactData?.pagination?.total ?? 0;

  const kpis = [
    {
      label: "Total alumni",
      value: statsLoading ? "—" : stats?.totalUsers ?? 0,
      icon: Users,
    },
    {
      label: "Verified",
      value: stats?.verifiedUsers ?? 0,
      icon: UserCheck,
    },
    {
      label: "Pending verification",
      value: stats?.unverifiedUsers ?? 0,
      icon: Clock,
    },
    {
      label: "Total raised",
      value: formatCurrency(donations?.totalRaised ?? 0),
      icon: Banknote,
    },
    {
      label: "New contact messages",
      value: newMessages,
      icon: Inbox,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Overview of platform activity and key metrics.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {kpis.map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {label}
              </CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {stats?.usersByBatch?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top batches by members</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {stats.usersByBatch.slice(0, 5).map((item) => (
                <li
                  key={item._id || "unknown"}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-muted-foreground">Batch {item._id || "N/A"}</span>
                  <span className="font-medium">{item.count} members</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
