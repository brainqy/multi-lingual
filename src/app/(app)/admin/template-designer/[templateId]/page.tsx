
"use client";

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Save, Eye, Settings, PlusCircle, TextCursorInput } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { ResumeTemplate, ResumeBuilderData } from '@/types';
import { getResumeTemplates } from '@/lib/actions/templates';
import ResumePreview from '@/components/features/resume-builder/ResumePreview';

const getInitialResumeData = (): ResumeBuilderData => ({
  header: { fullName: "Jane Doe", phone: "555-123-4567", email: "jane.doe@email.com", linkedin: "linkedin.com/in/janedoe", portfolio: "github.com/janedoe", address: "San Francisco, CA" },
  experience: [
    { id: "1", jobTitle: "Software Engineer", company: "Tech Solutions Inc.", location: "San Francisco, CA", startDate: "2022-01", endDate: "Present", isCurrent: true, responsibilities: "- Developed and maintained web applications using React and Node.js.\n- Collaborated with cross-functional teams to deliver high-quality software." }
  ],
  education: [
    { id: "1", degree: "Bachelor of Science in Computer Science", university: "State University", location: "San Jose, CA", graduationYear: "2022", details: "- GPA: 3.8/4.0" }
  ],
  skills: ["React", "Node.js", "TypeScript", "JavaScript", "HTML", "CSS"],
  summary: "Results-driven Software Engineer with a passion for developing innovative solutions. Proficient in full-stack development and eager to contribute to a dynamic team.",
  additionalDetails: { awards: "", certifications: "", languages: "", interests: "" },
  templateId: 'template1',
});


export default function TemplateEditorPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const templateId = params.templateId as string;
  const isNewTemplate = templateId === 'new';
  const resumePreviewRef = useRef<HTMLDivElement>(null);

  const [allTemplates, setAllTemplates] = useState<ResumeTemplate[]>([]);
  const [resumeData, setResumeData] = useState<ResumeBuilderData>(getInitialResumeData());
  const [templateInfo, setTemplateInfo] = useState<ResumeTemplate | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getResumeTemplates().then(templates => {
      setAllTemplates(templates);
      let currentTemplateId = isNewTemplate ? 'template1' : templateId;
      
      const foundTemplate = templates.find(t => t.id === currentTemplateId);
      
      if (foundTemplate) {
        setTemplateInfo(foundTemplate);
        
        if (isNewTemplate) {
          // For a new template, use default content but set the chosen templateId
          setResumeData(prev => ({ ...prev, templateId: foundTemplate.id }));
        } else {
          // For an existing template, try to parse its content
          try {
            const parsedData = JSON.parse(foundTemplate.content) as Partial<ResumeBuilderData>;
            // Merge with default data to ensure all fields are present
            const defaultData = getInitialResumeData();
            setResumeData({
              ...defaultData,
              ...parsedData,
              templateId: foundTemplate.id
            });
          } catch (e) {
            console.error("Failed to parse template content, using default data.", e);
            setResumeData(prev => ({ ...prev, templateId: foundTemplate.id }));
          }
        }
      } else {
        toast({ title: "Template not found", variant: "destructive" });
        router.push('/admin/template-designer');
      }
      setIsLoading(false);
    });
  }, [templateId, isNewTemplate, router, toast]);

  if (isLoading || !templateInfo) {
    return <div className="h-screen w-screen flex items-center justify-center">Loading editor...</div>;
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
            <h1 className="text-lg font-semibold">{templateInfo.name}</h1>
            <p className="text-xs text-muted-foreground">{isNewTemplate ? "Creating New Template" : `Editing Template ID: ${templateInfo.id}`}</p>
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
          <div className="w-full h-full max-w-4xl">
            <ResumePreview ref={resumePreviewRef} resumeData={resumeData} templates={allTemplates} />
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
