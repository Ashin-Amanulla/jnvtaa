import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { GraduationCap, MessageCircle, UserPlus } from "lucide-react";
import { mentorshipAPI } from "@/api";
import { useAuthStore } from "@/store/auth";
import LoadingSpinner from "@/components/LoadingSpinner";
import { SketchCard } from "@/components/SketchCard";

export default function Mentorship() {
  const { isAuthenticated } = useAuthStore();
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [message, setMessage] = useState("");
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["mentors"],
    queryFn: () => mentorshipAPI.getMentors(),
  });

  const requestMutation = useMutation({
    mutationFn: ({ mentorId, message: msg }) =>
      mentorshipAPI.createRequest(mentorId, { message: msg }),
    onSuccess: () => {
      setFormSuccess(true);
      setFormError("");
      setMessage("");
    },
    onError: (err) => setFormError(err.message),
  });

  const mentors = data?.data?.mentors || [];

  const handleRequest = (e) => {
    e.preventDefault();
    if (!selectedMentor) return;
    requestMutation.mutate({ mentorId: selectedMentor.user._id, message });
  };

  return (
    <div className="min-h-screen bg-background">
      <section className="border-b border-border py-16 md:py-24">
        <div className="container-custom">
          <p className="mb-3 inline-block rotate-1 rounded-xl border-2 border-border bg-house-yellow-soft px-3 py-1 font-sans text-lg shadow-card">
            Pay it forward
          </p>
          <h1 className="font-display text-5xl font-bold uppercase md:text-6xl lg:text-7xl">
            Mentorship
          </h1>
          <div className="mt-4 h-1 max-w-sm border-b-2 border-brand" />
          <p className="mt-6 max-w-2xl font-sans text-xl text-muted-foreground md:text-2xl">
            Alumni mentors offering guidance across careers, exams, and life after JNV.
          </p>
          {isAuthenticated && (
            <Link to="/mentorship/become" className="btn-secondary mt-8 inline-flex items-center gap-2">
              <UserPlus size={20} />
              Become a mentor
            </Link>
          )}
        </div>
      </section>

      <section className="py-20">
        <div className="container-custom">
          {isLoading && <LoadingSpinner />}

          {!isLoading && mentors.length > 0 && (
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {mentors.map((mentor) => (
                <SketchCard key={mentor._id} tilt className="flex h-full flex-col p-6 md:p-8">
                  <div className="flex items-start gap-4">
                    <img
                      src={
                        mentor.user?.avatar ||
                        `https://ui-avatars.com/api/?name=${mentor.user?.firstName}+${mentor.user?.lastName}&background=2d5da1&color=fff`
                      }
                      alt=""
                      className="h-16 w-16 border border-border object-cover shadow-card"
                      style={{ borderRadius: "9999px", }}
                    />
                    <div>
                      <h3 className="font-display text-2xl font-bold">
                        {mentor.user?.firstName} {mentor.user?.lastName}
                      </h3>
                      <p className="font-sans text-base text-brand">
                        {mentor.user?.profession}
                        {mentor.user?.company ? ` · ${mentor.user.company}` : ""}
                      </p>
                    </div>
                  </div>
                  {mentor.bio && (
                    <p className="mt-4 line-clamp-3 flex-grow font-sans text-base text-muted-foreground">
                      {mentor.bio}
                    </p>
                  )}
                  {mentor.domains?.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {mentor.domains.map((d) => (
                        <span
                          key={d}
                          className="rounded-xl border-2 border-border px-2 py-0.5 font-sans text-sm"
                        >
                          {d}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="mt-6 flex flex-wrap gap-3">
                    <Link
                      to={`/dashboard/alumni/${mentor.user?._id}`}
                      className="btn-outline text-sm"
                    >
                      View profile
                    </Link>
                    {isAuthenticated && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedMentor(mentor);
                          setFormSuccess(false);
                          setFormError("");
                        }}
                        className="btn-primary inline-flex items-center gap-2 text-sm"
                      >
                        <MessageCircle size={16} />
                        Request mentorship
                      </button>
                    )}
                  </div>
                </SketchCard>
              ))}
            </div>
          )}

          {!isLoading && mentors.length === 0 && (
            <div className="rounded-2xl border border-border py-24 text-center">
              <GraduationCap className="mx-auto mb-6 text-muted-foreground" size={64} />
              <h3 className="font-display text-3xl font-bold">No mentors listed yet</h3>
              <p className="mx-auto mt-4 max-w-md font-sans text-lg text-muted-foreground">
                Be the first to volunteer as a mentor.
              </p>
              {isAuthenticated && (
                <Link to="/mentorship/become" className="btn-primary mt-8 inline-flex">
                  Become a mentor →
                </Link>
              )}
            </div>
          )}
        </div>
      </section>

      {selectedMentor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <SketchCard className="w-full max-w-lg p-8">
            <h2 className="font-display text-2xl font-bold">
              Request mentorship from {selectedMentor.user?.firstName}
            </h2>
            {formSuccess ? (
              <div className="mt-6 space-y-4 font-sans text-lg">
                <p>Your request was sent! They&apos;ll respond when they can.</p>
                <button
                  type="button"
                  onClick={() => setSelectedMentor(null)}
                  className="btn-primary"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleRequest} className="mt-6 space-y-4">
                {formError && (
                  <div className="rounded-xl border-[3px] border-accent p-3 font-sans text-base" role="alert">
                    {formError}
                  </div>
                )}
                <textarea
                  required
                  rows={4}
                  className="input resize-none"
                  placeholder="Introduce yourself and what you'd like help with…"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedMentor(null)}
                    className="btn-outline flex-1 justify-center"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={requestMutation.isPending}
                    className="btn-primary flex-1 justify-center disabled:opacity-50"
                  >
                    {requestMutation.isPending ? "Sending…" : "Send request"}
                  </button>
                </div>
              </form>
            )}
          </SketchCard>
        </div>
      )}
    </div>
  );
}
