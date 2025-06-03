
"use client"; 

import { Button } from "@/components/ui/button";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { useEffect } from "react";
import { useI18n } from "@/hooks/use-i18n";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { t } = useI18n();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6 text-center">
      <AlertTriangle className="h-20 w-20 text-destructive mb-6" />
      <h1 className="text-4xl font-headline font-bold text-destructive mb-3">
        {t("errorPage.title")}
      </h1>
      <p className="text-lg text-foreground/80 mb-6 max-w-md">
        {t("errorPage.description")}
      </p>
      {error?.message && (
         <p className="text-sm text-muted-foreground mb-6 bg-muted p-3 rounded-md max-w-xl">{t("errorPage.detailsPrefix")} {error.message}</p>
      )}
      <Button onClick={() => reset()} size="lg">
        <RotateCcw className="mr-2 h-5 w-5" />
        {t("errorPage.retryButton")}
      </Button>
    </div>
  );
}

    