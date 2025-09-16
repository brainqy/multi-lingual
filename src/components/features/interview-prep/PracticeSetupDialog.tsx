
"use client";

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogDescription } from "@/components/ui/dialog";
import { useToast } from '@/hooks/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { PracticeSessionConfig, DialogStep, InterviewQuestionCategory, LiveInterviewSession, UserProfile } from '@/types';
import { ALL_CATEGORIES, PREDEFINED_INTERVIEW_TOPICS } from '@/types';
import { ChevronLeft, ChevronRight, Timer } from 'lucide-react';
import PracticeTopicSelection from './PracticeTopicSelection';
import PracticeDateTimeSelector from './PracticeDateTimeSelector';
import { useAuth } from '@/hooks/use-auth';
import { createLiveInterviewSession } from '@/lib/actions/live-interviews';

const friendEmailSchema = z.string().email("Please enter a valid email address.");

interface PracticeSetupDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSessionBooked: (sessionConfig: PracticeSessionConfig) => void;
}

export default function PracticeSetupDialog({ isOpen, onClose, onSessionBooked }: PracticeSetupDialogProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const [dialogStep, setDialogStep] = useState<DialogStep>('selectType');
  const [practiceSessionConfig, setPracticeSessionConfig] = useState<PracticeSessionConfig>({
    type: null,
    interviewCategory: undefined,
    topics: [],
    dateTime: null,
    friendEmail: '',
    aiTopicOrRole: '',
    aiJobDescription: '',
    aiNumQuestions: 5,
    aiDifficulty: 'medium',
    aiTimerPerQuestion: 0,
    aiQuestionCategories: [],
  });
  const [friendEmailError, setFriendEmailError] = useState<string | null>(null);

  const handleDialogNextStep = async () => {
    if (dialogStep === 'selectType') {
      if (!practiceSessionConfig.type) {
        toast({ title: "Error", description: "Please select an interview type.", variant: "destructive" });
        return;
      }
      if (practiceSessionConfig.type === 'friends') {
        const emailValidation = friendEmailSchema.safeParse(practiceSessionConfig.friendEmail);
        if (!emailValidation.success) { 
          setFriendEmailError(emailValidation.error.errors[0].message); 
          return; 
        }
        setFriendEmailError(null);
      }
      setDialogStep('selectTopics');
    } else if (dialogStep === 'selectTopics') {
      if (practiceSessionConfig.topics.length === 0) {
        toast({ title: "Error", description: "Please select at least one topic.", variant: "destructive" });
        return;
      }
      if (practiceSessionConfig.type === 'ai') {
        setPracticeSessionConfig(prev => ({...prev, aiTopicOrRole: prev.topics.join(', ')}));
        setDialogStep('aiSetupBasic');
      } else { // 'experts' or 'friends'
        setDialogStep('selectInterviewCategory');
      }
    } else if (dialogStep === 'selectInterviewCategory') {
      if (!practiceSessionConfig.interviewCategory) { 
          toast({ title: "Error", description: "Please select an interview category.", variant: "destructive" });
          return;
      }
      setDialogStep('selectTimeSlot');
    } else if (dialogStep === 'aiSetupBasic') {
      if (!practiceSessionConfig.aiTopicOrRole?.trim()) {
          toast({ title: "Error", description: "Please specify the AI interview topic/role.", variant: "destructive" });
          return;
      }
      setDialogStep('aiSetupAdvanced');
    } else if (dialogStep === 'aiSetupAdvanced') {
      setDialogStep('aiSetupCategories');
    }
  };

  const handleDialogPreviousStep = () => {
    if (dialogStep === 'selectTimeSlot') setDialogStep('selectInterviewCategory');
    else if (dialogStep === 'selectInterviewCategory') setDialogStep('selectTopics');
    else if (dialogStep === 'selectTopics') setDialogStep('selectType');
    else if (dialogStep === 'aiSetupCategories') setDialogStep('aiSetupAdvanced');
    else if (dialogStep === 'aiSetupAdvanced') setDialogStep('aiSetupBasic');
    else if (dialogStep === 'aiSetupBasic') {
        if (practiceSessionConfig.type === 'ai' && practiceSessionConfig.topics.length > 0) {
            setDialogStep('selectTopics');
        } else {
            setDialogStep('selectType');
        }
    }
  };

  const handleFinalBookSession = () => {
    onSessionBooked(practiceSessionConfig);
    onClose();
  };

  const handleCategorySelectionChange = (category: InterviewQuestionCategory) => {
    setPracticeSessionConfig(prev => ({ ...prev, interviewCategory: category }));
  };

  const handleTopicSelectionChange = (newTopics: string[]) => {
    setPracticeSessionConfig(prev => ({ ...prev, topics: newTopics }));
  };

  const handleDateTimeChange = (date: Date | undefined, time: string | undefined) => {
    if (date && time) {
        const [hourStr, minuteStr] = time.match(/\d+/g) || ['0', '0'];
        const isPM = time.includes('PM');
        let hour = parseInt(hourStr, 10);
        if (isPM && hour !== 12) hour += 12;
        if (!isPM && hour === 12) hour = 0;
        const finalDate = new Date(date);
        finalDate.setHours(hour, parseInt(minuteStr, 10), 0, 0);
        setPracticeSessionConfig(prev => ({...prev, dateTime: finalDate}));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Schedule New Practice Session</DialogTitle>
          <DialogDescription>
            {
              dialogStep === 'selectType' ? "Choose the type of mock interview you want to practice." :
              dialogStep === 'selectTopics' ? "First, select the high-level topics you want to cover." :
              dialogStep === 'selectInterviewCategory' ? "Now, choose the type of questions for your expert session." :
              dialogStep === 'selectTimeSlot' ? "Pick a date and time for your session." :
              "Configure your AI-powered mock interview."
            }
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          {dialogStep === 'selectType' && (
            <div className="space-y-4">
              <Button variant={practiceSessionConfig.type === 'ai' ? 'default' : 'outline'} className="w-full justify-start h-auto p-4 text-left" onClick={() => setPracticeSessionConfig(prev => ({ ...prev, type: 'ai', interviewCategory: undefined, topics: [] }))}>
                <div><p className="font-semibold">Practice with AI</p><p className="text-xs text-muted-foreground">Get instant feedback from our AI interviewer.</p></div>
              </Button>
              <Button variant={practiceSessionConfig.type === 'experts' ? 'default' : 'outline'} className="w-full justify-start h-auto p-4 text-left" onClick={() => setPracticeSessionConfig(prev => ({ ...prev, type: 'experts', interviewCategory: undefined, topics: [] }))}>
                <div><p className="font-semibold">Practice with Experts</p><p className="text-xs text-muted-foreground">Schedule a session with an industry expert.</p></div>
              </Button>
              <Button variant={practiceSessionConfig.type === 'friends' ? 'default' : 'outline'} className="w-full justify-start h-auto p-4 text-left" onClick={() => setPracticeSessionConfig(prev => ({ ...prev, type: 'friends' }))}>
                <div><p className="font-semibold">Practice with Friends</p><p className="text-xs text-muted-foreground">Invite a friend to conduct a mock interview.</p></div>
              </Button>
              {practiceSessionConfig.type === 'friends' && (
                <div className="p-4 border rounded-md bg-secondary/50">
                  <Label htmlFor="friend-email">Friend's Email Address</Label>
                  <Input id="friend-email" type="email" placeholder="friend@example.com" value={practiceSessionConfig.friendEmail} onChange={e => { setPracticeSessionConfig(p => ({...p, friendEmail: e.target.value})); setFriendEmailError(null); }} />
                  {friendEmailError && <p className="text-sm text-destructive mt-1">{friendEmailError}</p>}
                </div>
              )}
            </div>
          )}
          
          {dialogStep === 'selectTopics' && (
            <PracticeTopicSelection
              availableTopics={PREDEFINED_INTERVIEW_TOPICS}
              initialSelectedTopics={practiceSessionConfig.topics}
              onSelectionChange={handleTopicSelectionChange}
              description={practiceSessionConfig.type === 'experts' ? "Select a specific topic for your expert session." : "Select topics for your session."}
            />
          )}

          {dialogStep === 'selectInterviewCategory' && (practiceSessionConfig.type === 'experts' || practiceSessionConfig.type === 'friends') && (
             <PracticeTopicSelection
              availableTopics={ALL_CATEGORIES}
              initialSelectedTopics={practiceSessionConfig.interviewCategory ? [practiceSessionConfig.interviewCategory] : []}
              onSelectionChange={(selection) => handleCategorySelectionChange(selection[0] as InterviewQuestionCategory)}
              isSingleSelection={true}
              description={`Select the question category for your "${practiceSessionConfig.topics.join(', ')}" session.`}
            />
          )}

          {dialogStep === 'selectTimeSlot' && (
            <PracticeDateTimeSelector
              onDateTimeChange={handleDateTimeChange}
            />
          )}
          
          {dialogStep === 'aiSetupBasic' && (
             <div className="space-y-4">
               <div>
                  <Label htmlFor="ai-topic">Interview Topic / Role *</Label>
                  <Input id="ai-topic" value={practiceSessionConfig.aiTopicOrRole} onChange={e => setPracticeSessionConfig(p => ({...p, aiTopicOrRole: e.target.value}))} />
                </div>
                <div>
                  <Label htmlFor="ai-jobDescription">Job Description (Optional)</Label>
                  <Textarea id="ai-jobDescription" value={practiceSessionConfig.aiJobDescription} onChange={e => setPracticeSessionConfig(p => ({...p, aiJobDescription: e.target.value}))} rows={4} />
                </div>
             </div>
          )}
          {dialogStep === 'aiSetupAdvanced' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="ai-numQuestions">Number of Questions (1-50)</Label>
                  <Input id="ai-numQuestions" type="number" min="1" max="50" value={practiceSessionConfig.aiNumQuestions} onChange={e => setPracticeSessionConfig(p => ({...p, aiNumQuestions: parseInt(e.target.value, 10)}))} />
                </div>
                <div>
                  <Label htmlFor="ai-difficulty">Difficulty Level</Label>
                  <Select value={practiceSessionConfig.aiDifficulty} onValueChange={val => setPracticeSessionConfig(p => ({...p, aiDifficulty: val as any}))}>
                    <SelectTrigger><SelectValue/></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                 <div className="md:col-span-2">
                  <Label htmlFor="ai-timer" className="flex items-center gap-1"><Timer className="h-4 w-4" /> Time per Question</Label>
                   <Select value={String(practiceSessionConfig.aiTimerPerQuestion)} onValueChange={val => setPracticeSessionConfig(p => ({...p, aiTimerPerQuestion: parseInt(val, 10)}))}>
                    <SelectTrigger><SelectValue/></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="0">No Timer</SelectItem>
                        <SelectItem value="60">1 minute</SelectItem>
                        <SelectItem value="120">2 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
            </div>
          )}
           {dialogStep === 'aiSetupCategories' && (
             <div>
                <Label className="mb-2 block">Question Categories (Optional)</Label>
                <div className="grid grid-cols-2 gap-2 p-2 border rounded-md">
                    {ALL_CATEGORIES.map(cat => (
                        <div key={cat} className="flex items-center space-x-2">
                            <Checkbox 
                                id={`cat-${cat}`} 
                                checked={practiceSessionConfig.aiQuestionCategories?.includes(cat)}
                                onCheckedChange={checked => {
                                    const current = practiceSessionConfig.aiQuestionCategories || [];
                                    const newCats = checked ? [...current, cat] : current.filter(c => c !== cat);
                                    setPracticeSessionConfig(p => ({...p, aiQuestionCategories: newCats}));
                                }}
                            />
                            <Label htmlFor={`cat-${cat}`} className="text-sm font-normal">{cat}</Label>
                        </div>
                    ))}
                </div>
             </div>
          )}

        </div>
        <DialogFooter className="flex justify-between w-full">
          {dialogStep !== 'selectType' && (
            <Button variant="outline" onClick={handleDialogPreviousStep}><ChevronLeft className="mr-2 h-4 w-4" /> Previous</Button>
          )}
          <div className="flex-grow"></div>
          {dialogStep !== 'selectTimeSlot' && dialogStep !== 'aiSetupCategories' ? (
            <Button onClick={handleDialogNextStep}>Next <ChevronRight className="ml-2 h-4 w-4" /></Button>
          ) : (
            <Button onClick={handleFinalBookSession}>Book Session</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
