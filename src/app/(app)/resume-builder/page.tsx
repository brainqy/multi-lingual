
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useI18n } from "@/hooks/use-i18n";
import { FilePlus2 } from "lucide-react";

export default function ResumeBuilderPage() {
  const { t } = useI18n();
  const pageTitle = "Resume Builder"; // Example: t("appFeatures.resumeBuilder.title")

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-2xl text-primary flex items-center gap-2">
            <FilePlus2 className="h-6 w-6"/>
            {pageTitle}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Build your professional resume. Content for {pageTitle} coming soon.</p>
        </CardContent>
      </Card>
    </div>
  );
}
