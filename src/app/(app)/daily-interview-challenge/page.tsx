
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useI18n } from '@/hooks/use-i18n';
import { sampleChallenges, sampleInterviewQuestions } from '@/lib/sample-data';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Award, CheckCircle, Diamond, ChevronsRight, Users, Phone, User, X, Check, Repeat, Zap } from 'lucide-react';
import type { DailyChallenge, InterviewQuestion } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

const KBC_QUESTION_COUNT = 10;
const XP_LEVELS = [100, 200, 300, 500, 1000, 2000, 4000, 8000, 16000, 32000];

export default function KBCChallengePage() {
  const { t } = useI18n();
  const { toast } = useToast();

  const [flipChallenge, setFlipChallenge] = useState<DailyChallenge | undefined>(() => sampleChallenges.find(c => c.type === 'flip'));
  
  // KBC Game State
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [lockedAnswer, setLockedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [gameMessage, setGameMessage] = useState("Select an answer and lock it!");
  const [lifelines, setLifelines] = useState({ fiftyFifty: true, audiencePoll: true, expertAdvice: true });
  const [fiftyFiftyOptions, setFiftyFiftyOptions] = useState<string[] | null>(null);
  const [audiencePollData, setAudiencePollData] = useState<{ name: string; votes: number }[] | null>(null);

  const currentQuestion = useMemo(() => questions[currentQuestionIndex], [questions, currentQuestionIndex]);
  const currentXpLevel = currentQuestionIndex > 0 ? XP_LEVELS[currentQuestionIndex - 1] : 0;
  const nextXpLevel = XP_LEVELS[currentQuestionIndex];

  useEffect(() => {
    startNewGame();
  }, []);

  const startNewGame = () => {
    const mcqQuestions = sampleInterviewQuestions.filter(q => q.isMCQ && q.mcqOptions && q.mcqOptions.length >= 2 && q.correctAnswer);
    const shuffled = mcqQuestions.sort(() => 0.5 - Math.random());
    setQuestions(shuffled.slice(0, KBC_QUESTION_COUNT));
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setLockedAnswer(null);
    setShowResult(false);
    setIsGameOver(false);
    setLifelines({ fiftyFifty: true, audiencePoll: true, expertAdvice: true });
    setFiftyFiftyOptions(null);
    setAudiencePollData(null);
    setGameMessage("Select an answer and lock it!");
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
      if (currentQuestionIndex === questions.length - 1) {
        setGameMessage(`Correct! You've won ${nextXpLevel} XP! Game complete!`);
        setIsGameOver(true);
      } else {
        setGameMessage("Correct Answer! Click Next to continue.");
      }
    } else {
      setGameMessage(`Wrong Answer! The correct answer was: ${currentQuestion.correctAnswer}. You walk away with ${currentXpLevel} XP.`);
      setIsGameOver(true);
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

  const KBCGame = () => (
    <div className="bg-slate-900 text-white p-4 md:p-6 rounded-lg shadow-2xl border-4 border-slate-700 h-full flex flex-col">
      {/* Top Section: Lifelines & XP */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex gap-2">
          <Button onClick={useFiftyFifty} disabled={!lifelines.fiftyFifty || lockedAnswer} variant="outline" className="bg-slate-800 border-slate-600 hover:bg-slate-700 text-white rounded-full aspect-square p-2 h-auto">50:50</Button>
          <Button onClick={useAudiencePoll} disabled={!lifelines.audiencePoll || lockedAnswer} variant="outline" className="bg-slate-800 border-slate-600 hover:bg-slate-700 text-white rounded-full aspect-square p-2 h-auto"><Users className="h-5 w-5" /></Button>
          <Button onClick={useExpertAdvice} disabled={!lifelines.expertAdvice || lockedAnswer} variant="outline" className="bg-slate-800 border-slate-600 hover:bg-slate-700 text-white rounded-full aspect-square p-2 h-auto"><Phone className="h-5 w-5" /></Button>
        </div>
        <div className="text-right">
          <p className="text-sm text-slate-400">Next Reward</p>
          <p className="text-xl font-bold text-yellow-400 flex items-center gap-1 justify-end"><Zap className="h-5 w-5"/> {nextXpLevel.toLocaleString()} XP</p>
        </div>
      </div>
      
      {/* Main content */}
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
            <p className="text-slate-400 mb-2">Question {currentQuestionIndex + 1} for {nextXpLevel} XP</p>
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

      {/* Footer */}
      <div className="mt-6 text-center">
        <p className={cn("text-lg font-bold h-7", showResult && "animate-bounce",
          lockedAnswer && (lockedAnswer === currentQuestion.correctAnswer ? "text-green-400" : "text-red-400"))}>
          {gameMessage}
        </p>
        <div className="mt-2">
          {!lockedAnswer ? (
            <Button onClick={handleLockAnswer} disabled={!selectedAnswer} size="lg" className="bg-blue-600 hover:bg-blue-500">Lock Answer</Button>
          ) : !isGameOver ? (
            <Button onClick={handleNextQuestion} size="lg" className="bg-green-600 hover:bg-green-500">Next Question <ChevronsRight /></Button>
          ) : (
            <Button onClick={startNewGame} size="lg" className="bg-yellow-500 hover:bg-yellow-400 text-black">Play Again <Repeat className="ml-2"/></Button>
          )}
        </div>
      </div>
    </div>
  );

  const XPLevelItem = ({ level, xp, isCurrent, isNext, isPassed }: { level: number, xp: number, isCurrent: boolean, isNext: boolean, isPassed: boolean }) => (
    <div className={cn("flex items-center justify-between p-1.5 rounded", 
      isCurrent && "bg-orange-500 text-white font-bold ring-2 ring-white",
      isNext && "bg-yellow-400 text-black",
      isPassed && "bg-green-600 text-white",
    )}>
      <span className={cn("text-sm", isCurrent && "font-bold")}>{level}</span>
      <span className="text-sm font-semibold flex items-center gap-1"><Diamond className="h-3 w-3"/> {xp.toLocaleString()} XP</span>
    </div>
  );

  const renderFlipChallenge = (challenge: DailyChallenge) => (
    <Card className="shadow-lg bg-primary/5 border-primary/20 h-full flex flex-col">
       <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl flex items-center gap-2"><Award className="h-5 w-5 text-yellow-500"/> {t("dailyChallenge.flipChallengeTitle", { default: "Flip Challenge" })}</CardTitle>
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
          <Button onClick={() => toast({ title: "Coming Soon!", description: "Task completion tracking is under development."})}>{t("dailyChallenge.completeTasksButton", { default: "Complete Tasks to Earn XP" })}</Button>
        </CardFooter>
    </Card>
  );

  return (
    <div className="container mx-auto max-w-7xl py-8 px-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* KBC Game taking up 2/3 of the space */}
        <div className="lg:col-span-2">
          <KBCGame />
        </div>
        
        {/* XP Ladder and Flip Challenge */}
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
                    isCurrent={index === currentQuestionIndex}
                    isNext={index === currentQuestionIndex + 1 && !isGameOver}
                    isPassed={index < currentQuestionIndex}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
          
          {flipChallenge && renderFlipChallenge(flipChallenge)}
        </div>
      </div>
    </div>
  );
};
