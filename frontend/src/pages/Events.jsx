import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { eventsAPI } from "@/api";
import EventCard from "@/components/EventCard";
import LoadingSpinner from "@/components/LoadingSpinner";
import { FaCalendar } from "react-icons/fa";

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
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }}></div>
        </div>
        
        <div className="container-custom text-center relative z-10 animate-fade-in">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
            <FaCalendar className="text-4xl" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-4">Alumni Events</h1>
          <p className="text-xl text-primary-100 max-w-3xl mx-auto">
            Join us for reunions, networking events, and special gatherings
          </p>
        </div>
      </section>

      {/* Filter Tabs */}
      <section className="py-8 bg-white border-b border-gray-200 sticky top-16 z-40 shadow-sm">
        <div className="container-custom">
          <div className="flex flex-wrap gap-2 justify-center">
            {filterOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setFilter(option.value)}
                className={`px-6 py-3 rounded-lg font-medium transition-all ${
                  filter === option.value
                    ? "bg-primary-600 text-white shadow-lg scale-105"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Events Grid */}
      <section className="py-12">
        <div className="container-custom">
          {isLoading && <LoadingSpinner />}

          {!isLoading && eventsData?.data?.events?.length > 0 && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade-in">
                {eventsData.data.events.map((event, index) => (
                  <div
                    key={event._id}
                    className="animate-slide-up"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <EventCard event={event} />
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {eventsData.pagination && eventsData.pagination.totalPages > 1 && (
                <div className="mt-12 flex justify-center gap-2">
                  <button className="btn-outline">Previous</button>
                  <button className="btn-primary">Next</button>
                </div>
              )}
            </>
          )}

          {/* Empty State */}
          {!isLoading && eventsData?.data?.events?.length === 0 && (
            <div className="text-center py-16 animate-fade-in">
              <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaCalendar className="text-4xl text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                No events found
              </h3>
              <p className="text-gray-600">
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
      <section className="py-16 bg-gradient-to-r from-primary-600 to-primary-700 text-white">
        <div className="container-custom text-center">
          <h2 className="text-3xl font-bold mb-4">Want to Organize an Event?</h2>
          <p className="text-lg text-primary-100 mb-6 max-w-2xl mx-auto">
            Have an idea for an alumni gathering? Get in touch with us to organize your event!
          </p>
          <a href="/contact" className="btn bg-white text-primary-600 hover:bg-gray-100">
            Contact Us
          </a>
        </div>
      </section>
    </div>
  );
}

