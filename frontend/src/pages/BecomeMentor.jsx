import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { mentorshipAPI } from "@/api";
import { SketchCard } from "@/components/SketchCard";

const DOMAIN_OPTIONS = [
  "Technology",
  "Medicine",
  "Civil Services",
  "Business",
  "Academia",
  "Arts",
  "Other",
];

export default function BecomeMentor() {
  const [formData, setFormData] = useState({
    bio: "",
    availability: "open",
    domains: [],
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const mutation = useMutation({
    mutationFn: (data) => mentorshipAPI.becomeMentor(data),
    onSuccess: () => {
      setSuccess(true);
      setError("");
    },
    onError: (err) => setError(err.message),
  });

  const toggleDomain = (domain) => {
    setFormData((prev) => ({
      ...prev,
      domains: prev.domains.includes(domain)
        ? prev.domains.filter((d) => d !== domain)
        : [...prev.domains, domain],
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  return (
    <div className="min-h-screen bg-background py-16 md:py-24">
      <div className="container-custom max-w-2xl">
        <Link
          to="/mentorship"
          className="font-sans text-lg text-brand font-medium"
        >
          ← Back to mentorship
        </Link>
        <h1 className="mt-6 font-display text-5xl font-bold md:text-6xl">
          Become a mentor
        </h1>
        <div className="mt-4 h-1 max-w-sm border-b-2 border-brand" />
        <p className="mt-6 font-sans text-xl text-muted-foreground">
          Share your experience with current students and younger alumni.
        </p>

        <SketchCard decoration="tape" className="mt-12 p-8 md:p-10">
          {success ? (
            <div className="space-y-6 font-sans text-lg">
              <p>
                Your mentor profile was submitted for approval. We&apos;ll notify you
                once it&apos;s live in the directory.
              </p>
              <Link to="/dashboard/mentorship" className="btn-primary inline-flex">
                View my mentorship →
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              {error && (
                <div className="rounded-xl border-[3px] border-accent p-4 font-sans text-lg" role="alert">
                  {error}
                </div>
              )}
              <div>
                <label className="label">Domains you can mentor in</label>
                <div className="mt-3 flex flex-wrap gap-2">
                  {DOMAIN_OPTIONS.map((domain) => (
                    <button
                      key={domain}
                      type="button"
                      onClick={() => toggleDomain(domain)}
                      className={`rounded-xl border-2 px-3 py-1.5 font-sans text-base transition-colors ${
                        formData.domains.includes(domain)
                          ? "border-border bg-brand text-white"
                          : "border-border bg-white hover:border-solid"
                      }`}
                    >
                      {domain}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label htmlFor="bio" className="label">
                  Mentor bio
                </label>
                <textarea
                  id="bio"
                  rows={5}
                  className="input resize-none"
                  placeholder="What can you help with? What's your background? "
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                />
              </div>
              <div>
                <label htmlFor="availability" className="label">
                  Availability
                </label>
                <select
                  id="availability"
                  className="input"
                  value={formData.availability}
                  onChange={(e) =>
                    setFormData({ ...formData, availability: e.target.value })
                  }
                >
                  <option value="open">Open to new mentees</option>
                  <option value="limited">Limited availability</option>
                  <option value="unavailable">Currently unavailable</option>
                </select>
              </div>
              <button
                type="submit"
                disabled={mutation.isPending}
                className="btn-primary w-full justify-center disabled:opacity-50"
              >
                {mutation.isPending ? "Submitting…" : "Submit for approval →"}
              </button>
            </form>
          )}
        </SketchCard>
      </div>
    </div>
  );
}
