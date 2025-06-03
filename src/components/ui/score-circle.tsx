
"use client";

import type React from 'react';
import { cn } from "@/lib/utils";

interface ScoreCircleProps {
  score: number;
  size?: "sm" | "lg" | "xl";
  label?: string;
  className?: string;
}

const ScoreCircle: React.FC<ScoreCircleProps> = ({
  score,
  size = "lg",
  label = "Match",
  className,
}) => {
  const R = 45; // Radius for a 100x100 viewBox
  const CIRCUMFERENCE = 2 * Math.PI * R;
  const effectiveScore = Math.max(0, Math.min(score, 100)); // Clamp score between 0 and 100
  const strokeDashoffset = CIRCUMFERENCE - (effectiveScore / 100) * CIRCUMFERENCE;

  const sizeConfig = {
    sm: {
      circleClass: "w-20 h-20", // 80px
      textClass: "text-xl",
      subTextClass: "text-[10px]",
      strokeWidth: 6,
    },
    lg: {
      circleClass: "w-28 h-28", // 112px
      textClass: "text-3xl",
      subTextClass: "text-xs",
      strokeWidth: 8,
    },
    xl: {
      circleClass: "w-36 h-36", // 144px
      textClass: "text-4xl",
      subTextClass: "text-sm",
      strokeWidth: 10,
    },
  };

  const currentSizeConfig = sizeConfig[size];

  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center",
        currentSizeConfig.circleClass,
        "shadow-md rounded-full", // Added shadow for depth
        className
      )}
    >
      <svg className="absolute inset-0" viewBox="0 0 100 100">
        <circle
          className="text-border" // Use border color for the track, often lighter
          strokeWidth={currentSizeConfig.strokeWidth * 0.75} // Track is thinner
          stroke="currentColor"
          fill="transparent"
          r={R}
          cx="50"
          cy="50"
        />
        <circle
          className="text-primary" // Progress color
          strokeWidth={currentSizeConfig.strokeWidth}
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={R}
          cx="50"
          cy="50"
          transform="rotate(-90 50 50)" // Correct rotation origin for viewBox
          style={{ transition: 'stroke-dashoffset 0.5s ease-out' }} // Smooth animation
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center z-10">
        <span className={cn("font-bold text-primary", currentSizeConfig.textClass)}>
          {effectiveScore}%
        </span>
        {label && (
          <span className={cn("text-muted-foreground mt-0.5", currentSizeConfig.subTextClass)}>
            {label}
          </span>
        )}
      </div>
    </div>
  );
};

export default ScoreCircle;
