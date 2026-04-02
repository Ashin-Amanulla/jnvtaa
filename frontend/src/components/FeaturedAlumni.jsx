import { SectionHeading } from "@/components/SectionHeading";
import { SketchCard } from "@/components/SketchCard";
import { cn } from "@/utils/cn";

export default function FeaturedAlumni() {
  const featuredAlumni = [
    {
      name: "Dr. Priya Menon",
      batch: "2005",
      achievement:
        "Leading neurosurgeon at AIIMS; featured in Forbes Healthcare",
      image:
        "https://ui-avatars.com/api/?name=Priya+Menon&size=200&background=ff4d4d&color=fff",
      quote:
        "JNV Trivandrum taught me perseverance and excellence that shaped my medical career.",
    },
    {
      name: "Arun Kumar",
      batch: "2008",
      achievement: "Founder & CEO of TechStart India; 50M+ ARR",
      image:
        "https://ui-avatars.com/api/?name=Arun+Kumar&size=200&background=2d5da1&color=fff",
      quote:
        "Leadership at JNV became the foundation of my entrepreneurial journey.",
    },
    {
      name: "Anjali Sharma",
      batch: "2010",
      achievement:
        "IAS officer, district magistrate, PM Excellence Award winner",
      image:
        "https://ui-avatars.com/api/?name=Anjali+Sharma&size=200&background=2d2d2d&color=fdfbf7",
      quote:
        "Public service spirit from JNV drives my work every single day.",
    },
  ];

  return (
    <section className="border-t-[3px] border-dashed border-border py-20">
      <div className="container-custom">
        <SectionHeading
          eyebrow="Hall of doodles"
          title="Featured alumni"
          description="Spotlighting people who turned midnight study sessions into real-world magic."
        />

        <div className="grid gap-8 md:grid-cols-3">
          {featuredAlumni.map((alumni, index) => (
            <SketchCard
              key={alumni.name}
              decoration={index === 1 ? "tape" : "none"}
              postit={index === 2}
              tilt
              className={cn("p-0", index === 0 && "md:-rotate-1")}
              contentClassName="flex flex-col"
            >
              <div className="relative h-64 overflow-hidden border-b-[3px] border-border bg-muted">
                <img
                  src={alumni.image}
                  alt={alumni.name}
                  className="h-full w-full object-cover transition-transform duration-100 hover:scale-[1.03]"
                />
              </div>
              <div className="flex flex-grow flex-col p-6 md:p-8">
                <h3 className="font-display text-3xl font-bold text-foreground">
                  {alumni.name}
                </h3>
                <p className="mt-2 font-sans text-lg text-pen">
                  Batch of {alumni.batch}
                </p>
                <p className="mt-4 font-sans text-lg leading-snug text-foreground">
                  {alumni.achievement}
                </p>
                <blockquote className="mt-6 border-t-2 border-dashed border-border pt-6 font-sans text-lg italic text-muted-foreground">
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
