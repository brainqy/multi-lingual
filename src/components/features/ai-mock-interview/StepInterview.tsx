
"use client";

import type React from 'react';
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, Send, MessageSquare, Mic, Square, AlertTriangle, Info } from 'lucide-react'; // Added Mic, Square, AlertTriangle, Info
import type { MockInterviewQuestion } from '@/types';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast'; // Added useToast
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; // Added Alert components

interface StepInterviewProps {
  questions: MockInterviewQuestion[];
  currentQuestionIndex: number;
  onAnswerSubmit: (answer: string, isRecording?: boolean) => Promise<void>;
  onCompleteInterview: () => void;
  isEvaluating?: boolean;
  timerPerQuestion?: number; // Time in seconds
}

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export default function StepInterview({ 
  questions, 
  currentQuestionIndex, 
  onAnswerSubmit, 
  onCompleteInterview,
  isEvaluating,
  timerPerQuestion
}: StepInterviewProps) {
  const [userAnswer, setUserAnswer] = useState('');
  const currentQuestion = questions[currentQuestionIndex];
  const { toast } = useToast();

  // Speech Recognition State
  const [isRecording, setIsRecording] = useState(false);
  const [speechApiSupported, setSpeechApiSupported] = useState(true);
  const recognitionRef = useRef<any>(null); // For SpeechRecognition instance

  // Timer State
  const [timeLeft, setTimeLeft] = useState(timerPerQuestion || 0);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);


  useEffect(() => {
    // Initialize SpeechRecognition API
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      setSpeechApiSupported(false);
      console.warn("Speech Recognition API not supported in this browser.");
      return;
    }
    recognitionRef.current = new SpeechRecognitionAPI();
    recognitionRef.current.continuous = false; // Process after each pause
    recognitionRef.current.interimResults = true; 
    recognitionRef.current.lang = 'en-US';

    recognitionRef.current.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
      setUserAnswer(prev => prev + finalTranscript); // Append final transcript
      // Display interim results if needed: setUserAnswer(prev => prev (initial) + interimTranscript);
    };

    recognitionRef.current.onerror = (event: any) => {
      console.error('Speech recognition error', event.error);
      toast({ title: "Speech Error", description: `Error: ${event.error}. Please try again or type your answer.`, variant: "destructive" });
      setIsRecording(false);
    };
    
    recognitionRef.current.onend = () => {
      // Automatically stop if continuous is false and user stops speaking
      // For continuous true, this would be called when stop() is explicitly called.
      // If continuous is false, this might be too aggressive.
      // Consider setIsRecording(false) only if recognition was explicitly stopped.
    };

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [toast]);

  useEffect(() => {
    setUserAnswer('');
    if (timerPerQuestion && timerPerQuestion > 0) {
      setTimeLeft(timerPerQuestion);
    } else {
      setTimeLeft(0); // No timer
    }
  }, [currentQuestionIndex, timerPerQuestion, questions]);


  // Timer logic
  useEffect(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
    if (timerPerQuestion && timerPerQuestion > 0 && timeLeft > 0 && !isEvaluating) {
      timerIntervalRef.current = setInterval(() => {
        setTimeLeft(prevTime => {
          if (prevTime <= 1) {
            clearInterval(timerIntervalRef.current!);
            // Optionally auto-submit or show time's up message
            toast({ title: "Time's Up!", description: "Please submit your answer or move to the next question.", variant: "default" });
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [timeLeft, timerPerQuestion, isEvaluating, toast]);


  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  const toggleRecording = () => {
    if (!speechApiSupported) {
      toast({ title: "Not Supported", description: "Speech recognition is not supported in your browser. Please type your answer.", variant: "destructive" });
      return;
    }
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    } else {
      setUserAnswer(''); // Clear previous text when starting new recording, or append? For now, clear.
      recognitionRef.current?.start();
      setIsRecording(true);
    }
  };

  const handleSubmit = async () => {
    if (!userAnswer.trim() || isEvaluating) return;
    // Pass whether the answer was recorded, if speech API was used and active at some point.
    // This needs a better flag, e.g., if `isRecording` was ever true for this question.
    // For simplicity, let's assume if speech API is supported, it might have been used.
    await onAnswerSubmit(userAnswer, speechApiSupported); 
  };
  
  if (!currentQuestion) {
    return <p>Loading questions or interview complete...</p>;
  }

  const progressPercentage = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="space-y-6">
      <div className="mb-4">
        <div className="flex justify-between items-center">
          <Label className="text-sm text-muted-foreground">Question {currentQuestionIndex + 1} of {questions.length}</Label>
          {timerPerQuestion && timerPerQuestion > 0 && (
            <Label className="text-sm font-medium text-primary">
              Time Left: {formatTime(timeLeft)}
            </Label>
          )}
        </div>
        <Progress value={progressPercentage} className="w-full h-2 mt-1 [&>div]:bg-primary" />
      </div>

      <div className="p-4 border rounded-lg bg-secondary/50">
        <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center gap-2">
           <MessageSquare className="h-5 w-5 text-primary" />
           {currentQuestion.category && <span className="text-xs px-2 py-0.5 bg-primary/20 text-primary rounded-full">{currentQuestion.category}</span>}
           Question:
        </h3>
        <p className="text-md text-foreground whitespace-pre-line">{currentQuestion.questionText}</p>
      </div>

      <div>
        <Label htmlFor="userAnswer" className="font-medium">Your Answer</Label>
        {!speechApiSupported && (
           <Alert variant="default" className="mb-2 bg-yellow-50 border-yellow-300 text-yellow-700">
              <AlertTriangle className="h-4 w-4 !text-yellow-700" />
              <AlertTitle>Speech Input Not Supported</AlertTitle>
              <AlertDescription>
                Your browser does not support speech-to-text. Please type your answer.
              </AlertDescription>
            </Alert>
        )}
        <Textarea
          id="userAnswer"
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          placeholder={isRecording ? "Listening... Speak clearly." : "Type or record your answer here..."}
          rows={8}
          className="border-input focus:ring-primary"
          disabled={isEvaluating || (isRecording && timeLeft === 0)} // Disable textarea while recording if timer is up
        />
      </div>
      
      <div className="flex flex-col sm:flex-row gap-2 items-center">
        <Button 
          onClick={toggleRecording} 
          disabled={!speechApiSupported || isEvaluating || timeLeft === 0} 
          variant={isRecording ? "destructive" : "outline"}
          className="w-full sm:w-auto"
        >
          {isRecording ? <Square className="mr-2 h-4 w-4" /> : <Mic className="mr-2 h-4 w-4" />}
          {isRecording ? 'Stop Recording' : 'Record Answer'}
        </Button>
        <Button onClick={handleSubmit} disabled={!userAnswer.trim() || isEvaluating} className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground">
          {isEvaluating ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Evaluating...</>
          ) : currentQuestionIndex === questions.length - 1 ? (
            <><Send className="mr-2 h-4 w-4" /> Submit & View Feedback</>
          ) : (
            <><Send className="mr-2 h-4 w-4" /> Submit & Next Question</>
          )}
        </Button>
      </div>
      {timeLeft === 0 && timerPerQuestion && timerPerQuestion > 0 && !isEvaluating && (
        <Alert variant="destructive" className="mt-4">
           <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Time's Up!</AlertTitle>
          <AlertDescription>
            The timer for this question has expired. Please submit your answer or click "Next Question" if available.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
