import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  MapPin,
  Briefcase,
  Mail,
  Phone,
  ArrowLeft,
  ExternalLink,
  MessageCircle,
} from "lucide-react";
import { usersAPI } from "@/api";
import LoadingSpinner from "@/components/LoadingSpinner";
import { SketchCard } from "@/components/SketchCard";
import { useAuthStore } from "@/store/auth";

export default function PublicProfile() {
  const { userId } = useParams();
  const { isAuthenticated } = useAuthStore();

  const { data, isLoading, error } = useQuery({
    queryKey: ["user", userId],
    queryFn: () => usersAPI.getUserById(userId),
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <LoadingSpinner />
      </div>
    );
  }

  const user = data?.data?.user;

  if (error || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-6">
        <SketchCard className="p-10 text-center">
          <h2 className="font-display text-4xl font-bold">Profile not found</h2>
          <Link to="/directory" className="btn-primary mt-8 inline-flex">
            Back to directory
          </Link>
        </SketchCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="sticky-below-nav">
        <div className="container-custom py-4">
          <Link
            to="/directory"
            className="inline-flex items-center gap-2 font-sans text-lg text-brand font-medium focus-ring"
          >
            <ArrowLeft size={18} strokeWidth={2} />
            Back to directory
          </Link>
        </div>
      </div>

      <section className="py-12 md:py-20">
        <div className="container-custom max-w-4xl">
          <SketchCard decoration="tape" tilt className="p-8 md:p-12">
            <div className="flex flex-col gap-8 md:flex-row md:items-start">
              <img
                src={
                  user.avatar ||
                  `https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}&background=e5e0d8&color=2d2d2d&size=200`
                }
                alt={`${user.firstName} ${user.lastName}`}
                className="h-32 w-32 shrink-0 border border-border object-cover shadow-card"
                style={{
                  borderRadius: "9999px",
                }}
              />
              <div className="min-w-0 flex-1">
                <h1 className="font-display text-5xl font-bold md:text-6xl">
                  {user.firstName} {user.lastName}
                </h1>
                {user.batch && (
                  <p className="mt-2 font-sans text-xl text-brand">
                    Batch of {user.batch.year || user.batch.name}
                  </p>
                )}
                {user.profession && (
                  <div className="mt-4 flex items-center gap-2 font-sans text-lg">
                    <Briefcase size={20} strokeWidth={2} />
                    <span>
                      {user.profession}
                      {user.company ? ` at ${user.company}` : ""}
                    </span>
                  </div>
                )}
                {user.currentCity && (
                  <div className="mt-2 flex items-center gap-2 font-sans text-lg text-muted-foreground">
                    <MapPin size={20} strokeWidth={2} />
                    <span>
                      {user.currentCity}
                      {user.currentCountry ? `, ${user.currentCountry}` : ""}
                    </span>
                  </div>
                )}
                {isAuthenticated && (
                  <Link
                    to={`/messages?user=${user._id}`}
                    className="btn-secondary mt-6 inline-flex items-center gap-2"
                  >
                    <MessageCircle size={18} />
                    Send message
                  </Link>
                )}
              </div>
            </div>

            {user.bio && (
              <div className="mt-10 border-t border-border pt-8">
                <h2 className="font-display text-2xl font-bold">About</h2>
                <p className="mt-4 font-sans text-lg leading-relaxed text-foreground/90">
                  {user.bio}
                </p>
              </div>
            )}

            <div className="mt-10 grid gap-4 border-t border-border pt-8 sm:grid-cols-2">
              {user.email && (
                <a
                  href={`mailto:${user.email}`}
                  className="flex items-center gap-3 font-sans text-lg hover:text-brand focus-ring"
                >
                  <Mail size={20} strokeWidth={2} />
                  {user.email}
                </a>
              )}
              {user.phone && (
                <a
                  href={`tel:${user.phone}`}
                  className="flex items-center gap-3 font-sans text-lg hover:text-brand focus-ring"
                >
                  <Phone size={20} strokeWidth={2} />
                  {user.phone}
                </a>
              )}
            </div>

            {user.socialLinks &&
              Object.values(user.socialLinks).some(Boolean) && (
                <div className="mt-8 flex flex-wrap gap-4">
                  {Object.entries(user.socialLinks).map(([key, url]) =>
                    url ? (
                      <a
                        key={key}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-xl border-2 border-border bg-white px-4 py-2 font-sans text-base shadow-card focus-ring"
                      >
                        {key}
                        <ExternalLink size={16} />
                      </a>
                    ) : null
                  )}
                </div>
              )}
          </SketchCard>
        </div>
      </section>
    </div>
  );
}
