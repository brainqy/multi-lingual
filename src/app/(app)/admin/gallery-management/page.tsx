
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useI18n } from "@/hooks/use-i18n";
import { GalleryVerticalEnd } from "lucide-react";

export default function GalleryManagementPage() {
  const { t } = useI18n();
  const pageTitle = "Gallery Management"; 

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-2xl text-primary flex items-center gap-2">
            <GalleryVerticalEnd className="h-6 w-6"/>
            {pageTitle}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Approve, manage, and organize event galleries and submitted images. Content for {pageTitle} coming soon.</p>
        </CardContent>
      </Card>
    </div>
  );
}
