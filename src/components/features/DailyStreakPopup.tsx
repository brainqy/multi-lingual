
"use client";

import type React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { UserProfile } from "@/types";
import { Flame, Trophy } from "lucide-react";
import { cn } from '@/lib/utils';
import { useI18n } from '@/hooks/use-i18n';

interface DailyStreakPopupProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile | null;
}

const dayLabelsKeys = ["S", "M", "T", "W", "Th", "F", "Sa"] as const; // Sun, Mon, Tue, Wed, Thu, Fri, Sat

export default function DailyStreakPopup({ isOpen, onClose, userProfile }: DailyStreakPopupProps) {
  const { t } = useI18n();
  if (!userProfile) return null;

  const todayIndex = new Date().getDay(); // 0 for Sunday, 6 for Saturday

  const displayActivity = userProfile.weeklyActivity || Array(7).fill(false);
  
  const adjustedDayLabels = [...Array(7)].map((_, i) => {
    const dayOffset = (todayIndex - (6 - i) + 7) % 7;
    return t(`dailyStreakPopup.dayLabels.${dayLabelsKeys[dayOffset]}` as any, { defaultValue: dayLabelsKeys[dayOffset]});
  });


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-card text-card-foreground p-0 overflow-hidden">
        <div className="bg-gray-800 text-white p-6 rounded-t-lg">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-2xl font-bold text-center">{t("dailyStreakPopup.title", { default: "Daily Streak!" })}</DialogTitle>
          </DialogHeader>

          <div className="flex justify-around items-center mb-6 text-center">
            <div>
              <p className="text-4xl font-bold">{userProfile.dailyStreak || 0}</p>
              <p className="text-sm text-gray-300">{t("dailyStreakPopup.currentStreakLabel", { default: "Current Streak" })}</p>
            </div>
            <div>
              <p className="text-4xl font-bold flex items-center justify-center">
                {userProfile.longestStreak || 0}
                <Trophy className="ml-2 h-7 w-7 text-yellow-400" />
              </p>
              <p className="text-sm text-gray-300">{t("dailyStreakPopup.longestStreakLabel", { default: "Longest Streak" })}</p>
            </div>
          </div>

          <div className="flex justify-center items-end space-x-2 mb-6">
            {displayActivity.map((isActive, index) => (
              <div key={index} className="flex flex-col items-center relative">
                {index === 6 && ( 
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
            {t("dailyStreakPopup.totalActiveDaysLabel", { default: "Total Active Days:" })} {userProfile.totalActiveDays || 0}
          </p>
        </div>
        
        <DialogFooter className="p-6 bg-card border-t border-border">
          <Button onClick={onClose} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
            {t("dailyStreakPopup.keepItUpButton", { default: "Keep it Up!" })}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

    

    