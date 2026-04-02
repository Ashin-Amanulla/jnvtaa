import { cn } from "@/utils/cn";

export function SectionHeading({
  eyebrow,
  title,
  description,
  className,
  action,
}) {
  return (
    <div className={cn("mb-12 md:mb-16", className)}>
      {eyebrow && (
        <p className="mb-3 inline-block rounded-wobblySm border-2 border-dashed border-border bg-white px-3 py-1 font-sans text-base text-muted-foreground shadow-sketchSm rotate-[-1deg]">
          {eyebrow}
        </p>
      )}
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-4xl font-bold leading-none text-foreground md:text-5xl lg:text-6xl">
            {title}
          </h2>
          <div
            className="mt-4 h-1 max-w-[10rem] border-b-4 border-dashed border-foreground"
            aria-hidden
          />
          {description && (
            <p className="mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
              {description}
            </p>
          )}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
    </div>
  );
}
