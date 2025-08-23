
"use client";

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useI18n } from '@/hooks/use-i18n';
import { sampleInterviewQuestions, sampleUserProfile } from '@/lib/sample-data';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Award, ChevronsRight, Users, Phone, X, Check, Repeat, Zap, Loader2, Trophy, Puzzle, Maximize, Minimize, Diamond, XCircle, Coins } from 'lucide-react';
import type { InterviewQuestion, InterviewQuestionCategory } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import Link from "next/link";
import Confetti from "react-confetti";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription as DialogUIDescription, DialogFooter } from "@/components/ui/dialog";
import { useAuth } from '@/hooks/use-auth';
import { createActivity } from '@/lib/actions/activities';


const KBC_QUESTION_COUNT = 10;
const XP_LEVELS = [100, 200, 300, 500, 1000, 2000, 4000, 8000, 16000, 32000];
const GAME_COST = 500;
const techTopics = ['Python', 'Java', 'Angular', 'React', 'SpringBoot', 'AWS'];


export default function KBCGamePage() {
  const { t } = useI18n();
  const { toast } = useToast();
  const { user, wallet, refreshWallet } = useAuth();

  const [gameState, setGameState] = useState<'setup' | 'playing' | 'gameOver'>('setup');
  const [allQuestions, setAllQuestions] = useState<InterviewQuestion[]>([]);
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<string>('All');

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [lockedAnswer, setLockedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [gameMessage, setGameMessage] = useState(t("kbcGame.initialMessage"));
  const [lifelines, setLifelines] = useState({ fiftyFifty: true, audiencePoll: true, expertAdvice: true });
  const [fiftyFiftyOptions, setFiftyFiftyOptions] = useState<string[] | null>(null);
  const [audiencePollData, setAudiencePollData] = useState<{ name: string; votes: number }[] | null>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isGameOverDialogOpen, setIsGameOverDialogOpen] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{ correctAnswer: string; explanation: string } | null>(null);
  
  const gameContainerRef = useRef<HTMLDivElement>(null);

  const currentQuestion = useMemo(() => questions[currentQuestionIndex], [questions, currentQuestionIndex]);
  const currentXpLevel = currentQuestionIndex > 0 ? XP_LEVELS[currentQuestionIndex - 1] : 0;
  const nextXpLevel = XP_LEVELS[currentQuestionIndex];

  useEffect(() => {
    setIsClient(true);
    const mcqQuestions = sampleInterviewQuestions.filter(q => q.isMCQ && q.mcqOptions && q.mcqOptions.length >= 2 && q.correctAnswer);
    setAllQuestions(mcqQuestions);
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => setIsFullScreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);


  const startNewGame = async () => {
    if (!wallet) {
      toast({ title: t("kbcGame.toast.walletNotLoaded.title"), description: t("kbcGame.toast.walletNotLoaded.description"), variant: "destructive" });
      return;
    }

    if (wallet.coins < GAME_COST) {
        toast({
            title: t("kbcGame.toast.insufficientCoins.title"),
            description: t("kbcGame.toast.insufficientCoins.description", { cost: GAME_COST }),
            variant: "destructive",
        });
        return;
    }

    const filteredQuestions = selectedTopic === 'All'
      ? allQuestions
      : allQuestions.filter(q => q.tags?.some(tag => tag.toLowerCase() === selectedTopic.toLowerCase()));
      
    if (filteredQuestions.length < 5) {
        toast({
            title: t("kbcGame.toast.notEnoughQuestions.title"),
            description: t("kbcGame.toast.notEnoughQuestions.description", { topic: selectedTopic }),
            variant: "destructive",
            duration: 5000,
        });
        return;
    }

    // This part should be an atomic server action in a real app
    // For now, we update client-side, then call the server action
    await refreshWallet(); // Ensure we have the latest balance
    // Deduct cost and add transaction via the new auth context method
    // In a real app, this should be a single server action like `startGame(userId, cost)`
    // For now, we simulate by directly calling updateWallet from the imported actions.
    const { updateWallet } = await import('@/lib/actions/wallet');
    await updateWallet(user!.id, { coins: wallet.coins - GAME_COST }, `Fee for KBC Game (${selectedTopic})`);
    await refreshWallet(); // Refresh wallet state in context

    toast({
        title: t("kbcGame.toast.gameStart.title", { cost: GAME_COST }),
        description: t("kbcGame.toast.gameStart.description"),
    });


    const shuffled = filteredQuestions.sort(() => 0.5 - Math.random());
    setQuestions(shuffled.slice(0, KBC_QUESTION_COUNT));
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setLockedAnswer(null);
    setShowResult(false);
    setLifelines({ fiftyFifty: true, audiencePoll: true, expertAdvice: true });
    setFiftyFiftyOptions(null);
    setAudiencePollData(null);
    setGameMessage(t("kbcGame.initialMessage"));
    setGameState('playing');
    
    if (gameContainerRef.current && !document.fullscreenElement) {
        gameContainerRef.current.requestFullscreen().catch(err => {
            console.error("Fullscreen request failed:", err);
            toast({ title: t("kbcGame.toast.fullscreenError.title"), description: t("kbcGame.toast.fullscreenError.description"), variant: "default" });
        });
    }
  };

  const handleAnswerSelect = (option: string) => {
    if (lockedAnswer) return;
    setSelectedAnswer(option);
  };

  const handleLockAnswer = async () => {
    if (!selectedAnswer || !user) {
      toast({ title: t("kbcGame.toast.noAnswer.title"), description: t("kbcGame.toast.noAnswer.description"), variant: 'destructive' });
      return;
    }
    setLockedAnswer(selectedAnswer);
    setShowResult(true);

    if (selectedAnswer === currentQuestion.correctAnswer) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 4000); 

      if (currentQuestionIndex === questions.length - 1) {
        const totalXPWon = nextXpLevel;
        await createActivity({ userId: user.id, tenantId: user.tenantId, description: `Won the KBC game and earned ${totalXPWon} XP!` });
        
        setGameMessage(t("kbcGame.winMessage", { xp: nextXpLevel }));
        toast({
          title: t("kbcGame.toast.gameWon.title"),
          description: t("kbcGame.toast.gameWon.description"),
          duration: 5000,
        });
        setGameState('gameOver');
      } else {
        setGameMessage(t("kbcGame.correctMessage"));
         toast({
          title: t("kbcGame.toast.correctAnswer.title"),
          description: t("kbcGame.toast.correctAnswer.description", { xp: nextXpLevel }),
        });
      }
    } else {
      const totalXPWon = currentXpLevel;
      if(totalXPWon > 0) {
        await createActivity({ userId: user.id, tenantId: user.tenantId, description: `Finished KBC game and earned ${totalXPWon} XP.` });
      }
      setFeedbackMessage({
        correctAnswer: currentQuestion.correctAnswer || "Not provided",
        explanation: currentQuestion.answerOrTip
      });
      setIsGameOverDialogOpen(true);
      setGameMessage(t("kbcGame.wrongMessage", { xp: totalXPWon }));
      setGameState('gameOver');
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setLockedAnswer(null);
      setShowResult(false);
      setFiftyFiftyOptions(null);
      setAudiencePollData(null);
      setGameMessage(t("kbcGame.initialMessage"));
    }
  };
  
  const handleEndGameAndRestart = () => {
    if (document.fullscreenElement) {
        document.exitFullscreen();
    }
    setGameState('setup');
    setIsGameOverDialogOpen(false);
    setFeedbackMessage(null);
  };

  const useFiftyFifty = () => {
    if (!lifelines.fiftyFifty || lockedAnswer) return;
    const incorrectOptions = currentQuestion.mcqOptions!.filter(opt => opt !== currentQuestion.correctAnswer);
    const shuffledIncorrect = incorrectOptions.sort(() => 0.5 - Math.random());
    const optionsToShow = [currentQuestion.correctAnswer!, shuffledIncorrect[0]];
    setFiftyFiftyOptions(optionsToShow);
    setLifelines(prev => ({ ...prev, fiftyFifty: false }));
  };
  
  const useAudiencePoll = () => {
    if (!lifelines.audiencePoll || lockedAnswer) return;
    const pollData = currentQuestion.mcqOptions!.map(option => {
      let votes;
      if (option === currentQuestion.correctAnswer) {
        votes = Math.floor(Math.random() * 30) + 55; // 55-85% for correct
      } else {
        votes = Math.floor(Math.random() * 15) + 5; // 5-20% for incorrect
      }
      return { name: option.substring(0, 15) + '...', votes };
    });
    setAudiencePollData(pollData);
    setLifelines(prev => ({ ...prev, audiencePoll: false }));
  };
  
  const useExpertAdvice = () => {
    if (!lifelines.expertAdvice || lockedAnswer) return;
    toast({
      title: t("kbcGame.toast.expertAdvice.title"),
      description: currentQuestion.answerOrTip,
      duration: 10000
    });
    setLifelines(prev => ({ ...prev, expertAdvice: false }));
  };

  const toggleFullScreen = () => {
    if (!gameContainerRef.current) return;
    if (document.fullscreenElement) {
        document.exitFullscreen();
    } else {
        gameContainerRef.current.requestFullscreen();
    }
  }

  const KBCGame = () => (
    <div className="bg-slate-900 text-white p-4 md:p-6 rounded-lg shadow-2xl border-4 border-slate-700 h-full flex flex-col">
      <div className="flex justify-between items-start mb-4">
        <div className="flex gap-2">
          <Button onClick={useFiftyFifty} disabled={!!(!lifelines.fiftyFifty || lockedAnswer)} variant="outline" className="bg-slate-800 border-slate-600 hover:bg-slate-700 text-white rounded-full aspect-square p-2 h-auto">50:50</Button>
          <Button onClick={useAudiencePoll} disabled={!!(!lifelines.audiencePoll || lockedAnswer)} variant="outline" className="bg-slate-800 border-slate-600 hover:bg-slate-700 text-white rounded-full aspect-square p-2 h-auto"><Users className="h-5 w-5" /></Button>
          <Button onClick={useExpertAdvice} disabled={!!(!lifelines.expertAdvice || lockedAnswer)} variant="outline" className="bg-slate-800 border-slate-600 hover:bg-slate-700 text-white rounded-full aspect-square p-2 h-auto"><Phone className="h-5 w-5" /></Button>
        </div>
        <div className="flex items-center gap-2">
            <div className="text-right">
            <p className="text-sm text-slate-400">{t("kbcGame.nextReward")}</p>
            <p className="text-xl font-bold text-yellow-400 flex items-center gap-1 justify-end"><Zap className="h-5 w-5"/> {nextXpLevel?.toLocaleString()} XP</p>
            </div>
            <Button onClick={toggleFullScreen} variant="ghost" size="icon" className="text-white">
                {isFullScreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
            </Button>
        </div>
      </div>
      
      <div className="flex-grow flex flex-col justify-center items-center text-center">
        {audiencePollData ? (
          <div className="w-full h-48">
            <h3 className="text-lg font-bold mb-2">{t("kbcGame.audiencePollResults")}</h3>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={audiencePollData} layout="vertical">
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" width={80} tick={{ fill: 'white', fontSize: 10 }} />
                <Tooltip cursor={{fill: 'rgba(255,255,255,0.1)'}} contentStyle={{backgroundColor: '#334155', border: 'none'}} />
                <Bar dataKey="votes" fill="#fbbf24" background={{ fill: '#475569' }} />
              </BarChart>
            </ResponsiveContainer>
            <Button size="sm" onClick={() => setAudiencePollData(null)} className="mt-2">{t("kbcGame.backToQuestion")}</Button>
          </div>
        ) : (
          <>
            <p className="text-slate-400 mb-2">{t("kbcGame.questionForXP", { number: currentQuestionIndex + 1, xp: nextXpLevel?.toLocaleString() })}</p>
            <div className="p-4 bg-black/20 rounded-lg min-h-[80px] flex items-center justify-center">
              <p className="text-lg font-semibold">{currentQuestion?.questionText}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-6 w-full max-w-2xl">
              {currentQuestion?.mcqOptions?.map((option, index) => {
                const isHidden = fiftyFiftyOptions && !fiftyFiftyOptions.includes(option);
                const isLockedCorrect = lockedAnswer && option === currentQuestion.correctAnswer;
                const isLockedIncorrect = lockedAnswer === option && option !== currentQuestion.correctAnswer;
                
                return (
                  <Button
                    key={index}
                    onClick={() => handleAnswerSelect(option)}
                    disabled={!!lockedAnswer || !!isHidden}
                    variant="outline"
                    className={cn(
                      "text-left justify-start h-auto py-2 px-4 whitespace-normal bg-slate-800 border-slate-600 hover:bg-slate-700",
                      selectedAnswer === option && !lockedAnswer && "bg-orange-500/80 border-orange-400",
                      isHidden && "opacity-0 pointer-events-none",
                      isLockedCorrect && "bg-green-600 border-green-500 animate-pulse",
                      isLockedIncorrect && "bg-red-600 border-red-500"
                    )}
                  >
                    <span className="font-bold mr-2 text-orange-400">{String.fromCharCode(65 + index)}:</span>
                    {option}
                  </Button>
                )
              })}
            </div>
          </>
        )}
      </div>

      <div className="mt-6 text-center">
        <p className={cn("text-lg font-bold h-7", showResult && "animate-bounce",
          lockedAnswer && (lockedAnswer === currentQuestion.correctAnswer ? "text-green-400" : "text-red-400"))}>
          {gameMessage}
        </p>
        <div className="mt-2">
          {!lockedAnswer ? (
            <Button onClick={handleLockAnswer} disabled={!selectedAnswer} size="lg" className="bg-blue-600 hover:bg-blue-500">{t("kbcGame.lockAnswer")}</Button>
          ) : gameState !== 'gameOver' ? (
            <Button onClick={handleNextQuestion} size="lg" className="bg-green-600 hover:bg-green-500">{t("kbcGame.nextQuestion")}<ChevronsRight /></Button>
          ) : (
            <Button onClick={handleEndGameAndRestart} size="lg" className="bg-yellow-500 hover:bg-yellow-400 text-black">{t("kbcGame.playAgain")}<Repeat className="ml-2"/></Button>
          )}
        </div>
      </div>
    </div>
  );

  const XPLevelItem = ({ level, xp, isCurrent, isPassed }: { level: number, xp: number, isCurrent: boolean, isPassed: boolean }) => (
    <div className={cn("flex items-center justify-between p-1.5 rounded", 
      isCurrent && "bg-orange-500 text-white font-bold ring-2 ring-white",
      isPassed && "bg-green-600 text-white",
    )}>
      <span className={cn("text-sm", isCurrent && "font-bold")}>{level}</span>
      <span className="text-sm font-semibold flex items-center gap-1"><Diamond className="h-3 w-3"/> {xp.toLocaleString()} XP</span>
    </div>
  );
  
  if (allQuestions.length === 0) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      );
  }

  return (
    <div ref={gameContainerRef} className="container mx-auto max-w-7xl py-8 px-4">
    {isClient && showConfetti && <Confetti recycle={false} numberOfPieces={200} />}
    
    <Dialog open={isGameOverDialogOpen} onOpenChange={setIsGameOverDialogOpen}>
        <DialogContent className="sm:max-w-md">
            <DialogHeader>
                <DialogTitle className="text-destructive flex items-center gap-2"><XCircle className="h-6 w-6"/>{t("kbcGame.gameOver.title")}</DialogTitle>
                <DialogUIDescription>
                    {t("kbcGame.gameOver.correctAnswerWas")} <strong className="text-foreground">{feedbackMessage?.correctAnswer}</strong>
                </DialogUIDescription>
            </DialogHeader>
            <div className="py-4">
                <h4 className="font-semibold mb-2 text-primary">{t("kbcGame.gameOver.explanation")}</h4>
                <p className="text-sm text-muted-foreground">{feedbackMessage?.explanation}</p>
            </div>
            <DialogFooter>
                <Button onClick={handleEndGameAndRestart} className="w-full">{t("kbcGame.playAgain")}</Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>

    {gameState === 'setup' && (
      <Card className="max-w-2xl mx-auto text-center">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">{t("kbcGame.setup.title")}</CardTitle>
          <CardDescription>{t("kbcGame.setup.description", { cost: GAME_COST })}</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
           <Button
                variant={selectedTopic === 'All' ? 'default' : 'outline'}
                onClick={() => setSelectedTopic('All')}
                className="h-16 text-md"
            >
                {t("kbcGame.setup.allTopics")}
            </Button>
            {techTopics.map(topic => (
            <Button
                key={topic}
                variant={selectedTopic === topic ? 'default' : 'outline'}
                onClick={() => setSelectedTopic(topic)}
                className="h-16 text-md"
            >
                {topic}
            </Button>
            ))}
        </CardContent>
        <CardFooter>
          <Button onClick={startNewGame} size="lg" className="w-full bg-primary hover:bg-primary/90">
            {t("kbcGame.setup.startButton")}
          </Button>
        </CardFooter>
      </Card>
    )}
    
    {(gameState === 'playing' || gameState === 'gameOver') && (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2">
          <KBCGame />
        </div>
        
        <div className="space-y-8">
          <Card className="shadow-lg bg-slate-800 text-white">
            <CardHeader>
              <CardTitle className="text-xl text-center text-yellow-400">{t("kbcGame.xpLadder")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 flex flex-col-reverse">
                {XP_LEVELS.map((xp, index) => (
                  <XPLevelItem 
                    key={index} 
                    level={index + 1} 
                    xp={xp} 
                    isCurrent={index === currentQuestionIndex && gameState === 'playing'}
                    isPassed={index < currentQuestionIndex}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
           <Card>
                <CardHeader>
                    <CardTitle>{t("kbcGame.otherGames")}</CardTitle>
                </CardHeader>
                <CardContent>
                    <Button asChild className="w-full">
                        <Link href="/number-match-game">{t("kbcGame.playNumberMatch")}</Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
      </div>
    )}
    </div>
  );
};
