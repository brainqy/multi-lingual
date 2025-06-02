
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useI18n } from "@/hooks/use-i18n";
import { ShieldAlert } from "lucide-react";

export default function ContentModerationPage() {
  const { t } = useI18n();
  const pageTitle = "Content Moderation"; 

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-2xl text-primary flex items-center gap-2">
            <ShieldAlert className="h-6 w-6"/>
            {pageTitle}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Review and manage flagged content from community feeds and other user-generated areas. Content for {pageTitle} coming soon.</p>
        </CardContent>
      </Card>
    </div>
  );
}
