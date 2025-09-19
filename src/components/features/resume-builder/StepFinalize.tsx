
"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { ResumeBuilderData, ResumeProfile } from "@/types";
import { DownloadCloud, Save, Eye, Loader2 } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import jsPDF from 'jspdf';
import { createResumeProfile, updateResumeProfile } from '@/lib/actions/resumes';
import { useRouter } from 'next/navigation';

interface StepFinalizeProps {
  resumeData: ResumeBuilderData;
  previewRef: React.RefObject<HTMLDivElement>;
  editingResumeId?: string | null;
  onSaveComplete: (newResumeId: string) => void;
}

// Function to split text into lines that fit within a max width
const splitTextToSize = (text: string, maxWidth: number, pdf: jsPDF): string[] => {
  return pdf.splitTextToSize(text, maxWidth);
};


export default function StepFinalize({ resumeData, previewRef, editingResumeId, onSaveComplete }: StepFinalizeProps) {
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const router = useRouter();
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    toast({
      title: "Generating PDF...",
      description: "Please wait while your resume is being prepared.",
    });

    try {
      const pdf = new jsPDF('p', 'pt', 'a4');
      const pageHeight = pdf.internal.pageSize.getHeight();
      const pageWidth = pdf.internal.pageSize.getWidth();
      const margin = 40;
      const contentWidth = pageWidth - margin * 2;
      let y = margin;
      
      const checkAndAddPage = (spaceNeeded: number) => {
        if (y + spaceNeeded > pageHeight - margin) {
          pdf.addPage();
          y = margin;
        }
      };

      // --- RENDER HEADER ---
      pdf.setFontSize(24);
      pdf.setFont('helvetica', 'bold');
      pdf.text(resumeData.header.fullName, pageWidth / 2, y, { align: 'center' });
      y += 28;

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      const contactInfo = [
        resumeData.header.phone,
        resumeData.header.email,
        resumeData.header.linkedin,
        resumeData.header.portfolio,
      ].filter(Boolean).join(' | ');
      pdf.text(contactInfo, pageWidth / 2, y, { align: 'center' });
      y += 12;

      if (resumeData.header.address) {
        pdf.text(resumeData.header.address, pageWidth / 2, y, { align: 'center' });
        y += 12;
      }
      y += 10;
      pdf.setLineWidth(0.5);
      pdf.line(margin, y, pageWidth - margin, y);
      y += 20;

      // --- RENDER SECTIONS ---
      for (const sectionId of resumeData.sectionOrder) {
        switch (sectionId) {
          case 'summary':
            checkAndAddPage(40);
            pdf.setFontSize(12);
            pdf.setFont('helvetica', 'bold');
            pdf.text("SUMMARY", margin, y);
            y += 15;
            pdf.setFontSize(10);
            pdf.setFont('helvetica', 'normal');
            const summaryLines = splitTextToSize(resumeData.summary, contentWidth, pdf);
            pdf.text(summaryLines, margin, y);
            y += summaryLines.length * 12 + 10;
            break;

          case 'experience':
            checkAndAddPage(40);
            pdf.setFontSize(12);
            pdf.setFont('helvetica', 'bold');
            pdf.text("EXPERIENCE", margin, y);
            y += 15;
            resumeData.experience.forEach(exp => {
              checkAndAddPage(60);
              pdf.setFontSize(11);
              pdf.setFont('helvetica', 'bold');
              pdf.text(exp.jobTitle, margin, y);
              pdf.setFont('helvetica', 'normal');
              pdf.text(`${exp.startDate} - ${exp.endDate || 'Present'}`, pageWidth - margin, y, { align: 'right' });
              y += 13;

              pdf.setFontSize(10);
              pdf.text(`${exp.company}${exp.location ? `, ${exp.location}` : ''}`, margin, y);
              y += 15;

              pdf.setFontSize(10);
              if (exp.responsibilities) {
                  exp.responsibilities.split('\n').forEach(line => {
                      const cleanedLine = line.replace(/^-/, '').trim();
                      if (cleanedLine) {
                          const responsibilityLines = splitTextToSize(cleanedLine, contentWidth - 15, pdf);
                          checkAndAddPage(responsibilityLines.length * 12);
                          pdf.text(`• ${responsibilityLines[0]}`, margin + 5, y);
                          if (responsibilityLines.length > 1) {
                              pdf.text(responsibilityLines.slice(1), margin + 15, y + 12);
                              y += responsibilityLines.length * 12;
                          } else {
                              y += 12;
                          }
                      }
                  });
              }
              y += 10;
            });
            break;

          case 'education':
            checkAndAddPage(40);
            pdf.setFontSize(12);
            pdf.setFont('helvetica', 'bold');
            pdf.text("EDUCATION", margin, y);
            y += 15;
            resumeData.education.forEach(edu => {
              checkAndAddPage(30);
              pdf.setFontSize(11);
              pdf.setFont('helvetica', 'bold');
              pdf.text(edu.degree, margin, y);
              pdf.setFont('helvetica', 'normal');
              pdf.text(edu.graduationYear, pageWidth - margin, y, { align: 'right' });
              y += 13;
              pdf.setFontSize(10);
              pdf.text(edu.university, margin, y);
              y += 20;
            });
            break;

          case 'skills':
            checkAndAddPage(40);
            pdf.setFontSize(12);
            pdf.setFont('helvetica', 'bold');
            pdf.text("SKILLS", margin, y);
            y += 15;
            pdf.setFontSize(10);
            pdf.setFont('helvetica', 'normal');
            const skillsText = resumeData.skills.join(', ');
            const skillLines = splitTextToSize(skillsText, contentWidth, pdf);
            pdf.text(skillLines, margin, y);
            y += skillLines.length * 12 + 10;
            break;
        }
      }
      
      pdf.save(`${resumeData.header.fullName}_Resume.pdf`);

    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Download Failed",
        description: "An unexpected error occurred while generating the PDF.",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };


  const handleSaveResume = async () => {
    if (!currentUser) {
      toast({ title: "Error", description: "You must be logged in to save a resume.", variant: "destructive"});
      return;
    }
    setIsSaving(true);
    
    const resumeProfileData = {
        name: `${resumeData.header.fullName}'s Resume (${resumeData.templateId})`,
        resumeText: JSON.stringify(resumeData), // Store structured data
    };

    let savedResume: ResumeProfile | null = null;
    if (editingResumeId) {
        // Update existing resume
        savedResume = await updateResumeProfile(editingResumeId, {
            ...resumeProfileData,
            userId: currentUser.id,
            tenantId: currentUser.tenantId,
        });
        if (savedResume) {
             toast({
                title: "Resume Updated",
                description: `"${savedResume.name}" has been successfully updated.`,
            });
        }
    } else {
        // Create new resume
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
            <Button onClick={handleDownload} disabled={isDownloading || isSaving} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
              {isDownloading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <DownloadCloud className="mr-2 h-5 w-5" />}
              {isDownloading ? 'Generating PDF...' : 'Download as PDF'}
            </Button>
            <Button onClick={handleSaveResume} disabled={isDownloading || isSaving} variant="outline" className="flex-1 border-slate-400 text-slate-700 hover:bg-slate-100">
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
