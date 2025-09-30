
"use client";
import { useI18n } from "@/hooks/use-i18n";
import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { FilePlus2, FileText, Wand2, CheckCircle, ChevronLeft, ChevronRight, DownloadCloud, Save, Eye, Loader2, Award, BookCheck, Languages as LanguagesIcon, Heart, type LucideIcon } from "lucide-react";
import type { ResumeBuilderData, ResumeBuilderStep, ResumeHeaderData, ResumeExperienceEntry, ResumeEducationEntry, UserProfile, ResumeTemplate } from "@/types";
import { RESUME_BUILDER_STEPS } from "@/types";
import { useToast } from "@/hooks/use-toast";
import StepHeaderForm from "@/components/features/resume-builder/StepHeaderForm";
import StepExperienceForm from "@/components/features/resume-builder/StepExperienceForm";
import StepEducationForm from "@/components/features/resume-builder/StepEducationForm";
import StepSkillsForm from "@/components/features/resume-builder/StepSkillsForm";
import StepSummaryForm from "@/components/features/resume-builder/StepSummaryForm";
import StepAdditionalDetailsForm from "@/components/features/resume-builder/StepAdditionalDetailsForm";
import StepFinalize from "@/components/features/resume-builder/StepFinalize";
import { PDFViewer } from '@/components/pdf';
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import ResumeBuilderStepper from "@/components/features/resume-builder/ResumeBuilderStepper";
import type { ResumeProfile } from "@/types";
import { useAuth } from "@/hooks/use-auth";
import { useRouter, useSearchParams } from 'next/navigation';
import { getResumeProfiles } from "@/lib/actions/resumes";
import { getResumeTemplates } from "@/lib/actions/templates";
import TemplateSelectionDialog from "@/components/features/resume-builder/TemplateSelectionDialog";
import { getInitialResumeData } from '@/lib/resume-builder-helpers';
import Handlebars from 'handlebars';
import ResumePDFDocument from "@/components/features/resume-builder/ResumePDFDocument";

const logger = {
    log: (message: string, ...args: any[]) => console.log(`[ResumeBuilderPage] ${message}`, ...args),
};

// Define a type for the common section items to resolve the 'never' error
type CommonSection = {
  key: string;
  title: string;
  icon: LucideIcon;
};


