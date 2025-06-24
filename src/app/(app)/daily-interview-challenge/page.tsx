
"use client";

import React from 'react';
import { useI18n } from '@/hooks/use-i18n';
import sampleChallenges from '@/lib/sample-challenges';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, RefreshCw, Lightbulb, CheckCircle, Award } from 'lucide-react';
import type { DailyChallenge } from '@/types';

const DailyInterviewChallengePage: React.FC = () => {
  const { t } = useI18n();
  // Display the first challenge, which is a Flip Challenge in the new sample data
  const challenge: DailyChallenge = sampleChallenges[0]; 

  const handleRefresh = () => {
    // Logic to fetch a new challenge (to be implemented)
  };

  const handleShowHint = () => {
    // Logic to show a hint (to be implemented)
  };

  const renderStandardChallenge = (challenge: DailyChallenge) => (
    <Card className="shadow-lg">
      <CardHeader>
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="outline">{t("dailyChallenge.category", challenge.category || "General")}</Badge>
          <span className="text-xs text-muted-foreground">{t("dailyChallenge.difficulty", challenge.difficulty || "Medium")}</span>
        </div>
        <CardTitle className="text-xl">{challenge.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-foreground/90 mb-4">{challenge.description}</p>
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
  );

  const renderFlipChallenge = (challenge: DailyChallenge) => (
    <Card className="shadow-lg bg-primary/5 border-primary/20">
       <CardHeader>
          <div className="flex items-center justify-between">
            <Badge variant="secondary" className="bg-yellow-200 text-yellow-800 border-yellow-300">Flip Challenge</Badge>
            <div className="flex items-center gap-2 text-yellow-600 font-bold">
                <Award className="h-5 w-5"/>
                <span>{challenge.xpReward} XP</span>
            </div>
          </div>
          <CardTitle className="text-2xl pt-2">{challenge.title}</CardTitle>
          <CardDescription>{challenge.description}</CardDescription>
        </CardHeader>
        <CardContent>
            <h4 className="font-semibold mb-2 text-foreground">Your Tasks:</h4>
            <div className="space-y-3">
                {challenge.tasks?.map((task, index) => (
                    <div key={index} className="flex items-start p-3 bg-card rounded-md border shadow-sm">
                        <CheckCircle className="h-5 w-5 text-gray-400 mr-3 mt-1 flex-shrink-0" />
                        <div>
                            <p className="font-medium text-foreground">{task.description}</p>
                            <p className="text-xs text-muted-foreground">Goal: {task.target} {task.action.replace('_', ' ')}</p>
                        </div>
                    </div>
                ))}
            </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button disabled>{t("dailyChallenge.submit", "Complete Tasks to Earn XP")}</Button>
        </CardFooter>
    </Card>
  );

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
      
      {challenge.type === 'flip' ? renderFlipChallenge(challenge) : renderStandardChallenge(challenge)}

      <div className="mt-6 text-center text-muted-foreground text-xs">
        {t("dailyChallenge.footerNote", "A new challenge is posted every day. Practice regularly to improve your interview skills!")}
      </div>
    </div>
  );
};

export default DailyInterviewChallengePage;
