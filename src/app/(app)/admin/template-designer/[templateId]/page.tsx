
"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Save, Eye, Settings, PlusCircle, TextCursorInput } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { ResumeTemplate } from '@/types';
import { getResumeTemplates } from '@/lib/actions/templates';

export default function TemplateEditorPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const templateId = params.templateId as string;
  const isNewTemplate = templateId === 'new';

  const [template, setTemplate] = useState<ResumeTemplate | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isNewTemplate) {
      // Create a default structure for a new template
      setTemplate({
        id: 'new',
        name: 'New Untitled Template',
        description: 'A brand new template.',
        category: 'Custom',
        previewImageUrl: '',
        content: JSON.stringify({ "default": "structure" }),
      });
      setIsLoading(false);
    } else if (templateId) {
      getResumeTemplates().then(templates => {
        const found = templates.find(t => t.id === templateId);
        if (found) {
          setTemplate(found);
        } else {
          toast({ title: "Template not found", variant: "destructive" });
          router.push('/admin/template-designer');
        }
        setIsLoading(false);
      });
    }
  }, [templateId, isNewTemplate, router, toast]);

  if (isLoading) {
    return <div className="h-screen w-screen flex items-center justify-center">Loading editor...</div>;
  }
  
  if (!template) {
    return <div className="h-screen w-screen flex items-center justify-center">Could not load template data.</div>;
  }

  return (
    <div className="h-screen w-screen bg-muted flex flex-col">
      {/* Header */}
      <header className="flex-shrink-0 bg-card border-b p-3 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => router.push('/admin/template-designer')}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Exit
          </Button>
          <div>
            <h1 className="text-lg font-semibold">{template.name}</h1>
            <p className="text-xs text-muted-foreground">{isNewTemplate ? "Creating New Template" : `Editing Template ID: ${template.id}`}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Eye className="mr-2 h-4 w-4" /> Preview
          </Button>
          <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <Save className="mr-2 h-4 w-4" /> Save
          </Button>
        </div>
      </header>

      {/* Main Editor Body */}
      <div className="flex-grow flex overflow-hidden">
        {/* Left Sidebar (Elements) */}
        <aside className="w-64 bg-card border-r p-4 overflow-y-auto">
          <h2 className="text-sm font-semibold mb-3">Add Elements</h2>
          <div className="space-y-2">
            <Button variant="outline" className="w-full justify-start"><TextCursorInput className="mr-2 h-4 w-4"/> Text Block</Button>
            <Button variant="outline" className="w-full justify-start"><PlusCircle className="mr-2 h-4 w-4"/> Custom Section</Button>
          </div>
        </aside>

        {/* Center Canvas (Resume Preview) */}
        <main className="flex-1 flex items-center justify-center overflow-auto p-8">
          <div className="w-full h-full bg-white shadow-lg max-w-4xl aspect-[8.5/11]">
            {/* Live resume preview will be rendered here */}
            <p className="p-8 text-muted-foreground">Resume Canvas Area</p>
          </div>
        </main>

        {/* Right Sidebar (Property Inspector) */}
        <aside className="w-72 bg-card border-l p-4 overflow-y-auto">
          <h2 className="text-sm font-semibold mb-3 flex items-center gap-2"><Settings className="h-4 w-4" /> Property Inspector</h2>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">No Element Selected</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Click an element on the canvas to edit its properties here.</p>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
