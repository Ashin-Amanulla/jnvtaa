import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  MapPin,
  Building2,
  Clock,
  IndianRupee,
  CheckCircle2,
} from "lucide-react";
import { jobsAPI } from "@/api";
import { useAuthStore } from "@/store/auth";
import LoadingSpinner from "@/components/LoadingSpinner";
import { SketchCard } from "@/components/SketchCard";
import { formatCurrency, formatTimeAgo } from "@/utils/format";

export default function JobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAuthenticated, user } = useAuthStore();
  const [coverLetter, setCoverLetter] = useState("");
  const [applyError, setApplyError] = useState("");
  const [applySuccess, setApplySuccess] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["job", id],
    queryFn: () => jobsAPI.getById(id),
  });

  const applyMutation = useMutation({
    mutationFn: () => jobsAPI.apply(id, { coverLetter }),
    onSuccess: () => {
      setApplySuccess(true);
      setApplyError("");
      queryClient.invalidateQueries(["job", id]);
    },
    onError: (err) => {
      setApplyError(err.message);
    },
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <LoadingSpinner />
      </div>
    );
  }

  const job = data?.data?.job;

  if (!job) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-6">
        <SketchCard className="p-10 text-center">
          <h2 className="font-display text-4xl font-bold">Job not found</h2>
          <button onClick={() => navigate("/jobs")} className="btn-primary mt-8">
            Back to jobs
          </button>
        </SketchCard>
      </div>
    );
  }

  const hasApplied =
    job.applications?.some?.((id) => String(id) === String(user?._id)) ||
    applySuccess;

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="sticky-below-nav">
        <div className="container-custom py-4">
          <Link
            to="/jobs"
            className="inline-flex items-center gap-2 font-sans text-lg text-brand font-medium focus-ring"
          >
            <ArrowLeft size={18} strokeWidth={2} />
            Back to jobs
          </Link>
        </div>
      </div>

      <section className="py-12 md:py-16">
        <div className="container-custom max-w-4xl">
          <SketchCard className="p-8 md:p-12">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="font-display text-4xl font-bold md:text-5xl">
                  {job.title}
                </h1>
                <div className="mt-3 flex items-center gap-2 font-sans text-xl">
                  <Building2 size={22} strokeWidth={2} />
                  {job.company}
                </div>
              </div>
              <span className="rounded-xl border border-border bg-foreground px-4 py-1 font-sans text-base text-background">
                {job.employmentType?.replace("-", "")}
              </span>
            </div>

            <div className="mt-8 space-y-3 border-t border-border pt-8 font-sans text-lg">
              <div className="flex items-center gap-3">
                <MapPin size={20} strokeWidth={2} className="text-muted-foreground" />
                {job.location?.isRemote
                  ? "Remote"
                  : `${job.location?.city || ""}, ${job.location?.country || ""}`}
              </div>
              {job.salary && (
                <div className="flex items-center gap-3">
                  <IndianRupee size={20} strokeWidth={2} className="text-muted-foreground" />
                  {formatCurrency(job.salary.min)} – {formatCurrency(job.salary.max)}
                </div>
              )}
              <div className="flex items-center gap-3 text-muted-foreground">
                <Clock size={20} strokeWidth={2} />
                Posted {formatTimeAgo(job.createdAt)}
              </div>
            </div>

            <div className="mt-10">
              <h2 className="font-display text-2xl font-bold">Description</h2>
              <p className="mt-4 whitespace-pre-wrap font-sans text-lg leading-relaxed text-foreground/90">
                {job.description}
              </p>
            </div>

            {job.skills?.length > 0 && (
              <div className="mt-10 flex flex-wrap gap-2">
                {job.skills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-xl border border-border px-3 py-1 font-sans text-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            )}
          </SketchCard>

          <SketchCard decoration="tack" className="mt-10 p-8 md:p-10">
            <h2 className="font-display text-3xl font-bold">Apply</h2>
            {!isAuthenticated ? (
              <p className="mt-4 font-sans text-lg text-muted-foreground">
                <Link to="/login" className="text-brand font-medium">
                  Sign in
                </Link>{""}
                to apply for this role.
              </p>
            ) : hasApplied ? (
              <div className="mt-6 flex items-center gap-3 rounded-xl border-2 border-house-green bg-white p-4 font-sans text-lg">
                <CheckCircle2 className="text-house-green" size={24} />
                You&apos;ve applied to this job.
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  applyMutation.mutate();
                }}
                className="mt-6 space-y-6"
              >
                {applyError && (
                  <div className="rounded-xl border-[3px] border-accent p-4 font-sans text-lg" role="alert">
                    {applyError}
                  </div>
                )}
                <div>
                  <label htmlFor="coverLetter" className="label">
                    Cover letter (optional)
                  </label>
                  <textarea
                    id="coverLetter"
                    rows={5}
                    className="input resize-none"
                    placeholder="Why you're a great fit…"
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                  />
                </div>
                <button
                  type="submit"
                  disabled={applyMutation.isPending}
                  className="btn-primary w-full justify-center disabled:opacity-50"
                >
                  {applyMutation.isPending ? "Submitting…" : "Submit application →"}
                </button>
              </form>
            )}
          </SketchCard>
        </div>
      </section>
    </div>
  );
}
