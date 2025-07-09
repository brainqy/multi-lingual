
"use client";

import React, { useState, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
    Download, CheckCircle, Edit3, Wand2, Lightbulb, Brain, SearchCheck,
    ListChecks, History, Star, Trash2, Bookmark, PlusCircle, HelpCircle, XCircle, Info, ThumbsUp, Users, FileCheck2,
    Target, ListX, Sparkles, RefreshCcw, WandSparkles, ClipboardCopy, Check, Save
} from "lucide-react";
import type { AnalyzeResumeAndJobDescriptionOutput, AtsFormattingIssue } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import ScoreCircle from '@/components/ui/score-circle';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { PowerEditDialog } from '@/components/features/resume-analyzer/PowerEditDialog';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface AnalysisReportProps {
    analysisReport: AnalyzeResumeAndJobDescriptionOutput;
    resumeText: string;
    jobDescription: string;
    jobTitle: string;
    companyName: string;
    onRewriteComplete: (newResume: string) => void;
    onStartNewAnalysis: () => void;
    onRescan: (formData: any) => void;
}

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

const getIssuesFromScore = (score?: number): number => {
    if (score === undefined || score === null) return 0;
    if (score >= 90) return 0;
    if (score >= 75) return 1;
    if (score >= 60) return 2;
    if (score >= 40) return 3;
    if (score >= 20) return 4;
    return 5;
};

export default function AnalysisReport({
    analysisReport,
    resumeText,
    jobDescription,
    jobTitle,
    companyName,
    onRewriteComplete,
    onStartNewAnalysis,
    onRescan,
}: AnalysisReportProps) {
    const [activeTab, setActiveTab] = useState('full_report');
    const [activeAccordionItems, setActiveAccordionItems] = useState<string[]>([]);
    const [isPowerEditDialogOpen, setIsPowerEditDialogOpen] = useState(false);
    const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
    const [newResumeName, setNewResumeName] = useState('');
    const [isDownloading, setIsDownloading] = useState(false);
    const [copied, setCopied] = useState(false);
    const { toast } = useToast();

    const categoryIssues = useMemo(() => {
        if (!analysisReport) return {};
        return {
            searchability: getSearchabilityIssueCount(analysisReport.searchabilityDetails),
            recruiterTips: analysisReport.recruiterTips?.filter(tip => tip.status === 'negative').length || 0,
            atsFriendliness: (analysisReport.standardFormattingIssues?.length || 0) + (analysisReport.undefinedAcronyms?.length || 0),
            highlights: getIssuesFromScore(analysisReport.highlightsScore),
            hardSkills: analysisReport.missingSkills?.length || 0,
            softSkills: getIssuesFromScore(analysisReport.softSkillsScore),
        };
    }, [analysisReport]);
    
    const handleDownloadReport = async () => { /* ... implementation from original file ... */ };
    const handlePowerEdit = () => setIsPowerEditDialogOpen(true);
    const openSaveDialog = () => setIsSaveDialogOpen(true);
    const handleSaveResume = () => { /* ... implementation from original file ... */ };
    const handleNavigateToIssue = (tab: string, sectionId: string) => { /* ... implementation from original file ... */ };

    return (
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
                        <Button onClick={() => onRescan({ resumeText, jobDescription, jobTitle, companyName })} variant="outline" className="flex-1 sm:flex-none" disabled={isDownloading}>
                            <RefreshCcw className="mr-2 h-4 w-4" /> Re-Analyze
                        </Button>
                        <Button onClick={handleDownloadReport} variant="outline" className="flex-1 sm:flex-none" disabled={isDownloading}>
                            {isDownloading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                            {isDownloading ? 'Downloading...' : 'Download'}
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Left Column - Scores & Actions */}
                    <div className="md:col-span-1 space-y-6 p-4 border-r border-border rounded-l-lg bg-secondary/30">
                        <ScoreCircle score={analysisReport.overallQualityScore ?? analysisReport.hardSkillsScore ?? 0} size="xl" label="Match Rate" />
                        
                        <Button onClick={onStartNewAnalysis} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
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
                            )}
                        </div>
                        {/* Summary Stats */}
                        <div className="space-y-3 pt-4 border-t">
                          {[
                              {label: "Searchability", score: analysisReport.searchabilityScore, issues: categoryIssues.searchability, sectionId: 'searchability-details-section', tabId: 'searchability_analysis'},
                              {label: "Recruiter Tips", score: analysisReport.recruiterTipsScore, issues: categoryIssues.recruiterTips, sectionId: 'recruiter-feedback-section', tabId: 'full_report'},
                              {label: "ATS Friendliness", score: analysisReport.atsStandardFormattingComplianceScore, issues: categoryIssues.atsFriendliness, sectionId: 'ats-friendliness-section', tabId: 'full_report'},
                              {label: "Highlights", score: analysisReport.highlightsScore, issues: categoryIssues.highlights, sectionId: 'highlights-section', tabId: 'full_report'},
                              {label: "Hard Skills", score: analysisReport.hardSkillsScore, issues: categoryIssues.hardSkills, sectionId: 'hard-skills-section', tabId: 'full_report'},
                              {label: "Soft Skills", score: analysisReport.softSkillsScore, issues: categoryIssues.softSkills, sectionId: 'soft-skills-section', tabId: 'full_report'},
                          ].map(cat => cat.score !== undefined && (
                              <div key={cat.label}>
                                  <div className="flex justify-between text-sm mb-0.5 items-center">
                                      <span className="font-medium text-muted-foreground">{cat.label}</span>
                                      {(cat.issues ?? 0) > 0 && (
                                         <Button variant="link" size="sm" className="text-xs text-red-500 font-semibold p-0 h-auto" onClick={() => handleNavigateToIssue(cat.tabId, cat.sectionId)}>
                                            {(cat.issues ?? 0)} issue{(cat.issues ?? 0) !== 1 ? 's' : ''}
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
                        {/* ... TABS AND ACCORDIONS ... */}
                    </div>
                </CardContent>
            </Card>

            {isPowerEditDialogOpen && (
                <Dialog open={isPowerEditDialogOpen} onOpenChange={setIsPowerEditDialogOpen}>
                    <PowerEditDialog
                        resumeText={resumeText}
                        jobDescriptionText={jobDescription}
                        onRewriteComplete={onRewriteComplete}
                    />
                </Dialog>
            )}

            {isSaveDialogOpen && (
                <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
                    <DialogContent>
                        {/* ... Save Dialog Content ... */}
                    </DialogContent>
                </Dialog>
            )}
        </>
    );
}
