
"use client";

import React, { useState } from 'react';
import { useI18n } from '@/hooks/use-i18n';
import sampleChallenges from '@/lib/sample-challenges';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, RefreshCw, Lightbulb, CheckCircle, Award, Brain } from 'lucide-react';
import type { DailyChallenge } from '@/types';
import { useToast } from '@/hooks/use-toast';

const DailyInterviewChallengePage: React.FC = () => {
  const { t } = useI18n();
  const { toast } = useToast();

  const [standardChallenge, setStandardChallenge] = useState<DailyChallenge | undefined>(() => sampleChallenges.find(c => c.type === 'standard'));
  const [flipChallenge, setFlipChallenge] = useState<DailyChallenge | undefined>(() => sampleChallenges.find(c => c.type === 'flip'));

  const handleRefresh = () => {
    // Mock logic: find another standard challenge that is not the current one
    const otherStandardChallenges = sampleChallenges.filter(c => c.type === 'standard' && c.id !== standardChallenge?.id);
    if (otherStandardChallenges.length > 0) {
      setStandardChallenge(otherStandardChallenges[Math.floor(Math.random() * otherStandardChallenges.length)]);
    }

    // New logic for flip challenge
    const otherFlipChallenges = sampleChallenges.filter(c => c.type === 'flip' && c.id !== flipChallenge?.id);
    if (otherFlipChallenges.length > 0) {
        setFlipChallenge(otherFlipChallenges[Math.floor(Math.random() * otherFlipChallenges.length)]);
    }

    toast({
      title: t("dailyChallenge.toast.newChallenge.title"),
      description: t("dailyChallenge.toast.newChallenge.description"),
    });
  };

  const handleShowHint = () => {
    if (standardChallenge?.solution) {
      toast({
        title: t("dailyChallenge.toast.showHint.title"),
        description: standardChallenge.solution,
        duration: 10000,
      });
    } else {
      toast({
        title: t("dailyChallenge.toast.showHint.title"),
        description: t("dailyChallenge.toast.showHint.noHint"),
        variant: "default",
      });
    }
  };
  
  const handleSubmit = () => {
    toast({
      title: t("dailyChallenge.toast.submitMock.title"),
      description: t("dailyChallenge.toast.submitMock.description"),
    });
  };

  const renderStandardChallenge = (challenge: DailyChallenge) => (
    <Card className="shadow-lg h-full flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
            <CardTitle className="text-xl flex items-center gap-2"><Brain className="h-5 w-5 text-primary"/> Technical Challenge</CardTitle>
            <Badge variant="outline">{challenge.difficulty || "Medium"}</Badge>
        </div>
        <CardDescription>{challenge.title}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-foreground/90 mb-4">{challenge.description}</p>
        <textarea
          className="w-full min-h-[100px] border rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder={t("dailyChallenge.yourAnswer", "Type your answer here...")}
        />
      </CardContent>
      <CardFooter className="flex justify-between items-center mt-auto border-t pt-4">
        <Button variant="outline" size="sm" onClick={handleShowHint}>
          <Lightbulb className="mr-2 h-4 w-4" />
          {t("dailyChallenge.showHint", "Show Hint")}
        </Button>
        <Button onClick={handleSubmit}>{t("dailyChallenge.submit", "Submit")}</Button>
      </CardFooter>
    </Card>
  );

  const renderFlipChallenge = (challenge: DailyChallenge) => (
    <Card className="shadow-lg bg-primary/5 border-primary/20 h-full flex flex-col">
       <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl flex items-center gap-2"><Award className="h-5 w-5 text-yellow-500"/> Flip Challenge</CardTitle>
            <div className="flex items-center gap-2 text-yellow-600 font-bold">
                <Award className="h-5 w-5"/>
                <span>{challenge.xpReward} XP</span>
            </div>
          </div>
          <CardDescription>{challenge.description}</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow">
            <h4 className="font-semibold mb-2 text-foreground">Your Tasks:</h4>
            <div className="space-y-3">
                {challenge.tasks?.map((task, index) => (
                    <div key={index} className="flex items-start p-3 bg-card rounded-md border shadow-sm">
                        <CheckCircle className="h-5 w-5 text-gray-400 mr-3 mt-1 flex-shrink-0" />
                        <div>
                            <p className="font-medium text-foreground">{task.description}</p>
                            <p className="text-xs text-muted-foreground">Goal: {task.target} {task.action.replace(/_/g, ' ')}</p>
                        </div>
                    </div>
                ))}
            </div>
        </CardContent>
        <CardFooter className="flex justify-end mt-auto border-t pt-4">
          <Button onClick={handleSubmit}>{t("dailyChallenge.completeTasksButton", "Complete Tasks to Earn XP")}</Button>
        </CardFooter>
    </Card>
  );

  return (
    <div className="container mx-auto max-w-5xl py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <CalendarDays className="h-7 w-7 text-primary" />
          {t("dailyChallenge.title", "Daily Interview Challenge")}
        </h1>
        <Button variant="ghost" size="icon" onClick={handleRefresh} title={t("dailyChallenge.refresh", "Get New Challenge")}>
          <RefreshCw className="h-5 w-5" />
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
        {standardChallenge ? renderStandardChallenge(standardChallenge) : <p>No standard challenge available.</p>}
        {flipChallenge ? renderFlipChallenge(flipChallenge) : <p>No flip challenge available.</p>}
      </div>

      <div className="mt-8 text-center text-muted-foreground text-xs">
        {t("dailyChallenge.footerNote", "A new challenge is posted every day. Practice regularly to improve your interview skills!")}
      </div>
    </div>
  );
};

export default DailyInterviewChallengePage;
