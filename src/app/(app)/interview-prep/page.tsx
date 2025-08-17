
"use client";

import type React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Mic, ListChecks, Loader2 } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { sampleCreatedQuizzes, sampleLiveInterviewSessions } from '@/lib/sample-data';
import type { PracticeSession, InterviewQuestion, MockInterviewSession, DialogStep, PracticeSessionConfig, InterviewQuestionCategory, LiveInterviewSession } from '@/types';
import { ALL_CATEGORIES, PREDEFINED_INTERVIEW_TOPICS } from '@/types';
import PracticeSetupDialog from '@/components/features/interview-prep/PracticeSetupDialog';
import QuestionFormDialog from '@/components/features/interview-prep/QuestionFormDialog';
import PracticeSessionList from '@/components/features/interview-prep/PracticeSessionList';
import CreatedQuizzesList from '@/components/features/interview-prep/CreatedQuizzesList';
import QuestionBank from '@/components/features/interview-prep/QuestionBank';
import { getInterviewQuestions, createInterviewQuestion, updateInterviewQuestion, deleteInterviewQuestion, toggleBookmarkQuestion } from '@/lib/actions/interview';
import { useAuth } from '@/hooks/use-auth';
import { getAppointments } from '@/lib/actions/appointments';


export default function InterviewPracticeHubPage() {
  const [isSetupDialogOpen, setIsSetupDialogOpen] = useState(false);
  const [practiceSessions, setPracticeSessions] = useState<PracticeSession[]>([]);
  const [allBankQuestions, setAllBankQuestions] = useState<InterviewQuestion[]>([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(true);
  const [createdQuizzes, setCreatedQuizzes] = useState<MockInterviewSession[]>(sampleCreatedQuizzes);
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
        const appointments = await getAppointments(currentUser.id);
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
          })) as PracticeSession[];
        setPracticeSessions(userPracticeSessions);
      };
      loadData();
      fetchQuestions();
    }
  }, [currentUser, fetchQuestions]);

  const handleStartPracticeSetup = useCallback(() => {
    setIsSetupDialogOpen(true);
  }, []);

  const handleSessionBooked = (newSession: PracticeSession, queryParams?: URLSearchParams) => {
    setPracticeSessions(prev => [newSession, ...prev]);

    if (newSession.category === "Practice with AI" && queryParams) {
      toast({ title: "AI Interview Setup Complete!", description: `Redirecting to start your AI mock interview for "${newSession.aiTopicOrRole}".`, duration: 4000 });
      router.push(`/ai-mock-interview?${queryParams.toString()}`);
    } else {
      toast({ title: "Session Booked!", description: "Your new practice session is scheduled." });
    }
    setIsSetupDialogOpen(false);
  };

  const handleCancelPracticeSession = (sessionId: string) => {
    setPracticeSessions(prev => prev.map(s => s.id === sessionId ? { ...s, status: 'CANCELLED' } : s));
    const liveSessionIndex = sampleLiveInterviewSessions.findIndex(s => s.id === sessionId);
    if (liveSessionIndex !== -1) { sampleLiveInterviewSessions[liveSessionIndex].status = 'Cancelled'; }
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
