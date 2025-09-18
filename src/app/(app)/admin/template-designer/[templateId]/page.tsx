
"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Save, Eye, Settings, PlusCircle, TextCursorInput, Loader2, GripVertical, Award, BookCheck, Languages as LanguagesIcon, Heart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { ResumeTemplate, ResumeBuilderData, UserProfile } from '@/types';
import { getResumeTemplates, updateResumeTemplate, createResumeTemplate } from '@/lib/actions/templates';
import ResumePreview from '@/components/features/resume-builder/ResumePreview';
import { getInitialResumeData } from '@/lib/resume-builder-helpers';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DndContext, closestCenter, type DragEndEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { useAuth } from '@/hooks/use-auth';
import { Slider } from '@/components/ui/slider';
import TemplateSelectionDialog from '@/components/features/resume-builder/TemplateSelectionDialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import Handlebars from 'handlebars';

const sampleUserData: UserProfile = {
  id: 'sample-user',
  name: 'Alex Doe',
  email: 'alex.doe@example.com',
  tenantId: 'platform',
  role: 'user',
  currentJobTitle: 'Senior Product Manager',
  currentOrganization: 'Innovate Inc.',
  skills: ['Product Strategy', 'Agile Methodologies', 'User Research', 'Data Analysis'],
  bio: 'A visionary Product Manager with over 8 years of experience driving product development from concept to launch.',
  graduationYear: '2015',
  degreeProgram: 'B.Sc',
  department: 'Computer Science',
  university: 'Tech University',
};


const defaultSectionOrder = ['summary', 'experience', 'education', 'skills'];

