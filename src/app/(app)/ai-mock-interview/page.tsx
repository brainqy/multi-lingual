
"use client";

import type React from 'react';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Loader2, Bot, Maximize, Minimize, Settings2, Mic, Square, Video as VideoIcon, VideoOff, Send, MessageSquare, ListChecks, RefreshCw, Share2, AlertTriangle, CheckSquare as CheckSquareIcon, Bookmark, Radio, Download } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import type {
  MockInterviewStepId,
  MockInterviewSession,
  MockInterviewQuestion,
  GenerateOverallInterviewFeedbackOutput,
  MockInterviewAnswer,
  RecordingReference,
  InterviewQuestionCategory
} from '@/types';
import { MOCK_INTERVIEW_STEPS } from '@/types';
import AiMockInterviewStepper from '@/components/features/ai-mock-interview/AiMockInterviewStepper';
import StepSetup from '@/components/features/ai-mock-interview/StepSetup';
import StepInterview from '@/components/features/ai-mock-interview/StepInterview';
import StepFeedback from '@/components/features/ai-mock-interview/StepFeedback';
import { generateMockInterviewQuestions, type GenerateMockInterviewQuestionsInput } from '@/ai/flows/generate-mock-interview-questions';
import { evaluateInterviewAnswer, type EvaluateInterviewAnswerInput } from '@/ai/flows/evaluate-interview-answer';
import { generateOverallInterviewFeedback, type GenerateOverallInterviewFeedbackInput } from '@/ai/flows/generate-overall-interview-feedback';
import { cn } from '@/lib/utils';
import { useSearchParams, useRouter } from 'next/navigation';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useI18n } from '@/hooks/use-i18n';
import { useAuth } from '@/hooks/use-auth';
import { useSettings } from '@/contexts/settings-provider';
import { updateMockInterviewSession } from '@/lib/actions/interviews';


declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

const logger = {
  info: (message: string, ...args: any[]) => console.log(`[AIMockInterviewPage INFO] ${message}`, ...args),
  warn: (message: string, ...args: any[]) => console.warn(`[AIMockInterviewPage WARN] ${message}`, ...args),
  error: (message: string, ...args: any[]) => console.error(`[AIMockInterviewPage ERROR] ${message}`, ...args),
  debug: (message: string, ...args: any[]) => console.debug(`[AIMockInterviewPage DEBUG] ${message}`, ...args),
};

const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
};


