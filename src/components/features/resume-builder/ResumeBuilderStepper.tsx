"use client";

import type React from 'react';
import { RESUME_BUILDER_STEPS, type ResumeBuilderStep } from '@/types';
import { cn } from '@/lib/utils';
import { CheckCircle } from 'lucide-react';

interface ResumeBuilderStepperProps {
  currentStep: ResumeBuilderStep;
  onStepClick?: (step: ResumeBuilderStep) => void; // Optional: if steps are clickable
}

export default function ResumeBuilderStepper({ currentStep, onStepClick }: ResumeBuilderStepperProps) {
  const currentStepIndex = RESUME_BUILDER_STEPS.findIndex(s => s.id === currentStep);

  return (
    <nav aria-label="Resume building steps" className="space-y-3">
      {RESUME_BUILDER_STEPS.map((step, index) => (
        <div key={step.id} className="flex items-center">
          <div className="relative flex items-center">
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center border-2 shrink-0 transition-all duration-300",
                index < currentStepIndex ? "bg-green-500 border-green-500 text-white" :
                index === currentStepIndex ? "bg-green-500 border-green-400 text-white scale-110 shadow-lg" :
                "bg-slate-600 border-slate-500 text-slate-400",
                onStepClick ? "cursor-pointer hover:border-green-300" : ""
              )}
              onClick={() => onStepClick && onStepClick(step.id)}
              title={step.title}
            >
              {index < currentStepIndex ? <CheckCircle size={18} /> : <span>{index + 1}</span>}
            </div>
            {index < RESUME_BUILDER_STEPS.length - 1 && (
              <div className={cn(
                  "h-8 w-px absolute left-1/2 -translate-x-1/2 top-full mt-0.5 transition-all duration-300",
                  index < currentStepIndex ? "bg-green-500" : "bg-slate-500"
                )}
              />
            )}
          </div>
          <span
            className={cn(
              "ml-3 text-sm transition-colors duration-300",
              index === currentStepIndex ? "font-semibold text-white" : "text-slate-300",
              onStepClick ? "cursor-pointer hover:text-white" : ""
            )}
            onClick={() => onStepClick && onStepClick(step.id)}
          >
            {step.title}
          </span>
        </div>
      ))}
    </nav>
  );
}