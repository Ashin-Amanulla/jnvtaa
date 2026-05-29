import { Link } from "react-router-dom";
import {
  User,
  Calendar,
  Briefcase,
  Heart,
  Handshake,
  MessageCircle,
  Bell,
  Users,
  ArrowRight,
} from "lucide-react";
import { useAuthStore } from "@/store/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const quickLinks = [
  {
    title: "My profile",
    description: "Update your alumni profile",
    icon: User,
    link: "/dashboard/profile",
  },
  {
    title: "Applications",
    description: "Jobs you have applied for",
    icon: Briefcase,
    link: "/dashboard/applications",
  },
  {
    title: "Donations",
    description: "Your giving history & receipts",
    icon: Heart,
    link: "/dashboard/donations",
  },
  {
    title: "Mentorship",
    description: "Your mentor connections",
    icon: Handshake,
    link: "/dashboard/mentorship",
  },
  {
    title: "Messages",
    description: "Conversations with alumni",
    icon: MessageCircle,
    link: "/messages",
  },
  {
    title: "Notifications",
    description: "Updates and alerts",
    icon: Bell,
    link: "/notifications",
  },
];

export default function Dashboard() {
  const { user } = useAuthStore();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Hi {user?.firstName || "there"}
        </h1>
        <p className="text-sm text-muted-foreground">
          Your JNVTAA member hub — profile, events, jobs, and ways to stay connected.
        </p>
      </div>

      {user && user.profileCompleteness < 100 && (
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Complete your profile</CardTitle>
            <CardDescription>
              You&apos;re at {user.profileCompleteness}% — add professional details so fellow
              Navodayans can find you.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${user.profileCompleteness}%` }}
              />
            </div>
            <Button asChild size="sm">
              <Link to="/dashboard/profile">Complete profile</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Batch</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{user?.batch?.year || "—"}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">City</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{user?.currentCity || "—"}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Member since</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {user?.createdAt ? new Date(user.createdAt).getFullYear() : "—"}
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="mb-4 text-lg font-semibold">Quick links</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {quickLinks.map(({ title, description, icon: Icon, link }) => (
            <Link key={title} to={link} className="group">
              <Card className="h-full transition-colors hover:bg-muted/50">
                <CardHeader className="flex flex-row items-start gap-3 space-y-0 pb-2">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <CardTitle className="text-base">{title}</CardTitle>
                    <CardDescription className="mt-1">{description}</CardDescription>
                  </div>
                  <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Next steps</CardTitle>
          <CardDescription>Suggested actions to stay connected</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {[
            ["Update professional info", "/dashboard/profile"],
            ["Browse upcoming events", "/events"],
            ["Find fellow alumni", "/directory"],
          ].map(([label, href]) => (
            <Link
              key={label}
              to={href}
              className="flex items-center justify-between rounded-md border px-4 py-3 text-sm transition-colors hover:bg-muted"
            >
              <span>{label}</span>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </Link>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
