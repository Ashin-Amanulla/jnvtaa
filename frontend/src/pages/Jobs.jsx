import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { jobsAPI } from "@/api";
import LoadingSpinner from "@/components/LoadingSpinner";
import {
  FaBriefcase,
  FaMapMarkerAlt,
  FaClock,
  FaMoneyBillWave,
  FaBuilding,
} from "react-icons/fa";
import { formatCurrency, formatTimeAgo } from "@/utils/format";

export default function Jobs() {
  const [filters, setFilters] = useState({
    employmentType: "",
    experienceLevel: "",
    page: 1,
  });

  const { data: jobsData, isLoading } = useQuery({
    queryKey: ["jobs", filters],
    queryFn: () => jobsAPI.getAll(filters),
  });

  const employmentTypes = [
    { value: "", label: "All Types" },
    { value: "full-time", label: "Full Time" },
    { value: "part-time", label: "Part Time" },
    { value: "contract", label: "Contract" },
    { value: "internship", label: "Internship" },
    { value: "freelance", label: "Freelance" },
  ];

  const experienceLevels = [
    { value: "", label: "All Levels" },
    { value: "entry", label: "Entry Level" },
    { value: "mid", label: "Mid Level" },
    { value: "senior", label: "Senior Level" },
    { value: "executive", label: "Executive" },
  ];

  const JobCard = ({ job }) => (
    <div className="card hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
              {job.title}
            </h3>
            <div className="flex items-center text-gray-600 mb-2">
              <FaBuilding className="mr-2 text-gray-400" />
              <span className="font-medium">{job.company}</span>
            </div>
          </div>
          <div className="bg-primary-100 text-primary-700 px-3 py-1 rounded-lg text-xs font-semibold">
            {job.employmentType.replace("-", " ").toUpperCase()}
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {job.description}
        </p>

        {/* Meta Info */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <FaMapMarkerAlt className="mr-2 text-gray-400" />
            <span>
              {job.location.isRemote
                ? "Remote"
                : `${job.location.city}, ${job.location.country}`}
            </span>
          </div>

          {job.salary && (
            <div className="flex items-center text-sm text-gray-600">
              <FaMoneyBillWave className="mr-2 text-gray-400" />
              <span>
                {formatCurrency(job.salary.min)} - {formatCurrency(job.salary.max)}
                {job.salary.isNegotiable && " (Negotiable)"}
              </span>
            </div>
          )}

          <div className="flex items-center text-sm text-gray-500">
            <FaClock className="mr-2 text-gray-400" />
            <span>Posted {formatTimeAgo(job.createdAt)}</span>
          </div>
        </div>

        {/* Skills */}
        {job.skills && job.skills.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {job.skills.slice(0, 4).map((skill, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
              >
                {skill}
              </span>
            ))}
            {job.skills.length > 4 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                +{job.skills.length - 4} more
              </span>
            )}
          </div>
        )}

        {/* CTA */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <span className="text-sm text-gray-500">
            {job.applicationsCount || 0} applicants
          </span>
          <span className="text-primary-600 font-semibold group-hover:gap-2 flex items-center transition-all">
            View Details →
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-white rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-white rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }}></div>
        </div>

        <div className="container-custom text-center relative z-10 animate-fade-in">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
            <FaBriefcase className="text-4xl" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-4">Job Board</h1>
          <p className="text-xl text-primary-100 max-w-3xl mx-auto">
            Discover opportunities posted by fellow alumni
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="py-8 bg-white border-b border-gray-200">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <select
              value={filters.employmentType}
              onChange={(e) =>
                setFilters({ ...filters, employmentType: e.target.value, page: 1 })
              }
              className="input max-w-xs"
            >
              {employmentTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>

            <select
              value={filters.experienceLevel}
              onChange={(e) =>
                setFilters({ ...filters, experienceLevel: e.target.value, page: 1 })
              }
              className="input max-w-xs"
            >
              {experienceLevels.map((level) => (
                <option key={level.value} value={level.value}>
                  {level.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Jobs Grid */}
      <section className="py-12">
        <div className="container-custom">
          {isLoading && <LoadingSpinner />}

          {!isLoading && jobsData?.data?.jobs?.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
              {jobsData.data.jobs.map((job, index) => (
                <div
                  key={job._id}
                  className="animate-slide-up"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <JobCard job={job} />
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && jobsData?.data?.jobs?.length === 0 && (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaBriefcase className="text-4xl text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                No jobs found
              </h3>
              <p className="text-gray-600">
                Try adjusting your filters or check back later
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

