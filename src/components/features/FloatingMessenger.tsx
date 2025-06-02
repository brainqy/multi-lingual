

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
import type { SurveyStep, SurveyOption } from '@/types';
import { cn } from '@/lib/utils';
import { profileCompletionSurveyDefinition } from '@/lib/sample-data'; // Import the new survey


const initialFeedbackSurvey: SurveyStep[] = [
  { id: 'start', type: 'botMessage', text: 'Hi there! 👋 Welcome to ResumeMatch AI. We\'d love to hear your thoughts.', nextStepId: 'q_experience' },
  { id: 'q_experience', type: 'botMessage', text: 'How has your experience been using our platform so far?', nextStepId: 'ans_experience' },
  { id: 'ans_experience', type: 'userOptions', options: [
    { text: '🚀 Amazing!', value: 'amazing', nextStepId: 'feedback_positive' },
    { text: '😐 It\'s okay', value: 'okay', nextStepId: 'feedback_neutral' },
    { text: '😕 Needs improvement', value: 'needs_improvement', nextStepId: 'feedback_negative' },
  ]},
  { id: 'feedback_positive', type: 'botMessage', text: 'That\'s great to hear! What feature do you find most helpful?', nextStepId: 'input_positive_feature' },
  { id: 'input_positive_feature', type: 'userInput', placeholder: 'Type your favorite feature...', variableName: 'loved_feature', nextStepId: 'q_referral' },
  { id: 'feedback_neutral', type: 'botMessage', text: 'Thanks for the honesty. What\'s one thing we could improve to make it better for you?', nextStepId: 'input_neutral_feedback'},
  { id: 'input_neutral_feedback', type: 'userInput', placeholder: 'Tell us what to improve...', variableName: 'improvement_suggestion', nextStepId: 'q_referral' },
  { id: 'feedback_negative', type: 'botMessage', text: 'We\'re sorry to hear that. Could you please tell us more about what wasn\'t working or what you found frustrating?', nextStepId: 'input_negative_feedback'},
  { id: 'input_negative_feedback', type: 'userInput', placeholder: 'Describe your concerns...', variableName: 'frustration_details', nextStepId: 'q_referral' },
  { id: 'q_referral', type: 'botMessage', text: 'Thank you for sharing! One last thing: how likely are you to recommend ResumeMatch AI to a friend or colleague?', nextStepId: 'ans_referral_dropdown' },
  { id: 'ans_referral_dropdown', type: 'userDropdown', dropdownOptions: [
      { label: 'Very Likely', value: 'very_likely' },
      { label: 'Likely', value: 'likely' },
      { label: 'Neutral', value: 'neutral' },
      { label: 'Unlikely', value: 'unlikely' },
      { label: 'Very Unlikely', value: 'very_unlikely' },
    ], variableName: 'referral_likelihood', nextStepId: 'thank_you'
  },
  { id: 'thank_you', type: 'botMessage', text: 'Thank you for your valuable feedback! We appreciate you taking the time. Have a great day! 😊', isLastStep: true },
];


// A map of available survey definitions
const surveyDefinitions: Record<string, SurveyStep[]> = {
  initialFeedbackSurvey: initialFeedbackSurvey,
  profileCompletionSurvey: profileCompletionSurveyDefinition, // Add the new survey
};

// Default survey if no specific survey is chosen or found
const defaultSurveyId = 'initialFeedbackSurvey';


interface Message {
  id: string;
  type: 'bot' | 'user';
  content: React.ReactNode;
}

