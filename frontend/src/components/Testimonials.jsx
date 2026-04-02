import { SectionHeading } from "@/components/SectionHeading";
import { SketchCard } from "@/components/SketchCard";
import { cn } from "@/utils/cn";

export default function Testimonials() {
  const testimonials = [
    {
      name: "Adarsh Nair",
      batch: "2009",
      role: "Software engineer at Google",
      avatar:
        "https://ui-avatars.com/api/?name=Vikram+Nair&background=e5e0d8&color=2d2d2d",
      quote:
        "JNVTAA connected me with alumni worldwide—networking that actually feels human, not LinkedIn-cold.",
    },
    {
      name: "Anagha Krishna",
      batch: "2012",
      role: "Doctor at Pariyaram Medical College",
      avatar:
        "https://ui-avatars.com/api/?name=Shalini+Krishna&background=fff9c4&color=2d2d2d",
      quote:
        "Keeps me tied to my roots while I chase night shifts—this community is my recharge.",
    },
    {
      name: "Abhinandh",
      batch: "2009",
      role: "Software engineer ",
      avatar:
        "https://ui-avatars.com/api/?name=Abhinandh&background=ff4d4d&color=fff",
      quote:
        "Mentorship when I started; now I mentor juniors. Full circle, full heart.",
    },
  ];

  return (
    <section className="border-t-[3px] border-dashed border-border py-20">
      <div className="container-custom">
        <SectionHeading
          eyebrow="Speech bubbles"
          title="Alumni voices"
          description="Real quotes. Slightly crooked layout. Zero corporate polish."
        />

        <div className="grid gap-8 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <SketchCard
              key={t.name}
              decoration="tack"
              tilt
              className={cn("p-0", i === 1 && "md:translate-y-3 md:rotate-1")}
              contentClassName="relative flex h-full flex-col p-8 md:p-10"
            >
              <div
                className="absolute bottom-6 left-8 h-0 w-0 border-[14px] border-transparent border-t-border"
                style={{ filter: "drop-shadow(2px 2px 0 #2d2d2d)" }}
                aria-hidden
              />
              <p className="relative z-10 flex-grow font-sans text-xl leading-relaxed text-foreground md:text-2xl">
                “{t.quote}”
              </p>
              <div className="relative z-10 mt-10 flex items-center gap-4 border-t-[3px] border-border pt-6">
                <img
                  src={t.avatar}
                  alt=""
                  className="h-16 w-16 border-[3px] border-border object-cover shadow-sketchSm"
                  style={{
                    borderRadius: "255px 15px 225px 15px / 15px 225px 15px 255px",
                  }}
                />
                <div>
                  <p className="font-display text-xl font-bold">{t.name}</p>
                  <p className="font-sans text-base text-muted-foreground">
                    {t.role}
                  </p>
                  <p className="mt-1 font-sans text-sm text-pen">
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
