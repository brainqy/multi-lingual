
"use client";
import { useI18n } from "@/hooks/use-i18n";
import React, { useState, type FormEvent, useEffect, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
    Search, UploadCloud, ArrowRight, Loader2, Download, CheckCircle, BarChart, Edit3, 
    Wrench, AlignLeft, SlidersHorizontal, Wand2, Lightbulb, Brain, SearchCheck, 
    ChevronsUpDown, ListChecks, History, Star, Trash2, Bookmark, PlusCircle, HelpCircle, XCircle, Info, MessageSquare, ThumbsUp, Users, FileText, FileCheck2, EyeOff, Columns, Palette, CalendarDays,
    Target, ListX // Added Target and ListX for the new section
} from "lucide-react"; // Consolidated imports
import { analyzeResumeAndJobDescription, type AnalyzeResumeAndJobDescriptionOutput } from '@/ai/flows/analyze-resume-and-job-description';
import { useToast } from '@/hooks/use-toast';
import { sampleResumeScanHistory as initialScanHistory, sampleResumeProfiles, sampleUserProfile } from '@/lib/sample-data';
import type { ResumeScanHistoryItem, ResumeProfile, AtsFormattingIssue } from '@/types';
import { format } from 'date-fns';
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import ScoreCircle from '@/components/ui/score-circle';

interface AnalysisResults {
  detailedReport: AnalyzeResumeAndJobDescriptionOutput | null;
}

