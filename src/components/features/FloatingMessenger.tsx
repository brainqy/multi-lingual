
"use client";

import type React from 'react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bot, X, Send, ChevronRight } from 'lucide-react';
import type { SurveyStep, SurveyOption, UserProfile, Survey } from '@/types';
import { cn } from "@/lib/utils";
import { useAuth } from '@/hooks/use-auth';
import { getSurveyByName, getSurveyForUser, createSurveyResponse } from '@/lib/actions/surveys';
import { updateUser } from '@/lib/data-services/users';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  type: 'bot' | 'user';
  content: React.ReactNode;
}

const logger = {
  log: (message: string, ...args: any[]) => console.log(`[FloatingMessenger] ${message}`, ...args),
};

export default function FloatingMessenger() {
  logger.log('Component Render Start');
  const [isOpen, setIsOpen] = useState(false);
  logger.log('useState: isOpen', { isOpen });
  const [activeSurvey, setActiveSurvey] = useState<Survey | null>(null);
  logger.log('useState: activeSurvey', { activeSurvey });
  const [currentStepId, setCurrentStepId] = useState<string | null>(null);
  logger.log('useState: currentStepId', { currentStepId });
  const [messages, setMessages] = useState<Message[]>([]);
  logger.log('useState: messages', { messages });
  const [surveyData, setSurveyData] = useState<Record<string, string>>({});
  logger.log('useState: surveyData', { surveyData });
  const [inputValue, setInputValue] = useState('');
  logger.log('useState: inputValue', { inputValue });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  logger.log('useRef: messagesEndRef');
  const messageIdCounter = useRef(0);
  logger.log('useRef: messageIdCounter');
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  logger.log('useAuth', { user });
  const [isInitialized, setIsInitialized] = useState(false);
  logger.log('useState: isInitialized', { isInitialized });

  const currentSurveyStep = activeSurvey?.steps.find(step => step.id === currentStepId);
  logger.log('derivedState: currentSurveyStep', { currentSurveyStep });

  const scrollToBottom = () => {
    logger.log('scrollToBottom called');
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    logger.log('useEffect[messages] triggered');
    scrollToBottom();
  }, [messages]);

  const addMessage = useCallback((type: 'bot' | 'user', content: React.ReactNode) => {
    logger.log('addMessage called', { type, content });
    setMessages(prev => {
        logger.log('addMessage: updating messages state');
        const newId = `${Date.now()}-${messageIdCounter.current++}`;
        const newMessages = [...prev, { id: newId, type, content }];
        logger.log('addMessage: new messages array', { newMessages });
        return newMessages;
    });
  }, []);

  const processStep = useCallback(async (stepId: string | undefined | null) => {
    logger.log('processStep called', { stepId });
    if (!stepId) {
      logger.log('processStep: No stepId, ending survey flow.');
      setCurrentStepId(null);
      return;
    }
  
    const step = activeSurvey?.steps.find(s => s.id === stepId);
    logger.log('processStep: Found step definition', { step });
    if (!step) {
      logger.log('processStep: Step definition not found, ending survey flow.');
      setCurrentStepId(null);
      return;
    }
  
    if (step.text) {
      logger.log('processStep: Adding bot message to chat');
      addMessage('bot', step.text);
    }
  
    if (step.isLastStep) {
      logger.log('processStep: This is the last step.');
      if (user && activeSurvey) {
        logger.log('processStep: Creating survey response in DB', { userId: user.id, surveyName: activeSurvey.name, surveyData });
        await createSurveyResponse({
          userId: user.id,
          userName: user.name,
          surveyName: activeSurvey.name,
          data: surveyData,
        });
        logger.log('processStep: Survey response created.');

        if (activeSurvey.name === 'profileCompletionSurvey') {
            const profileUpdates: Partial<UserProfile> = {};
            if (surveyData.bio) profileUpdates.bio = surveyData.bio;
            if (surveyData.jobTitle) profileUpdates.currentJobTitle = surveyData.jobTitle;
            if (surveyData.company) profileUpdates.currentOrganization = surveyData.company;
            if (surveyData.yearsOfExperience) profileUpdates.yearsOfExperience = surveyData.yearsOfExperience;
            if (surveyData.linkedInProfile) profileUpdates.linkedInProfile = surveyData.linkedInProfile;
            if (surveyData.skills) profileUpdates.skills = surveyData.skills.split(',').map(s => s.trim());
            if (surveyData.careerInterests) profileUpdates.careerInterests = surveyData.careerInterests;

            if (Object.keys(profileUpdates).length > 0) {
                const updatedUser = await updateUser(user.id, profileUpdates);
                if (updatedUser) {
                    await refreshUser();
                    toast({
                        title: "Profile Updated!",
                        description: "Your profile information has been saved from the survey.",
                    });
                }
            }
        }
      }
      setCurrentStepId(null); // End of survey
      return;
    }
  
    if (step.type === 'botMessage' && step.nextStepId) {
      logger.log('processStep: Bot message, processing next step immediately', { nextStepId: step.nextStepId });
      // Use a small timeout to allow the current message to render first
      setTimeout(() => processStep(step.nextStepId), 50);
    } else {
      logger.log('processStep: User input required, setting current step and waiting.', { stepId: step.id });
      setCurrentStepId(step.id);
    }
  }, [activeSurvey, addMessage, user, surveyData, refreshUser, toast]);

  const resetSurvey = useCallback(async (surveyToLoad: Survey) => {
    logger.log('resetSurvey called', { surveyToLoad });
    setMessages([]);
    setSurveyData({});
    setInputValue('');
    messageIdCounter.current = 0;
    setActiveSurvey(surveyToLoad);
    
    if (surveyToLoad && surveyToLoad.steps) {
        const firstStep = surveyToLoad.steps[0];
        if (firstStep) {
            logger.log('resetSurvey: Processing first step', { firstStepId: firstStep.id });
            processStep(firstStep.id);
        } else {
            logger.log('resetSurvey: No first step found.');
            setCurrentStepId(null); 
        }
    } else {
        logger.log('resetSurvey: Survey has no steps.');
        setCurrentStepId(null);
    }
  }, [processStep]);

  const loadInitialSurvey = useCallback(async () => {
    logger.log('loadInitialSurvey called');
    if (user && !isInitialized) {
      logger.log('loadInitialSurvey: User found and not initialized yet. Fetching survey.');
      setIsInitialized(true);
      const survey = await getSurveyForUser(user.id);
      logger.log('loadInitialSurvey: Fetched survey for user', { survey });
      if (survey) {
        await resetSurvey(survey);
      } else {
        logger.log('loadInitialSurvey: No survey available for user.');
      }
    }
  }, [user, isInitialized, resetSurvey]);

  useEffect(() => {
    logger.log('useEffect[isOpen] triggered', { isOpen });
    if (isOpen) {
      loadInitialSurvey();
    } else {
      logger.log('useEffect[isOpen]: Chat closed, resetting initialized state.');
      setIsInitialized(false);
    }
  }, [isOpen, loadInitialSurvey]);

  const handleOptionSelect = (option: SurveyOption) => {
    logger.log('handleOptionSelect called', { option });
    addMessage('user', option.text);
    if (currentSurveyStep?.variableName) {
      logger.log('handleOptionSelect: Saving data to surveyData state', { variableName: currentSurveyStep.variableName, value: option.value });
      setSurveyData(prev => ({ ...prev, [currentSurveyStep.variableName!]: option.value }));
    }
    processStep(option.nextStepId);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    logger.log('handleInputChange called', { value: e.target.value });
    setInputValue(e.target.value);
  };
  
  const handleDropdownChange = (value: string) => {
    logger.log('handleDropdownChange called', { value });
    if (!currentSurveyStep || currentSurveyStep.type !== 'userDropdown') return;
    
    const selectedLabel = currentSurveyStep.dropdownOptions?.find(opt => opt.value === value)?.label || value;
    logger.log('handleDropdownChange: Found label for value', { selectedLabel });

    addMessage('user', selectedLabel);
    if (currentSurveyStep.variableName) {
      logger.log('handleDropdownChange: Saving data to surveyData state', { variableName: currentSurveyStep.variableName, value });
      setSurveyData(prev => ({ ...prev, [currentSurveyStep.variableName!]: value }));
    }
    processStep(currentSurveyStep.nextStepId);
  };

  const handleInputSubmit = () => {
    logger.log('handleInputSubmit called', { inputValue });
    if (!inputValue.trim() || !currentSurveyStep) return;
    addMessage('user', inputValue);
    if (currentSurveyStep.variableName) {
      logger.log('handleInputSubmit: Saving data to surveyData state', { variableName: currentSurveyStep.variableName, value: inputValue });
      setSurveyData(prev => ({ ...prev, [currentSurveyStep.variableName!]: inputValue }));
    }
    setInputValue('');
    processStep(currentSurveyStep.nextStepId);
  };
  
  const handleSkip = () => {
    if (!currentSurveyStep || !currentSurveyStep.nextStepId) return;
    addMessage('user', <em>(Skipped)</em>);
    processStep(currentSurveyStep.nextStepId);
  };

  useEffect(() => {
    const handleAdminSurveyChange = async (event: Event) => {
        const customEvent = event as CustomEvent<string>;
        logger.log('handleAdminSurveyChange: "changeActiveSurvey" event received', { detail: customEvent.detail });
        if (customEvent.detail && customEvent.detail !== activeSurvey?.name) {
            setIsOpen(true); 
            const surveyToLoad = await getSurveyByName(customEvent.detail);
            logger.log('handleAdminSurveyChange: Fetched survey by name', { surveyToLoad });
            if (surveyToLoad) {
              await resetSurvey(surveyToLoad);
            }
        }
    };
    logger.log('useEffect[]: Adding "changeActiveSurvey" event listener');
    window.addEventListener('changeActiveSurvey', handleAdminSurveyChange);
    return () => {
        logger.log('useEffect[] cleanup: Removing "changeActiveSurvey" event listener');
        window.removeEventListener('changeActiveSurvey', handleAdminSurveyChange);
    };
  }, [activeSurvey?.name, resetSurvey]);

  if (!isOpen) {
    logger.log('Render: Messenger is closed.');
    return (
      <Button
        className="fixed bottom-6 right-6 rounded-full w-14 h-14 shadow-lg z-50 bg-primary hover:bg-primary/90"
        size="icon"
        onClick={() => {
            logger.log('onClick: Opening messenger');
            setIsOpen(true);
        }}
      >
        <Bot className="h-7 w-7 text-primary-foreground" />
      </Button>
    );
  }

  logger.log('Render: Messenger is open.');
  return (
    <div className="fixed bottom-6 right-6 z-50">
       <Card className="w-80 h-[450px] shadow-xl flex flex-col bg-card text-card-foreground rounded-lg overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between p-3 bg-primary text-primary-foreground border-b border-primary/50">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            <CardTitle className="text-md font-semibold">
              Assistant
            </CardTitle>
          </div>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-primary-foreground hover:bg-primary/80" onClick={() => {
              logger.log('onClick: Closing messenger');
              setIsOpen(false);
          }}>
            <X className="h-5 w-5" />
          </Button>
        </CardHeader>

        <CardContent className="p-0 flex-grow overflow-hidden">
           <ScrollArea className="h-[calc(450px-60px-70px)] p-3">
            <div className="space-y-3">
              {messages.map((msg) => (
                <div key={msg.id} className={cn("flex", msg.type === 'user' ? 'justify-end' : 'justify-start')}>
                  <div className={cn(
                      "max-w-[85%] p-2.5 rounded-lg text-sm shadow",
                      msg.type === 'user' ? 'bg-primary text-primary-foreground rounded-br-none' : 'bg-secondary text-secondary-foreground rounded-bl-none'
                  )}>
                    {msg.content}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        </CardContent>

        <CardFooter className="p-2 border-t border-border min-h-[70px]">
          {currentSurveyStep && currentSurveyStep.type === 'userOptions' && currentSurveyStep.options && (
            <div className="flex flex-col space-y-1.5 w-full">
              {currentSurveyStep.options.map(option => (
                <Button key={option.value} variant="outline" size="sm" className="w-full justify-start text-sm" onClick={() => handleOptionSelect(option)}>
                  {option.text}
                </Button>
              ))}
            </div>
          )}
          {currentSurveyStep && currentSurveyStep.type === 'userInput' && (
            <div className="flex items-center w-full gap-1.5">
              {currentSurveyStep.inputType === 'textarea' ? (
                <Textarea
                  value={inputValue}
                  onChange={handleInputChange}
                  placeholder={currentSurveyStep.placeholder || "Type your response..."}
                  rows={3}
                  className="flex-grow resize-none text-sm p-2"
                />
              ) : (
                <Input
                  value={inputValue}
                  onChange={handleInputChange}
                  type={currentSurveyStep.inputType || 'text'}
                  placeholder={currentSurveyStep.placeholder || "Type your response..."}
                  className="flex-grow text-sm h-10"
                  onKeyPress={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleInputSubmit(); }}}
                />
              )}
              <div className="flex flex-col gap-1">
                <Button size="icon" onClick={handleInputSubmit} disabled={!inputValue.trim()} className="h-9 w-9 shrink-0">
                  <Send className="h-4 w-4" />
                </Button>
                {currentSurveyStep.nextStepId && !currentSurveyStep.isLastStep && (
                    <Button size="icon" variant="ghost" onClick={handleSkip} className="h-6 w-9 text-xs text-muted-foreground p-0">
                        Skip
                    </Button>
                )}
              </div>
            </div>
          )}
          {currentSurveyStep && currentSurveyStep.type === 'userDropdown' && currentSurveyStep.dropdownOptions && (
              <div className="flex w-full items-center gap-2">
                <Select onValueChange={handleDropdownChange}>
                  <SelectTrigger className="w-full text-sm">
                    <SelectValue placeholder="Select an option" />
                  </SelectTrigger>
                  <SelectContent>
                    {currentSurveyStep.dropdownOptions.map(opt => (
                      <SelectItem key={opt.value} value={opt.value} className="text-sm">{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {currentSurveyStep.nextStepId && !currentSurveyStep.isLastStep && (
                    <Button size="sm" variant="ghost" onClick={handleSkip} className="text-xs text-muted-foreground p-1">
                        Skip
                    </Button>
                )}
              </div>
          )}
           {!currentSurveyStep && messages.length > 0 && activeSurvey && ( 
             <div className="flex flex-col items-center w-full space-y-2">
                <Button variant="outline" size="sm" onClick={async () => {
                    logger.log('onClick: Restarting survey');
                    if (activeSurvey) {
                      await resetSurvey(activeSurvey);
                    }
                }} className="w-full">Restart Current Survey</Button>
                <Button size="sm" onClick={() => setIsOpen(false)} className="w-full bg-primary hover:bg-primary/90">Close</Button>
             </div>
           )}
        </CardFooter>
      </Card>
    </div>
  );
}
