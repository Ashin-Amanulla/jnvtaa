import { Link } from "react-router-dom";
import { MapPin, Briefcase, Users, Mail } from "lucide-react";
import { SketchCard } from "@/components/SketchCard";

export default function AlumniCard({ user }) {
  return (
    <Link
      to={`/directory/${user._id}`}
      className="block focus-ring rounded-wobblyMd"
    >
      <SketchCard
        tilt
        className="p-0 transition-transform duration-100 hover:shadow-sketch"
        contentClassName="p-6 md:p-8"
      >
        <div className="flex items-start gap-5">
          <div className="shrink-0">
            <img
              src={
                user.avatar ||
                `https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}&background=e5e0d8&color=2d2d2d`
              }
              alt={`${user.firstName} ${user.lastName}`}
              className="h-20 w-20 border-[3px] border-border object-cover shadow-sketchSm"
              style={{
                borderRadius: "255px 15px 225px 15px / 15px 225px 15px 255px",
              }}
            />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-display text-2xl font-bold text-foreground">
              {user.firstName} {user.lastName}
            </h3>
            {user.batch && (
              <p className="mt-1 font-sans text-lg text-pen">
                Batch of {user.batch.year}
              </p>
            )}
            {user.profession && (
              <div className="mt-3 flex items-center gap-2 font-sans text-base text-foreground">
                <Briefcase size={18} strokeWidth={2.5} aria-hidden />
                <span className="truncate">{user.profession}</span>
              </div>
            )}
            {user.currentCity && (
              <div className="mt-2 flex items-center gap-2 font-sans text-base text-muted-foreground">
                <MapPin size={18} strokeWidth={2.5} aria-hidden />
                <span className="truncate">{user.currentCity}</span>
              </div>
            )}
            <div className="mt-4 flex items-center gap-4">
              {user.socialLinks?.linkedin && (
                <a
                  href={user.socialLinks.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex text-foreground hover:text-accent focus-ring rounded-wobblySm p-1"
                  onClick={(e) => e.stopPropagation()}
                  aria-label="LinkedIn"
                >
                  <Users size={20} strokeWidth={2.5} />
                </a>
              )}
              {user.privacySettings?.showEmail && user.email && (
                <a
                  href={`mailto:${user.email}`}
                  className="inline-flex text-foreground hover:text-pen focus-ring rounded-wobblySm p-1"
                  onClick={(e) => e.stopPropagation()}
                  aria-label="Email"
                >
                  <Mail size={20} strokeWidth={2.5} />
                </a>
              )}
            </div>
          </div>
        </div>
        {user.bio && (
          <p className="mt-6 border-t-2 border-dashed border-border pt-6 font-sans text-base text-muted-foreground line-clamp-2">
            {user.bio}
          </p>
        )}
      </SketchCard>
    </Link>
  );
}
