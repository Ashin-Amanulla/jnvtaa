import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { eventsAPI } from "@/api";
import EventCard from "@/components/EventCard";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Calendar } from "lucide-react";
import { Link } from "react-router-dom";

export default function Events() {
  const [filter, setFilter] = useState("all");

  const { data: eventsData, isLoading } = useQuery({
    queryKey: ["events", filter],
    queryFn: () => {
      const params = {};
      if (filter === "upcoming") params.status = "upcoming";
      if (filter === "completed") params.status = "completed";
      return eventsAPI.getAll(params);
    },
  });

  const filterOptions = [
    { value: "all", label: "All Events" },
    { value: "upcoming", label: "Upcoming" },
    { value: "completed", label: "Past Events" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <section className="relative border-b-[3px] border-dashed border-border py-16 md:py-24">
        <div className="container-custom">
          <p className="mb-3 inline-block rotate-[-1deg] rounded-wobblySm border-2 border-border bg-white px-3 py-1 font-sans text-lg shadow-sketchSm">
            Community calendar
          </p>
          <h1 className="font-display text-5xl font-bold uppercase md:text-6xl lg:text-7xl">
            Events
          </h1>
          <div className="mt-4 h-1 max-w-sm border-b-4 border-dashed border-foreground" />
          <p className="mt-6 max-w-2xl font-sans text-xl text-muted-foreground md:text-2xl">
            Reunions, fundraisers, and “remember when?” nights—grab a marker and
            save the date.
          </p>
        </div>
      </section>

      {/* Filter Tabs */}
      <section className="sticky-below-nav py-6">
        <div className="container-custom">
          <div className="flex flex-wrap gap-3">
            {filterOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setFilter(option.value)}
                className={`min-h-12 rounded-wobblySm border-[3px] px-6 py-2 font-sans text-lg shadow-sketchSm transition-transform duration-100 focus-ring ${
                  filter === option.value
                    ? "border-border bg-foreground text-background"
                    : "border-border bg-white text-foreground hover:-rotate-1 hover:shadow-sketch"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Events Grid */}
      <section className="border-t-[3px] border-dashed border-border py-20">
        <div className="container-custom">
          {isLoading && <LoadingSpinner />}

          {!isLoading && eventsData?.data?.events?.length > 0 && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {eventsData.data.events.map((event) => (
                  <EventCard key={event._id} event={event} />
                ))}
              </div>

              {/* Pagination */}
              {eventsData.pagination && eventsData.pagination.totalPages > 1 && (
                <div className="mt-16 flex justify-center gap-6">
                  <button className="btn btn-outline">Previous</button>
                  <button className="btn btn-primary">Next</button>
                </div>
              )}
            </>
          )}

          {/* Empty State */}
          {!isLoading && eventsData?.data?.events?.length === 0 && (
            <div className="rounded-wobblyMd border-[3px] border-dashed border-border py-24 text-center shadow-sketchSm">
              <Calendar className="mx-auto mb-6 hidden text-muted-foreground md:block" size={64} strokeWidth={2} />
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

      {/* CTA Section */}
      <section className="border-t-[3px] border-border bg-foreground py-24 text-background">
        <div className="container-custom text-center">
          <h2 className="mx-auto max-w-2xl font-display text-4xl font-bold md:text-5xl lg:text-6xl">
            Pitch a gathering
          </h2>
          <div className="mx-auto mt-6 h-1 max-w-[6rem] border-b-4 border-dashed border-background" />
          <p className="mx-auto mt-8 max-w-xl font-sans text-xl text-background/85">
            Have a reunion idea? We’ll help with notes, nudges, and napkin
            logistics.
          </p>
          <Link
            to="/contact"
            className="mt-10 inline-flex min-h-12 items-center justify-center rounded-wobblySm border-[3px] border-background bg-background px-8 py-3 font-sans text-xl font-normal text-foreground shadow-[4px_4px_0_0_#fdfbf7] transition-transform duration-100 hover:translate-x-0.5 hover:translate-y-0.5 hover:bg-accent hover:text-white hover:shadow-[2px_2px_0_0_#fdfbf7] focus-ring"
          >
            Get in touch →
          </Link>
        </div>
      </section>
    </div>
  );
}
