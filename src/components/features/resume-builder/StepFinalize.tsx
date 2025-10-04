
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
import ResumePDFDocument from './pdf/ResumePDFDocument';

const PDFDownloadLink = dynamic(
  () => import('@/components/pdf').then((mod) => mod.PDFDownloadLink),
  { 
    ssr: false, 
    loading: () => <Button disabled className="w-full flex-1"><Loader2 className="mr-2 h-5 w-5 animate-spin" />Loading PDF...</Button> 
  }
);


interface StepFinalizeProps {
  resumeData: ResumeBuilderData;
  editingResumeId?: string | null;
  onSaveComplete: (newResumeId: string) => void;
  previewRef: React.RefObject<HTMLDivElement>;
}

// This client-side only component isolates the PDF download link to prevent re-rendering crashes
const ClientPDFDownloadLink: React.FC<{ data: ResumeBuilderData }> = ({ data }) => {
  const [isClient, setIsClient] = useState(false);
  const [key, setKey] = useState(0);

  useEffect(() => {
    setIsClient(true);
    setKey(prev => prev + 1);
  }, [data]);

  if (!isClient) {
    return (
      <Button disabled className="w-full flex-1">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        Loading PDF...
      </Button>
    );
  }

  return (
    <PDFDownloadLink
      key={key}
      document={<ResumePDFDocument data={data} />}
      fileName={`${data.header.fullName || 'resume'}_Resume.pdf`}
      className="flex-1"
    >
      {({ loading }) => (
        <Button disabled={loading} className="w-full bg-green-600 hover:bg-green-700 text-white">
          {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <DownloadCloud className="mr-2 h-5 w-5" />}
          {loading ? 'Generating PDF...' : 'Download as PDF'}
        </Button>
      )}
    </PDFDownloadLink>
  );
};


export default function StepFinalize({ resumeData, editingResumeId, onSaveComplete }: StepFinalizeProps) {
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveResume = async () => {
    if (!currentUser) {
      toast({ title: "Error", description: "You must be logged in to save a resume.", variant: "destructive"});
      return;
    }
    setIsSaving(true);
    
    let savedResume: ResumeProfile | null = null;
    if (editingResumeId) {
        const updateData = {
            name: `${resumeData.header.fullName}'s Resume (${resumeData.templateId})`,
            resumeText: JSON.stringify(resumeData),
            userId: currentUser.id, // Pass userId for ownership verification
            tenantId: currentUser.tenantId, // Pass tenantId for scope
        };
        savedResume = await updateResumeProfile(editingResumeId, updateData);
    } else {
        const createData = {
            name: `${resumeData.header.fullName}'s Resume (${resumeData.templateId})`,
            resumeText: JSON.stringify(resumeData),
            userId: currentUser.id,
            tenantId: currentUser.tenantId,
        };
        savedResume = await createResumeProfile(createData);
    }
   
    if (savedResume) {
      onSaveComplete(savedResume.id);
      toast({
        title: editingResumeId ? "Resume Updated" : "Resume Saved",
        description: `"${savedResume.name}" has been successfully ${editingResumeId ? 'updated' : 'saved'}.`,
      });
      router.push('/my-resumes');
    } else {
       toast({ title: "Save Failed", description: "Could not save the resume to your profile.", variant: "destructive" });
    }
    setIsSaving(false);
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
             <ClientPDFDownloadLink data={resumeData} />
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