export default function AiMockInterviewPage() {
  const { t } = useI18n();
  const [currentUiStepId, setCurrentUiStepId] = useState<MockInterviewStepId>('setup');
  const [session, setSession] = useState<MockInterviewSession | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isEvaluatingAnswer, setIsEvaluatingAnswer] = useState(false);
  const [userAnswer, setUserAnswer] = useState('');
  const [currentAnswerFeedback, setCurrentAnswerFeedback] = useState<MockInterviewAnswer | null>(null);

  const { toast } = useToast();
  const { user: currentUser, isLoading: isUserLoading } = useAuth();
  const { settings } = useSettings();
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
      toast({ title: t("aiMockInterview.toast.speechError.title"), description: t("aiMockInterview.toast.speechError.description", { error: event.error }), variant: "destructive" });
      setIsSpeechRecording(false);
    };
    recognitionRef.current.onend = () => {
      // setIsSpeechRecording(false); // Often, you want to keep it active if stop wasn't explicit
    };
  }, [toast, t]);

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

  const startVideoStream = useCallback(async () => {
    logger.info("Attempting to start video stream...");
    if (!navigator.mediaDevices?.getUserMedia) {
      setHasCameraPermission(false);
      setIsVideoActive(false);
      toast({ title: t("aiMockInterview.toast.cameraError.title"), description: t("aiMockInterview.toast.cameraError.description"), variant: "destructive" });
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
      toast({ title: t("aiMockInterview.toast.cameraDenied.title"), description: t("aiMockInterview.toast.cameraDenied.description"), variant: "destructive" });
      return null;
    }
  }, [isMicMuted, toast, cameraStream, t]);

  const handleSetupComplete = useCallback(async (config: GenerateMockInterviewQuestionsInput, sessionId: string) => {
    if (!currentUser || !settings) return;
    setIsLoading(true);
    setCurrentAnswerFeedback(null);
    try {
      logger.info("Requesting interview questions with config:", config);
      
      const apiKey = settings.allowUserApiKey ? currentUser.userApiKey : undefined;
      const { questions: genQuestions } = await generateMockInterviewQuestions({...config, apiKey});

      logger.info("Received questions from AI:", genQuestions);

      if (!genQuestions || genQuestions.length === 0) {
        toast({ title: t("aiMockInterview.toast.setupFailed.title"), description: t("aiMockInterview.toast.setupFailed.description"), variant: "destructive", duration: 7000 });
        setIsLoading(false);
        setCurrentUiStepId('setup');
        router.replace('/ai-mock-interview', undefined);
        return;
      }
      
      await updateMockInterviewSession(sessionId, { questions: genQuestions });

      const difficultyMap = { easy: "Easy", medium: "Medium", hard: "Hard" } as const;
      const newSession: MockInterviewSession = {
        id: sessionId,
        userId: currentUser.id,
        topic: config.topic,
        jobDescription: config.jobDescriptionText,
        questions: genQuestions,
        answers: [],
        status: 'in-progress',
        createdAt: new Date().toISOString(),
        timerPerQuestion: config.timerPerQuestion,
        difficulty: config.difficulty ? difficultyMap[config.difficulty] : undefined,
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
      toast({ title: t("aiMockInterview.toast.interviewReady.title"), description: t("aiMockInterview.toast.interviewReady.description", { count: genQuestions.length }) });
      await startVideoStream();

    } catch (error: any) {
      logger.error("Error during setup or question generation:", error);
      const errorMessage = (error.message || String(error)).toLowerCase();
      if (errorMessage.includes('quota') || errorMessage.includes('billing')) {
          toast({
              title: t("aiMockInterview.toast.apiQuotaError.title"),
              description: t("aiMockInterview.toast.apiQuotaError.description"),
              variant: "destructive",
              duration: 9000,
          });
      } else {
        toast({ title: t("aiMockInterview.toast.setupFailed.title"), description: error.message || "Could not generate interview questions.", variant: "destructive" });
      }
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, settings, toast, t, router, startVideoStream]);


  // Initialize based on query params & cleanup
  useEffect(() => {
    const sourceSessionId = searchParams.get('sourceSessionId');
    const topicFromUrl = searchParams.get('topic');
    logger.info("AI Mock Interview Page loaded. Topic from URL:", topicFromUrl, "Source Session ID:", sourceSessionId);

    if (topicFromUrl && !session && currentUser && sourceSessionId) {
      const initialConfig: GenerateMockInterviewQuestionsInput = {
        topic: topicFromUrl,
        jobDescriptionText: searchParams.get('jobDescriptionText') || undefined,
        numQuestions: parseInt(searchParams.get('numQuestions') || '5', 10),
        difficulty: (searchParams.get('difficulty') as GenerateMockInterviewQuestionsInput['difficulty']) || 'medium',
        timerPerQuestion: parseInt(searchParams.get('timerPerQuestion') || '0', 10) || undefined,
        questionCategories: searchParams.get('categories')?.split(',') as InterviewQuestionCategory[] | undefined,
      };
      logger.info("Initial config from URL params:", initialConfig);
      handleSetupComplete(initialConfig, sourceSessionId);
      
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
  }, [searchParams, session, currentUser, handleSetupComplete, stopAllMediaStreams]);

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
        toast({ title: t("aiMockInterview.toast.fullscreenError.title"), description: t("aiMockInterview.toast.fullscreenError.description", { message: (err as Error).message }), variant: "destructive" });
        logger.error("Fullscreen request error:", err);
      }
    } else {
      try {
        await document.exitFullscreen();
        logger.info("Exited fullscreen.");
      } catch (err) {
         toast({ title: t("aiMockInterview.toast.fullscreenError.title"), description: t("aiMockInterview.toast.fullscreenError.description", { message: (err as Error).message }), variant: "destructive" });
         logger.error("Exit fullscreen error:", err);
      }
    }
  }, [toast, t]);

  // Timer logic
  useEffect(() => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    if (currentQuestion && session?.timerPerQuestion && session.timerPerQuestion > 0 && timeLeft > 0 && !isEvaluatingAnswer && currentUiStepId === 'interview') {
      timerIntervalRef.current = setInterval(() => {
        setTimeLeft(prevTime => {
          if (prevTime <= 1) {
            clearInterval(timerIntervalRef.current!);
            toast({ title: t("aiMockInterview.toast.timesUp.title"), description: t("aiMockInterview.toast.timesUp.description"), variant: "default" });
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }
    return () => { if (timerIntervalRef.current) clearInterval(timerIntervalRef.current); };
  }, [timeLeft, session?.timerPerQuestion, isEvaluatingAnswer, currentUiStepId, currentQuestion, toast, t]);

  const handleAnswerSubmit = async () => {
    if (!session || !currentQuestion || !userAnswer.trim() || isEvaluatingAnswer || !settings || !currentUser) return;

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
        jobDescriptionText: session.jobDescription,
        apiKey: settings.allowUserApiKey ? currentUser.userApiKey : undefined,
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
      const errorMessage = (error.message || String(error)).toLowerCase();
      if (errorMessage.includes('quota') || errorMessage.includes('billing')) {
          toast({
              title: t("aiMockInterview.toast.apiQuotaError.title"),
              description: t("aiMockInterview.toast.apiQuotaError.description"),
              variant: "destructive",
              duration: 9000,
          });
      } else {
        toast({ title: t("aiMockInterview.toast.evaluationFailed.title"), description: error.message || "Could not evaluate your answer.", variant: "destructive" });
      }
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
    if (!session || !session.answers || !settings || !currentUser) {
      toast({ title: t("aiMockInterview.toast.sessionIssue.title"), description: t("aiMockInterview.toast.sessionIssue.description"), variant: "destructive" });
      setCurrentUiStepId('setup');
      router.replace('/ai-mock-interview', undefined);
      return;
    }
     if (session.answers.length === 0 && session.questions.length > 0) {
      toast({ title: t("aiMockInterview.toast.noAnswers.title"), description: t("aiMockInterview.toast.noAnswers.description"), variant: "default" });
      return;
    }

    setIsLoading(true);
    try {
       const feedbackInput: GenerateOverallInterviewFeedbackInput = {
        topic: session.topic,
        jobDescriptionText: session.jobDescription,
        evaluatedAnswers: session.answers.map(a => ({
            questionText: a.questionText,
            userAnswer: a.userAnswer,
            feedback: a.aiFeedback || "N/A",
            score: a.aiScore || 0,
        })),
        apiKey: settings.allowUserApiKey ? currentUser.userApiKey : undefined,
      };
      const overallFeedbackResult = await generateOverallInterviewFeedback(feedbackInput);
      
      const finalSessionData: Partial<MockInterviewSession> = {
        answers: session.answers,
        overallFeedback: overallFeedbackResult,
        overallScore: overallFeedbackResult.overallScore,
        status: 'completed',
        recordingReferences: localRecordingReferences,
      };

      await updateMockInterviewSession(session.id, finalSessionData);

      setSession(prevSession => prevSession ? ({
        ...prevSession,
        ...finalSessionData,
      }) : null);
      
      setCurrentUiStepId('feedback');
      toast({ title: t("aiMockInterview.toast.interviewComplete.title"), description: t("aiMockInterview.toast.interviewComplete.description") });
      if (isInterviewFullScreen && document.fullscreenElement) {
        document.exitFullscreen();
      }
      stopAllMediaStreams();
    } catch (error: any) {
        logger.error("Error generating overall feedback:", error);
        const errorMessage = (error.message || String(error)).toLowerCase();
        if (errorMessage.includes('quota') || errorMessage.includes('billing')) {
            toast({
                title: t("aiMockInterview.toast.apiQuotaError.title"),
                description: t("aiMockInterview.toast.apiQuotaError.description"),
                variant: "destructive",
                duration: 9000,
            });
        } else {
          toast({ title: t("aiMockInterview.toast.feedbackFailed.title"), description: error.message || "Could not generate overall interview feedback.", variant: "destructive" });
        }
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
    toast({ title: newMutedState ? t("aiMockInterview.toast.micMuted.title") : t("aiMockInterview.toast.micUnmuted.title"), duration: 1500 });
  };

  const toggleSpeechRecording = () => {
    if (!speechApiSupported) {
      toast({ title: t("aiMockInterview.toast.notSupported.title"), description: t("aiMockInterview.toast.notSupported.description"), variant: "destructive" });
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
        toast({ title: t("aiMockInterview.toast.recordingNotSupported.title"), description: t("aiMockInterview.toast.recordingNotSupported.description"), variant: "destructive" });
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
                 toast({ title: t("aiMockInterview.toast.micError.title"), description: t("aiMockInterview.toast.micError.description"), variant: "destructive"});
                 return;
            }
        } else {
            toast({ title: t("aiMockInterview.toast.noAudioInput.title"), description: t("aiMockInterview.toast.noAudioInput.description"), variant: "default" });
            return;
        }

        if (!streamToRecord || streamToRecord.getAudioTracks().length === 0) {
            toast({ title: t("aiMockInterview.toast.recordingError.title"), description: t("aiMockInterview.toast.recordingError.description"), variant: "destructive"});
            return;
        }

        try {
            const options = { mimeType: MediaRecorder.isTypeSupported('audio/webm; codecs=opus') ? 'audio/webm; codecs=opus' : 'audio/webm' };
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
                toast({ title: t("aiMockInterview.toast.recordingStopped.title"), description: t("aiMockInterview.toast.recordingStopped.description"), duration: 5000 });
                setIsSessionAudioRecording(false); 
            };
            mediaRecorderRef.current.start();
            setIsSessionAudioRecording(true);
            toast({ title: t("aiMockInterview.toast.recordingStarted.title") });
        } catch (err) {
            logger.error("MediaRecorder init error for audio:", err);
            toast({ title: t("aiMockInterview.toast.recordingInitError.title"), description: t("aiMockInterview.toast.recordingInitError.description"), variant: "destructive" });
            setIsSessionAudioRecording(false);
        }
    }
  };

  if (isUserLoading || !currentUser) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div ref={interviewContainerRef} className={cn("max-w-7xl mx-auto space-y-2 md:space-y-4", isInterviewFullScreen && currentUiStepId === 'interview' && "fixed inset-0 z-50 bg-background p-1 md:p-2")}>
      <Card className={cn("shadow-xl bg-card", isInterviewFullScreen && currentUiStepId === 'interview' && "h-full flex flex-col")}>
        <CardHeader className="flex flex-row justify-between items-center py-2 px-2 md:py-3 md:px-4">
          <div className="flex-1 flex items-center gap-2">
            <Bot className="h-5 w-5 md:h-6 md:w-6 text-primary" />
            <CardTitle className="text-md md:text-xl font-bold tracking-tight text-foreground">{t("aiMockInterview.title")}</CardTitle>
            {!(currentUiStepId === 'interview' && isInterviewFullScreen) && <AiMockInterviewStepper currentStep={currentUiStepId} />}
          </div>
          <div className="flex items-center gap-1 md:gap-2">
             {currentUiStepId === 'interview' && (
                <Button onClick={toggleInterviewFullScreen} variant="ghost" size="icon" title={isInterviewFullScreen ? t("aiMockInterview.exitFullscreen") : t("aiMockInterview.enterFullscreen")} className="h-7 w-7 md:h-8 md:w-8">
                    {isInterviewFullScreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
                </Button>
            )}
            {currentUiStepId !== 'setup' && (
                <Button onClick={handleRestartInterview} variant="outline" size="sm" className="text-xs h-7 md:h-8 px-2"><RefreshCw className="mr-1 h-3 w-3"/>{t("aiMockInterview.restart")}</Button>
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
          {currentUiStepId === 'setup' && <Card className="shadow-lg" data-testid="mock-interview-setup-form"><CardContent className="p-3 md:p-4 lg:p-6"><StepSetup onSetupComplete={(config) => {
            const tempSessionId = `session-ai-${Date.now()}`; 
            handleSetupComplete(config, tempSessionId);
          }} isLoading={isLoading} /></CardContent></Card>}
          
          {currentUiStepId === 'feedback' && session && <StepFeedback session={session} onRestart={handleRestartInterview} />}
          
          {currentUiStepId === 'interview' && session && (
            <div data-testid="mock-interview-interface">
              <StepInterview
                questions={session.questions}
                currentQuestionIndex={currentQuestionIndex}
                onAnswerSubmit={handleAnswerSubmit}
                onCompleteInterview={handleCompleteInterview}
                isEvaluating={isEvaluatingAnswer}
                timerPerQuestion={session.timerPerQuestion}
              />
            </div>
          )}

          {isLoading && currentUiStepId !== 'interview' && (
              <div className="flex flex-col items-center justify-center h-64">
              <Loader2 className="h-10 w-10 md:h-12 md:w-12 animate-spin text-primary" />
              <p className="mt-2 md:mt-3 text-muted-foreground">{t("aiMockInterview.loadingMessage")}</p>
              </div>
          )}
      </div>
    </div>
  );
}

    