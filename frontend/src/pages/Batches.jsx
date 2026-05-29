import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { GraduationCap, Users } from "lucide-react";
import { batchesAPI } from "@/api";
import LoadingSpinner from "@/components/LoadingSpinner";
import { SketchCard } from "@/components/SketchCard";

export default function Batches() {
  const { data, isLoading } = useQuery({
    queryKey: ["batches", "all"],
    queryFn: () => batchesAPI.getAll({ limit: 100 }),
  });

  const batches = data?.data?.batches || [];

  return (
    <div className="min-h-screen bg-background">
      <section className="border-b border-border py-16 md:py-24">
        <div className="container-custom">
          <p className="mb-3 inline-block rounded-xl border-2 border-border bg-house-yellow-soft px-3 py-1 font-sans text-lg shadow-card">
            Passout years
          </p>
          <h1 className="font-display text-5xl font-bold uppercase md:text-6xl lg:text-7xl">
            Batches
          </h1>
          <div className="mt-4 h-1 max-w-sm border-b-2 border-brand" />
          <p className="mt-6 max-w-2xl font-sans text-xl text-muted-foreground md:text-2xl">
            Every batch has its own stories—pick yours and find classmates.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="container-custom">
          {isLoading && <LoadingSpinner />}

          {!isLoading && batches.length > 0 && (
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {batches.map((batch, index) => (
                <Link
                  key={batch._id}
                  to={`/batches/${batch._id}`}
                  className="block focus-ring rounded-2xl"
                >
                  <SketchCard
                    tilt
                    decoration={index % 3 === 0 ? "tape" : "none"}
                    className="h-full p-6 transition-transform"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <GraduationCap
                        size={32}
                        strokeWidth={2}
                        className="shrink-0 text-house-blue"
                      />
                      <span className="rounded-xl border-2 border-border bg-brand px-2 py-0.5 font-sans text-sm text-background">
                        {batch.passoutYear || batch.year}
                      </span>
                    </div>
                    <h2 className="mt-4 font-display text-3xl font-bold">
                      {batch.name}
                    </h2>
                    {batch.description && (
                      <p className="mt-3 line-clamp-2 font-sans text-base text-muted-foreground">
                        {batch.description}
                      </p>
                    )}
                    <div className="mt-6 flex items-center gap-2 font-sans text-base text-brand">
                      <Users size={18} strokeWidth={2} />
                      {batch.totalStudents || "—"} students
                    </div>
                  </SketchCard>
                </Link>
              ))}
            </div>
          )}

          {!isLoading && batches.length === 0 && (
            <div className="rounded-2xl border border-border py-24 text-center">
              <GraduationCap
                className="mx-auto mb-6 text-muted-foreground"
                size={64}
                strokeWidth={2}
              />
              <h3 className="font-display text-3xl font-bold">No batches yet</h3>
              <p className="mx-auto mt-4 max-w-md font-sans text-lg text-muted-foreground">
                Batch listings will appear here once added.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
