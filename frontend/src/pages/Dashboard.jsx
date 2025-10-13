import { useAuthStore } from "@/store/auth";
import { Link } from "react-router-dom";
import { FaUser, FaCalendar, FaBriefcase, FaHeart } from "react-icons/fa";

export default function Dashboard() {
  const { user } = useAuthStore();

  const quickLinks = [
    {
      title: "My Profile",
      description: "Update your information",
      icon: <FaUser className="text-2xl" />,
      link: "/dashboard/profile",
      color: "bg-blue-500",
    },
    {
      title: "My Events",
      description: "Events you registered for",
      icon: <FaCalendar className="text-2xl" />,
      link: "/dashboard/events",
      color: "bg-green-500",
    },
    {
      title: "My Jobs",
      description: "Jobs posted & applied",
      icon: <FaBriefcase className="text-2xl" />,
      link: "/dashboard/jobs",
      color: "bg-purple-500",
    },
    {
      title: "My Donations",
      description: "Your contributions",
      icon: <FaHeart className="text-2xl" />,
      link: "/dashboard/donations",
      color: "bg-red-500",
    },
  ];

  return (
    <div className="min-h-[80vh] bg-gray-50 py-12">
      <div className="container-custom">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.firstName}!
          </h1>
          <p className="text-gray-600">
            Here's what's happening in your alumni network
          </p>
        </div>

        {/* Profile Completion */}
        {user && user.profileCompleteness < 100 && (
          <div className="card p-6 mb-8 bg-blue-50 border-blue-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Complete Your Profile
                </h3>
                <p className="text-sm text-gray-600">
                  Your profile is {user.profileCompleteness}% complete
                </p>
              </div>
              <Link to="/dashboard/profile" className="btn-primary">
                Complete Profile
              </Link>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${user.profileCompleteness}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {quickLinks.map((item, index) => (
            <Link
              key={index}
              to={item.link}
              className="card p-6 hover:shadow-lg transition-shadow"
            >
              <div
                className={`${item.color} w-14 h-14 rounded-lg flex items-center justify-center text-white mb-4`}
              >
                {item.icon}
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">
                {item.title}
              </h3>
              <p className="text-sm text-gray-600">{item.description}</p>
            </Link>
          ))}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="card p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Batch</h3>
            <p className="text-2xl font-bold text-gray-900">
              {user?.batch?.year || "Not set"}
            </p>
          </div>

          <div className="card p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">
              Current Location
            </h3>
            <p className="text-2xl font-bold text-gray-900">
              {user?.currentCity || "Not set"}
            </p>
          </div>

          <div className="card p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">
              Member Since
            </h3>
            <p className="text-2xl font-bold text-gray-900">
              {user?.createdAt ? new Date(user.createdAt).getFullYear() : "N/A"}
            </p>
          </div>
        </div>

        {/* Recent Activity or Suggestions */}
        <div className="card p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            Suggested Actions
          </h3>
          <ul className="space-y-3">
            <li className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <span className="text-gray-700">
                Update your professional information
              </span>
              <Link
                to="/dashboard/profile"
                className="text-primary-600 font-semibold hover:text-primary-700"
              >
                Update →
              </Link>
            </li>
            <li className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <span className="text-gray-700">
                Browse upcoming alumni events
              </span>
              <Link
                to="/events"
                className="text-primary-600 font-semibold hover:text-primary-700"
              >
                Browse →
              </Link>
            </li>
            <li className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <span className="text-gray-700">Connect with batchmates</span>
              <Link
                to="/directory"
                className="text-primary-600 font-semibold hover:text-primary-700"
              >
                Explore →
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
