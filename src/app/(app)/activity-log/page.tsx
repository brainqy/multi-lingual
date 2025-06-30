"use client";
import { useI18n } from "@/hooks/use-i18n";
import { Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BarChart2, Clock } from "lucide-react";
import { sampleActivities } from "@/lib/sample-data";
import { formatDistanceToNow } from 'date-fns';

export default function ActivityLogPage() {
  const { t } = useI18n();

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight text-foreground">{t("activityLog.title")}</h1>
      
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart2 className="h-6 w-6 text-primary"/>
            {t("activityLog.recentActivities")}
          </CardTitle>
          <CardDescription>
            {t("activityLog.description")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sampleActivities.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              {t("activityLog.noActivities")}
            </p>
          ) : (
            <ScrollArea className="h-[500px] pr-4">
              <ul className="space-y-4">
                {sampleActivities.map((activity) => (
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
