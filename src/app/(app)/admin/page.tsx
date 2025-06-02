
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useI18n } from "@/hooks/use-i18n";
import { ShieldCheck } from "lucide-react";

export default function AdminPage() {
  const { t } = useI18n();
  const pageTitle = "Admin Panel"; // Example: t("appFeatures.admin.title")

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-2xl text-primary flex items-center gap-2">
            <ShieldCheck className="h-6 w-6"/>
            {pageTitle}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Content for {pageTitle} coming soon. This section is for administrators.</p>
        </CardContent>
      </Card>
    </div>
  );
}
