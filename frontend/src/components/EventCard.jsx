import { Link } from "react-router-dom";
import { Calendar, MapPin, Users } from "lucide-react";
import { formatDate } from "@/utils/format";
import { SketchCard } from "@/components/SketchCard";

export default function EventCard({ event }) {
  const isUpcoming = new Date(event.date) > new Date();
  const attendeesCount =
    event.attendees?.filter((a) => a.status !== "cancelled").length || 0;

  return (
    <Link
      to={`/events/${event._id}`}
      className="block h-full focus-ring rounded-wobblyMd"
    >
      <SketchCard
        tilt
        className="h-full p-0 shadow-sketch hover:shadow-sketchLg"
        contentClassName="flex h-full flex-col"
      >
        <div className="relative h-48 overflow-hidden border-b-[3px] border-border bg-muted">
          <img
            src={event.coverImage || "https://via.placeholder.com/400x200"}
            alt=""
            className="h-full w-full object-cover"
          />
          <span className="absolute left-3 top-3 rounded-wobblySm border-2 border-border bg-foreground px-2 py-1 font-sans text-sm text-background shadow-sketchSm">
            {event.type.replace("_", " ")}
          </span>
          {isUpcoming && (
            <span className="absolute right-3 top-3 rounded-wobblySm border-2 border-border bg-postit px-2 py-1 font-sans text-sm font-bold text-foreground shadow-sketchSm">
              Upcoming
            </span>
          )}
        </div>
        <div className="flex flex-grow flex-col p-6 md:p-8">
          <div className="mb-3 flex items-center gap-2 font-sans text-base text-muted-foreground">
            <Calendar size={18} strokeWidth={2.5} aria-hidden />
            <span>{formatDate(event.date, "PPP")}</span>
          </div>
          <h3 className="font-display text-2xl font-bold leading-tight text-foreground line-clamp-2">
            {event.title}
          </h3>
          <p className="mt-3 line-clamp-2 font-sans text-lg text-muted-foreground">
            {event.description}
          </p>
          <div className="mt-auto space-y-3 border-t-2 border-dashed border-border pt-4 font-sans text-base">
            {event.location && (
              <div className="flex items-center gap-2">
                <MapPin size={18} strokeWidth={2.5} aria-hidden />
                <span className="truncate">
                  {event.location.isVirtual
                    ? "Virtual"
                    : event.location.venue}
                </span>
              </div>
            )}
            {event.registrationRequired && (
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Users size={18} strokeWidth={2.5} aria-hidden />
                  <span>
                    {attendeesCount}
                    {event.maxAttendees ? ` / ${event.maxAttendees}` : ""}{" "}
                    attending
                  </span>
                </div>
                {isUpcoming && (
                  <span className="text-pen underline decoration-wavy decoration-2">
                    Register →
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </SketchCard>
    </Link>
  );
}
