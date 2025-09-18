
"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Save, Eye, Settings, PlusCircle, TextCursorInput, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { ResumeTemplate, ResumeBuilderData } from '@/types';
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
  const [templateInfo, setTemplateInfo] = useState<Partial<ResumeTemplate>>({
    name: "New Template",
    category: "Modern",
    content: "{}",
    previewImageUrl: "https://placehold.co/300x400/008080/FFFFFF?text=New",
    headerColor: '#333333',
    bodyColor: '#555555',
    headerFontSize: '24px',
    textAlign: 'left',
  });
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
      setTemplateInfo(currentTemplate);
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
  
  const selectedElementTitle = useMemo(() => {
    if (!selectedElementId) return "No Element Selected";
    if (selectedElementId === 'header') return "Header Section";
    if (selectedElementId === 'summary') return "Summary Section";
    if (selectedElementId === 'experience') return "Experience Section";
    if (selectedElementId === 'education') return "Education Section";
    if (selectedElementId === 'skills') return "Skills Section";
    if (selectedElementId === 'additionalDetails') return "Additional Details";
    return "Editing Element";
  }, [selectedElementId]);

  const handleStyleChange = (property: keyof Omit<ResumeTemplate, 'id' | 'name' | 'description' | 'previewImageUrl' | 'category' | 'content' | 'dataAiHint'>, value: string) => {
    setTemplateInfo(prev => ({ ...prev, [property]: value }));
    setAllTemplates(prevTemplates => {
        const newTemplates = [...prevTemplates];
        const index = newTemplates.findIndex(t => t.id === templateInfo.id);
        if (index !== -1) {
            (newTemplates[index] as any)[property] = value;
        }
        return newTemplates;
    });
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    const { id, ...dataToSave } = templateInfo;
    
    dataToSave.content = JSON.stringify(resumeData);

    let result;
    if (isNewTemplate) {
      result = await createResumeTemplate(dataToSave as any);
    } else {
      result = await updateResumeTemplate(id!, dataToSave);
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
    return <div className="h-screen w-screen flex items-center justify-center bg-muted">Loading editor...</div>;
  }

  return (
    <div className="h-screen w-screen bg-muted flex flex-col">
      <header className="flex-shrink-0 bg-card border-b p-3 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => router.push('/admin/template-designer')}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Exit
          </Button>
          <div>
            <Input 
                value={templateInfo.name || ''} 
                onChange={(e) => setTemplateInfo(p => ({...p, name: e.target.value}))}
                className="text-lg font-semibold h-8"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Eye className="mr-2 h-4 w-4" /> Preview
          </Button>
          <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground" onClick={handleSaveChanges} disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
            <Save className="mr-2 h-4 w-4" /> {isSaving ? "Saving..." : "Save"}
          </Button>
        </div>
      </header>

      <div className="flex-grow flex overflow-hidden">
        <aside className="w-64 bg-card border-r p-4 overflow-y-auto">
          <h2 className="text-sm font-semibold mb-3">Add Elements</h2>
          <div className="space-y-2">
            <Button variant="outline" className="w-full justify-start"><TextCursorInput className="mr-2 h-4 w-4"/> Text Block</Button>
            <Button variant="outline" className="w-full justify-start"><PlusCircle className="mr-2 h-4 w-4"/> Custom Section</Button>
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
            />
          </div>
        </main>

        <aside className="w-72 bg-card border-l p-4 overflow-y-auto">
          <h2 className="text-sm font-semibold mb-3 flex items-center gap-2"><Settings className="h-4 w-4" /> Property Inspector</h2>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{selectedElementTitle}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
               {selectedElementId ? (
                <>
                  <div className="space-y-1">
                    <Label htmlFor="headerColor">Header Color</Label>
                    <Input id="headerColor" value={templateInfo.headerColor || ''} onChange={(e) => handleStyleChange('headerColor', e.target.value)} placeholder="e.g., #000000"/>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="bodyColor">Body Text Color</Label>
                    <Input id="bodyColor" value={templateInfo.bodyColor || ''} onChange={(e) => handleStyleChange('bodyColor', e.target.value)} placeholder="e.g., #333333"/>
                  </div>
                   <div className="space-y-1">
                    <Label htmlFor="headerFontSize">Header Font Size</Label>
                    <Input id="headerFontSize" value={templateInfo.headerFontSize || ''} onChange={(e) => handleStyleChange('headerFontSize', e.target.value)} placeholder="e.g., 1.5rem or 24px"/>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="textAlign">Text Alignment</Label>
                    <Select value={templateInfo.textAlign || 'left'} onValueChange={(value) => handleStyleChange('textAlign', value as any)}>
                        <SelectTrigger><SelectValue/></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="left">Left</SelectItem>
                            <SelectItem value="center">Center</SelectItem>
                            <SelectItem value="right">Right</SelectItem>
                        </SelectContent>
                    </Select>
                  </div>
                </>
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
