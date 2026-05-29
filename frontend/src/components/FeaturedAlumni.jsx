import { SectionHeading } from "@/components/SectionHeading";
import { SketchCard } from "@/components/SketchCard";
import { cn } from "@/utils/cn";
import { useSiteContent } from "@/hooks/useSiteContent";

const DEFAULT_FEATURED_ALUMNI = [
  {
    name: "Dr. Adhiti",
    batch: "2023",
    achievement: "UPSC Topper",
    image:
      "https://ui-avatars.com/api/?name=Dr+Adhiti&size=200&background=ff4d4d&color=fff",
    quote:
      "JNV Thiruvananthapuram taught me perseverance and excellence that continue to shape my public service career.",
  },
  {
    name: "Ananthu JB",
    batch: "2012",
    achievement: "Kerala magistrate judge",
    image:
      "https://ui-avatars.com/api/?name=Ananthu+JB&size=200&background=2d5da1&color=fff",
    quote:
      "The leadership and discipline we learned at JNV became the foundation of my career in the judiciary.",
  },
  {
    name: "Sheni Sebastian",
    batch: "2008",
    achievement: "Entrepreneur",
    image:
      "https://ui-avatars.com/api/?name=Sheni+Sebastian&size=200&background=2d2d2d&color=fdfbf7",
    quote:
      "The culture of excellence at JNV Thiruvananthapuram continues to guide how we build and serve through our work.",
  },
];

function mapFeaturedAlumniItem(item) {
  const name = item.name || "Alumni";
  return {
    name,
    batch: item.batch,
    achievement: item.achievement || item.headline || "",
    image:
      item.image ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=200&background=2d5da1&color=fff`,
    quote: item.quote,
  };
}

export default function FeaturedAlumni() {
  const { data } = useSiteContent("featuredAlumni");

  const content = data?.data?.content?.data;
  const apiAlumni = content?.alumni;
  const featuredAlumni =
    apiAlumni?.length > 0
      ? apiAlumni.map(mapFeaturedAlumniItem)
      : DEFAULT_FEATURED_ALUMNI;

  const accents = ["bg-house-red", "bg-house-blue", "bg-house-yellow"];

  return (
    <section className="border-t border-border py-16 md:py-20">
      <div className="container-custom">
        <SectionHeading
          eyebrow="Navodayan excellence"
          title={content?.title || "Featured alumni"}
          description={
            content?.description ||
            "Graduates of JNV Thiruvananthapuram making an impact in public service, technology, business, and beyond."
          }
        />

        <div className="grid gap-8 md:grid-cols-3">
          {featuredAlumni.map((alumni, index) => (
            <SketchCard
              key={`${alumni.name}-${alumni.batch}`}
              tilt
              className="p-0"
              contentClassName="flex flex-col"
            >
              <div className="relative h-60 overflow-hidden border-b border-border bg-muted">
                <span
                  className={cn(
                    "absolute inset-x-0 top-0 z-10 h-1.5",
                    accents[index % accents.length],
                  )}
                  aria-hidden
                />
                <img
                  src={alumni.image}
                  alt={alumni.name}
                  className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                />
              </div>
              <div className="flex flex-grow flex-col p-6">
                <h3 className="font-display text-xl font-semibold text-foreground">
                  {alumni.name}
                </h3>
                <p className="mt-1 font-sans text-sm font-medium text-brand">
                  Batch of {alumni.batch}
                </p>
                <p className="mt-3 font-sans text-base font-medium leading-snug text-foreground">
                  {alumni.achievement}
                </p>
                <blockquote className="mt-5 border-t border-border pt-5 font-sans text-base italic text-muted-foreground">
                  “{alumni.quote}”
                </blockquote>
              </div>
            </SketchCard>
          ))}
        </div>
      </div>
    </section>
  );
}
