
"use client";
import { useI18n } from "@/hooks/use-i18n";
import type React from 'react';
import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BotMessageSquare, Eye, PlusCircle, Edit3, AlertTriangle, UserCheck, ListFilter, BarChart3, CheckSquare, Users, Info, FileText, ChevronLeft, ChevronRight, Trash2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { SurveyResponse, SurveyStep, SurveyOption as SurveyOptionType } from "@/types";
import { sampleSurveyResponses, profileCompletionSurveyDefinition } from "@/lib/sample-data";
import { format } from "date-fns";
import Link from "next/link";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import AccessDeniedMessage from "@/components/ui/AccessDeniedMessage";
import { useAuth } from "@/hooks/use-auth";

interface SurveyDefinitionListItem {
  id: string;
  name: string;
  description?: string;
  steps?: SurveyStep[];
  tenantId?: string; // For scoping surveys
}

const initialSurveyDefinitions: SurveyDefinitionListItem[] = [
    { id: 'initialFeedbackSurvey', name: 'Initial User Feedback', description: 'Gather first impressions from users.', steps: [] /* Loaded by FloatingMessenger */, tenantId: 'platform' },
    { id: 'profileCompletionSurvey', name: 'Profile Completion Survey', description: 'Guide users to complete their profile.', steps: profileCompletionSurveyDefinition, tenantId: 'platform' },
];

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

  const [surveyDefinitionsState, setSurveyDefinitionsState] = useState<SurveyDefinitionListItem[]>([]);
  const [surveyResponses, setSurveyResponses] = useState<SurveyResponse[]>([]);

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
  
  useEffect(() => {
    if (currentUser) {
      const filteredDefs = currentUser.role === 'admin' 
        ? initialSurveyDefinitions 
        : initialSurveyDefinitions.filter(s => s.tenantId === 'platform' || s.tenantId === currentUser.tenantId);
      setSurveyDefinitionsState(filteredDefs);
      if (filteredDefs.length > 0) {
        setActiveSurveyId(filteredDefs[0].id);
      }
      
      const filteredResponses = currentUser.role === 'admin'
        ? sampleSurveyResponses
        : sampleSurveyResponses.filter(sr => filteredDefs.some(sds => sds.id === sr.surveyId));
      setSurveyResponses(filteredResponses);
    }
  }, [currentUser]);

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

  const handleCreateNewSurvey = () => {
    if (!newSurveyName.trim()) {
        toast({ title: "Error", description: "Survey name cannot be empty.", variant: "destructive" });
        return;
    }
    if (newSurveySteps.length === 0) {
        toast({ title: "Error", description: "Survey must have at least one step.", variant: "destructive" });
        return;
    }
    const newSurvey: SurveyDefinitionListItem = { 
      id: `survey-${Date.now()}`, 
      name: newSurveyName, 
      description: newSurveyDescription, 
      steps: newSurveySteps,
      tenantId: currentUser.role === 'manager' ? currentUser.tenantId : 'platform', // Scope to tenant if manager creates
    };
    
    initialSurveyDefinitions.push(newSurvey); // Add to global sample data
    setSurveyDefinitionsState(prev => [...prev, newSurvey]);
    toast({ title: "Survey Created", description: `Survey "${newSurveyName}" has been added.` });
    
    resetSurveyCreationForm();
    setIsCreateSurveyOpen(false);
  };
  
  const incompleteProfileUsers = useMemo(() => {
    return surveyResponses
        .filter(sr => sr.surveyId === 'initialFeedbackSurvey' && sr.data.experience === 'needs_improvement') 
        .map(sr => ({ id: sr.userId, name: sr.userName, reason: "Indicated 'Needs Improvement' in feedback" }))
        .slice(0, 5); 
  }, [surveyResponses]);

  const totalResponses = surveyResponses.length;
  const totalSurveysDeployed = surveyDefinitionsState.length;
  const usersFlaggedForIncompleteProfile = incompleteProfileUsers.length;
  const positiveFeedbackCount = surveyResponses.filter(sr => sr.surveyId === 'initialFeedbackSurvey' && sr.data.experience === 'amazing').length;

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


  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
        <BotMessageSquare className="h-8 w-8" /> Messenger & Survey Management {currentUser.role === 'manager' && `(Tenant: ${currentUser.tenantId})`}
      </h1>
      <CardDescription>Oversee automated messenger interactions, manage surveys, and analyze user feedback.</CardDescription>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Responses</CardTitle>
                <CheckSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{totalResponses}</div>
                <p className="text-xs text-muted-foreground">Across {currentUser.role === 'manager' ? 'tenant' : 'all'} surveys</p>
            </CardContent>
        </Card>
        <Card className="shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Surveys Available</CardTitle>
                <ListFilter className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{totalSurveysDeployed}</div>
                <p className="text-xs text-muted-foreground">{currentUser.role === 'manager' ? 'Tenant & Platform' : 'Platform-wide'}</p>
            </CardContent>
        </Card>
         <Card className="shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Positive Feedback (Initial)</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{positiveFeedbackCount}</div>
                <p className="text-xs text-muted-foreground">Reported 'amazing' experience</p>
            </CardContent>
        </Card>
        <Card className="shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Profile Nudges (Initial)</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{usersFlaggedForIncompleteProfile}</div>
                <p className="text-xs text-muted-foreground">Based on 'needs improvement'</p>
            </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="shadow-lg lg:col-span-1">
          <CardHeader>
            <CardTitle>Survey Configuration</CardTitle>
            <CardDescription>Manage and deploy surveys via the floating messenger.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="active-survey">Active Survey for Floating Messenger</Label>
              <Select value={activeSurveyId} onValueChange={setActiveSurveyId}>
                <SelectTrigger id="active-survey">
                  <SelectValue placeholder="Select a survey to activate" />
                </SelectTrigger>
                <SelectContent>
                  {surveyDefinitionsState.map(survey => (
                    <SelectItem key={survey.id} value={survey.id}>{survey.name} {survey.tenantId && survey.tenantId !== 'platform' ? `(Tenant: ${survey.tenantId.substring(0,6)}...)` : '(Platform)'}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">The selected survey will be presented by the floating messenger.</p>
            </div>
            <Dialog open={isCreateSurveyOpen} onOpenChange={(isOpen) => { if (!isOpen) resetSurveyCreationForm(); setIsCreateSurveyOpen(isOpen); }}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full">
                  <PlusCircle className="mr-2 h-4 w-4" /> Create New Survey
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="text-xl">Create New Survey (Step {surveyCreationDialogStep + 1} of 2)</DialogTitle>
                  <CardDescription>Define a new survey with its steps.</CardDescription>
                </DialogHeader>
                <ScrollArea className="max-h-[70vh] p-1">
                  <div className="space-y-4 py-4 pr-4">
                    {surveyCreationDialogStep === 0 && ( 
                      <>
                        <div>
                          <Label htmlFor="new-survey-name">Survey Name <span className="text-destructive">*</span></Label>
                          <Input id="new-survey-name" value={newSurveyName} onChange={(e) => setNewSurveyName(e.target.value)} />
                        </div>
                        <div>
                          <Label htmlFor="new-survey-desc">Survey Description (Optional)</Label>
                          <Textarea id="new-survey-desc" value={newSurveyDescription} onChange={(e) => setNewSurveyDescription(e.target.value)} />
                        </div>
                      </>
                    )}
                    {surveyCreationDialogStep === 1 && ( 
                      <>
                        <div className="border-t pt-4 mt-4">
                          <h3 className="text-lg font-medium mb-2">Define Survey Steps</h3>
                          <div className="flex flex-wrap gap-2 mb-4">
                            {(['botMessage', 'userInput', 'userOptions', 'userDropdown'] as SurveyStep['type'][]).map(type => (
                              <Button key={type} type="button" variant="outline" size="sm" onClick={() => { setCurrentStepTypeToAdd(type); setCurrentStepConfig({id: `step-${newSurveySteps.length+1}`})}}>
                                Add {type.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                              </Button>
                            ))}
                          </div>

                          {currentStepTypeToAdd && (
                            <Card className="p-4 space-y-3 mb-4 bg-secondary/50">
                              <h4 className="font-semibold">Configure: {currentStepTypeToAdd.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</h4>
                              <Input placeholder="Step ID (auto)" value={currentStepConfig.id || ''} onChange={e => setCurrentStepConfig(p => ({...p, id: e.target.value}))} disabled/>
                              <Textarea placeholder="Step Text / Question *" value={currentStepConfig.text || ''} onChange={e => setCurrentStepConfig(p => ({...p, text: e.target.value}))} />
                              {currentStepTypeToAdd === 'userInput' && (
                                <>
                                  <Input placeholder="Placeholder for input" value={currentStepConfig.placeholder || ''} onChange={e => setCurrentStepConfig(p => ({...p, placeholder: e.target.value}))} />
                                  <Select value={currentStepConfig.inputType || 'text'} onValueChange={val => setCurrentStepConfig(p => ({...p, inputType: val as any}))}>
                                    <SelectTrigger><SelectValue placeholder="Input Type" /></SelectTrigger>
                                    <SelectContent>
                                        {['text', 'textarea', 'email', 'tel', 'url', 'date'].map(it => <SelectItem key={it} value={it}>{it}</SelectItem>)}
                                    </SelectContent>
                                  </Select>
                                </>
                              )}
                              {(currentStepTypeToAdd === 'userInput' || currentStepTypeToAdd === 'userOptions' || currentStepTypeToAdd === 'userDropdown') && (
                                <Input placeholder="Variable Name (for storing answer)" value={currentStepConfig.variableName || ''} onChange={e => setCurrentStepConfig(p => ({...p, variableName: e.target.value}))} />
                              )}
                              {currentStepTypeToAdd === 'userOptions' && (
                                  <div className="space-y-2">
                                      <Label>Options:</Label>
                                      {currentStepOptions.map((opt, idx) => (
                                          <div key={opt.tempId} className="flex items-center gap-2 p-2 border rounded">
                                              <Input placeholder={`Option ${idx+1} Text`} value={opt.text} onChange={e => handleOptionChange(opt.tempId, 'text', e.target.value, 'options')} className="flex-1"/>
                                              <Input placeholder="Value" value={opt.value} onChange={e => handleOptionChange(opt.tempId, 'value', e.target.value, 'options')} className="w-24"/>
                                              <Input placeholder="Next Step ID" value={opt.nextStepId || ''} onChange={e => handleOptionChange(opt.tempId, 'nextStepId', e.target.value, 'options')} className="w-28"/>
                                              <Button type="button" variant="ghost" size="icon" onClick={() => removeOptionField(opt.tempId, 'options')}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                                          </div>
                                      ))}
                                      <Button type="button" variant="outline" size="sm" onClick={() => addOptionField('options')}>Add Option</Button>
                                  </div>
                              )}
                              {currentStepTypeToAdd === 'userDropdown' && (
                                 <div className="space-y-2">
                                      <Label>Dropdown Options:</Label>
                                      {currentStepDropdownOptions.map((opt, idx) => (
                                          <div key={opt.tempId} className="flex items-center gap-2 p-2 border rounded">
                                              <Input placeholder={`Option ${idx+1} Label`} value={opt.label} onChange={e => handleDropdownOptionChange(opt.tempId, 'label', e.target.value, 'dropdownOptions')} className="flex-1"/>
                                              <Input placeholder="Value" value={opt.value} onChange={e => handleDropdownOptionChange(opt.tempId, 'value', e.target.value, 'dropdownOptions')} className="w-24"/>
                                               <Button type="button" variant="ghost" size="icon" onClick={() => removeOptionField(opt.tempId, 'dropdownOptions')}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                                          </div>
                                      ))}
                                      <Button type="button" variant="outline" size="sm" onClick={() => addOptionField('dropdownOptions')}>Add Dropdown Option</Button>
                                  </div>
                              )}
                              <Input placeholder="Next Step ID (if no options/default)" value={currentStepConfig.nextStepId || ''} onChange={e => setCurrentStepConfig(p => ({...p, nextStepId: e.target.value}))} />
                              <div className="flex items-center space-x-2">
                                <Checkbox id="isLastStep" checked={currentStepConfig.isLastStep} onCheckedChange={checked => setCurrentStepConfig(p => ({...p, isLastStep: Boolean(checked)}))} />
                                <Label htmlFor="isLastStep">Is this the last step?</Label>
                              </div>
                              <Button type="button" onClick={handleAddConfiguredStep} className="w-full">Add This Step to Survey</Button>
                            </Card>
                          )}

                          {newSurveySteps.length > 0 && (
                            <div className="mt-4 space-y-2">
                                <h4 className="font-medium">Current Survey Steps:</h4>
                                {newSurveySteps.map((step, index) => (
                                    <Card key={index} className="p-3 text-xs bg-card">
                                        <p><strong>ID:</strong> {step.id}, <strong>Type:</strong> {step.type}</p>
                                        <p className="truncate"><strong>Text:</strong> {step.text?.substring(0,70)}...</p>
                                        {step.options && <p>Options: {step.options.length}</p>}
                                        {step.dropdownOptions && <p>Dropdown Options: {step.dropdownOptions.length}</p>}
                                        <p>Next: {step.nextStepId || (step.isLastStep ? 'END' : 'N/A')}</p>
                                    </Card>
                                ))}
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </ScrollArea>
                <DialogFooter className="mt-4">
                  {surveyCreationDialogStep > 0 && (
                    <Button type="button" variant="outline" onClick={() => setSurveyCreationDialogStep(prev => prev - 1)}>
                      <ChevronLeft className="mr-1 h-4 w-4" /> Previous
                    </Button>
                  )}
                  {surveyCreationDialogStep < 1 ? (
                    <Button type="button" onClick={handleNextSurveyStep}>
                      Next <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  ) : (
                    <Button onClick={handleCreateNewSurvey}>Create Survey</Button>
                  )}
                  <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
        
        <Card className="shadow-lg lg:col-span-2">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><ListFilter className="h-5 w-5"/>Profile Completion Insights (Conceptual)</CardTitle>
                <CardDescription>Analysis of responses from the 'Profile Completion Survey' would go here. (Currently shows mock data based on initial feedback survey).</CardDescription>
            </CardHeader>
            <CardContent>
                {incompleteProfileUsers.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">No users flagged from *initial* surveys for incomplete profiles.</p>
                ) : (
                    <ul className="space-y-2">
                        {incompleteProfileUsers.map(user => (
                            <li key={user.id} className="flex justify-between items-center p-2 border rounded-md">
                                <div>
                                    <p className="font-medium">{user.name} <span className="text-xs text-muted-foreground">({user.id})</span></p>
                                    <p className="text-xs text-muted-foreground">Reason: {user.reason} (from initial feedback)</p>
                                </div>
                                <Button variant="outline" size="sm" asChild>
                                    <Link href={`/admin/user-management?userId=${user.id}`}>View User</Link>
                                </Button>
                            </li>
                        ))}
                    </ul>
                )}
                 <p className="text-sm text-muted-foreground mt-4">Further development needed to process and display insights from the detailed 'Profile Completion Survey'.</p>
            </CardContent>
        </Card>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Survey Responses</CardTitle>
          <CardDescription>Collected feedback from users via the floating messenger.</CardDescription>
        </CardHeader>
        <CardContent>
          {surveyResponses.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No survey responses yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Survey Name</TableHead>
                  <TableHead>Response Date</TableHead>
                  <TableHead>Key Feedback</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {surveyResponses.map((response) => (
                  <TableRow key={response.id}>
                    <TableCell className="font-medium">{response.userName} <span className="text-xs text-muted-foreground">({response.userId})</span></TableCell>
                    <TableCell>{surveyDefinitionsState.find(sds => sds.id === response.surveyId)?.name || response.surveyName}</TableCell>
                    <TableCell>{format(new Date(response.responseDate), 'PPp')}</TableCell>
                    <TableCell className="max-w-xs truncate">
                      {Object.entries(response.data)
                             .map(([key, value]) => `${key.replace(/_/g, ' ')}: ${value}`)
                             .slice(0,2) 
                             .join('; ') || 'N/A'}...
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" onClick={() => handleViewDetails(response)}>
                        <Eye className="h-4 w-4 mr-1 sm:mr-2" /> <span className="hidden sm:inline">View Details</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isResponseDetailOpen} onOpenChange={setIsResponseDetailOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Survey Response Details</DialogTitle>
            {selectedResponse && (
              <CardDescription>
                From: {selectedResponse.userName} ({selectedResponse.userId}) <br/>
                Survey: {surveyDefinitionsState.find(sds => sds.id === selectedResponse.surveyId)?.name || selectedResponse.surveyName} <br/>
                Date: {format(new Date(selectedResponse.responseDate), 'PPp')}
              </CardDescription>
            )}
          </DialogHeader>
          {selectedResponse && (
            <div className="py-4 max-h-[60vh] overflow-y-auto">
              <pre className="bg-secondary p-3 rounded-md text-sm whitespace-pre-wrap">
                {JSON.stringify(selectedResponse.data, null, 2)}
              </pre>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsResponseDetailOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
