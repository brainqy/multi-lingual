
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useI18n } from "@/hooks/use-i18n";
import { Gift } from "lucide-react";

export default function ReferralsPage() {
  const { t } = useI18n();
  const pageTitle = "Referrals"; // Example: t("appFeatures.referrals.title")

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-2xl text-primary flex items-center gap-2">
            <Gift className="h-6 w-6"/>
            {pageTitle}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Refer friends and earn rewards! Content for {pageTitle} coming soon.</p>
        </CardContent>
      </Card>
    </div>
  );
}
