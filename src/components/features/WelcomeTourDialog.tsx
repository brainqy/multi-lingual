
"use client";

import type React from 'react';
import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { TourStep } from "@/types";
import { ScrollArea } from '../ui/scroll-area';
import { CheckCircle } from 'lucide-react';

interface WelcomeTourDialogProps {
  isOpen: boolean;
  onClose: () => void;
  tourKey: string; // Unique key for this tour in localStorage
  steps: TourStep[];
  title: string;
}

export default function WelcomeTourDialog({ isOpen, onClose, tourKey, steps, title }: WelcomeTourDialogProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  
  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      handleFinish();
    }
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };
  
  const handleFinish = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(tourKey, 'true');
    }
    onClose();
    setCurrentStepIndex(0); // Reset for next time if needed, though typically won't show again
  };

  // If only one step, consider it a simple welcome/info dialog
  const isSingleStepInfo = steps.length === 1;
  const currentStep = steps[currentStepIndex];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleFinish(); }}>
      <DialogContent className="sm:max-w-md bg-card text-card-foreground">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-primary">{title}</DialogTitle>
          {isSingleStepInfo && currentStep ? (
            <DialogDescription className="mt-2 text-muted-foreground">
              {currentStep.description}
            </DialogDescription>
          ) : (
             currentStep && <DialogDescription className="mt-1 text-sm text-muted-foreground">Step {currentStepIndex + 1} of {steps.length}: {currentStep.title}</DialogDescription>
          )}
        </DialogHeader>
        
        {!isSingleStepInfo && currentStep && (
          <ScrollArea className="max-h-[60vh] my-4 pr-2">
            <p className="text-sm text-foreground whitespace-pre-line">{currentStep.description}</p>
          </ScrollArea>
        )}

        <DialogFooter className="mt-4 gap-2 sm:justify-between">
          {!isSingleStepInfo && (
            <Button variant="outline" onClick={handlePrevious} disabled={currentStepIndex === 0}>
              Previous
            </Button>
          )}
          <Button onClick={handleNext} className="bg-primary hover:bg-primary/90 text-primary-foreground">
            {isSingleStepInfo || currentStepIndex === steps.length - 1 ? (
              <> <CheckCircle className="mr-2 h-4 w-4" /> Got it! </>
            ) : (
              "Next"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
