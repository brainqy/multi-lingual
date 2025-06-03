
"use client";

import type React from 'react';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Loader2, Bot, Maximize, Minimize, Settings2, Mic, Square, Video as VideoIcon, VideoOff, Send, MessageSquare, ListChecks, RefreshCw, Share2, AlertTriangle, CheckSquare as CheckSquareIcon, Bookmark, Radio, Download } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import type {
  MockInterviewStepId,
  GenerateMockInterviewQuestionsInput,
  MockInterviewSession,
  MockInterviewQuestion,
  EvaluateInterviewAnswerInput,
  GenerateOverallInterviewFeedbackInput,
  GenerateOverallInterviewFeedbackOutput,
  MockInterviewAnswer,
  RecordingReference,
  InterviewQuestionCategory
} from '@/types';
import { MOCK_INTERVIEW_STEPS } from '@/types';
import AiMockInterviewStepper from '@/components/features/ai-mock-interview/AiMockInterviewStepper';
import StepSetup from '@/components/features/ai-mock-interview/StepSetup';
import StepFeedback from '@/components/features/ai-mock-interview/StepFeedback';
import { sampleUserProfile, sampleCommunityPosts } from '@/lib/sample-data';
import { generateMockInterviewQuestions } from '@/ai/flows/generate-mock-interview-questions';
import { evaluateInterviewAnswer } from '@/ai/flows/evaluate-interview-answer';
import { generateOverallInterviewFeedback } from '@/ai/flows/generate-overall-interview-feedback';
import { cn } from '@/lib/utils';
import { useSearchParams, useRouter } from 'next/navigation';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';


declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

const logger = {
  info: (message: string, ...args: any[]) => console.log(`[AIMockInterviewPage INFO] ${message}`, ...args),
  error: (message: string, ...args: any[]) => console.error(`[AIMockInterviewPage ERROR] ${message}`, ...args),
  debug: (message: string, ...args: any[]) => console.debug(`[AIMockInterviewPage DEBUG] ${message}`, ...args),
};

const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
};


