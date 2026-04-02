import { cn } from "@/utils/cn";

export function SketchIconCircle({ children, className }) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-wobbly border-2 border-border bg-white p-2 shadow-sketchSm transition-transform duration-100 hover:-rotate-6",
        className,
      )}
    >
      {children}
    </span>
  );
}
