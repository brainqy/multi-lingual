
"use client";
import { useI18n } from "@/hooks/use-i18n";
import type React from 'react';
import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Mic, Video as VideoIcon, ScreenShare, PhoneOff, Send, Bot, ListChecks, Loader2, AlertTriangle, ThumbsUp, ChevronDown, Square, Play, Download as DownloadIcon, VideoOff, MessageSquare as ChatIcon, Users as ParticipantsIcon, HelpCircle, Maximize, Minimize, Radio, CheckSquare as CheckSquareIcon, RotateCcw, Star, ThumbsDown, Save, Mail as MailIcon } from 'lucide-react';
import type { LiveInterviewSession, LiveInterviewParticipant, RecordingReference, MockInterviewQuestion, InterviewerScore } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { format } from 'date-fns';
import { useAuth } from "@/hooks/use-auth";
import { getLiveInterviewSessionById, updateLiveInterviewSession } from "@/lib/actions/live-interviews";

const logger = {
  debug: (message: string, ...args: any[]) => console.debug(`[LiveInterviewPage] ${message}`, ...args),
  info: (message: string, ...args: any[]) => console.info(`[LiveInterviewPage] ${message}`, ...args),
  warn: (message: string, ...args: any[]) => console.warn(`[LiveInterviewPage] ${message}`, ...args),
  error: (message: string, ...args: any[]) => console.error(`[LiveInterviewPage] ${message}`, ...args),
};

const CORRECTNESS_PERCENTAGES: Array<InterviewerScore['correctnessPercentage']> = [0, 25, 50, 75, 100];


