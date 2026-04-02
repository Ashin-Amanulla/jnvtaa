import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { eventsAPI } from "@/api";
import { useAuthStore } from "@/store/auth";
import LoadingSpinner from "@/components/LoadingSpinner";
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";
import { formatDate } from "@/utils/format";

export default function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAuthenticated, user } = useAuthStore();

  const { data: eventData, isLoading } = useQuery({
    queryKey: ["event", id],
    queryFn: () => eventsAPI.getById(id),
  });

  const rsvpMutation = useMutation({
    mutationFn: () => eventsAPI.rsvp(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["event", id]);
    },
  });

  const cancelRsvpMutation = useMutation({
    mutationFn: () => eventsAPI.cancelRsvp(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["event", id]);
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  const event = eventData?.data?.event;
  if (!event) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center card p-10 border-[2px] border-border">
          <h2 className="text-4xl font-display font-medium mb-6">
            Event not found
          </h2>
          <button onClick={() => navigate("/events")} className="btn btn-primary px-8">
            Back to Events
          </button>
        </div>
      </div>
    );
  }

  const isRegistered = event.attendees?.some(
    (a) => a.user._id === user?._id && a.status !== "cancelled"
  );
  const attendeesCount = event.attendees?.filter(
    (a) => a.status !== "cancelled"
  ).length || 0;
  const isUpcoming = new Date(event.date) > new Date();

  return (
    <div className="min-h-screen bg-background text-foreground pb-24">
      {/* Back Button */}
      <div className="sticky-below-nav relative">
        <div className="container-custom py-4">
          <button
            type="button"
            onClick={() => navigate("/events")}
            className="inline-flex items-center gap-2 font-sans text-lg text-pen underline decoration-wavy decoration-2 underline-offset-4 focus-ring rounded-sm"
          >
            <ArrowLeft size={16} strokeWidth={2} />
            Back to Events
          </button>
        </div>
      </div>

      {/* Hero Image */}
      <div className="relative h-[60vh] min-h-[400px] overflow-hidden border-b-[3px] border-dashed border-border bg-muted">
        <img
          src={event.coverImage || "https://via.placeholder.com/1200x400"}
          alt={event.title}
          className="h-full w-full object-cover opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        
        <div className="absolute bottom-0 left-0 right-0 container-custom pb-16">
          <div>
            <div className="flex items-center gap-4 mb-6">
              <span className="rounded-wobblySm border-[3px] border-border bg-foreground px-3 py-1 font-sans text-sm font-bold text-background shadow-sketchSm">
                {event.type.replace("_", " ")}
              </span>
              {isUpcoming && (
                <span className="rounded-wobblySm border-[3px] border-border bg-postit px-3 py-1 font-sans text-sm font-bold text-foreground shadow-sketchSm">
                  Upcoming
                </span>
              )}
            </div>
            <h1 className="mb-8 max-w-4xl font-display text-5xl font-bold md:text-7xl lg:text-8xl">
              {event.title}
            </h1>
            <div className="flex flex-wrap items-center gap-8 border-t-2 border-dashed border-border/60 pt-6 font-sans text-lg">
              <div className="flex items-center text-muted-foreground">
                <Calendar className="mr-3 text-foreground" size={20} strokeWidth={2.5} />
                <span>{formatDate(event.date, "PPP")}</span>
              </div>
              <div className="flex items-center text-muted-foreground">
                <MapPin className="mr-3 text-foreground" size={20} strokeWidth={2.5} />
                <span>
                  {event.location.isVirtual ? "Virtual Event" : event.location.city}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <section className="pt-24">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Left Column - Event Details */}
            <div className="lg:col-span-8 space-y-12">
              {/* Description */}
              <div className="card p-10 border-[2px] border-border bg-background shadow-none">
                <h2 className="text-3xl font-display tracking-tighter font-medium mb-6">
                  About This Event
                </h2>
                <div className="h-[2px] w-12 bg-foreground mb-8"></div>
                <p className="font-sans text-lg text-muted-foreground leading-relaxed whitespace-pre-line">
                  {event.description}
                </p>
              </div>

              {/* Location Details */}
              {event.location && (
                <div className="card p-10 border-[2px] border-border bg-background shadow-none">
                  <h2 className="text-3xl font-display tracking-tighter font-medium mb-6">
                    Location
                  </h2>
                  <div className="h-[2px] w-12 bg-foreground mb-8"></div>
                  <div className="space-y-6">
                    {event.location.venue && (
                      <div className="flex items-start gap-4">
                        <MapPin className="text-muted-foreground shrink-0 mt-1" size={20} strokeWidth={1.5} />
                        <div>
                          <p className="font-mono text-xs uppercase tracking-widest font-bold mb-1">Venue</p>
                          <p className="font-sans text-lg">{event.location.venue}</p>
                        </div>
                      </div>
                    )}
                    {event.location.address && (
                      <div className="flex items-start gap-4">
                        <div className="w-5"></div>
                        <div>
                          <p className="font-mono text-xs uppercase tracking-widest font-bold mb-1">Address</p>
                          <p className="font-sans text-lg text-muted-foreground">{event.location.address}</p>
                        </div>
                      </div>
                    )}
                    {event.location.virtualLink && (
                      <div className="pt-4 mt-4 border-t-[1px] border-border">
                        <a
                          href={event.location.virtualLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 font-mono text-sm tracking-widest uppercase font-bold underline decoration-2 underline-offset-4"
                        >
                          Join Virtual Event →
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Organizer */}
              {event.organizer && (
                <div className="card p-10 border-[2px] border-border bg-background shadow-none">
                  <h2 className="text-3xl font-display tracking-tighter font-medium mb-6">
                    Organized By
                  </h2>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                    <img
                      src={
                        event.organizer.avatar ||
                        `https://ui-avatars.com/api/?name=${event.organizer.firstName}&background=000&color=fff`
                      }
                      alt={event.organizer.firstName}
                      className="w-24 h-24 grayscale border-[2px] border-foreground"
                    />
                    <div>
                      <p className="text-3xl font-display tracking-tighter font-medium mb-2">
                        {event.organizer.firstName} {event.organizer.lastName}
                      </p>
                      <p className="font-mono text-sm uppercase tracking-widest text-muted-foreground">{event.organizer.email}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - RSVP & Info */}
            <div className="lg:col-span-4 space-y-8">
              {/* RSVP Card */}
              {isUpcoming && event.registrationRequired && (
                <div className="card p-8 border-[4px] border-foreground bg-background shadow-none sticky top-[160px]">
                  <div className="text-center mb-8 border-b-[2px] border-border pb-8">
                    <div className="text-6xl font-display font-medium tracking-tighter mb-2">
                      {attendeesCount}
                      {event.maxAttendees ? <span className="text-muted-foreground text-4xl">/{event.maxAttendees}</span> : ""}
                    </div>
                    <p className="font-mono text-xs uppercase tracking-widest font-bold text-muted-foreground">Attendees Registered</p>
                  </div>

                  {isAuthenticated ? (
                    <>
                      {isRegistered ? (
                        <>
                          <div className="border-[2px] border-foreground bg-foreground text-background p-4 mb-6 flex items-center justify-center gap-3">
                            <CheckCircle2 size={20} strokeWidth={2} />
                            <span className="font-mono text-sm tracking-widest uppercase font-bold">
                              You're registered!
                            </span>
                          </div>
                          <button
                            onClick={() => cancelRsvpMutation.mutate()}
                            disabled={cancelRsvpMutation.isLoading}
                            className="w-full btn btn-secondary border-[2px]"
                          >
                            {cancelRsvpMutation.isLoading
                              ? "Cancelling..."
                              : "Cancel Registration"}
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => rsvpMutation.mutate()}
                          disabled={rsvpMutation.isLoading}
                          className="w-full btn btn-primary py-4 text-base"
                        >
                          {rsvpMutation.isLoading ? "Registering..." : "Register Now →"}
                        </button>
                      )}
                    </>
                  ) : (
                    <div className="text-center">
                      <p className="font-sans text-muted-foreground mb-6">
                        Login to register for this event
                      </p>
                      <a href="/login" className="btn btn-primary w-full">
                        Login to Register →
                      </a>
                    </div>
                  )}
                </div>
              )}

              {/* Event Info Snapshot */}
              <div className="card p-8 border-[2px] border-border bg-muted shadow-none">
                <h3 className="font-display text-2xl tracking-tighter font-medium mb-6">Snapshot</h3>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <Calendar className="text-foreground shrink-0 mt-1" size={20} strokeWidth={1.5} />
                    <div>
                      <p className="font-mono text-xs uppercase tracking-widest font-bold mb-1 text-muted-foreground">Date</p>
                      <p className="font-sans font-medium text-lg">
                        {formatDate(event.date, "PPP")}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <Clock className="text-foreground shrink-0 mt-1" size={20} strokeWidth={1.5} />
                    <div>
                      <p className="font-mono text-xs uppercase tracking-widest font-bold mb-1 text-muted-foreground">Time</p>
                      <p className="font-sans font-medium text-lg">
                        {formatDate(event.date, "p")}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <MapPin className="text-foreground shrink-0 mt-1" size={20} strokeWidth={1.5} />
                    <div>
                      <p className="font-mono text-xs uppercase tracking-widest font-bold mb-1 text-muted-foreground">Location</p>
                      <p className="font-sans font-medium text-lg">
                        {event.location.isVirtual
                          ? "Virtual Event"
                          : event.location.venue}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <Users className="text-foreground shrink-0 mt-1" size={20} strokeWidth={1.5} />
                    <div>
                      <p className="font-mono text-xs uppercase tracking-widest font-bold mb-1 text-muted-foreground">Attendees</p>
                      <p className="font-sans font-medium text-lg">
                        {attendeesCount} registered
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
