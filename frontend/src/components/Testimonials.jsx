import { SectionHeading } from "@/components/SectionHeading";
import { SketchCard } from "@/components/SketchCard";
import { cn } from "@/utils/cn";
import { useSiteContent } from "@/hooks/useSiteContent";

const DEFAULT_TESTIMONIALS = [
  {
    name: "Adarsh Nair",
    batch: "2009",
    role: "Software engineer at Google",
    avatar:
      "https://ui-avatars.com/api/?name=Adarsh+Nair&background=e5e0d8&color=2d2d2d",
    quote:
      "JNVTAA keeps us connected across continents. The mentorship network has been invaluable for Navodayans building careers abroad.",
  },
  {
    name: "Anagha Krishna",
    batch: "2012",
    role: "Doctor at Pariyaram Medical College",
    avatar:
      "https://ui-avatars.com/api/?name=Anagha+Krishna&background=fff9c4&color=2d2d2d",
    quote:
      "Even after years away from campus, JNVTAA helps us stay rooted in the values JNV Thiruvananthapuram instilled in us.",
  },
  {
    name: "Abhinandh",
    batch: "2009",
    role: "Software engineer",
    avatar:
      "https://ui-avatars.com/api/?name=Abhinandh&background=ff4d4d&color=fff",
    quote:
      "I received guidance when I started my career. Today I mentor juniors through JNVTAA — that is the Navodayan way.",
  },
];

function mapTestimonialItem(item) {
  return {
    name: item.author || item.name,
    batch: item.batch,
    role: item.role || item.headline || "",
    avatar:
      item.avatar ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(item.author || item.name || "Alumni")}&background=e5e0d8&color=2d2d2d`,
    quote: item.quote,
  };
}

export default function Testimonials() {
  const { data } = useSiteContent("testimonials");

  const content = data?.data?.content?.data;
  const apiItems = content?.items;
  const testimonials =
    apiItems?.length > 0
      ? apiItems.map(mapTestimonialItem)
      : DEFAULT_TESTIMONIALS;

  const accents = ["text-house-red", "text-house-blue", "text-house-yellow"];

  return (
    <section className="border-t border-border bg-muted/40 py-16 md:py-20">
      <div className="container-custom">
        <SectionHeading
          eyebrow="Alumni voices"
          title={content?.title || "What our members say"}
          description={
            content?.description ||
            "Navodayans sharing how JNVTAA keeps them connected to JNV Thiruvananthapuram and one another."
          }
        />

        <div className="grid gap-8 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <SketchCard
              key={`${t.name}-${t.batch}`}
              tilt
              className="p-0"
              contentClassName="relative flex h-full flex-col p-6 md:p-8"
            >
              <span
                className={cn(
                  "font-display text-5xl font-bold leading-none",
                  accents[i % accents.length],
                )}
                aria-hidden
              >
                &ldquo;
              </span>
              <p className="relative z-10 -mt-2 flex-grow font-sans text-base leading-relaxed text-foreground md:text-lg">
                {t.quote}
              </p>
              <div className="relative z-10 mt-6 flex items-center gap-4 border-t border-border pt-5">
                <img
                  src={t.avatar}
                  alt=""
                  className="h-14 w-14 rounded-full border border-border object-cover"
                />
                <div>
                  <p className="font-display text-base font-semibold">{t.name}</p>
                  {t.role && (
                    <p className="font-sans text-sm text-muted-foreground">
                      {t.role}
                    </p>
                  )}
                  <p className="mt-0.5 font-sans text-sm text-brand">
                    Batch {t.batch}
                  </p>
                </div>
              </div>
            </SketchCard>
          ))}
        </div>
      </div>
    </section>
  );
}
