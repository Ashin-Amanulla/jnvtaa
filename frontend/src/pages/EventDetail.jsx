import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { eventsAPI } from "@/api";
import { useAuthStore } from "@/store/auth";
import LoadingSpinner from "@/components/LoadingSpinner";
import {
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaUsers,
  FaClock,
  FaArrowLeft,
  FaCheckCircle,
} from "react-icons/fa";
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  const event = eventData?.data?.event;
  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Event not found
          </h2>
          <button onClick={() => navigate("/events")} className="btn-primary mt-4">
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
    <div className="min-h-screen bg-gray-50">
      {/* Back Button */}
      <div className="bg-white border-b border-gray-200">
        <div className="container-custom py-4">
          <button
            onClick={() => navigate("/events")}
            className="flex items-center gap-2 text-gray-600 hover:text-primary-600 transition-colors"
          >
            <FaArrowLeft />
            <span>Back to Events</span>
          </button>
        </div>
      </div>

      {/* Hero Image */}
      <div className="relative h-96 overflow-hidden bg-gray-900">
        <img
          src={event.coverImage || "https://via.placeholder.com/1200x400"}
          alt={event.title}
          className="w-full h-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
        
        <div className="absolute bottom-0 left-0 right-0 container-custom pb-8">
          <div className="text-white animate-slide-up">
            <div className="flex items-center gap-3 mb-4">
              <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg text-sm font-semibold">
                {event.type.replace("_", " ").toUpperCase()}
              </span>
              {isUpcoming && (
                <span className="px-4 py-2 bg-green-500 rounded-lg text-sm font-semibold animate-pulse">
                  UPCOMING
                </span>
              )}
            </div>
            <h1 className="text-5xl font-bold mb-4">{event.title}</h1>
            <div className="flex flex-wrap items-center gap-6 text-lg">
              <div className="flex items-center">
                <FaCalendarAlt className="mr-2" />
                <span>{formatDate(event.date, "PPP")}</span>
              </div>
              <div className="flex items-center">
                <FaMapMarkerAlt className="mr-2" />
                <span>
                  {event.location.isVirtual ? "Virtual Event" : event.location.city}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <section className="py-12">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Event Details */}
            <div className="lg:col-span-2 space-y-8">
              {/* Description */}
              <div className="card p-8 animate-fade-in">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  About This Event
                </h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {event.description}
                </p>
              </div>

              {/* Location Details */}
              {event.location && (
                <div className="card p-8 animate-fade-in">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Location
                  </h2>
                  <div className="space-y-3">
                    {event.location.venue && (
                      <p className="text-gray-700">
                        <span className="font-semibold">Venue:</span>{" "}
                        {event.location.venue}
                      </p>
                    )}
                    {event.location.address && (
                      <p className="text-gray-700">
                        <span className="font-semibold">Address:</span>{" "}
                        {event.location.address}
                      </p>
                    )}
                    {event.location.virtualLink && (
                      <a
                        href={event.location.virtualLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-600 hover:text-primary-700 underline"
                      >
                        Join Virtual Event
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Organizer */}
              {event.organizer && (
                <div className="card p-8 animate-fade-in">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Organized By
                  </h2>
                  <div className="flex items-center gap-4">
                    <img
                      src={
                        event.organizer.avatar ||
                        `https://ui-avatars.com/api/?name=${event.organizer.firstName}`
                      }
                      alt={event.organizer.firstName}
                      className="w-16 h-16 rounded-full"
                    />
                    <div>
                      <p className="font-bold text-gray-900">
                        {event.organizer.firstName} {event.organizer.lastName}
                      </p>
                      <p className="text-sm text-gray-600">{event.organizer.email}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - RSVP & Info */}
            <div className="space-y-6">
              {/* RSVP Card */}
              {isUpcoming && event.registrationRequired && (
                <div className="card p-6 sticky top-24 animate-slide-up">
                  <div className="text-center mb-6">
                    <div className="text-4xl font-bold text-primary-600 mb-2">
                      {attendeesCount}
                      {event.maxAttendees ? ` / ${event.maxAttendees}` : ""}
                    </div>
                    <p className="text-gray-600">Attendees Registered</p>
                  </div>

                  {isAuthenticated ? (
                    <>
                      {isRegistered ? (
                        <>
                          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4 flex items-center justify-center gap-2">
                            <FaCheckCircle className="text-green-600" />
                            <span className="text-green-700 font-semibold">
                              You're registered!
                            </span>
                          </div>
                          <button
                            onClick={() => cancelRsvpMutation.mutate()}
                            disabled={cancelRsvpMutation.isLoading}
                            className="w-full btn-secondary"
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
                          className="w-full btn-primary text-lg py-3"
                        >
                          {rsvpMutation.isLoading ? "Registering..." : "Register Now"}
                        </button>
                      )}
                    </>
                  ) : (
                    <div className="text-center">
                      <p className="text-gray-600 mb-4">
                        Login to register for this event
                      </p>
                      <a href="/login" className="btn-primary w-full">
                        Login to Register
                      </a>
                    </div>
                  )}
                </div>
              )}

              {/* Event Info */}
              <div className="card p-6 animate-slide-up" style={{ animationDelay: "0.1s" }}>
                <h3 className="font-bold text-gray-900 mb-4">Event Details</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <FaCalendarAlt className="text-primary-600 mt-1" />
                    <div>
                      <p className="text-sm text-gray-600">Date</p>
                      <p className="font-semibold text-gray-900">
                        {formatDate(event.date, "PPP")}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <FaClock className="text-primary-600 mt-1" />
                    <div>
                      <p className="text-sm text-gray-600">Time</p>
                      <p className="font-semibold text-gray-900">
                        {formatDate(event.date, "p")}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <FaMapMarkerAlt className="text-primary-600 mt-1" />
                    <div>
                      <p className="text-sm text-gray-600">Location</p>
                      <p className="font-semibold text-gray-900">
                        {event.location.isVirtual
                          ? "Virtual Event"
                          : event.location.venue}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <FaUsers className="text-primary-600 mt-1" />
                    <div>
                      <p className="text-sm text-gray-600">Attendees</p>
                      <p className="font-semibold text-gray-900">
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

