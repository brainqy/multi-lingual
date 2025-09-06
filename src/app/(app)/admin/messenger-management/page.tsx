
"use client";
import { useI18n } from "@/hooks/use-i18n";
import type React from 'react';
import { useState, useMemo, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BotMessageSquare, Eye, PlusCircle, Edit3, AlertTriangle, UserCheck, ListFilter, BarChart3, CheckSquare, Users, Info, FileText, ChevronLeft, ChevronRight, Trash2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Survey, SurveyResponse, SurveyStep, SurveyOption as SurveyOptionType } from "@/types";
import { format } from "date-fns";
import Link from "next/link";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import AccessDeniedMessage from "@/components/ui/AccessDeniedMessage";
import { useAuth } from "@/hooks/use-auth";
import { getSurveys, createSurvey, getSurveyResponses } from "@/lib/actions/surveys";


interface NewSurveyOption extends SurveyOptionType {
  tempId: string; 
}
interface NewSurveyStep extends Omit<SurveyStep, 'options' | 'dropdownOptions'> {
  options?: NewSurveyOption[];
  dropdownOptions?: { tempId: string; label: string; value: string }[];
}


export default function MessengerManagementPage() {
  const { user: currentUser, isLoading } = useAuth();
  const { toast } = useToast();
  const { t } = useI18n();

  const [surveyDefinitions, setSurveyDefinitions] = useState<Survey[]>([]);
  const [surveyResponses, setSurveyResponses] = useState<SurveyResponse[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);

  const [selectedResponse, setSelectedResponse] = useState<SurveyResponse | null>(null);
  const [isResponseDetailOpen, setIsResponseDetailOpen] = useState(false);
  const [isCreateSurveyOpen, setIsCreateSurveyOpen] = useState(false);
  
  const [activeSurveyId, setActiveSurveyId] = useState<string>('');
  
  const [surveyCreationDialogStep, setSurveyCreationDialogStep] = useState(0); 
  const [newSurveyName, setNewSurveyName] = useState('');
  const [newSurveyDescription, setNewSurveyDescription] = useState('');
  const [newSurveySteps, setNewSurveySteps] = useState<SurveyStep[]>([]);
  
  const [currentStepTypeToAdd, setCurrentStepTypeToAdd] = useState<SurveyStep['type'] | null>(null);
  const [currentStepConfig, setCurrentStepConfig] = useState<Partial<NewSurveyStep>>({});
  const [currentStepOptions, setCurrentStepOptions] = useState<NewSurveyOption[]>([]);
  const [currentStepDropdownOptions, setCurrentStepDropdownOptions] = useState<{tempId: string, label: string, value: string}[]>([]);
  
  const fetchData = useCallback(async () => {
    if (!currentUser) return;
    setIsDataLoading(true);
    const [surveys, responses] = await Promise.all([
      getSurveys(), 
      getSurveyResponses(),
    ]);

    setSurveyDefinitions(surveys);
    setSurveyResponses(responses);

    if (surveys.length > 0 && !activeSurveyId) {
      setActiveSurveyId(surveys[0].id);
    }
    setIsDataLoading(false);
  }, [currentUser, activeSurveyId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  if (isLoading || !currentUser) {
    return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin"/></div>;
  }

  if (currentUser.role !== 'admin' && currentUser.role !== 'manager') {
    return <AccessDeniedMessage />;
  }
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('changeActiveSurvey', { detail: activeSurveyId }));
    }
  }, [activeSurveyId]);

  const handleViewDetails = (response: SurveyResponse) => {
    setSelectedResponse(response);
    setIsResponseDetailOpen(true);
  };
  
  const resetSurveyCreationForm = () => {
    setNewSurveyName('');
    setNewSurveyDescription('');
    setNewSurveySteps([]);
    setSurveyCreationDialogStep(0);
    setCurrentStepTypeToAdd(null);
    setCurrentStepConfig({});
    setCurrentStepOptions([]);
    setCurrentStepDropdownOptions([]);
  };

  const handleCreateNewSurvey = async () => {
    if (!newSurveyName.trim()) {
        toast({ title: "Error", description: "Survey name cannot be empty.", variant: "destructive" });
        return;
    }
    if (newSurveySteps.length === 0) {
        toast({ title: "Error", description: "Survey must have at least one step.", variant: "destructive" });
        return;
    }
    const newSurveyData: Omit<Survey, 'id' | 'createdAt' | 'tenantId'> = { 
      name: newSurveyName, 
      description: newSurveyDescription, 
      steps: newSurveySteps,
    };
    
    const createdSurvey = await createSurvey(newSurveyData);
    if (createdSurvey) {
      setSurveyDefinitions(prev => [...prev, createdSurvey]);
      toast({ title: "Survey Created", description: `Survey "${newSurveyName}" has been added.` });
    } else {
      toast({ title: "Error", description: "Failed to create survey.", variant: "destructive" });
    }
    
    resetSurveyCreationForm();
    setIsCreateSurveyOpen(false);
  };
  
  const totalResponses = surveyResponses.length;
  const totalSurveysDeployed = surveyDefinitions.length;

  const handleAddConfiguredStep = () => {
    if (!currentStepTypeToAdd || !currentStepConfig.text?.trim()) {
        toast({ title: "Error", description: "Step text is required.", variant: "destructive" });
        return;
    }

    const stepToAdd: SurveyStep = {
        id: currentStepConfig.id || `step-${newSurveySteps.length + 1}`,
        type: currentStepTypeToAdd,
        text: currentStepConfig.text,
        placeholder: currentStepConfig.placeholder,
        inputType: currentStepConfig.inputType,
        variableName: currentStepConfig.variableName,
        nextStepId: currentStepConfig.nextStepId,
        isLastStep: currentStepConfig.isLastStep || false,
    };

    if (currentStepTypeToAdd === 'userOptions' && currentStepOptions.length > 0) {
      if (currentStepOptions.some(opt => !opt.text?.trim() || !opt.value?.trim())) {
        toast({title: "Error", description: "All options must have text and value.", variant: "destructive"});
        return;
      }
        stepToAdd.options = currentStepOptions.map(({tempId, ...rest}) => rest);
    } else if (currentStepTypeToAdd === 'userOptions' && currentStepOptions.length === 0) {
        toast({ title: "Error", description: "User Options step must have at least one option.", variant: "destructive"});
        return;
    }

    if (currentStepTypeToAdd === 'userDropdown' && currentStepDropdownOptions.length > 0) {
       if (currentStepDropdownOptions.some(opt => !opt.label?.trim() || !opt.value?.trim())) {
        toast({title: "Error", description: "All dropdown options must have a label and value.", variant: "destructive"});
        return;
      }
      stepToAdd.dropdownOptions = currentStepDropdownOptions.map(({tempId, ...rest}) => rest);
    } else if (currentStepTypeToAdd === 'userDropdown' && currentStepDropdownOptions.length === 0) {
       toast({ title: "Error", description: "User Dropdown step must have at least one option.", variant: "destructive"});
       return;
    }

    setNewSurveySteps(prev => [...prev, stepToAdd]);
    setCurrentStepTypeToAdd(null);
    setCurrentStepConfig({});
    setCurrentStepOptions([]);
    setCurrentStepDropdownOptions([]);
    toast({title: "Step Added", description: `Step "${currentStepConfig.text.substring(0,20)}..." added to survey.`});
  };

  const addOptionField = (type: 'options' | 'dropdownOptions') => {
    const newId = `opt-${Date.now()}`;
    if (type === 'options') {
      setCurrentStepOptions(prev => [...prev, { tempId: newId, text: '', value: '', nextStepId: '' }]);
    } else {
      setCurrentStepDropdownOptions(prev => [...prev, { tempId: newId, label: '', value: ''}]);
    }
  };
  
  const removeOptionField = (id: string, type: 'options' | 'dropdownOptions') => {
    if (type === 'options') {
      setCurrentStepOptions(prev => prev.filter(opt => opt.tempId !== id));
    } else {
      setCurrentStepDropdownOptions(prev => prev.filter(opt => opt.tempId !== id));
    }
  };

  const handleOptionChange = (id: string, field: keyof NewSurveyOption, value: string, type: 'options') => {
    setCurrentStepOptions(prev => prev.map(opt => opt.tempId === id ? { ...opt, [field]: value } : opt));
  };

  const handleDropdownOptionChange = (id: string, field: 'label' | 'value', value: string, type: 'dropdownOptions') => {
    setCurrentStepDropdownOptions(prev => prev.map(opt => opt.tempId === id ? { ...opt, [field]: value } : opt));
  };

  const handleNextSurveyStep = () => {
    if (surveyCreationDialogStep === 0) { 
        if (!newSurveyName.trim()) {
            toast({title: "Error", description: "Survey name is required to proceed.", variant: "destructive"});
            return;
        }
    }
    setSurveyCreationDialogStep(prev => prev + 1);
  };

  if (isDataLoading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin"/></div>
  }


  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
        <BotMessageSquare className="h-8 w-8" /> Messenger & Survey Management {currentUser.role === 'manager' && `(Tenant: ${currentUser.tenantId})`}
      </h1>
      <CardDescription>Oversee automated messenger interactions, manage surveys, and analyze user feedback.</CardDescription>
      {/* ... Other parts of the component remain the same ... */}
    </div>
  );
}
