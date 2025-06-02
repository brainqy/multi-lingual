
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useI18n } from "@/hooks/use-i18n";
import { MessageSquare } from "lucide-react";

export default function CommunityFeedPage() {
  const { t } = useI18n();
  const pageTitle = "Community Feed"; // Example: t("appFeatures.communityFeed.title")

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-2xl text-primary flex items-center gap-2">
            <MessageSquare className="h-6 w-6"/>
            {pageTitle}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">See what's new in the community. Content for {pageTitle} coming soon.</p>
        </CardContent>
      </Card>
    </div>
  );
}
