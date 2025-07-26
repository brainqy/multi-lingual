
"use client";
import { useI18n } from "@/hooks/use-i18n";
import { Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BarChart2, Clock, Loader2 } from "lucide-react";
import { formatDistanceToNow } from 'date-fns';
import { useState, useEffect, useCallback } from "react";
import type { Activity as ActivityType } from "@/types";
import { getActivities } from "@/lib/actions/activities";
import { sampleUserProfile } from "@/lib/sample-data";

export default function ActivityLogPage() {
  const { t } = useI18n();
  const [activities, setActivities] = useState<ActivityType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchActivities = useCallback(async () => {
    setIsLoading(true);
    const userActivities = await getActivities(sampleUserProfile.id);
    setActivities(userActivities);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight text-foreground">{t("activityLog.title", { default: "Activity Log" })}</h1>
      
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart2 className="h-6 w-6 text-primary"/>
            {t("activityLog.recentActivities", { default: "Recent Activities" })}
          </CardTitle>
          <CardDescription>
            {t("activityLog.description", { default: "A log of your recent actions and system events within JobMatch AI." })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
             <div className="flex justify-center items-center h-48"><Loader2 className="h-8 w-8 animate-spin text-primary"/></div>
          ) : activities.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              {t("activityLog.noActivities", { default: "No activities recorded yet." })}
            </p>
          ) : (
            <ScrollArea className="h-[500px] pr-4">
              <ul className="space-y-4">
                {activities.map((activity) => (
                  <li key={activity.id} className="flex items-start space-x-3 p-4 bg-card border rounded-lg shadow-sm hover:bg-secondary/30 transition-colors">
                    <div className="flex-shrink-0 pt-1">
                      <Clock className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{activity.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
