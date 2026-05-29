import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  getDay,
} from "date-fns";
import { eventsAPI } from "@/api";
import EventCard from "@/components/EventCard";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Calendar, LayoutGrid, Download } from "lucide-react";
import { downloadEventIcs } from "@/utils/ics";
import { cn } from "@/utils/cn";

export default function Events() {
  const [filter, setFilter] = useState("all");
  const [viewMode, setViewMode] = useState("grid");
  const [calendarMonth, setCalendarMonth] = useState(new Date());

  const { data: eventsData, isLoading } = useQuery({
    queryKey: ["events", filter],
    queryFn: () => {
      const params = {};
      if (filter === "upcoming") params.status ="upcoming";
      if (filter === "completed") params.status ="completed";
      return eventsAPI.getAll(params);
    },
  });

  const events = eventsData?.data?.events || [];

  const filterOptions = [
    { value: "all", label: "All Events" },
    { value: "upcoming", label: "Upcoming" },
    { value: "completed", label: "Past Events" },
  ];

  const monthStart = startOfMonth(calendarMonth);
  const monthEnd = endOfMonth(calendarMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startPadding = getDay(monthStart);

  const eventsByDay = useMemo(() => {
    const map = {};
    events.forEach((event) => {
      const key = format(new Date(event.date), "yyyy-MM-dd");
      if (!map[key]) map[key] = [];
      map[key].push(event);
    });
    return map;
  }, [events]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <section className="relative border-b border-border py-16 md:py-24">
        <div className="container-custom">
          <p className="mb-3 inline-block rounded-xl border-2 border-border bg-white px-3 py-1 font-sans text-lg shadow-card">
            Community calendar
          </p>
          <h1 className="font-display text-5xl font-bold uppercase md:text-6xl lg:text-7xl">
            Events
          </h1>
          <div className="mt-4 h-1 max-w-sm border-b-2 border-brand" />
          <p className="mt-6 max-w-2xl font-sans text-xl text-muted-foreground md:text-2xl">
            Reunions, fundraisers, and association gatherings — stay connected
            with fellow Navodayans and JNV Thiruvananthapuram.
          </p>
        </div>
      </section>

      <section className="sticky-below-nav py-6">
        <div className="container-custom">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap gap-3">
              {filterOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setFilter(option.value)}
                  className={`min-h-12 rounded-xl border-[3px] px-6 py-2 font-sans text-lg shadow-card transition-transform duration-100 focus-ring ${
                    filter === option.value
                      ? "border-border bg-brand text-white"
                      : "border-border bg-white text-foreground hover:shadow-card"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={cn(
                  "inline-flex min-h-12 items-center gap-2 rounded-xl border-[3px] px-4 py-2 font-sans text-lg shadow-card focus-ring",
                  viewMode === "grid"
                    ? "border-border bg-brand text-white"
                    : "border-border bg-white"
                )}
                aria-pressed={viewMode === "grid"}
              >
                <LayoutGrid size={20} />
                Grid
              </button>
              <button
                type="button"
                onClick={() => setViewMode("calendar")}
                className={cn(
                  "inline-flex min-h-12 items-center gap-2 rounded-xl border-[3px] px-4 py-2 font-sans text-lg shadow-card focus-ring",
                  viewMode === "calendar"
                    ? "border-border bg-brand text-white"
                    : "border-border bg-white"
                )}
                aria-pressed={viewMode === "calendar"}
              >
                <Calendar size={20} />
                Calendar
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-border py-20">
        <div className="container-custom">
          {isLoading && <LoadingSpinner />}

          {!isLoading && events.length > 0 && viewMode === "grid" && (
            <>
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                {events.map((event) => (
                  <div key={event._id} className="relative">
                    <EventCard event={event} />
                    <button
                      type="button"
                      onClick={() => downloadEventIcs(event)}
                      className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-xl border-2 border-border bg-white px-2 py-1 font-sans text-xs shadow-card focus-ring"
                      title="Download .ics"
                    >
                      <Download size={14} />
                      .ics
                    </button>
                  </div>
                ))}
              </div>

              {eventsData.pagination && eventsData.pagination.totalPages > 1 && (
                <div className="mt-16 flex justify-center gap-6">
                  <button type="button" className="btn btn-outline">
                    Previous
                  </button>
                  <button type="button" className="btn btn-primary">
                    Next
                  </button>
                </div>
              )}
            </>
          )}

          {!isLoading && events.length > 0 && viewMode === "calendar" && (
            <div className="rounded-2xl border border-border bg-white p-6 shadow-card md:p-8">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="font-display text-3xl font-bold">
                  {format(calendarMonth, "MMMM yyyy")}
                </h2>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setCalendarMonth(
                        new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1)
                      )
                    }
                    className="btn-outline px-3 py-1 text-sm"
                  >
                    Prev
                  </button>
                  <button
                    type="button"
                    onClick={() => setCalendarMonth(new Date())}
                    className="btn-outline px-3 py-1 text-sm"
                  >
                    Today
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setCalendarMonth(
                        new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1)
                      )
                    }
                    className="btn-outline px-3 py-1 text-sm"
                  >
                    Next
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-7 gap-1 text-center font-sans text-sm font-bold uppercase text-muted-foreground">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                  <div key={d} className="py-2">
                    {d}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: startPadding }).map((_, i) => (
                  <div key={`pad-${i}`} className="min-h-24 rounded-xl bg-muted/30" />
                ))}
                {daysInMonth.map((day) => {
                  const key = format(day, "yyyy-MM-dd");
                  const dayEvents = eventsByDay[key] || [];
                  return (
                    <div
                      key={key}
                      className={cn(
                        "min-h-24 rounded-xl border-2 border-border p-1",
                        isSameDay(day, new Date()) && "border-brand bg-house-yellow-soft",
                        !isSameMonth(day, calendarMonth) && "opacity-40"
                      )}
                    >
                      <span className="font-sans text-sm font-bold">{format(day, "d")}</span>
                      <div className="mt-1 space-y-1">
                        {dayEvents.slice(0, 2).map((ev) => (
                          <Link
                            key={ev._id}
                            to={`/events/${ev._id}`}
                            className="block truncate rounded border border-border bg-white px-1 py-0.5 font-sans text-xs hover:bg-muted focus-ring"
                          >
                            {ev.title}
                          </Link>
                        ))}
                        {dayEvents.length > 2 && (
                          <span className="font-sans text-xs text-muted-foreground">
                            +{dayEvents.length - 2} more
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {!isLoading && events.length === 0 && (
            <div className="rounded-2xl border border-border py-24 text-center shadow-card">
              <Calendar
                className="mx-auto mb-6 hidden text-muted-foreground md:block"
                size={64}
                strokeWidth={2}
              />
              <h3 className="mb-4 font-display text-3xl font-bold md:text-4xl">
                No events found
              </h3>
              <p className="mx-auto max-w-md font-sans text-lg text-muted-foreground">
                {filter === "upcoming"
                  ? "No upcoming events scheduled at the moment. Check back soon!"
                  : filter === "completed"
                    ? "No past events to display."
                    : "No events available."}
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="border-t-[3px] border-border bg-foreground py-24 text-background">
        <div className="container-custom text-center">
          <h2 className="mx-auto max-w-2xl font-display text-4xl font-bold md:text-5xl lg:text-6xl">
            Propose an event
          </h2>
          <div className="mx-auto mt-6 h-1 max-w-[6rem] border-b-4 border-background" />
          <p className="mx-auto mt-8 max-w-xl font-sans text-xl text-background/85">
            Have a reunion or gathering in mind? We will help you coordinate
            with fellow alumni and the association.
          </p>
          <Link
            to="/contact"
            className="mt-10 inline-flex min-h-12 items-center justify-center rounded-xl border-[3px] border-background bg-background px-8 py-3 font-sans text-xl font-normal text-foreground shadow-[4px_4px_0_0_#fdfbf7] transition-transform duration-100 hover:translate-x-0.5 hover:translate-y-0.5 hover:bg-accent hover:text-white hover:shadow-[2px_2px_0_0_#fdfbf7] focus-ring"
          >
            Get in touch →
          </Link>
        </div>
      </section>
    </div>
  );
}
