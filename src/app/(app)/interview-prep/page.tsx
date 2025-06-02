
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/hooks/use-i18n";
import { ClipboardList, HelpCircle } from "lucide-react";
import Link from "next/link";

export default function InterviewPrepPage() {
  const { t } = useI18n();
  const pageTitle = "Interview Prep"; // Example: t("appFeatures.interviewPrep.title")

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-2xl text-primary flex items-center gap-2">
            <ClipboardList className="h-6 w-6"/>
            {pageTitle}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">Prepare for your interviews with our resources. Content for {pageTitle} coming soon.</p>
          <Button asChild>
            <Link href="/interview-prep/quiz">
              <HelpCircle className="mr-2 h-4 w-4" />
              Start Quiz
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