export default function LiveInterviewClientView() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const sessionId = params.sessionId as string;

  const [sessionDetails, setSessionDetails] = useState<LiveInterviewSession | null | undefined>(undefined);
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isVideoActive, setIsVideoActive] = useState(false);
  const [activeStreamType, setActiveStreamType] = useState<'camera' | 'screen' | 'none'>('none');

  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);

  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [hasScreenPermission, setHasScreenPermission] = useState<boolean | null>(null);

  const mainVideoRef = useRef<HTMLVideoElement>(null);
  const selfVideoRef = useRef<HTMLVideoElement>(null);
  const liveInterviewContainerRef = useRef<HTMLDivElement>(null);

  const [chatMessages, setChatMessages] = useState<{ user: string, text: string, id: string }[]>([]);
  const [chatInput, setChatInput] = useState('');

  const [askedQuestions, setAskedQuestions] = useState<Set<string>>(new Set());
  const [currentQuestionScores, setCurrentQuestionScores] = useState<Record<string, InterviewerScore>>({});
  const [overallReportNotes, setOverallReportNotes] = useState('');
  const [showReportView, setShowReportView] = useState(false);
  const [reportRecipientEmails, setReportRecipientEmails] = useState('');


  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [browserSupportsRecording, setBrowserSupportsRecording] = useState(true);
  const [localRecordingReferences, setLocalRecordingReferences] = useState<RecordingReference[]>([]);
  const [openAccordionItems, setOpenAccordionItems] = useState<string[]>([]);
  const [isFullScreen, setIsFullScreen] = useState(false);


  const { user: currentUser } = useAuth();

  const isInterviewer = useMemo(() => {
    if (!sessionDetails || !currentUser) return false;
    const participant = sessionDetails.participants.find(p => p.userId === currentUser.id);
    return participant?.role === 'interviewer';
  }, [sessionDetails, currentUser]);


  useEffect(() => {
    logger.info("[LiveInterviewPage] useEffect for session loading, sessionId:", sessionId);
    async function loadSession() {
      if (sessionId) {
        const foundSession = await getLiveInterviewSessionById(sessionId);
        if (foundSession) {
          setSessionDetails(foundSession);
          setLocalRecordingReferences(foundSession.recordingReferences || []);
          if(foundSession.interviewerScores) {
              const initialScores: Record<string, InterviewerScore> = {};
              foundSession.interviewerScores.forEach(score => {
                  initialScores[score.questionId] = score;
              });
              setCurrentQuestionScores(initialScores);
          }
          logger.info("[LiveInterviewPage] Session details loaded:", foundSession.title);
          setIsLoadingSession(false);
        } else {
          setSessionDetails(null); // Explicitly set to null if not found
          logger.warn("[LiveInterviewPage] Session not found with ID:", sessionId);
          toast({
            title: "Session Not Found",
            description: `Could not find an interview session with ID: ${sessionId}`,
            variant: "destructive",
          });
          router.push('/interview-prep');
        }
      } else {
        setSessionDetails(null);
        setIsLoadingSession(false);
        logger.warn("[LiveInterviewPage] No session ID provided.");
        toast({ title: "Invalid Session", description: "No session ID provided.", variant: "destructive"});
        router.push('/interview-prep');
      }
    }
    loadSession();
  }, [sessionId, toast, router]);

  useEffect(() => {
    const requestFs = async () => {
        if (liveInterviewContainerRef.current && !document.fullscreenElement) {
            try {
                await liveInterviewContainerRef.current.requestFullscreen();
            } catch (err) {
                console.warn("Auto-fullscreen for live interview failed:", err);
            }
        }
    };
    if (!isLoadingSession && sessionDetails) { 
        requestFs();
    }
  }, [isLoadingSession, sessionDetails]); 

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);


 useEffect(() => {
    if (isInterviewer && sessionDetails?.preSelectedQuestions && sessionDetails.preSelectedQuestions.length > 0) {
      setOpenAccordionItems(['interview-questions', 'chat', 'participants']);
    } else if (isInterviewer) {
      setOpenAccordionItems(['chat', 'participants']); 
    } else { 
      setOpenAccordionItems(['chat', 'participants']);
    }
  }, [isInterviewer, sessionDetails]);


  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000); // Update every minute for display
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && (!navigator.mediaDevices?.getUserMedia || !navigator.mediaDevices?.getDisplayMedia)) {
      setBrowserSupportsRecording(false);
      toast({ title: "Media Not Fully Supported", description: "Your browser may not support all media features (camera/screen sharing/recording).", variant: "default", duration: 7000 });
    }
  }, [toast]);

  const stopStreamTracks = useCallback((stream: MediaStream | null) => {
    if (stream) {
      stream.getTracks().forEach(track => {
        track.stop();
        logger.debug("Track stopped:", track.kind, track.label);
      });
    }
  }, []);

  const startCameraStream = useCallback(async () => {
    logger.debug("Attempting to start camera stream...");
    if (!navigator.mediaDevices?.getUserMedia) {
      setHasCameraPermission(false);
      setIsVideoActive(false);
      toast({ title: "Camera Error", description: "Camera access not supported by your browser.", variant: "destructive" });
      return null;
    }
    try {
      if (cameraStream) { 
        stopStreamTracks(cameraStream);
      }
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: !isMicMuted });
      setCameraStream(stream);
      setHasCameraPermission(true);
      setIsVideoActive(true);
      logger.info("Camera stream started and set to state:", stream.id);
      return stream;
    } catch (err) {
      console.error("Error accessing camera:", err);
      setHasCameraPermission(false);
      setIsVideoActive(false);
      toast({ title: "Camera Access Denied", description: "Please enable camera permissions in your browser settings.", variant: "destructive" });
      return null;
    }
  }, [isMicMuted, toast, cameraStream, stopStreamTracks]);

  const stopCameraStream = useCallback(() => {
    logger.debug("Attempting to stop camera stream.");
    if (cameraStream) {
      stopStreamTracks(cameraStream);
      setCameraStream(null);
    }
    setIsVideoActive(false);
    logger.debug("Camera stream stopped and isVideoActive set to false.");
  }, [cameraStream, stopStreamTracks]);

  const stopScreenShareStream = useCallback(() => {
    logger.debug(`Attempting to stop screen share.`);
    if (screenStream) {
      stopStreamTracks(screenStream);
      setScreenStream(null);
    }
    setActiveStreamType(isVideoActive && cameraStream ? 'camera' : 'none');
    logger.info("Screen share stopped. Active stream type set.");
  }, [screenStream, stopStreamTracks, isVideoActive, cameraStream]);


  const startScreenShareStream = useCallback(async () => {
    logger.debug("Attempting to start screen share stream...");
    if (!navigator.mediaDevices?.getDisplayMedia) {
      setHasScreenPermission(false);
      toast({ title: "Screen Share Error", description: "Screen sharing not supported by your browser.", variant: "destructive" });
      return null;
    }
    try {
      if (screenStream) {
        stopStreamTracks(screenStream);
      }
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { cursor: "always" } as any, 
        audio: false 
      });

      stream.getVideoTracks()[0].onended = () => {
        logger.info("Screen share ended by browser control or track ending.");
        stopScreenShareStream();
      };
      setScreenStream(stream);
      setHasScreenPermission(true);
      logger.info("Screen share stream started and set to state:", stream.id);
      return stream;
    } catch (err) {
      console.error("Error starting screen share:", err);
      setHasScreenPermission(false);
      const error = err as Error;
      if (error.name === 'NotAllowedError' || error.message.includes('permission') || error.message.includes('disallowed')) {
        toast({ title: "Screen Share Denied", description: `Screen sharing permission was denied or is disallowed by browser/system policy. If in an iframe (e.g., IDE preview), it might need 'allow="display-capture"'. Check browser settings or site/Permissions Policy.`, variant: "destructive", duration: 10000 });
      } else {
        toast({ title: "Screen Share Failed", description: "Could not start screen sharing. Ensure permission is granted.", variant: "destructive" });
      }
      return null;
    }
  }, [toast, screenStream, stopStreamTracks, stopScreenShareStream]);


  useEffect(() => {
    const videoEl = selfVideoRef.current;
    if (!videoEl) return;

    let newStream: MediaStream | null = null;
    if(isVideoActive && cameraStream) {
        newStream = cameraStream;
    }
    
    if (videoEl.srcObject !== newStream) {
        videoEl.srcObject = newStream;
        if(newStream) logger.debug("Self view assigned stream:", newStream.id);
        else logger.debug("Self view cleared.");
    }
  }, [isVideoActive, cameraStream]);

  useEffect(() => {
    const videoEl = mainVideoRef.current;
    if (!videoEl) return;

    let newStream: MediaStream | null = null;
    let newMutedState = true;

    if (activeStreamType === 'screen' && screenStream) {
      newStream = screenStream;
      newMutedState = true; 
      logger.debug("Main view: Attempting to show screen stream:", screenStream.id);
    } else if (activeStreamType === 'camera' && cameraStream && isVideoActive) {
      newStream = cameraStream; // Mock: Show self in main if camera is the active type for "other participant"
      newMutedState = false; // Unmute if showing "other participant"
      logger.debug("Main view: Attempting to show camera stream (mock other participant):", cameraStream.id);
    } else {
      logger.debug("Main view: No active stream to show, or local camera is off.");
    }

    if (videoEl.srcObject !== newStream) {
      videoEl.srcObject = newStream;
      logger.info("Main view srcObject updated. New stream ID (if any):", newStream?.id);
    }
    if (videoEl.muted !== newMutedState) {
      videoEl.muted = newMutedState;
      logger.info("Main view muted state updated to:", newMutedState);
    }
  }, [activeStreamType, cameraStream, screenStream, isVideoActive]);


  const handleToggleVideo = async () => {
    if (isVideoActive) {
      stopCameraStream(); 
      if (activeStreamType === 'camera') { // If camera was the main view, switch to none
          setActiveStreamType('none');
      }
    } else {
      const stream = await startCameraStream(); 
      if (stream) {
        // If screen share is not active, make camera the active main view
        if (activeStreamType !== 'screen') { 
          setActiveStreamType('camera');
        }
      }
    }
  };

  const handleToggleScreenShare = async () => {
    if (activeStreamType === 'screen') {
      stopScreenShareStream(); // This will also attempt to revert to camera if it was active
    } else {
      const stream = await startScreenShareStream();
      if (stream) {
        setActiveStreamType('screen');
      }
    }
  };


  const handleToggleMic = () => {
    const newMutedState = !isMicMuted;
    setIsMicMuted(newMutedState);
    if (cameraStream) {
      cameraStream.getAudioTracks().forEach(track => track.enabled = !newMutedState);
      logger.debug(`Mic toggled. New state: ${newMutedState ? "Muted" : "Unmuted"}. Audio tracks in cameraStream enabled: ${!newMutedState}`);
    }
    toast({ title: newMutedState ? "Mic Muted" : "Mic Unmuted", duration: 1500 });
  };


  const handleEndCallAndGenerateReport = async () => {
    if (isRecording) stopRecording();
    stopCameraStream();
    stopScreenShareStream();
    setActiveStreamType('none');
    
    if (!sessionDetails || !sessionDetails.preSelectedQuestions) {
      toast({ title: "Error", description: "Session details or questions missing for report.", variant: "destructive"});
      router.push('/interview-prep');
      return;
    }

    let achievedScore = 0;
    let totalPossibleScore = 0;

    sessionDetails.preSelectedQuestions.forEach(q => {
      const questionBaseScore = q.baseScore || 0;
      totalPossibleScore += questionBaseScore;
      const scoreData = currentQuestionScores[q.id];
      if (scoreData) {
        achievedScore += questionBaseScore * (scoreData.correctnessPercentage / 100);
      }
    });
    
    const percentage = totalPossibleScore > 0 ? (achievedScore / totalPossibleScore) * 100 : 0;
    
    const finalScoreData = {
        achievedScore: parseFloat(achievedScore.toFixed(2)),
        totalPossibleScore,
        percentage: parseFloat(percentage.toFixed(2)),
        reportNotes: overallReportNotes 
    };

    const updatedSession = await updateLiveInterviewSession(sessionId, {
        interviewerScores: Object.values(currentQuestionScores),
        finalScore: finalScoreData,
        status: 'Completed'
    });

    if (updatedSession) {
        setSessionDetails(updatedSession);
    }
    
    setShowReportView(true); 
    toast({ title: "Interview Ended", description: "Report generated. Please review and send." });
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }
  };

  const handleSendReport = async () => {
    if (!sessionDetails || !sessionDetails.finalScore) {
      toast({ title: "Error", description: "No report generated to send.", variant: "destructive" });
      return;
    }
     const emails = reportRecipientEmails.split(',').map(e => e.trim()).filter(e => e);
    if (isInterviewer && emails.length === 0) {
      toast({ title: "No Recipients", description: "Please enter email addresses to send the report.", variant: "default" });
      return;
    }

    const updatedFinalScore = {...sessionDetails.finalScore, reportNotes: overallReportNotes};
    
    await updateLiveInterviewSession(sessionId, { finalScore: updatedFinalScore });

    logger.info(`Mock Send Report: For session "${sessionDetails?.title}". To: ${emails.join(', ') || 'Candidate Only'}. Report Notes: ${overallReportNotes}`);
    toast({ title: "Report Sent (Mock)", description: `Report for ${sessionDetails?.title} would be sent to: ${emails.join(', ') || 'participants'}.`});
    setReportRecipientEmails('');
    router.push('/interview-prep');
  };

  const handleSendChatMessage = () => {
    if (chatInput.trim() && sessionDetails && currentUser) {
      const newMsg = { user: currentUser.name, text: chatInput.trim(), id: Date.now().toString() };
      setChatMessages(prev => [...prev, newMsg]);
      logger.debug("Chat message sent (local):", newMsg);
      setChatInput('');
    }
  };

  const markQuestionAsAsked = (questionId: string) => {
    setAskedQuestions(prev => new Set(prev).add(questionId));
    toast({title: "Question Marked as Asked", duration: 2000})
    logger.debug("Question marked as asked:", questionId);
  };

  const resetAskedQuestions = () => {
    setAskedQuestions(new Set());
    toast({title: "Asked Questions Reset", duration: 2000});
    logger.debug("Asked questions list reset.");
  };

  const handleScoreChange = (questionId: string, percentage: InterviewerScore['correctnessPercentage']) => {
    setCurrentQuestionScores(prev => ({
      ...prev,
      [questionId]: { ...prev[questionId], questionId, correctnessPercentage: percentage }
    }));
  };

  const handleNotesChange = (questionId: string, notes: string) => {
     setCurrentQuestionScores(prev => ({
      ...prev,
      [questionId]: { ...prev[questionId], questionId, notes }
    }));
  };


  const startRecording = async () => {
    if (!browserSupportsRecording || isRecording) return;

    let streamToRecord: MediaStream | null = null;
    let recordingType: 'video' | 'audio' = 'audio';

    if (activeStreamType === 'screen' && screenStream && screenStream.getVideoTracks().length > 0) {
        const videoTracks = screenStream.getVideoTracks();
        const audioTracks = (cameraStream && !isMicMuted) ? cameraStream.getAudioTracks() : [];
        streamToRecord = new MediaStream([...videoTracks, ...audioTracks]);
        recordingType = 'video';
        logger.info("Recording: Screen video + mic audio (if available & unmuted)");
    } else if (isVideoActive && cameraStream) {
        const videoTracks = cameraStream.getVideoTracks();
        const audioTracks = !isMicMuted ? cameraStream.getAudioTracks() : [];
        streamToRecord = new MediaStream([...videoTracks, ...audioTracks]);
        recordingType = videoTracks.length > 0 ? 'video' : 'audio';
        logger.info(`Recording: Camera ${videoTracks.length > 0 ? 'video' : 'no video'} + mic audio (if available & unmuted)`);
    } else if (cameraStream && cameraStream.getAudioTracks().length > 0 && !isMicMuted) {
        streamToRecord = new MediaStream(cameraStream.getAudioTracks());
        recordingType = 'audio';
        logger.info("Recording: Mic audio only");
    }


    if (!streamToRecord || streamToRecord.getTracks().length === 0) {
        toast({ title: "Recording Error", description: "No active audio or video stream to record. Ensure mic or camera/screen is enabled.", variant: "destructive"});
        logger.warn("Recording error: No active stream with tracks.");
        return;
    }

    logger.info("Attempting to record stream with tracks:", streamToRecord.getTracks().map(t => `${t.kind}:${t.label}`));

    try {
      const mimeType = recordingType === 'video' ? (MediaRecorder.isTypeSupported('video/webm; codecs=vp9,opus') ? 'video/webm; codecs=vp9,opus' : 'video/webm') : (MediaRecorder.isTypeSupported('audio/webm; codecs=opus') ? 'audio/webm; codecs=opus' : 'audio/webm');
      const options = { mimeType };
      if(!MediaRecorder.isTypeSupported(mimeType)) {
        logger.warn(`MIME type ${mimeType} not supported, falling back to browser default for ${recordingType}.`);
        delete (options as any).mimeType;
      }


      mediaRecorderRef.current = new MediaRecorder(streamToRecord, options);
      recordedChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
          logger.debug("Recording data available, chunk size:", event.data.size);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        const finalMimeType = mediaRecorderRef.current?.mimeType || (recordingType === 'video' ? 'video/webm' : 'audio/webm');
        const recordedBlob = new Blob(recordedChunksRef.current, { type: finalMimeType });
        const url = URL.createObjectURL(recordedBlob);
        setAudioURL(url);

        if (sessionDetails) {
            const newRecordingRef: RecordingReference = {
                id: `rec-${Date.now()}`,
                sessionId: sessionDetails.id,
                startTime: new Date().toISOString(),
                durationSeconds: 0, 
                localStorageKey: `recording_${sessionDetails.id}_${Date.now()}`,
                type: recordingType,
                blobUrl: url,
                fileName: `recording_${sessionDetails.id}_${new Date().toISOString().replace(/:/g,'-')}.${finalMimeType.split('/')[1].split(';')[0]}`
            };
            setLocalRecordingReferences(prev => [...prev, newRecordingRef]);
            await updateLiveInterviewSession(sessionId, { recordingReferences: [...localRecordingReferences, newRecordingRef] });
        }
        logger.info("Recording stopped. Blob URL created:", url);
        toast({ title: "Recording Stopped", description: "Recording available for playback/download.", duration: 5000 });
      };
      mediaRecorderRef.current.start(1000); 
      setIsRecording(true);
      setAudioURL(null); 
      toast({ title: "Recording Started" });
      logger.info("Recording started.");
    } catch (err) {
      console.error("MediaRecorder error:", err);
      toast({ title: "Recording Error", description: (err as Error).message || "Could not start recording.", variant: "destructive" });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      logger.info("Recording stop requested.");
    }
  };

   const toggleFullScreen = async () => {
    if (!liveInterviewContainerRef.current) return;
    if (!document.fullscreenElement) {
      try {
        await liveInterviewContainerRef.current.requestFullscreen();
      } catch (err) {
        toast({ title: "Fullscreen Error", description: `Could not enter fullscreen: ${(err as Error).message}`, variant: "destructive" });
      }
    } else {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      }
    }
  };


  const selfParticipant = useMemo(() => {
    if (!currentUser) return { name: 'You', role: 'candidate', profilePictureUrl: '', userId: ''};
    return sessionDetails?.participants.find(p => p.userId === currentUser.id) ||
    { name: currentUser.name, role: isInterviewer ? "interviewer" : "candidate", profilePictureUrl: currentUser.profilePictureUrl, userId: currentUser.id };
   }, [sessionDetails, currentUser, isInterviewer]
  );

  const otherParticipant = useMemo(() => {
    if (!currentUser) return { name: 'Participant', role: 'interviewer', profilePictureUrl: '', userId: ''};
    return sessionDetails?.participants.find(p => p.userId !== currentUser.id) ||
    { name: "Participant Placeholder", role: isInterviewer ? "candidate" : "interviewer", profilePictureUrl: `https://avatar.vercel.sh/participantB.png`, userId: 'participant-placeholder-B' };
   }, [sessionDetails, currentUser, isInterviewer]
  );


  if (isLoadingSession || sessionDetails === undefined) {
    return <div className="flex items-center justify-center min-h-screen"><Loader2 className="h-12 w-12 animate-spin text-primary" /><p className="ml-4 text-muted-foreground">Loading session...</p></div>;
  }
  if (sessionDetails === null) {
    return <div className="flex flex-col items-center justify-center min-h-screen text-center p-4"><AlertTriangle className="h-16 w-16 text-destructive mb-4" /><h1 className="text-2xl font-bold">Interview Session Not Found</h1><p className="text-muted-foreground mb-6">ID: {sessionId}</p><Button asChild><Link href="/interview-prep">Back to Prep Hub</Link></Button></div>;
  }

  const mainFeedName = activeStreamType === 'screen' && screenStream ? `${selfParticipant.name}'s Screen Share` : (activeStreamType === 'camera' && isVideoActive ? otherParticipant.name : `${otherParticipant.name}'s Video Off`);
  const mainFeedIsActive = (activeStreamType === 'camera' && isVideoActive && cameraStream) || (activeStreamType === 'screen' && screenStream);

  if (showReportView && sessionDetails.finalScore) {
    const { achievedScore, totalPossibleScore, percentage, reportNotes } = sessionDetails.finalScore;
    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 md:p-8 bg-secondary/30 dark:bg-background">
            <Card className="w-full max-w-2xl shadow-xl">
                <CardHeader>
                    <CardTitle className="text-2xl md:text-3xl font-bold text-primary">Interview Report: {sessionDetails.title}</CardTitle>
                    <CardDescription>Candidate: {isInterviewer ? otherParticipant.name : selfParticipant.name}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="text-center p-6 bg-primary/10 rounded-lg">
                        <p className="text-sm text-muted-foreground">Overall Score</p>
                        <p className="text-5xl font-bold text-primary my-2">{percentage.toFixed(1)}%</p>
                        <p className="text-md text-foreground">Achieved {achievedScore.toFixed(2)} out of {totalPossibleScore.toFixed(2)} points</p>
                    </div>
                     {isInterviewer && (
                        <div>
                            <Label htmlFor="reportNotes" className="font-semibold">Interviewer's Overall Notes/Summary:</Label>
                            <Textarea
                                id="reportNotes"
                                value={overallReportNotes}
                                onChange={(e) => setOverallReportNotes(e.target.value)}
                                placeholder="Add overall comments, strengths, areas for improvement..."
                                rows={4}
                            />
                        </div>
                    )}
                    {!isInterviewer && reportNotes && (
                         <div>
                            <Label className="font-semibold">Interviewer's Summary:</Label>
                            <p className="text-sm p-3 bg-muted rounded-md whitespace-pre-line">{reportNotes}</p>
                        </div>
                    )}
                    <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="details">
                            <AccordionTrigger>View Per-Question Scores & Notes</AccordionTrigger>
                            <AccordionContent>
                                <ScrollArea className="h-[200px] pr-2">
                                    <ul className="space-y-2 text-sm">
                                        {sessionDetails.preSelectedQuestions?.map(q => {
                                            const scoreInfo = sessionDetails.interviewerScores?.find(s => s.questionId === q.id);
                                            return (
                                                <li key={q.id} className="p-2 border rounded-md bg-card">
                                                    <p className="font-medium text-foreground">{q.questionText}</p>
                                                    <p className="text-xs text-primary">Score: {scoreInfo ? `${scoreInfo.correctnessPercentage}% (${((q.baseScore || 0) * (scoreInfo.correctnessPercentage / 100)).toFixed(2)}/${q.baseScore || 0})` : "Not Scored"}</p>
                                                    {scoreInfo?.notes && <p className="text-xs text-muted-foreground mt-1 italic">Notes: {scoreInfo.notes}</p>}
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </ScrollArea>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                    {isInterviewer && (
                        <div className="space-y-2">
                            <Label htmlFor="reportRecipients" className="font-semibold flex items-center gap-1"><MailIcon className="h-4 w-4" /> Send Report To (comma-separated emails):</Label>
                            <Input 
                                id="reportRecipients"
                                type="email"
                                placeholder="e.g., candidate@example.com, hr@example.com"
                                value={reportRecipientEmails}
                                onChange={(e) => setReportRecipientEmails(e.target.value)}
                            />
                        </div>
                    )}
                </CardContent>
                <CardFooter className="flex flex-col sm:flex-row justify-end gap-2">
                    <Button variant="outline" onClick={() => router.push('/interview-prep')}>Back to Prep Hub</Button>
                    {isInterviewer && <Button onClick={handleSendReport} className="bg-green-600 hover:bg-green-700 text-white">Send Report (Mock)</Button>}
                </CardFooter>
            </Card>
        </div>
    );
  }


  return (
    <div ref={liveInterviewContainerRef} className={cn("flex flex-col h-screen bg-slate-100 dark:bg-slate-900 text-foreground p-2 md:p-4 overflow-hidden", isFullScreen && "bg-background")}>
      <div className="mb-2 md:mb-4 text-center md:text-left">
        <div className="flex justify-between items-center">
            <h1 className="text-xl md:text-2xl font-semibold truncate">{sessionDetails.title}</h1>
            <Button variant="ghost" size="icon" onClick={toggleFullScreen} title={isFullScreen ? "Exit Fullscreen" : "Enter Fullscreen"} className="ml-auto">
              {isFullScreen ? <Minimize className="h-5 w-5"/> : <Maximize className="h-5 w-5"/>}
            </Button>
        </div>
        <p className="text-xs md:text-sm text-muted-foreground">
          {isInterviewer ? `Interviewing: ${otherParticipant.name}` : `Interviewer: ${otherParticipant.name}`}
          <span className="mx-2 hidden md:inline">|</span>
          <span className="block md:inline">Current Time: {format(currentTime, 'p')}</span>
        </p>
      </div>

      <div className="flex-grow grid grid-cols-1 lg:grid-cols-4 gap-2 md:gap-4 overflow-hidden">
        <div className="lg:col-span-3 bg-black rounded-lg flex flex-col p-1 md:p-2 relative shadow-2xl justify-between overflow-hidden">
          <div className="w-full aspect-video bg-slate-800 rounded-md flex items-center justify-center text-slate-400 relative overflow-hidden mb-1 md:mb-2 flex-grow">
            <video ref={mainVideoRef} className={cn("w-full h-full object-contain", !mainFeedIsActive && "hidden" )} autoPlay playsInline muted={activeStreamType === 'camera' ? false : true} />
            {!mainFeedIsActive && (
                <div className="text-center p-4">
                    <VideoOff className="h-12 w-12 md:h-16 md:w-16 text-slate-500 mx-auto mb-2"/>
                    <p className="text-sm md:text-base">{mainFeedName}</p>
                </div>
            )}
            {activeStreamType === 'camera' && !cameraStream && hasCameraPermission === false && <Alert variant="destructive" className="m-2 md:m-4 max-w-xs md:max-w-sm text-xs md:text-sm"><AlertTriangle className="h-4 w-4" /> <AlertTitle>Camera Permission Denied</AlertTitle><AlertDescription>Please enable camera access.</AlertDescription></Alert>}
            {activeStreamType === 'screen' && !screenStream && hasScreenPermission === false && <Alert variant="destructive" className="m-2 md:m-4 max-w-xs md:max-w-sm text-xs md:text-sm"><AlertTriangle className="h-4 w-4" /> <AlertTitle>Screen Share Denied</AlertTitle><AlertDescription>Please grant permission or check browser policy.</AlertDescription></Alert>}

            <p className="absolute bottom-1 md:bottom-2 left-1 md:left-2 text-[10px] md:text-xs bg-black/50 px-1 py-0.5 md:px-1.5 md:py-0.5 rounded text-white">
                {mainFeedName}
            </p>

            <div className="absolute top-1 right-1 md:top-2 md:right-2 w-24 h-auto md:w-32 lg:w-40 aspect-video bg-slate-700 rounded shadow-md overflow-hidden border border-slate-600">
              <video ref={selfVideoRef} className={cn("w-full h-full object-cover", !isVideoActive && "hidden")} autoPlay playsInline muted />
              { !isVideoActive && (
                <div className="w-full h-full flex items-center justify-center">
                    <VideoOff className="h-5 w-5 md:h-6 md:w-6 text-slate-400"/>
                </div>
              )}
              <p className="absolute bottom-0.5 left-0.5 md:bottom-1 md:left-1 text-[8px] md:text-[10px] bg-black/50 px-0.5 py-px md:px-1 md:py-0.5 rounded text-white">{selfParticipant.name} (You)</p>
            </div>
          </div>

          <div className="flex justify-center items-center gap-1 md:gap-2 p-1 md:p-2 bg-slate-800/50 backdrop-blur-sm rounded-md">
            <Button variant={isMicMuted ? "destructive" : "outline"} size="icon" onClick={handleToggleMic} title={isMicMuted ? "Unmute" : "Mute"} className="bg-white/10 text-white hover:bg-white/20 border-white/20 h-9 w-9 md:h-10 md:w-10"> <Mic className={cn("h-4 w-4 md:h-5 md:w-5", isMicMuted && "text-red-400")} /></Button>
            <Button variant={!isVideoActive ? "destructive" : "outline"} size="icon" onClick={handleToggleVideo} title={isVideoActive ? "Stop Video" : "Start Video"} className="bg-white/10 text-white hover:bg-white/20 border-white/20 h-9 w-9 md:h-10 md:w-10"><VideoIcon className="h-4 w-4 md:h-5 md:w-5" /></Button>
            <Button variant={activeStreamType === 'screen' ? "default" : "outline"} size="icon" onClick={handleToggleScreenShare} className={cn("bg-white/10 text-white hover:bg-white/20 border-white/20 h-9 w-9 md:h-10 md:w-10", activeStreamType === 'screen' && "bg-green-500 hover:bg-green-600 border-green-600")} title={activeStreamType === 'screen' ? "Stop Sharing" : "Share Screen"}><ScreenShare className="h-4 w-4 md:h-5 md:w-5" /></Button>
            {browserSupportsRecording && (
              <Button variant={isRecording ? "destructive" : "outline"} size="icon" onClick={isRecording ? stopRecording : startRecording} title={isRecording ? "Stop Recording" : "Start Recording"} className="bg-white/10 text-white hover:bg-white/20 border-white/20 h-9 w-9 md:h-10 md:w-10">
                {isRecording ? <Square className="h-4 w-4 md:h-5 md:w-5 animate-pulse text-red-400 fill-current" /> : <Radio className="h-4 w-4 md:h-5 md:w-5 text-red-400" />}
              </Button>
            )}
            <Button variant="destructive" size="default" onClick={handleEndCallAndGenerateReport} className="px-2 py-1 md:px-3 md:py-2 text-xs md:text-sm h-9 md:h-10"><PhoneOff className="mr-0 md:mr-1 h-4 w-4 md:h-5 md:w-5" /> <span className="hidden md:inline">End Call</span></Button>
          </div>
        </div>

        <Card className="flex flex-col shadow-lg bg-card text-card-foreground rounded-lg overflow-hidden max-h-full">
          <Accordion
            type="multiple"
            value={openAccordionItems}
            onValueChange={setOpenAccordionItems}
            className="w-full flex-grow flex flex-col overflow-hidden"
          >
             {isInterviewer && sessionDetails.preSelectedQuestions && sessionDetails.preSelectedQuestions.length > 0 && (
              <AccordionItem value="interview-questions" className="border-b">
                <AccordionTrigger className="px-3 py-2 md:px-4 md:py-3 text-xs md:text-sm font-medium hover:bg-secondary/50">
                    <div className="flex items-center gap-1 md:gap-2"><ListChecks className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary"/>Interview Questions ({sessionDetails.preSelectedQuestions.filter(q => !askedQuestions.has(q.id)).length} remaining)</div>
                </AccordionTrigger>
                <AccordionContent className="px-0 pt-0 pb-0 flex-grow flex flex-col overflow-hidden">
                  <div className="p-2 md:p-3 border-b">
                    <Button size="xs" variant="outline" onClick={resetAskedQuestions} className="text-[10px] h-6"><RotateCcw className="mr-1 h-3 w-3"/> Reset Asked Status</Button>
                  </div>
                  <ScrollArea className="flex-grow p-2 md:p-3">
                      <ul className="space-y-1.5 md:space-y-2">
                        {sessionDetails.preSelectedQuestions.map((q) => (
                          <li key={q.id} className={cn("text-xs md:text-sm p-1.5 md:p-2 rounded hover:bg-primary/10 group border", askedQuestions.has(q.id) ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700" : "bg-card")}>
                            <div className="flex justify-between items-start mb-1.5">
                                <div className="flex-1 mr-1">
                                  <p className="font-medium" title={q.questionText}>{q.questionText}</p>
                                  <p className="text-[9px] md:text-[10px] text-muted-foreground">
                                    {q.category} - {q.difficulty} (Base: {q.baseScore || 0} pts)
                                  </p>
                                </div>
                                {!askedQuestions.has(q.id) && <Button variant="ghost" size="xs" className="h-auto py-0.5 px-1 text-primary shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => markQuestionAsAsked(q.id)}>Mark Asked</Button>}
                            </div>
                            {isInterviewer && (
                                <div className="mt-1 space-y-1 bg-secondary/30 p-1.5 rounded">
                                    <Label className="text-[10px] md:text-xs font-medium flex items-center gap-1"><CheckSquareIcon className="h-3 w-3"/>Correctness:</Label>
                                    <RadioGroup 
                                        defaultValue={currentQuestionScores[q.id]?.correctnessPercentage?.toString()}
                                        onValueChange={(value) => handleScoreChange(q.id, parseInt(value) as InterviewerScore['correctnessPercentage'])}
                                        className="flex flex-wrap gap-x-2 gap-y-1"
                                    >
                                        {CORRECTNESS_PERCENTAGES.map(p => (
                                            <div key={p} className="flex items-center space-x-1">
                                                <RadioGroupItem value={String(p)} id={`${q.id}-score-${p}`} className="h-3 w-3 md:h-3.5 md:w-3.5"/>
                                                <Label htmlFor={`${q.id}-score-${p}`} className="text-[10px] md:text-xs font-normal cursor-pointer">{p}%</Label>
                                            </div>
                                        ))}
                                    </RadioGroup>
                                    <Textarea 
                                        placeholder="Notes for this question..." 
                                        className="text-[10px] md:text-xs h-12 p-1 mt-1" 
                                        value={currentQuestionScores[q.id]?.notes || ''}
                                        onChange={(e) => handleNotesChange(q.id, e.target.value)}
                                    />
                                </div>
                            )}
                          </li>
                        ))}
                      </ul>
                    </ScrollArea>
                </AccordionContent>
              </AccordionItem>
            )}
            <AccordionItem value="chat" className="border-b flex-grow flex flex-col overflow-hidden min-h-[150px] md:min-h-[200px]">
              <AccordionTrigger className="px-3 py-2 md:px-4 md:py-3 text-xs md:text-sm font-medium hover:bg-secondary/50">
                <div className="flex items-center gap-1 md:gap-2"><ChatIcon className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary"/>Chat</div>
              </AccordionTrigger>
              <AccordionContent className="px-0 pt-0 pb-0 flex-grow flex flex-col overflow-hidden">
                 <ScrollArea className="flex-grow p-2 md:p-3">
                  <div className="space-y-1.5 md:space-y-2 text-xs md:text-sm">
                    {chatMessages.map((msg) => (
                      <div key={msg.id} className={cn("p-1.5 md:p-2 rounded-md max-w-[90%]", msg.user === selfParticipant.name ? "bg-primary/80 text-primary-foreground ml-auto text-right" : "bg-muted text-muted-foreground")}>
                        <span className="font-semibold block text-[10px] md:text-xs">{msg.user === selfParticipant.name ? "You" : msg.user}</span>
                        {msg.text}
                      </div>
                    ))}
                    {chatMessages.length === 0 && <p className="text-center text-muted-foreground py-2 md:py-4">Chat messages appear here.</p>}
                  </div>
                </ScrollArea>
                <div className="p-2 md:p-3 border-t mt-auto">
                  <div className="flex w-full gap-1 md:gap-1.5">
                    <Input placeholder="Type message..." value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleSendChatMessage()} className="h-8 md:h-9 text-xs md:text-sm"/>
                    <Button size="icon" onClick={handleSendChatMessage} className="h-8 w-8 md:h-9 md:w-9 shrink-0"><Send className="h-3.5 w-3.5 md:h-4 md:w-4"/></Button>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="participants" className="border-b-0">
              <AccordionTrigger className="px-3 py-2 md:px-4 md:py-3 text-xs md:text-sm font-medium hover:bg-secondary/50">
                 <div className="flex items-center gap-1 md:gap-2"><ParticipantsIcon className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary"/>Participants ({sessionDetails.participants.length})</div>
              </AccordionTrigger>
              <AccordionContent className="px-3 py-2 md:px-4 md:pb-3">
                <ul className="space-y-1 md:space-y-1.5 text-xs md:text-sm">
                  {sessionDetails.participants.map(p => (
                    <li key={p.userId} className="flex items-center gap-1.5 md:gap-2 p-1 rounded hover:bg-secondary/30">
                      <img src={p.profilePictureUrl || `https://avatar.vercel.sh/${p.userId}.png`} alt={p.name} className="h-5 w-5 md:h-6 md:w-6 rounded-full" data-ai-hint="person avatar"/>
                      <span>{p.name} <span className="text-muted-foreground/80 text-[10px] md:text-xs">({p.role})</span></span>
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </Card>
      </div>
      {audioURL && (
        <div className="fixed bottom-16 right-2 md:bottom-4 md:right-4 z-50 bg-card p-1.5 md:p-2 rounded shadow-lg border flex items-center gap-1 md:gap-2">
            <audio src={audioURL} controls className="h-7 md:h-8 w-40 md:w-auto"/>
            {localRecordingReferences.length > 0 &&
              <a href={localRecordingReferences[localRecordingReferences.length -1].blobUrl} download={localRecordingReferences[localRecordingReferences.length -1].fileName}>
                <Button variant="outline" size="icon" title="Download Recording" className="h-7 w-7 md:h-8 md:w-8"><DownloadIcon className="h-3.5 w-3.5 md:h-4 md:w-4"/></Button>
              </a>
            }
        </div>
      )}
    </div>
  );
}
