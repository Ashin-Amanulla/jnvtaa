import { Link } from "react-router-dom";
import {
  Users,
  Calendar,
  GraduationCap,
  Globe,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { usersAPI, eventsAPI, newsAPI } from "@/api";
import FeaturedAlumni from "@/components/FeaturedAlumni";
import Testimonials from "@/components/Testimonials";
import StatsCounter from "@/components/StatsCounter";
import { SectionHeading } from "@/components/SectionHeading";
import { SketchCard } from "@/components/SketchCard";
import { SketchIconCircle } from "@/components/SketchIconCircle";
import { ArrowToCta } from "@/components/HeroSketchDecor";
import { cn } from "@/utils/cn";

export default function Home() {
  const { data: stats } = useQuery({
    queryKey: ["userStats"],
    queryFn: () => usersAPI.getUserStats(),
  });

  const { data: upcomingEvents } = useQuery({
    queryKey: ["upcomingEvents"],
    queryFn: () => eventsAPI.getUpcoming(),
  });

  const { data: latestNews } = useQuery({
    queryKey: ["latestNews"],
    queryFn: () => newsAPI.getLatest(),
  });

  return (
    <div>
      <section className="relative overflow-hidden py-16 md:py-24">
        <div className="pointer-events-none absolute right-[8%] top-24 hidden text-foreground/25 md:block">
          <ArrowToCta className="rotate-6" />
        </div>
        <div className="container-custom relative z-10">
          <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div>
              <p className="mb-4 inline-flex rotate-[-1deg] items-center gap-2 rounded-wobblySm border-2 border-dashed border-border bg-white px-3 py-1 font-sans text-lg text-muted-foreground shadow-sketchSm">
                <Sparkles className="text-accent" size={20} strokeWidth={2.5} />
                Alumni network · JNV Trivandrum
              </p>
              <h1 className="font-display text-5xl font-bold leading-[0.95] text-foreground md:text-6xl lg:text-7xl">
                Your batchmates
                <span className="relative inline-block">
                  {" "}
                  live here
                  <span
                    className="absolute -right-2 top-0 inline-block font-display text-accent md:-right-4 md:text-6xl"
                    aria-hidden
                  >
                    !
                  </span>
                </span>
              </h1>
              <p className="mt-6 max-w-xl font-sans text-xl text-muted-foreground md:text-2xl">
                Jawahar Navodaya Vidyalaya Thiruvananthapuram Alumni Association
                — reunions, mentorship, scholarships, and inside jokes that
                never left the dorm.
              </p>
              <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center">
                <Link
                  to="/register"
                  className="btn-primary inline-flex items-center gap-3 px-8 focus-ring"
                >
                  Join the doodle gang
                  <ArrowRight size={22} strokeWidth={2.5} />
                </Link>
                <Link
                  to="/directory"
                  className="btn-secondary inline-flex items-center gap-2 focus-ring"
                >
                  Find someone you owe lunch
                </Link>
              </div>
              <p className="mt-6 max-w-md font-sans text-lg text-foreground/80">
                New here? Start with the directory—search by batch, city, or
                that one friend who always borrowed your notes.
              </p>
            </div>

            <SketchCard decoration="tape" tilt className="rotate-1 p-6 md:p-10">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-display text-3xl font-bold text-foreground md:text-4xl">
                    Open notebooks
                  </p>
                  <p className="mt-2 font-sans text-lg text-muted-foreground">
                    Messy reminders for what JNVTAA actually does.
                  </p>
                </div>
                <SketchIconCircle>
                  <Users size={26} strokeWidth={2.5} className="text-pen" />
                </SketchIconCircle>
              </div>
              <ul className="mt-8 space-y-4 font-sans text-lg">
                {[
                  "Host reunions that feel like time travel (without the exam stress).",
                  "Run mentorship & job shout-outs across batches.",
                  "Fund scholarships and campus projects with transparent giving.",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex gap-3 border-b-2 border-dashed border-border/60 pb-3 last:border-0"
                  >
                    <span className="mt-1 h-2 w-2 shrink-0 rounded-sm bg-accent" />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link to="/events" className="btn-outline text-base">
                  Peek at events
                </Link>
                <Link to="/donate" className="btn-ghost text-base">
                  Support a student
                </Link>
              </div>
            </SketchCard>
          </div>
        </div>
      </section>

      <section className="border-t-[3px] border-dashed border-border py-20">
        <div className="container-custom">
          <SectionHeading
            eyebrow="The messy stats wall"
            title="Our network (rounded wrong on purpose)"
            description="Numbers that keep growing—like the list of excuses for skipping morning assembly."
          />
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4 md:gap-8">
            <StatsCounter
              end={stats?.data?.stats?.totalUsers || 500}
              label="Alumni members"
              icon={<Users size={28} strokeWidth={2.5} />}
            />
            <StatsCounter
              end={25}
              label="Batches"
              icon={<GraduationCap size={28} strokeWidth={2.5} />}
            />
            <StatsCounter
              end={50}
              label="Events thrown"
              icon={<Calendar size={28} strokeWidth={2.5} />}
            />
            <StatsCounter
              end={15}
              label="Countries"
              icon={<Globe size={28} strokeWidth={2.5} />}
            />
          </div>
        </div>
      </section>

      <section className="border-t-[3px] border-dashed border-border py-20">
        <div className="container-custom">
          <SectionHeading
            eyebrow="Calendar scribbles"
            title="What’s coming up"
            description="Grab a seat before someone sells you a ‘definitely free’ reunion ticket."
            action={
              <Link to="/events" className="btn-ghost text-xl">
                All events →
              </Link>
            }
          />

          {upcomingEvents?.data?.events?.length > 0 ? (
            <div className="grid gap-8 md:grid-cols-3">
              {upcomingEvents.data.events.slice(0, 3).map((event, i) => (
                <Link key={event._id} to={`/events/${event._id}`} className="block focus-ring rounded-wobblyMd">
                  <SketchCard
                    decoration={i % 2 === 0 ? "tack" : "none"}
                    tilt
                    className={cn(
                      "h-full p-0 transition-transform duration-100",
                      i === 1 && "md:-translate-y-2 md:rotate-[-1deg]",
                    )}
                    contentClassName="flex h-full flex-col"
                  >
                    <div className="relative h-48 overflow-hidden border-b-[3px] border-border bg-muted">
                      <img
                        src={
                          event.coverImage ||
                          "https://via.placeholder.com/800x400?text=EVENT"
                        }
                        alt=""
                        className="h-full w-full object-cover"
                      />
                      <span className="absolute left-3 top-3 rounded-wobblySm border-2 border-border bg-white px-2 py-1 font-sans text-sm shadow-sketchSm">
                        {new Date(event.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                    <div className="flex flex-grow flex-col p-6 md:p-8">
                      <h3 className="font-display text-2xl font-bold leading-tight text-foreground">
                        {event.title}
                      </h3>
                      <p className="mt-3 line-clamp-2 font-sans text-lg text-muted-foreground">
                        {event.description}
                      </p>
                      <div className="mt-auto flex items-center justify-between border-t-2 border-dashed border-border pt-4 font-sans text-base">
                        <span>{event.location?.city || "TBC"}</span>
                        <span className="text-pen underline decoration-wavy decoration-2">
                          Details
                        </span>
                      </div>
                    </div>
                  </SketchCard>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-wobblyMd border-[3px] border-dashed border-border bg-white py-16 text-center shadow-sketchSm">
              <p className="font-sans text-xl text-muted-foreground">
                No upcoming events yet—we’re probably still arguing about the
                venue.
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="border-t-[3px] border-dashed border-border py-20">
        <div className="container-custom">
          <SectionHeading
            eyebrow="From the bulletin board"
            title="Latest news"
            description="Stories, announcements, and mildly chaotic alumni updates."
            action={
              <Link to="/news" className="btn-ghost text-xl">
                Read everything →
              </Link>
            }
          />

          {latestNews?.data?.news?.length > 0 ? (
            <div className="grid gap-8 md:grid-cols-3">
              {latestNews.data.news.slice(0, 3).map((article, i) => (
                <Link
                  key={article._id}
                  to={`/news/${article._id}`}
                  className="block focus-ring rounded-wobblyMd"
                >
                  <SketchCard
                    postit={i === 1}
                    decoration={i === 2 ? "tape" : "none"}
                    tilt
                    className="h-full p-0"
                    contentClassName="flex h-full flex-col"
                  >
                    <div className="h-48 overflow-hidden border-b-[3px] border-border bg-muted">
                      <img
                        src={
                          article.coverImage ||
                          "https://via.placeholder.com/800x400?text=NEWS"
                        }
                        alt=""
                        className="h-full w-full object-cover transition-transform duration-100 hover:scale-[1.02]"
                      />
                    </div>
                    <div className="flex flex-grow flex-col p-6 md:p-8">
                      <div className="mb-3 flex flex-wrap items-center gap-2">
                        <span className="rounded-wobblySm border-2 border-border bg-foreground px-2 py-0.5 font-sans text-sm text-background shadow-sketchSm">
                          {article.category}
                        </span>
                        <span className="font-sans text-sm text-muted-foreground">
                          {new Date(article.publishedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <h3 className="font-display text-2xl font-bold leading-tight text-foreground">
                        {article.title}
                      </h3>
                      <p className="mt-3 line-clamp-2 font-sans text-lg text-muted-foreground">
                        {article.excerpt}
                      </p>
                    </div>
                  </SketchCard>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-wobblyMd border-[3px] border-dashed border-border bg-white py-16 text-center shadow-sketchSm">
              <p className="font-sans text-xl text-muted-foreground">
                No news for now—the editor is hunting for a red marker.
              </p>
            </div>
          )}
        </div>
      </section>

      <FeaturedAlumni />

      <Testimonials />

      <section className="relative overflow-hidden border-t-[3px] border-border bg-foreground py-24 text-background">
        <div
          className="pointer-events-none absolute -left-10 top-10 h-32 w-32 rounded-full border-2 border-dashed border-background/30 md:block"
          aria-hidden
        />
        <div className="container-custom relative z-10 text-center">
          <h2 className="font-display text-5xl font-bold md:text-6xl lg:text-7xl">
            Reconnect like it’s recess
          </h2>
          <p className="mx-auto mt-6 max-w-2xl font-sans text-xl text-background/85 md:text-2xl">
            Membership takes two minutes. The group chat roast takes two
            seconds.
          </p>
          <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              to="/register"
              className="inline-flex min-h-12 items-center justify-center rounded-wobblySm border-[3px] border-background bg-background px-8 py-3 font-sans text-xl text-foreground shadow-[4px_4px_0_0_#fdfbf7] transition-transform duration-100 hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0_0_#fdfbf7] focus-ring"
            >
              Become a member
            </Link>
            <Link
              to="/donate"
              className="inline-flex min-h-12 items-center justify-center rounded-wobblySm border-[3px] border-dashed border-background bg-transparent px-8 py-3 font-sans text-xl text-background transition-transform duration-100 hover:-rotate-1 focus-ring"
            >
              Fund a dream
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
