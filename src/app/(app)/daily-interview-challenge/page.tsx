"use client";

import { useState, useEffect } from "react";
import { useI18n } from "@/hooks/use-i18n";
import { sampleChallenges } from "@/lib/sample-data";
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Award, CheckCircle, Diamond, ChevronsRight, Repeat, Lightbulb, Zap } from 'lucide-react';
import type { DailyChallenge } from '@/types';
import { useToast } from '@/hooks/use-toast';

export default function DailyInterviewChallengePage() {
  const { t } = useI18n();
  const { toast } = useToast();
  
  const [standardChallenge, setStandardChallenge] = useState<DailyChallenge | undefined>(() => sampleChallenges.find(c => c.type === 'standard'));
  const [flipChallenge, setFlipChallenge] = useState<DailyChallenge | undefined>(() => sampleChallenges.find(c => c.type === 'flip'));

  const handleRefreshChallenge = () => {
    const allStandardChallenges = sampleChallenges.filter(c => c.type === 'standard');
    const newChallenge = allStandardChallenges[Math.floor(Math.random() * allStandardChallenges.length)];
    setStandardChallenge(newChallenge);
    toast({
      title: t("dailyChallenge.toast.newChallenge.title"),
      description: t("dailyChallenge.toast.newChallenge.description"),
    });
  };

  const showHint = () => {
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
      });
    }
  };

  const handleSubmitAnswer = () => {
    toast({
      title: t("dailyChallenge.toast.submitMock.title"),
      description: t("dailyChallenge.toast.submitMock.description"),
    });
  };
  
  const renderStandardChallenge = (challenge: DailyChallenge) => (
      <Card className="shadow-lg h-full flex flex-col">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary"/> {t("dailyChallenge.title")}
            </CardTitle>
            <Button variant="outline" size="sm" onClick={handleRefreshChallenge}>
              <Repeat className="mr-2 h-4 w-4"/> {t("dailyChallenge.refresh")}
            </Button>
          </div>
          <CardDescription>{challenge.description}</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow space-y-4">
           <div className="flex items-center gap-2">
            <Badge variant="secondary">{t("dailyChallenge.category")}: {challenge.category}</Badge>
            <Badge variant="outline">{t("dailyChallenge.difficulty")}: {challenge.difficulty}</Badge>
           </div>
          <p className="text-lg font-medium text-foreground py-4">{challenge.title}</p>
          <textarea
            className="w-full p-2 border rounded-md bg-background min-h-[100px]"
            placeholder={t("dailyChallenge.yourAnswer")}
          />
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="ghost" onClick={showHint}><Lightbulb className="mr-2 h-4 w-4"/> {t("dailyChallenge.showHint")}</Button>
          <Button onClick={handleSubmitAnswer}>{t("dailyChallenge.submit")}</Button>
        </CardFooter>
    </Card>
  );
  
  const renderFlipChallenge = (challenge: DailyChallenge) => (
    <Card className="shadow-lg bg-primary/5 border-primary/20 h-full flex flex-col">
       <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl flex items-center gap-2"><Award className="h-5 w-5 text-yellow-500"/> {t("dailyChallenge.flipChallengeTitle")}</CardTitle>
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
          <Button onClick={() => toast({ title: "Coming Soon!", description: "Task completion tracking is under development."})}>{t("dailyChallenge.completeTasksButton")}</Button>
        </CardFooter>
    </Card>
  );

  return (
    <div className="container mx-auto max-w-7xl py-8 px-4">
       <div className="text-center mb-8">
            <h1 className="text-4xl font-bold tracking-tight text-foreground">{t("dailyChallenge.title")}</h1>
            <p className="mt-2 text-lg text-muted-foreground">{t("dailyChallenge.footerNote")}</p>
        </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {standardChallenge && renderStandardChallenge(standardChallenge)}
        {flipChallenge && renderFlipChallenge(flipChallenge)}
      </div>
    </div>
  );
}