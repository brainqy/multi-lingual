
"use client";

import type React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { UserProfile } from "@/types";
import { Flame, Trophy } from "lucide-react";
import { cn } from '@/lib/utils';

interface DailyStreakPopupProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile | null;
}

const dayLabels = ["S", "M", "T", "W", "T", "F", "S"]; // Sun, Mon, Tue, Wed, Thu, Fri, Sat

export default function DailyStreakPopup({ isOpen, onClose, userProfile }: DailyStreakPopupProps) {
  if (!userProfile) return null;

  const todayIndex = new Date().getDay(); // 0 for Sunday, 6 for Saturday

  // Create a 7-day array for display, aligning today with the last element of weeklyActivity
  // weeklyActivity: [day-6, day-5, day-4, day-3, day-2, day-1, today]
  const displayActivity = userProfile.weeklyActivity || Array(7).fill(false);
  
  // Adjust dayLabels to start from 7 days ago, ending with today
  const adjustedDayLabels = [...Array(7)].map((_, i) => {
    const dayOffset = (todayIndex - (6 - i) + 7) % 7;
    return dayLabels[dayOffset];
  });


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-card text-card-foreground p-0 overflow-hidden">
        <div className="bg-gray-800 text-white p-6 rounded-t-lg">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-2xl font-bold text-center">Your Activity Streak!</DialogTitle>
          </DialogHeader>

          <div className="flex justify-around items-center mb-6 text-center">
            <div>
              <p className="text-4xl font-bold">{userProfile.dailyStreak || 0}</p>
              <p className="text-sm text-gray-300">Current streak</p>
            </div>
            <div>
              <p className="text-4xl font-bold flex items-center justify-center">
                {userProfile.longestStreak || 0}
                <Trophy className="ml-2 h-7 w-7 text-yellow-400" />
              </p>
              <p className="text-sm text-gray-300">Longest streak</p>
            </div>
          </div>

          <div className="flex justify-center items-end space-x-2 mb-6">
            {displayActivity.map((isActive, index) => (
              <div key={index} className="flex flex-col items-center relative">
                {/* Pointer for today */}
                {index === 6 && ( // Last element is today
                  <div className="absolute -top-3 w-0 h-0 
                    border-l-[6px] border-l-transparent
                    border-t-[8px] border-t-pink-500
                    border-r-[6px] border-r-transparent"
                  />
                )}
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center border-2",
                  isActive ? "bg-pink-500 border-pink-400" : "bg-gray-600 border-gray-500"
                )}>
                  {isActive && <Flame className="h-5 w-5 text-white" />}
                </div>
                <span className="mt-1 text-xs text-gray-300">{adjustedDayLabels[index]}</span>
              </div>
            ))}
          </div>

          <p className="text-center text-lg font-semibold">
            Total active days: {userProfile.totalActiveDays || 0}
          </p>
        </div>
        
        <DialogFooter className="p-6 bg-card border-t border-border">
          <Button onClick={onClose} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
            Keep it up!
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
