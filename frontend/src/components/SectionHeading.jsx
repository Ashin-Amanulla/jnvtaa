import { cn } from "@/utils/cn";

export function SectionHeading({
  eyebrow,
  title,
  description,
  className,
  action,
}) {
  return (
    <div className={cn("mb-10 md:mb-14", className)}>
      {eyebrow && <p className="eyebrow mb-4">{eyebrow}</p>}
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="font-display text-3xl font-bold leading-tight text-foreground md:text-4xl lg:text-[2.75rem]">
            {title}
          </h2>
          <div
            className="mt-4 h-1 w-16 rounded-full bg-brand"
            aria-hidden
          />
          {description && (
            <p className="mt-5 max-w-2xl text-base text-muted-foreground md:text-lg">
              {description}
            </p>
          )}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
    </div>
  );
}