export default function FloatingMessenger() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSurveyId, setActiveSurveyId] = useState<string>(defaultSurveyId); // ID of the currently active survey
  const [currentStepId, setCurrentStepId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [surveyData, setSurveyData] = useState<Record<string, string>>({});
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageIdCounter = useRef(0);

  const currentSurveyDefinition = surveyDefinitions[activeSurveyId] || surveyDefinitions[defaultSurveyId];
  const currentSurveyStep = currentSurveyDefinition.find(step => step.id === currentStepId);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);
  
  // Effect to load and potentially start the survey when messenger opens or active survey changes
  useEffect(() => {
    if (isOpen) {
      const surveyToLoad = surveyDefinitions[activeSurveyId] || surveyDefinitions[defaultSurveyId];
      const firstStep = surveyToLoad[0];
      if (firstStep) {
        // Only reset and start if messages are empty (new session) or survey changed
        if (messages.length === 0 || (currentSurveyStep && currentSurveyStep.id !== firstStep.id && !currentSurveyDefinition.some(s => s.id === currentSurveyStep.id) )) {
          resetSurvey(activeSurveyId); 
        }
      } else {
        setCurrentStepId(null); // No steps in current survey
      }
    }
  }, [isOpen, activeSurveyId]); // Rerun if activeSurveyId changes


  const addMessage = (type: 'bot' | 'user', content: React.ReactNode) => {
    const newId = `${Date.now()}-${messageIdCounter.current++}`;
    setMessages(prev => [...prev, { id: newId, type, content }]);
  };
  
  const processStep = (step: SurveyStep | undefined) => {
    if (!step) {
      setCurrentStepId(null); 
      return;
    }

    if (step.type === 'botMessage') {
      if (step.text) addMessage('bot', step.text);
      if (step.isLastStep) {
        setCurrentStepId(null); 
        // TODO: Here you could submit `surveyData`
        console.log("Survey Completed. Data:", surveyData);
      } else if (step.nextStepId) {
        const nextStep = currentSurveyDefinition.find(s => s.id === step.nextStepId);
        if (nextStep && nextStep.type === 'botMessage') {
           processStep(nextStep); 
        } else {
           setCurrentStepId(step.nextStepId || null);
        }
      } else {
         setCurrentStepId(null); 
      }
    } else {
      if (step.text) { // Display question text for user input steps if provided
        addMessage('bot', step.text);
      }
      setCurrentStepId(step.id);
    }
  };


  const handleOptionSelect = (option: SurveyOption) => {
    addMessage('user', option.text);
    if (currentSurveyStep?.variableName) {
      setSurveyData(prev => ({ ...prev, [currentSurveyStep.variableName!]: option.value }));
    }
    const nextStep = currentSurveyDefinition.find(s => s.id === option.nextStepId);
    processStep(nextStep);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
  };
  
  const handleDropdownChange = (value: string) => {
    if (!currentSurveyStep || (currentSurveyStep.type !== 'userDropdown' && currentSurveyStep.type !== 'userOptions' )) return; 
    
    let selectedLabel = value; 
    if(currentSurveyStep.type === 'userDropdown' && currentSurveyStep.dropdownOptions) {
        selectedLabel = currentSurveyStep.dropdownOptions?.find(opt => opt.value === value)?.label || value;
    } else if (currentSurveyStep.type === 'userOptions' && currentSurveyStep.options) {
         selectedLabel = currentSurveyStep.options?.find(opt => opt.value === value)?.text || value;
    }

    addMessage('user', selectedLabel);
     if (currentSurveyStep.variableName) {
      setSurveyData(prev => ({ ...prev, [currentSurveyStep.variableName!]: value }));
    }
    const nextStep = currentSurveyDefinition.find(s => s.id === currentSurveyStep.nextStepId);
    processStep(nextStep);
  };

  const handleInputSubmit = () => {
    if (!inputValue.trim() || !currentSurveyStep) return;
    addMessage('user', inputValue);
    if (currentSurveyStep.variableName) {
      setSurveyData(prev => ({ ...prev, [currentSurveyStep.variableName!]: inputValue }));
    }
    setInputValue('');
    const nextStep = currentSurveyDefinition.find(s => s.id === currentSurveyStep.nextStepId);
    processStep(nextStep);
  };
  
  const resetSurvey = (surveyIdToLoad = defaultSurveyId) => {
    setMessages([]);
    setSurveyData({});
    setInputValue('');
    messageIdCounter.current = 0;
    
    const surveyToStart = surveyDefinitions[surveyIdToLoad] || surveyDefinitions[defaultSurveyId];
    setActiveSurveyId(surveyIdToLoad); // Set the active survey ID *before* processing the first step

    const firstStep = surveyToStart[0];

    if (firstStep) {
       setCurrentStepId(firstStep.id);
       if(firstStep.type === 'botMessage') {
         processStep(firstStep);
       } else if (firstStep.text) { 
         addMessage('bot', firstStep.text);
       }
    } else {
       setCurrentStepId(null); 
    }
  };

  // Effect to listen for admin-driven survey changes (simulated)
  useEffect(() => {
    const handleAdminSurveyChange = (event: Event) => {
        const customEvent = event as CustomEvent<string>;
        if (customEvent.detail && customEvent.detail !== activeSurveyId) {
            setIsOpen(true); // Open messenger if not already
            resetSurvey(customEvent.detail);
        }
    };
    window.addEventListener('changeActiveSurvey', handleAdminSurveyChange);
    return () => {
        window.removeEventListener('changeActiveSurvey', handleAdminSurveyChange);
    };
  }, [activeSurveyId]);


  if (!isOpen) {
    return (
      <Button
        className="fixed bottom-6 right-6 rounded-full w-14 h-14 shadow-lg z-50 bg-primary hover:bg-primary/90"
        size="icon"
        onClick={() => {
            setIsOpen(true);
        }}
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
              {activeSurveyId === 'profileCompletionSurvey' ? 'Profile Setup Assistant' : 'Feedback Assistant'}
            </CardTitle>
          </div>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-primary-foreground hover:bg-primary/80" onClick={() => setIsOpen(false)}>
            <X className="h-5 w-5" />
          </Button>
        </CardHeader>

        <CardContent className="p-0 flex-grow overflow-hidden">
           <ScrollArea className="h-[calc(450px-60px-70px)] p-3"> {/* Adjusted height */}
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
              <Textarea
                value={inputValue}
                onChange={handleInputChange}
                placeholder={currentSurveyStep.placeholder || "Type your response..."}
                rows={currentSurveyStep.inputType === 'textarea' ? 3 : 1}
                className={cn(
                    "flex-grow resize-none text-sm p-2 min-h-[40px]",
                    currentSurveyStep.inputType === 'textarea' ? 'max-h-[100px]' : 'max-h-[40px]'
                )}
                onKeyPress={(e) => { if (e.key === 'Enter' && !e.shiftKey && currentSurveyStep.inputType !== 'textarea') { e.preventDefault(); handleInputSubmit(); }}}
              />
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
                <Button variant="outline" size="sm" onClick={() => resetSurvey(activeSurveyId)} className="w-full">Restart Current Survey</Button>
                <Button size="sm" onClick={() => setIsOpen(false)} className="w-full bg-primary hover:bg-primary/90">Close</Button>
             </div>
           )}
        </CardFooter>
      </Card>
    </div>
  );
}

