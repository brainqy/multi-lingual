
"use client";

import { useState, useEffect, useCallback } from "react";
import { useI18n } from "@/hooks/use-i18n";
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Award, CheckCircle, Repeat, Lightbulb, Zap, Loader2, Trophy, Send, Clock } from 'lucide-react';
import type { DailyChallenge, UserProfile, InterviewQuestionCategory, EvaluateDailyChallengeAnswerOutput } from '@/types';
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/use-auth";
import { updateUser } from "@/lib/data-services/users";
import { createActivity } from "@/lib/actions/activities";
import { evaluateDailyChallengeAnswer } from "@/ai/flows/evaluate-daily-challenge-answer";
import ScoreCircle from '@/components/ui/score-circle';
import { getDashboardData } from "@/lib/actions/dashboard";
import { useRouter } from "next/navigation";
import { getDynamicFlipChallenge } from "@/lib/actions/challenges";
import { Duration, intervalToDuration, isFuture } from 'date-fns';
import { useSettings } from "@/contexts/settings-provider";

const CountdownTimer = ({ expiryDate }: { expiryDate: Date }) => {
  const [timeLeft, setTimeLeft] = useState<Duration | null>(null);

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      if (isFuture(expiryDate)) {
        setTimeLeft(intervalToDuration({ start: now, end: expiryDate }));
      } else {
        setTimeLeft(null);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000 * 60); // Update every minute
    return () => clearInterval(interval);
  }, [expiryDate]);

  if (!timeLeft) {
    return <span className="text-xs text-muted-foreground">Expired</span>;
  }

  return (
    <div className="flex items-center gap-1 text-xs font-medium text-primary">
      <Clock className="h-3 w-3" />
      <span>
        {timeLeft.days ? `${timeLeft.days}d ` : ''}
        {timeLeft.hours ? `${timeLeft.hours}h ` : ''}
        left
      </span>
    </div>
  );
};


