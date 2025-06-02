
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useI18n } from "@/hooks/use-i18n";
import { BookOpen } from "lucide-react";

export default function DocumentationPage() {
  const { t } = useI18n();
  const pageTitle = "Documentation"; // Example: t("appFeatures.documentation.title")

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-2xl text-primary flex items-center gap-2">
            <BookOpen className="h-6 w-6"/>
            {pageTitle}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Find help and guides here. Content for {pageTitle} coming soon.</p>
        </CardContent>
      </Card>
    </div>
  );
}
