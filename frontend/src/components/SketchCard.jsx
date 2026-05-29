import { cn } from "@/utils/cn";

/**
 * Card primitive. Prop API is preserved for back-compat across ~70 call sites:
 *  - decoration: "tape" | "tack" | "none"  -> now renders a subtle top accent bar
 *  - postit: boolean                        -> pale cream surface
 *  - tilt: boolean                          -> subtle hover lift (no rotation)
 *  - shadow: "sketch" | "lg" | "card"
 */
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
    shadow === "sketch" || shadow === "lg" ? "shadow-cardHover" : "shadow-card";

  const accentColor =
    decoration === "tack"
      ? "bg-accent"
      : decoration === "tape"
        ? "bg-house-blue"
        : null;

  return (
    <Component
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border",
        postit ? "bg-postit" : "bg-card",
        shadowClass,
        tilt &&
          "transition-all duration-200 hover:-translate-y-1 hover:shadow-cardHover",
        className,
      )}
      {...props}
    >
      {accentColor && (
        <span
          className={cn(
            "pointer-events-none absolute inset-x-0 top-0 z-10 h-1",
            accentColor,
          )}
          aria-hidden
        />
      )}
      <div className={cn("relative z-0 h-full", contentClassName)}>{children}</div>
    </Component>
  );
}
