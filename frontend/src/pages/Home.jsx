import { Link } from "react-router-dom";
import {
  FaUsers,
  FaCalendarAlt,
  FaGraduationCap,
  FaHandHoldingHeart,
} from "react-icons/fa";
import { useQuery } from "@tanstack/react-query";
import { usersAPI, eventsAPI, newsAPI } from "@/api";
import FeaturedAlumni from "@/components/FeaturedAlumni";
import Testimonials from "@/components/Testimonials";
import StatsCounter from "@/components/StatsCounter";

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

  const statsData = [
    {
      icon: <FaUsers className="text-4xl" />,
      label: "Alumni Members",
      value: stats?.data?.stats?.totalUsers || "500+",
      color: "bg-blue-500",
    },
    {
      icon: <FaGraduationCap className="text-4xl" />,
      label: "Batches",
      value: "25+",
      color: "bg-green-500",
    },
    {
      icon: <FaCalendarAlt className="text-4xl" />,
      label: "Events Organized",
      value: "50+",
      color: "bg-purple-500",
    },
    {
      icon: <FaHandHoldingHeart className="text-4xl" />,
      label: "Alumni Worldwide",
      value: "15+ Countries",
      color: "bg-orange-500",
    },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white py-20">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto text-center animate-fade-in">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Welcome to JNVTAA
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-primary-100">
              Jawahar Navodaya Vidyalaya Thiruvananthapuram Alumni Association
            </p>
            <p className="text-lg mb-10 text-primary-50 max-w-2xl mx-auto">
              Reconnect with old friends, network with fellow alumni, give back
              to our alma mater, and create lasting memories together.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="btn bg-white text-primary-600 hover:bg-gray-100 text-lg px-8 py-3"
              >
                Join JNVTAA
              </Link>
              <Link
                to="/directory"
                className="btn bg-primary-500 text-white hover:bg-primary-400 text-lg px-8 py-3"
              >
                Explore Directory
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white">
        <div className="container-custom">
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Our Growing Community
            </h2>
            <p className="text-lg text-gray-600">
              Numbers that showcase our vibrant network
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <StatsCounter
              end={stats?.data?.stats?.totalUsers || 500}
              label="Alumni Members"
              icon={<FaUsers className="text-4xl" />}
              color="bg-blue-500"
            />
            <StatsCounter
              end={25}
              label="Batches"
              icon={<FaGraduationCap className="text-4xl" />}
              color="bg-green-500"
            />
            <StatsCounter
              end={50}
              label="Events Organized"
              icon={<FaCalendarAlt className="text-4xl" />}
              color="bg-purple-500"
            />
            <StatsCounter
              end={15}
              label="Countries Worldwide"
              icon={<FaHandHoldingHeart className="text-4xl" />}
              color="bg-orange-500"
            />
          </div>
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="py-16 bg-gray-50">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Upcoming Events
            </h2>
            <p className="text-lg text-gray-600">
              Join us for exciting alumni gatherings and reunions
            </p>
          </div>

          {upcomingEvents?.data?.events?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {upcomingEvents.data.events.slice(0, 3).map((event) => (
                <Link
                  key={event._id}
                  to={`/events/${event._id}`}
                  className="card hover:shadow-lg transition-shadow"
                >
                  <img
                    src={
                      event.coverImage || "https://via.placeholder.com/400x200"
                    }
                    alt={event.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-6">
                    <div className="text-sm text-primary-600 font-semibold mb-2">
                      {new Date(event.date).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {event.title}
                    </h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {event.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">
                        {event.location.city}
                      </span>
                      <span className="text-primary-600 font-semibold">
                        Learn More →
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-12">
              <p>No upcoming events at the moment. Check back soon!</p>
            </div>
          )}

          <div className="text-center mt-10">
            <Link to="/events" className="btn-primary">
              View All Events
            </Link>
          </div>
        </div>
      </section>

      {/* Latest News */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Latest News & Updates
            </h2>
            <p className="text-lg text-gray-600">
              Stay updated with alumni achievements and announcements
            </p>
          </div>

          {latestNews?.data?.news?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {latestNews.data.news.slice(0, 3).map((article) => (
                <Link
                  key={article._id}
                  to={`/news/${article._id}`}
                  className="card hover:shadow-lg transition-shadow"
                >
                  <img
                    src={
                      article.coverImage ||
                      "https://via.placeholder.com/400x200"
                    }
                    alt={article.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-3 py-1 bg-primary-100 text-primary-700 text-xs font-semibold rounded-full">
                        {article.category}
                      </span>
                      <span className="text-sm text-gray-500">
                        {new Date(article.publishedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                      {article.title}
                    </h3>
                    <p className="text-gray-600 line-clamp-2">
                      {article.excerpt}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-12">
              <p>No news articles yet. Check back soon!</p>
            </div>
          )}

          <div className="text-center mt-10">
            <Link to="/news" className="btn-primary">
              View All News
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Alumni */}
      <FeaturedAlumni />

      {/* Testimonials */}
      <Testimonials />

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-primary-700 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')]"></div>
        </div>
        
        <div className="container-custom text-center relative z-10 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Ready to Reconnect?
          </h2>
          <p className="text-xl mb-8 text-primary-100 max-w-2xl mx-auto">
            Join our vibrant alumni community and be part of something special
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="btn bg-white text-primary-600 hover:bg-gray-100 text-lg px-8 py-3 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all"
            >
              Become a Member
            </Link>
            <Link
              to="/donate"
              className="btn bg-primary-500 text-white hover:bg-primary-400 text-lg px-8 py-3 border-2 border-white/30 hover:border-white/50 transition-all"
            >
              Support Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
