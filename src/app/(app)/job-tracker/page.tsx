
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useI18n } from "@/hooks/use-i18n";
import { Target } from "lucide-react";

export default function JobTrackerPage() {
  const { t } = useI18n();
  const pageTitle = "Job Tracker"; // Example: t("appFeatures.jobTracker.title")

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-2xl text-primary flex items-center gap-2">
            <Target className="h-6 w-6"/>
            {pageTitle}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Track your job applications. Content for {pageTitle} coming soon.</p>
        </CardContent>
      </Card>
    </div>
  );
}
