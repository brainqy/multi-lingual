"use client";

import type React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { ResumeBuilderData } from "@/types";
import { DownloadCloud, Save, Eye } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { sampleResumeProfiles, sampleUserProfile } from '@/lib/sample-data';
import type { ResumeProfile } from '@/types'; // Added import

interface StepFinalizeProps {
  resumeData: ResumeBuilderData;
}

export default function StepFinalize({ resumeData }: StepFinalizeProps) {
  const { toast } = useToast();

  const handleDownload = () => {
    toast({
      title: "Download Started (Mock)",
      description: "Your resume would be downloaded as a PDF.",
    });
    // In a real app, generate PDF from resumeData and trigger download
  };

  const handleSaveResume = () => {
    const newResume: ResumeProfile = {
      id: `resume-${Date.now()}`,
      tenantId: sampleUserProfile.tenantId,
      userId: sampleUserProfile.id,
      name: `${resumeData.header.fullName}'s Resume (${new Date().toLocaleDateString()})`,
      resumeText: JSON.stringify(resumeData), // Store structured data or a formatted text version
      lastAnalyzed: undefined,
    };
    // This should ideally update a global state or call an API
    sampleResumeProfiles.unshift(newResume); 
    toast({
      title: "Resume Saved (Mock)",
      description: `"${newResume.name}" has been saved to 'My Resumes'.`,
    });
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
            <Button onClick={handleDownload} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
              <DownloadCloud className="mr-2 h-5 w-5" /> Download as PDF
            </Button>
            <Button onClick={handleSaveResume} variant="outline" className="flex-1 border-slate-400 text-slate-700 hover:bg-slate-100">
              <Save className="mr-2 h-5 w-5" /> Save to My Resumes
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