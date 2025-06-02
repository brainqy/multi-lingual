
"use client";

import { useState, useEffect, useMemo } from 'react';
import { sampleAnnouncements, sampleUserProfile } from '@/lib/sample-data';
import type { Announcement } from '@/types';
import { AlertCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function AnnouncementBanner() {
  const [activeAnnouncements, setActiveAnnouncements] = useState<Announcement[]>([]);
  const [currentAnnouncementIndex, setCurrentAnnouncementIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const currentUser = sampleUserProfile;

  useEffect(() => {
    const now = new Date();
    const filtered = sampleAnnouncements.filter(ann => {
      const startDate = new Date(ann.startDate);
      const endDate = ann.endDate ? new Date(ann.endDate) : null;
      
      const isActiveDate = startDate <= now && (!endDate || endDate >= now);
      const isPublished = ann.status === 'Published';
      
      let matchesAudience = false;
      if (ann.audience === 'All Users') {
        matchesAudience = true;
      } else if (ann.audience === 'Specific Tenant' && ann.audienceTarget === currentUser.tenantId) {
        matchesAudience = true;
      } else if (ann.audience === 'Specific Role' && ann.audienceTarget === currentUser.role) {
        matchesAudience = true;
      }

      return isPublished && isActiveDate && matchesAudience;
    });
    setActiveAnnouncements(filtered);
    setIsVisible(filtered.length > 0);
  }, [currentUser.tenantId, currentUser.role]);

  useEffect(() => {
    if (activeAnnouncements.length > 1) {
      const interval = setInterval(() => {
        setCurrentAnnouncementIndex(prevIndex => (prevIndex + 1) % activeAnnouncements.length);
      }, 10000); // Change announcement every 10 seconds
      return () => clearInterval(interval);
    }
  }, [activeAnnouncements.length]);

  const currentAnnouncement = useMemo(() => {
    if (activeAnnouncements.length === 0) return null;
    return activeAnnouncements[currentAnnouncementIndex];
  }, [activeAnnouncements, currentAnnouncementIndex]);

  if (!isVisible || !currentAnnouncement) {
    return null;
  }

  return (
    <div className="bg-primary/10 text-primary-foreground p-2 border-b border-primary/30 relative shadow-sm">
      <div className="container mx-auto flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-primary flex-shrink-0" />
          <div className="text-sm text-primary">
            <strong className="font-semibold">{currentAnnouncement.title}:</strong>
            <span className="ml-1 opacity-90 line-clamp-1">{currentAnnouncement.content}</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
            {activeAnnouncements.length > 1 && (
                <div className="flex gap-0.5">
                    {activeAnnouncements.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => setCurrentAnnouncementIndex(idx)}
                            className={cn(
                                "h-1.5 w-1.5 rounded-full transition-all duration-300",
                                idx === currentAnnouncementIndex ? "bg-primary w-3" : "bg-primary/50 hover:bg-primary/70"
                            )}
                            aria-label={`View announcement ${idx + 1}`}
                        />
                    ))}
                </div>
            )}
            <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-primary hover:bg-primary/20"
            onClick={() => setIsVisible(false)}
            aria-label="Dismiss announcement"
            >
            <X className="h-4 w-4" />
            </Button>
        </div>
      </div>
    </div>
  );
}
