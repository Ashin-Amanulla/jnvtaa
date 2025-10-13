import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { batchesAPI } from "@/api";
import AlumniCard from "@/components/AlumniCard";
import LoadingSpinner from "@/components/LoadingSpinner";
import {
  FaArrowLeft,
  FaUsers,
  FaGraduationCap,
  FaCalendarAlt,
} from "react-icons/fa";

export default function BatchDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: batchData, isLoading } = useQuery({
    queryKey: ["batch", id],
    queryFn: () => batchesAPI.getById(id),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  const batch = batchData?.data?.batch;
  const alumni = batchData?.data?.alumni || [];

  if (!batch) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Batch not found
          </h2>
          <button
            onClick={() => navigate("/directory")}
            className="btn-primary mt-4"
          >
            Back to Directory
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back Button */}
      <div className="bg-white border-b border-gray-200">
        <div className="container-custom py-4">
          <button
            onClick={() => navigate("/directory")}
            className="flex items-center gap-2 text-gray-600 hover:text-primary-600 transition-colors"
          >
            <FaArrowLeft />
            <span>Back to Directory</span>
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-64 h-64 bg-white rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-80 h-80 bg-white rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }}></div>
        </div>

        <div className="container-custom relative z-10 animate-fade-in">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-4">
              {batch.name}
            </h1>
            <p className="text-xl text-primary-100 mb-8">
              Passout Year: {batch.passoutYear}
            </p>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto mt-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <FaUsers className="text-3xl mx-auto mb-2" />
                <div className="text-2xl font-bold">{alumni.length}</div>
                <div className="text-primary-100 text-sm">Alumni Registered</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <FaGraduationCap className="text-3xl mx-auto mb-2" />
                <div className="text-2xl font-bold">{batch.totalStudents}</div>
                <div className="text-primary-100 text-sm">Total Students</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <FaCalendarAlt className="text-3xl mx-auto mb-2" />
                <div className="text-2xl font-bold">
                  {batch.reunions?.length || 0}
                </div>
                <div className="text-primary-100 text-sm">Reunions Held</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Batch Photo */}
      {batch.groupPhoto && (
        <section className="py-12 bg-white">
          <div className="container-custom">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              Batch Group Photo
            </h2>
            <div className="max-w-4xl mx-auto">
              <img
                src={batch.groupPhoto}
                alt={`${batch.name} Group Photo`}
                className="w-full rounded-2xl shadow-2xl animate-slide-up"
              />
            </div>
          </div>
        </section>
      )}

      {/* Description */}
      {batch.description && (
        <section className="py-12 bg-gray-50">
          <div className="container-custom max-w-4xl">
            <div className="card p-8 animate-fade-in">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                About This Batch
              </h2>
              <p className="text-gray-700 leading-relaxed text-lg">
                {batch.description}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Reunions */}
      {batch.reunions && batch.reunions.length > 0 && (
        <section className="py-12 bg-white">
          <div className="container-custom">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              Past Reunions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {batch.reunions.map((reunion, index) => (
                <div
                  key={index}
                  className="card p-6 animate-slide-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="text-primary-600 font-semibold mb-2">
                    {new Date(reunion.date).getFullYear()}
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">
                    {reunion.location}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    {reunion.attendees} attendees
                  </p>
                  {reunion.description && (
                    <p className="text-sm text-gray-700">{reunion.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Alumni List */}
      <section className="py-12 bg-gray-50">
        <div className="container-custom">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Alumni from {batch.name} ({alumni.length})
          </h2>

          {alumni.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
              {alumni.map((user, index) => (
                <div
                  key={user._id}
                  className="animate-slide-up"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <AlumniCard user={user} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <FaUsers className="text-5xl mx-auto mb-4 text-gray-300" />
              <p>No registered alumni from this batch yet.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

