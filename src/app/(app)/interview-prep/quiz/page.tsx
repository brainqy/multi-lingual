
"use client";

import { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
// RadioGroup and RadioGroupItem are not used in the new design
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, Bookmark, Check, ChevronLeft, ChevronRight, Clock, Send, X, PieChart as PieChartIcon, BarChart2 as BarChart2Icon, ListChecks, Maximize, Minimize, Info, CheckSquare as CheckSquareIcon, Circle, Radio } from 'lucide-react';
import { sampleInterviewQuestions, sampleCreatedQuizzes, sampleUserProfile } from '@/lib/sample-data';
import type { InterviewQuestion, MockInterviewSession } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, Tooltip as RechartsTooltip, Legend as RechartsLegend, BarChart as RechartsBarChart, XAxis, YAxis, CartesianGrid, Bar } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle as DialogUITitle, DialogDescription as DialogUIDescription, DialogFooter as DialogUIFooter, DialogClose } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { ScrollArea } from '@/components/ui/scroll-area';

const QUIZ_TIME_SECONDS_PER_QUESTION = 90; // Default, can be overridden by quiz settings
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8442FF', '#FF42A5', '#42FFA5'];


interface QuizResults {
  score: number;
  percentage: number;
  timeTaken: number;
  totalQuizTime: number;
  categoryStats: Record<string, { correct: number; total: number; accuracy: number }>;
  answeredCount: number;
  markedForReviewCount: number;
}

const optionLetters = ['A', 'B', 'C', 'D', 'E', 'F'];