export default function DailyInterviewChallengePage() {
  const { t } = useI18n();
  const { toast } = useToast();
  const { user, login } = useAuth();
  const { settings } = useSettings();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  
  const [allChallenges, setAllChallenges] = useState<DailyChallenge[]>([]);
  const [standardChallenge, setStandardChallenge] = useState<DailyChallenge | undefined>(undefined);
  const [flipChallenge, setFlipChallenge] = useState<DailyChallenge | undefined>(undefined);
  const [userAnswer, setUserAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<EvaluateDailyChallengeAnswerOutput | null>(null);
  const [currentUserProfile, setCurrentUserProfile] = useState<UserProfile | null>(user);

  const fetchChallengesAndProgress = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    const [dashboardData, dynamicFlipChallenge] = await Promise.all([
      getDashboardData(user.tenantId, user.id, user.role),
      getDynamicFlipChallenge(user.id),
    ]);
    
    const userWithProgress = dashboardData.users.find(u => u.id === user.id);
    setCurrentUserProfile(userWithProgress || user);
    
    const challenges = dashboardData.challenges;
    setAllChallenges(challenges);
    setFlipChallenge(dynamicFlipChallenge || undefined);
    
    const standard = challenges.filter(c => c.type === 'standard');
    if (standard.length > 0) {
        setStandardChallenge(standard[Math.floor(Math.random() * standard.length)]);
    }
    
    setIsLoading(false);
  }, [user]);

  useEffect(() => {
    fetchChallengesAndProgress();
  }, [fetchChallengesAndProgress]);

  const handleRefreshChallenge = async () => {
    if (!user) return;
    
    const allStandardChallenges = allChallenges.filter(c => c.type === 'standard' && c.id !== standardChallenge?.id);
    if (allStandardChallenges.length > 0) {
      setStandardChallenge(allStandardChallenges[Math.floor(Math.random() * allStandardChallenges.length)]);
    }
    
    const newFlipChallenge = await getDynamicFlipChallenge(user.id, true);
    setFlipChallenge(newFlipChallenge || undefined);
    
    setUserAnswer('');
    setFeedback(null);

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

  const handleSubmitAnswer = async () => {
    if (!user || !standardChallenge || !userAnswer.trim() || !settings) {
      toast({ title: "No Answer", description: "Please enter your answer before submitting.", variant: "destructive"});
      return;
    }
    setIsSubmitting(true);
    setFeedback(null);
    try {
      const result = await evaluateDailyChallengeAnswer({
        question: standardChallenge.title,
        answer: userAnswer,
        solution: standardChallenge.solution,
        apiKey: settings.allowUserApiKey ? user.userApiKey : undefined,
      });
      setFeedback(result);

      if (result.isCorrect) {
        const xpGained = standardChallenge.xpReward || 50;
        const updatedUser = await updateUser(user.id, { xpPoints: (user.xpPoints || 0) + xpGained });
        if (updatedUser) {
          await login(updatedUser.email); // Re-login to update auth context
          await createActivity({ userId: user.id, tenantId: user.tenantId, description: `Completed daily challenge '${standardChallenge.title}' and earned ${xpGained} XP.` });
          toast({
            title: `+${xpGained} XP! Correct Answer!`,
            description: `You've successfully completed the challenge.`,
          });
        }
      } else {
        toast({
          title: "Incorrect Answer",
          description: "Good try! Check the feedback to see how you can improve.",
          variant: "default",
        });
      }

    } catch (error) {
      console.error(error);
      toast({ title: "Evaluation Error", description: "Could not evaluate your answer at this time.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
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
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            className="w-full p-2 border rounded-md bg-background min-h-[100px]"
            placeholder={t("dailyChallenge.yourAnswer")}
            disabled={isSubmitting || !!feedback}
          />
           {feedback && (
            <Card className="bg-secondary/50 p-4">
              <CardTitle className="text-md mb-2 flex items-center justify-between">
                AI Feedback
                <ScoreCircle score={feedback.score} size="sm"/>
              </CardTitle>
              <CardContent className="p-0">
                <p className="text-sm text-muted-foreground whitespace-pre-line">{feedback.feedback}</p>
              </CardContent>
            </Card>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="ghost" onClick={showHint} disabled={!!feedback}><Lightbulb className="mr-2 h-4 w-4"/> {t("dailyChallenge.showHint")}</Button>
          <Button onClick={handleSubmitAnswer} disabled={isSubmitting || !!feedback}>
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Send className="mr-2 h-4 w-4"/>}
            {isSubmitting ? 'Evaluating...' : t("dailyChallenge.submit")}
          </Button>
        </CardFooter>
    </Card>
  );
  
  const renderFlipChallenge = (challenge: DailyChallenge, currentUser: UserProfile) => {
    const expiryDate = new Date(currentUser.flipChallengeAssignedAt || 0);
    expiryDate.setDate(expiryDate.getDate() + 7);
    
    return (
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
            <div className="flex justify-between items-center mb-2">
                <h4 className="font-semibold text-foreground">Your Tasks:</h4>
                <CountdownTimer expiryDate={expiryDate} />
            </div>
            <div className="space-y-3">
                {challenge.tasks?.map((task, index) => {
                    const progress = currentUser.challengeProgress?.[task.action];
                    const currentProgress = progress?.current || 0;
                    const isCompleted = currentProgress >= task.target;
                    const progressPercent = Math.min((currentProgress / task.target) * 100, 100);

                    return (
                        <div key={index} className="flex items-start p-3 bg-card rounded-md border shadow-sm">
                            {isCompleted ? <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-1 flex-shrink-0" /> : <div className="h-5 w-5 border-2 border-gray-400 rounded-full mr-3 mt-1 flex-shrink-0" />}
                            <div>
                                <p className="font-medium text-foreground">{task.description}</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <Progress value={progressPercent} className="w-24 h-2" />
                                    <p className="text-xs text-muted-foreground">({currentProgress}/{task.target})</p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </CardContent>
        <CardFooter className="flex justify-end mt-auto border-t pt-4">
          <Button onClick={() => router.push('/dashboard')}>{t("dailyChallenge.completeTasksButton")}</Button>
        </CardFooter>
    </Card>
    );
  };

  if (isLoading || !currentUserProfile) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl py-8 px-4">
       <div className="text-center mb-8">
            <h1 className="text-4xl font-bold tracking-tight text-foreground">{t("dailyChallenge.title")}</h1>
            <p className="mt-2 text-lg text-muted-foreground">{t("dailyChallenge.footerNote")}</p>
        </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {standardChallenge && renderStandardChallenge(standardChallenge)}
        {flipChallenge && renderFlipChallenge(flipChallenge, currentUserProfile)}
      </div>
    </div>
  );
}
