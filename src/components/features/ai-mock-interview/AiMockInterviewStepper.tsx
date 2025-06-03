"use client";

import type React from 'react';
import { MOCK_INTERVIEW_STEPS, type MockInterviewStepId } from '@/types';
import { cn } from '@/lib/utils';
import { CheckCircle, Settings, Mic, ListChecks } from 'lucide-react'; // Added icons

interface AiMockInterviewStepperProps {
  currentStep: MockInterviewStepId;
  onStepClick?: (step: MockInterviewStepId) => void;
}

const stepIcons: Record<MockInterviewStepId, React.ElementType> = {
  setup: Settings,
  interview: Mic,
  feedback: ListChecks,
};

export default function AiMockInterviewStepper({ currentStep, onStepClick }: AiMockInterviewStepperProps) {
  const currentStepIndex = MOCK_INTERVIEW_STEPS.findIndex(s => s.id === currentStep);

  return (
    <nav aria-label="AI Mock Interview steps" className="space-y-3">
      {MOCK_INTERVIEW_STEPS.map((step, index) => {
        const IconComponent = stepIcons[step.id];
        return (
          <div key={step.id} className="flex items-center">
            <div className="relative flex items-center">
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center border-2 shrink-0 transition-all duration-300",
                  index < currentStepIndex ? "bg-green-600 border-green-600 text-white" :
                  index === currentStepIndex ? "bg-primary border-primary/70 text-primary-foreground scale-110 shadow-lg" :
                  "bg-card border-border text-muted-foreground",
                  onStepClick && index <= currentStepIndex ? "cursor-pointer hover:border-primary/50" : "cursor-default"
                )}
                onClick={() => onStepClick && index <= currentStepIndex && onStepClick(step.id)}
                title={step.title}
              >
                {index < currentStepIndex ? <CheckCircle size={20} /> : <IconComponent size={18} />}
              </div>
              {index < MOCK_INTERVIEW_STEPS.length - 1 && (
                <div className={cn(
                    "h-6 w-px absolute left-1/2 -translate-x-1/2 top-full mt-0.5 transition-all duration-300",
                    index < currentStepIndex ? "bg-green-600" : "bg-border"
                  )}
                />
              )}
            </div>
            <span
              className={cn(
                "ml-3 text-sm transition-colors duration-300",
                index === currentStepIndex ? "font-semibold text-foreground" : "text-muted-foreground",
                onStepClick && index <= currentStepIndex ? "cursor-pointer hover:text-foreground" : "cursor-default"
              )}
              onClick={() => onStepClick && index <= currentStepIndex && onStepClick(step.id)}
            >
              {step.title}
            </span>
          </div>
        );
      })}
    </nav>
  );
}