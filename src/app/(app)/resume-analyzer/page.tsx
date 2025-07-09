
"use client";

import React, { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { analyzeResumeAndJobDescription } from '@/ai/flows/analyze-resume-and-job-description';
import type { AnalyzeResumeAndJobDescriptionOutput, ResumeScanHistoryItem, ResumeProfile } from '@/types';
import { sampleResumeScanHistory as initialScanHistory, sampleResumeProfiles, sampleUserProfile } from '@/lib/sample-data';
import { Loader2 } from "lucide-react";
import ResumeInputForm from '@/components/features/resume-analyzer/ResumeInputForm';
import AnalysisReport from '@/components/features/resume-analyzer/AnalysisReport';
import ScanHistory from '@/components/features/resume-analyzer/ScanHistory';

export default function ResumeAnalyzerPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [analysisReport, setAnalysisReport] = useState<AnalyzeResumeAndJobDescriptionOutput | null>(null);
  const [currentJobDescription, setCurrentJobDescription] = useState('');
  const [currentResumeText, setCurrentResumeText] = useState('');

  const [scanHistory, setScanHistory] = useState<ResumeScanHistoryItem[]>(
    initialScanHistory.filter(item => item.userId === sampleUserProfile.id)
  );
  const [resumes, setResumes] = useState<ResumeProfile[]>(
    sampleResumeProfiles.filter(r => r.userId === sampleUserProfile.id)
  );

  const { toast } = useToast();

  const handleAnalysisSubmit = useCallback(async (formData: {
    resumeText: string;
    jobDescription: string;
    jobTitle: string;
    companyName: string;
    selectedResumeId: string | null;
    resumeFile: File | null;
  }) => {
    const { resumeText, jobDescription, jobTitle, companyName, selectedResumeId, resumeFile } = formData;
    
    if (!resumeText.trim()) {
      toast({ title: "Error", description: "Please select or provide resume text.", variant: "destructive" });
      return;
    }
    if (!jobDescription.trim()) {
      toast({ title: "Error", description: "Please provide a job description.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    setAnalysisReport(null);
    setCurrentResumeText(resumeText);
    setCurrentJobDescription(jobDescription);

    const currentResumeProfile = selectedResumeId ? resumes.find(r => r.id === selectedResumeId) : null;

    try {
      const detailedReportRes = await analyzeResumeAndJobDescription({
        resumeText,
        jobDescriptionText: jobDescription,
        jobTitle: jobTitle || undefined,
        companyName: companyName || undefined,
      });
      setAnalysisReport(detailedReportRes);

      const newScanEntry: ResumeScanHistoryItem = {
        id: `scan-${Date.now()}`,
        tenantId: sampleUserProfile.tenantId,
        userId: sampleUserProfile.id,
        resumeId: currentResumeProfile?.id || (resumeFile ? `file-${resumeFile.name}` : 'pasted-text'),
        resumeName: currentResumeProfile?.name || resumeFile?.name || 'Pasted Resume',
        jobTitle: jobTitle || "N/A",
        companyName: companyName || "N/A",
        resumeTextSnapshot: resumeText,
        jobDescriptionText: jobDescription,
        scanDate: new Date().toISOString(),
        matchScore: detailedReportRes.overallQualityScore ?? detailedReportRes.hardSkillsScore ?? 0,
        bookmarked: false,
      };
      setScanHistory(prev => [newScanEntry, ...prev]);

      if (currentResumeProfile) {
        setResumes(prevResumes =>
          prevResumes.map(r =>
            r.id === currentResumeProfile.id ? { ...r, lastAnalyzed: new Date().toISOString().split('T')[0] } : r
          )
        );
        const globalResumeIndex = sampleResumeProfiles.findIndex(r => r.id === currentResumeProfile.id);
        if (globalResumeIndex !== -1) {
          sampleResumeProfiles[globalResumeIndex].lastAnalyzed = new Date().toISOString().split('T')[0];
        }
      }
      toast({ title: "Analysis Complete", description: "Resume analysis results are ready." });
    } catch (error: any) {
      const errorMessage = (error.message || String(error)).toLowerCase();
      if (errorMessage.includes('quota') || errorMessage.includes('billing')) {
          toast({
              title: "API Usage Limit Exceeded",
              description: "You have exceeded your Gemini API usage limit. Please check your Google Cloud billing account.",
              variant: "destructive",
              duration: 9000,
          });
      } else {
        toast({ title: "Analysis Failed", description: `An error occurred during analysis: ${error.message || String(error)}`, variant: "destructive", duration: 7000 });
      }
      setAnalysisReport(null);
    } finally {
      setIsLoading(false);
      const reportSection = document.getElementById('analysis-report-section');
      if (reportSection) reportSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [resumes, toast]);

  const handleRewriteComplete = useCallback((newResumeText: string) => {
    // This will trigger a re-render in ResumeInputForm via its props
    setCurrentResumeText(newResumeText);

    const currentReportData = analysisReport;
    const currentJobData = scanHistory[0] || {};
    
    // Trigger a new analysis with the rewritten resume
    handleAnalysisSubmit({
      resumeText: newResumeText,
      jobDescription: currentJobDescription,
      jobTitle: currentJobData.jobTitle || '',
      companyName: currentJobData.companyName || '',
      selectedResumeId: currentJobData.resumeId.startsWith('file-') || currentJobData.resumeId === 'pasted-text' ? null : currentJobData.resumeId,
      resumeFile: null, // We don't have the file object anymore, but it's not needed for re-analysis
    });
  }, [analysisReport, scanHistory, currentJobDescription, handleAnalysisSubmit]);


  return (
    <div className="space-y-8">
      <ResumeInputForm
        resumes={resumes}
        isLoading={isLoading}
        onSubmit={handleAnalysisSubmit}
        key={currentResumeText} // Force re-mount if text is changed by rewrite
        initialResumeText={currentResumeText}
      />

      {isLoading && (
        <div className="text-center py-8">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="mt-2 text-muted-foreground">AI is working its magic... Please wait.</p>
        </div>
      )}

      {analysisReport && !isLoading && (
        <AnalysisReport
          analysisReport={analysisReport}
          resumeText={currentResumeText}
          jobDescription={currentJobDescription}
          jobTitle={scanHistory[0]?.jobTitle || ''}
          companyName={scanHistory[0]?.companyName || ''}
          onRewriteComplete={handleRewriteComplete}
          onStartNewAnalysis={() => setAnalysisReport(null)}
          onRescan={handleAnalysisSubmit}
        />
      )}

      <ScanHistory
        scanHistory={scanHistory}
        setScanHistory={setScanHistory}
        setAnalysisReport={setAnalysisReport}
        setIsLoading={setIsLoading}
        setResumes={setResumes}
      />
    </div>
  );
}
