
"use client"; 

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useParams } from 'next/navigation';
import { useI18n } from "@/hooks/use-i18n"; // Assuming root I18nProvider makes context available
import { Globe } from "lucide-react";

export default function LocalizedRootPage() {
  const { t, locale: currentContextLocale, availableLocales } = useI18n();
  const params = useParams();
  const pathLocale = params.locale as keyof typeof availableLocales | undefined;

  return (
    <div className="container mx-auto p-6 min-h-screen flex flex-col items-center justify-center">
      <Card className="w-full max-w-xl text-center shadow-xl">
        <CardHeader>
          <Globe className="h-16 w-16 text-primary mx-auto mb-4" />
          <CardTitle className="text-3xl font-headline text-primary">
            {t("localizedPage.title", {defaultValue: "Localized Content Area"})}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-lg text-foreground/80">
            {t("localizedPage.greeting", {defaultValue: "Welcome to the page for locale:"})} <span className="font-semibold text-accent">{pathLocale || currentContextLocale}</span>
          </p>
          <p className="text-muted-foreground">
            {t("localizedPage.description", {defaultValue: "This page demonstrates content that could be specific to the selected language path. The actual language displayed depends on the i18n context, which can be changed via the language switcher."})}
          </p>
          <p className="text-sm text-muted-foreground">
            (Current URL Path Locale: {pathLocale ? availableLocales[pathLocale] : "N/A"}, Current i18n Context Locale: {availableLocales[currentContextLocale]})
          </p>
          <div className="mt-6">
            <Button asChild>
              <Link href="/">
                {t("localizedPage.backHome", {defaultValue: "Back to Main Home"})}
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
