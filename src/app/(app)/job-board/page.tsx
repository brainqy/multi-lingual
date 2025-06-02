
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useI18n } from "@/hooks/use-i18n";
import { Briefcase } from "lucide-react";

export default function JobBoardPage() {
  const { t } = useI18n();
  const pageTitle = "Job Board"; // Example: t("appFeatures.jobBoard.title")

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-2xl text-primary flex items-center gap-2">
            <Briefcase className="h-6 w-6"/>
            {pageTitle}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Find your next job opportunity. Content for {pageTitle} coming soon.</p>
        </CardContent>
      </Card>
    </div>
  );
}
