
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useI18n } from "@/hooks/use-i18n";
import { Megaphone } from "lucide-react";

export default function AnnouncementsPage() {
  const { t } = useI18n();
  const pageTitle = "Announcements Management"; 

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-2xl text-primary flex items-center gap-2">
            <Megaphone className="h-6 w-6"/>
            {pageTitle}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Create and manage platform-wide or tenant-specific announcements. Content for {pageTitle} coming soon.</p>
        </CardContent>
      </Card>
    </div>
  );
}