export default function TemplateEditorPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const templateId = params.templateId as string;
  const isNewTemplate = templateId === 'new';
  const resumePreviewRef = useRef<HTMLDivElement>(null);

  const [allTemplates, setAllTemplates] = useState<ResumeTemplate[]>([]);
  const [resumeData, setResumeData] = useState<ResumeBuilderData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(70);
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);

  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateDescription, setNewTemplateDescription] = useState('');

  const processTemplate = useCallback((templateContent: string, userData: UserProfile) => {
    try {
        const template = Handlebars.compile(templateContent);
        const initialData = getInitialResumeData(userData);
        const hydratedJsonString = template(initialData);
        const parsedData = JSON.parse(hydratedJsonString);
        if (!parsedData.sectionOrder) {
            parsedData.sectionOrder = defaultSectionOrder;
        }
        return parsedData;
    } catch (error) {
        console.error("Error processing Handlebars template:", error);
        toast({ title: "Template Error", description: "Could not process the template content.", variant: "destructive" });
        return getInitialResumeData(userData);
    }
  }, [toast]);

  const loadData = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    const templates = await getResumeTemplates();
    setAllTemplates(templates);

    if (isNewTemplate) {
      const defaultTemplate = templates.find(t => t.id === 'template2') || templates[0];
      if (defaultTemplate) {
        const initialData = processTemplate(defaultTemplate.content, sampleUserData);
        // Ensure sectionOrder exists on new templates
        if (!initialData.sectionOrder) {
          initialData.sectionOrder = defaultSectionOrder;
        }
        setResumeData(initialData);
      } else {
        setResumeData(getInitialResumeData(sampleUserData));
      }
    } else {
      const templateToEdit = templates.find(t => t.id === templateId);
      if (templateToEdit && templateToEdit.content) {
        const parsedData = processTemplate(templateToEdit.content, sampleUserData);
        // Ensure sectionOrder for older templates without it
        if (!parsedData.sectionOrder) {
          parsedData.sectionOrder = defaultSectionOrder;
        }
        setResumeData(parsedData);
      } else {
        toast({ title: "Template Not Found", description: "Could not find the selected template.", variant: "destructive" });
        setResumeData(getInitialResumeData(sampleUserData));
      }
    }
    
    setIsLoading(false);
  }, [user, isNewTemplate, templateId, toast, processTemplate]);

  useEffect(() => {
    if(user) {
        loadData();
    }
  }, [user, loadData]);
  
  const selectedElementData = useMemo(() => {
    if (!selectedElementId || !resumeData) return null;
    
    if (selectedElementId === 'header') return { title: "Header Section", data: resumeData.header };
    if (selectedElementId === 'summary') return { title: "Summary Section", data: { summary: resumeData.summary } };
    if (selectedElementId === 'experience') return { title: "Experience Section", data: { experience: resumeData.experience } };
    if (selectedElementId === 'education') return { title: "Education Section", data: { education: resumeData.education } };
    if (selectedElementId === 'skills') return { title: "Skills Section", data: { skills: resumeData.skills } };
    
    if (selectedElementId.startsWith('custom-')) {
        const key = selectedElementId.replace('custom-', '');
        const sectionData = resumeData.additionalDetails?.main?.[key] ?? resumeData.additionalDetails?.sidebar?.[key];
        return { title: `Custom Section: ${key.replace(/_/g, ' ')}`, data: { [key]: sectionData } };
    }

    if (selectedElementId === 'additionalDetails') return { title: "Additional Details", data: resumeData.additionalDetails };

    return { title: "Editing Element", data: {} };
  }, [selectedElementId, resumeData]);

  const handleStyleChange = (property: keyof ResumeBuilderData['styles'], value: any) => {
    if (!resumeData) return;
    setResumeData(prev => prev ? ({ 
        ...prev, 
        styles: {
            ...prev.styles,
            [property]: value 
        } 
    }) : null);
  };
  
  const handleLayoutChange = (newLayout: string) => {
    if (!resumeData) return;
    setResumeData(prev => prev ? ({ ...prev, layout: newLayout }) : null);
  };

  const handleDataChange = (field: string, value: string) => {
    if (!resumeData || !selectedElementId) return;

    const [section, key, index, subKey] = field.split('.');

    setResumeData(prev => {
        if (!prev) return null;
        const newData = JSON.parse(JSON.stringify(prev));
        
        if (section === 'header') {
            (newData.header as any)[key] = value;
        } else if (section === 'summary') {
            newData.summary = value;
        } else if (section === 'experience' && index !== undefined && subKey) {
            const idx = parseInt(index, 10);
            if (newData.experience[idx]) {
                (newData.experience[idx] as any)[subKey] = value;
            }
        } else if (section === 'education' && index !== undefined && subKey) {
            const idx = parseInt(index, 10);
            if (newData.education[idx]) {
                (newData.education[idx] as any)[subKey] = value;
            }
        } else if (section === 'skills') {
             newData.skills = value.split(',').map(s => s.trim());
        } else if (section.startsWith('custom')) {
            const customKey = section.replace('custom-', '');
            if (!newData.additionalDetails) newData.additionalDetails = { main: {}, sidebar: {} };
            if (newData.additionalDetails.main.hasOwnProperty(customKey)) {
                newData.additionalDetails.main[customKey] = value;
            } else if (newData.additionalDetails.sidebar.hasOwnProperty(customKey)) {
                newData.additionalDetails.sidebar[customKey] = value;
            }
        }

        return newData;
    });
  };
  
  const handleAddCustomSection = () => {
    const sectionName = prompt("Enter a name for the new section (e.g., Projects):");
    if (!sectionName || !sectionName.trim()) return;
    
    const key = sectionName.trim().toLowerCase().replace(/\s+/g, '_');
    const fullKey = `custom-${key}`;
    const sectionExists = resumeData?.sectionOrder.some(s => s === fullKey);

    if (sectionExists) {
        toast({
          title: 'Section Exists',
          description: `A section named "${sectionName}" already exists.`,
          variant: 'destructive',
        });
        return;
    }
    
    let column: 'main' | 'sidebar' = 'main';
    if (resumeData?.layout?.startsWith('two-column')) {
        const selectedColumn = prompt("Add to which column? (Type 'main' or 'sidebar')", 'main');
        if (selectedColumn && (selectedColumn.toLowerCase() === 'sidebar' || selectedColumn.toLowerCase() === 'side')) {
            column = 'sidebar';
        }
    }
    
    setResumeData(prev => {
      if (!prev) return prev;
      const newDetails = { ...(prev.additionalDetails || { main: {}, sidebar: {} }) };
      if (!newDetails[column]) {
        newDetails[column] = {};
      }
      newDetails[column][key] = `- New detail in your ${sectionName} section.`;
      const newSectionOrder = [...(prev.sectionOrder || []), fullKey];
      return { ...prev, additionalDetails: newDetails, sectionOrder: newSectionOrder };
    });

    toast({
      title: 'Section Added',
      description: `"${sectionName}" added to the ${column} column.`,
    });
  };
  
  const handleAddCommonSection = (sectionKey: string, sectionTitle: string) => {
    const fullKey = `custom-${sectionKey}`;
    
    if (resumeData?.sectionOrder.includes(fullKey)) {
        toast({ title: "Section Exists", description: `The "${sectionTitle}" section is already in your resume.`, variant: "default" });
        return;
    }
    
    setResumeData(prev => {
        if (!prev) return prev;
        const newDetails = { ...(prev.additionalDetails || { main: {}, sidebar: {} }) };
        if (!newDetails.main) newDetails.main = {};
        newDetails.main[sectionKey] = `- Example entry for ${sectionTitle}`;
        const newSectionOrder = [...(prev.sectionOrder || []), fullKey];
        return { ...prev, additionalDetails: newDetails, sectionOrder: newSectionOrder };
    });

    toast({ title: "Section Added", description: `"${sectionTitle}" has been added to your resume.` });
  };


  const handleSaveChanges = async () => {
    if (!resumeData) return;

    if (isNewTemplate) {
        setNewTemplateName(resumeData.header.fullName ? `${resumeData.header.fullName}'s Template` : "New Custom Template");
        setNewTemplateDescription(`Custom template based on "${resumeData.header.jobTitle || 'general role'}".`);
        setIsSaveDialogOpen(true);
        return;
    }
    
    setIsSaving(true);
    const result = await updateResumeTemplate(templateId, { content: JSON.stringify(resumeData), description: "Updated via editor" });

    if (result) {
      toast({ title: "Template Saved", description: `Template has been saved.` });
    } else {
      toast({ title: "Error", description: "Failed to save template.", variant: "destructive" });
    }
    setIsSaving(false);
  };

  const handleCreateNewTemplate = async () => {
    if (!newTemplateName.trim() || !newTemplateDescription.trim()) {
        toast({ title: "Error", description: "Name and description are required.", variant: "destructive" });
        return;
    }

    setIsSaving(true);
    setIsSaveDialogOpen(false);
    
    const result = await createResumeTemplate({
        name: newTemplateName,
        description: newTemplateDescription,
        category: "Custom",
        previewImageUrl: "https://placehold.co/300x400/7d3c98/FFFFFF?text=Custom",
        content: JSON.stringify(resumeData),
    });
    
    if (result) {
        toast({ title: "Template Created", description: `Template "${result.name}" has been saved.` });
        router.push(`/admin/template-designer/${result.id}`);
    } else {
        toast({ title: "Error", description: "Failed to create template.", variant: "destructive" });
    }
    setIsSaving(false);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
        setResumeData(prev => {
            if (!prev || !prev.sectionOrder) return prev;
            const oldIndex = prev.sectionOrder.indexOf(active.id as string);
            const newIndex = prev.sectionOrder.indexOf(over.id as string);
            return {
                ...prev,
                sectionOrder: arrayMove(prev.sectionOrder, oldIndex, newIndex),
            };
        });
    }
  };
  
  const handleTemplateSelect = (template: ResumeTemplate) => {
    if (!resumeData || !template) return;
    
    const parsedData = processTemplate(template.content, sampleUserData);
    if (!parsedData.sectionOrder) {
        parsedData.sectionOrder = defaultSectionOrder;
    }

    setResumeData(prev => prev ? ({
      ...parsedData,
      header: prev.header, // Preserve the user's header info
    }) : null);
    
    setIsTemplateDialogOpen(false);
    toast({
        title: "Template Changed",
        description: `Switched to "${template.name}".`,
    });
  };
  
  const commonSections = [
    { key: 'awards', title: 'Awards', icon: Award },
    { key: 'certifications', title: 'Certifications', icon: BookCheck },
    { key: 'languages', title: 'Languages', icon: LanguagesIcon },
    { key: 'interests', title: 'Interests', icon: Heart },
  ];

  if (isLoading || !resumeData) {
    return <div className="h-screen w-screen flex items-center justify-center bg-muted"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }
  
  return (
    <>
    <div className="h-screen w-screen bg-muted flex flex-col">
      <header className="flex-shrink-0 bg-card border-b p-3 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => router.push('/admin/template-designer')}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Exit
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Eye className="mr-2 h-4 w-4" /> Preview
          </Button>
          <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground" onClick={handleSaveChanges} disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
            <Save className="mr-2 h-4 w-4" /> {isSaving ? "Saving..." : "Save Template"}
          </Button>
        </div>
      </header>

      <div className="flex-grow flex overflow-hidden">
        <aside className="w-64 bg-card border-r p-4 overflow-y-auto">
          <h2 className="text-sm font-semibold mb-3">Add Elements</h2>
          <div className="space-y-2">
            <Button variant="outline" className="w-full justify-start" onClick={handleAddCustomSection}><PlusCircle className="mr-2 h-4 w-4"/> Custom Section</Button>
          </div>
          <hr className="my-4" />
          <h3 className="text-xs font-semibold uppercase text-muted-foreground mb-2">Add Common Sections</h3>
          <div className="space-y-2">
             {commonSections.map(section => (
              <Button key={section.key} variant="outline" className="w-full justify-start font-normal text-sm" onClick={() => handleAddCommonSection(section.key, section.title)}>
                <section.icon className="mr-2 h-4 w-4 text-muted-foreground" /> {section.title}
              </Button>
            ))}
          </div>
        </aside>

        <DndContext sensors={[]} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <main className="flex-1 flex justify-center overflow-auto p-8">
              <div className="w-auto h-full" style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}>
                  <ResumePreview 
                    ref={resumePreviewRef} 
                    resumeData={resumeData}
                    templates={allTemplates}
                    onSelectElement={setSelectedElementId} 
                    selectedElementId={selectedElementId}
                    onDataChange={handleDataChange}
                  />
              </div>
          </main>
        </DndContext>

        <aside className="w-72 bg-card border-l p-4 overflow-y-auto">
          <h2 className="text-sm font-semibold mb-3 flex items-center gap-2"><Settings className="h-4 w-4" /> Property Inspector</h2>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{selectedElementData?.title || 'Global Styles'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
               <Button onClick={() => setIsTemplateDialogOpen(true)} variant="outline" className="w-full">Change Template</Button>
               <div className="space-y-1">
                 <Label htmlFor="layout-select" className="text-xs">Layout</Label>
                 <Select value={resumeData.layout} onValueChange={handleLayoutChange}>
                   <SelectTrigger id="layout-select">
                     <SelectValue placeholder="Select layout" />
                   </SelectTrigger>
                   <SelectContent>
                     <SelectItem value="single-column">Single Column</SelectItem>
                     <SelectItem value="two-column-left">Two Column - Left Sidebar</SelectItem>
                     <SelectItem value="two-column-right">Two Column - Right Sidebar</SelectItem>
                   </SelectContent>
                 </Select>
               </div>
               <div className="space-y-1">
                 <Label htmlFor="font-family" className="text-xs">Font Family</Label>
                 <Select value={resumeData.styles?.fontFamily} onValueChange={(value) => handleStyleChange('fontFamily', value)}>
                   <SelectTrigger id="font-family"><SelectValue placeholder="Select font" /></SelectTrigger>
                   <SelectContent>
                     <SelectItem value="sans">Sans-Serif (Default)</SelectItem>
                     <SelectItem value="serif">Serif</SelectItem>
                     <SelectItem value="mono">Monospaced</SelectItem>
                   </SelectContent>
                 </Select>
               </div>
               <div className="space-y-1">
                 <Label htmlFor="header-color" className="text-xs">Header Color</Label>
                 <Input id="header-color" value={resumeData.styles?.headerColor || ''} onChange={(e) => handleStyleChange('headerColor', e.target.value)} />
               </div>
               <div className="space-y-1">
                 <Label htmlFor="body-color" className="text-xs">Body Text Color</Label>
                 <Input id="body-color" value={resumeData.styles?.bodyColor || ''} onChange={(e) => handleStyleChange('bodyColor', e.target.value)} />
               </div>
                <div className="space-y-1">
                 <Label htmlFor="header-font-size" className="text-xs">Header Font Size</Label>
                 <Input id="header-font-size" value={resumeData.styles?.headerFontSize || ''} onChange={(e) => handleStyleChange('headerFontSize', e.target.value)} placeholder="e.g., 24px" />
               </div>
               <div className="space-y-1">
                 <Label htmlFor="text-align" className="text-xs">Text Alignment</Label>
                 <Select value={resumeData.styles?.textAlign} onValueChange={(value) => handleStyleChange('textAlign', value as any)}>
                   <SelectTrigger id="text-align">
                     <SelectValue placeholder="Select alignment" />
                   </SelectTrigger>
                   <SelectContent>
                     <SelectItem value="left">Left</SelectItem>
                     <SelectItem value="center">Center</SelectItem>
                     <SelectItem value="right">Right</SelectItem>
                   </SelectContent>
                 </Select>
               </div>
                <div className="space-y-3 pt-2">
                    <Label htmlFor="zoom-slider" className="text-xs">Zoom ({zoomLevel}%)</Label>
                    <Slider
                        id="zoom-slider"
                        min={30}
                        max={100}
                        step={10}
                        value={[zoomLevel]}
                        onValueChange={(value) => setZoomLevel(value[0])}
                    />
                </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
    <TemplateSelectionDialog
        isOpen={isTemplateDialogOpen}
        onClose={() => setIsTemplateDialogOpen(false)}
        onSelect={handleTemplateSelect}
        templates={allTemplates}
        currentTemplateId={resumeData.templateId}
    />
    <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Save New Template</DialogTitle>
                <DialogDescription>
                    Provide a name and description for your new custom template.
                </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
                <div>
                    <Label htmlFor="template-name">Template Name</Label>
                    <Input id="template-name" value={newTemplateName} onChange={e => setNewTemplateName(e.target.value)} />
                </div>
                <div>
                    <Label htmlFor="template-description">Description</Label>
                    <Textarea id="template-description" value={newTemplateDescription} onChange={e => setNewTemplateDescription(e.target.value)} />
                </div>
            </div>
            <DialogFooter>
                <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                <Button onClick={handleCreateNewTemplate}>Create Template</Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
    </>
  );
}
