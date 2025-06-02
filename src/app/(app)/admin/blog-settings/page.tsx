
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useI18n } from "@/hooks/use-i18n";
import { Settings2 } from "lucide-react";

export default function BlogSettingsPage() {
  const { t } = useI18n();
  const pageTitle = "Blog Settings"; 

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-2xl text-primary flex items-center gap-2">
            <Settings2 className="h-6 w-6"/>
            {pageTitle}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Configure blog categories, AI generation settings, and author permissions. Content for {pageTitle} coming soon.</p>
        </CardContent>
      </Card>
    </div>
  );
}
