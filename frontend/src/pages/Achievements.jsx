import { useQuery } from "@tanstack/react-query";
import { useSiteContent } from "@/hooks/useSiteContent";
import LoadingSpinner from "@/components/LoadingSpinner";
import { SectionHeading } from "@/components/SectionHeading";
import { SketchCard } from "@/components/SketchCard";
import { cn } from "@/utils/cn";

export default function Achievements() {
  const { data, isLoading, error } = useSiteContent("featuredAlumni");

  const content = data?.data?.content?.data;
  const alumni = content?.alumni || [];

  return (
    <div className="min-h-screen bg-background">
      <section className="border-b border-border py-16 md:py-24">
        <div className="container-custom">
          <SectionHeading
            eyebrow="Hall of fame"
            title={content?.title || "Achievements"}
            description={
              content?.description ||
              "Celebrating Navodaya alumni making an impact across fields."
            }
          />
        </div>
      </section>

      <section className="py-20">
        <div className="container-custom">
          {isLoading && <LoadingSpinner />}

          {!isLoading && error && (
            <div className="rounded-2xl border border-border py-16 text-center">
              <p className="font-sans text-lg text-muted-foreground">
                Featured alumni content is not available yet.
              </p>
            </div>
          )}

          {!isLoading && !error && alumni.length > 0 && (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {alumni.map((person, index) => (
                <SketchCard
                  key={`${person.name}-${index}`}
                  decoration={index % 2 === 0 ? "tape" : "none"}
                  postit={index === 2}
                  tilt
                  className={cn("p-0", index === 0 && "")}
                  contentClassName="flex flex-col p-6 md:p-8"
                >
                  {person.image && (
                    <div className="mb-6 overflow-hidden rounded-xl border-2 border-border">
                      <img
                        src={person.image}
                        alt={person.name}
                        className="h-48 w-full object-cover"
                      />
                    </div>
                  )}
                  <h3 className="font-display text-3xl font-bold">{person.name}</h3>
                  {person.batch && (
                    <p className="mt-2 font-sans text-lg text-brand">
                      Batch of {person.batch}
                    </p>
                  )}
                  {(person.headline || person.achievement) && (
                    <p className="mt-4 font-sans text-lg leading-snug">
                      {person.headline || person.achievement}
                    </p>
                  )}
                  {person.quote && (
                    <blockquote className="mt-6 border-t border-border pt-6 font-sans text-lg italic text-muted-foreground">
                      &ldquo;{person.quote}&rdquo;
                    </blockquote>
                  )}
                </SketchCard>
              ))}
            </div>
          )}

          {!isLoading && !error && alumni.length === 0 && (
            <p className="text-center font-sans text-xl text-muted-foreground">
              No featured alumni stories yet.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
