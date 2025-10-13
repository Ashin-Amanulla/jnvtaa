import { Link } from "react-router-dom";
import {
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaUsers,
  FaClock,
} from "react-icons/fa";
import { formatDate } from "@/utils/format";

export default function EventCard({ event }) {
  const getEventTypeColor = (type) => {
    const colors = {
      reunion: "bg-purple-100 text-purple-700",
      annual_meet: "bg-blue-100 text-blue-700",
      virtual: "bg-green-100 text-green-700",
      social: "bg-pink-100 text-pink-700",
      workshop: "bg-orange-100 text-orange-700",
      other: "bg-gray-100 text-gray-700",
    };
    return colors[type] || colors.other;
  };

  const isUpcoming = new Date(event.date) > new Date();
  const attendeesCount = event.attendees?.filter(
    (a) => a.status !== "cancelled"
  ).length || 0;

  return (
    <Link
      to={`/events/${event._id}`}
      className="card hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group overflow-hidden"
    >
      {/* Cover Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={event.coverImage || "https://via.placeholder.com/400x200"}
          alt={event.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute top-4 left-4">
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${getEventTypeColor(
              event.type
            )}`}
          >
            {event.type.replace("_", " ").toUpperCase()}
          </span>
        </div>
        {isUpcoming && (
          <div className="absolute top-4 right-4">
            <span className="px-3 py-1 bg-green-500 text-white rounded-full text-xs font-semibold animate-pulse">
              UPCOMING
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Date */}
        <div className="flex items-center text-primary-600 font-semibold mb-3">
          <FaCalendarAlt className="mr-2" />
          <span className="text-sm">{formatDate(event.date, "PPP")}</span>
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-primary-600 transition-colors">
          {event.title}
        </h3>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {event.description}
        </p>

        {/* Meta Info */}
        <div className="space-y-2 text-sm text-gray-500">
          {event.location && (
            <div className="flex items-center">
              <FaMapMarkerAlt className="mr-2 text-gray-400" />
              <span className="truncate">
                {event.location.isVirtual ? "Virtual Event" : event.location.venue}
              </span>
            </div>
          )}

          {event.registrationRequired && (
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <FaUsers className="mr-2 text-gray-400" />
                <span>
                  {attendeesCount}
                  {event.maxAttendees ? ` / ${event.maxAttendees}` : ""} attendees
                </span>
              </div>
              {isUpcoming && (
                <span className="text-primary-600 font-semibold">
                  Register →
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

