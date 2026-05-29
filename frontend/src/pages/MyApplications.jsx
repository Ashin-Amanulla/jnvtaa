import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Briefcase, MapPin, Clock, ArrowRight } from "lucide-react";
import { jobsAPI } from "@/api";
import LoadingSpinner from "@/components/LoadingSpinner";
import { formatTimeAgo } from "@/utils/format";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function MyApplications() {
  const { data, isLoading } = useQuery({
    queryKey: ["jobs", "applied"],
    queryFn: () => jobsAPI.getAppliedJobs(),
  });

  const jobs = data?.data?.jobs || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">My applications</h1>
        <p className="text-sm text-muted-foreground">
          Jobs you&apos;ve applied to through the alumni board.
        </p>
      </div>

      {isLoading && <LoadingSpinner />}

      {!isLoading && jobs.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center py-12 text-center">
            <Briefcase className="mb-4 h-12 w-12 text-muted-foreground" />
            <CardTitle className="text-lg">No applications yet</CardTitle>
            <CardDescription className="mt-2">
              Browse the jobs board and apply when something fits.
            </CardDescription>
            <Button asChild className="mt-6">
              <Link to="/jobs">Browse jobs</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {jobs.map((job) => (
          <Link key={job._id} to={`/jobs/${job._id}`} className="block">
            <Card className="transition-colors hover:bg-muted/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                  <CardTitle className="text-base">{job.title}</CardTitle>
                  <CardDescription>{job.company}</CardDescription>
                </div>
                <ArrowRight className="hidden h-4 w-4 text-muted-foreground md:block" />
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {job.location?.isRemote ? "Remote" : job.location?.city}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    Applied {formatTimeAgo(job.updatedAt || job.createdAt)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
