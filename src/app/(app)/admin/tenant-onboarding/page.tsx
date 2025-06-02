
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useI18n } from "@/hooks/use-i18n";
import { UserPlus } from "lucide-react";

export default function TenantOnboardingPage() {
  const { t } = useI18n();
  const pageTitle = "Tenant Onboarding"; 

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-2xl text-primary flex items-center gap-2">
            <UserPlus className="h-6 w-6"/>
            {pageTitle}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Streamline the process of adding and configuring new tenants on the platform. Content for {pageTitle} coming soon.</p>
        </CardContent>
      </Card>
    </div>
  );
}
