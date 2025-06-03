"use client";

import type React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Sparkles, ListChecks, CheckCircle, AlertTriangle, RefreshCw, MessageSquare, Share2 } from 'lucide-react';
import type { MockInterviewSession, CommunityPost } from '@/types';
import ScoreCircle from '@/components/ui/score-circle';
import { useToast } from '@/hooks/use-toast';
import { sampleCommunityPosts, sampleUserProfile } from '@/lib/sample-data';

interface StepFeedbackProps {
  session: MockInterviewSession;
  onRestart: () => void;
}

export default function StepFeedback({ session, onRestart }: StepFeedbackProps) {
  const { toast } = useToast();
  const currentUser = sampleUserProfile;

  if (!session.overallFeedback) {
    return <p>Generating feedback... Please wait.</p>;
  }

  const handleShareToFeed = () => {
    if (!session.overallFeedback || session.overallScore === undefined) {
      toast({ title: "Error", description: "Interview data is not complete for sharing.", variant: "destructive" });
      return;
    }

    let postContent = `Just finished an AI Mock Interview for "${session.topic}"`;
    if (session.overallScore !== undefined) {
      postContent += ` with a score of ${session.overallScore}%! 🎉`;
    } else {
      postContent += `! 🎉`;
    }
    
    if (session.overallFeedback.keyStrengths && session.overallFeedback.keyStrengths.length > 0) {
        postContent += `\n\nKey Strength: "${session.overallFeedback.keyStrengths[0]}"`;
    } else if (session.overallFeedback.overallSummary) {
        postContent += `\n\nLearned a lot: "${session.overallFeedback.overallSummary.substring(0, 100)}${session.overallFeedback.overallSummary.length > 100 ? '...' : ''}"`;
    }

    postContent += `\n\n#AIMockInterview #CareerPrep #${session.topic.toLowerCase().replace(/\s+/g, '')}`;
    
    const newPost: CommunityPost = {
      id: `post-interview-${Date.now()}`,
      tenantId: currentUser.tenantId,
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.profilePictureUrl,
      timestamp: new Date().toISOString(),
      content: postContent,
      type: 'text',
      tags: ['AIMockInterview', 'CareerPrep', session.topic.toLowerCase().replace(/\s+/g, '')],
      moderationStatus: 'visible',
      flagCount: 0,
      comments: [],
    };

    // In a real app, this would be an API call to the backend.
    // For demo purposes, we're modifying the sample data directly.
    sampleCommunityPosts.unshift(newPost); // Adds to the beginning of the array

    toast({
      title: "Shared to Feed!",
      description: "Your mock interview achievement has been posted to the community feed.",
      duration: 5000,
    });
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="h-7 w-7 text-primary" /> Interview Feedback Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center gap-6 p-4 border rounded-lg bg-secondary/30">
             {session.overallScore !== undefined && (
                <ScoreCircle score={session.overallScore} size="xl" label="Overall Score" />
             )}
            <div className="flex-1">
              <h4 className="font-semibold text-lg text-foreground">Overall Performance:</h4>
              <p className="text-sm text-muted-foreground whitespace-pre-line">{session.overallFeedback.overallSummary}</p>
            </div>
          </div>

          {session.overallFeedback.keyStrengths && session.overallFeedback.keyStrengths.length > 0 && (
            <div>
              <h4 className="font-semibold text-md text-foreground mb-1 flex items-center gap-1"><CheckCircle className="h-5 w-5 text-green-500" />Key Strengths:</h4>
              <ul className="list-disc list-inside ml-4 space-y-1 text-sm text-muted-foreground">
                {session.overallFeedback.keyStrengths.map((strength: string, i: number) => <li key={i}>{strength}</li>)}
              </ul>
            </div>
          )}

          {session.overallFeedback.keyAreasForImprovement && session.overallFeedback.keyAreasForImprovement.length > 0 && (
             <div>
              <h4 className="font-semibold text-md text-foreground mb-1 flex items-center gap-1"><AlertTriangle className="h-5 w-5 text-yellow-500" />Key Areas for Improvement:</h4>
              <ul className="list-disc list-inside ml-4 space-y-1 text-sm text-muted-foreground">
                {session.overallFeedback.keyAreasForImprovement.map((area: string, i: number) => <li key={i}>{area}</li>)}
              </ul>
            </div>
          )}
          
          {session.overallFeedback.finalTips && session.overallFeedback.finalTips.length > 0 && (
             <div>
              <h4 className="font-semibold text-md text-foreground mb-1 flex items-center gap-1"><ListChecks className="h-5 w-5 text-blue-500" />Final Tips:</h4>
              <ul className="list-disc list-inside ml-4 space-y-1 text-sm text-muted-foreground">
                {session.overallFeedback.finalTips.map((tip: string, i: number) => <li key={i}>{tip}</li>)}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
             <MessageSquare className="h-6 w-6 text-primary" /> Detailed Question Feedback
          </CardTitle>
        </CardHeader>
        <CardContent>
          {session.answers.length > 0 ? (
            <Accordion type="single" collapsible className="w-full">
              {session.answers.map((answer, index) => (
                <AccordionItem value={`item-${index}`} key={answer.questionId}>
                  <AccordionTrigger className="hover:text-primary data-[state=open]:text-primary">
                    <div className="flex-1 text-left">
                        <span className="font-medium">Q{index + 1}: {answer.questionText.substring(0, 60)}...</span>
                        {answer.aiScore !== undefined && <span className="ml-2 text-xs px-2 py-0.5 bg-muted text-muted-foreground rounded-full">Score: {answer.aiScore}/100</span>}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-3 p-2">
                    <div>
                      <p className="font-semibold text-sm text-muted-foreground">Your Answer:</p>
                      <p className="text-sm bg-secondary/40 p-2 rounded whitespace-pre-line">{answer.userAnswer}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-muted-foreground">AI Feedback:</p>
                      <p className="text-sm bg-primary/10 p-2 rounded whitespace-pre-line">{answer.aiFeedback || "No specific feedback available."}</p>
                    </div>
                     {(answer as any).strengths && Array.isArray((answer as any).strengths) && (answer as any).strengths.length > 0 && (
                        <div>
                            <p className="font-semibold text-xs text-green-600">Strengths:</p>
                            <ul className="list-disc list-inside ml-4 text-xs text-muted-foreground">
                                {(answer as any).strengths.map((s: string, i: number) => <li key={`s-${i}`}>{s}</li>)}
                            </ul>
                        </div>
                    )}
                     {(answer as any).areasForImprovement && Array.isArray((answer as any).areasForImprovement) && (answer as any).areasForImprovement.length > 0 && (
                         <div>
                            <p className="font-semibold text-xs text-yellow-600">Areas for Improvement:</p>
                            <ul className="list-disc list-inside ml-4 text-xs text-muted-foreground">
                                {(answer as any).areasForImprovement.map((a: string, i: number) => <li key={`a-${i}`}>{a}</li>)}
                            </ul>
                        </div>
                    )}
                     {(answer as any).suggestedImprovements && Array.isArray((answer as any).suggestedImprovements) && (answer as any).suggestedImprovements.length > 0 && (
                         <div>
                            <p className="font-semibold text-xs text-blue-600">Suggestions:</p>
                            <ul className="list-disc list-inside ml-4 text-xs text-muted-foreground">
                                {(answer as any).suggestedImprovements.map((sugg: string, i: number) => <li key={`sugg-${i}`}>{sugg}</li>)}
                            </ul>
                        </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <p className="text-muted-foreground text-center py-4">No individual question feedback available for this session.</p>
          )}
        </CardContent>
      </Card>

      <div className="text-center mt-8 flex flex-col sm:flex-row justify-center items-center gap-4">
        <Button onClick={onRestart} size="lg" variant="outline">
          <RefreshCw className="mr-2 h-5 w-5" /> Start New Mock Interview
        </Button>
        <Button onClick={handleShareToFeed} size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <Share2 className="mr-2 h-5 w-5" /> Share to Feed
        </Button>
      </div>
    </div>
  );
}
