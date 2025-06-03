
"use client";
import type React from 'react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isBefore, startOfToday, addDays, parse } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIconLucide } from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

const timeSlots = ["08:30", "09:30", "10:30", "11:30", "12:30", "13:30", "14:30", "15:30", "16:30", "17:30", "18:30"];

interface PracticeDateTimeSelectorProps {
  initialSelectedDate?: Date;
  initialSelectedTime?: string;
  onDateTimeChange: (date: Date | undefined, time: string | undefined) => void;
}

export default function PracticeDateTimeSelector({ initialSelectedDate, initialSelectedTime, onDateTimeChange }: PracticeDateTimeSelectorProps) {
  const [currentDisplayMonth, setCurrentDisplayMonth] = useState(initialSelectedDate || new Date());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(initialSelectedDate);
  const [selectedTime, setSelectedTime] = useState<string | undefined>(initialSelectedTime);
  const [showCalendarPopover, setShowCalendarPopover] = useState(false);

  const today = startOfToday();

  useEffect(() => {
    setSelectedDate(initialSelectedDate);
  }, [initialSelectedDate]);

  useEffect(() => {
    setSelectedTime(initialSelectedTime);
  }, [initialSelectedTime]);

  // Generate the next 7 days for quick selection
  const next7Days = Array.from({ length: 7 }, (_, i) => addDays(today, i));

  const handleDaySelect = (day: Date | undefined) => {
    if (!day || isBefore(day, today)) return; 
    setSelectedDate(day);
    const newTime = day && isSameDay(day, selectedDate || new Date()) ? selectedTime : undefined; // Keep time if same day selected
    setSelectedTime(newTime); 
    onDateTimeChange(day, newTime);
    setShowCalendarPopover(false); 
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    onDateTimeChange(selectedDate, time);
  };
  
  const getDayOfWeekShort = (date: Date) => format(date, 'E');


  return (
    // Removed encompassing Card to allow embedding in dialog
    <div className="space-y-4"> {/* Reduced vertical spacing */}
        <div className="flex items-center justify-between p-2 border rounded-md">
          <Button variant="ghost" size="icon" onClick={() => setCurrentDisplayMonth(subMonths(currentDisplayMonth, 1))}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <span className="text-md font-medium">{format(currentDisplayMonth, 'MMMM, yyyy')}</span>
          <Popover open={showCalendarPopover} onOpenChange={setShowCalendarPopover}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon">
                <CalendarIconLucide className="h-5 w-5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDaySelect}
                initialFocus
                month={currentDisplayMonth}
                onMonthChange={setCurrentDisplayMonth}
                disabled={(date) => isBefore(date, today)}
              />
            </PopoverContent>
          </Popover>
          <Button variant="ghost" size="icon" onClick={() => setCurrentDisplayMonth(addMonths(currentDisplayMonth, 1))}>
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>

        {/* Horizontal Day Scroller */}
        <div className="flex space-x-1.5 overflow-x-auto pb-1.5 -mb-1.5 py-1.5 bg-secondary/50 rounded-md p-1.5">
          {next7Days.map(day => (
            <Button
              key={day.toString()}
              variant={selectedDate && isSameDay(day, selectedDate) ? "default" : "outline"}
              className={cn(
                "flex flex-col items-center justify-center h-auto p-2 min-w-[50px] shadow-sm text-xs", // Smaller buttons
                "data-[selected=true]:bg-primary data-[selected=true]:text-primary-foreground",
                 isBefore(day, today) && "opacity-50 cursor-not-allowed",
                 selectedDate && isSameDay(day, selectedDate) && "ring-2 ring-primary ring-offset-1" // Adjusted ring
              )}
              onClick={() => !isBefore(day, today) && handleDaySelect(day)}
              disabled={isBefore(day, today)}
              data-selected={selectedDate && isSameDay(day, selectedDate)}
            >
              <span>{getDayOfWeekShort(day)}</span>
              <span className="text-md font-semibold">{format(day, 'd')}</span>
            </Button>
          ))}
        </div>


        {selectedDate && (
          <div className="pt-3">
            <p className="text-sm font-medium text-foreground mb-2">Available time slots for {format(selectedDate, 'PPP')}:</p>
            <ToggleGroup
              type="single"
              value={selectedTime}
              onValueChange={(value) => { if (value) handleTimeSelect(value); }}
              className="grid grid-cols-3 sm:grid-cols-4 gap-1.5" // Tighter gap
            >
              {timeSlots.map(slot => (
                <ToggleGroupItem 
                    key={slot} 
                    value={slot} 
                    aria-label={slot} 
                    className="py-2 px-2.5 h-auto text-xs border data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:shadow-sm" // Smaller text and padding
                >
                  {slot}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
        )}
        {/* Footer and main action buttons will be handled by the parent dialog */}
    </div>
  );
}
