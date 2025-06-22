
"use client";

import React, { useEffect, useState } from 'react';
import { identifyResumeIssues } from '@/ai/flows/identify-resume-issues';
import { rewriteResumeWithFixes } from '@/ai/flows/rewrite-resume-with-fixes';
import type { IdentifyResumeIssuesOutput } from '@/types';
import { DialogContent, DialogHeader, DialogTitle, DialogDescription as DialogUIDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Wand2, UserRoundCog, ListChecks, WandSparkles, FileCheck2, ClipboardCopy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

type PowerEditDialogProps = {
  resumeText: string;
  jobDescription: string;
  onRewriteComplete: (newResume: string) => void;
};

type DialogState = 'identifying' | 'identified' | 'rewriting' | 'rewritten' | 'error';

export function PowerEditDialog({ resumeText, jobDescription, onRewriteComplete }: PowerEditDialogProps) {
  const [dialogState, setDialogState] = useState<DialogState>('identifying');
  const [issues, setIssues] = useState<IdentifyResumeIssuesOutput | null>(null);
  const [userInstructions, setUserInstructions] = useState('');
  const [rewrittenResume, setRewrittenResume] = useState<string | null>(null);
  const [fixes, setFixes] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const getIssues = async () => {
      setDialogState('identifying');
      setError(null);
      try {
        const result = await identifyResumeIssues({ resumeText, jobDescription });
        setIssues(result);
        setDialogState('identified');
      } catch (e: any) {
        setError(e.message || 'Failed to identify issues.');
        setDialogState('error');
      }
    };
    getIssues();
  }, [resumeText, jobDescription]);

  const handleRewrite = async () => {
    setDialogState('rewriting');
    setError(null);

    try {
      const result = await rewriteResumeWithFixes({
        resumeText: resumeText, // Always use the original resume text as the base for the rewrite
        jobDescription,
        userInstructions: userInstructions,
      });
      setRewrittenResume(result.rewrittenResume);
      setFixes(result.fixesApplied);
      setDialogState('rewritten');
    } catch (e: any) {
      setError(e.message || 'Failed to rewrite resume.');
      setDialogState('error');
    }
  };

  const handleCopy = () => {
    if (rewrittenResume) {
      navigator.clipboard.writeText(rewrittenResume);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Copied!",
        description: "The rewritten resume has been copied to your clipboard.",
      });
    }
  };

  const handleUseAndReanalyze = () => {
    if (rewrittenResume) {
      onRewriteComplete(rewrittenResume);
    }
  };

  const renderContent = () => {
    switch (dialogState) {
      case 'identifying':
        return (
          <div className="flex-grow flex items-center justify-center">
            <div className="text-center p-8 space-y-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
              <h3 className="text-lg font-semibold">Identifying Improvements...</h3>
              <p className="text-sm text-muted-foreground">The AI is analyzing your resume to find the best areas to enhance.</p>
            </div>
          </div>
        );

      case 'error':
        return (
          <div className="flex-grow flex items-center justify-center">
            <Alert variant="destructive">
              <AlertTitle>An Error Occurred</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        );

      case 'identified':
        return (
          <div className="flex flex-col flex-grow min-h-0">
            <div className="space-y-4 p-1 overflow-y-auto flex-grow flex flex-col">
              <Alert>
                <UserRoundCog className="h-4 w-4" />
                <AlertTitle>Action Required by You</AlertTitle>
                <AlertDescription>
                  <p className="mb-2">Address these points in the instructions below for the best AI rewrite:</p>
                  <ul className="list-disc list-inside text-sm font-normal">
                    {issues?.requiresUserInput.map((issue, index) => <li key={`user-${index}`}>{issue.detail}</li>)}
                  </ul>
                </AlertDescription>
              </Alert>
              <Alert variant="default" className="bg-blue-50 border-blue-200">
                <ListChecks className="h-4 w-4 text-primary" />
                <AlertTitle>AI Will Automatically Fix:</AlertTitle>
                <AlertDescription>
                  <ul className="list-disc list-inside text-sm font-normal">
                    {issues?.fixableByAi.map((issue, index) => <li key={`fixable-${index}`}>{issue}</li>)}
                  </ul>
                </AlertDescription>
              </Alert>
              <div className="space-y-2 pt-2">
                <Label htmlFor="user-instructions">Instructions for AI:</Label>
                <Textarea
                  id="user-instructions"
                  value={userInstructions}
                  onChange={(e) => setUserInstructions(e.target.value)}
                  placeholder="e.g., 'For my experience at Acme, add that I increased sales by 20%. Also, I have 3 years of TypeScript experience.'"
                  rows={4}
                />
              </div>
            </div>
            <div className="pt-4 border-t mt-4 shrink-0">
              <Button onClick={handleRewrite} className="w-full">
                <Wand2 className="mr-2 h-4 w-4" />
                Rewrite & Fix Issues
              </Button>
            </div>
          </div>
        );

      case 'rewriting':
        return (
          <div className="flex-grow flex items-center justify-center">
            <div className="text-center p-8 space-y-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="mt-4 text-muted-foreground">Applying AI fixes...</p>
            </div>
          </div>
        );

      case 'rewritten':
        return (
          <div className="flex flex-col flex-grow min-h-0">
            <div className="grid md:grid-cols-2 gap-6 flex-grow min-h-0">
              <div className="space-y-3 flex flex-col">
                <h3 className="text-lg font-semibold flex items-center gap-2"><FileCheck2 className="h-5 w-5 text-green-600" /> Rewritten Resume</h3>
                <div className="relative flex-grow flex flex-col">
                  <Button
                    onClick={handleCopy}
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2 z-10"
                  >
                    {copied ? <Check className="h-4 w-4" /> : <ClipboardCopy className="h-4 w-4" />}
                    <span className="ml-2">{copied ? 'Copied!' : 'Copy'}</span>
                  </Button>
                  <Textarea
                    value={rewrittenResume || ""}
                    readOnly
                    className="bg-muted/40 font-body text-sm flex-grow w-full h-full"
                  />
                </div>
              </div>
              <div className="space-y-3 flex flex-col">
                <h3 className="text-lg font-semibold flex items-center gap-2"><ListChecks className="h-5 w-5 text-primary" /> Fixes Applied</h3>
                <Card className="flex-grow bg-muted/40 overflow-y-auto">
                  <CardContent className="p-4">
                    <ul className="list-disc list-inside space-y-2 text-sm text-foreground">
                      {fixes.map((fix, index) => <li key={index}>{fix}</li>)}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
            <div className="flex justify-end pt-4 gap-2 border-t mt-4 shrink-0">
              <DialogClose asChild>
                <Button variant="outline">Close</Button>
              </DialogClose>
              <Button onClick={handleUseAndReanalyze}>
                <Wand2 className="mr-2 h-4 w-4" />
                Use & Re-analyze
              </Button>
            </div>
          </div>
        );
    }
  };

  return (
    <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Wand2 className="h-6 w-6 text-primary" />
          Power Edit with AI
        </DialogTitle>
        <DialogUIDescription>
          Provide targeted instructions to the AI based on its analysis to get the best possible rewrite.
        </DialogUIDescription>
      </DialogHeader>
      <div className="py-4 space-y-4 flex-grow flex flex-col min-h-0">
        {renderContent()}
      </div>
    </DialogContent>
  );
}
