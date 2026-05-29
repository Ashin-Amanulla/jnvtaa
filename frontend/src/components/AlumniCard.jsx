import { Link } from "react-router-dom";
import { MapPin, Briefcase, Users, Mail } from "lucide-react";
import { SketchCard } from "@/components/SketchCard";
import { formatBatchOf } from "@/utils/format";

export default function AlumniCard({ user }) {
  return (
    <Link to={`/alumni/${user._id}`} className="block focus-ring rounded-2xl">
      <SketchCard tilt className="p-0" contentClassName="p-6">
        <div className="flex items-start gap-4">
          <div className="shrink-0">
            <img
              src={
                user.avatar ||
                `https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}&background=1e3a5f&color=ffffff`
              }
              alt={`${user.firstName} ${user.lastName}`}
              className="h-16 w-16 rounded-full border border-border object-cover"
            />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-display text-lg font-semibold text-foreground">
              {user.firstName} {user.lastName}
            </h3>
            {user.batch && (
              <p className="mt-0.5 font-sans text-sm font-medium text-brand">
                {formatBatchOf(user.batch)}
              </p>
            )}
            {user.profession && (
              <div className="mt-2.5 flex items-center gap-2 font-sans text-sm text-foreground">
                <Briefcase size={15} aria-hidden className="text-muted-foreground" />
                <span className="truncate">{user.profession}</span>
              </div>
            )}
            {user.currentCity && (
              <div className="mt-1.5 flex items-center gap-2 font-sans text-sm text-muted-foreground">
                <MapPin size={15} aria-hidden />
                <span className="truncate">{user.currentCity}</span>
              </div>
            )}
            <div className="mt-3 flex items-center gap-3">
              {user.socialLinks?.linkedin && (
                <a
                  href={user.socialLinks.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex text-muted-foreground transition-colors hover:text-brand focus-ring rounded-md p-1"
                  onClick={(e) => e.stopPropagation()}
                  aria-label="LinkedIn"
                >
                  <Users size={18} />
                </a>
              )}
              {user.privacySettings?.showEmail && user.email && (
                <a
                  href={`mailto:${user.email}`}
                  className="inline-flex text-muted-foreground transition-colors hover:text-brand focus-ring rounded-md p-1"
                  onClick={(e) => e.stopPropagation()}
                  aria-label="Email"
                >
                  <Mail size={18} />
                </a>
              )}
            </div>
          </div>
        </div>
        {user.bio && (
          <p className="mt-5 border-t border-border pt-5 font-sans text-sm text-muted-foreground line-clamp-2">
            {user.bio}
          </p>
        )}
      </SketchCard>
    </Link>
  );
}
