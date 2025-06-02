"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useI18n } from "@/hooks/use-i18n";
import { Cog } from "lucide-react";

export default function SettingsPage() {
  const { t } = useI18n();

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-2xl text-primary flex items-center gap-2">
            <Cog className="h-6 w-6"/>
            {t("settings.languageManagement")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{t("settings.comingSoon")}</p>
        </CardContent>
      </Card>
       <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-2xl text-primary flex items-center gap-2">
            User Preferences
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{t("settings.comingSoon")}</p>
        </CardContent>
      </Card>
    </div>
  );
}
