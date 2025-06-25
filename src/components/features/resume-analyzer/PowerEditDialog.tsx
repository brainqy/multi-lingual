
"use client";

import React, { useEffect, useState } from 'react';
import { identifyResumeIssues } from '@/ai/flows/identify-resume-issues';
import { rewriteResumeWithFixes } from '@/ai/flows/rewrite-resume-with-fixes';
import type { IdentifyResumeIssuesOutput } from '@/types';
import { DialogContent, DialogHeader, DialogTitle, DialogDescription as DialogUIDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Wand2, UserRoundCog, ListChecks, WandSparkles, FileCheck2, ClipboardCopy, Check, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

type PowerEditDialogProps = {
  resumeText: string;
  jobDescriptionText: string;
  onRewriteComplete: (newResume: string) => void;
};

type DialogState = 'identifying' | 'identified' | 'rewriting' | 'rewritten' | 'error';

export function PowerEditDialog({ resumeText, jobDescriptionText, onRewriteComplete }: PowerEditDialogProps) {
  const [dialogState, setDialogState] = useState<DialogState>('identifying');
  const [issues, setIssues] = useState<IdentifyResumeIssuesOutput | null>(null);
  const [editableResumeText, setEditableResumeText] = useState(resumeText);
  const [fixes, setFixes] = useState<string[]>([]);
  const [rewrittenResume, setRewrittenResume] = useState<string | null>(null);
  const [userInstructions, setUserInstructions] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const getIssues = async () => {
      setDialogState('identifying');
      setError(null);
      try {
        const result = await identifyResumeIssues({ resumeText, jobDescriptionText });
        setIssues(result);
        setDialogState('identified');
      } catch (e: any) {
        const errorMessage = (e.message || String(e)).toLowerCase();
        if (errorMessage.includes('quota') || errorMessage.includes('billing')) {
            toast({
                title: "API Usage Limit Exceeded",
                description: "You have exceeded your Gemini API usage limit. Please check your Google Cloud billing account.",
                variant: "destructive",
                duration: 9000,
            });
        }
        setError(e.message || 'Failed to identify issues.');
        setDialogState('error');
      }
    };
    getIssues();
  }, [resumeText, jobDescriptionText, toast]);

  const handleRewrite = async () => {
    setDialogState('rewriting');
    setError(null);

    try {
      const result = await rewriteResumeWithFixes({
        resumeText: editableResumeText,
        jobDescriptionText: jobDescriptionText,
        fixableByAi: issues?.fixableByAi || [],
        userInstructions: userInstructions,
      });
      setRewrittenResume(result.rewrittenResume);
      setFixes(result.fixesApplied);
      setDialogState('rewritten');
    } catch (e: any) {
      const errorMessage = (e.message || String(e)).toLowerCase();
      if (errorMessage.includes('quota') || errorMessage.includes('billing')) {
          toast({
              title: "API Usage Limit Exceeded",
              description: "You have exceeded your Gemini API usage limit. Please check your Google Cloud billing account.",
              variant: "destructive",
              duration: 9000,
          });
      }
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
  
  const handleAddSkill = (skill?: string) => {
    if (!skill) return;

    const currentText = editableResumeText;
    const skillsHeaderRegex = /(^\s*(skills|technical skills|proficiencies)[\s:]*\n)/im;
    const match = currentText.match(skillsHeaderRegex);

    if (currentText.toLowerCase().includes(skill.toLowerCase())) {
        toast({
            title: "Skill already present",
            description: `The skill "${skill}" seems to be in your resume already.`
        });
        return;
    }

    let newText;
    if (match && match.index !== undefined) {
        const header = match[0];
        const insertionPoint = match.index + header.length;
        newText = `${currentText.slice(0, insertionPoint)}- ${skill}\n${currentText.slice(insertionPoint)}`;
        toast({
            title: "Skill Added",
            description: `"${skill}" was added to your skills section. You can now edit it further if needed.`
        });
    } else {
        newText = `${currentText.trim()}\n\nSkills:\n- ${skill}\n`;
        toast({
            title: "Skill Added",
            description: `A new "Skills" section was created with "${skill}".`
        });
    }
    
    setEditableResumeText(newText);
  };

  const handleWriteSection = (sectionName?: string) => {
    if (!sectionName) return;
    const instruction = `Please write a new "${sectionName}" section for this resume, tailored for the job description.`;
    setUserInstructions(prev => prev ? `${prev}\n- ${instruction}` : `- ${instruction}`);
    toast({ title: "Instruction Added", description: `Added instruction to write the ${sectionName} section.`});
  };

  const handleAddInstruction = (instruction: string) => {
    setUserInstructions(prev => prev ? `${prev}\n- ${instruction}` : `- ${instruction}`);
    toast({
      title: "Instruction Added",
      description: "The instruction has been added for the AI to consider during the rewrite.",
    });
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
              {issues?.requiresUserInput && issues.requiresUserInput.length > 0 && (
                <Alert>
                  <UserRoundCog className="h-4 w-4" />
                  <AlertTitle>Action Required by You</AlertTitle>
                  <AlertDescription>
                    <p className="mb-2">Address these points by editing your resume below or providing instructions for the AI:</p>
                    <div className="space-y-3 mt-3">
                      {issues.requiresUserInput.map((issue, index) => (
                          <div key={`user-${index}`} className="flex items-center justify-between p-2 rounded-md bg-background border gap-2">
                              <p className="text-sm text-foreground flex-1">{issue.detail}</p>
                              {issue.type === 'missingSkill' && issue.suggestion && (
                                  <Button size="sm" variant="outline" onClick={() => handleAddSkill(issue.suggestion)}>
                                      <WandSparkles className="mr-2 h-4 w-4" />
                                      Add Skill
                                  </Button>
                              )}
                              {issue.type === 'missingSection' && issue.suggestion && (
                                <Button size="sm" variant="outline" onClick={() => handleWriteSection(issue.suggestion)}>
                                  <WandSparkles className="mr-2 h-4 w-4" />
                                  Write {issue.suggestion}
                                </Button>
                              )}
                               {['missingQuantification', 'unclearExperience', 'missingContactInfo', 'other'].includes(issue.type) && (
                                <Button size="sm" variant="outline" onClick={() => handleAddInstruction(issue.detail)}>
                                    <PlusCircle className="mr-2 h-4 w-4" />
                                    Add to Instructions
                                </Button>
                              )}
                          </div>
                      ))}
                    </div>
                  </AlertDescription>
                </Alert>
              )}
              {issues?.fixableByAi && issues.fixableByAi.length > 0 && (
                <Alert variant="default" className="bg-blue-50 border-blue-200">
                  <ListChecks className="h-4 w-4 text-primary" />
                  <AlertTitle>AI Will Automatically Fix:</AlertTitle>
                  <AlertDescription>
                    <ul className="list-disc list-inside text-sm font-normal">
                      {issues.fixableByAi.map((issue, index) => <li key={`fixable-${index}`}>{issue}</li>)}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2 pt-2 flex-grow flex flex-col">
                <Label htmlFor="editable-resume" className="shrink-0">Edit your resume below:</Label>
                <Textarea
                    id="editable-resume"
                    value={editableResumeText}
                    onChange={(e) => setEditableResumeText(e.target.value)}
                    className="flex-grow w-full h-full font-body text-sm"
                />
              </div>

              {/* New User Instructions Textarea */}
              <div className="space-y-2 pt-2">
                  <Label htmlFor="user-instructions">Additional Instructions for AI (Optional)</Label>
                  <Textarea
                      id="user-instructions"
                      value={userInstructions}
                      onChange={(e) => setUserInstructions(e.target.value)}
                      placeholder="e.g., 'Emphasize my project management skills more.' or 'Make the tone more suitable for a startup.'"
                      className="font-body text-sm"
                      rows={2}
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
          <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg flex-grow">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="mt-4 text-muted-foreground">Applying AI fixes...</p>
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
                      <div className="space-y-3 text-sm text-foreground">
                        {fixes.map((fix, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                            <span>{fix}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
            </div>
            <DialogFooter className="flex justify-end pt-4 gap-2 border-t mt-4 shrink-0">
              <DialogClose asChild>
                <Button variant="outline">Close</Button>
              </DialogClose>
              <Button onClick={handleUseAndReanalyze}>
                <Wand2 className="mr-2 h-4 w-4" />
                Use &amp; Re-analyze
              </Button>
            </DialogFooter>
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
          Review the AI's suggestions, make manual edits, and let the AI rewrite your resume to better match the job description.
        </DialogUIDescription>
      </DialogHeader>
      <div className="py-4 space-y-4 flex-grow flex flex-col min-h-0">
        {renderContent()}
      </div>
    </DialogContent>
  );
}
