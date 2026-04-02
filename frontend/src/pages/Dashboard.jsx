import { useAuthStore } from "@/store/auth";
import { Link } from "react-router-dom";
import {
  User,
  Calendar,
  Briefcase,
  Heart,
  Settings,
  LayoutDashboard,
} from "lucide-react";
import { SketchCard } from "@/components/SketchCard";
import { SketchIconCircle } from "@/components/SketchIconCircle";

export default function Dashboard() {
  const { user } = useAuthStore();

  const quickLinks = [
    {
      title: "My profile",
      description: "Update your cork-board card",
      icon: <User size={24} strokeWidth={2.5} />,
      link: "/dashboard/profile",
    },
    {
      title: "My events",
      description: "Registrations & reminders",
      icon: <Calendar size={24} strokeWidth={2.5} />,
      link: "/events",
    },
    {
      title: "Jobs board",
      description: "Opportunities from alumni",
      icon: <Briefcase size={24} strokeWidth={2.5} />,
      link: "/jobs",
    },
    {
      title: "Donations",
      description: "Your giving history",
      icon: <Heart size={24} strokeWidth={2.5} />,
      link: "/donate",
    },
  ];

  return (
    <div className="min-h-[80vh] py-16 md:py-24">
      <div className="container-custom max-w-6xl">
        <div className="mb-14">
          <p className="inline-block rotate-[-1deg] rounded-wobblySm border-2 border-dashed border-border bg-postit px-3 py-1 font-sans text-lg">
            Member desk
          </p>
          <h1 className="mt-4 font-display text-5xl font-bold md:text-6xl">
            Hi {user?.firstName || "there"}
          </h1>
          <div className="mt-4 h-1 max-w-sm border-b-4 border-dashed border-foreground" />
          <p className="mt-6 max-w-2xl font-sans text-xl text-muted-foreground">
            Your alumni HQ—profile, events, jobs, and the occasional guilt trip
            to complete your bio.
          </p>
        </div>

        {user && user.profileCompleteness < 100 && (
          <SketchCard
            decoration="tack"
            tilt
            className="mb-14 border-[3px] border-pen bg-white p-8 md:p-10"
          >
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="font-display text-3xl font-bold text-foreground">
                  Finish your profile?
                </h2>
                <p className="mt-2 font-sans text-lg text-muted-foreground">
                  You&apos;re at {user.profileCompleteness}%—add a line about
                  your work so batchmates can find you.
                </p>
              </div>
              <Link
                to="/dashboard/profile"
                className="btn-secondary shrink-0 focus-ring"
              >
                Complete profile →
              </Link>
            </div>
            <div className="mt-6 h-4 w-full border-2 border-border bg-muted">
              <div
                className="h-full bg-accent transition-all"
                style={{ width: `${user.profileCompleteness}%` }}
              />
            </div>
          </SketchCard>
        )}

        <div className="grid gap-12 lg:grid-cols-12">
          <div className="space-y-10 lg:col-span-8">
            <div className="grid gap-6 md:grid-cols-2">
              {quickLinks.map((item) => (
                <Link
                  key={item.title}
                  to={item.link}
                  className="block focus-ring rounded-wobblyMd"
                >
                  <SketchCard tilt className="h-full p-6" decoration="tape">
                    <div className="flex items-start gap-4">
                      <SketchIconCircle className="shrink-0">
                        {item.icon}
                      </SketchIconCircle>
                      <div>
                        <h3 className="font-display text-xl font-bold underline decoration-dashed decoration-2 underline-offset-4">
                          {item.title}
                        </h3>
                        <p className="mt-2 font-sans text-lg text-muted-foreground">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </SketchCard>
                </Link>
              ))}
            </div>

            <div>
              <h2 className="mb-6 flex items-center gap-3 font-display text-3xl font-bold">
                <LayoutDashboard size={28} strokeWidth={2.5} />
                Next scribbles
              </h2>
              <div className="space-y-4">
                {[
                  ["Update professional info", "/dashboard/profile"],
                  ["Browse upcoming events", "/events"],
                  ["Find batchmates", "/directory"],
                ].map(([label, href]) => (
                  <Link
                    key={label}
                    to={href}
                    className="flex items-center justify-between rounded-wobblySm border-[3px] border-border bg-white px-5 py-4 font-sans text-lg shadow-sketchSm transition-transform duration-100 hover:-rotate-1 focus-ring"
                  >
                    <span>{label}</span>
                    <span className="text-pen underline decoration-wavy">Go →</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6 lg:col-span-4">
            <SketchCard postit tilt className="p-8">
              <h3 className="font-sans text-sm font-bold uppercase tracking-wide text-muted-foreground">
                Batch
              </h3>
              <p className="mt-2 font-display text-4xl font-bold">
                {user?.batch?.year || "—"}
              </p>
              <h3 className="mt-6 font-sans text-sm font-bold uppercase tracking-wide text-muted-foreground">
                City
              </h3>
              <p className="mt-2 font-display text-3xl font-bold">
                {user?.currentCity || "—"}
              </p>
              <h3 className="mt-6 font-sans text-sm font-bold uppercase tracking-wide text-muted-foreground">
                Member since
              </h3>
              <p className="mt-2 font-display text-2xl font-bold">
                {user?.createdAt
                  ? new Date(user.createdAt).getFullYear()
                  : "—"}
              </p>
            </SketchCard>

            <Link
              to="/dashboard/profile"
              className="flex items-center justify-between rounded-wobblySm border-2 border-dashed border-border bg-white px-5 py-4 font-sans text-lg shadow-sketchSm focus-ring hover:border-solid"
            >
              <span className="flex items-center gap-3">
                <Settings size={22} strokeWidth={2.5} />
                Settings (coming soon)
              </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
