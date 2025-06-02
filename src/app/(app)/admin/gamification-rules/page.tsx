
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useI18n } from "@/hooks/use-i18n";
import { ListChecks } from "lucide-react";

export default function GamificationRulesPage() {
  const { t } = useI18n();
  const pageTitle = "Gamification Rules"; 

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-2xl text-primary flex items-center gap-2">
            <ListChecks className="h-6 w-6"/>
            {pageTitle}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Define and manage XP points, badges, and other gamification elements. Content for {pageTitle} coming soon.</p>
        </CardContent>
      </Card>
    </div>
  );
}
