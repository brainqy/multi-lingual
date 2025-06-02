
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useI18n } from "@/hooks/use-i18n";
import { Building2 } from "lucide-react";

export default function TenantsPage() {
  const { t } = useI18n();
  const pageTitle = "Tenant Management"; 

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-2xl text-primary flex items-center gap-2">
            <Building2 className="h-6 w-6"/>
            {pageTitle}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">View, manage, and configure individual tenants and their settings. Content for {pageTitle} coming soon.</p>
        </CardContent>
      </Card>
    </div>
  );
}
