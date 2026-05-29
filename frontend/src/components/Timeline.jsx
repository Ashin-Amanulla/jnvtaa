import { SketchCard } from "@/components/SketchCard";
import { cn } from "@/utils/cn";

export default function Timeline({ items = [] }) {
  return (
    <div className="relative">
      <div
        className="absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 bg-border md:block"
        aria-hidden
      />
      <div className="space-y-12">
        {items.map((item, index) => (
          <div
            key={index}
            className={cn(
              "relative flex flex-col gap-4 md:flex-row md:items-center",
              index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse",
            )}
          >
            <div className="md:w-1/2">
              <SketchCard
                tilt
                className={cn("p-6", index % 2 === 0 ? "md:mr-8" : "md:ml-8")}
              >
                <p className="font-display text-2xl font-bold text-brand">
                  {item.year}
                </p>
                <h3 className="mt-2 font-display text-xl font-semibold text-foreground">
                  {item.title}
                </h3>
                <p className="mt-2 font-sans text-base text-muted-foreground">
                  {item.description}
                </p>
              </SketchCard>
            </div>
            <div
              className="absolute left-1/2 hidden h-4 w-4 -translate-x-1/2 rounded-full border-4 border-background bg-brand shadow-card md:block"
              aria-hidden
            />
          </div>
        ))}
      </div>
    </div>
  );
}
