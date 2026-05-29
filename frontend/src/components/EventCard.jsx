import { Link } from "react-router-dom";
import { Calendar, MapPin } from "lucide-react";
import { SketchCard } from "@/components/SketchCard";

export default function EventCard({ event }) {
  return (
    <Link to={`/events/${event._id}`} className="block focus-ring rounded-2xl">
      <SketchCard
        tilt
        className="h-full p-0"
        contentClassName="flex h-full flex-col"
      >
        <div className="relative h-48 overflow-hidden border-b border-border bg-muted">
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
        <div className="flex flex-grow flex-col p-6">
          <h3 className="font-display text-xl font-semibold leading-snug text-foreground">
            {event.title}
          </h3>
          <p className="mt-2 line-clamp-2 font-sans text-base text-muted-foreground">
            {event.description}
          </p>
          <div className="mt-auto flex flex-col gap-2 border-t border-border pt-4 font-sans text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <Calendar size={16} aria-hidden />
              {new Date(event.date).toLocaleDateString()}
            </span>
            <span className="flex items-center gap-2">
              <MapPin size={16} aria-hidden />
              {event.location?.city || "TBC"}
            </span>
          </div>
        </div>
      </SketchCard>
    </Link>
  );
}
