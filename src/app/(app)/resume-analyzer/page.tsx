
"use client";

import React, { useState, useCallback, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { analyzeResumeAndJobDescription } from '@/ai/flows/analyze-resume-and-job-description';
import type { AnalyzeResumeAndJobDescriptionOutput, ResumeScanHistoryItem, ResumeProfile } from '@/types';
import { sampleUserProfile } from '@/lib/sample-data';
import { Loader2 } from "lucide-react";
import ResumeInputForm from '@/components/features/resume-analyzer/ResumeInputForm';
import AnalysisReport from '@/components/features/resume-analyzer/AnalysisReport';
import ScanHistory from '@/components/features/resume-analyzer/ScanHistory';
import { getResumeProfiles } from '@/lib/actions/resumes';
import { getScanHistory, createScanHistory, updateScanHistory } from '@/lib/actions/resumes';


export default function ResumeAnalyzerPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [analysisReport, setAnalysisReport] = useState<AnalyzeResumeAndJobDescriptionOutput | null>(null);
  const [currentJobDescription, setCurrentJobDescription] = useState('');
  const [currentResumeText, setCurrentResumeText] = useState('');

  const [scanHistory, setScanHistory] = useState<ResumeScanHistoryItem[]>([]);
  const [resumes, setResumes] = useState<ResumeProfile[]>([]);

  const { toast } = useToast();

  useEffect(() => {
    async function loadInitialData() {
      setIsLoading(true);
      const [userResumes, userScanHistory] = await Promise.all([
        getResumeProfiles(sampleUserProfile.id),
        getScanHistory(sampleUserProfile.id)
      ]);
      setResumes(userResumes);
      setScanHistory(userScanHistory);
      setIsLoading(false);
    }
    loadInitialData();
  }, []);

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

      const newScanEntryData: Omit<ResumeScanHistoryItem, 'id' | 'scanDate'> = {
        tenantId: sampleUserProfile.tenantId,
        userId: sampleUserProfile.id,
        resumeId: currentResumeProfile?.id || (resumeFile ? `file-${resumeFile.name}` : 'pasted-text'),
        resumeName: currentResumeProfile?.name || resumeFile?.name || 'Pasted Resume',
        jobTitle: jobTitle || "N/A",
        companyName: companyName || "N/A",
        resumeTextSnapshot: resumeText,
        jobDescriptionText: jobDescription,
        matchScore: detailedReportRes.overallQualityScore ?? detailedReportRes.hardSkillsScore ?? 0,
        bookmarked: false,
      };

      const newScanEntry = await createScanHistory(newScanEntryData);
      if (newScanEntry) {
        setScanHistory(prev => [newScanEntry, ...prev]);
      }

      // This logic for updating resume lastAnalyzed should be a server action
      if (currentResumeProfile) {
        // In a real app: await updateResumeProfile(currentResumeProfile.id, { lastAnalyzed: new Date() });
        setResumes(prevResumes =>
          prevResumes.map(r =>
            r.id === currentResumeProfile.id ? { ...r, lastAnalyzed: new Date().toISOString() } : r
          )
        );
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
    setCurrentResumeText(newResumeText);

    const currentJobData = scanHistory[0] || {};
    
    handleAnalysisSubmit({
      resumeText: newResumeText,
      jobDescription: currentJobDescription,
      jobTitle: currentJobData.jobTitle || '',
      companyName: currentJobData.companyName || '',
      selectedResumeId: currentJobData.resumeId.startsWith('file-') || currentJobData.resumeId === 'pasted-text' ? null : currentJobData.resumeId,
      resumeFile: null,
    });
  }, [scanHistory, currentJobDescription, handleAnalysisSubmit]);

  return (
    <div className="space-y-8">
      <ResumeInputForm
        resumes={resumes}
        isLoading={isLoading}
        onSubmit={handleAnalysisSubmit}
        key={currentResumeText}
        initialResumeText={currentResumeText}
      />

      {isLoading && !analysisReport && (
        <div className="text-center py-8">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="mt-2 text-muted-foreground">AI is working its magic... Please wait.</p>
        </div>
      )}

      {analysisReport && (
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
