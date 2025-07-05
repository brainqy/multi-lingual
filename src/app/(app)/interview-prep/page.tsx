
"use client";

import type React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Mic, ListChecks } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { sampleUserProfile, samplePracticeSessions, sampleInterviewQuestions, sampleCreatedQuizzes, sampleLiveInterviewSessions } from '@/lib/sample-data';
import type { PracticeSession, InterviewQuestion, MockInterviewSession, DialogStep, PracticeSessionConfig, InterviewQuestionCategory, LiveInterviewSession } from '@/types';
import { ALL_CATEGORIES, PREDEFINED_INTERVIEW_TOPICS } from '@/types';
import PracticeSetupDialog from '@/components/features/interview-prep/PracticeSetupDialog';
import QuestionFormDialog from '@/components/features/interview-prep/QuestionFormDialog';
import PracticeSessionList from '@/components/features/interview-prep/PracticeSessionList';
import CreatedQuizzesList from '@/components/features/interview-prep/CreatedQuizzesList';
import QuestionBank from '@/components/features/interview-prep/QuestionBank';


export default function InterviewPracticeHubPage() {
  const [isSetupDialogOpen, setIsSetupDialogOpen] = useState(false);
  const [practiceSessions, setPracticeSessions] = useState<PracticeSession[]>(samplePracticeSessions.filter(s => s.userId === sampleUserProfile.id));
  const [allBankQuestions, setAllBankQuestions] = useState<InterviewQuestion[]>(sampleInterviewQuestions);
  const [createdQuizzes, setCreatedQuizzes] = useState<MockInterviewSession[]>(sampleCreatedQuizzes);
  const [isQuestionFormOpen, setIsQuestionFormOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<InterviewQuestion | null>(null);

  const router = useRouter();
  const { toast } = useToast();
  const currentUser = sampleUserProfile;

  const handleStartPracticeSetup = useCallback(() => {
    setIsSetupDialogOpen(true);
  }, []);

  const handleSessionBooked = (newSession: PracticeSession, queryParams?: URLSearchParams) => {
    setPracticeSessions(prev => [newSession, ...prev]);
    samplePracticeSessions.unshift(newSession);

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
    const globalIndex = samplePracticeSessions.findIndex(s => s.id === sessionId);
    if (globalIndex !== -1) { (samplePracticeSessions[globalIndex] as any).status = 'CANCELLED'; }
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
    if (currentUser.role !== 'admin' && question.createdBy !== currentUser.id) {
        toast({title: "Permission Denied", description: "You can only edit questions you created.", variant: "destructive"});
        return;
    }
    setEditingQuestion(question);
    setIsQuestionFormOpen(true);
  };
  
  const handleDeleteQuestion = (questionId: string) => {
     const questionToDelete = allBankQuestions.find(q => q.id === questionId);
     if (currentUser.role !== 'admin' && questionToDelete?.createdBy !== currentUser.id) {
        toast({title: "Permission Denied", description: "You can only delete questions you created.", variant: "destructive"});
        return;
    }
    setAllBankQuestions(prev => prev.filter(q => q.id !== questionId));
    const globalQIndex = sampleInterviewQuestions.findIndex(q => q.id === questionId);
    if (globalQIndex !== -1) sampleInterviewQuestions.splice(globalQIndex, 1);
    toast({ title: "Question Deleted", description: "Question removed from the bank.", variant: "destructive" });
  };
  
  const handleQuestionFormSubmit = (questionData: InterviewQuestion) => {
    if (editingQuestion) {
        const updatedQuestion = { ...editingQuestion, ...questionData };
        setAllBankQuestions(prev => prev.map(q => q.id === editingQuestion.id ? updatedQuestion : q));
        const globalQIndex = sampleInterviewQuestions.findIndex(q => q.id === editingQuestion.id);
        if (globalQIndex !== -1) sampleInterviewQuestions[globalQIndex] = updatedQuestion;
        toast({ title: "Question Updated" });
    } else {
        setAllBankQuestions(prev => [questionData, ...prev]);
        sampleInterviewQuestions.unshift(questionData);
        toast({ title: "Question Added" });
    }
    setIsQuestionFormOpen(false);
    setEditingQuestion(null);
  };
  
  const handleToggleBookmarkQuestion = (questionId: string) => {
    setAllBankQuestions(prevQs => prevQs.map(q => {
        if (q.id === questionId) {
            const currentBookmarks = q.bookmarkedBy || [];
            const userHasBookmarked = currentBookmarks.includes(currentUser.id);
            const newBookmarks = userHasBookmarked
                ? currentBookmarks.filter(id => id !== currentUser.id)
                : [...currentBookmarks, currentUser.id];
            return { ...q, bookmarkedBy: newBookmarks };
        }
        return q;
    }));
  };

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
