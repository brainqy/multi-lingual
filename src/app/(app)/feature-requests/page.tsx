
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useI18n } from "@/hooks/use-i18n";
import { Lightbulb } from "lucide-react";

export default function FeatureRequestsPage() {
  const { t } = useI18n();
  const pageTitle = "Feature Requests"; // Example: t("appFeatures.featureRequests.title")

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-2xl text-primary flex items-center gap-2">
            <Lightbulb className="h-6 w-6"/>
            {pageTitle}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Suggest new features or vote on existing ones. Content for {pageTitle} coming soon.</p>
        </CardContent>
      </Card>
    </div>
  );
}
