
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
  label,
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
      percentClass: "text-sm",
      strokeWidth: 6,
    },
    lg: {
      circleClass: "w-28 h-28", // 112px
      textClass: "text-3xl",
      subTextClass: "text-xs",
      percentClass: "text-base",
      strokeWidth: 8,
    },
    xl: {
      circleClass: "w-36 h-36", // 144px
      textClass: "text-4xl",
      subTextClass: "text-sm",
      percentClass: "text-lg",
      strokeWidth: 10,
    },
  };

  const currentSizeConfig = sizeConfig[size];

  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center",
        currentSizeConfig.circleClass,
        "shadow-md rounded-full",
        className
      )}
    >
      <svg className="absolute inset-0" viewBox="0 0 100 100">
        <circle
          className="text-border"
          strokeWidth={currentSizeConfig.strokeWidth * 0.75}
          stroke="currentColor"
          fill="transparent"
          r={R}
          cx="50"
          cy="50"
        />
        <circle
          className="text-primary"
          strokeWidth={currentSizeConfig.strokeWidth}
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={R}
          cx="50"
          cy="50"
          transform="rotate(-90 50 50)"
          style={{ transition: 'stroke-dashoffset 0.5s ease-out' }}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center z-10 text-center">
        <div className={cn("font-bold text-primary", currentSizeConfig.textClass)}>
          {effectiveScore}
          <span className={cn(currentSizeConfig.percentClass, "font-semibold")}>%</span>
        </div>
        {label && (
          <span className={cn("text-muted-foreground -mt-1", currentSizeConfig.subTextClass)}>
            {label}
          </span>
        )}
      </div>
    </div>
  );
};

export default ScoreCircle;
