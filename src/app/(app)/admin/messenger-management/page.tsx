
"use client";
import { useI18n } from "@/hooks/use-i18n";
import type React from 'react';
import { useState, useMemo, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose, DialogDescription as DialogUIDescription } from "@/components/ui/dialog";
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
       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Surveys Deployed</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalSurveysDeployed}</p>
          </CardContent>
        </Card>
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Responses Received</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalResponses}</p>
          </CardContent>
        </Card>
      </div>

       <Card className="shadow-lg">
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle>Survey Definitions</CardTitle>
          <Button onClick={() => { resetSurveyCreationForm(); setIsCreateSurveyOpen(true); }}><PlusCircle className="mr-2 h-4 w-4"/> Create New Survey</Button>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="w-full sm:w-64 border rounded-md p-2">
                <h3 className="text-sm font-semibold mb-2 px-2">Available Surveys</h3>
                <ScrollArea className="h-48">
                    {surveyDefinitions.map(survey => (
                        <Button
                            key={survey.id}
                            variant={activeSurveyId === survey.id ? "secondary" : "ghost"}
                            className="w-full justify-start text-left h-auto py-2"
                            onClick={() => setActiveSurveyId(survey.id)}
                        >
                            {survey.name}
                        </Button>
                    ))}
                </ScrollArea>
            </div>
            <div className="flex-1">
                {surveyDefinitions.find(s => s.id === activeSurveyId) ? (
                    <Card>
                        <CardHeader>
                            <CardTitle>{surveyDefinitions.find(s => s.id === activeSurveyId)?.name}</CardTitle>
                            <CardDescription>{surveyDefinitions.find(s => s.id === activeSurveyId)?.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm">This survey is currently active and will be shown to users who have not completed it yet.</p>
                            {/* Further details or actions like 'deactivate' or 'edit' can go here */}
                        </CardContent>
                    </Card>
                ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">Select a survey to view its details.</div>
                )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Recent Survey Responses</CardTitle>
        </CardHeader>
        <CardContent>
          {surveyResponses.length === 0 ? (
            <p className="text-muted-foreground text-center">No survey responses yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Survey</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {surveyResponses.map(response => (
                  <TableRow key={response.id}>
                    <TableCell>{response.userName}</TableCell>
                    <TableCell>{response.surveyName || 'Unknown Survey'}</TableCell>
                    <TableCell>{format(new Date(response.responseDate), "PPP")}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" onClick={() => handleViewDetails(response)}><Eye className="mr-2 h-4 w-4"/> View Details</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

       <Dialog open={isResponseDetailOpen} onOpenChange={setIsResponseDetailOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Survey Response Details</DialogTitle>
            <DialogUIDescription>
              Response from {selectedResponse?.userName} for survey "{selectedResponse?.surveyName}".
            </DialogUIDescription>
          </DialogHeader>
          <ScrollArea className="max-h-96 p-4">
            <div className="space-y-2">
              {selectedResponse && Object.entries(selectedResponse.data).map(([key, value]) => (
                <div key={key}>
                  <p className="text-sm font-semibold">{key}</p>
                  <p className="text-sm text-muted-foreground p-2 bg-secondary rounded">{String(value)}</p>
                </div>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
      
      {/* Create Survey Dialog */}
      <Dialog open={isCreateSurveyOpen} onOpenChange={setIsCreateSurveyOpen}>
         <DialogContent className="sm:max-w-2xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Create New Survey ({surveyCreationDialogStep + 1}/2)</DialogTitle>
          </DialogHeader>
          {surveyCreationDialogStep === 0 ? (
            // Step 1: Basic Info
            <div className="space-y-4 py-4">
               <div><Label>Survey Name (Unique)</Label><Input value={newSurveyName} onChange={e => setNewSurveyName(e.target.value)} /></div>
               <div><Label>Description</Label><Textarea value={newSurveyDescription} onChange={e => setNewSurveyDescription(e.target.value)} /></div>
            </div>
          ) : (
            // Step 2: Build Steps
            <div className="grid grid-cols-2 gap-4 py-4">
                <div className="col-span-1 space-y-4">
                    <h3 className="font-semibold">Add New Step</h3>
                    <Select onValueChange={(val: SurveyStep['type']) => setCurrentStepTypeToAdd(val)}>
                      <SelectTrigger><SelectValue placeholder="Select step type"/></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="botMessage">Bot Message</SelectItem>
                        <SelectItem value="userInput">User Input</SelectItem>
                        <SelectItem value="userOptions">User Options (Buttons)</SelectItem>
                      </SelectContent>
                    </Select>
                    {currentStepTypeToAdd && (
                        <div className="p-3 border rounded-md space-y-2">
                           <Label>Step Configuration</Label>
                           <Input placeholder="Step ID (e.g., welcome_message)" value={currentStepConfig.id || ''} onChange={e => setCurrentStepConfig(p=>({...p, id: e.target.value}))}/>
                           <Textarea placeholder="Text to display to user" value={currentStepConfig.text || ''} onChange={e => setCurrentStepConfig(p=>({...p, text: e.target.value}))}/>
                           {currentStepTypeToAdd === 'userInput' && (<Input placeholder="Input placeholder" value={currentStepConfig.placeholder || ''} onChange={e => setCurrentStepConfig(p=>({...p, placeholder: e.target.value}))}/>)}
                           {currentStepTypeToAdd === 'userOptions' && currentStepOptions.map(opt => (
                               <div key={opt.tempId} className="flex gap-1 items-center border p-1">
                                   <Input placeholder="Option Text" value={opt.text} onChange={e => handleOptionChange(opt.tempId, 'text', e.target.value, 'options')}/>
                                   <Input placeholder="Value" value={opt.value} onChange={e => handleOptionChange(opt.tempId, 'value', e.target.value, 'options')}/>
                                   <Input placeholder="Next Step ID" value={opt.nextStepId} onChange={e => handleOptionChange(opt.tempId, 'nextStepId', e.target.value, 'options')}/>
                                   <Button size="icon" variant="ghost" onClick={()=>removeOptionField(opt.tempId, 'options')}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                               </div>
                           ))}
                           {currentStepTypeToAdd === 'userOptions' && <Button size="sm" variant="outline" onClick={() => addOptionField('options')}>Add Option</Button>}
                           <Input placeholder="Variable name to save response" value={currentStepConfig.variableName || ''} onChange={e => setCurrentStepConfig(p=>({...p, variableName: e.target.value}))}/>
                           <Input placeholder="Next Step ID" value={currentStepConfig.nextStepId || ''} onChange={e => setCurrentStepConfig(p=>({...p, nextStepId: e.target.value}))}/>
                           <div className="flex items-center space-x-2"><Checkbox checked={currentStepConfig.isLastStep} onCheckedChange={(checked) => setCurrentStepConfig(p=>({...p, isLastStep: !!checked}))}/><Label>Is Last Step?</Label></div>
                           <Button onClick={handleAddConfiguredStep}>Add Step to Survey</Button>
                        </div>
                    )}
                </div>
                <div className="col-span-1">
                    <h3 className="font-semibold">Current Survey Steps</h3>
                    <ScrollArea className="h-96 border rounded-md p-2">
                        <pre className="text-xs">{JSON.stringify(newSurveySteps, null, 2)}</pre>
                    </ScrollArea>
                </div>
            </div>
          )}
          <DialogFooter className="flex justify-between w-full">
            {surveyCreationDialogStep > 0 && <Button variant="outline" onClick={() => setSurveyCreationDialogStep(p=>p-1)}>Previous</Button>}
            <div className="flex-grow"></div>
            {surveyCreationDialogStep < 1 ? (
                <Button onClick={handleNextSurveyStep}>Next</Button>
            ) : (
                <Button onClick={handleCreateNewSurvey}>Create Survey</Button>
            )}
          </DialogFooter>
         </DialogContent>
      </Dialog>
    </div>
  );
}
