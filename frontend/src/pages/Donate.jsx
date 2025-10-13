import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { donationsAPI } from "@/api";
import { useAuthStore } from "@/store/auth";
import LoadingSpinner from "@/components/LoadingSpinner";
import { FaHeart, FaCheckCircle } from "react-icons/fa";
import { formatCurrency } from "@/utils/format";

export default function Donate() {
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const { isAuthenticated } = useAuthStore();

  const { data: campaignsData, isLoading } = useQuery({
    queryKey: ["donation-campaigns"],
    queryFn: () => donationsAPI.getAllCampaigns({ status: "active" }),
  });

  const { data: stats } = useQuery({
    queryKey: ["donation-stats"],
    queryFn: () => donationsAPI.getStats(),
  });

  const CampaignCard = ({ campaign }) => {
    const progress = Math.min((campaign.raised / campaign.goal) * 100, 100);

    return (
      <div className="card hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
        <img
          src={campaign.coverImage || "https://via.placeholder.com/400x200"}
          alt={campaign.title}
          className="w-full h-48 object-cover"
        />
        <div className="p-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="px-3 py-1 bg-primary-100 text-primary-700 text-xs font-semibold rounded-full">
              {campaign.category.toUpperCase()}
            </span>
            {campaign.status === "completed" && (
              <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full flex items-center gap-1">
                <FaCheckCircle />
                COMPLETED
              </span>
            )}
          </div>

          <h3 className="text-xl font-bold text-gray-900 mb-3">
            {campaign.title}
          </h3>
          <p className="text-gray-600 text-sm mb-4 line-clamp-3">
            {campaign.description}
          </p>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="font-semibold text-gray-900">
                {formatCurrency(campaign.raised)}
              </span>
              <span className="text-gray-500">
                of {formatCurrency(campaign.goal)}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-primary-500 to-primary-600 h-3 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {progress.toFixed(1)}% funded
            </p>
          </div>

          <button
            onClick={() => setSelectedCampaign(campaign)}
            className="w-full btn-primary"
          >
            Donate Now
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse" style={{ animationDelay: "2s" }}></div>
        </div>

        <div className="container-custom text-center relative z-10 animate-fade-in">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-sm animate-pulse">
            <FaHeart className="text-4xl" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-4">
            Support JNV Trivandrum
          </h1>
          <p className="text-xl text-primary-100 max-w-3xl mx-auto mb-8">
            Help us build a better future for current and future students
          </p>

          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto mt-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <div className="text-3xl font-bold mb-1">
                  {formatCurrency(stats.data.stats.totalRaised)}
                </div>
                <div className="text-primary-100 text-sm">Total Raised</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <div className="text-3xl font-bold mb-1">
                  {stats.data.stats.activeCampaigns}
                </div>
                <div className="text-primary-100 text-sm">Active Campaigns</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <div className="text-3xl font-bold mb-1">
                  {stats.data.stats.totalDonors}
                </div>
                <div className="text-primary-100 text-sm">Generous Donors</div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Impact Section */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Your Impact Matters
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Every contribution helps shape the future of education at JNV Trivandrum
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-8 bg-gradient-to-br from-blue-50 to-white rounded-xl">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                <span className="text-white text-2xl">🎓</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Student Scholarships
              </h3>
              <p className="text-gray-600">
                Support deserving students in their educational journey
              </p>
            </div>

            <div className="text-center p-8 bg-gradient-to-br from-green-50 to-white rounded-xl">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce" style={{ animationDelay: "0.2s" }}>
                <span className="text-white text-2xl">🏫</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Infrastructure Development
              </h3>
              <p className="text-gray-600">
                Upgrade facilities and create better learning environments
              </p>
            </div>

            <div className="text-center p-8 bg-gradient-to-br from-purple-50 to-white rounded-xl">
              <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce" style={{ animationDelay: "0.4s" }}>
                <span className="text-white text-2xl">📚</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Educational Resources
              </h3>
              <p className="text-gray-600">
                Provide books, technology, and learning materials
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Active Campaigns */}
      <section className="py-16 bg-gray-50">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Active Campaigns
            </h2>
            <p className="text-lg text-gray-600">
              Choose a cause that resonates with you
            </p>
          </div>

          {isLoading && <LoadingSpinner />}

          {!isLoading && campaignsData?.data?.campaigns?.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade-in">
              {campaignsData.data.campaigns.map((campaign, index) => (
                <div
                  key={campaign._id}
                  className="animate-slide-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CampaignCard campaign={campaign} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Donation Modal */}
      {selectedCampaign && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setSelectedCampaign(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-md w-full p-8 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Donate to {selectedCampaign.title}
            </h3>

            {!isAuthenticated ? (
              <div className="text-center py-8">
                <p className="text-gray-600 mb-6">
                  Please login to make a donation
                </p>
                <a href="/login" className="btn-primary">
                  Login to Continue
                </a>
              </div>
            ) : (
              <div>
                <p className="text-gray-600 mb-6">
                  In a production environment, this would integrate with a payment gateway like Razorpay or Stripe.
                </p>
                <div className="space-y-4">
                  <div>
                    <label className="label">Donation Amount (INR)</label>
                    <input
                      type="number"
                      placeholder="Enter amount"
                      className="input"
                      min="1"
                    />
                  </div>
                  <button className="w-full btn-primary">
                    Proceed to Payment
                  </button>
                </div>
              </div>
            )}

            <button
              onClick={() => setSelectedCampaign(null)}
              className="mt-4 w-full btn-secondary"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