export default function AiMockInterviewPage() {
  const [currentUiStepId, setCurrentUiStepId] = useState<MockInterviewStepId>('setup');
  const [session, setSession] = useState<MockInterviewSession | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isEvaluatingAnswer, setIsEvaluatingAnswer] = useState(false);
  const [userAnswer, setUserAnswer] = useState('');
  const [currentAnswerFeedback, setCurrentAnswerFeedback] = useState<MockInterviewAnswer | null>(null);

  const { toast } = useToast();
  const currentUser = sampleUserProfile;
  const searchParams = useSearchParams();
  const router = useRouter();

  const interviewContainerRef = useRef<HTMLDivElement>(null);
  const [isInterviewFullScreen, setIsInterviewFullScreen] = useState(false);

  // Media states
  const selfVideoRef = useRef<HTMLVideoElement>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [isVideoActive, setIsVideoActive] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [isMicMuted, setIsMicMuted] = useState(false);

  // Recording states
  const [isSpeechRecording, setIsSpeechRecording] = useState(false);
  const [isSessionAudioRecording, setIsSessionAudioRecording] = useState(false);
  const [speechApiSupported, setSpeechApiSupported] = useState(true);
  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const [browserSupportsMediaRecording, setBrowserSupportsMediaRecording] = useState(true);
  const [localRecordingReferences, setLocalRecordingReferences] = useState<RecordingReference[]>([]);


  // Timer State
  const [timeLeft, setTimeLeft] = useState(0);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const currentQuestion = useMemo(() => {
    return session?.questions?.[currentQuestionIndex];
  }, [session, currentQuestionIndex]);


  // Initialize SpeechRecognition API
  useEffect(() => {
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      setSpeechApiSupported(false);
      logger.info("Speech Recognition API not supported in this browser.");
      return;
    }
    recognitionRef.current = new SpeechRecognitionAPI();
    recognitionRef.current.continuous = false;
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
      setUserAnswer(prev => (prev + finalTranscript.trim() + ' ').trimStart());
    };
    recognitionRef.current.onerror = (event: any) => {
      logger.error('Speech recognition error', event.error);
      toast({ title: "Speech Error", description: `Error: ${event.error}. Please try typing.`, variant: "destructive" });
      setIsSpeechRecording(false);
    };
    recognitionRef.current.onend = () => {
      // setIsSpeechRecording(false); // Often, you want to keep it active if stop wasn't explicit
    };
  }, [toast]);

  // Initialize MediaRecorder check
   useEffect(() => {
    if (typeof window !== 'undefined' && (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder)) {
      setBrowserSupportsMediaRecording(false);
      logger.info("MediaRecorder API or getUserMedia not supported. Overall session recording disabled.");
    }
  }, []);


  const stopAllMediaStreams = useCallback(() => {
    logger.debug("stopAllMediaStreams called");
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
      logger.info("Camera stream stopped.");
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      logger.info("MediaRecorder explicitly stopped.");
    } else {
      setIsSessionAudioRecording(false);
    }
    setIsVideoActive(false);
    setIsSpeechRecording(false);
    if (recognitionRef.current?.state === 'recording') recognitionRef.current.stop(); // Ensure speech recognition is stopped
  }, [cameraStream]);


  // Initialize based on query params & cleanup
  useEffect(() => {
    const sourceSessionId = searchParams.get('sourceSessionId');
    const topicFromUrl = searchParams.get('topic');
    logger.info("AI Mock Interview Page loaded. Topic from URL:", topicFromUrl, "Source Session ID:", sourceSessionId);

    if (topicFromUrl && !session) {
      const initialConfig: GenerateMockInterviewQuestionsInput = {
        topic: topicFromUrl,
        jobDescription: searchParams.get('jobDescription') || undefined,
        numQuestions: parseInt(searchParams.get('numQuestions') || '5', 10),
        difficulty: (searchParams.get('difficulty') as GenerateMockInterviewQuestionsInput['difficulty']) || 'medium',
        timerPerQuestion: parseInt(searchParams.get('timerPerQuestion') || '0', 10) || undefined,
        questionCategories: searchParams.get('categories')?.split(',') as InterviewQuestionCategory[] | undefined,
      };
      logger.info("Initial config from URL params:", initialConfig);
      handleSetupComplete(initialConfig);
      
      if (searchParams.get('autoFullScreen') === 'true' && interviewContainerRef.current && !document.fullscreenElement) {
          interviewContainerRef.current.requestFullscreen().catch(err => {
            logger.warn("Auto-fullscreen failed on initial load:", err.message);
          });
      }
    }
    return () => {
      logger.info("AI Mock Interview Page unmounting. Stopping all streams.");
      stopAllMediaStreams();
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
  }, [searchParams]); // Removed session and handleSetupComplete, stopAllMediaStreams from deps

  // Fullscreen logic
  useEffect(() => {
    const handleFullscreenChange = () => {
        const isFs = !!document.fullscreenElement;
        logger.info("Fullscreen state changed. Is fullscreen:", isFs);
        setIsInterviewFullScreen(isFs);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleInterviewFullScreen = useCallback(async () => {
    if (!interviewContainerRef.current) return;
    if (!document.fullscreenElement) {
      try {
        await interviewContainerRef.current.requestFullscreen();
        logger.info("Entered fullscreen.");
      } catch (err) {
        toast({ title: "Fullscreen Error", description: `Could not enter fullscreen: ${(err as Error).message}`, variant: "destructive" });
        logger.error("Fullscreen request error:", err);
      }
    } else {
      try {
        await document.exitFullscreen();
        logger.info("Exited fullscreen.");
      } catch (err) {
         toast({ title: "Fullscreen Error", description: `Could not exit fullscreen: ${(err as Error).message}`, variant: "destructive" });
         logger.error("Exit fullscreen error:", err);
      }
    }
  }, [toast]);

  // Timer logic
  useEffect(() => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    if (currentQuestion && session?.timerPerQuestion && session.timerPerQuestion > 0 && timeLeft > 0 && !isEvaluatingAnswer && currentUiStepId === 'interview') {
      timerIntervalRef.current = setInterval(() => {
        setTimeLeft(prevTime => {
          if (prevTime <= 1) {
            clearInterval(timerIntervalRef.current!);
            toast({ title: "Time's Up!", description: "Please submit your answer.", variant: "default" });
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }
    return () => { if (timerIntervalRef.current) clearInterval(timerIntervalRef.current); };
  }, [timeLeft, session?.timerPerQuestion, isEvaluatingAnswer, currentUiStepId, currentQuestion, toast]);

  const startVideoStream = useCallback(async () => {
    logger.info("Attempting to start video stream...");
    if (!navigator.mediaDevices?.getUserMedia) {
      setHasCameraPermission(false);
      setIsVideoActive(false);
      toast({ title: "Camera Error", description: "Camera access not supported.", variant: "destructive" });
      return null;
    }
    try {
      if (cameraStream) {
          cameraStream.getTracks().forEach(track => track.stop());
          logger.debug("Stopped existing camera stream before starting new one.");
      }
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: !isMicMuted });
      setCameraStream(stream);
      if (selfVideoRef.current) {
           selfVideoRef.current.srcObject = stream;
           logger.debug("Camera stream assigned to selfVideoRef.");
      } else {
           logger.warn("selfVideoRef.current is null when trying to assign stream.");
      }
      setHasCameraPermission(true);
      setIsVideoActive(true);
      logger.info("Video stream started successfully.");
      return stream;
    } catch (err) {
      logger.error("Error accessing camera:", err);
      setHasCameraPermission(false);
      setIsVideoActive(false);
      toast({ title: "Camera Access Denied", description: "Please enable camera permissions.", variant: "destructive" });
      return null;
    }
  }, [isMicMuted, toast, cameraStream]);

  const handleSetupComplete = async (config: GenerateMockInterviewQuestionsInput) => {
    setIsLoading(true);
    setCurrentAnswerFeedback(null);
    try {
      logger.info("Requesting interview questions with config:", config);
      const { questions: genQuestions } = await generateMockInterviewQuestions(config);
      logger.info("Received questions from AI:", genQuestions);

      if (!genQuestions || genQuestions.length === 0) {
        toast({ title: "Setup Failed", description: "The AI could not generate any questions for this topic/JD. Please try adjusting your setup or ensure the topic is specific enough.", variant: "destructive", duration: 7000 });
        setIsLoading(false);
        setCurrentUiStepId('setup');
        router.replace('/ai-mock-interview', undefined);
        return;
      }

      const newSession: MockInterviewSession = {
        id: `session-ai-${Date.now()}`,
        userId: currentUser.id,
        topic: config.topic,
        jobDescription: config.jobDescription,
        questions: genQuestions,
        answers: [],
        status: 'in-progress',
        createdAt: new Date().toISOString(),
        timerPerQuestion: config.timerPerQuestion,
        difficulty: config.difficulty,
        questionCategories: config.questionCategories,
        recordingReferences: [],
      };
      setSession(newSession);
      setCurrentQuestionIndex(0);
      setUserAnswer('');
      if (config.timerPerQuestion && config.timerPerQuestion > 0) {
        setTimeLeft(config.timerPerQuestion);
      } else {
        setTimeLeft(0);
      }
      setCurrentUiStepId('interview');
      toast({ title: "Interview Ready!", description: `${genQuestions.length} questions generated. Let's begin!` });
      await startVideoStream();

    } catch (error: any) {
      logger.error("Error during setup or question generation:", error);
      toast({ title: "Setup Failed", description: error.message || "Could not generate interview questions.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerSubmit = async () => {
    if (!session || !currentQuestion || !userAnswer.trim() || isEvaluatingAnswer) return;

    setIsEvaluatingAnswer(true);
    setCurrentAnswerFeedback(null);
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    if (isSpeechRecording) { // Stop speech recording if active
        recognitionRef.current?.stop();
        setIsSpeechRecording(false);
    }


    try {
      const evaluationInput: EvaluateInterviewAnswerInput = {
        questionText: currentQuestion.questionText,
        userAnswer,
        topic: session.topic,
        jobDescription: session.jobDescription,
      };
      const evaluationResult = await evaluateInterviewAnswer(evaluationInput);

      const newAnswer: MockInterviewAnswer = {
        questionId: currentQuestion.id,
        questionText: currentQuestion.questionText,
        userAnswer,
        aiFeedback: evaluationResult.feedback,
        aiScore: evaluationResult.score,
        strengths: evaluationResult.strengths,
        areasForImprovement: evaluationResult.areasForImprovement,
        suggestedImprovements: evaluationResult.suggestedImprovements,
      };

      setSession(prevSession => {
        if (!prevSession) return null;
        return { ...prevSession, answers: [...prevSession.answers, newAnswer] };
      });
      setCurrentAnswerFeedback(newAnswer);

    } catch (error: any) {
      logger.error("Error evaluating answer:", error);
      toast({ title: "Evaluation Failed", description: error.message || "Could not evaluate your answer.", variant: "destructive" });
    } finally {
      setIsEvaluatingAnswer(false);
    }
  };

  const handleNextQuestion = () => {
    if (!session || currentQuestionIndex >= session.questions.length - 1) {
        handleCompleteInterview();
        return;
    }
    setCurrentQuestionIndex(prev => prev + 1);
    setUserAnswer('');
    setCurrentAnswerFeedback(null);
    if (session.timerPerQuestion && session.timerPerQuestion > 0) {
        setTimeLeft(session.timerPerQuestion);
    }
  };

  const handleCompleteInterview = async () => {
    if (!session || !session.answers) {
      toast({ title: "Interview Issue", description: "No session data or answers recorded.", variant: "destructive" });
      setCurrentUiStepId('setup');
      router.replace('/ai-mock-interview', undefined);
      return;
    }
     if (session.answers.length === 0 && session.questions.length > 0) {
      toast({ title: "No Answers Provided", description: "Please answer at least one question to get overall feedback.", variant: "warning" });
      return;
    }

    setIsLoading(true);
    try {
       const feedbackInput: GenerateOverallInterviewFeedbackInput = {
        topic: session.topic,
        jobDescription: session.jobDescription,
        evaluatedAnswers: session.answers.map(a => ({
            questionText: a.questionText,
            userAnswer: a.userAnswer,
            feedback: a.aiFeedback || "N/A",
            score: a.aiScore || 0,
        })),
      };
      const overallFeedbackResult = await generateOverallInterviewFeedback(feedbackInput);
      setSession(prevSession => prevSession ? ({
        ...prevSession,
        overallFeedback: overallFeedbackResult as GenerateOverallInterviewFeedbackOutput,
        overallScore: overallFeedbackResult.overallScore,
        status: 'completed',
        recordingReferences: localRecordingReferences,
      }) : null);
      setCurrentUiStepId('feedback');
      toast({ title: "Interview Complete!", description: "Your overall feedback is ready." });
      if (isInterviewFullScreen && document.fullscreenElement) {
        document.exitFullscreen();
      }
      stopAllMediaStreams();
    } catch (error: any) {
        logger.error("Error generating overall feedback:", error);
        toast({ title: "Feedback Generation Failed", description: error.message || "Could not generate overall interview feedback.", variant: "destructive" });
    } finally {
        setIsLoading(false);
    }
  };

  const handleRestartInterview = () => {
    setCurrentUiStepId('setup');
    setSession(null);
    setCurrentQuestionIndex(0);
    setIsLoading(false);
    setIsEvaluatingAnswer(false);
    setUserAnswer('');
    setCurrentAnswerFeedback(null);
    setTimeLeft(0);
    stopAllMediaStreams();
    setLocalRecordingReferences([]);
    if (isInterviewFullScreen && document.fullscreenElement) {
      document.exitFullscreen();
    }
    router.replace('/ai-mock-interview', undefined);
  };

  // Media Handling
  const handleToggleVideo = async () => {
    if (isVideoActive) {
      stopAllMediaStreams(); 
    } else {
      await startVideoStream();
    }
  };

  const handleToggleMic = () => {
    const newMutedState = !isMicMuted;
    setIsMicMuted(newMutedState);
    if (cameraStream) {
      cameraStream.getAudioTracks().forEach(track => track.enabled = !newMutedState);
    }
    toast({ title: newMutedState ? "Mic Muted" : "Mic Unmuted", duration: 1500 });
  };

  const toggleSpeechRecording = () => {
    if (!speechApiSupported) {
      toast({ title: "Not Supported", description: "Speech recognition isn't supported here. Please type.", variant: "destructive" });
      return;
    }
    if (isSpeechRecording) {
      recognitionRef.current?.stop();
      setIsSpeechRecording(false);
    } else {
      // setUserAnswer(''); // Decide if you want to clear previous text
      recognitionRef.current?.start();
      setIsSpeechRecording(true);
    }
  };

  const toggleSessionAudioRecording = async () => {
    if (!browserSupportsMediaRecording) {
        toast({ title: "Recording Not Supported", description: "Your browser does not support session audio recording.", variant: "destructive" });
        return;
    }
    if (isSessionAudioRecording) {
        mediaRecorderRef.current?.stop(); // onstop will handle cleanup and state
    } else {
        let streamToRecord: MediaStream | null = null;
        if (cameraStream && cameraStream.getAudioTracks().length > 0 && !isMicMuted) {
            streamToRecord = new MediaStream(cameraStream.getAudioTracks());
            logger.info("Recording: Mic audio from camera stream.");
        } else if (!isMicMuted) {
            try {
                const audioOnlyStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
                if (!cameraStream) setCameraStream(audioOnlyStream); 
                streamToRecord = audioOnlyStream;
                logger.info("Started audio-only stream for recording.");
            } catch (err) {
                 logger.error("Failed to get audio-only stream for recording:", err);
                 toast({ title: "Mic Error", description: "Could not access microphone for recording.", variant: "destructive"});
                 return;
            }
        } else {
            toast({ title: "No Audio Input", description: "Please enable your microphone to record the session audio.", variant: "warning" });
            return;
        }

        if (!streamToRecord || streamToRecord.getAudioTracks().length === 0) {
            toast({ title: "Recording Error", description: "No active audio stream to record.", variant: "destructive"});
            return;
        }

        try {
            const options = { mimeType: MediaRecorder.isTypeSupported('audio/webm; codecs=opus') ? 'audio/webm; codecs=opus' : 'audio/ogg; codecs=opus' };
            if(!MediaRecorder.isTypeSupported(options.mimeType)) {
                 options.mimeType = 'audio/webm'; // Fallback if opus not supported
                 if(!MediaRecorder.isTypeSupported(options.mimeType)) {
                    logger.warn("audio/webm not supported, browser default will be used.");
                    delete (options as any).mimeType;
                 }
            }

            mediaRecorderRef.current = new MediaRecorder(streamToRecord, options);
            recordedChunksRef.current = [];
            mediaRecorderRef.current.ondataavailable = (event) => {
                if (event.data.size > 0) recordedChunksRef.current.push(event.data);
            };
            mediaRecorderRef.current.onstop = () => {
                const finalMimeType = mediaRecorderRef.current?.mimeType || 'audio/webm';
                const recordedBlob = new Blob(recordedChunksRef.current, { type: finalMimeType });
                const url = URL.createObjectURL(recordedBlob);
                const newRecRef: RecordingReference = { 
                    id: `rec-audio-${Date.now()}`, 
                    sessionId: session!.id, 
                    startTime: new Date().toISOString(), 
                    durationSeconds: 0, /* TODO: calculate duration */ 
                    type: 'audio', 
                    blobUrl: url, 
                    fileName: `ai_mock_interview_audio_${session!.id}_${new Date().toISOString().replace(/:/g,'-')}.${finalMimeType.split('/')[1].split(';')[0] || 'webm'}` 
                };
                setLocalRecordingReferences(prev => [...prev, newRecRef]);
                toast({ title: "Audio Recording Stopped", description: `Audio recording saved (mock).`, duration: 5000 });
                setIsSessionAudioRecording(false); 
            };
            mediaRecorderRef.current.start();
            setIsSessionAudioRecording(true);
            toast({ title: "Session Audio Recording Started" });
        } catch (err) {
            logger.error("MediaRecorder init error for audio:", err);
            toast({ title: "Recording Error", description: "Could not start session audio recording.", variant: "destructive" });
            setIsSessionAudioRecording(false);
        }
    }
  };

  return (
    <div ref={interviewContainerRef} className={cn("max-w-7xl mx-auto space-y-2 md:space-y-4", isInterviewFullScreen && currentUiStepId === 'interview' && "fixed inset-0 z-50 bg-background p-1 md:p-2")}>
      <Card className={cn("shadow-xl bg-card", isInterviewFullScreen && currentUiStepId === 'interview' && "h-full flex flex-col")}>
        <CardHeader className="flex flex-row justify-between items-center py-2 px-2 md:py-3 md:px-4">
          <div className="flex-1 flex items-center gap-2">
            <Bot className="h-5 w-5 md:h-6 md:w-6 text-primary" />
            <CardTitle className="text-md md:text-xl font-bold tracking-tight text-foreground">AI Mock Interview</CardTitle>
            {!(currentUiStepId === 'interview' && isInterviewFullScreen) && <AiMockInterviewStepper currentStep={currentUiStepId} />}
          </div>
          <div className="flex items-center gap-1 md:gap-2">
             {currentUiStepId === 'interview' && (
                <Button onClick={toggleInterviewFullScreen} variant="ghost" size="icon" title={isInterviewFullScreen ? "Exit Fullscreen" : "Enter Fullscreen"} className="h-7 w-7 md:h-8 md:w-8">
                    {isInterviewFullScreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
                </Button>
            )}
            {currentUiStepId !== 'setup' && (
                <Button onClick={handleRestartInterview} variant="outline" size="sm" className="text-xs h-7 md:h-8 px-2"><RefreshCw className="mr-1 h-3 w-3"/>Restart</Button>
            )}
          </div>
        </CardHeader>
        {!(currentUiStepId === 'interview' && isInterviewFullScreen) && (
             <CardContent className="border-t pt-2 md:pt-4 px-2 md:px-4">
                <CardDescription className="text-xs md:text-sm">{MOCK_INTERVIEW_STEPS.find(s => s.id === currentUiStepId)?.description}</CardDescription>
             </CardContent>
        )}
      </Card>

      <div className={cn("transition-all duration-300", currentUiStepId === 'interview' && isInterviewFullScreen ? "flex-grow flex flex-col overflow-hidden" : "relative")}>
          {currentUiStepId === 'setup' && <Card className="shadow-lg"><CardContent className="p-3 md:p-4 lg:p-6"><StepSetup onSetupComplete={handleSetupComplete} isLoading={isLoading} /></CardContent></Card>}
          {currentUiStepId === 'feedback' && session && <StepFeedback session={session} onRestart={handleRestartInterview} />}

          {isLoading && currentUiStepId !== 'interview' && (
              <div className="flex flex-col items-center justify-center h-64">
              <Loader2 className="h-10 w-10 md:h-12 md:w-12 animate-spin text-primary" />
              <p className="mt-2 md:mt-3 text-muted-foreground">Loading, please wait...</p>
              </div>
          )}

          {currentUiStepId === 'interview' && session && currentQuestion && (
            <div className={cn("grid grid-cols-1 lg:grid-cols-3 gap-2 md:gap-4", isInterviewFullScreen ? "h-full flex-grow" : "min-h-[500px] md:min-h-[600px]")}>
                {/* Main Video/Interaction Area */}
                <div className={cn("lg:col-span-2 bg-slate-800 rounded-lg flex flex-col p-1 md:p-2 relative shadow-xl justify-between", isInterviewFullScreen && "flex-grow")}>
                    <div className="w-full aspect-video bg-slate-700 rounded-md flex items-center justify-center text-slate-300 relative overflow-hidden mb-1 md:mb-2 flex-grow">
                        {/* Main AI display area */}
                        <div className="text-center p-4">
                            <Bot className="h-12 w-12 md:h-16 md:w-16 text-slate-400 mx-auto mb-2" />
                            <p className="text-sm md:text-base text-slate-300">
                              {isEvaluatingAnswer ? "AI is thinking..." : 
                               currentAnswerFeedback ? "See feedback in the panel ->" : 
                               `AI Interviewer${session.topic ? `: ${session.topic}` : ''}`}
                            </p>
                            {isLoading && <p className="text-xs text-slate-400 mt-1">Loading question...</p>}
                        </div>
                        {currentAnswerFeedback && <div className="absolute top-1 md:top-2 left-1 md:left-2 text-xs p-1 bg-black/30 rounded text-white">Feedback for Q{currentQuestionIndex}</div>}
                    </div>
                    {/* Self-View */}
                    <div className="absolute top-1 right-1 md:top-2 md:right-2 w-28 h-auto md:w-32 lg:w-40 aspect-video bg-slate-900 rounded shadow-md overflow-hidden border border-slate-600">
                    <video ref={selfVideoRef} className={cn("w-full h-full object-cover", !isVideoActive && "hidden")} autoPlay playsInline muted />
                    {!isVideoActive && (
                        <div className="w-full h-full flex items-center justify-center text-slate-500">
                            <VideoOff className="h-5 w-5 md:h-6 md:w-6"/>
                        </div>
                    )}
                    {hasCameraPermission === false && isVideoActive && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/70 p-0.5 md:p-1">
                            <Alert variant="destructive" className="text-[8px] md:text-[9px] p-1"><AlertTriangle className="h-3 w-3" /><AlertTitle className="text-[9px] md:text-[10px]">Cam Denied</AlertTitle><AlertDescription className="text-[7px] md:text-[8px]">Enable in browser.</AlertDescription></Alert>
                        </div>
                    )}
                    <p className="absolute bottom-0.5 left-0.5 text-[8px] md:text-[10px] bg-black/50 px-0.5 py-px md:px-1 md:py-0.5 rounded text-white">{currentUser.name} (You)</p>
                    </div>
                    {/* Controls */}
                    <div className="flex justify-center items-center gap-1 md:gap-2 p-1 md:p-2 bg-slate-900/70 backdrop-blur-sm rounded-md">
                      <Button variant={isMicMuted ? "destructive" : "outline"} size="icon" onClick={handleToggleMic} title={isMicMuted ? "Unmute" : "Mute"} className="bg-white/10 hover:bg-white/20 border-white/20 text-white h-8 w-8 md:h-9 md:w-9"><Mic className="h-4 w-4 md:h-5 md:w-5" /></Button>
                      <Button variant={!isVideoActive ? "destructive" : "outline"} size="icon" onClick={handleToggleVideo} title={isVideoActive ? "Stop Video" : "Start Video"} className="bg-white/10 hover:bg-white/20 border-white/20 text-white h-8 w-8 md:h-9 md:w-9"><VideoIcon className="h-4 w-4 md:h-5 md:w-5" /></Button>
                      {browserSupportsMediaRecording && (
                          <Button variant={isSessionAudioRecording ? "destructive" : "outline"} size="icon" onClick={toggleSessionAudioRecording} title={isSessionAudioRecording ? "Stop Session Recording" : "Record Session Audio"} className="bg-white/10 hover:bg-white/20 border-white/20 text-white h-8 w-8 md:h-9 md:w-9">
                          {isSessionAudioRecording ? <Square className="h-4 w-4 md:h-5 md:w-5 animate-pulse fill-current"/> : <Radio className="h-4 w-4 md:h-5 md:w-5 text-red-400"/>}
                          </Button>
                      )}
                      <Button variant="destructive" size="sm" onClick={handleCompleteInterview} className="px-2 py-1 md:px-3 md:py-2 text-xs md:text-sm h-8 md:h-9"><VideoOff className="mr-0.5 md:mr-1 h-4 w-4 md:h-5 md:w-5" /> <span className="hidden md:inline">End & Report</span><span className="md:hidden">End</span></Button>
                    </div>
                </div>

                {/* Right Sidebar: Question, Answer, Feedback */}
                <Card className={cn("lg:col-span-1 flex flex-col shadow-xl", isInterviewFullScreen && "h-full")}>
                    <CardHeader className="pb-1 md:pb-2 pt-2 px-2 md:pt-3 md:px-3">
                        <div className="flex justify-between items-center">
                            <CardTitle className="text-sm md:text-md font-medium">Question {currentQuestionIndex + 1}/{session.questions.length}</CardTitle>
                            {session.timerPerQuestion && session.timerPerQuestion > 0 && <Label className="text-sm font-medium text-primary">{formatTime(timeLeft)}</Label>}
                        </div>
                        <Progress value={((currentQuestionIndex + 1) / session.questions.length) * 100} className="w-full h-1 md:h-1.5 mt-1 [&>div]:bg-primary" />
                    </CardHeader>
                    <ScrollArea className={cn("flex-grow", isInterviewFullScreen ? "max-h-[calc(100%-150px)]" : "max-h-[400px] md:max-h-[500px]")}>
                    <CardContent className="space-y-2 md:space-y-3 pt-1 md:pt-2 px-2 md:px-3">
                        <div className="p-2 md:p-3 border rounded-md bg-secondary/40">
                          <p className="text-sm md:text-md font-semibold text-foreground whitespace-pre-line">{currentQuestion.questionText}</p>
                          <p className="text-xs text-muted-foreground mt-0.5 md:mt-1">Category: {currentQuestion.category} | Difficulty: {currentQuestion.difficulty}</p>
                        </div>
                        {!currentAnswerFeedback ? (
                        <>
                            <div>
                              <Label htmlFor="userAnswerAIM" className="text-xs md:text-sm">Your Answer:</Label>
                              <Textarea id="userAnswerAIM" value={userAnswer} onChange={(e) => setUserAnswer(e.target.value)} placeholder={isSpeechRecording ? "Listening..." : "Type or record your answer..."} rows={4} disabled={isEvaluatingAnswer || isSpeechRecording} className="mt-1 text-sm"/>
                            </div>
                            <div className="flex gap-1 md:gap-2">
                              <Button onClick={toggleSpeechRecording} disabled={!speechApiSupported || isEvaluatingAnswer || (timeLeft === 0 && !!session.timerPerQuestion)} variant={isSpeechRecording ? "secondary" : "outline"} className="flex-1 text-xs h-8 md:h-9">
                                  {isSpeechRecording ? <Square className="mr-1 h-3.5 w-3.5 md:h-4 md:w-4 animate-ping"/> : <Mic className="mr-1 h-3.5 w-3.5 md:h-4 md:w-4"/>} {isSpeechRecording ? 'Stop' : 'Record'}
                              </Button>
                              <Button onClick={handleAnswerSubmit} disabled={!userAnswer.trim() || isEvaluatingAnswer} className="flex-1 bg-primary hover:bg-primary/90 text-xs h-8 md:h-9">
                                  {isEvaluatingAnswer ? <Loader2 className="mr-1 h-3.5 w-3.5 md:h-4 md:w-4 animate-spin"/> : <Send className="mr-1 h-3.5 w-3.5 md:h-4 md:w-4"/>} Submit
                              </Button>
                            </div>
                        </>
                        ) : (
                        <Card className="bg-primary/5 border-primary/20 p-2 md:p-3 space-y-1 md:space-y-2">
                            <h4 className="font-semibold text-primary text-xs md:text-sm">Feedback on Your Answer:</h4>
                            <p className="text-xs text-muted-foreground">Score: <span className="font-bold text-primary">{currentAnswerFeedback.aiScore}/100</span></p>
                            <ScrollArea className="h-[80px] md:h-[100px]"><p className="text-xs text-muted-foreground whitespace-pre-line">{currentAnswerFeedback.aiFeedback}</p></ScrollArea>
                            {currentAnswerFeedback.strengths && currentAnswerFeedback.strengths.length > 0 && <p className="text-xs"><strong className="text-green-600">Strengths:</strong> {currentAnswerFeedback.strengths.join(', ')}</p>}
                            {currentAnswerFeedback.areasForImprovement && currentAnswerFeedback.areasForImprovement.length > 0 && <p className="text-xs"><strong className="text-yellow-600">Areas for Improvement:</strong> {currentAnswerFeedback.areasForImprovement.join(', ')}</p>}
                            <Button onClick={handleNextQuestion} className="w-full mt-1 md:mt-2 text-xs h-8 md:h-9" size="sm">
                                {currentQuestionIndex < session.questions.length - 1 ? "Next Question" : "View Overall Report"}
                            </Button>
                        </Card>
                        )}
                        {timeLeft === 0 && session.timerPerQuestion && session.timerPerQuestion > 0 && !isEvaluatingAnswer && !currentAnswerFeedback && (
                            <Alert variant="destructive" className="text-xs p-2"><AlertTriangle className="h-3 w-3 md:h-4 md:w-4" /> <AlertDescription>Time's up! Please submit.</AlertDescription></Alert>
                        )}
                    </CardContent>
                    </ScrollArea>
                </Card>
            </div>
          )}
      </div>
    </div>
  );
}

