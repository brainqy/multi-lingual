
"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Save, Eye, Settings, PlusCircle, TextCursorInput, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { ResumeTemplate, ResumeBuilderData, ResumeEducationEntry, ResumeExperienceEntry } from '@/types';
import { getResumeTemplates, updateResumeTemplate, createResumeTemplate } from '@/lib/actions/templates';
import ResumePreview from '@/components/features/resume-builder/ResumePreview';
import { getInitialResumeData } from '@/lib/resume-builder-helpers';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';


export default function TemplateEditorPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const templateId = params.templateId as string;
  const isNewTemplate = templateId === 'new';
  const resumePreviewRef = useRef<HTMLDivElement>(null);

  const [allTemplates, setAllTemplates] = useState<ResumeTemplate[]>([]);
  const [resumeData, setResumeData] = useState<ResumeBuilderData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    const templates = await getResumeTemplates();
    setAllTemplates(templates);

    let currentTemplate: ResumeTemplate | undefined;
    if (!isNewTemplate) {
      currentTemplate = templates.find(t => t.id === templateId);
    }
    
    if (currentTemplate) {
      try {
        const parsedData = JSON.parse(currentTemplate.content || '{}') as Partial<ResumeBuilderData>;
        const defaultData = getInitialResumeData();
        setResumeData({ ...defaultData, ...parsedData, templateId: currentTemplate.id });
      } catch (e) {
        console.error("Failed to parse template content, using default data.", e);
        setResumeData({ ...getInitialResumeData(), templateId: currentTemplate.id });
      }
    } else {
      // For new templates or if template not found
      const defaultData = getInitialResumeData();
      setResumeData({ ...defaultData, templateId: 'template1' });
    }

    setIsLoading(false);
  }, [templateId, isNewTemplate]);

  useEffect(() => {
    loadData();
  }, [loadData]);
  
  const selectedElementData = useMemo(() => {
    if (!selectedElementId || !resumeData) return null;
    
    if (selectedElementId === 'header') return { title: "Header Section", data: resumeData.header };
    if (selectedElementId === 'summary') return { title: "Summary Section", data: { summary: resumeData.summary } };
    if (selectedElementId === 'experience') return { title: "Experience Section", data: { experience: resumeData.experience } };
    if (selectedElementId === 'education') return { title: "Education Section", data: { education: resumeData.education } };
    if (selectedElementId === 'skills') return { title: "Skills Section", data: { skills: resumeData.skills } };
    
    if (selectedElementId.startsWith('custom-')) {
        const key = selectedElementId.split('-')[1];
        return { title: `Custom Section: ${key}`, data: { [key]: (resumeData.additionalDetails as any)?.[key] } };
    }

    if (selectedElementId === 'additionalDetails') return { title: "Additional Details", data: resumeData.additionalDetails };

    return { title: "Editing Element", data: {} };
  }, [selectedElementId, resumeData]);

  const handleStyleChange = (property: keyof ResumeBuilderData, value: any) => {
    if (!resumeData) return;
    setResumeData(prev => prev ? ({ ...prev, [property]: value }) : null);
  };

  const handleDataChange = (field: string, value: string) => {
    if (!resumeData || !selectedElementId) return;

    const [section, key, index, subKey] = field.split('.');

    setResumeData(prev => {
        if (!prev) return null;
        const newData = { ...prev };
        
        if (section === 'header') {
            (newData.header as any)[key] = value;
        } else if (section === 'summary') {
            newData.summary = value;
        } else if (section === 'experience' && index !== undefined && subKey) {
            const idx = parseInt(index, 10);
            (newData.experience[idx] as any)[subKey] = value;
        } else if (section === 'skills') {
             newData.skills = value.split(',').map(s => s.trim());
        } else if (section.startsWith('custom') && key) {
            if (!newData.additionalDetails) newData.additionalDetails = {};
            (newData.additionalDetails as any)[key] = value;
        }

        return newData;
    });
  };

  const handleAddCustomSection = () => {
    const sectionName = prompt("Enter a name for the new section (e.g., Projects, Publications):");
    if (sectionName && sectionName.trim()) {
        const key = sectionName.trim().toLowerCase().replace(/\s+/g, '_');
        setResumeData(prev => {
            if (!prev) return null;
            const newDetails = { ...(prev.additionalDetails || {}), [key]: `- New detail in your ${sectionName} section.` };
            return { ...prev, additionalDetails: newDetails };
        });
        toast({ title: "Section Added", description: `"${sectionName}" has been added.` });
    }
  };


  const handleSaveChanges = async () => {
    if (!resumeData) return;
    setIsSaving(true);
    
    const dataToSave: Partial<ResumeTemplate> = {
        name: resumeData.header.fullName ? `${resumeData.header.fullName}'s Template` : "New Template",
        category: "Custom",
        previewImageUrl: "https://placehold.co/300x400/7d3c98/FFFFFF?text=Custom",
        content: JSON.stringify(resumeData),
    };

    let result;
    if (isNewTemplate) {
      result = await createResumeTemplate(dataToSave as any);
    } else {
      result = await updateResumeTemplate(templateId, dataToSave);
    }

    if (result) {
      toast({ title: isNewTemplate ? "Template Created" : "Template Saved", description: `Template "${result.name}" has been saved.` });
      if (isNewTemplate) {
        router.push(`/admin/template-designer/${result.id}`);
      }
    } else {
      toast({ title: "Error", description: "Failed to save template.", variant: "destructive" });
    }
    setIsSaving(false);
  };

  if (isLoading || !resumeData) {
    return <div className="h-screen w-screen flex items-center justify-center bg-muted"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
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
        </aside>

        <main className="flex-1 flex items-center justify-center overflow-auto p-8">
          <div className="w-full h-full max-w-4xl">
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
              <CardTitle className="text-base">{selectedElementData?.title || 'No Element Selected'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
               {selectedElementData?.data ? (
                 Object.entries(selectedElementData.data).map(([key, value]) => {
                   if (typeof value === 'string' || typeof value === 'number') {
                     const fieldId = `${selectedElementId}.${key}`;
                     const isTextArea = key === 'summary' || key === 'responsibilities' || key.startsWith('custom-');
                     return (
                       <div key={fieldId} className="space-y-1">
                         <Label htmlFor={fieldId} className="capitalize text-xs">{key.replace(/([A-Z])/g, ' $1')}</Label>
                         {isTextArea ? (
                            <Textarea id={fieldId} value={value as string} onChange={(e) => handleDataChange(fieldId, e.target.value)} rows={5}/>
                         ) : (
                            <Input id={fieldId} value={value} onChange={(e) => handleDataChange(fieldId, e.target.value)} />
                         )}
                       </div>
                     );
                   }
                   return null;
                 })
               ) : (
                <p className="text-xs text-muted-foreground">Click an element on the canvas to edit its properties here.</p>
               )}
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
