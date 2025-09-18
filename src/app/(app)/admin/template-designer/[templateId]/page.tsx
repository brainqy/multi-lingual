
"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Save, Eye, Settings, PlusCircle, TextCursorInput, Loader2, GripVertical, Award, BookCheck, Languages as LanguagesIcon, Heart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { ResumeTemplate, ResumeBuilderData } from '@/types';
import { getResumeTemplates, updateResumeTemplate, createResumeTemplate } from '@/lib/actions/templates';
import ResumePreview from '@/components/features/resume-builder/ResumePreview';
import { getInitialResumeData } from '@/lib/resume-builder-helpers';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DndContext, closestCenter, type DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useAuth } from '@/hooks/use-auth';
import { Slider } from '@/components/ui/slider';
import TemplateSelectionDialog from '@/components/features/resume-builder/TemplateSelectionDialog';

const logger = {
    log: (message: string, ...args: any[]) => console.log(`[TemplateEditorPage] ${message}`, ...args),
};

export default function TemplateEditorPage() {
  logger.log('0. Component rendering started.');

  logger.log('1. Initializing hooks and state.');
  const params = useParams();
  logger.log('   - useParams() called.', { params });
  const router = useRouter();
  logger.log('   - useRouter() called.');
  const searchParams = useSearchParams();
  logger.log('   - useSearchParams() called.');
  const { toast } = useToast();
  logger.log('   - useToast() called.');
  const { user } = useAuth();
  logger.log('   - useAuth() called.', { user });
  const templateId = params.templateId as string;
  logger.log('   - templateId derived from params.', { templateId });
  const isNewTemplate = templateId === 'new';
  logger.log('   - isNewTemplate calculated.', { isNewTemplate });
  const resumePreviewRef = useRef<HTMLDivElement>(null);
  logger.log('   - useRef(resumePreviewRef) created.');

  logger.log('2. Initializing component state.');
  const [allTemplates, setAllTemplates] = useState<ResumeTemplate[]>([]);
  logger.log('   - useState(allTemplates) initialized.', { allTemplates });
  const [resumeData, setResumeData] = useState<ResumeBuilderData | null>(null);
  logger.log('   - useState(resumeData) initialized.', { resumeData });
  const [isLoading, setIsLoading] = useState(true);
  logger.log('   - useState(isLoading) initialized.', { isLoading });
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  logger.log('   - useState(selectedElementId) initialized.', { selectedElementId });
  const [isSaving, setIsSaving] = useState(false);
  logger.log('   - useState(isSaving) initialized.', { isSaving });
  const [zoomLevel, setZoomLevel] = useState(70);
  logger.log('   - useState(zoomLevel) initialized.', { zoomLevel });
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  logger.log('   - useState(isTemplateDialogOpen) initialized.', { isTemplateDialogOpen });

  const loadData = useCallback(async (resumeId: string | null, templateIdParam: string | null) => {
    logger.log('loadData useCallback triggered.', { resumeId, templateIdParam });
    if (!user) {
      logger.log('   - No user found, aborting loadData.');
      return;
    }
    logger.log('   - Setting isLoading to true.');
    setIsLoading(true);
    logger.log('   - Fetching resume templates.');
    const templates = await getResumeTemplates();
    logger.log('   - Fetched templates.', { count: templates.length });
    setAllTemplates(templates);
  
    let initialResumeData: ResumeBuilderData = getInitialResumeData(user);
    logger.log('   - Generated initial resume data.');
  
    if (!isNewTemplate) {
      logger.log('   - Not a new template, finding template to edit.', { templateId });
      const templateToEdit = templates.find(t => t.id === templateId);
      if (templateToEdit && templateToEdit.content) {
        logger.log('   - Found template to edit, parsing content.');
        try {
          const parsedData = JSON.parse(templateToEdit.content);
          initialResumeData = { ...initialResumeData, ...parsedData };
          logger.log('   - Parsed and merged template content successfully.');
        } catch (e) {
            console.error("Could not parse content from template, using default structure.", e);
            logger.log('   - ERROR: Could not parse template content.');
        }
      }
    } else if (templateIdParam && templateIdParam !== 'new') {
        logger.log('   - New template flow, but templateIdParam exists.', { templateIdParam });
        const template = templates.find(t => t.id === templateIdParam);
        if (template && template.content) {
            logger.log('   - Found template from param, parsing content.');
            try {
                const parsedData = JSON.parse(template.content);
                initialResumeData = { ...initialResumeData, ...parsedData, templateId: template.id };
                logger.log('   - Parsed and merged template content from param successfully.');
            } catch (e) {
                console.error("Could not parse content from template, using default structure.", e);
                logger.log('   - ERROR: Could not parse template content from param.');
            }
        }
    }
    
    logger.log('   - Setting final resumeData state.');
    setResumeData(initialResumeData);
    logger.log('   - Setting isLoading to false.');
    setIsLoading(false);
  }, [user, isNewTemplate, templateId]);

  useEffect(() => {
    logger.log('useEffect[user, searchParams, loadData, templateId] triggered.');
    const resumeId = searchParams.get('resumeId');
    logger.log('   - Got resumeId from searchParams.', { resumeId });
    const templateIdParam = searchParams.get('templateId');
    logger.log('   - Got templateIdParam from searchParams.', { templateIdParam });
    if(user) {
        logger.log('   - User exists, calling loadData.');
        loadData(resumeId, templateIdParam || templateId);
    } else {
        logger.log('   - No user, skipping loadData.');
    }
  }, [user, searchParams, loadData, templateId]);
  
  const selectedElementData = useMemo(() => {
    logger.log('useMemo[selectedElementId, resumeData] triggered.');
    if (!selectedElementId || !resumeData) {
      logger.log('   - No selectedElementId or resumeData, returning null.');
      return null;
    }
    
    logger.log('   - Calculating selectedElementData for:', { selectedElementId });
    if (selectedElementId === 'header') return { title: "Header Section", data: resumeData.header };
    if (selectedElementId === 'summary') return { title: "Summary Section", data: { summary: resumeData.summary } };
    if (selectedElementId === 'experience') return { title: "Experience Section", data: { experience: resumeData.experience } };
    if (selectedElementId === 'education') return { title: "Education Section", data: { education: resumeData.education } };
    if (selectedElementId === 'skills') return { title: "Skills Section", data: { skills: resumeData.skills } };
    
    if (selectedElementId.startsWith('custom-')) {
        const key = selectedElementId.replace('custom-', '');
        const sectionData = resumeData.additionalDetails?.main[key] ?? resumeData.additionalDetails?.sidebar[key];
        return { title: `Custom Section: ${key.replace(/_/g, ' ')}`, data: { [key]: sectionData } };
    }

    if (selectedElementId === 'additionalDetails') return { title: "Additional Details", data: resumeData.additionalDetails };

    logger.log('   - Defaulting selectedElementData.');
    return { title: "Editing Element", data: {} };
  }, [selectedElementId, resumeData]);

  const handleStyleChange = (property: keyof ResumeBuilderData['styles'], value: any) => {
    logger.log('handleStyleChange called.', { property, value });
    if (!resumeData) {
      logger.log('   - No resumeData, aborting.');
      return;
    }
    logger.log('   - Updating resumeData styles.');
    setResumeData(prev => prev ? ({ 
        ...prev, 
        styles: {
            ...prev.styles,
            [property]: value 
        } 
    }) : null);
  };
  
  const handleLayoutChange = (newLayout: string) => {
    logger.log('handleLayoutChange called.', { newLayout });
    if (!resumeData) {
      logger.log('   - No resumeData, aborting.');
      return;
    }
    logger.log('   - Updating resumeData layout.');
    setResumeData(prev => prev ? ({ ...prev, layout: newLayout }) : null);
  };

  const handleDataChange = (field: string, value: string) => {
    logger.log('handleDataChange called.', { field, value });
    if (!resumeData || !selectedElementId) {
      logger.log('   - No resumeData or selectedElementId, aborting.');
      return;
    }

    const [section, key, index, subKey] = field.split('.');
    logger.log('   - Parsed field:', { section, key, index, subKey });

    logger.log('   - Updating resumeData with new value.');
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
    logger.log('handleAddCustomSection called.');
    const sectionName = prompt("Enter a name for the new section (e.g., Projects):");
    logger.log('   - Prompted for section name.', { sectionName });
    if (!sectionName || !sectionName.trim()) {
      logger.log('   - No section name entered, aborting.');
      return;
    }

    if (resumeData?.sectionOrder.some(s => s.replace('custom-', '').replace(/_/g, ' ') === sectionName.trim().toLowerCase())) {
        logger.log('   - Section already exists, showing toast.');
        toast({
          title: 'Section Exists',
          description: `A section named "${sectionName}" already exists.`,
          variant: 'destructive',
        });
        return;
    }
    
    let column: 'main' | 'sidebar' = 'main';
    if (resumeData?.layout?.startsWith('two-column')) {
        logger.log('   - Two-column layout detected, prompting for column.');
        const selectedColumn = prompt("Add to which column? (Type 'main' or 'sidebar')", 'main');
        if (selectedColumn && (selectedColumn.toLowerCase() === 'sidebar' || selectedColumn.toLowerCase() === 'side')) {
            column = 'sidebar';
        }
        logger.log('   - Column selected.', { column });
    }

    const key = sectionName.trim().toLowerCase().replace(/\s+/g, '_');
    const fullKey = `custom-${key}`;
    
    logger.log('   - Updating resumeData to add new custom section.');
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

    logger.log('   - Showing success toast for adding section.');
    toast({
      title: 'Section Added',
      description: `"${sectionName}" added to the ${column} column.`,
    });
  };
  
  const handleAddCommonSection = (sectionKey: string, sectionTitle: string) => {
    logger.log('handleAddCommonSection called.', { sectionKey, sectionTitle });
    const fullKey = `custom-${sectionKey}`;
    
    if (resumeData?.sectionOrder.includes(fullKey)) {
        logger.log('   - Common section already exists, showing toast.');
        toast({ title: "Section Exists", description: `The "${sectionTitle}" section is already in your resume.`, variant: "default" });
        return;
    }
    
    logger.log('   - Updating resumeData to add new common section.');
    setResumeData(prev => {
        if (!prev) return prev;
        const newDetails = { ...(prev.additionalDetails || { main: {}, sidebar: {} }) };
        if (!newDetails.main) newDetails.main = {};
        newDetails.main[sectionKey] = `- Example entry for ${sectionTitle}`;
        const newSectionOrder = [...(prev.sectionOrder || []), fullKey];
        return { ...prev, additionalDetails: newDetails, sectionOrder: newSectionOrder };
    });

    logger.log('   - Showing success toast for adding common section.');
    toast({ title: "Section Added", description: `"${sectionTitle}" has been added to your resume.` });
  };


  const handleSaveChanges = async () => {
    logger.log('handleSaveChanges called.');
    if (!resumeData) {
      logger.log('   - No resumeData, aborting save.');
      return;
    }
    logger.log('   - Setting isSaving to true.');
    setIsSaving(true);
    
    const contentToSave = { ...resumeData };
    logger.log('   - Prepared content to save.');

    const dataToSave: Partial<ResumeTemplate> = {
        name: resumeData.header.fullName ? `${resumeData.header.fullName}'s Template` : "New Template",
        category: "Custom",
        previewImageUrl: "https://placehold.co/300x400/7d3c98/FFFFFF?text=Custom",
        content: JSON.stringify(contentToSave),
    };
    logger.log('   - Prepared data object for API call.');

    let result;
    if (isNewTemplate) {
      logger.log('   - This is a new template, calling createResumeTemplate.');
      result = await createResumeTemplate(dataToSave as any);
    } else {
      logger.log('   - This is an existing template, calling updateResumeTemplate.', { templateId });
      result = await updateResumeTemplate(templateId, dataToSave);
    }

    if (result) {
      logger.log('   - Save operation successful.', { result });
      toast({ title: isNewTemplate ? "Template Created" : "Template Saved", description: `Template "${result.name}" has been saved.` });
      if (isNewTemplate) {
        logger.log('   - Redirecting to the new template editor page.');
        router.push(`/admin/template-designer/${result.id}`);
      }
    } else {
      logger.log('   - Save operation failed.');
      toast({ title: "Error", description: "Failed to save template.", variant: "destructive" });
    }
    logger.log('   - Setting isSaving to false.');
    setIsSaving(false);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    logger.log('handleDragEnd called.', { event });
    const { active, over } = event;
    if (over && active.id !== over.id) {
        logger.log('   - Valid drag event, updating sectionOrder.');
        setResumeData(prev => {
            if (!prev || !prev.sectionOrder) return prev;
            const oldIndex = prev.sectionOrder.indexOf(active.id as string);
            const newIndex = prev.sectionOrder.indexOf(over.id as string);
            return {
                ...prev,
                sectionOrder: arrayMove(prev.sectionOrder, oldIndex, newIndex),
            };
        });
    } else {
        logger.log('   - Invalid drag event, no changes made.');
    }
  };
  
  const handleTemplateSelect = (template: ResumeTemplate) => {
    logger.log('handleTemplateSelect called.', { templateName: template.name });
    if (!resumeData || !template) {
      logger.log('   - No resumeData or template, aborting.');
      return;
    }
    
    try {
      logger.log('   - Parsing template content.');
      const templateData = JSON.parse(template.content) as ResumeBuilderData;
      
      logger.log('   - Merging current header with new template data.');
      const mergedData: ResumeBuilderData = {
        ...templateData,
        header: resumeData.header,
        templateId: template.id,
      };

      logger.log('   - Updating resumeData state with merged data.');
      setResumeData(mergedData);
      logger.log('   - Closing template dialog.');
      setIsTemplateDialogOpen(false);
      logger.log('   - Showing success toast.');
      toast({
        title: "Template Changed",
        description: `Switched to "${template.name}". Your personal details have been preserved.`,
      });
    } catch (e) {
      logger.log('   - ERROR: Failed to parse template content.', { error: e });
      console.error("Failed to parse template content:", e);
      toast({
        title: "Error Applying Template",
        description: "The selected template has invalid content.",
        variant: "destructive",
      });
    }
  };
  
  const commonSections = [
    { key: 'awards', title: 'Awards', icon: Award },
    { key: 'certifications', title: 'Certifications', icon: BookCheck },
    { key: 'languages', title: 'Languages', icon: LanguagesIcon },
    { key: 'interests', title: 'Interests', icon: Heart },
  ];
  logger.log('3. Common sections defined.');

  if (isLoading || !resumeData) {
    logger.log('4. Render check: isLoading or no resumeData. Showing loading spinner.');
    return <div className="h-screen w-screen flex items-center justify-center bg-muted"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }
  
  logger.log('5. Starting main component render.');
  return (
    <>
    <DndContext sensors={[]} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
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

        <main className="flex-1 flex justify-start overflow-auto p-8">
            <div className="w-auto h-full" style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top left' }}>
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
    </DndContext>
    <TemplateSelectionDialog
        isOpen={isTemplateDialogOpen}
        onClose={() => setIsTemplateDialogOpen(false)}
        onSelect={handleTemplateSelect}
        templates={allTemplates}
        currentTemplateId={resumeData.templateId}
    />
    </>
  );
}
