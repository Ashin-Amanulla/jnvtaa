import { cn } from "@/utils/cn";

export function SketchIconCircle({ children, className }) {
  return (
    <span
      className={cn(
        "inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand-soft text-brand",
        className,
      )}
    >
      {children}
    </span>
  );
}