export default function ResumeBuilderPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [resumeData, setResumeData] = useState<ResumeBuilderData>(() => getInitialResumeData(user));
  const [editingResumeId, setEditingResumeId] = useState<string | null>(null);
  const { toast } = useToast();
  const resumePreviewRef = useRef<HTMLDivElement>(null);
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [allTemplates, setAllTemplates] = useState<ResumeTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const keyCount = useRef(0);
  useEffect(() => {
    keyCount.current++;
  }, [resumeData]);

  const processTemplateContent = useCallback((templateContent: string, userData: UserProfile | null): ResumeBuilderData => {
    try {
        const parsedData = JSON.parse(templateContent);
        const template = Handlebars.compile(JSON.stringify(parsedData)); // Re-stringify to handle handlebars in the object
        const initialData = getInitialResumeData(userData);
        const hydratedJsonString = template(initialData);
        const hydratedData = JSON.parse(hydratedJsonString);
        
        if (!hydratedData.sectionOrder) {
          hydratedData.sectionOrder = ['summary', 'experience', 'education', 'skills'];
        }
        return hydratedData;
    } catch (error) {
        console.error("Error processing template content:", error);
        toast({ title: "Template Error", description: "Could not process the template content.", variant: "destructive" });
        return getInitialResumeData(userData);
    }
  }, [toast]);

  const loadData = useCallback(async (resumeId: string | null, templateId: string | null) => {
    if (!user) return;
    setIsLoading(true);

    const templates = await getResumeTemplates();
    setAllTemplates(templates);

    if (resumeId) {
      toast({ title: "Loading Resume...", description: "Fetching your resume data to edit." });
      const userResumes = await getResumeProfiles(user.id);
      const resumeToEdit = userResumes.find(r => r.id === resumeId);
      if (resumeToEdit && resumeToEdit.resumeText) {
          try {
              const parsedData = JSON.parse(resumeToEdit.resumeText);
              // Ensure sectionOrder exists for backward compatibility
              if (!parsedData.sectionOrder) {
                parsedData.sectionOrder = ['summary', 'experience', 'education', 'skills'];
              }
              setResumeData(parsedData);
              setEditingResumeId(resumeToEdit.id);
          } catch (e) {
              console.error("Failed to parse resume data:", e);
              toast({ title: "Error Loading Resume", description: "The selected resume data is not in the correct format.", variant: "destructive"});
              setResumeData(getInitialResumeData(user)); // Reset to default
          }
      } else {
          toast({ title: "Resume Not Found", description: "Could not find the selected resume.", variant: "destructive"});
      }
    } else if (templateId) {
       const template = templates.find(t => t.id === templateId);
       if (template && template.content) {
         setResumeData(processTemplateContent(template.content, user));
         setEditingResumeId(null);
       } else {
         toast({ title: "Template Not Found", description: "Could not find the selected template.", variant: "destructive"});
       }
    } else {
      // Default to the first available template if no params
      const defaultTemplate = templates[0];
      if (defaultTemplate && defaultTemplate.content) {
        setResumeData(processTemplateContent(defaultTemplate.content, user));
      }
      setEditingResumeId(null);
    }

    setIsLoading(false);
  }, [user, toast, processTemplateContent]);
  
  useEffect(() => {
    const resumeId = searchParams.get('resumeId');
    const templateId = searchParams.get('templateId');
    if(user) {
        loadData(resumeId, templateId);
    }
  }, [user, searchParams, loadData]);

  const currentStepInfo = RESUME_BUILDER_STEPS[currentStepIndex];
  const currentStep: ResumeBuilderStep = currentStepInfo.id;

  const handleNextStep = () => {
    if (currentStepIndex < RESUME_BUILDER_STEPS.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };
  
  const handleStepClick = (stepId: ResumeBuilderStep) => {
    const stepIndex = RESUME_BUILDER_STEPS.findIndex(s => s.id === stepId);
    if (stepIndex !== -1) {
      setCurrentStepIndex(stepIndex);
    }
  };
  
  const updateHeaderData = (data: Partial<ResumeHeaderData>) => {
    setResumeData(prev => ({ ...prev, header: { ...prev.header, ...data } }));
  };

  const updateExperienceData = (data: ResumeExperienceEntry[]) => {
     setResumeData(prev => ({ ...prev, experience: data }));
  };
  
  const updateEducationData = (data: ResumeEducationEntry[]) => {
    setResumeData(prev => ({...prev, education: data}));
  }

  const updateSkillsData = (skills: string[]) => {
    setResumeData(prev => ({ ...prev, skills }));
  };

  const updateSummaryData = (summary: string) => {
    setResumeData(prev => ({ ...prev, summary }));
  };
  
  const updateAdditionalDetailsData = (details: Partial<ResumeBuilderData['additionalDetails']>) => {
    setResumeData(prev => ({
        ...prev,
        additionalDetails: {
            main: {
                ...(prev.additionalDetails?.main || {}),
                ...(details?.main || {}),
            },
            sidebar: {
                ...(prev.additionalDetails?.sidebar || {}),
                ...(details?.sidebar || {}),
            },
            awards: details?.awards ?? prev.additionalDetails?.awards,
            certifications: details?.certifications ?? prev.additionalDetails?.certifications,
            languages: details?.languages ?? prev.additionalDetails?.languages,
            interests: details?.interests ?? prev.additionalDetails?.interests,
        },
    }));
  };

  const handleTemplateSelect = (template: ResumeTemplate) => {
    if (!resumeData || !template || !user) {
      return;
    }
    
    setResumeData(processTemplateContent(template.content, user));
    setIsTemplateDialogOpen(false);
    toast({
        title: "Template Changed",
        description: `Switched to "${template.name}". Your personal details have been preserved.`,
    });
  };
  
  const handleSaveComplete = (newResumeId: string) => {
    setEditingResumeId(newResumeId);
  };
  
    const commonSections: CommonSection[] = [
    { key: 'awards', title: 'Awards', icon: Award },
    { key: 'certifications', title: 'Certifications', icon: BookCheck },
    { key: 'languages', title: 'Languages', icon: LanguagesIcon },
    { key: 'interests', title: 'Interests', icon: Heart },
  ];


  const renderStepContent = () => {
    switch (currentStep) {
      case 'header':
        return <StepHeaderForm data={resumeData.header} onUpdate={updateHeaderData} />;
      case 'summary':
        return <StepSummaryForm data={resumeData.summary} onUpdate={updateSummaryData}/>;
      case 'experience':
        return <StepExperienceForm data={resumeData.experience} onUpdate={updateExperienceData} />;
      case 'education':
        return <StepEducationForm data={resumeData.education} onUpdate={updateEducationData}/>;
      case 'skills':
        return <StepSkillsForm data={resumeData.skills} onUpdate={updateSkillsData}/>;
      case 'additional-details':
        return <StepAdditionalDetailsForm data={resumeData.additionalDetails} onUpdate={updateAdditionalDetailsData}/>;
      case 'finalize':
        return <StepFinalize resumeData={resumeData} previewRef={resumePreviewRef} editingResumeId={editingResumeId} onSaveComplete={handleSaveComplete} />;
      default:
        return <p>Unknown step.</p>;
    }
  };
  
  if (isLoading || !user) {
    return (
        <div className="flex items-center justify-center h-full">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
    );
  }

  return (
    <>
    <div className="flex flex-col min-h-screen">
      <div className="bg-slate-800 text-white py-3 px-4 md:px-8">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-7 w-7" />
            <h1 className="text-xl font-semibold">Resume Now.</h1>
          </div>
        </div>
      </div>

      <div className="flex-grow flex flex-col lg:flex-row">
        {/* Stepper Sidebar */}
        <aside className="w-full lg:w-72 bg-slate-700 text-slate-200 p-6 space-y-4 flex-shrink-0">
          <ResumeBuilderStepper currentStep={currentStep} onStepClick={handleStepClick} />
           <div className="pt-10 text-xs text-slate-400 space-y-1">
                <p>© {new Date().getFullYear()} JobMatch AI. All rights reserved.</p>
                <div className="space-x-2">
                    <a href="/terms" className="hover:text-white">Terms</a>
                    <a href="/privacy" className="hover:text-white">Privacy Policy</a>
                    <a href="/contact" className="hover:text-white">Contact Us</a>
                </div>
            </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-6 md:p-10 bg-slate-50">
          <div className="max-w-3xl mx-auto">
            {currentStep !== 'finalize' && (
                <p className="text-sm text-slate-500 mb-1">
                    {currentStepInfo.description || `Next up: ${currentStepInfo.title}`}
                </p>
            )}
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-3">
              {currentStepInfo.mainHeading || currentStepInfo.title}
            </h2>
            <div className="w-20 h-1 bg-green-400 mb-6"></div>

             {currentStep !== 'finalize' && (
                <div className="flex items-center gap-2 text-slate-600 mb-8 p-3 bg-yellow-100 border border-yellow-300 rounded-md shadow-sm">
                    <Wand2 className="h-6 w-6 text-yellow-600 shrink-0" />
                    <div>
                        <p className="font-semibold text-yellow-700">Our AI now makes writing easier!</p>
                        <p className="text-xs text-yellow-600">With writing help you can fix mistakes or rephrase sentences to suit your needs.</p>
                    </div>
                </div>
            )}

            <Card className="shadow-xl mb-8 bg-white">
              <CardContent className="p-6">
                {renderStepContent()}
              </CardContent>
            </Card>
            
            <div className="flex justify-between items-center mt-8">
              <Button 
                variant="outline" 
                onClick={handlePrevStep} 
                disabled={currentStepIndex === 0}
                className="border-slate-400 text-slate-700 hover:bg-slate-100 px-8 py-3 text-base"
              >
                <ChevronLeft className="mr-2 h-5 w-5" /> Back
              </Button>
              <Button 
                onClick={handleNextStep}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-base"
              >
                {currentStepIndex === RESUME_BUILDER_STEPS.length - 1 ? 'Finalize & Save' : 'Continue'} 
                {currentStepIndex < RESUME_BUILDER_STEPS.length - 1 && <ChevronRight className="ml-2 h-5 w-5" />}
              </Button>
            </div>
          </div>
        </main>

        {/* Resume Preview Area */}
        <aside className="w-full lg:w-96 bg-white p-6 border-l border-slate-200 shadow-lg flex-shrink-0 overflow-y-auto">
          <div className="sticky top-6">
            <h3 className="text-lg font-semibold text-slate-700 mb-2">PDF Preview</h3>
             <div className="w-full h-[500px] border border-slate-300 rounded-md overflow-hidden">
                <PDFViewer width="100%" height="100%" key={keyCount.current}>
                    <ResumePDFDocument data={resumeData} />
                </PDFViewer>
             </div>
            <Button 
                variant="outline" 
                className="w-full mt-4 border-blue-600 text-blue-600 hover:bg-blue-50" 
                onClick={() => setIsTemplateDialogOpen(true)}
            >
                Change template
            </Button>
          </div>
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
    </>
  );
}
