import { useQuery } from "@tanstack/react-query";
import { usersAPI, donationsAPI } from "@/api";
import {
  Users,
  UserCheck,
  Clock,
  Banknote,
  LayoutDashboard,
  Calendar,
  Image as ImageIcon,
  BarChart,
  Settings,
} from "lucide-react";
import { formatCurrency } from "@/utils/format";
import { SketchCard } from "@/components/SketchCard";

export default function AdminDashboard() {
  const { data: userStats } = useQuery({
    queryKey: ["admin-user-stats"],
    queryFn: () => usersAPI.getUserStats(),
  });

  const { data: donationStats } = useQuery({
    queryKey: ["admin-donation-stats"],
    queryFn: () => donationsAPI.getStats(),
  });

  const { data: unverifiedUsers } = useQuery({
    queryKey: ["unverified-users"],
    queryFn: () => usersAPI.getUnverifiedUsers({ limit: 5 }),
  });

  const quickStats = [
    {
      label: "Total alumni",
      value: userStats?.data?.stats?.totalUsers || 0,
      icon: <Users size={26} strokeWidth={2.5} />,
    },
    {
      label: "Verified",
      value: userStats?.data?.stats?.verifiedUsers || 0,
      icon: <UserCheck size={26} strokeWidth={2.5} />,
    },
    {
      label: "Pending",
      value: userStats?.data?.stats?.unverifiedUsers || 0,
      icon: <Clock size={26} strokeWidth={2.5} />,
    },
    {
      label: "Donations",
      value: formatCurrency(donationStats?.data?.stats?.totalRaised || 0),
      icon: <Banknote size={26} strokeWidth={2.5} />,
    },
  ];

  return (
    <div className="min-h-screen py-16 md:py-24">
      <div className="container-custom max-w-7xl">
        <div className="mb-14">
          <p className="inline-block rotate-1 rounded-wobblySm border-2 border-border bg-white px-3 py-1 font-sans text-lg shadow-sketchSm">
            Moderators only
          </p>
          <h1 className="mt-4 flex flex-wrap items-center gap-4 font-display text-5xl font-bold md:text-6xl">
            <LayoutDashboard size={40} strokeWidth={2.5} aria-hidden />
            Admin panel
          </h1>
          <div className="mt-4 h-1 max-w-sm border-b-4 border-dashed border-foreground" />
          <p className="mt-6 max-w-2xl font-sans text-xl text-muted-foreground">
            Keep the alumni scrapbook organized—without sanding off the
            personality.
          </p>
        </div>

        <div className="grid gap-12 lg:grid-cols-12">
          <div className="space-y-12 lg:col-span-8">
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {quickStats.map((stat, index) => (
                <SketchCard
                  key={stat.label}
                  tilt
                  className={`p-5 md:p-6 ${index % 2 === 1 ? "md:translate-y-2" : ""}`}
                  decoration={index === 0 ? "tack" : "none"}
                >
                  <div className="text-foreground">{stat.icon}</div>
                  <div className="mt-4 font-display text-2xl font-bold leading-none text-foreground md:text-3xl">
                    {stat.value}
                  </div>
                  <div className="mt-2 font-sans text-sm text-muted-foreground md:text-base">
                    {stat.label}
                  </div>
                </SketchCard>
              ))}
            </div>

            {unverifiedUsers?.data?.users &&
              unverifiedUsers.data.users.length > 0 && (
                <SketchCard decoration="tape" tilt className="p-0">
                  <div className="flex flex-col gap-4 border-b-[3px] border-dashed border-border p-6 sm:flex-row sm:items-center sm:justify-between md:p-8">
                    <h2 className="font-display text-2xl font-bold md:text-3xl">
                      Pending verifications
                    </h2>
                    <span className="w-fit rounded-wobblySm border-2 border-border bg-postit px-3 py-1 font-sans text-sm font-bold shadow-sketchSm">
                      {unverifiedUsers.pagination.total} waiting
                    </span>
                  </div>

                  <div className="divide-y-2 divide-dashed divide-border">
                    {unverifiedUsers.data.users.map((user) => (
                      <div
                        key={user._id}
                        className="flex flex-col gap-6 p-6 md:flex-row md:items-center md:justify-between md:p-8"
                      >
                        <div className="flex items-center gap-4">
                          <img
                            src={
                              user.avatar ||
                              `https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}&background=e5e0d8&color=2d2d2d`
                            }
                            alt=""
                            className="h-16 w-16 border-[3px] border-border object-cover shadow-sketchSm"
                            style={{
                              borderRadius:
                                "255px 15px 225px 15px / 15px 225px 15px 255px",
                            }}
                          />
                          <div>
                            <p className="font-display text-xl font-bold">
                              {user.firstName} {user.lastName}
                            </p>
                            <p className="font-sans text-sm text-muted-foreground md:text-base">
                              {user.email} · Batch {user.batch?.year}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          className="btn-primary w-full shrink-0 md:w-auto"
                        >
                          Verify
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="border-t-2 border-dashed border-border bg-muted p-4 text-center">
                    <button
                      type="button"
                      className="font-sans text-lg font-bold text-pen underline decoration-wavy decoration-2"
                    >
                      View all pending →
                    </button>
                  </div>
                </SketchCard>
              )}
          </div>

          <div className="space-y-4 lg:col-span-4">
            <h3 className="font-display text-xl font-bold text-muted-foreground">
              Modules
            </h3>
            {[
              {
                title: "Users",
                description: "Accounts & roles",
                icon: <Users size={24} strokeWidth={2.5} />,
                link: "#",
              },
              {
                title: "Events",
                description: "Create & edit",
                icon: <Calendar size={24} strokeWidth={2.5} />,
                link: "#",
              },
              {
                title: "Moderation",
                description: "Approve posts",
                icon: <ImageIcon size={24} strokeWidth={2.5} />,
                link: "#",
              },
              {
                title: "Analytics",
                description: "Trends & exports",
                icon: <BarChart size={24} strokeWidth={2.5} />,
                link: "#",
              },
              {
                title: "Settings",
                description: "Platform config",
                icon: <Settings size={24} strokeWidth={2.5} />,
                link: "#",
              },
            ].map((item) => (
              <a
                href={item.link}
                key={item.title}
                className="flex items-center gap-4 rounded-wobblyMd border-[3px] border-border bg-white p-5 shadow-sketchSm transition-transform duration-100 hover:-rotate-1 hover:shadow-sketch focus-ring"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-wobblySm border-2 border-border bg-muted">
                  {item.icon}
                </span>
                <div>
                  <h3 className="font-display text-xl font-bold underline decoration-dashed decoration-2 underline-offset-4">
                    {item.title}
                  </h3>
                  <p className="font-sans text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
