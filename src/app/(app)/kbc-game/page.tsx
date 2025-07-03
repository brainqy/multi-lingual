
"use client";

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useI18n } from '@/hooks/use-i18n';
import { sampleInterviewQuestions } from '@/lib/sample-data';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Award, ChevronsRight, Users, Phone, X, Check, Repeat, Zap, Loader2, Trophy, Puzzle, Maximize, Minimize, Diamond, XCircle } from 'lucide-react';
import type { InterviewQuestion, InterviewQuestionCategory } from '@/types';
import { ALL_CATEGORIES } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import Link from "next/link";
import Confetti from "react-confetti";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription as DialogUIDescription, DialogFooter } from "@/components/ui/dialog";


const KBC_QUESTION_COUNT = 10;
const XP_LEVELS = [100, 200, 300, 500, 1000, 2000, 4000, 8000, 16000, 32000];

export default function KBCGamePage() {
  const { t } = useI18n();
  const { toast } = useToast();

  const [gameState, setGameState] = useState<'setup' | 'playing' | 'gameOver'>('setup');
  const [allQuestions, setAllQuestions] = useState<InterviewQuestion[]>([]);
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<InterviewQuestionCategory | 'All'>('All');

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [lockedAnswer, setLockedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [gameMessage, setGameMessage] = useState("Select an answer and lock it!");
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


  const startNewGame = () => {
    const filteredQuestions = selectedCategory === 'All'
      ? allQuestions
      : allQuestions.filter(q => q.category === selectedCategory);
      
    if (filteredQuestions.length < 5) {
        toast({
            title: "Not Enough Questions",
            description: `There aren't enough questions in the "${selectedCategory}" category to start a game. Please select another topic or 'All'.`,
            variant: "destructive",
            duration: 5000,
        });
        return;
    }

    const shuffled = filteredQuestions.sort(() => 0.5 - Math.random());
    setQuestions(shuffled.slice(0, KBC_QUESTION_COUNT));
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setLockedAnswer(null);
    setShowResult(false);
    setLifelines({ fiftyFifty: true, audiencePoll: true, expertAdvice: true });
    setFiftyFiftyOptions(null);
    setAudiencePollData(null);
    setGameMessage("Select an answer and lock it!");
    setGameState('playing');
    
    if (gameContainerRef.current && !document.fullscreenElement) {
        gameContainerRef.current.requestFullscreen().catch(err => {
            console.error("Fullscreen request failed:", err);
            toast({ title: "Fullscreen Mode", description: "Could not enter fullscreen automatically. You can try it manually.", variant: "default" });
        });
    }
  };

  const handleAnswerSelect = (option: string) => {
    if (lockedAnswer) return;
    setSelectedAnswer(option);
  };

  const handleLockAnswer = () => {
    if (!selectedAnswer) {
      toast({ title: "No Answer Selected", description: "Please select an answer before locking.", variant: 'destructive' });
      return;
    }
    setLockedAnswer(selectedAnswer);
    setShowResult(true);

    if (selectedAnswer === currentQuestion.correctAnswer) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 4000); 

      if (currentQuestionIndex === questions.length - 1) {
        setGameMessage(`Congratulations! You've won the game with ${nextXpLevel} XP!`);
        toast({
          title: "You've Won!",
          description: "You've answered all questions correctly!",
          duration: 5000,
        });
        setGameState('gameOver');
      } else {
        setGameMessage("Correct! Click 'Next Question' to continue.");
         toast({
          title: "Correct Answer!",
          description: `You've secured ${nextXpLevel} XP!`,
          icon: <Trophy className="h-6 w-6 text-yellow-500" />,
        });
      }
    } else {
      setFeedbackMessage({
        correctAnswer: currentQuestion.correctAnswer || "Not provided",
        explanation: currentQuestion.answerOrTip
      });
      setIsGameOverDialogOpen(true);
      setGameMessage(`Wrong Answer! You walk away with ${currentXpLevel} XP.`);
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
      setGameMessage("Select an answer and lock it!");
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
      title: "Expert Advice",
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
          <Button onClick={useFiftyFifty} disabled={!lifelines.fiftyFifty || lockedAnswer} variant="outline" className="bg-slate-800 border-slate-600 hover:bg-slate-700 text-white rounded-full aspect-square p-2 h-auto">50:50</Button>
          <Button onClick={useAudiencePoll} disabled={!lifelines.audiencePoll || lockedAnswer} variant="outline" className="bg-slate-800 border-slate-600 hover:bg-slate-700 text-white rounded-full aspect-square p-2 h-auto"><Users className="h-5 w-5" /></Button>
          <Button onClick={useExpertAdvice} disabled={!lifelines.expertAdvice || lockedAnswer} variant="outline" className="bg-slate-800 border-slate-600 hover:bg-slate-700 text-white rounded-full aspect-square p-2 h-auto"><Phone className="h-5 w-5" /></Button>
        </div>
        <div className="flex items-center gap-2">
            <div className="text-right">
            <p className="text-sm text-slate-400">Next Reward</p>
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
            <h3 className="text-lg font-bold mb-2">Audience Poll Results</h3>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={audiencePollData} layout="vertical">
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" width={80} tick={{ fill: 'white', fontSize: 10 }} />
                <Tooltip cursor={{fill: 'rgba(255,255,255,0.1)'}} contentStyle={{backgroundColor: '#334155', border: 'none'}} />
                <Bar dataKey="votes" fill="#fbbf24" background={{ fill: '#475569' }} />
              </BarChart>
            </ResponsiveContainer>
            <Button size="sm" onClick={() => setAudiencePollData(null)} className="mt-2">Back to Question</Button>
          </div>
        ) : (
          <>
            <p className="text-slate-400 mb-2">Question {currentQuestionIndex + 1} for {nextXpLevel?.toLocaleString()} XP</p>
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
                    disabled={lockedAnswer !== null || isHidden}
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
            <Button onClick={handleLockAnswer} disabled={!selectedAnswer} size="lg" className="bg-blue-600 hover:bg-blue-500">Lock Answer</Button>
          ) : gameState !== 'gameOver' ? (
            <Button onClick={handleNextQuestion} size="lg" className="bg-green-600 hover:bg-green-500">Next Question <ChevronsRight /></Button>
          ) : (
            <Button onClick={handleEndGameAndRestart} size="lg" className="bg-yellow-500 hover:bg-yellow-400 text-black">Play Again <Repeat className="ml-2"/></Button>
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
                <DialogTitle className="text-destructive flex items-center gap-2"><XCircle className="h-6 w-6"/>Incorrect Answer</DialogTitle>
                <DialogUIDescription>
                    The correct answer was: <strong className="text-foreground">{feedbackMessage?.correctAnswer}</strong>
                </DialogUIDescription>
            </DialogHeader>
            <div className="py-4">
                <h4 className="font-semibold mb-2 text-primary">Explanation:</h4>
                <p className="text-sm text-muted-foreground">{feedbackMessage?.explanation}</p>
            </div>
            <DialogFooter>
                <Button onClick={handleEndGameAndRestart} className="w-full">Play Again</Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>

    {gameState === 'setup' && (
      <Card className="max-w-2xl mx-auto text-center">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Choose Your Topic</CardTitle>
          <CardDescription>Select a category to start the KBC quiz game.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
           <Button
                variant={selectedCategory === 'All' ? 'default' : 'outline'}
                onClick={() => setSelectedCategory('All')}
                className="h-16 text-md"
            >
                All Topics
            </Button>
            {ALL_CATEGORIES.map(category => (
            <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(category)}
                className="h-16 text-md"
            >
                {category}
            </Button>
            ))}
        </CardContent>
        <CardFooter>
          <Button onClick={startNewGame} size="lg" className="w-full bg-primary hover:bg-primary/90">
            Start Game
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
              <CardTitle className="text-xl text-center text-yellow-400">XP Ladder</CardTitle>
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
                    <CardTitle>Other Games</CardTitle>
                </CardHeader>
                <CardContent>
                    <Button asChild className="w-full">
                        <Link href="/number-match-game">Play Number Match Game</Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
      </div>
    )}
    </div>
  );
};