export default function ResumeAnalyzerPage() {
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<AnalysisResults | null>(null);
  const [scanHistory, setScanHistory] = useState<ResumeScanHistoryItem[]>(initialScanHistory.filter(item => item.userId === sampleUserProfile.id));
  const [resumes, setResumes] = useState<ResumeProfile[]>(sampleResumeProfiles.filter(r => r.userId === sampleUserProfile.id));
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null);
  const [historyFilter, setHistoryFilter] = useState<'all' | 'highest' | 'starred' | 'archived'>('all');

  const { toast } = useToast();

   useEffect(() => {
    const selectedResume = resumes.find(r => r.id === selectedResumeId);
    if (selectedResume) {
      setResumeText(selectedResume.resumeText ?? '');
      toast({ title: "Resume Loaded", description: `Loaded content for ${selectedResume.name}.`});
    }
   }, [selectedResumeId, resumes, toast]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setResumeFile(file);
      setSelectedResumeId(null); 
      setResumeText(''); 
      if (file.type === "text/plain" || file.type === "text/markdown") { // Allow MD
        const reader = new FileReader();
        reader.onload = (e) => {
          setResumeText(e.target?.result as string ?? '');
        };
        reader.readAsText(file);
      } else {
        toast({ title: "File Selected", description: `Selected ${file.name}. Content will be extracted upon analysis (simulated for non-txt/md).` });
      }
    }
  };

  const handleSubmit = async (event?: FormEvent) => {
    if(event) event.preventDefault();
    if (!resumeText.trim() && !resumeFile) {
      toast({ title: "Error", description: "Please upload or select a resume, or paste resume text.", variant: "destructive" });
      return;
    }
    if (!jobDescription.trim()) {
      toast({ title: "Error", description: "Please provide a job description.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    setResults(null);
    let currentResumeText = resumeText;

    // Basic simulation for non-text file content extraction
    if (resumeFile && (!resumeText.trim() || (resumeFile.type !== "text/plain" && resumeFile.type !== "text/markdown"))) {
        currentResumeText = `Simulated content for ${resumeFile.name}.\n\nSkills: React, Node.js, Python, Java, SQL.\nExperience: Led a team of 5 developers at Tech Solutions Inc from 2020-2023, increased project efficiency by 15%. Developed a full-stack web application using Next.js and Spring Boot.\nEducation: Master's in Computer Science, State University.`;
        if (resumeFile.name.toLowerCase().includes("product")) {
            currentResumeText += "\nAlso proficient in product strategy, user research, agile methodologies, and market analysis. Launched 3 successful products.";
        } else if (resumeFile.name.toLowerCase().includes("data")) {
            currentResumeText += "\nExpertise in data analysis, machine learning model development (TensorFlow, PyTorch), and data visualization using Python (Pandas, Scikit-learn) and Tableau.";
        }
        setResumeText(currentResumeText); 
    }
    
    const currentResumeProfile = selectedResumeId ? resumes.find(r => r.id === selectedResumeId) : null;

    const jdLines = jobDescription.split('\n');
    const jobTitleMatch = jdLines.find(line => typeof line === 'string' && line.toLowerCase().includes('title:'))?.split(/:(.*)/s)[1]?.trim() || "Job Title Placeholder";
    const companyMatch = jdLines.find(line => typeof line === 'string' && line.toLowerCase().includes('company:'))?.split(/:(.*)/s)[1]?.trim() || "Company Placeholder";

    try {
      logger.info("Calling analyzeResumeAndJobDescription with input lengths:", { resume: currentResumeText.length, jd: jobDescription.length });
      const detailedReportRes = await analyzeResumeAndJobDescription({ resumeText: currentResumeText, jobDescriptionText: jobDescription });
      logger.info("Received AI response from analyzeResumeAndJobDescription", detailedReportRes);
      
      setResults({ detailedReport: detailedReportRes });

      const newScanEntry: ResumeScanHistoryItem = {
        id: `scan-${Date.now()}`,
        tenantId: sampleUserProfile.tenantId,
        userId: sampleUserProfile.id,
        resumeId: currentResumeProfile?.id || (resumeFile ? `file-${resumeFile.name}` : 'pasted-text'),
        resumeName: currentResumeProfile?.name || resumeFile?.name || 'Pasted Resume',
        jobTitle: jobTitleMatch,
        companyName: companyMatch,
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
      logger.error("CRITICAL ERROR during AI Analysis on Frontend:", error);
      toast({ title: "Analysis Failed", description: `An error occurred during analysis: ${error.message || String(error)}`, variant: "destructive", duration: 7000 });
      setResults({ detailedReport: (analyzeResumeAndJobDescription as any).getDefaultOutput ? (analyzeResumeAndJobDescription as any).getDefaultOutput(error.message || String(error)) : null });
    } finally {
      setIsLoading(false);
      const reportSection = document.getElementById('analysis-report-section');
      if (reportSection) reportSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleDownloadReport = () => {
    toast({ title: "Download Report (Mock)", description: "PDF report generation is mocked. Printing the page to PDF can be an alternative."});
  };
  
  const handleUploadAndRescan = () => {
    setResumeFile(null);
    // Do not clear resumeText if user might want to rescan pasted text with new JD
    // setSelectedResumeId(null); // Do not clear if they want to rescan a selected resume
    setResults(null); 
    toast({ title: "Ready for Rescan", description: "Modify resume/JD and click Analyze, or upload/select a new resume to analyze against the current job description."});
    const resumeInputSection = document.getElementById('resume-input-section');
    if (resumeInputSection) resumeInputSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handlePowerEdit = () => {
    toast({ title: "Power Edit (Mock)", description: "This feature would open an advanced resume editor with AI suggestions."});
  };

  const handleViewReport = async (item: ResumeScanHistoryItem) => {
    if (!item.resumeTextSnapshot || !item.jobDescriptionText) {
        toast({ title: "Cannot View Report", description: "Missing resume or job description text for this historical scan.", variant: "destructive" });
        return;
    }
    setResumeText(item.resumeTextSnapshot);
    setJobDescription(item.jobDescriptionText);
    setResumeFile(null); 
    setSelectedResumeId(item.resumeId.startsWith('file-') || item.resumeId === 'pasted-text' ? null : item.resumeId);
    
    toast({ title: "Loading Historical Scan...", description: "Re-generating analysis for the selected scan." });
    setIsLoading(true);
    try {
      const detailedReportRes = await analyzeResumeAndJobDescription({ resumeText: item.resumeTextSnapshot, jobDescriptionText: item.jobDescriptionText });
      setResults({ detailedReport: detailedReportRes });
      toast({ title: "Historical Report Loaded", description: "The analysis report for the selected scan has been re-generated." });
    } catch (error: any) {
      logger.error("CRITICAL ERROR during Historical AI Analysis on Frontend:", error);
      toast({ title: "Report Load Failed", description: `An error occurred while re-generating the historical report: ${error.message || String(error)}`, variant: "destructive", duration: 7000 });
      setResults({ detailedReport: (analyzeResumeAndJobDescription as any).getDefaultOutput ? (analyzeResumeAndJobDescription as any).getDefaultOutput(error.message || String(error)) : null });
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
      // Update global sample data
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

  const filteredScanHistory = useMemo(() => {
    let filtered = [...scanHistory]; // Use local state which can be modified
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
      if (!details.hasPhoneNumber) issues++;
      if (!details.hasEmail) issues++;
      if (!details.hasAddress) issues++; // Count if address is missing
      if (!details.jobTitleMatchesJD) issues++;
      if (!details.hasWorkExperienceSection) issues++;
      if (!details.hasEducationSection) issues++;
      if (!details.hasProfessionalSummary) issues++;
      return issues;
  };

  const getGenericIssueCount = (score?: number, items?: any[], negativeItems?: any[]): number => {
    if (negativeItems && negativeItems.length > 0) return negativeItems.length;
    if (items && items.length > 0 && score === undefined) return items.length; // If score is N/A but items exist
    if (score === undefined || score === null) return 0; // Treat N/A score as 0 issues for this heuristic unless items say otherwise
    if (score >= 90) return 0;
    if (score >= 75) return 1;
    if (score >= 60) return 2;
    if (score >= 40) return 3;
    if (score >= 20) return 4;
    return 5; // Max 5 issues for heuristic
  };

  const logger = { // Simple logger for client-side visibility during dev
    info: (message: string, ...args: any[]) => console.log(`[CLIENT INFO] ${message}`, ...args),
    warn: (message: string, ...args: any[]) => console.warn(`[CLIENT WARN] ${message}`, ...args),
    error: (message: string, ...args: any[]) => console.error(`[CLIENT ERROR] ${message}`, ...args),
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
                            <p className="mb-1 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag &amp; drop</p>
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
                <div className="flex items-center gap-2">
                  <Label htmlFor="job-description-area" className="text-lg font-medium">Job Description</Label>
                   <Tooltip>
                    <TooltipTrigger asChild>
                       <Button variant="ghost" size="icon" type="button" className="h-5 w-5 p-0"><HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" /></Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">Paste the full job description. For best results, include "Title: &lt;Job Title&gt;" and "Company: &lt;Company Name&gt;" on separate lines if not naturally present in the JD.</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Textarea
                  id="job-description-area"
                  placeholder="Paste the job description here... For better results, include 'Title: <Job Title>' and 'Company: <Company Name>' on separate lines if possible."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  rows={resumes.length > 0 || resumeFile || resumeText.length > 0 ? 10 + 14 + 4 : 10} // Dynamic rows
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
      
      {results && results.detailedReport && (
        <>
        <Card className="shadow-xl mt-8" id="analysis-report-section">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                <CardTitle className="text-2xl font-bold flex items-center gap-2">
                    <FileCheck2 className="h-7 w-7 text-primary" /> Analysis Report
                </CardTitle>
                <CardDescription>Detailed breakdown of your resume against the job description.</CardDescription>
                </div>
                <div className="flex gap-2">
                    <Button onClick={handleDownloadReport} variant="outline">
                        <Download className="mr-2 h-4 w-4" /> Download PDF
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left Column - Scores & Actions */}
                <div className="md:col-span-1 space-y-6 p-4 border-r border-border rounded-l-lg bg-secondary/30">
                    <ScoreCircle score={results.detailedReport.overallQualityScore ?? results.detailedReport.hardSkillsScore ?? 0} size="xl" label="Match Rate" />
                    
                    <Button onClick={handleUploadAndRescan} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                        <UploadCloud className="mr-2 h-4 w-4" /> Upload & Rescan
                    </Button>
                    <Button onClick={handlePowerEdit} variant="outline" className="w-full">
                        <Wand2 className="mr-2 h-4 w-4" /> Power Edit
                    </Button>

                    <div className="space-y-3 pt-4 border-t">
                        {[
                            {label: "Searchability", score: results.detailedReport.searchabilityScore, issues: getSearchabilityIssueCount(results.detailedReport.searchabilityDetails)},
                            {label: "Recruiter Tips", score: results.detailedReport.recruiterTipsScore, issues: getGenericIssueCount(results.detailedReport.recruiterTipsScore, undefined, results.detailedReport.recruiterTips?.filter(tip => tip.status === 'negative').length)},
                            {label: "Formatting", score: results.detailedReport.formattingScore, issues: getGenericIssueCount(results.detailedReport.formattingScore, undefined, results.detailedReport.formattingDetails?.length)},
                            {label: "Highlights", score: results.detailedReport.highlightsScore, issues: getGenericIssueCount(results.detailedReport.highlightsScore)},
                            {label: "Hard Skills", score: results.detailedReport.hardSkillsScore, issues: getGenericIssueCount(results.detailedReport.hardSkillsScore, undefined, results.detailedReport.missingSkills?.length)},
                            {label: "Soft Skills", score: results.detailedReport.softSkillsScore, issues: getGenericIssueCount(results.detailedReport.softSkillsScore)},
                            {label: "ATS Compliance", score: results.detailedReport.atsStandardFormattingComplianceScore, issues: getGenericIssueCount(results.detailedReport.atsStandardFormattingComplianceScore, undefined, results.detailedReport.standardFormattingIssues?.length)},
                        ].map(cat => cat.score !== undefined && (
                            <div key={cat.label}>
                                <div className="flex justify-between text-sm mb-0.5">
                                    <span className="font-medium text-muted-foreground">{cat.label}</span>
                                    <span className="text-xs text-red-500">{cat.issues} issue{cat.issues !== 1 ? 's' : ''}</span>
                                </div>
                                <Progress value={cat.score ?? 0} className="h-2 [&>div]:bg-primary mb-1" />
                                <p className="text-xs text-primary text-right font-semibold">{cat.score ?? 0}%</p>
                            </div>
                        ))}
                    </div>
                     <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary/10">
                        <Lightbulb className="mr-2 h-4 w-4" /> Guide me
                    </Button>
                </div>

                {/* Right Column - Detailed Breakdown (Simplified Focus) */}
                <div className="md:col-span-2 space-y-6 p-4">
                    <div className="flex items-start gap-2 text-sm text-muted-foreground mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                        <Info className="h-6 w-6 text-blue-600 shrink-0 mt-0.5"/>
                        <div>
                            <strong className="text-blue-700">Quick Guide:</strong>
                            <ol className="list-decimal list-inside text-xs">
                                <li>Review suggestions in the tabs/accordions below.</li>
                                <li>Update your original resume document (e.g., in Word or Google Docs).</li>
                                <li>Use "Upload & Rescan" with your updated resume to see improvements!</li>
                            </ol>
                        </div>
                    </div>
                    
                    <Tabs defaultValue="searchability_analysis" className="w-full">
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
                            {results.detailedReport.searchabilityDetails && (
                            <Card className="border-border shadow-sm">
                                <CardHeader className="p-3 bg-secondary/20 rounded-t-md flex flex-row items-center justify-between">
                                    <CardTitle className="text-md font-semibold flex items-center gap-2">
                                        <Search className="h-5 w-5 text-primary"/>Searchability Details
                                    </CardTitle>
                                    <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-6 w-6 p-0"><Info className="h-4 w-4 text-muted-foreground"/></Button></TooltipTrigger><TooltipContent><p className="max-w-xs">How easily recruiters and ATS can find key info.</p></TooltipContent></Tooltip>
                                </CardHeader>
                                <CardContent className="p-3 divide-y divide-border">
                                    {[
                                      { group: "Contact Info", checks: [
                                        {label: "Phone Number Present", checked: results.detailedReport.searchabilityDetails?.hasPhoneNumber ?? false, tip: "Ensure a clear phone number is easily found."},
                                        {label: "Email Address Present", checked: results.detailedReport.searchabilityDetails?.hasEmail ?? false, tip: "Include a professional email address."},
                                        {label: "Physical Address Present", checked: results.detailedReport.searchabilityDetails?.hasAddress ?? false, tip: "City & State are usually sufficient."},
                                      ]},
                                      { group: "Key Identifiers", checks: [
                                        {label: "Job Title Aligns with JD Target", checked: results.detailedReport.searchabilityDetails?.jobTitleMatchesJD ?? false, tip: "Your current/recent title or resume headline should align with the target role in the JD."},
                                        {label: "Professional Summary/Objective Found", checked: results.detailedReport.searchabilityDetails?.hasProfessionalSummary ?? false, tip: "A summary helps recruiters quickly grasp your profile."},
                                      ]},
                                      { group: "Section Headings", checks: [
                                        {label: "Work Experience Section Clear", checked: results.detailedReport.searchabilityDetails?.hasWorkExperienceSection ?? false, tip: "Use standard headings like 'Experience' or 'Work History'."},
                                        {label: "Education Section Clear", checked: results.detailedReport.searchabilityDetails?.hasEducationSection ?? false, tip: "Use standard headings like 'Education'."},
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
                                    {results.detailedReport.searchabilityDetails?.keywordDensityFeedback && (
                                        <div className="pt-3">
                                          <h4 className="text-sm font-medium text-muted-foreground mb-1">Keyword Density Feedback:</h4>
                                          <p className="text-xs italic p-2 bg-muted rounded-md">{results.detailedReport.searchabilityDetails.keywordDensityFeedback}</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                            )}
                        </TabsContent>

                        <TabsContent value="full_report" className="mt-4">
                            <Accordion type="multiple" className="w-full space-y-3">
                                {results.detailedReport.recruiterTips && results.detailedReport.recruiterTips.length > 0 && (
                                    <AccordionItem value="recruiter-feedback" className="border rounded-md shadow-sm bg-card">
                                        <AccordionTrigger className="text-sm font-medium hover:text-primary data-[state=open]:text-primary p-3"><Users className="mr-2 h-4 w-4"/>Recruiter Feedback ({results.detailedReport.recruiterTipsScore ?? 0}%)</AccordionTrigger>
                                        <AccordionContent className="p-3 border-t text-xs space-y-1">
                                            {results.detailedReport.recruiterTips.map((tip, idx) => (
                                                <div key={idx} className={cn("p-2 border-l-4 rounded-r-md", tip.status === 'positive' ? 'border-green-500 bg-green-50' : tip.status === 'neutral' ? 'border-blue-500 bg-blue-50' : 'border-red-500 bg-red-50')}>
                                                    <strong className="text-foreground">{tip.category}:</strong> {tip.finding}
                                                    {tip.suggestion && tip.status !== 'positive' && <p className="text-blue-600 mt-0.5 pl-2"><em>Suggestion: {tip.suggestion}</em></p>}
                                                </div>
                                            ))}
                                        </AccordionContent>
                                    </AccordionItem>
                                )}
                                <AccordionItem value="content-quality" className="border rounded-md shadow-sm bg-card">
                                    <AccordionTrigger className="text-sm font-medium hover:text-primary data-[state=open]:text-primary p-3"><Palette className="mr-2 h-4 w-4"/>Content & Style Insights</AccordionTrigger>
                                    <AccordionContent className="p-3 border-t text-xs space-y-3">
                                        {results.detailedReport.quantifiableAchievementDetails && (
                                            <div><strong className="text-muted-foreground">Quantifiable Achievements ({results.detailedReport.quantifiableAchievementDetails.score ?? 0}%):</strong>
                                                {results.detailedReport.quantifiableAchievementDetails.examplesFound?.map(ex => <p key={ex} className="text-green-600 ml-2">- {ex}</p>)}
                                                {results.detailedReport.quantifiableAchievementDetails.areasLackingQuantification?.map(area => <p key={area} className="text-red-600 ml-2">- Needs numbers: {area}</p>)}
                                            </div>
                                        )}
                                        {results.detailedReport.actionVerbDetails && (
                                            <div><strong className="text-muted-foreground">Action Verbs ({results.detailedReport.actionVerbDetails.score ?? 0}%):</strong>
                                                {results.detailedReport.actionVerbDetails.strongVerbsUsed && results.detailedReport.actionVerbDetails.strongVerbsUsed.length > 0 && <p>Strong: {results.detailedReport.actionVerbDetails.strongVerbsUsed.join(', ')}</p>}
                                                {results.detailedReport.actionVerbDetails.weakVerbsUsed && results.detailedReport.actionVerbDetails.weakVerbsUsed.length > 0 && <p className="text-yellow-600">Weak: {results.detailedReport.actionVerbDetails.weakVerbsUsed.join(', ')}</p>}
                                                {results.detailedReport.actionVerbDetails.overusedVerbs && results.detailedReport.actionVerbDetails.overusedVerbs.length > 0 && <p className="text-yellow-600">Overused: {results.detailedReport.actionVerbDetails.overusedVerbs.join(', ')}</p>}
                                                {results.detailedReport.actionVerbDetails.suggestedStrongerVerbs?.map(s => <p key={s.original} className="ml-2">Suggest: "{s.original}" → "{s.suggestion}"</p>)}
                                            </div>
                                        )}
                                        {results.detailedReport.impactStatementDetails && (
                                            <div><strong className="text-muted-foreground">Impact Statements ({results.detailedReport.impactStatementDetails.clarityScore ?? 0}%):</strong>
                                                {results.detailedReport.impactStatementDetails.exampleWellWrittenImpactStatements?.map(ex => <p key={ex} className="text-green-600 ml-2">- Good: {ex}</p>)}
                                                {results.detailedReport.impactStatementDetails.unclearImpactStatements?.map(area => <p key={area} className="text-red-600 ml-2">- Unclear: {area}</p>)}
                                            </div>
                                        )}
                                        {results.detailedReport.readabilityDetails && (
                                            <div><strong className="text-muted-foreground">Readability:</strong>
                                                {results.detailedReport.readabilityDetails.fleschReadingEase !== undefined && <p>Ease: {results.detailedReport.readabilityDetails.fleschReadingEase.toFixed(1)}</p>}
                                                {results.detailedReport.readabilityDetails.fleschKincaidGradeLevel !== undefined && <p>Grade Level: {results.detailedReport.readabilityDetails.fleschKincaidGradeLevel.toFixed(1)}</p>}
                                                {results.detailedReport.readabilityDetails.readabilityFeedback && <p>Feedback: {results.detailedReport.readabilityDetails.readabilityFeedback}</p>}
                                            </div>
                                        )}
                                    </AccordionContent>
                                </AccordionItem>
                                <AccordionItem value="ats-friendliness" className="border rounded-md shadow-sm bg-card">
                                    <AccordionTrigger className="text-sm font-medium hover:text-primary data-[state=open]:text-primary p-3"><SearchCheck className="mr-2 h-4 w-4"/>ATS Friendliness</AccordionTrigger>
                                    <AccordionContent className="p-3 border-t text-xs space-y-3">
                                        {results.detailedReport.atsParsingConfidence && <p><strong>Overall Parsing Confidence:</strong> {results.detailedReport.atsParsingConfidence.overall ?? 'N/A'}%</p>}
                                        {results.detailedReport.atsParsingConfidence?.warnings?.map((warn, i) => <p key={i} className="text-yellow-600">- Warning: {warn}</p>)}
                                        
                                        {results.detailedReport.atsStandardFormattingComplianceScore !== undefined && <p className="mt-2"><strong>Standard Formatting Score:</strong> {results.detailedReport.atsStandardFormattingComplianceScore}%</p>}
                                        {results.detailedReport.standardFormattingIssues?.map((iss, i) => <div key={i} className="ml-2"><p className="text-red-600">Issue: {iss.issue}</p><p className="text-blue-600">→ Rec: {iss.recommendation}</p></div>)}
                                        
                                        {results.detailedReport.undefinedAcronyms && results.detailedReport.undefinedAcronyms.length > 0 && <p className="mt-2 text-yellow-600"><strong>Undefined Acronyms:</strong> {results.detailedReport.undefinedAcronyms.join(', ')}</p>}
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        </TabsContent>
                    </Tabs>
                </div>
            </CardContent>
        </Card>

        <Card className="shadow-xl mt-8">
            <CardHeader>
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <Target className="h-6 w-6 text-primary" /> Resume Score & Keyword Insights
                </CardTitle>
                <CardDescription>A summary of your resume's match score and keyword alignment with the job description.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex flex-col items-center">
                     <ScoreCircle score={results.detailedReport.overallQualityScore ?? results.detailedReport.hardSkillsScore ?? 0} size="lg" label="Overall Match" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="bg-secondary/30">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-md font-semibold flex items-center gap-2"><ListX className="h-5 w-5 text-destructive"/>Missing Keywords</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {results.detailedReport.missingSkills && results.detailedReport.missingSkills.length > 0 ? (
                                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                                    {results.detailedReport.missingSkills.slice(0,10).map((skill, index) => <li key={`missing-${index}`}>{skill}</li>)}
                                    {results.detailedReport.missingSkills.length > 10 && <li>...and {results.detailedReport.missingSkills.length - 10} more</li>}
                                </ul>
                            ) : (
                                <p className="text-sm text-muted-foreground">No critical missing keywords identified by AI, or none provided.</p>
                            )}
                        </CardContent>
                    </Card>
                    <Card className="bg-secondary/30">
                        <CardHeader className="pb-2">
                             <CardTitle className="text-md font-semibold flex items-center gap-2"><ListChecks className="h-5 w-5 text-green-500"/>Matching Keywords</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {results.detailedReport.matchingSkills && results.detailedReport.matchingSkills.length > 0 ? (
                                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                                    {results.detailedReport.matchingSkills.slice(0,10).map((skill, index) => <li key={`matching-${index}`}>{skill}</li>)}
                                     {results.detailedReport.matchingSkills.length > 10 && <li>...and {results.detailedReport.matchingSkills.length - 10} more</li>}
                                </ul>
                            ) : (
                                <p className="text-sm text-muted-foreground">No specific matching keywords highlighted by AI, or none provided.</p>
                            )}
                        </CardContent>
                    </Card>
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
    </TooltipProvider>
    </div>
  );
}
