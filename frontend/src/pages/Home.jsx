import { Link } from "react-router-dom";
import {
  Users,
  Calendar,
  GraduationCap,
  Globe,
  ArrowRight,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { usersAPI, eventsAPI, newsAPI } from "@/api";
import { QUERY_KEYS, STALE_TIME } from "@/api/queryKeys";
import FeaturedAlumni from "@/components/FeaturedAlumni";
import Testimonials from "@/components/Testimonials";
import StatsCounter from "@/components/StatsCounter";
import { SectionHeading } from "@/components/SectionHeading";
import { SketchCard } from "@/components/SketchCard";
import { SketchIconCircle } from "@/components/SketchIconCircle";

export default function Home() {
  const { data: stats } = useQuery({
    queryKey: QUERY_KEYS.userStats,
    queryFn: () => usersAPI.getUserStats(),
    staleTime: STALE_TIME.USER_STATS,
  });

  const { data: upcomingEvents } = useQuery({
    queryKey: QUERY_KEYS.upcomingEvents,
    queryFn: () => eventsAPI.getUpcoming(),
  });

  const { data: latestNews } = useQuery({
    queryKey: QUERY_KEYS.latestNews,
    queryFn: () => newsAPI.getLatest(),
  });

  return (
    <div>
      {/* Hero — text left, floating logo over soft colour blobs right */}
      <section className="relative overflow-hidden bg-background">
        <div className="container-custom relative z-10 py-16 md:py-24 lg:py-28">
          <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="max-w-2xl">
              <p className="eyebrow mb-5">JNV Thiruvananthapuram · Navodayan network</p>
              <h1 className="font-display text-4xl font-bold leading-[1.05] text-foreground sm:text-5xl lg:text-6xl">
                We carry the{" "}
                <span className="text-brand">Navodayan spirit</span> forward
              </h1>
              <p className="mt-6 max-w-xl font-sans text-lg text-muted-foreground md:text-xl">
                Jawahar Navodaya Vidyalaya Thiruvananthapuram Alumni Association —
                reunions, mentorship, scholarships, and a lifelong bond with the
                school that brought rural talent together through JNVST.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                <Link to="/register" className="btn-primary px-7">
                  Join JNVTAA
                  <ArrowRight size={20} aria-hidden />
                </Link>
                <Link to="/login" className="btn-secondary">
                  Member login
                </Link>
              </div>
              <p className="mt-6 max-w-md font-sans text-base text-muted-foreground">
                Already a member? Log in to access the alumni directory, messages,
                and your dashboard.
              </p>
            </div>

            {/* Floating logo over soft colour blobs */}
            <div className="relative mx-auto flex aspect-square w-full max-w-lg items-center justify-center lg:max-w-xl">
              {/* Background colour blobs (house colours) */}
              <div
                className="pointer-events-none absolute left-[8%] top-[6%] h-44 w-44 animate-blob-drift rounded-full bg-house-blue/35 blur-3xl md:h-56 md:w-56"
                aria-hidden
              />
              <div
                className="pointer-events-none absolute bottom-[8%] right-[6%] h-48 w-48 animate-blob-drift rounded-full bg-house-red/30 blur-3xl md:h-60 md:w-60"
                style={{ animationDelay: "-4s" }}
                aria-hidden
              />
              <div
                className="pointer-events-none absolute bottom-[18%] left-[14%] h-36 w-36 animate-blob-drift rounded-full bg-house-yellow/35 blur-3xl md:h-44 md:w-44"
                style={{ animationDelay: "-8s" }}
                aria-hidden
              />
              <div
                className="pointer-events-none absolute right-[16%] top-[14%] h-32 w-32 animate-blob-drift rounded-full bg-house-green/30 blur-3xl md:h-40 md:w-40"
                style={{ animationDelay: "-2s" }}
                aria-hidden
              />

              {/* Floating logo on organic blob */}
              <div className="relative z-10 h-52 w-52 animate-float md:h-64 md:w-64 lg:h-72 lg:w-72">
                <svg
                  viewBox="0 0 200 200"
                  xmlns="http://www.w3.org/2000/svg"
                  className="absolute inset-0 h-full w-full drop-shadow-[0_12px_28px_rgba(30,58,95,0.15)]"
                  aria-hidden
                >
                  <path
                    fill="var(--brand-soft)"
                    d="M50.9,-49.8C55.7,-34.6,42.2,-14,36.4,7C30.6,28.1,32.4,49.6,24.7,54.6C17,59.5,-0.2,47.9,-10.6,37.1C-21.1,26.3,-24.7,16.4,-31.3,2.8C-37.9,-10.8,-47.4,-28.1,-42.7,-43.2C-37.9,-58.4,-19,-71.4,2.1,-73C23.1,-74.6,46.2,-64.9,50.9,-49.8Z"
                    transform="translate(100 100)"
                  />
                </svg>
                <img
                  src="/logo.png"
                  alt="JNVTAA logo"
                  width={288}
                  height={288}
                  className="relative z-10 h-full w-full object-contain p-8 md:p-10 lg:p-12"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What we do */}
      <section className="border-t border-border py-16 md:py-20">
        <div className="container-custom">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <p className="eyebrow mb-4">Our mission</p>
              <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">
                What JNVTAA does
              </h2>
              <p className="mt-4 max-w-md font-sans text-lg text-muted-foreground">
                We serve JNV Thiruvananthapuram and its alumni across
                generations — keeping the community connected and giving back.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link to="/events" className="btn-outline">
                  View events
                </Link>
                <Link to="/donate" className="btn-ghost">
                  Support a student
                </Link>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                {
                  icon: <Calendar size={22} strokeWidth={2} />,
                  title: "Reunions",
                  body: "Gatherings that bring Navodayans back to campus.",
                  accent: "house-red",
                },
                {
                  icon: <Users size={22} strokeWidth={2} />,
                  title: "Mentorship",
                  body: "Career support across batches and regions.",
                  accent: "house-blue",
                },
                {
                  icon: <GraduationCap size={22} strokeWidth={2} />,
                  title: "Scholarships",
                  body: "Transparent giving for students and campus projects.",
                  accent: "house-green",
                },
              ].map((c) => (
                <div
                  key={c.title}
                  className="rounded-2xl border border-border bg-card p-5 shadow-card"
                >
                  <span
                    className="inline-flex h-11 w-11 items-center justify-center rounded-xl text-white"
                    style={{ backgroundColor: `var(--${c.accent})` }}
                  >
                    {c.icon}
                  </span>
                  <h3 className="mt-4 font-display text-lg font-semibold text-foreground">
                    {c.title}
                  </h3>
                  <p className="mt-1.5 font-sans text-sm text-muted-foreground">
                    {c.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-t border-border bg-muted/40 py-16 md:py-20">
        <div className="container-custom">
          <SectionHeading
            eyebrow="Our community"
            title="Alumni network at a glance"
            description="A growing community of Navodayans — from JNV Thiruvananthapuram to cities and countries across the world."
          />
          <div className="grid grid-cols-2 gap-5 md:grid-cols-4 md:gap-6">
            <StatsCounter
              end={stats?.data?.stats?.totalUsers || 500}
              label="Alumni members"
              icon={<Users size={26} strokeWidth={2} />}
            />
            <StatsCounter
              end={25}
              label="Batches"
              icon={<GraduationCap size={26} strokeWidth={2} />}
            />
            <StatsCounter
              end={50}
              label="Events hosted"
              icon={<Calendar size={26} strokeWidth={2} />}
            />
            <StatsCounter
              end={15}
              label="Countries"
              icon={<Globe size={26} strokeWidth={2} />}
            />
          </div>
        </div>
      </section>

      {/* Events */}
      <section className="border-t border-border py-16 md:py-20">
        <div className="container-custom">
          <SectionHeading
            eyebrow="Upcoming gatherings"
            title="Events on the calendar"
            description="Reunions, fundraisers, and association meetings — stay connected with your alma mater."
            action={
              <Link to="/events" className="btn-ghost">
                All events
                <ArrowRight size={18} aria-hidden />
              </Link>
            }
          />

          {upcomingEvents?.data?.events?.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-3">
              {upcomingEvents.data.events.slice(0, 3).map((event) => (
                <Link
                  key={event._id}
                  to={`/events/${event._id}`}
                  className="block focus-ring rounded-2xl"
                >
                  <SketchCard tilt className="h-full p-0" contentClassName="flex h-full flex-col">
                    <div className="relative h-44 overflow-hidden border-b border-border bg-muted">
                      <img
                        src={event.coverImage || "https://via.placeholder.com/800x400?text=EVENT"}
                        alt=""
                        className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                      />
                      <span className="pill absolute left-3 top-3 bg-house-blue text-white shadow-card">
                        {new Date(event.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                    <div className="flex flex-grow flex-col p-5">
                      <h3 className="font-display text-lg font-semibold leading-snug text-foreground">
                        {event.title}
                      </h3>
                      <p className="mt-2 line-clamp-2 font-sans text-sm text-muted-foreground">
                        {event.description}
                      </p>
                      <div className="mt-auto flex items-center justify-between border-t border-border pt-4 font-sans text-sm">
                        <span className="text-muted-foreground">
                          {event.location?.city || "TBC"}
                        </span>
                        <span className="font-medium text-brand">Details →</span>
                      </div>
                    </div>
                  </SketchCard>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-border bg-card py-16 text-center shadow-card">
              <p className="font-sans text-lg text-muted-foreground">
                No upcoming events at the moment. We will announce new gatherings
                here soon.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* News */}
      <section className="border-t border-border py-16 md:py-20">
        <div className="container-custom">
          <SectionHeading
            eyebrow="Association updates"
            title="Latest news"
            description="Announcements, alumni achievements, and updates from JNV Thiruvananthapuram."
            action={
              <Link to="/news" className="btn-ghost">
                Read everything
                <ArrowRight size={18} aria-hidden />
              </Link>
            }
          />

          {latestNews?.data?.news?.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-3">
              {latestNews.data.news.slice(0, 3).map((article) => (
                <Link
                  key={article._id}
                  to={`/news/${article._id}`}
                  className="block focus-ring rounded-2xl"
                >
                  <SketchCard tilt className="h-full p-0" contentClassName="flex h-full flex-col">
                    <div className="h-44 overflow-hidden border-b border-border bg-muted">
                      <img
                        src={article.coverImage || "https://via.placeholder.com/800x400?text=NEWS"}
                        alt=""
                        className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                      />
                    </div>
                    <div className="flex flex-grow flex-col p-5">
                      <div className="mb-3 flex flex-wrap items-center gap-2">
                        <span className="pill bg-house-red text-white">
                          {article.category}
                        </span>
                        <span className="font-sans text-sm text-muted-foreground">
                          {new Date(article.publishedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <h3 className="font-display text-lg font-semibold leading-snug text-foreground">
                        {article.title}
                      </h3>
                      <p className="mt-2 line-clamp-2 font-sans text-sm text-muted-foreground">
                        {article.excerpt}
                      </p>
                    </div>
                  </SketchCard>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-border bg-card py-16 text-center shadow-card">
              <p className="font-sans text-lg text-muted-foreground">
                No news articles yet. Check back for updates from the
                association.
              </p>
            </div>
          )}
        </div>
      </section>

      <FeaturedAlumni />

      <Testimonials />

      {/* CTA */}
      <section className="relative overflow-hidden bg-brand py-20 text-white md:py-24">
        <span
          className="absolute inset-x-0 top-0 h-1.5"
          style={{
            background:
              "linear-gradient(90deg, var(--house-green) 0% 25%, var(--house-red) 25% 50%, var(--house-blue) 50% 75%, var(--house-yellow) 75% 100%)",
          }}
          aria-hidden
        />
        <div className="container-custom relative z-10 text-center">
          <h2 className="font-display text-3xl font-bold text-white md:text-4xl lg:text-5xl">
            Stay connected with your alma mater
          </h2>
          <p className="mx-auto mt-5 max-w-2xl font-sans text-lg text-white/85 md:text-xl">
            Join JNVTAA to reconnect with fellow Navodayans, access mentorship,
            and contribute to the NVS mission at JNV Thiruvananthapuram.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to="/register"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-white px-7 py-2.5 font-sans text-base font-semibold text-brand transition-all duration-200 hover:-translate-y-0.5 hover:shadow-cardHover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              Become a member
            </Link>
            <Link
              to="/donate"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/40 bg-transparent px-7 py-2.5 font-sans text-base font-semibold text-white transition-all duration-200 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              Support our students
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
