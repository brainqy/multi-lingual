
"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogDescription } from "@/components/ui/dialog";
import type { LiveInterviewSession } from '@/types';
import PracticeDateTimeSelector from './PracticeDateTimeSelector';
import { Calendar as CalendarIcon, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface RescheduleSessionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  session: LiveInterviewSession;
  onSubmit: (newDateTime: Date) => void;
}

export default function RescheduleSessionDialog({ isOpen, onClose, session, onSubmit }: RescheduleSessionDialogProps) {
  const [newDateTime, setNewDateTime] = useState<Date | null>(null);

  useEffect(() => {
    if (isOpen) {
      setNewDateTime(new Date(session.scheduledTime));
    } else {
      setNewDateTime(null);
    }
  }, [isOpen, session.scheduledTime]);

  const handleDateTimeChange = (date: Date | undefined, time: string | undefined) => {
    if (date && time) {
      const [hourStr, minuteStr] = time.match(/\d+/g) || ['0', '0'];
      const isPM = time.includes('PM');
      let hour = parseInt(hourStr, 10);
      if (isPM && hour !== 12) hour += 12;
      if (!isPM && hour === 12) hour = 0;
      const finalDate = new Date(date);
      finalDate.setHours(hour, parseInt(minuteStr, 10), 0, 0);
      setNewDateTime(finalDate);
    }
  };

  const handleSubmit = () => {
    if (newDateTime) {
      onSubmit(newDateTime);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarIcon className="h-6 w-6 text-primary" />
            Reschedule Session
          </DialogTitle>
          <DialogDescription>
            Select a new date and time for your session: "{session.title}".
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-muted-foreground mb-2">
            Current time: {format(new Date(session.scheduledTime), 'PPP @ p')}
          </p>
          <PracticeDateTimeSelector
            initialSelectedDate={newDateTime || undefined}
            onDateTimeChange={handleDateTimeChange}
          />
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={handleSubmit} disabled={!newDateTime}>
            Send Reschedule Request
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
