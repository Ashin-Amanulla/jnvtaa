import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { jobsAPI } from "@/api";
import LoadingSpinner from "@/components/LoadingSpinner";
import {
  Briefcase,
  MapPin,
  Clock,
  IndianRupee,
  Building2,
} from "lucide-react";
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
    <div className="relative flex flex-col overflow-hidden rounded-wobblyMd border-[3px] border-border bg-white shadow-sketch transition-transform duration-100 hover:-rotate-1 hover:shadow-sketchLg">
      <div className="flex flex-grow flex-col p-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-start justify-between mb-8 gap-4">
          <div className="flex-1">
            <h3 className="mb-3 font-display text-2xl font-bold md:text-3xl">
              {job.title}
            </h3>
            <div className="flex items-center font-sans text-lg text-foreground">
              <Building2 className="mr-2" size={18} strokeWidth={2.5} />
              <span className="font-bold">{job.company}</span>
            </div>
          </div>
          <div className="self-start rounded-wobblySm border-2 border-border bg-foreground px-3 py-1 font-sans text-sm text-background shadow-sketchSm">
            {job.employmentType.replace("-", " ")}
          </div>
        </div>

        {/* Description */}
        <p className="mb-8 line-clamp-3 font-sans text-lg text-muted-foreground">
          {job.description}
        </p>

        <div className="mb-8 mt-auto space-y-3 border-t-2 border-dashed border-border pt-6">
          <div className="flex items-center font-sans text-base">
            <MapPin className="mr-3 text-muted-foreground" size={18} strokeWidth={2.5} />
            <span>
              {job.location.isRemote
                ? "Remote"
                : `${job.location.city}, ${job.location.country}`}
            </span>
          </div>

          {job.salary && (
            <div className="flex items-center font-sans text-base">
              <IndianRupee className="mr-3 text-muted-foreground" size={18} strokeWidth={2.5} />
              <span>
                {formatCurrency(job.salary.min)} - {formatCurrency(job.salary.max)}
                {job.salary.isNegotiable && " (Neg.)"}
              </span>
            </div>
          )}

          <div className="flex items-center font-sans text-base text-muted-foreground">
            <Clock className="mr-3" size={18} strokeWidth={2.5} />
            <span>Posted {formatTimeAgo(job.createdAt)}</span>
          </div>
        </div>

        {job.skills && job.skills.length > 0 && (
          <div className="mb-8 flex flex-wrap gap-2">
            {job.skills.slice(0, 4).map((skill, index) => (
              <span
                key={index}
                className="rounded-wobblySm border-2 border-dashed border-border px-2 py-0.5 font-sans text-sm text-muted-foreground"
              >
                {skill}
              </span>
            ))}
            {job.skills.length > 4 && (
              <span className="rounded-wobblySm border-2 border-border px-2 py-0.5 font-sans text-sm">
                +{job.skills.length - 4}
              </span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between border-t-2 border-border pt-6 font-sans">
          <span className="text-sm text-muted-foreground">
            {job.applicationsCount || 0} applicants
          </span>
          <span className="text-pen underline decoration-wavy decoration-2">
            Details →
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative border-b-[3px] border-dashed border-border py-16 md:py-24">
        <div className="container-custom">
          <p className="mb-3 inline-block rotate-1 rounded-wobblySm border-2 border-border bg-postit px-3 py-1 font-sans text-lg shadow-sketchSm">
            Alumni opportunities
          </p>
          <h1 className="font-display text-5xl font-bold uppercase md:text-6xl lg:text-7xl">
            Job board
          </h1>
          <div className="mt-4 h-1 max-w-sm border-b-4 border-dashed border-foreground" />
          <p className="mt-6 max-w-2xl font-sans text-xl text-muted-foreground md:text-2xl">
            Roles shared by people who survived the same physics teacher.
          </p>
        </div>
      </section>

      <section className="sticky-below-nav py-6">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row gap-6">
            <select
              value={filters.employmentType}
              onChange={(e) =>
                setFilters({ ...filters, employmentType: e.target.value, page: 1 })
              }
              className="input md:max-w-xs border-[2px]"
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
              className="input md:max-w-xs border-[2px]"
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
      <section className="py-20">
        <div className="container-custom">
          {isLoading && <LoadingSpinner />}

          {!isLoading && jobsData?.data?.jobs?.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {jobsData.data.jobs.map((job) => (
                <JobCard key={job._id} job={job} />
              ))}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && jobsData?.data?.jobs?.length === 0 && (
            <div className="rounded-wobblyMd border-[3px] border-dashed border-border py-24 text-center shadow-sketchSm">
              <Briefcase className="mx-auto mb-6 hidden text-muted-foreground md:block" size={64} strokeWidth={2} />
              <h3 className="mb-4 font-display text-3xl font-bold md:text-4xl">
                No jobs right now
              </h3>
              <p className="mx-auto max-w-md font-sans text-lg text-muted-foreground">
                Try adjusting your filters or check back later
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
