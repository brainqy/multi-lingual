
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useI18n } from "@/hooks/use-i18n";
import { FileText } from "lucide-react";

export default function AiResumeWriterPage() {
  const { t } = useI18n();
  const pageTitle = "AI Resume Writer"; // Example: t("appFeatures.aiResumeWriter.title")

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-2xl text-primary flex items-center gap-2">
            <FileText className="h-6 w-6"/>
            {pageTitle}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Let our AI help you craft the perfect resume. Content for {pageTitle} coming soon.</p>
        </CardContent>
      </Card>
    </div>
  );
}
