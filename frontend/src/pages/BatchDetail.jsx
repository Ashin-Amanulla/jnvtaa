import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { batchesAPI } from "@/api";
import AlumniCard from "@/components/AlumniCard";
import LoadingSpinner from "@/components/LoadingSpinner";
import {
  ArrowLeft,
  Users,
  GraduationCap,
  CalendarDays,
} from "lucide-react";

export default function BatchDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: batchData, isLoading } = useQuery({
    queryKey: ["batch", id],
    queryFn: () => batchesAPI.getById(id),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  const batch = batchData?.data?.batch;
  const alumni = batchData?.data?.alumni || [];

  if (!batch) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="card p-10 border-[2px] border-border text-center">
          <h2 className="text-4xl font-display font-medium tracking-tighter mb-6">
            Batch not found
          </h2>
          <button
            onClick={() => navigate("/directory")}
            className="btn btn-primary px-8"
          >
            Back to Directory
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Back Button */}
      <div className="sticky-below-nav">
        <div className="container-custom py-4">
          <button
            type="button"
            onClick={() => navigate("/directory")}
            className="inline-flex items-center gap-2 rounded-sm font-sans text-lg text-pen underline decoration-wavy decoration-2 underline-offset-4 focus-ring"
          >
            <ArrowLeft size={18} strokeWidth={2.5} />
            Back to directory
          </button>
        </div>
      </div>

      <section className="relative pb-16 pt-20">
        <div className="container-custom max-w-4xl text-center">
          <span className="mb-6 inline-block rounded-wobblySm border-[3px] border-border bg-foreground px-4 py-2 font-sans text-lg font-bold text-background shadow-sketch">
            Passout {batch.passoutYear}
          </span>
          <h1 className="mb-12 font-display text-6xl font-bold md:text-8xl">
            {batch.name}
          </h1>

          <div className="mt-12 grid grid-cols-1 gap-4 text-left md:grid-cols-3">
            {[
              {
                icon: <Users size={26} strokeWidth={2.5} />,
                value: alumni.length,
                label: "Alumni registered",
              },
              {
                icon: <GraduationCap size={26} strokeWidth={2.5} />,
                value: batch.totalStudents,
                label: "Students (era)",
              },
              {
                icon: <CalendarDays size={26} strokeWidth={2.5} />,
                value: batch.reunions?.length || 0,
                label: "Reunions",
              },
            ].map((s, i) => (
              <div
                key={s.label}
                className={`rounded-wobblyMd border-[3px] border-border bg-white p-6 shadow-sketch ${
                  i === 1 ? "md:-translate-y-2 md:rotate-1" : ""
                }`}
              >
                <div className="text-foreground">{s.icon}</div>
                <div className="mt-3 font-display text-4xl font-bold">{s.value}</div>
                <div className="mt-1 font-sans text-lg text-muted-foreground">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Description */}
      {batch.description && (
        <section className="py-16 bg-background">
          <div className="container-custom max-w-4xl">
            <div className="card p-12 border-[2px] border-border bg-muted">
              <h2 className="text-3xl font-display tracking-tighter font-medium mb-6">
                About This Batch
              </h2>
              <div className="h-[2px] w-12 bg-foreground mb-8"></div>
              <p className="font-sans text-xl leading-relaxed text-foreground">
                {batch.description}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Batch Photo */}
      {batch.groupPhoto && (
        <section className="py-16 bg-background">
          <div className="container-custom max-w-5xl">
            <h2 className="text-4xl font-display tracking-tighter font-medium mb-12 text-center">
              Batch Group Photo
            </h2>
            <div className="border-[4px] border-foreground p-2 bg-muted shadow-[16px_16px_0px_0px_rgba(0,0,0,1)]">
              <img
                src={batch.groupPhoto}
                alt={`${batch.name} Group Photo`}
                className="w-full grayscale object-cover"
              />
            </div>
          </div>
        </section>
      )}

      {/* Reunions */}
      {batch.reunions && batch.reunions.length > 0 && (
        <section className="py-24 bg-background border-t-[4px] border-border">
          <div className="container-custom">
            <h2 className="text-5xl font-display tracking-tighter font-medium mb-16 px-4">
              Past Reunions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {batch.reunions.map((reunion, index) => (
                <div
                  key={index}
                  className="card p-8 border-[2px] border-border hover:border-foreground transition-none bg-muted"
                >
                  <div className="inline-block px-3 py-1 bg-foreground text-background font-mono text-xs tracking-widest uppercase font-bold mb-6">
                    {new Date(reunion.date).getFullYear()}
                  </div>
                  <h3 className="text-3xl font-display tracking-tighter font-medium mb-4">
                    {reunion.location}
                  </h3>
                  <div className="flex flex-col gap-4">
                    <p className="font-mono text-sm tracking-widest uppercase text-muted-foreground">
                      {reunion.attendees} ATTENDEES
                    </p>
                    {reunion.description && (
                      <p className="font-sans text-foreground pb-4 border-b-[2px] border-border/50">{reunion.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Alumni List */}
      <section className="py-24 bg-background border-t-[4px] border-border">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <h2 className="text-5xl md:text-6xl font-display tracking-tighter font-medium">
              Alumni from {batch.name}
            </h2>
            <span className="font-mono text-lg uppercase tracking-widest font-bold">
              [{alumni.length} FOUND]
            </span>
          </div>

          {alumni.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {alumni.map((user) => (
                <AlumniCard key={user._id} user={user} />
              ))}
            </div>
          ) : (
            <div className="text-center py-32 border-[2px] border-border border-dashed bg-muted">
              <Users className="mx-auto mb-6 text-border" size={64} strokeWidth={1} />
              <h3 className="text-3xl font-display tracking-tighter font-medium mb-4">
                No registered alumni yet
              </h3>
              <p className="font-mono text-sm uppercase tracking-widest text-muted-foreground">
                Be the first to join from this batch.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
