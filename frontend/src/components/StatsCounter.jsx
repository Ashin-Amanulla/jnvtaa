import { useEffect, useState } from "react";
import { SketchIconCircle } from "@/components/SketchIconCircle";
import { cn } from "@/utils/cn";

export default function StatsCounter({ end, duration = 2000, label, icon }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime;
    let animationFrame;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;

      if (progress < duration) {
        const percentage = progress / duration;
        const currentCount = Math.floor(end * percentage);
        setCount(currentCount);
        animationFrame = requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [end, duration]);

  return (
    <div
      className={cn(
        "flex flex-col items-center border-[3px] border-border bg-white p-6 text-center shadow-sketch transition-transform duration-100",
        "hover:-rotate-1 hover:shadow-sketchLg md:p-8",
      )}
      style={{
        borderRadius: "28px 8px 22px 8px / 8px 22px 8px 28px",
      }}
    >
      <SketchIconCircle className="mb-4 text-foreground">
        {icon}
      </SketchIconCircle>
      <div className="font-display text-4xl font-bold tracking-tight text-foreground md:text-5xl">
        {count}+
      </div>
      <div className="mt-3 font-sans text-base text-muted-foreground md:text-lg">
        {label}
      </div>
    </div>
  );
}
