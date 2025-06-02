
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useI18n } from "@/hooks/use-i18n";
import { Users2 } from "lucide-react";

export default function AlumniConnectPage() {
  const { t } = useI18n();
  const pageTitle = "Alumni Connect"; // Example: t("appFeatures.alumniConnect.title")

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-2xl text-primary flex items-center gap-2">
            <Users2 className="h-6 w-6"/>
            {pageTitle}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Connect with fellow alumni. Content for {pageTitle} coming soon.</p>
        </CardContent>
      </Card>
    </div>
  );
}
