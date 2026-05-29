import { useState, useEffect, useRef } from "react";
import { SketchIconCircle } from "@/components/SketchIconCircle";

export default function StatsCounter({ end, label, icon, duration = 2000 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          let start = 0;
          const increment = end / (duration / 16);
          const timer = setInterval(() => {
            start += increment;
            if (start >= end) {
              setCount(end);
              clearInterval(timer);
            } else {
              setCount(Math.floor(start));
            }
          }, 16);
          return () => clearInterval(timer);
        }
      },
      { threshold: 0.3 },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end, duration]);

  return (
    <div
      ref={ref}
      className="rounded-2xl border border-border bg-card p-6 text-center shadow-card transition-all duration-200 hover:-translate-y-1 hover:shadow-cardHover"
    >
      <div className="mb-4 flex justify-center">
        <SketchIconCircle>{icon}</SketchIconCircle>
      </div>
      <div className="font-display text-4xl font-bold text-foreground md:text-5xl">
        {count}+
      </div>
      <div className="mt-2 font-sans text-sm text-muted-foreground md:text-base">
        {label}
      </div>
    </div>
  );
}
