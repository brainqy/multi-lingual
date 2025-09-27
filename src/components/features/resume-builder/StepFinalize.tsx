
"use client";

import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { ResumeBuilderData, ResumeProfile } from "@/types";
import { DownloadCloud, Save, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/hooks/use-auth';
import { createResumeProfile, updateResumeProfile } from '@/lib/actions/resumes';
import { useRouter } from 'next/navigation';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useState } from 'react';

interface StepFinalizeProps {
  resumeData: ResumeBuilderData;
  previewRef: React.RefObject<HTMLDivElement>;
  editingResumeId?: string | null;
  onSaveComplete: (newResumeId: string) => void;
}

export default function StepFinalize({ resumeData, previewRef, editingResumeId, onSaveComplete }: StepFinalizeProps) {
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleSaveResume = async () => {
    if (!currentUser) {
      toast({ title: "Error", description: "You must be logged in to save a resume.", variant: "destructive"});
      return;
    }
    setIsSaving(true);
    
    const resumeProfileData = {
        name: `${resumeData.header.fullName}'s Resume (${resumeData.templateId})`,
        resumeText: JSON.stringify(resumeData),
    };

    let savedResume: ResumeProfile | null = null;
    if (editingResumeId) {
        // Correctly pass only the fields that can be updated
        savedResume = await updateResumeProfile(editingResumeId, {
            name: resumeProfileData.name,
            resumeText: resumeProfileData.resumeText,
        });
        if (savedResume) {
             toast({
                title: "Resume Updated",
                description: `"${savedResume.name}" has been successfully updated.`,
            });
        }
    } else {
        savedResume = await createResumeProfile({
            ...resumeProfileData,
            userId: currentUser.id,
            tenantId: currentUser.tenantId,
        });
         if (savedResume) {
            toast({
                title: "Resume Saved",
                description: `"${savedResume.name}" has been saved to 'My Resumes'.`,
            });
        }
    }
   
    if (savedResume) {
      onSaveComplete(savedResume.id);
      router.push('/my-resumes');
    } else {
       toast({ title: "Save Failed", description: "Could not save the resume to your profile.", variant: "destructive" });
    }
    setIsSaving(false);
  };

  const handleDownloadPdf = async () => {
    if (!previewRef.current) {
        toast({ title: 'Error', description: 'Preview element not found for download.', variant: 'destructive' });
        return;
    }
    setIsDownloading(true);

    try {
        const canvas = await html2canvas(previewRef.current, {
            scale: 2, // Increase resolution for better quality
            useCORS: true,
            logging: true,
        });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
            orientation: 'p',
            unit: 'mm',
            format: 'a4',
        });

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        const canvasAspectRatio = canvasWidth / canvasHeight;
        const pdfAspectRatio = pdfWidth / pdfHeight;

        let finalPdfWidth, finalPdfHeight;

        if (canvasAspectRatio > pdfAspectRatio) {
            finalPdfWidth = pdfWidth;
            finalPdfHeight = pdfWidth / canvasAspectRatio;
        } else {
            finalPdfHeight = pdfHeight;
            finalPdfWidth = pdfHeight * canvasAspectRatio;
        }

        const x = (pdfWidth - finalPdfWidth) / 2;
        const y = 0; // Align to top

        pdf.addImage(imgData, 'PNG', x, y, finalPdfWidth, finalPdfHeight);
        pdf.save(`${resumeData.header.fullName || 'resume'}_Resume.pdf`);
    } catch (error) {
        console.error("Failed to generate PDF:", error);
        toast({ title: 'PDF Generation Failed', description: 'An error occurred while creating the PDF.', variant: 'destructive' });
    } finally {
        setIsDownloading(false);
    }
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
            <Button onClick={handleDownloadPdf} disabled={isDownloading} className="w-full flex-1 bg-green-600 hover:bg-green-700 text-white">
              {isDownloading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <DownloadCloud className="mr-2 h-5 w-5" />}
              {isDownloading ? 'Generating PDF...' : 'Download as PDF'}
            </Button>
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
