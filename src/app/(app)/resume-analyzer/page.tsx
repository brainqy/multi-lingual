
"use client";

import React, { useState, type FormEvent, useEffect, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { 
    Search, UploadCloud, ArrowRight, Loader2, Download, CheckCircle, BarChart, Edit3, 
    Wrench, AlignLeft, SlidersHorizontal, Wand2, Lightbulb, Brain, SearchCheck, 
    ChevronsUpDown, ListChecks, History, Star, Trash2, Bookmark, PlusCircle, HelpCircle, XCircle, Info, MessageSquare, ThumbsUp, Users, FileText, FileCheck2, EyeOff, Columns, Palette, CalendarDays,
    Target, ListX, Sparkles, RefreshCcw, UserRoundCog, WandSparkles, ClipboardCopy, Check, Save
} from "lucide-react"; 
import { analyzeResumeAndJobDescription, type AnalyzeResumeAndJobDescriptionOutput } from '@/ai/flows/analyze-resume-and-job-description';
import { useToast } from '@/hooks/use-toast';
import { sampleResumeScanHistory as initialScanHistory, sampleResumeProfiles, sampleUserProfile } from '@/lib/sample-data';
import type { ResumeScanHistoryItem, ResumeProfile, AtsFormattingIssue, IdentifyResumeIssuesOutput } from '@/types';
import { format } from 'date-fns';
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import ScoreCircle from '@/components/ui/score-circle';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { PowerEditDialog } from '@/components/features/resume-analyzer/PowerEditDialog';

const getIssuesFromScore = (score?: number): number => {
  if (score === undefined || score === null) return 0;
  if (score >= 90) return 0;
  if (score >= 75) return 1;
  if (score >= 60) return 2;
  if (score >= 40) return 3;
  if (score >= 20) return 4;
  return 5;
};


export default function ResumeAnalyzerPage() {
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [analysisReport, setAnalysisReport] = useState<AnalyzeResumeAndJobDescriptionOutput | null>(null);
  const [scanHistory, setScanHistory] = useState<ResumeScanHistoryItem[]>(initialScanHistory.filter(item => item.userId === sampleUserProfile.id));
  const [resumes, setResumes] = useState<ResumeProfile[]>(sampleResumeProfiles.filter(r => r.userId === sampleUserProfile.id));
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null);
  const [historyFilter, setHistoryFilter] = useState<'all' | 'highest' | 'starred' | 'archived'>('all');

  const [activeTab, setActiveTab] = useState('full_report');
  const [activeAccordionItems, setActiveAccordionItems] = useState<string[]>([]);
  const [isPowerEditDialogOpen, setIsPowerEditDialogOpen] = useState(false);
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [newResumeName, setNewResumeName] = useState('');

  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      setResumeFile(file);
      setSelectedResumeId(null);
      setResumeText('');
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setResumeText(text);
         toast({
          title: "File Content Loaded",
          description: `Loaded content from ${file.name}.`,
        });
      };
      reader.onerror = () => {
         toast({
          title: "File Read Error",
          description: `Could not read content from ${file.name}. Simulating content instead.`,
           variant: "destructive"
        });
        // Fallback simulation
        setResumeText(`Simulated content for ${file.name}.\n\nSkills: React, Node.js, Python.\nExperience: Led a team of 5 developers.`);
      };
      reader.readAsText(file);
    }
  };


   useEffect(() => {
    const selectedResume = resumes.find(r => r.id === selectedResumeId);
    if (selectedResume) {
      setResumeText(selectedResume.resumeText ?? '');
      toast({ title: "Resume Loaded", description: `Loaded content for ${selectedResume.name}.`});
    }
   }, [selectedResumeId, resumes, toast]);

  const handleSubmit = async (event?: FormEvent) => {
    if(event) event.preventDefault();
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
    let currentResumeText = resumeText;
    
    const currentResumeProfile = selectedResumeId ? resumes.find(r => r.id === selectedResumeId) : null;

    try {
      const detailedReportRes = await analyzeResumeAndJobDescription({ 
        resumeText: currentResumeText, 
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
        resumeTextSnapshot: currentResumeText,
        jobDescriptionText: jobDescription,
        scanDate: new Date().toISOString(),
        matchScore: detailedReportRes.overallQualityScore ?? detailedReportRes.hardSkillsScore ?? 0,
        bookmarked: false,
      };
      setScanHistory(prev => [newScanEntry, ...prev]);
      
      if (currentResumeProfile) {
        setResumes(prevResumes => prevResumes.map(r => r.id === currentResumeProfile.id ? {...r, lastAnalyzed: new Date().toISOString().split('T')[0]} : r));
        const globalResumeIndex = sampleResumeProfiles.findIndex(r => r.id === currentResumeProfile.id);
        if (globalResumeIndex !== -1) {
            sampleResumeProfiles[globalResumeIndex].lastAnalyzed = new Date().toISOString().split('T')[0];
        }
      }
      toast({ title: "Analysis Complete", description: "Resume analysis results are ready." });
    } catch (error: any) {
      toast({ title: "Analysis Failed", description: `An error occurred during analysis: ${error.message || String(error)}`, variant: "destructive", duration: 7000 });
      setAnalysisReport(null);
    } finally {
      setIsLoading(false);
      const reportSection = document.getElementById('analysis-report-section');
      if (reportSection) reportSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleDownloadReport = () => {
    toast({ title: "Download Report (Mock)", description: "PDF report generation is mocked. Printing the page to PDF can be an alternative."});
  };
  
  const handleStartNewAnalysis = () => {
    setResumeFile(null);
    setAnalysisReport(null); 
    setJobTitle('');
    setCompanyName('');
    toast({ title: "Ready for New Analysis", description: "Modify resume/JD and click Analyze, or upload/select a new resume."});
    const resumeInputSection = document.getElementById('resume-input-section');
    if (resumeInputSection) resumeInputSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handlePowerEdit = () => {
    if (!resumeText.trim() || !jobDescription.trim()) {
      toast({ title: "Cannot Power Edit", description: "Please ensure both a resume and a job description are provided before using Power Edit.", variant: "destructive" });
      return;
    }
    setIsPowerEditDialogOpen(true);
  };
  
  const handleRewriteComplete = (newResume: string) => {
    setResumeText(newResume);
    setIsPowerEditDialogOpen(false);
    toast({ title: "Resume Updated!", description: "Re-analyzing with the new content..." });
    setTimeout(() => {
        handleSubmit(); 
    }, 100);
  };

  const handleViewReport = async (item: ResumeScanHistoryItem) => {
    if (!item.resumeTextSnapshot || !item.jobDescriptionText) {
        toast({ title: "Cannot View Report", description: "Missing resume or job description text for this historical scan.", variant: "destructive" });
        return;
    }
    setResumeText(item.resumeTextSnapshot);
    setJobDescription(item.jobDescriptionText);
    setJobTitle(item.jobTitle || '');
    setCompanyName(item.companyName || '');
    setResumeFile(null); 
    setSelectedResumeId(item.resumeId.startsWith('file-') || item.resumeId === 'pasted-text' ? null : item.resumeId);
    
    toast({ title: "Loading Historical Scan...", description: "Re-generating analysis for the selected scan." });
    setIsLoading(true);
    try {
      const detailedReportRes = await analyzeResumeAndJobDescription({ 
        resumeText: item.resumeTextSnapshot, 
        jobDescriptionText: item.jobDescriptionText,
        jobTitle: item.jobTitle || undefined,
        companyName: item.companyName || undefined,
      });
      setAnalysisReport(detailedReportRes);
      toast({ title: "Historical Report Loaded", description: "The analysis report for the selected scan has been re-generated." });
    } catch (error: any) {
      toast({ title: "Report Load Failed", description: `An error occurred while re-generating the historical report: ${error.message || String(error)}`, variant: "destructive", duration: 7000 });
      setAnalysisReport(null);
    } finally {
      setIsLoading(false);
      const reportSection = document.getElementById('analysis-report-section');
      if (reportSection) reportSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleToggleBookmark = (scanId: string) => {
    setScanHistory(prevHistory => {
      const updatedHistory = prevHistory.map(item =>
        item.id === scanId ? { ...item, bookmarked: !item.bookmarked } : item
      );
      const bookmarkedItem = updatedHistory.find(item => item.id === scanId);
      const globalIndex = initialScanHistory.findIndex(item => item.id === scanId);
      if (globalIndex !== -1) initialScanHistory[globalIndex].bookmarked = bookmarkedItem?.bookmarked;

      toast({
        title: bookmarkedItem?.bookmarked ? "Scan Bookmarked" : "Bookmark Removed",
        description: `Scan for ${bookmarkedItem?.jobTitle || 'Job'} has been ${bookmarkedItem?.bookmarked ? 'bookmarked' : 'unbookmarked'}.`
      });
      return updatedHistory;
    });
  };

  const handleDeleteScan = (scanId: string) => {
      setScanHistory(prevHistory => prevHistory.filter(item => item.id !== scanId));
      const globalIndex = initialScanHistory.findIndex(item => item.id === scanId);
      if (globalIndex !== -1) initialScanHistory.splice(globalIndex, 1);
      toast({ title: "Scan Deleted", description: "Scan history entry removed." });
  };
  
  const openSaveDialog = () => {
    const currentScanDetails = scanHistory[0];
    const defaultName = currentScanDetails?.jobTitle ? `Resume for ${currentScanDetails.jobTitle}` : `New Resume Version (${new Date().toLocaleDateString()})`;
    setNewResumeName(defaultName);
    setIsSaveDialogOpen(true);
  };
  
  const handleSaveResume = () => {
    if (!analysisReport || !resumeText) {
        toast({ title: "Cannot Save", description: "No resume text or report to save.", variant: "destructive"});
        return;
    }
    if (!newResumeName.trim()) {
      toast({ title: "Name Required", description: "Please provide a name for this resume version.", variant: "destructive" });
      return;
    }

    const newResume: ResumeProfile = {
        id: `resume-${Date.now()}`,
        tenantId: sampleUserProfile.tenantId,
        userId: sampleUserProfile.id,
        name: newResumeName,
        resumeText: resumeText,
        lastAnalyzed: new Date().toISOString().split('T')[0]
    };
    sampleResumeProfiles.unshift(newResume);
    setResumes(prev => [newResume, ...prev]);
    toast({ title: "Resume Saved", description: `"${newResume.name}" has been saved to My Resumes.`});
    setIsSaveDialogOpen(false);
  };

  const filteredScanHistory = useMemo(() => {
    let filtered = [...scanHistory];
    if (historyFilter === 'highest') {
      filtered.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
    } else if (historyFilter === 'starred') {
      filtered = filtered.filter(item => item.bookmarked);
    } else if (historyFilter === 'archived') {
      filtered = filtered.filter(item => (item as any).archived === true); 
    }
    return filtered;
  }, [scanHistory, historyFilter]);

  const summaryStats = useMemo(() => {
    const totalScans = scanHistory.length;
    const uniqueResumes = new Set(scanHistory.map(s => s.resumeId)).size;
    const maxScore = scanHistory.reduce((max, s) => Math.max(max, s.matchScore || 0), 0);
    const highScoringCount = scanHistory.filter(s => (s.matchScore || 0) >= 80).length;
    return { totalScans, uniqueResumes, maxScore, highScoringCount };
  }, [scanHistory]);
  
  const getSearchabilityIssueCount = (details?: AnalyzeResumeAndJobDescriptionOutput['searchabilityDetails']): number => {
      if (!details) return 0;
      let issues = 0;
      if (details.hasPhoneNumber === false) issues++;
      if (details.hasEmail === false) issues++;
      if (details.hasAddress === false) issues++;
      if (details.jobTitleMatchesJD === false) issues++;
      if (details.hasWorkExperienceSection === false) issues++;
      if (details.hasEducationSection === false) issues++;
      if (details.hasProfessionalSummary === false) issues++;
      return issues;
  };
  
   const categoryIssues = useMemo(() => {
    if (!analysisReport) return {};
    return {
      searchability: getSearchabilityIssueCount(analysisReport.searchabilityDetails),
      recruiterTips: analysisReport.recruiterTips?.filter(tip => tip.status === 'negative').length || 0,
      formatting: analysisReport.standardFormattingIssues?.length || 0,
      highlights: getIssuesFromScore(analysisReport.highlightsScore),
      hardSkills: analysisReport.missingSkills?.length || 0,
      softSkills: getIssuesFromScore(analysisReport.softSkillsScore),
      atsCompliance: (analysisReport.standardFormattingIssues?.length || 0) + (analysisReport.undefinedAcronyms?.length || 0),
    };
  }, [analysisReport]);

  const handleNavigateToIssue = (tab: string, sectionId: string) => {
    setActiveTab(tab);

    setTimeout(() => {
        setActiveAccordionItems(prev => {
            const newSet = new Set(prev);
            newSet.add(sectionId);
            return Array.from(newSet);
        });

        setTimeout(() => {
            const element = document.getElementById(sectionId);
            element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 50);
    }, 50);
  };


  return (
    <div className="space-y-8">
    <TooltipProvider>
      <Card className="shadow-xl" id="resume-input-section">
        <CardHeader>
          <CardTitle className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Search className="h-8 w-8 text-primary" /> Resume Analyzer
          </CardTitle>
          <CardDescription>Upload your resume and paste a job description to get an AI-powered analysis and match score.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                 <div className="flex items-center gap-2">
                   <Label htmlFor="resume-select" className="text-lg font-medium">Select Existing Resume</Label>
                   <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" type="button" className="h-5 w-5 p-0"><HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" /></Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Choose a resume you've previously saved or analyzed.</p>
                      </TooltipContent>
                    </Tooltip>
                 </div>
                 <select
                    id="resume-select"
                    value={selectedResumeId || ''}
                    onChange={(e) => { setSelectedResumeId(e.target.value || null); if(e.target.value) {setResumeFile(null); setResumeText(resumes.find(r => r.id === e.target.value)?.resumeText || '');} }}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                 >
                    <option value="">-- Select or Paste/Upload Below --</option>
                    {resumes.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                 </select>

                <div className="relative flex items-center my-2">
                    <div className="flex-grow border-t border-muted"></div>
                    <span className="flex-shrink mx-4 text-muted-foreground text-xs uppercase">OR</span>
                    <div className="flex-grow border-t border-muted"></div>
                </div>

                <Label htmlFor="resume-file-upload" className="text-lg font-medium">Upload New Resume</Label>
                <div className="flex items-center justify-center w-full">
                    <label htmlFor="resume-file-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-secondary/50 transition-colors">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <UploadCloud className="w-8 h-8 mb-2 text-muted-foreground" />
                            <p className="mb-1 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag & drop</p>
                            <p className="text-xs text-muted-foreground">PDF, DOCX, TXT, MD</p>
                        </div>
                        <Input id="resume-file-upload" type="file" className="hidden" onChange={handleFileChange} accept=".pdf,.docx,.doc,.txt,.md"/>
                    </label>
                </div>
                {resumeFile && <p className="text-sm text-muted-foreground">Uploaded: {resumeFile.name}</p>}

                 <div className="relative flex items-center my-2">
                    <div className="flex-grow border-t border-muted"></div>
                    <span className="flex-shrink mx-4 text-muted-foreground text-xs uppercase">OR</span>
                    <div className="flex-grow border-t border-muted"></div>
                </div>

                <Label htmlFor="resume-text-area" className="text-lg font-medium">Paste Resume Text</Label>
                <Textarea
                  id="resume-text-area"
                  placeholder="Paste your resume content here..."
                  value={resumeText}
                  onChange={(e) => { setResumeText(e.target.value); setSelectedResumeId(null); setResumeFile(null); }}
                  rows={8}
                  className="border-input focus:ring-primary"
                />
              </div>
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                      <Label htmlFor="job-title-input">Target Job Title</Label>
                      <Input id="job-title-input" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} placeholder="e.g., Senior Software Engineer" />
                  </div>
                  <div>
                      <Label htmlFor="company-name-input">Target Company Name</Label>
                      <Input id="company-name-input" value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="e.g., Innovate LLC" />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Label htmlFor="job-description-area" className="text-lg font-medium">Job Description</Label>
                   <Tooltip>
                    <TooltipTrigger asChild>
                       <Button variant="ghost" size="icon" type="button" className="h-5 w-5 p-0"><HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" /></Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">Paste the full job description for the most accurate analysis.</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Textarea
                  id="job-description-area"
                  placeholder="Paste the job description here..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  rows={resumes.length > 0 || resumeFile || resumeText.length > 0 ? 10 + 14 + 4 : 10}
                  className="border-input focus:ring-primary"
                />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading} className="w-full md:w-auto bg-primary hover:bg-primary/90 text-primary-foreground">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing...
                </>
              ) : (
                <>
                  Analyze Resume <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>

      {isLoading && (
        <div className="text-center py-8">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="mt-2 text-muted-foreground">AI is working its magic... Please wait.</p>
        </div>
      )}
      
      {analysisReport && (
        <>
        <Card className="shadow-xl mt-8" id="analysis-report-section">
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div>
                <CardTitle className="text-2xl font-bold flex items-center gap-2">
                    <FileCheck2 className="h-7 w-7 text-primary" /> Analysis Report
                </CardTitle>
                <CardDescription>Detailed breakdown of your resume against the job description.</CardDescription>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    <Button onClick={() => handleSubmit()} variant="outline" className="flex-1 sm:flex-none">
                        <RefreshCcw className="mr-2 h-4 w-4" /> Re-Analyze
                    </Button>
                    <Button onClick={handleDownloadReport} variant="outline" className="flex-1 sm:flex-none">
                        <Download className="mr-2 h-4 w-4" /> Download
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left Column - Scores & Actions */}
                <div className="md:col-span-1 space-y-6 p-4 border-r border-border rounded-l-lg bg-secondary/30">
                    <div className="space-y-4 border-b pb-4">
                        <div className="space-y-2">
                            <Label htmlFor="report-job-title" className="text-xs font-medium">Target Job Title</Label>
                            <Input id="report-job-title" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} placeholder="Enter job title" className="bg-background"/>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="report-company-name" className="text-xs font-medium">Target Company</Label>
                            <Input id="report-company-name" value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Enter company name" className="bg-background"/>
                        </div>
                    </div>

                    <ScoreCircle score={analysisReport.overallQualityScore ?? analysisReport.hardSkillsScore ?? 0} size="xl" label="Match Rate" />
                    
                    <Button onClick={handleStartNewAnalysis} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                        <PlusCircle className="mr-2 h-4 w-4" /> Start New Analysis
                    </Button>
                    <Button onClick={handlePowerEdit} variant="outline" className="w-full">
                        <Wand2 className="mr-2 h-4 w-4" /> Power Edit with AI
                    </Button>

                    <div className="space-y-3 pt-4 border-t">
                      {(analysisReport.overallQualityScore && analysisReport.overallQualityScore >= 80) ? (
                          <Button onClick={openSaveDialog} className="w-full bg-green-600 hover:bg-green-700 text-white">
                            <Save className="mr-2 h-4 w-4" /> Save This Version
                          </Button>
                        ) : (
                          <p className="text-xs text-center text-muted-foreground">Improve your score to 80%+ to unlock the save option!</p>
                        )
                      }
                    </div>

                    <div className="space-y-3 pt-4 border-t">
                      {[
                          {label: "Searchability", score: analysisReport.searchabilityScore, issues: categoryIssues.searchability, sectionId: 'searchability-details-section', tabId: 'searchability_analysis'},
                          {label: "Recruiter Tips", score: analysisReport.recruiterTipsScore, issues: categoryIssues.recruiterTips, sectionId: 'recruiter-feedback-section', tabId: 'full_report'},
                          {label: "Formatting", score: analysisReport.formattingScore, issues: categoryIssues.formatting, sectionId: 'ats-friendliness-section', tabId: 'full_report'},
                          {label: "Highlights", score: analysisReport.highlightsScore, issues: categoryIssues.highlights, sectionId: 'highlights-section', tabId: 'full_report'},
                          {label: "Hard Skills", score: analysisReport.hardSkillsScore, issues: categoryIssues.hardSkills, sectionId: 'hard-skills-section', tabId: 'full_report'},
                          {label: "Soft Skills", score: analysisReport.softSkillsScore, issues: categoryIssues.softSkills, sectionId: 'soft-skills-section', tabId: 'full_report'},
                          {label: "ATS Compliance", score: analysisReport.atsStandardFormattingComplianceScore, issues: categoryIssues.atsCompliance, sectionId: 'ats-friendliness-section', tabId: 'full_report'},
                      ].map(cat => cat.score !== undefined && (
                          <div key={cat.label}>
                              <div className="flex justify-between text-sm mb-0.5 items-center">
                                  <span className="font-medium text-muted-foreground">{cat.label}</span>
                                  {cat.issues > 0 && (
                                     <Button variant="link" size="sm" className="text-xs text-red-500 font-semibold p-0 h-auto" onClick={() => handleNavigateToIssue(cat.tabId, cat.sectionId)}>
                                        {cat.issues} issue{cat.issues !== 1 ? 's' : ''}
                                    </Button>
                                  )}
                              </div>
                              <Progress value={cat.score ?? 0} className="h-2 [&>div]:bg-primary mb-1" />
                              <p className="text-xs text-primary text-right font-semibold">{cat.score ?? 0}%</p>
                          </div>
                      ))}
                    </div>
                </div>

                {/* Right Column - Detailed Breakdown */}
                <div className="md:col-span-2 space-y-6 p-4">
                    <div className="flex items-start gap-2 text-sm text-muted-foreground mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                        <Info className="h-6 w-6 text-blue-600 shrink-0 mt-0.5"/>
                        <div>
                            <strong className="text-blue-700">Quick Guide:</strong>
                            <ol className="list-decimal list-inside text-xs">
                                <li>Review suggestions in the tabs/accordions below.</li>
                                <li>Use "Power Edit" to get AI help with fixing your resume based on its findings.</li>
                                <li>After changes, click "Re-Analyze" to see your updated score!</li>
                            </ol>
                        </div>
                    </div>
                    
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto">
                            <TabsTrigger value="resume_text" className="text-xs sm:text-sm">Resume</TabsTrigger>
                            <TabsTrigger value="jd_text" className="text-xs sm:text-sm">Job Desc.</TabsTrigger>
                            <TabsTrigger value="searchability_analysis" className="text-xs sm:text-sm">Searchability</TabsTrigger>
                            <TabsTrigger value="full_report" className="text-xs sm:text-sm">Full Report</TabsTrigger>
                        </TabsList>

                        <TabsContent value="resume_text" className="mt-4">
                            <Card><CardHeader><CardTitle className="text-md">Your Resume Text</CardTitle></CardHeader><CardContent><Textarea value={resumeText} readOnly rows={15} className="text-xs bg-muted"/></CardContent></Card>
                        </TabsContent>
                        <TabsContent value="jd_text" className="mt-4">
                             <Card><CardHeader><CardTitle className="text-md">Job Description Text</CardTitle></CardHeader><CardContent><Textarea value={jobDescription} readOnly rows={15} className="text-xs bg-muted"/></CardContent></Card>
                        </TabsContent>
                        
                        <TabsContent value="searchability_analysis" className="mt-4 space-y-4">
                            {analysisReport.searchabilityDetails && (
                            <Card className="border-border shadow-sm" id="searchability-details-section">
                                <CardHeader className="p-3 bg-secondary/20 rounded-t-md flex flex-row items-center justify-between">
                                    <CardTitle className="text-md font-semibold flex items-center gap-2">
                                        <Search className="h-5 w-5 text-primary"/>Searchability Details
                                    </CardTitle>
                                    <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-6 w-6 p-0"><Info className="h-4 w-4 text-muted-foreground"/></Button></TooltipTrigger><TooltipContent><p className="max-w-xs">How easily recruiters and ATS can find key info.</p></TooltipContent></Tooltip>
                                </CardHeader>
                                <CardContent className="p-3 divide-y divide-border">
                                    {[
                                      { group: "Contact Info", checks: [
                                        {label: "Phone Number Present", checked: analysisReport.searchabilityDetails?.hasPhoneNumber ?? false, tip: "Ensure a clear phone number is easily found."},
                                        {label: "Email Address Present", checked: analysisReport.searchabilityDetails?.hasEmail ?? false, tip: "Include a professional email address."},
                                        {label: "Physical Address Present", checked: analysisReport.searchabilityDetails?.hasAddress ?? false, tip: "City & State are usually sufficient."},
                                      ]},
                                      { group: "Key Identifiers", checks: [
                                        {label: "Job Title Aligns with JD Target", checked: analysisReport.searchabilityDetails?.jobTitleMatchesJD ?? false, tip: "Your current/recent title or resume headline should align with the target role in the JD."},
                                        {label: "Professional Summary/Objective Found", checked: analysisReport.searchabilityDetails?.hasProfessionalSummary ?? false, tip: "A summary helps recruiters quickly grasp your profile."},
                                      ]},
                                      { group: "Section Headings", checks: [
                                        {label: "Work Experience Section Clear", checked: analysisReport.searchabilityDetails?.hasWorkExperienceSection ?? false, tip: "Use standard headings like 'Experience' or 'Work History'."},
                                        {label: "Education Section Clear", checked: analysisReport.searchabilityDetails?.hasEducationSection ?? false, tip: "Use standard headings like 'Education'."},
                                      ]}
                                    ].map(section => (
                                      <div key={section.group} className="pt-3 first:pt-0">
                                        <h4 className="text-sm font-medium text-muted-foreground mb-2">{section.group}</h4>
                                        {section.checks.map(item => (
                                            <div key={item.label} className="flex items-start gap-2 text-sm py-1.5">
                                                {item.checked ? <CheckCircle className="h-4 w-4 text-green-500 shrink-0 mt-0.5"/> : <XCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5"/>}
                                                <div className="flex-1">
                                                    <span className={cn(item.checked ? "text-foreground" : "text-red-600")}>{item.label}</span>
                                                    {!item.checked && <p className="text-xs text-muted-foreground italic">{item.tip}</p>}
                                                </div>
                                            </div>
                                        ))}
                                      </div>
                                    ))}
                                    {analysisReport.searchabilityDetails?.keywordDensityFeedback && (
                                        <div className="pt-3">
                                          <h4 className="text-sm font-medium text-muted-foreground mb-1">Keyword Density Feedback:</h4>
                                          <p className="text-xs italic p-2 bg-muted rounded-md">{analysisReport.searchabilityDetails.keywordDensityFeedback}</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                            )}
                        </TabsContent>

                        <TabsContent value="full_report" className="mt-4">
                            <Accordion type="multiple" className="w-full space-y-3" value={activeAccordionItems} onValueChange={setActiveAccordionItems}>
                                <AccordionItem value="highlights-section" id="highlights-section" className="border rounded-md shadow-sm bg-card">
                                    <AccordionTrigger className="text-sm font-medium hover:text-primary data-[state=open]:text-primary p-3"><Target className="mr-2 h-4 w-4"/>Key Highlights</AccordionTrigger>
                                    <AccordionContent className="p-3 border-t text-xs space-y-3">
                                        <div>
                                            <h4 className="font-semibold text-foreground mb-1">Your Resume's Strengths</h4>
                                            <p className="text-muted-foreground whitespace-pre-line">{analysisReport.resumeKeyStrengths || "No specific strengths highlighted by AI."}</p>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-foreground mb-1">Job's Key Requirements</h4>
                                            <p className="text-muted-foreground whitespace-pre-line">{analysisReport.jobDescriptionKeyRequirements || "No specific requirements highlighted by AI."}</p>
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>

                                <AccordionItem value="hard-skills-section" id="hard-skills-section" className="border rounded-md shadow-sm bg-card">
                                    <AccordionTrigger className="text-sm font-medium hover:text-primary data-[state=open]:text-primary p-3"><ListChecks className="mr-2 h-4 w-4"/>Hard Skills Analysis ({analysisReport.hardSkillsScore ?? 0}%)</AccordionTrigger>
                                    <AccordionContent className="p-3 border-t text-xs space-y-3">
                                        <div>
                                            <h4 className="font-semibold text-green-600 mb-1">Matching Skills</h4>
                                            {analysisReport.matchingSkills && analysisReport.matchingSkills.length > 0 ? (
                                                <div className="flex flex-wrap gap-1">
                                                    {analysisReport.matchingSkills.map(skill => <Badge key={skill} variant="secondary" className="bg-green-100 text-green-700 border-green-300">{skill}</Badge>)}
                                                </div>
                                            ) : <p className="text-muted-foreground">No matching hard skills found.</p>}
                                        </div>
                                         <div>
                                            <h4 className="font-semibold text-red-600 mb-1">Missing Skills</h4>
                                            {analysisReport.missingSkills && analysisReport.missingSkills.length > 0 ? (
                                                <div className="flex flex-wrap gap-1">
                                                    {analysisReport.missingSkills.map(skill => <Badge key={skill} variant="destructive">{skill}</Badge>)}
                                                </div>
                                            ) : <p className="text-muted-foreground">No critical missing skills identified. Good job!</p>}
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>

                                <AccordionItem value="soft-skills-section" id="soft-skills-section" className="border rounded-md shadow-sm bg-card">
                                    <AccordionTrigger className="text-sm font-medium hover:text-primary data-[state=open]:text-primary p-3"><Brain className="mr-2 h-4 w-4"/>Soft Skills Analysis ({analysisReport.softSkillsScore ?? 0}%)</AccordionTrigger>
                                    <AccordionContent className="p-3 border-t text-xs space-y-3">
                                        <div>
                                            <h4 className="font-semibold text-foreground mb-1">Identified Soft Skills</h4>
                                            {analysisReport.identifiedSoftSkills && analysisReport.identifiedSoftSkills.length > 0 ? (
                                                <div className="flex flex-wrap gap-1">
                                                    {analysisReport.identifiedSoftSkills.map(skill => <Badge key={skill} variant="secondary">{skill}</Badge>)}
                                                </div>
                                            ) : <p className="text-muted-foreground">No specific soft skills were highlighted by the AI.</p>}
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                                
                                {analysisReport.recruiterTips && analysisReport.recruiterTips.length > 0 && (
                                    <AccordionItem value="recruiter-feedback-section" id="recruiter-feedback-section" className="border rounded-md shadow-sm bg-card">
                                        <AccordionTrigger className="text-sm font-medium hover:text-primary data-[state=open]:text-primary p-3"><Users className="mr-2 h-4 w-4"/>Recruiter Feedback ({analysisReport.recruiterTipsScore ?? 0}%)</AccordionTrigger>
                                        <AccordionContent className="p-3 border-t text-xs space-y-1">
                                            {analysisReport.recruiterTips.map((tip, idx) => (
                                                <div key={idx} className={cn("p-2 border-l-4 rounded-r-md", tip.status === 'positive' ? 'border-green-500 bg-green-50' : tip.status === 'neutral' ? 'border-blue-500 bg-blue-50' : 'border-red-500 bg-red-50')}>
                                                    <strong className="text-foreground">{tip.category}:</strong> {tip.finding}
                                                    {tip.suggestion && tip.status !== 'positive' && <p className="text-blue-600 mt-0.5 pl-2"><em>Suggestion: {tip.suggestion}</em></p>}
                                                </div>
                                            ))}
                                        </AccordionContent>
                                    </AccordionItem>
                                )}
                                <AccordionItem value="content-quality-section" id="content-quality-section" className="border rounded-md shadow-sm bg-card">
                                    <AccordionTrigger className="text-sm font-medium hover:text-primary data-[state=open]:text-primary p-3"><Palette className="mr-2 h-4 w-4"/>Content & Style Insights</AccordionTrigger>
                                    <AccordionContent className="p-3 border-t text-xs space-y-3">
                                        {analysisReport.quantifiableAchievementDetails && (
                                            <div><strong className="text-muted-foreground">Quantifiable Achievements ({analysisReport.quantifiableAchievementDetails.score ?? 0}%):</strong>
                                                {analysisReport.quantifiableAchievementDetails.examplesFound?.map(ex => <p key={ex} className="text-green-600 ml-2">- {ex}</p>)}
                                                {analysisReport.quantifiableAchievementDetails.areasLackingQuantification?.map(area => <p key={area} className="text-red-600 ml-2">- Needs numbers: {area}</p>)}
                                            </div>
                                        )}
                                        {analysisReport.actionVerbDetails && (
                                            <div><strong className="text-muted-foreground">Action Verbs ({analysisReport.actionVerbDetails.score ?? 0}%):</strong>
                                                {analysisReport.actionVerbDetails.strongVerbsUsed && analysisReport.actionVerbDetails.strongVerbsUsed.length > 0 && <p>Strong: {analysisReport.actionVerbDetails.strongVerbsUsed.join(', ')}</p>}
                                                {analysisReport.actionVerbDetails.weakVerbsUsed && analysisReport.actionVerbDetails.weakVerbsUsed.length > 0 && <p className="text-yellow-600">Weak: {analysisReport.actionVerbDetails.weakVerbsUsed.join(', ')}</p>}
                                                {analysisReport.actionVerbDetails.overusedVerbs && analysisReport.actionVerbDetails.overusedVerbs.length > 0 && <p className="text-yellow-600">Overused: {analysisReport.actionVerbDetails.overusedVerbs.join(', ')}</p>}
                                                {analysisReport.actionVerbDetails.suggestedStrongerVerbs?.map(s => <p key={s.original} className="ml-2">Suggest: "{s.original}" → "{s.suggestion}"</p>)}
                                            </div>
                                        )}
                                        {analysisReport.impactStatementDetails && (
                                            <div><strong className="text-muted-foreground">Impact Statements ({analysisReport.impactStatementDetails.clarityScore ?? 0}%):</strong>
                                                {analysisReport.impactStatementDetails.exampleWellWrittenImpactStatements?.map(ex => <p key={ex} className="text-green-600 ml-2">- Good: {ex}</p>)}
                                                {analysisReport.impactStatementDetails.unclearImpactStatements?.map(area => <p key={area} className="text-red-600 ml-2">- Unclear: {area}</p>)}
                                            </div>
                                        )}
                                        {analysisReport.readabilityDetails && (
                                            <div><strong className="text-muted-foreground">Readability:</strong>
                                                {analysisReport.readabilityDetails.fleschReadingEase !== undefined && <p>Ease: {analysisReport.readabilityDetails.fleschReadingEase.toFixed(1)}</p>}
                                                {analysisReport.readabilityDetails.fleschKincaidGradeLevel !== undefined && <p>Grade Level: {analysisReport.readabilityDetails.fleschKincaidGradeLevel.toFixed(1)}</p>}
                                                {analysisReport.readabilityDetails.readabilityFeedback && <p>Feedback: {analysisReport.readabilityDetails.readabilityFeedback}</p>}
                                            </div>
                                        )}
                                    </AccordionContent>
                                </AccordionItem>
                                <AccordionItem value="ats-friendliness-section" id="ats-friendliness-section" className="border rounded-md shadow-sm bg-card">
                                    <AccordionTrigger className="text-sm font-medium hover:text-primary data-[state=open]:text-primary p-3"><SearchCheck className="mr-2 h-4 w-4"/>ATS Friendliness</AccordionTrigger>
                                    <AccordionContent className="p-3 border-t text-xs space-y-3">
                                        {analysisReport.atsParsingConfidence && <p><strong>Overall Parsing Confidence:</strong> {analysisReport.atsParsingConfidence.overall ?? 'N/A'}%</p>}
                                        {analysisReport.atsParsingConfidence?.warnings?.map((warn, i) => <p key={i} className="text-yellow-600">- Warning: {warn}</p>)}
                                        
                                        {analysisReport.atsStandardFormattingComplianceScore !== undefined && <p className="mt-2"><strong>Standard Formatting Score:</strong> {analysisReport.atsStandardFormattingComplianceScore}%</p>}
                                        {analysisReport.standardFormattingIssues?.map((iss, i) => <div key={i} className="ml-2"><p className="text-red-600">Issue: {iss.issue}</p><p className="text-blue-600">→ Rec: {iss.recommendation}</p></div>)}
                                        
                                        {analysisReport.undefinedAcronyms && analysisReport.undefinedAcronyms.length > 0 && <p className="mt-2 text-yellow-600"><strong>Undefined Acronyms:</strong> {analysisReport.undefinedAcronyms.join(', ')}</p>}
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        </TabsContent>
                    </Tabs>
                </div>
            </CardContent>
        </Card>
        </>
      )}

      <Card className="shadow-xl mt-12">
         <CardHeader>
          <CardTitle className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <History className="h-7 w-7 text-primary" /> Resume Scan History
          </CardTitle>
          <CardDescription>Review your past resume analyses. Click "View Report" to reload and re-analyze.</CardDescription>
        </CardHeader>
        <CardContent>
             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {[
                  { title: "Total Scans", value: summaryStats.totalScans },
                  { title: "Unique Resumes", value: summaryStats.uniqueResumes },
                  { title: "Highest Score", value: `${summaryStats.maxScore}%` },
                  { title: "High Scoring (>80%)", value: summaryStats.highScoringCount }, 
                ].map(stat => (
                  <Card key={stat.title} className="border shadow-sm">
                      <CardContent className="p-4 text-center">
                          <p className="text-3xl font-bold text-primary">{stat.value}</p>
                          <p className="text-xs text-muted-foreground">{stat.title}</p>
                      </CardContent>
                  </Card>
                ))}
             </div>

             <Tabs defaultValue="all" onValueChange={(value) => setHistoryFilter(value as 'all' | 'highest' | 'starred' | 'archived')} className="mb-4">
              <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
                <TabsTrigger value="all">View All</TabsTrigger>
                <TabsTrigger value="highest">Highest Match</TabsTrigger>
                <TabsTrigger value="starred">Starred</TabsTrigger>
                <TabsTrigger value="archived">Archived (Mock)</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="space-y-4">
                {filteredScanHistory.length === 0 ? (
                    <p className="text-center text-muted-foreground py-6">No scans found matching the filter.</p>
                ) : (
                    filteredScanHistory.slice(0, 5).map(item => (
                         <Card key={item.id} className="flex flex-col sm:flex-row items-start sm:items-center p-4 gap-3 border hover:shadow-md transition-shadow">
                             <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-yellow-500 self-center sm:self-start mt-1 sm:mt-0 order-1 sm:order-none" onClick={() => handleToggleBookmark(item.id)}>
                                 <Star className={cn("h-5 w-5", item.bookmarked && "fill-yellow-400 text-yellow-500")} />
                             </Button>
                             {item.matchScore !== undefined && <div className="order-2 sm:order-none"><ScoreCircle score={item.matchScore} size="sm" /></div>}
                             <div className="flex-1 space-y-0.5 order-3 sm:order-none">
                                <h4 className="font-semibold text-md text-foreground">{item.jobTitle || 'N/A'} at {item.companyName || 'N/A'}</h4>
                                <p className="text-sm text-muted-foreground">Resume: {item.resumeName || 'Unknown'}</p>
                                <p className="text-xs text-muted-foreground">{format(new Date(item.scanDate), 'MMM dd, yyyy - p')}</p>
                             </div>
                            <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 self-start sm:self-center order-4 sm:order-none ml-auto">
                                <Button variant="link" size="sm" className="p-0 h-auto text-xs" onClick={() => handleViewReport(item)}>View Report</Button>
                                <Button variant="outline" size="icon" className="h-7 w-7 text-destructive hover:bg-destructive/10" onClick={() => handleDeleteScan(item.id)}>
                                  <Trash2 className="h-3.5 w-3.5"/>
                                </Button>
                            </div>
                         </Card>
                    ))
                )}
                {scanHistory.length > 5 && (
                     <p className="text-center text-sm text-muted-foreground mt-4">
                        Standard users can only view the last 5 scans.
                    </p>
                )}
            </div>
             <div className="mt-8 text-center">
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 text-base" onClick={() => toast({title: "Feature Mock", description: "Unlock unlimited history is a premium feature."})}>
                    Unlock Unlimited Scan History
                </Button>
             </div>
        </CardContent>
      </Card>
      
      {isPowerEditDialogOpen && resumeText && jobDescription && (
        <Dialog open={isPowerEditDialogOpen} onOpenChange={setIsPowerEditDialogOpen}>
            <PowerEditDialog
                resumeText={resumeText}
                jobDescription={jobDescription}
                onRewriteComplete={handleRewriteComplete}
            />
        </Dialog>
      )}

      <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Resume Version</DialogTitle>
            <DialogDescription>
              Please confirm the name for this resume version. You can edit it if you'd like.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="resume-name-input">Resume Name</Label>
            <Input
              id="resume-name-input"
              value={newResumeName}
              onChange={(e) => setNewResumeName(e.target.value)}
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleSaveResume} className="bg-primary hover:bg-primary/90">Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
    </div>
  );
}
