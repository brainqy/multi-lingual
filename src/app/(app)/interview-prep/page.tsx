
"use client";

import type React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Mic, ListChecks, Loader2 } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import type { PracticeSession, InterviewQuestion, MockInterviewSession, DialogStep, PracticeSessionConfig, InterviewQuestionCategory, LiveInterviewSession, Appointment } from '@/types';
import { ALL_CATEGORIES, PREDEFINED_INTERVIEW_TOPICS } from '@/types';
import PracticeSetupDialog from '@/components/features/interview-prep/PracticeSetupDialog';
import QuestionFormDialog from '@/components/features/interview-prep/QuestionFormDialog';
import PracticeSessionList from '@/components/features/interview-prep/PracticeSessionList';
import CreatedQuizzesList from '@/components/features/interview-prep/CreatedQuizzesList';
import QuestionBank from '@/components/features/interview-prep/QuestionBank';
import { getInterviewQuestions, createInterviewQuestion, updateInterviewQuestion, deleteInterviewQuestion, toggleBookmarkQuestion } from "@/lib/actions/questions";
import { useAuth } from '@/hooks/use-auth';
import { getAppointments, createAppointment } from '@/lib/actions/appointments';
import { getCreatedQuizzes } from '@/lib/actions/quizzes';
import { createMockInterviewSession } from '@/lib/actions/interviews';


