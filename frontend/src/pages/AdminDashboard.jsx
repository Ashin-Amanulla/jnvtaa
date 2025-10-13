import { useQuery } from "@tanstack/react-query";
import { usersAPI, eventsAPI, donationsAPI } from "@/api";
import LoadingSpinner from "@/components/LoadingSpinner";
import {
  FaUsers,
  FaUserCheck,
  FaUserClock,
  FaCalendarAlt,
  FaNewspaper,
  FaImages,
  FaMoneyBillWave,
  FaBriefcase,
} from "react-icons/fa";
import { formatCurrency } from "@/utils/format";

export default function AdminDashboard() {
  const { data: userStats } = useQuery({
    queryKey: ["admin-user-stats"],
    queryFn: () => usersAPI.getUserStats(),
  });

  const { data: donationStats } = useQuery({
    queryKey: ["admin-donation-stats"],
    queryFn: () => donationsAPI.getStats(),
  });

  const { data: unverifiedUsers } = useQuery({
    queryKey: ["unverified-users"],
    queryFn: () => usersAPI.getUnverifiedUsers({ limit: 5 }),
  });

  const quickStats = [
    {
      label: "Total Alumni",
      value: userStats?.data?.stats?.totalUsers || 0,
      icon: <FaUsers className="text-3xl" />,
      color: "bg-blue-500",
    },
    {
      label: "Verified Alumni",
      value: userStats?.data?.stats?.verifiedUsers || 0,
      icon: <FaUserCheck className="text-3xl" />,
      color: "bg-green-500",
    },
    {
      label: "Pending Verification",
      value: userStats?.data?.stats?.unverifiedUsers || 0,
      icon: <FaUserClock className="text-3xl" />,
      color: "bg-orange-500",
    },
    {
      label: "Total Donations",
      value: formatCurrency(donationStats?.data?.stats?.totalRaised || 0),
      icon: <FaMoneyBillWave className="text-3xl" />,
      color: "bg-purple-500",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container-custom">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-600">
            Manage the JNVTAA platform and community
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {quickStats.map((stat, index) => (
            <div
              key={index}
              className="card p-6 animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div
                className={`${stat.color} w-14 h-14 rounded-lg flex items-center justify-center text-white mb-4`}
              >
                {stat.icon}
              </div>
              <div className="text-sm text-gray-600 mb-1">{stat.label}</div>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Pending Verifications */}
        {unverifiedUsers?.data?.users && unverifiedUsers.data.users.length > 0 && (
          <div className="card p-8 mb-12 animate-slide-up" style={{ animationDelay: "0.4s" }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Pending User Verifications
              </h2>
              <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-semibold">
                {unverifiedUsers.pagination.total} Pending
              </span>
            </div>

            <div className="space-y-4">
              {unverifiedUsers.data.users.map((user) => (
                <div
                  key={user._id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={
                        user.avatar ||
                        `https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}`
                      }
                      alt={user.firstName}
                      className="w-12 h-12 rounded-full"
                    />
                    <div>
                      <p className="font-semibold text-gray-900">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-sm text-gray-600">{user.email}</p>
                      <p className="text-xs text-gray-500">
                        Batch of {user.batch?.year}
                      </p>
                    </div>
                  </div>
                  <button className="btn-primary text-sm">Verify</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Management Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: "User Management",
              description: "Manage alumni accounts",
              icon: <FaUsers className="text-2xl" />,
              color: "bg-blue-500",
            },
            {
              title: "Events Management",
              description: "Create and manage events",
              icon: <FaCalendarAlt className="text-2xl" />,
              color: "bg-green-500",
            },
            {
              title: "Content Moderation",
              description: "Approve gallery & comments",
              icon: <FaImages className="text-2xl" />,
              color: "bg-purple-500",
            },
            {
              title: "Analytics",
              description: "View detailed insights",
              icon: <FaNewspaper className="text-2xl" />,
              color: "bg-orange-500",
            },
          ].map((item, index) => (
            <div
              key={index}
              className="card p-6 hover:shadow-lg transition-all cursor-pointer group animate-slide-up"
              style={{ animationDelay: `${0.5 + index * 0.1}s` }}
            >
              <div
                className={`${item.color} w-14 h-14 rounded-lg flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}
              >
                {item.icon}
              </div>
              <h3 className="font-bold text-gray-900 mb-1 group-hover:text-primary-600 transition-colors">
                {item.title}
              </h3>
              <p className="text-sm text-gray-600">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

