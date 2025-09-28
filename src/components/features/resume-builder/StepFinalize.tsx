
"use client";

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { ResumeBuilderData, ResumeProfile } from "@/types";
import { DownloadCloud, Save, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/hooks/use-auth';
import { createResumeProfile, updateResumeProfile } from '@/lib/actions/resumes';
import { useRouter } from 'next/navigation';
import ResumePDFDocument from './pdf/ResumePDFDocument'; // Import the document directly

// Dynamically import PDF components to ensure they are client-side only
const PDFDownloadLink = dynamic(
  () => import('@react-pdf/renderer').then((mod) => mod.PDFDownloadLink),
  { ssr: false, loading: () => <Button disabled className="w-full flex-1"><Loader2 className="mr-2 h-5 w-5 animate-spin" />Loading PDF...</Button> }
);

interface StepFinalizeProps {
  resumeData: ResumeBuilderData;
  previewRef: React.RefObject<HTMLDivElement>;
  editingResumeId?: string | null;
  onSaveComplete: (newResumeId: string) => void;
}

export default function StepFinalize({ resumeData, editingResumeId, onSaveComplete }: StepFinalizeProps) {
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleSaveResume = async () => {
    console.log('[StepFinalize LOG] 1. handleSaveResume initiated.');
    if (!currentUser) {
      console.log('[StepFinalize LOG] 2. User not found, aborting.');
      toast({ title: "Error", description: "You must be logged in to save a resume.", variant: "destructive"});
      return;
    }
    setIsSaving(true);
    console.log('[StepFinalize LOG] 3. Set isSaving to true.');
    
    let savedResume: ResumeProfile | null = null;
    if (editingResumeId) {
        console.log('[StepFinalize LOG] 4a. In update mode.', { editingResumeId });
        const updateData = {
            name: `${resumeData.header.fullName}'s Resume (${resumeData.templateId})`,
            resumeText: JSON.stringify(resumeData),
        };
        console.log('[StepFinalize LOG] 5a. Prepared updateData:', updateData);
        savedResume = await updateResumeProfile(editingResumeId, updateData);
        console.log('[StepFinalize LOG] 6a. Received response from updateResumeProfile:', savedResume);
        if (savedResume) {
             toast({
                title: "Resume Updated",
                description: `"${savedResume.name}" has been successfully updated.`,
            });
        }
    } else {
        console.log('[StepFinalize LOG] 4b. In create mode.');
        const createData = {
            name: `${resumeData.header.fullName}'s Resume (${resumeData.templateId})`,
            resumeText: JSON.stringify(resumeData),
            userId: currentUser.id,
            tenantId: currentUser.tenantId,
        };
        console.log('[StepFinalize LOG] 5b. Prepared createData:', createData);
        savedResume = await createResumeProfile(createData);
         console.log('[StepFinalize LOG] 6b. Received response from createResumeProfile:', savedResume);
         if (savedResume) {
            toast({
                title: "Resume Saved",
                description: `"${savedResume.name}" has been saved to 'My Resumes'.`,
            });
        }
    }
   
    if (savedResume) {
      console.log('[StepFinalize LOG] 7. Save/update successful, calling onSaveComplete and routing.');
      onSaveComplete(savedResume.id);
      router.push('/my-resumes');
    } else {
       console.log('[StepFinalize LOG] 8. Save/update failed.');
       toast({ title: "Save Failed", description: "Could not save the resume to your profile.", variant: "destructive" });
    }
    setIsSaving(false);
    console.log('[StepFinalize LOG] 9. Set isSaving to false.');
  };
  
  return (
    <div className="space-y-6">
      <Card className="border-green-500 shadow-green-200/50 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-green-600">Congratulations!</CardTitle>
          <CardDescription>Your resume is ready. Review the preview on the right one last time.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-slate-700">You've successfully built your resume. You can now download it or save it to your profile for future use and analysis.</p>
          <div className="flex flex-col sm:flex-row gap-3">
             {isClient && resumeData && (
                <PDFDownloadLink
                    document={<ResumePDFDocument data={resumeData} />}
                    fileName={`${resumeData.header.fullName || 'resume'}_Resume.pdf`}
                    className="flex-1"
                >
                    {({ loading }) => (
                        <Button disabled={loading} className="w-full bg-green-600 hover:bg-green-700 text-white">
                            {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <DownloadCloud className="mr-2 h-5 w-5" />}
                            {loading ? 'Generating PDF...' : 'Download as PDF'}
                        </Button>
                    )}
                </PDFDownloadLink>
             )}
            <Button onClick={handleSaveResume} disabled={isSaving} variant="outline" className="flex-1 border-slate-400 text-slate-700 hover:bg-slate-100">
              {isSaving ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
              {isSaving ? 'Saving...' : 'Save to My Resumes'}
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Card className="mt-6">
          <CardHeader>
              <CardTitle className="text-lg">Next Steps</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-slate-600">
              <p>✓ Consider using our <a href="/resume-analyzer" className="text-blue-600 hover:underline font-medium">Resume Analyzer</a> to check its match against specific job descriptions.</p>
              <p>✓ Explore <a href="/resume-templates" className="text-blue-600 hover:underline font-medium">different templates</a> if you want to change the look and feel.</p>
              <p>✓ Start tracking your job applications with the <a href="/job-tracker" className="text-blue-600 hover:underline font-medium">Job Tracker</a>.</p>
          </CardContent>
      </Card>
    </div>
  );
}
