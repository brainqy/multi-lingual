
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useI18n } from "@/hooks/use-i18n";
import { Bot } from "lucide-react";

export default function MessengerManagementPage() {
  const { t } = useI18n();
  const pageTitle = "Messenger Management"; 

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-2xl text-primary flex items-center gap-2">
            <Bot className="h-6 w-6"/>
            {pageTitle}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Configure surveys, automated messages, and manage interactions via the floating messenger. Content for {pageTitle} coming soon.</p>
        </CardContent>
      </Card>
    </div>
  );
}
