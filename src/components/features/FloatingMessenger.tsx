
"use client";

import type React from 'react';
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bot, X, Send } from 'lucide-react';
import type { SurveyStep, SurveyOption, UserProfile } from '@/types';
import { cn } from "@/lib/utils";
import { useAuth } from '@/hooks/use-auth';
import { getSurveyByName, getSurveyForUser, createSurveyResponse } from '@/lib/actions/surveys';

interface Message {
  id: string;
  type: 'bot' | 'user';
  content: React.ReactNode;
}

export default function FloatingMessenger() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSurveyName, setActiveSurveyName] = useState<string>('');
  const [currentSurveyDefinition, setCurrentSurveyDefinition] = useState<SurveyStep[]>([]);
  const [currentStepId, setCurrentStepId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [surveyData, setSurveyData] = useState<Record<string, string>>({});
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageIdCounter = useRef(0);
  const { user } = useAuth();

  const currentSurveyStep = currentSurveyDefinition.find(step => step.id === currentStepId);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);
  
  useEffect(() => {
    const loadInitialSurvey = async () => {
        if (isOpen && user && messages.length === 0) {
            const survey = await getSurveyForUser(user.id);
            if (survey) {
                resetSurvey(survey.name);
            }
        }
    };
    loadInitialSurvey();
  }, [isOpen, user, messages.length]);


  const addMessage = (type: 'bot' | 'user', content: React.ReactNode, batch: Message[] = []): Message[] => {
    const newId = `${Date.now()}-${messageIdCounter.current++}`;
    batch.push({ id: newId, type, content });
    return batch;
  };
  
  const processStep = (stepId: string | undefined | null) => {
    if (!stepId) {
      setCurrentStepId(null);
      return;
    }

    let nextStep: SurveyStep | undefined = currentSurveyDefinition.find(s => s.id === stepId);
    let messageBatch: Message[] = [];

    // Loop through consecutive bot messages to batch them
    while (nextStep && nextStep.type === 'botMessage') {
      if (nextStep.text) {
        messageBatch = addMessage('bot', nextStep.text, messageBatch);
      }
      if (nextStep.isLastStep) {
        setCurrentStepId(null);
        if (user && activeSurveyName) {
          createSurveyResponse({
            userId: user.id,
            userName: user.name,
            surveyId: activeSurveyName,
            surveyName: activeSurveyName,
            data: surveyData,
          });
        }
        nextStep = undefined; // End the loop
      } else {
        const nextStepId = nextStep.nextStepId;
        nextStep = nextStepId ? currentSurveyDefinition.find(s => s.id === nextStepId) : undefined;
      }
    }

    // Add all batched bot messages to state at once
    if (messageBatch.length > 0) {
      setMessages(prev => [...prev, ...messageBatch]);
    }

    // If the loop ended on a user input step, set it as the current step
    if (nextStep && nextStep.type !== 'botMessage') {
      if (nextStep.text) {
        // This is the prompt for the user input, so add it.
        setMessages(prev => [...prev, ...addMessage('bot', nextStep.text)]);
      }
      setCurrentStepId(nextStep.id);
    } else if (!nextStep) {
      // Loop ended because there are no more steps
      setCurrentStepId(null);
    }
  };


  const handleOptionSelect = (option: SurveyOption) => {
    addMessage('user', option.text);
    if (currentSurveyStep?.variableName) {
      setSurveyData(prev => ({ ...prev, [currentSurveyStep.variableName!]: option.value }));
    }
    processStep(option.nextStepId);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
  };
  
  const handleDropdownChange = (value: string) => {
    if (!currentSurveyStep || currentSurveyStep.type !== 'userDropdown') return;
    
    const selectedLabel = currentSurveyStep.dropdownOptions?.find(opt => opt.value === value)?.label || value;

    addMessage('user', selectedLabel);
     if (currentSurveyStep.variableName) {
      setSurveyData(prev => ({ ...prev, [currentSurveyStep.variableName!]: value }));
    }
    processStep(currentSurveyStep.nextStepId);
  };

  const handleInputSubmit = () => {
    if (!inputValue.trim() || !currentSurveyStep) return;
    addMessage('user', inputValue);
    if (currentSurveyStep.variableName) {
      setSurveyData(prev => ({ ...prev, [currentSurveyStep.variableName!]: inputValue }));
    }
    setInputValue('');
    processStep(currentSurveyStep.nextStepId);
  };
  
  const resetSurvey = async (surveyNameToLoad: string) => {
    setMessages([]);
    setSurveyData({});
    setInputValue('');
    messageIdCounter.current = 0;
    setActiveSurveyName(surveyNameToLoad);
    
    const surveyToStart = await getSurveyByName(surveyNameToLoad);
    
    if (surveyToStart && surveyToStart.steps) {
        setCurrentSurveyDefinition(surveyToStart.steps);
        const firstStep = surveyToStart.steps[0];
        if (firstStep) {
            processStep(firstStep.id);
        } else {
            setCurrentStepId(null); 
        }
    } else {
        setCurrentSurveyDefinition([]);
        setCurrentStepId(null);
    }
  };

  useEffect(() => {
    const handleAdminSurveyChange = (event: Event) => {
        const customEvent = event as CustomEvent<string>;
        if (customEvent.detail && customEvent.detail !== activeSurveyName) {
            setIsOpen(true); 
            resetSurvey(customEvent.detail);
        }
    };
    window.addEventListener('changeActiveSurvey', handleAdminSurveyChange);
    return () => {
        window.removeEventListener('changeActiveSurvey', handleAdminSurveyChange);
    };
  }, [activeSurveyName]);


  if (!isOpen) {
    return (
      <Button
        className="fixed bottom-6 right-6 rounded-full w-14 h-14 shadow-lg z-50 bg-primary hover:bg-primary/90"
        size="icon"
        onClick={() => setIsOpen(true)}
      >
        <Bot className="h-7 w-7 text-primary-foreground" />
      </Button>
    );
  }

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
          <Button variant="ghost" size="icon" className="h-7 w-7 text-primary-foreground hover:bg-primary/80" onClick={() => setIsOpen(false)}>
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
              <Button size="icon" onClick={handleInputSubmit} disabled={!inputValue.trim()} className="h-9 w-9 shrink-0 self-end">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          )}
          {currentSurveyStep && currentSurveyStep.type === 'userDropdown' && currentSurveyStep.dropdownOptions && (
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
          )}
           {!currentSurveyStep && messages.length > 0 && ( 
             <div className="flex flex-col items-center w-full space-y-2">
                <Button variant="outline" size="sm" onClick={() => resetSurvey(activeSurveyName)} className="w-full">Restart Current Survey</Button>
                <Button size="sm" onClick={() => setIsOpen(false)} className="w-full bg-primary hover:bg-primary/90">Close</Button>
             </div>
           )}
        </CardFooter>
      </Card>
    </div>
  );
}
