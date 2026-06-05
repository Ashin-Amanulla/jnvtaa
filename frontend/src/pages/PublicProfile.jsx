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
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuthStore } from "@/store/auth";
import { formatBatchOf } from "@/utils/format";

export default function PublicProfile() {
  const { userId } = useParams();
  const { isAuthenticated } = useAuthStore();

  const { data, isLoading, error } = useQuery({
    queryKey: ["user", userId],
    queryFn: () => usersAPI.getUserById(userId),
  });

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  const user = data?.data?.user;

  if (error || !user) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center py-12 text-center">
          <h2 className="text-xl font-semibold">Profile not found</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            This alumni profile may have been removed or is unavailable.
          </p>
          <Button asChild className="mt-6">
            <Link to="/dashboard/directory">Back to directory</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const initials = `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase();

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Button variant="ghost" size="sm" asChild className="-ml-2">
        <Link to="/dashboard/directory">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to directory
        </Link>
      </Button>

      <Card>
        <CardContent className="p-6 md:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-start">
            <Avatar className="h-28 w-28 shrink-0">
              <AvatarImage src={user.avatar} alt={`${user.firstName} ${user.lastName}`} />
              <AvatarFallback className="text-lg">{initials}</AvatarFallback>
            </Avatar>

            <div className="min-w-0 flex-1">
              <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
                {user.firstName} {user.lastName}
              </h1>
              {user.batch && (
                <p className="mt-1 text-sm font-medium text-primary">
                  {formatBatchOf(user.batch) || user.batch.name}
                </p>
              )}
              {user.profession && (
                <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                  <Briefcase className="h-4 w-4 shrink-0" />
                  <span>
                    {user.profession}
                    {user.company ? ` at ${user.company}` : ""}
                  </span>
                </div>
              )}
              {user.currentCity && (
                <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 shrink-0" />
                  <span>
                    {user.currentCity}
                    {user.currentCountry ? `, ${user.currentCountry}` : ""}
                  </span>
                </div>
              )}
              {isAuthenticated && (
                <Button asChild variant="secondary" size="sm" className="mt-4">
                  <Link to={`/messages?user=${user._id}`}>
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Send message
                  </Link>
                </Button>
              )}
            </div>
          </div>

          {user.bio && (
            <div className="mt-8 border-t pt-6">
              <h2 className="text-base font-semibold">About</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {user.bio}
              </p>
            </div>
          )}

          <div className="mt-8 grid gap-3 border-t pt-6 sm:grid-cols-2">
            {user.email && (
              <a
                href={`mailto:${user.email}`}
                className="flex items-center gap-3 text-sm hover:text-primary"
              >
                <Mail className="h-4 w-4 shrink-0" />
                {user.email}
              </a>
            )}
            {user.phone && (
              <a
                href={`tel:${user.phone}`}
                className="flex items-center gap-3 text-sm hover:text-primary"
              >
                <Phone className="h-4 w-4 shrink-0" />
                {user.phone}
              </a>
            )}
          </div>

          {user.socialLinks && Object.values(user.socialLinks).some(Boolean) && (
            <div className="mt-6 flex flex-wrap gap-2">
              {Object.entries(user.socialLinks).map(([key, url]) =>
                url ? (
                  <a
                    key={key}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm capitalize hover:bg-muted"
                  >
                    {key}
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                ) : null,
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
