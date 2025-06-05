"use client";

import React from 'react';
import { useI18n } from '@/hooks/use-i18n';
// ...rest of your imports...import { useI18n } from '@/hooks/use-i18n';
import sampleChallenges from '@/lib/sample-challenges';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, RefreshCw, Lightbulb } from 'lucide-react';

const DailyInterviewChallengePage: React.FC = () => {
  const { t } = useI18n();
  const dailyChallenge = sampleChallenges[0]; // Get the first challenge

  // Placeholder for future actions
  const handleRefresh = () => {
    // Logic to fetch a new challenge (to be implemented)
  };

  const handleShowHint = () => {
    // Logic to show a hint (to be implemented)
  };

  return (
    <div className="container mx-auto max-w-2xl py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <CalendarDays className="h-7 w-7 text-primary" />
          {t("dailyChallenge.title", "Daily Interview Challenge")}
        </h1>
        <Button variant="ghost" size="icon" onClick={handleRefresh} title={t("dailyChallenge.refresh", "Get New Challenge")}>
          <RefreshCw className="h-5 w-5" />
        </Button>
      </div>
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline">{t("dailyChallenge.category", dailyChallenge.category || "General")}</Badge>
            <span className="text-xs text-muted-foreground">{t("dailyChallenge.difficulty", dailyChallenge.difficulty || "Medium")}</span>
          </div>
          <CardTitle className="text-xl">{dailyChallenge.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-foreground/90 mb-4">{dailyChallenge.description}</p>
          {/* Placeholder for response area */}
          <textarea
            className="w-full min-h-[100px] border rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder={t("dailyChallenge.yourAnswer", "Type your answer here...")}
            disabled
          />
        </CardContent>
        <CardFooter className="flex justify-between items-center">
          <Button variant="outline" size="sm" onClick={handleShowHint}>
            <Lightbulb className="mr-2 h-4 w-4" />
            {t("dailyChallenge.showHint", "Show Hint")}
          </Button>
          <Button disabled>{t("dailyChallenge.submit", "Submit (Coming Soon)")}</Button>
        </CardFooter>
      </Card>
      <div className="mt-6 text-center text-muted-foreground text-xs">
        {t("dailyChallenge.footerNote", "A new challenge is posted every day. Practice regularly to improve your interview skills!")}
      </div>
    </div>
  );
};

export default DailyInterviewChallengePage;
