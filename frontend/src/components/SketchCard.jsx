import { cn } from "@/utils/cn";

export function SketchCard({
  as: Component = "div",
  children,
  className,
  contentClassName,
  decoration = "none",
  postit = false,
  tilt = true,
  shadow = "card",
  ...props
}) {
  const shadowClass =
    shadow === "sketch"
      ? "shadow-sketch"
      : shadow === "lg"
        ? "shadow-sketchLg"
        : "shadow-sketchCard";

  return (
    <Component
      className={cn(
        "relative overflow-hidden rounded-wobblyMd border-2 border-border",
        postit ? "bg-postit" : "bg-white",
        shadowClass,
        tilt && "transition-transform duration-100 hover:-rotate-1 hover:shadow-sketch md:hover:rotate-1",
        className,
      )}
      {...props}
    >
      {decoration === "tape" && (
        <span
          className="pointer-events-none absolute -top-1 left-1/2 z-10 h-5 w-[4.5rem] -translate-x-1/2 rotate-[-3deg] bg-black/20"
          style={{ borderRadius: "4px 6px 5px 4px / 3px 5px 4px 6px" }}
          aria-hidden
        />
      )}
      {decoration === "tack" && (
        <span
          className="pointer-events-none absolute -top-0.5 left-1/2 z-10 h-4 w-4 -translate-x-1/2 rounded-wobblySm border-2 border-border bg-accent shadow-sketchSm"
          aria-hidden
        />
      )}
      <div className={cn("relative z-0 h-full", contentClassName)}>{children}</div>
    </Component>
  );
}