export default function QuizPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({}); // Store selected option text
  const [visitedQuestions, setVisitedQuestions] = useState<Set<string>>(new Set());
  const [timeLeft, setTimeLeft] = useState(0);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizResults, setQuizResults] = useState<QuizResults | null>(null);
  const [markedForReview, setMarkedForReview] = useState<Set<string>>(new Set());
  const [totalQuizTime, setTotalQuizTime] = useState(0);

  const [quizMetadata, setQuizMetadata] = useState<Pick<MockInterviewSession, 'id' | 'topic' | 'description' | 'difficulty' | 'timerPerQuestion'> | null>(null);
  const [showStartQuizDialog, setShowStartQuizDialog] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const quizContainerRef = useRef<HTMLDivElement>(null);
  const [isNavDrawerOpen, setIsNavDrawerOpen] = useState(false);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);


  useEffect(() => {
    const questionIdsParam = searchParams.get('questions');
    const quizIdParam = searchParams.get('quizId');
    let loadedQuestions: InterviewQuestion[] = [];
    let loadedMetadata: Pick<MockInterviewSession, 'id' | 'topic' | 'description' | 'difficulty' | 'timerPerQuestion'> | null = null;

    if (quizIdParam) {
        const foundQuiz = sampleCreatedQuizzes.find(q => q.id === quizIdParam);
        if (foundQuiz) {
            loadedMetadata = { 
                id: foundQuiz.id,
                topic: foundQuiz.topic, 
                description: foundQuiz.description, 
                difficulty: foundQuiz.difficulty,
                timerPerQuestion: foundQuiz.timerPerQuestion 
            };
            if (foundQuiz.questions) {
              loadedQuestions = foundQuiz.questions.map(qRef => {
                  const fullQuestion = sampleInterviewQuestions.find(sq => sq.id === qRef.id);
                  return (fullQuestion && fullQuestion.isMCQ && fullQuestion.mcqOptions) ? fullQuestion : null;
              }).filter(q => q !== null && (q.approved !== false || q.createdBy === sampleUserProfile.id)) as InterviewQuestion[];
            }
            if (loadedQuestions.length === 0) {
                toast({title: "Invalid Quiz", description: `Quiz "${foundQuiz.topic}" has no usable MCQ questions.`, variant: "destructive", duration: 5000});
                 setTimeout(() => router.push('/interview-prep'), 500); 
                 return;
            }
        } else {
            toast({title: "Quiz Not Found", description: "The specified quiz ID could not be found.", variant: "destructive", duration: 5000});
            setTimeout(() => router.push('/interview-prep'), 500);
            return;
        }
    } else if (questionIdsParam) {
      const questionIds = questionIdsParam.split(',');
      loadedQuestions = sampleInterviewQuestions.filter(q => questionIds.includes(q.id) && q.isMCQ && q.mcqOptions && q.mcqOptions.length > 0 && (q.approved !== false || q.createdBy === sampleUserProfile.id));
       if (loadedQuestions.length === 0) {
          toast({title: "No Valid Questions", description: "None of the selected questions are valid for a quiz (must be MCQ, approved, with options).", variant: "destructive", duration: 5000});
          setTimeout(() => router.push('/interview-prep'), 500);
          return;
       }
       loadedMetadata = { id: `custom-${Date.now()}`, topic: 'Custom Quiz', description: `Quiz with ${loadedQuestions.length} selected questions.`, timerPerQuestion: QUIZ_TIME_SECONDS_PER_QUESTION };
    } else {
      // Fallback to a default small quiz if no params
      loadedQuestions = sampleInterviewQuestions.filter(q => q.isMCQ && q.mcqOptions && q.mcqOptions.length > 0 && (q.approved !== false || q.createdBy === sampleUserProfile.id)).slice(0,5); // Small default
      if (loadedQuestions.length === 0) {
         toast({title: "No Default Questions", description: "No default MCQ questions available for a quiz.", variant: "destructive", duration: 5000});
         setTimeout(() => router.push('/interview-prep'), 500);
         return;
      }
      loadedMetadata = { id: `default-${Date.now()}`, topic: 'General Knowledge Quiz', description: 'A quick quiz with default questions.', timerPerQuestion: QUIZ_TIME_SECONDS_PER_QUESTION };
    }

    setQuestions(loadedQuestions);
    setQuizMetadata(loadedMetadata);
    setShowStartQuizDialog(true);

    const calculatedTotalTime = loadedQuestions.length * (loadedMetadata?.timerPerQuestion || QUIZ_TIME_SECONDS_PER_QUESTION);
    setTotalQuizTime(calculatedTotalTime);
    
  }, [searchParams, router, toast]);

   useEffect(() => {
    if (!quizStarted || quizSubmitted || questions.length === 0 || totalQuizTime === 0) {
        if(timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        return;
    }

    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current); // Clear existing timer before starting a new one

    setTimeLeft(totalQuizTime); // Initialize timeLeft when quiz starts

    timerIntervalRef.current = setInterval(() => {
      setTimeLeft(prevTime => {
        if (prevTime <= 1) {
          if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
          if (!quizSubmittedRef.current) { // Check a ref to prevent multiple submissions
            handleSubmitQuiz(true); 
          }
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => {
        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [quizStarted, totalQuizTime, questions.length]); // Removed quizSubmitted to ensure timer starts

  const quizSubmittedRef = useRef(quizSubmitted);
  useEffect(() => {
    quizSubmittedRef.current = quizSubmitted;
  }, [quizSubmitted]);


  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const currentQuestion = useMemo(() => questions[currentQuestionIndex], [questions, currentQuestionIndex]);

  const handleAnswerSelect = (option: string) => {
    if (!currentQuestion || quizSubmitted) return;
    setUserAnswers(prev => ({ ...prev, [currentQuestion.id]: option }));
    setVisitedQuestions(prev => new Set(prev).add(currentQuestion.id));
  };
  
  const handleClearAnswer = () => {
    if (!currentQuestion || quizSubmitted) return;
    setUserAnswers(prev => {
      const newAnswers = {...prev};
      delete newAnswers[currentQuestion.id];
      return newAnswers;
    });
  }

  const navigateQuestion = (direction: 'next' | 'prev') => {
    if (quizSubmitted) return;
    setVisitedQuestions(prev => new Set(prev).add(currentQuestion.id)); // Mark current as visited before moving
    if (direction === 'next' && currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else if (direction === 'prev' && currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };
  
  const handleSaveAndNext = () => {
    // Answer is saved on select via handleAnswerSelect
    navigateQuestion('next');
  };

  const handleMarkForReview = () => {
    if (!currentQuestion || quizSubmitted) return;
    const newMarked = new Set(markedForReview);
    if (newMarked.has(currentQuestion.id)) {
        newMarked.delete(currentQuestion.id);
        toast({ title: "Question Unmarked", duration: 1500 });
    } else {
        newMarked.add(currentQuestion.id);
        toast({ title: "Marked for Review", duration: 1500 });
    }
    setMarkedForReview(newMarked);
  };
  
  const handleMarkAndNext = () => {
    if(!markedForReview.has(currentQuestion.id)){ // Mark if not already marked
        handleMarkForReview();
    }
    navigateQuestion('next');
  };


  const handleSubmitQuiz = (autoSubmitted = false) => {
    if (quizSubmittedRef.current) return; // Prevent multiple submissions
    quizSubmittedRef.current = true; // Set ref immediately
    setQuizSubmitted(true); // Set state

    if (isFullScreen && document.fullscreenElement && quizContainerRef.current === document.fullscreenElement) {
      document.exitFullscreen();
    }
    if(timerIntervalRef.current) clearInterval(timerIntervalRef.current);


    let score = 0;
    const categoryStats: Record<string, { correct: number; total: number }> = {};

    questions.forEach(q => {
      const category = q.category || 'Uncategorized';
      if (!categoryStats[category]) {
        categoryStats[category] = { correct: 0, total: 0 };
      }
      categoryStats[category].total += 1;

      if (q.correctAnswer && userAnswers[q.id] === q.correctAnswer) {
        score++;
        categoryStats[category].correct += 1;
      }
    });

    const percentage = questions.length > 0 ? (score / questions.length) * 100 : 0;
    const timeTaken = totalQuizTime - timeLeft; // timeLeft might be slightly off if cleared too early
    const answeredCount = Object.keys(userAnswers).length;
    const markedForReviewCount = markedForReview.size;

    const finalCategoryStats = Object.entries(categoryStats).reduce((acc, [key, val]) => {
      acc[key] = { ...val, accuracy: val.total > 0 ? parseFloat(((val.correct / val.total) * 100).toFixed(1)) : 0 };
      return acc;
    }, {} as QuizResults['categoryStats']);

    setQuizResults({
      score,
      percentage: parseFloat(percentage.toFixed(1)),
      timeTaken,
      totalQuizTime,
      categoryStats: finalCategoryStats,
      answeredCount,
      markedForReviewCount
    });

    toast({
      title: autoSubmitted ? "Quiz Auto-Submitted!" : "Quiz Submitted!",
      description: `You scored ${score} out of ${questions.length} (${percentage.toFixed(0)}%). View your detailed report.`,
      duration: 7000,
    });
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startQuiz = async () => {
    setShowStartQuizDialog(false);
    setQuizStarted(true);
    // setTimeLeft(totalQuizTime); // Moved to useEffect to ensure it runs after quizStarted and totalQuizTime are set
    
    if (quizContainerRef.current && !document.fullscreenElement) {
      try {
        await quizContainerRef.current.requestFullscreen();
        setIsFullScreen(true);
      } catch (err) {
        console.warn("Auto-fullscreen for quiz failed:", err);
        toast({ title: "Fullscreen Note", description: "Automatic fullscreen entry failed. You can enable it manually if needed.", variant: "default", duration: 4000});
      }
    }
  };

  const toggleFullScreen = async () => {
    if (!quizContainerRef.current) return;
    if (!document.fullscreenElement) {
      try {
        await quizContainerRef.current.requestFullscreen();
        // setIsFullScreen(true) will be set by event listener
      } catch (err) {
        toast({ title: "Fullscreen Error", description: `Could not enter fullscreen: ${(err as Error).message}`, variant: "destructive" });
      }
    } else {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
         // setIsFullScreen(false) will be set by event listener
      }
    }
  };

  const jumpToQuestion = (index: number) => {
    if (quizSubmitted) return;
    setVisitedQuestions(prev => new Set(prev).add(currentQuestion.id));
    setCurrentQuestionIndex(index);
    setIsNavDrawerOpen(false); // Close drawer after navigation
  };

  const getQuestionStatus = (questionId: string, index: number): 'answered' | 'notAnswered' | 'marked' | 'answeredAndMarked' | 'notVisited' | 'currentUnanswered' => {
    const isAnswered = !!userAnswers[questionId];
    const isMarked = markedForReview.has(questionId);
    const isVisited = visitedQuestions.has(questionId);

    if (index === currentQuestionIndex && !isAnswered) return 'currentUnanswered';
    if (isAnswered && isMarked) return 'answeredAndMarked';
    if (isAnswered) return 'answered';
    if (isMarked) return 'marked';
    if (isVisited) return 'notAnswered'; // Visited but not answered and not current
    return 'notVisited';
  };


  if (questions.length === 0 && !quizSubmitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] p-4">
        <Card className="w-full max-w-lg text-center p-8 shadow-lg">
          <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <CardTitle className="text-2xl font-bold">Loading Quiz...</CardTitle>
          <CardDescription className="mt-2">
            Preparing your quiz questions. If this takes too long, please check your selection or try again.
          </CardDescription>
           <Button onClick={() => router.push('/interview-prep')} className="mt-6">Back to Prep</Button>
        </Card>
      </div>
    );
  }

  if (!quizStarted && quizMetadata) {
    return (
      <Dialog open={showStartQuizDialog} onOpenChange={(open) => { if(!open && !quizStarted) router.push('/interview-prep')}}>
        <DialogContent>
          <DialogHeader>
            <DialogUITitle className="text-2xl">{quizMetadata.topic}</DialogUITitle>
            <DialogUIDescription className="text-sm text-muted-foreground">
              {quizMetadata.description || `Ready to start this quiz?`}
            </DialogUIDescription>
          </DialogHeader>
          <div className="py-4 space-y-2">
            <p className="flex items-center gap-2"><ListChecks className="h-5 w-5 text-primary"/> {questions.length} questions</p>
            <p className="flex items-center gap-2"><Clock className="h-5 w-5 text-primary"/> Time limit: {formatTime(totalQuizTime)}</p>
            {quizMetadata.difficulty && <p className="flex items-center gap-2"><Info className="h-5 w-5 text-primary"/> Difficulty: {quizMetadata.difficulty}</p>}
          </div>
          <DialogUIFooter>
            <Button variant="outline" onClick={() => router.push('/interview-prep')}>Cancel</Button>
            <Button onClick={startQuiz} className="bg-primary hover:bg-primary/90">Start Quiz</Button>
          </DialogUIFooter>
        </DialogContent>
      </Dialog>
    );
  }

  if (quizSubmitted && quizResults) {
    const categoryChartData = Object.entries(quizResults.categoryStats).map(([name, data]) => ({
        name,
        Correct: data.correct,
        Incorrect: data.total - data.correct,
        Total: data.total,
        Accuracy: data.accuracy,
    }));

    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 space-y-6 bg-secondary/30 dark:bg-background">
        <Card className="w-full max-w-2xl text-center p-6 shadow-xl">
          <CardHeader>
            <CardTitle className="text-3xl font-bold mb-2 text-primary">Quiz Complete!</CardTitle>
            <CardDescription className="text-lg">
              You scored {quizResults.score} out of {questions.length} ({quizResults.percentage.toFixed(0)}%).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="p-3 bg-background rounded-md border">
                    <p className="font-medium text-muted-foreground">Time Taken</p>
                    <p className="text-xl font-semibold text-foreground">{formatTime(quizResults.timeTaken)} / {formatTime(quizResults.totalQuizTime)}</p>
                </div>
                 <div className="p-3 bg-background rounded-md border">
                    <p className="font-medium text-muted-foreground">Answered / Marked</p>
                    <p className="text-xl font-semibold text-foreground">{quizResults.answeredCount}/{questions.length} Answered, {quizResults.markedForReviewCount} Marked</p>
                </div>
            </div>
          </CardContent>
        </Card>

        <Card className="w-full max-w-2xl p-6 shadow-xl">
            <CardHeader className="p-0 pb-4">
                <CardTitle className="text-xl font-semibold flex items-center gap-2"><BarChart2Icon className="h-5 w-5 text-primary"/>Sectional Performance</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                {categoryChartData.length > 0 ? (
                    <>
                        <div className="h-[250px] mb-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <RechartsBarChart data={categoryChartData} layout="vertical" margin={{ top: 5, right: 20, left: 50, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis type="number" allowDecimals={false} />
                                    <YAxis type="category" dataKey="name" width={100} tick={{fontSize: 12}}/>
                                    <RechartsTooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }} formatter={(value, name) => [`${value}${name === 'Accuracy' ? '%' : ''}`, name as string]}/>
                                    <RechartsLegend wrapperStyle={{fontSize: "12px"}}/>
                                    <Bar dataKey="Correct" stackId="a" fill={COLORS[0]} radius={[0, 4, 4, 0]}/>
                                    <Bar dataKey="Incorrect" stackId="a" fill={COLORS[3]} radius={[0, 4, 4, 0]}/>
                                </RechartsBarChart>
                            </ResponsiveContainer>
                        </div>
                         <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Category</TableHead>
                                    <TableHead className="text-center">Correct</TableHead>
                                    <TableHead className="text-center">Total</TableHead>
                                    <TableHead className="text-right">Accuracy</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {categoryChartData.map(cat => (
                                    <TableRow key={cat.name}>
                                        <TableCell className="font-medium">{cat.name}</TableCell>
                                        <TableCell className="text-center">{cat.Correct}</TableCell>
                                        <TableCell className="text-center">{cat.Total}</TableCell>
                                        <TableCell className="text-right font-semibold text-primary">{cat.Accuracy.toFixed(0)}%</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </>
                ) : (
                    <p className="text-muted-foreground text-center py-4">No category data to display.</p>
                )}
            </CardContent>
        </Card>

        <div className="w-full max-w-2xl">
            <Button onClick={() => router.push('/interview-prep')} className="w-full bg-primary hover:bg-primary/90">
                Back to Interview Prep
            </Button>
        </div>
      </div>
    );
  }


  if (!currentQuestion) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-lg text-center p-8 shadow-lg">
         <AlertCircle className="mx-auto h-12 w-12 text-destructive mb-4" />
         <CardTitle className="text-2xl font-bold">Error: Question Not Found</CardTitle>
         <CardDescription className="mt-2">Could not load the current question. Please try returning to the prep hub.</CardDescription>
         <Button onClick={() => router.push('/interview-prep')} className="mt-6">Back to Prep Hub</Button>
        </Card>
      </div>
    );
  }

  return (
    <div ref={quizContainerRef} className={cn("flex flex-col min-h-screen", isFullScreen ? "bg-background" : "bg-slate-50 dark:bg-slate-900")}>
      {/* Quiz Header */}
      <header className="bg-card shadow-sm p-2 md:p-3 sticky top-0 z-20 border-b">
        <div className="container mx-auto flex flex-wrap justify-between items-center gap-2">
          <h1 className="text-md md:text-lg font-semibold text-foreground truncate max-w-[calc(100%-250px)]" title={quizMetadata?.topic || 'Quiz'}>
            {quizMetadata?.topic || 'Quiz'}
          </h1>
          <div className="flex items-center gap-1 md:gap-2">
             <Sheet open={isNavDrawerOpen} onOpenChange={setIsNavDrawerOpen}>
              <SheetTrigger asChild>
                 <Button variant="ghost" size="icon" title="Question List" className="h-8 w-8 md:h-9 md:w-9">
                  <ListChecks className="h-4 w-4 md:h-5 md:w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-72 sm:w-80" portalContainer={quizContainerRef.current}>
                <SheetHeader className="p-4 border-b">
                  <SheetTitle>Question List</SheetTitle>
                </SheetHeader>
                <ScrollArea className="h-[calc(100vh-4rem)] p-4">
                  <ul className="space-y-1.5">
                    {questions.map((q, index) => (
                      <li key={q.id}>
                        <Button
                          variant="ghost"
                          className={cn(
                            "w-full justify-start text-left h-auto py-1.5 px-2 text-xs",
                            index === currentQuestionIndex && "bg-primary/10 text-primary font-semibold"
                          )}
                          onClick={() => jumpToQuestion(index)}
                        >
                          <span className="mr-1.5">{index + 1}.</span>
                          <span className="truncate flex-1">{q.questionText}</span>
                          {userAnswers[q.id] && <CheckSquareIcon className="ml-1.5 h-3.5 w-3.5 text-green-500 flex-shrink-0" />}
                          {markedForReview.has(q.id) && <Bookmark className="ml-1.5 h-3.5 w-3.5 text-yellow-500 flex-shrink-0" />}
                        </Button>
                      </li>
                    ))}
                  </ul>
                </ScrollArea>
                 <SheetClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary" />
              </SheetContent>
            </Sheet>
            <Button variant="ghost" size="icon" onClick={toggleFullScreen} title={isFullScreen ? "Exit Fullscreen" : "Enter Fullscreen"} className="h-8 w-8 md:h-9 md:w-9">
              {isFullScreen ? <Minimize className="h-4 w-4 md:h-5 md:w-5"/> : <Maximize className="h-4 w-4 md:h-5 md:w-5"/>}
            </Button>
            <div className="flex items-center gap-1 md:gap-2 px-2 py-1 md:px-2.5 md:py-1.5 rounded-md bg-destructive text-destructive-foreground font-mono text-sm md:text-md tracking-wider">
              <Clock className="h-4 w-4" />
              {formatTime(timeLeft)}
            </div>
          </div>
        </div>
      </header>

      {/* Main Quiz Area */}
      <div className={cn("flex-grow container mx-auto grid p-2 md:p-4 gap-2 md:gap-4", isFullScreen ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-[1fr_300px]")}>
        {/* Question & Options Area */}
        <Card className="shadow-xl bg-card flex flex-col overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center mb-1">
                <CardTitle className="text-sm md:text-base font-medium text-muted-foreground">Question {currentQuestionIndex + 1} of {questions.length}: {currentQuestion.category}</CardTitle>
            </div>
             <Progress value={((currentQuestionIndex + 1) / questions.length) * 100} className="w-full h-1 md:h-1.5 [&>div]:bg-primary" />
          </CardHeader>
          <CardContent className="flex-grow space-y-3 md:space-y-4 overflow-y-auto p-3 md:p-4">
             <p className="text-md md:text-lg font-semibold text-foreground whitespace-pre-line">{currentQuestion.questionText}</p>
             <div className="space-y-2 md:space-y-2.5">
              {currentQuestion.mcqOptions?.map((option, index) => (
                <div 
                    key={index} 
                    onClick={() => handleAnswerSelect(option)}
                    className={cn(
                        "flex items-start space-x-2.5 p-2.5 md:p-3 border rounded-md hover:bg-secondary/70 transition-colors cursor-pointer",
                        userAnswers[currentQuestion.id] === option ? "bg-primary/15 border-primary ring-1 ring-primary" : "bg-secondary/30 border-border"
                    )}
                >
                  <div className="flex items-center justify-center h-5 w-5 rounded-full border-2 mt-0.5 shrink-0
                    data-[state=checked]:bg-primary data-[state=checked]:border-primary data-[state=checked]:text-primary-foreground
                    data-[state=unchecked]:border-muted-foreground"
                    data-state={userAnswers[currentQuestion.id] === option ? "checked" : "unchecked"}
                  >
                     {userAnswers[currentQuestion.id] === option && <Check className="h-3.5 w-3.5"/>}
                  </div>
                  <Label htmlFor={`${currentQuestion.id}-opt-${index}`} className="font-normal text-sm md:text-md cursor-pointer flex-1">
                    <span className="font-medium mr-1">{optionLetters[index]}.</span>{option}
                  </Label>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="border-t p-2 md:p-3 flex flex-wrap justify-between items-center gap-1.5 md:gap-2">
            <Button variant="outline" size="sm" onClick={() => navigateQuestion('prev')} disabled={currentQuestionIndex === 0} className="text-xs md:text-sm px-2 md:px-3 py-1 md:py-1.5 h-auto">
              <ChevronLeft className="mr-1 h-3.5 w-3.5 md:h-4 md:w-4"/> Back
            </Button>
            <div className="flex gap-1.5 md:gap-2">
                <Button variant="outline" size="sm" onClick={handleClearAnswer} className="text-xs md:text-sm px-2 md:px-3 py-1 md:py-1.5 h-auto">Clear</Button>
                <Button
                    variant={markedForReview.has(currentQuestion.id) ? "default" : "outline"}
                    size="sm"
                    onClick={handleMarkForReview}
                    className={cn("text-xs md:text-sm px-2 md:px-3 py-1 md:py-1.5 h-auto", markedForReview.has(currentQuestion.id) && "bg-purple-500 hover:bg-purple-600 text-white border-purple-600")}
                >
                    <Bookmark className="mr-1 h-3.5 w-3.5 md:h-4 md:w-4"/> Mark
                </Button>
            </div>
            {currentQuestionIndex < questions.length - 1 ? (
                <div className="flex gap-1.5 md:gap-2">
                    <Button onClick={handleMarkAndNext} variant="outline" size="sm" className="text-xs md:text-sm px-2 md:px-3 py-1 md:py-1.5 h-auto">Mark & Next</Button>
                    <Button onClick={handleSaveAndNext} size="sm" className="text-xs md:text-sm px-2 md:px-3 py-1 md:py-1.5 h-auto bg-primary hover:bg-primary/90">
                        Save & Next <ChevronRight className="ml-1 h-3.5 w-3.5 md:h-4 md:w-4"/>
                    </Button>
                </div>
            ) : (
                 <Button onClick={() => handleSubmitQuiz()} size="sm" className="text-xs md:text-sm px-2 md:px-3 py-1 md:py-1.5 h-auto bg-green-600 hover:bg-green-700 text-primary-foreground">
                    <Send className="mr-1 h-3.5 w-3.5 md:h-4 md:w-4"/> Submit Quiz
                </Button>
            )}
          </CardFooter>
        </Card>

        {/* Right Panel: Question Palette & Legend */}
        <div className={cn("bg-card shadow-xl rounded-lg p-3 md:p-4 flex-col", isFullScreen ? "hidden" : "flex")}>
          <CardTitle className="text-base md:text-lg font-semibold mb-2 md:mb-3">Question Palette</CardTitle>
          <ScrollArea className="flex-grow mb-3 md:mb-4 pr-1">
            <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-5 gap-1 md:gap-1.5">
              {questions.map((q, index) => {
                const status = getQuestionStatus(q.id, index);
                return (
                  <Button
                    key={q.id}
                    variant="outline"
                    size="icon"
                    className={cn(
                      "h-7 w-7 md:h-8 md:w-8 text-xs md:text-sm rounded",
                      status === 'answered' && 'bg-green-500 text-white hover:bg-green-600 border-green-600',
                      status === 'notAnswered' && 'border-red-500 text-red-500 hover:bg-red-50',
                      status === 'marked' && 'bg-purple-500 text-white hover:bg-purple-600 border-purple-600',
                      status === 'answeredAndMarked' && 'bg-purple-500 text-white ring-2 ring-offset-1 ring-green-400 hover:bg-purple-600 border-purple-600',
                      status === 'currentUnanswered' && 'bg-red-500 text-white ring-2 ring-offset-1 ring-red-300 hover:bg-red-600 border-red-600',
                      status === 'notVisited' && 'border-border text-muted-foreground hover:bg-accent'
                    )}
                    onClick={() => jumpToQuestion(index)}
                    title={`Question ${index + 1}: ${q.questionText.substring(0,30)}...`}
                  >
                    {index + 1}
                  </Button>
                );
              })}
            </div>
          </ScrollArea>
          <div className="mt-auto space-y-1.5 md:space-y-2 text-xs md:text-sm border-t pt-2 md:pt-3">
            <h4 className="font-medium text-muted-foreground mb-1">Legend:</h4>
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm border bg-green-500"></div> Answered</div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm border bg-purple-500"></div> Marked for Review</div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm border border-red-500"></div> Not Answered (Current)</div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm border border-border bg-secondary/50"></div> Not Visited</div>
             <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm border border-red-500 bg-card"></div> Visited, Not Answered</div>
          </div>
          <Button onClick={() => handleSubmitQuiz()} className="w-full mt-3 md:mt-4 bg-green-600 hover:bg-green-700 text-white">
            SUBMIT QUIZ
          </Button>
        </div>
      </div>
    </div>
  );
}