export default function InterviewPracticeHubPage() {
  const [isSetupDialogOpen, setIsSetupDialogOpen] = useState(false);
  const [practiceSessions, setPracticeSessions] = useState<PracticeSession[]>([]);
  const [allBankQuestions, setAllBankQuestions] = useState<InterviewQuestion[]>([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(true);
  const [createdQuizzes, setCreatedQuizzes] = useState<MockInterviewSession[]>([]);
  const [isQuestionFormOpen, setIsQuestionFormOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<InterviewQuestion | null>(null);

  const router = useRouter();
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  
  const fetchQuestions = useCallback(async () => {
    setIsLoadingQuestions(true);
    const questions = await getInterviewQuestions();
    setAllBankQuestions(questions);
    setIsLoadingQuestions(false);
  }, []);

  useEffect(() => {
    if (currentUser) {
      const loadData = async () => {
        const [appointments, quizzes] = await Promise.all([
          getAppointments(currentUser.id),
          getCreatedQuizzes(currentUser.id)
        ]);

        const userPracticeSessions = appointments
          .filter(a => a.title.includes("Practice Session")) // Simple filter for demo
          .map(a => ({
            id: a.id,
            userId: currentUser.id,
            date: a.dateTime,
            category: "Practice with Experts",
            type: a.title,
            language: "English",
            status: a.status === 'Confirmed' ? 'SCHEDULED' : a.status.toUpperCase(),
            topic: a.title, // Add topic
            createdAt: a.dateTime, // Use dateTime as createdAt for consistency
          })) as PracticeSession[];
        setPracticeSessions(userPracticeSessions);
        setCreatedQuizzes(quizzes);
      };
      loadData();
      fetchQuestions();
    }
  }, [currentUser, fetchQuestions]);

  const handleStartPracticeSetup = useCallback(() => {
    setIsSetupDialogOpen(true);
  }, []);

  const handleSessionBooked = async (newSessionConfig: PracticeSessionConfig) => {
    if (!currentUser) {
        toast({ title: "Error", description: "You must be logged in.", variant: "destructive" });
        return;
    }

    if (newSessionConfig.type === "ai") {
        const newSessionData: Omit<MockInterviewSession, 'id' | 'questions' | 'answers' | 'overallFeedback' | 'overallScore' | 'recordingReferences'> = {
            userId: currentUser.id,
            topic: newSessionConfig.aiTopicOrRole || 'AI Practice',
            description: newSessionConfig.aiJobDescription,
            status: 'in-progress',
            createdAt: new Date().toISOString(),
            timerPerQuestion: newSessionConfig.aiTimerPerQuestion,
            difficulty: newSessionConfig.aiDifficulty ? (newSessionConfig.aiDifficulty.charAt(0).toUpperCase() + newSessionConfig.aiDifficulty.slice(1)) as 'Easy' | 'Medium' | 'Hard' : undefined,
            questionCategories: newSessionConfig.aiQuestionCategories as InterviewQuestionCategory[],
        };

        const createdSession = await createMockInterviewSession(newSessionData);
        
        if (createdSession) {
            const queryParams = new URLSearchParams();
            queryParams.set('topic', newSessionConfig.aiTopicOrRole || '');
            queryParams.set('numQuestions', String(newSessionConfig.aiNumQuestions));
            queryParams.set('difficulty', String(newSessionConfig.aiDifficulty));
            queryParams.set('autoFullScreen', 'true');
            queryParams.set('sourceSessionId', createdSession.id);
            if (newSessionConfig.aiJobDescription) queryParams.set('jobDescription', newSessionConfig.aiJobDescription);
            if (newSessionConfig.aiTimerPerQuestion) queryParams.set('timerPerQuestion', String(newSessionConfig.aiTimerPerQuestion));
            if (newSessionConfig.aiQuestionCategories?.length) queryParams.set('categories', newSessionConfig.aiQuestionCategories.join(','));
            
            toast({ title: "AI Interview Setup Complete!", description: `Redirecting to start your AI mock interview for "${newSessionConfig.aiTopicOrRole}".`, duration: 4000 });
            router.push(`/ai-mock-interview?${queryParams.toString()}`);
        } else {
            toast({ title: "Error", description: "Could not create AI practice session.", variant: "destructive" });
        }
    } else {
      // Logic for booking with experts or friends
      const newAppointmentData: Omit<Appointment, 'id'> = {
        tenantId: currentUser.tenantId,
        requesterUserId: currentUser.id,
        alumniUserId: 'expert-placeholder', // In a real app, this would be selected
        title: `Practice Session: ${newSessionConfig.topics.join(', ')}`,
        dateTime: newSessionConfig.dateTime?.toISOString() || new Date().toISOString(),
        status: 'Pending',
        withUser: newSessionConfig.type === 'experts' ? 'Industry Expert' : newSessionConfig.friendEmail,
        notes: newSessionConfig.type === 'friends' ? `Invitation sent to ${newSessionConfig.friendEmail}` : `Category: ${newSessionConfig.interviewCategory}`
      };
      
      const newAppointment = await createAppointment(newAppointmentData);

      if (newAppointment) {
        setPracticeSessions(prev => [...prev, {
          id: newAppointment.id,
          userId: newAppointment.requesterUserId,
          date: newAppointment.dateTime,
          category: newSessionConfig.type === 'experts' ? "Practice with Experts" : "Practice with Friends",
          type: newAppointment.title,
          language: "English",
          status: 'SCHEDULED',
          topic: newAppointment.title,
          createdAt: new Date().toISOString(), // Use current time for createdAt
        }]);
        toast({ title: "Session Booked!", description: "Your new practice session is scheduled and visible in 'My Appointments'." });
      } else {
        toast({ title: "Booking Failed", description: "Could not schedule the practice session.", variant: "destructive" });
      }
    }
    setIsSetupDialogOpen(false);
  };


  const handleCancelPracticeSession = (sessionId: string) => {
    setPracticeSessions(prev => prev.map(s => s.id === sessionId ? { ...s, status: 'CANCELLED' } : s));
    toast({ title: "Session Cancelled", description: "The practice session has been cancelled.", variant: "destructive" });
  };

  const handleRescheduleSession = (sessionId: string) => {
    toast({ title: "Reschedule Mocked", description: "Rescheduling functionality for this session is not yet implemented." });
    console.log("Reschedule requested for session:", sessionId);
  };
  
  const handleOpenNewQuestionDialog = () => {
    setEditingQuestion(null);
    setIsQuestionFormOpen(true);
  };

  const handleOpenEditQuestionDialog = (question: InterviewQuestion) => {
    if (!currentUser) return;
    if (currentUser.role !== 'admin' && question.createdBy !== currentUser.id) {
        toast({title: "Permission Denied", description: "You can only edit questions you created.", variant: "destructive"});
        return;
    }
    setEditingQuestion(question);
    setIsQuestionFormOpen(true);
  };
  
  const handleDeleteQuestion = async (questionId: string) => {
     if (!currentUser) return;
     const questionToDelete = allBankQuestions.find(q => q.id === questionId);
     if (currentUser.role !== 'admin' && questionToDelete?.createdBy !== currentUser.id) {
        toast({title: "Permission Denied", description: "You can only delete questions you created.", variant: "destructive"});
        return;
    }
    const success = await deleteInterviewQuestion(questionId);
    if (success) {
      setAllBankQuestions(prev => prev.filter(q => q.id !== questionId));
      toast({ title: "Question Deleted", description: "Question removed from the bank.", variant: "destructive" });
    } else {
      toast({ title: "Error", description: "Failed to delete question.", variant: "destructive" });
    }
  };
  
  const handleQuestionFormSubmit = async (questionData: InterviewQuestion) => {
    if (editingQuestion) {
        const updated = await updateInterviewQuestion(editingQuestion.id, questionData);
        if (updated) {
            setAllBankQuestions(prev => prev.map(q => q.id === editingQuestion.id ? updated : q));
            toast({ title: "Question Updated" });
        } else {
            toast({ title: "Error", description: "Failed to update question.", variant: "destructive" });
        }
    } else {
        const created = await createInterviewQuestion(questionData);
        if (created) {
            setAllBankQuestions(prev => [created, ...prev]);
            toast({ title: "Question Added" });
        } else {
            toast({ title: "Error", description: "Failed to create question.", variant: "destructive" });
        }
    }
    setIsQuestionFormOpen(false);
    setEditingQuestion(null);
  };
  
  const handleToggleBookmarkQuestion = async (questionId: string) => {
    if (!currentUser) return;
    const updatedQuestion = await toggleBookmarkQuestion(questionId, currentUser.id);
    if (updatedQuestion) {
      setAllBankQuestions(prevQs => prevQs.map(q => q.id === questionId ? updatedQuestion : q));
    } else {
      toast({ title: "Error", description: "Could not update bookmark.", variant: "destructive" });
    }
  };

  if (!currentUser) {
    return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-8">
      <Card className="bg-secondary/30 shadow-lg">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Home / Practice Hub</p>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">INTERVIEW PREPARATION HUB</h1>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                <Button size="lg" onClick={handleStartPracticeSetup} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                    <Mic className="mr-2 h-5 w-5" /> Start New Practice Session
                </Button>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-foreground">Credits left: <span className="font-semibold text-primary">{currentUser.interviewCredits || 0} AI interviews</span></p>
          </div>
        </CardContent>
      </Card>

      <PracticeSessionList 
        practiceSessions={practiceSessions}
        onCancelSession={handleCancelPracticeSession}
        onRescheduleSession={handleRescheduleSession}
      />
      
      <CreatedQuizzesList
        createdQuizzes={createdQuizzes}
        currentUser={currentUser}
      />

      <QuestionBank
        allBankQuestions={allBankQuestions}
        currentUser={currentUser}
        onOpenNewQuestionDialog={handleOpenNewQuestionDialog}
        onOpenEditQuestionDialog={handleOpenEditQuestionDialog}
        onDeleteQuestion={handleDeleteQuestion}
        onToggleBookmark={handleToggleBookmarkQuestion}
        isLoading={isLoadingQuestions}
      />

      {isSetupDialogOpen && (
        <PracticeSetupDialog 
          isOpen={isSetupDialogOpen}
          onClose={() => setIsSetupDialogOpen(false)}
          onSessionBooked={handleSessionBooked}
        />
      )}
      
      {isQuestionFormOpen && (
         <QuestionFormDialog
            isOpen={isQuestionFormOpen}
            onClose={() => { setIsQuestionFormOpen(false); setEditingQuestion(null); }}
            onSubmit={handleQuestionFormSubmit}
            editingQuestion={editingQuestion}
            currentUser={currentUser}
        />
      )}
    </div>
  );
}
