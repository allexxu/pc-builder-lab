import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface CountdownTimerProps {
  seconds: number;
  totalSeconds: number;
  onComplete?: () => void;
  size?: "small" | "large";
}

const CountdownTimer = ({
  seconds,
  totalSeconds,
  onComplete,
  size = "large",
}: CountdownTimerProps) => {
  const [displaySeconds, setDisplaySeconds] = useState(seconds);

  useEffect(() => {
    setDisplaySeconds(seconds);
  }, [seconds]);

  useEffect(() => {
    if (displaySeconds <= 0 && onComplete) {
      onComplete();
    }
  }, [displaySeconds, onComplete]);

  const progress = (displaySeconds / totalSeconds) * 100;
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const isLarge = size === "large";
  const containerSize = isLarge ? "w-32 h-32" : "w-20 h-20";
  const textSize = isLarge ? "text-4xl" : "text-2xl";

  // Color changes based on time remaining
  const getColor = () => {
    if (displaySeconds <= 3) return "text-red-500 stroke-red-500";
    if (displaySeconds <= 5) return "text-yellow-500 stroke-yellow-500";
    return "text-primary stroke-primary";
  };

  return (
    <div className={cn("relative flex items-center justify-center", containerSize)}>
      <svg
        className="absolute transform -rotate-90"
        width="100%"
        height="100%"
        viewBox="0 0 100 100"
      >
        {/* Background circle */}
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          className="text-muted/20"
        />
        {/* Progress circle */}
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          strokeWidth="8"
          strokeLinecap="round"
          className={cn("transition-all duration-300", getColor())}
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: strokeDashoffset,
          }}
        />
      </svg>
      <span className={cn("font-bold tabular-nums", textSize, getColor())}>
        {Math.max(0, Math.floor(displaySeconds))}
      </span>
    </div>
  );
};

export default CountdownTimer;
