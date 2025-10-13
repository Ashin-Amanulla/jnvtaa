import { useEffect, useState } from "react";

export default function StatsCounter({ end, duration = 2000, label, icon, color }) {
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
    <div className="text-center p-8 rounded-xl bg-gradient-to-br from-gray-50 to-white border border-gray-200 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-2">
      <div
        className={`${color} w-20 h-20 rounded-full flex items-center justify-center text-white mx-auto mb-4 shadow-lg`}
      >
        {icon}
      </div>
      <div className="text-4xl font-bold text-gray-900 mb-2">{count}+</div>
      <div className="text-gray-600 font-medium">{label}</div>
    </div>
  );
}

