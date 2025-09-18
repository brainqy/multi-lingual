
"use client";
import { useI18n } from "@/hooks/use-i18n";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Video, Settings, Users, Send, ListChecks, AlertTriangle, Info, Loader2 } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import type { LiveInterviewSession, MockInterviewQuestion, UserProfile } from '@/types';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuth } from "@/hooks/use-auth";
import { getInterviewQuestions } from "@/lib/actions/questions";
import { createLiveInterviewSession } from "@/lib/actions/live-interviews";


export default function NewLiveInterviewPage() {
  const [title, setTitle] = useState('');
  const [participantEmails, setParticipantEmails] = useState('');
  const [questionIdsInput, setQuestionIdsInput] = useState(''); 
  const { toast } = useToast();
  const router = useRouter(); 
  const { user: currentUser, isLoading } = useAuth();
  const [allQuestions, setAllQuestions] = useState<MockInterviewQuestion[]>([]);

  useEffect(() => {
    async function loadQuestions() {
      const questions = await getInterviewQuestions();
      setAllQuestions(questions);
    }
    loadQuestions();
  }, []);


  const handleSubmit = async () => {
    if (!currentUser) {
        toast({ title: "Not Authenticated", description: "You must be logged in to create a session.", variant: "destructive" });
        return;
    }
    if (!title.trim()) {
      toast({ title: "Title Required", description: "Please enter an interview title.", variant: "destructive" });
      return;
    }
    const emails = participantEmails.split(',').map(e => e.trim()).filter(e => e);
    if (emails.length === 0) {
      toast({ title: "Participants Required", description: "Please add at least one participant email.", variant: "destructive" });
      return;
    }

    const preSelectedQuestions: MockInterviewQuestion[] = questionIdsInput
        .split(',')
        .map(id => id.trim())
        .filter(id => id)
        .map(id => {
            const questionFromBank = allQuestions.find(q => q.id === id);
            if (questionFromBank) {
                return { 
                    id: questionFromBank.id, 
                    questionText: questionFromBank.questionText, 
                    category: questionFromBank.category, 
                    difficulty: questionFromBank.difficulty,
                    baseScore: 10 
                };
            }
            return null; 
        })
        .filter(q => q !== null) as MockInterviewQuestion[];


    const newSessionData: Omit<LiveInterviewSession, 'id'> = {
      tenantId: currentUser.tenantId, 
      title: title,
      participants: [
        { userId: currentUser.id, name: currentUser.name, role: "interviewer" as "interviewer", profilePictureUrl: currentUser.profilePictureUrl },
        ...emails.map((email, index) => ({
            userId: `participant-temp-${index}-${Date.now()}`,
            name: email.split('@')[0] || `Participant ${index + 1}`, 
            role: "candidate" as "candidate",
            profilePictureUrl: `https://avatar.vercel.sh/${email}.png`
        }))
      ],
      scheduledTime: new Date().toISOString(),
      status: 'Scheduled',
      preSelectedQuestions: preSelectedQuestions,
    };

    const newSession = await createLiveInterviewSession(newSessionData);

    if (newSession) {
        toast({
        title: "Live Interview Session Created!",
        description: `Session "${title}" has been set up.`,
        duration: 5000,
        });
        router.push(`/live-interview/${newSession.id}`); 
    } else {
        toast({ title: "Error", description: "Failed to create live interview session.", variant: "destructive" });
    }
  }; 
  
  if (isLoading) {
    return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary"/></div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Video className="h-8 w-8" /> Start New Live Interview
        </h1>
        <Button variant="outline" asChild>
            <Link href="/interview-prep">Back to Prep Hub</Link>
        </Button>
      </div>
      
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Setup Your Interview Session</CardTitle>
          <CardDescription>
            Define the details for your upcoming live interview.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert variant="default" className="bg-blue-50 border-blue-200 text-blue-700">
            <Info className="h-4 w-4 !text-blue-700"/>
            <AlertTitle>Full Feature Under Development</AlertTitle>
            <AlertDescription>
              This setup is for demonstration. Real-time video and full collaboration features require backend integration.
            </AlertDescription>
          </Alert>
          <div>
            <Label htmlFor="interview-title">Interview Title / Purpose</Label>
            <Input 
              id="interview-title" 
              placeholder="e.g., Frontend Developer - Round 1" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
             <Label htmlFor="participants">Participant Emails (comma-separated)</Label>
            <Textarea 
              id="participants" 
              placeholder="e.g., candidate@example.com, colleague@example.com" 
              rows={2} 
              value={participantEmails}
              onChange={(e) => setParticipantEmails(e.target.value)}
            />
          </div>
           <div>
             <Label htmlFor="question-ids" className="flex items-center gap-1">
                <ListChecks className="h-4 w-4"/> Question IDs (comma-separated)
             </Label>
            <Textarea 
              id="question-ids" 
              placeholder="e.g., iq1, mcq2, coding1 (Copy IDs from Interview Prep Hub > Question Bank)" 
              rows={3} 
              value={questionIdsInput}
              onChange={(e) => setQuestionIdsInput(e.target.value)}
            />
             <p className="text-xs text-muted-foreground mt-1">
                Visit the <Link href="/interview-prep#question-bank" className="text-primary hover:underline">Question Bank</Link> on the Interview Prep Hub page to find and copy question IDs.
             </p>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSubmit} className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <Send className="mr-2 h-4 w-4" /> Create & Start Session
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
    
