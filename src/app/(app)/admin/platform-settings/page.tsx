
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useI18n } from "@/hooks/use-i18n";
import { Server } from "lucide-react";

export default function PlatformSettingsPage() {
  const { t } = useI18n();
  const pageTitle = "Platform Settings"; 

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-2xl text-primary flex items-center gap-2">
            <Server className="h-6 w-6"/>
            {pageTitle}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Manage global platform settings, integrations, and core configurations. Content for {pageTitle} coming soon.</p>
        </CardContent>
      </Card>
    </div>
  );
}
