import { SquiggleConnector } from "@/components/HeroSketchDecor";
import { SketchCard } from "@/components/SketchCard";

export default function Timeline() {
  const milestones = [
    {
      year: "2001",
      title: "Journey begins at Pettah, Trivandrum",
      description:
        "Our story starts with the first campus at Pettah, Trivandrum.",
    },
    {
      year: "2005",
      title: "New campus opens at Vithura",
      description:
        "The institution moves into a new chapter with the Vithura campus.",
    },
    {
      year: "2008",
      title: "First batch passes out",
      description: "The first graduating batch marks a proud milestone.",
    },
    {
      year: "2020",
      title: "Alumni registration begins",
      description:
        "A structured alumni registration effort starts to reconnect batches.",
    },
    {
      year: "2026",
      title: "25th anniversary celebration",
      description:
        "Celebrating 25 years of JNV Trivandrum's journey and community spirit.",
    },
  ];

  return (
    <div className="relative">
      <div className="pointer-events-none absolute left-1/2 top-0 hidden h-full w-0 -translate-x-1/2 border-l-2 border-dashed border-border md:block" />

      <div className="space-y-10 md:space-y-14">
        {milestones.map((milestone, index) => (
          <div
            key={milestone.year}
            className={`flex flex-col items-center gap-6 ${
              index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
            }`}
          >
            <div
              className={`w-full flex-1 ${
                index % 2 === 0 ? "md:text-right" : "md:text-left"
              }`}
            >
              <SketchCard
                decoration={index % 2 === 0 ? "tack" : "tape"}
                tilt
                className="p-0"
                contentClassName="p-6 md:p-8"
              >
                <div className="font-display text-4xl font-bold text-accent md:text-5xl">
                  {milestone.year}
                </div>
                <h3 className="mt-2 font-display text-2xl font-bold text-foreground">
                  {milestone.title}
                </h3>
                <p className="mt-3 font-sans text-lg text-muted-foreground">
                  {milestone.description}
                </p>
              </SketchCard>
            </div>

            <div className="relative hidden shrink-0 md:flex md:flex-col md:items-center">
              <div
                className="z-10 h-5 w-5 rotate-45 border-[3px] border-border bg-background shadow-sketchSm"
                aria-hidden
              />
              {index < milestones.length - 1 && (
                <SquiggleConnector className="mt-2 w-24 text-border hidden md:block" />
              )}
            </div>

            <div className="hidden flex-1 md:block" />
          </div>
        ))}
      </div>
    </div>
  );
}
