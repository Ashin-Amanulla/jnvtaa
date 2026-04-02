export default function LoadingSpinner({ size = "md" }) {
  const sizes = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
  };

  return (
    <div className="flex items-center justify-center p-8" role="status" aria-live="polite">
      <span className="sr-only">Loading</span>
      <div
        className={`${sizes[size]} animate-spin rounded-wobblySm border-[3px] border-muted border-t-accent`}
      />
    </div>
  );
}
