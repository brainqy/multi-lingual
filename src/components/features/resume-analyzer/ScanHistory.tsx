
"use client";

import React, { useState, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { History, Star, Trash2 } from "lucide-react";
import type { ResumeScanHistoryItem, ResumeProfile } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { cn } from "@/lib/utils";
import ScoreCircle from '@/components/ui/score-circle';
import { analyzeResumeAndJobDescription } from '@/ai/flows/analyze-resume-and-job-description';
import { updateScanHistory, deleteScanHistory } from '@/lib/actions/resumes';

interface ScanHistoryProps {
  scanHistory: ResumeScanHistoryItem[];
  setScanHistory: React.Dispatch<React.SetStateAction<ResumeScanHistoryItem[]>>;
  setAnalysisReport: React.Dispatch<React.SetStateAction<any>>;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setResumes: React.Dispatch<React.SetStateAction<ResumeProfile[]>>;
}

export default function ScanHistory({
  scanHistory,
  setScanHistory,
  setAnalysisReport,
  setIsLoading,
  setResumes
}: ScanHistoryProps) {
  const [historyFilter, setHistoryFilter] = useState<'all' | 'highest' | 'starred' | 'archived'>('all');
  const { toast } = useToast();

  const summaryStats = useMemo(() => {
    const totalScans = scanHistory.length;
    const uniqueResumes = new Set(scanHistory.map(s => s.resumeId)).size;
    const maxScore = scanHistory.reduce((max, s) => Math.max(max, s.matchScore || 0), 0);
    const highScoringCount = scanHistory.filter(s => (s.matchScore || 0) >= 80).length;
    return { totalScans, uniqueResumes, maxScore, highScoringCount };
  }, [scanHistory]);

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

  const handleViewReport = async (item: ResumeScanHistoryItem) => {
    if (!item.resumeTextSnapshot || !item.jobDescriptionText) {
      toast({ title: "Cannot View Report", description: "Missing data for this historical scan.", variant: "destructive" });
      return;
    }
    
    toast({ title: "Loading Historical Scan...", description: "Re-generating analysis." });
    setIsLoading(true);

    try {
      const report = await analyzeResumeAndJobDescription({
        resumeText: item.resumeTextSnapshot,
        jobDescriptionText: item.jobDescriptionText,
        jobTitle: item.jobTitle || undefined,
        companyName: item.companyName || undefined,
      });
      setAnalysisReport(report);
      toast({ title: "Historical Report Loaded", description: "The analysis report has been re-generated." });
    } catch (error: any) {
      toast({ title: "Report Load Failed", description: error.message || "Could not load report.", variant: "destructive" });
      setAnalysisReport(null);
    } finally {
      setIsLoading(false);
      const reportSection = document.getElementById('analysis-report-section');
      if (reportSection) reportSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleToggleBookmark = async (scanId: string) => {
    const scanItem = scanHistory.find(item => item.id === scanId);
    if (!scanItem) return;

    const newBookmarkedState = !scanItem.bookmarked;
    const updatedScan = await updateScanHistory(scanId, { bookmarked: newBookmarkedState });

    if (updatedScan) {
      setScanHistory(prev => prev.map(item => item.id === scanId ? updatedScan : item));
      toast({ title: newBookmarkedState ? "Scan Bookmarked" : "Bookmark Removed" });
    } else {
      toast({ title: "Error", description: "Could not update bookmark status.", variant: "destructive" });
    }
  };

  const handleDeleteScan = async (scanId: string) => {
    const success = await deleteScanHistory(scanId);
    if (success) {
      setScanHistory(prev => prev.filter(item => item.id !== scanId));
      toast({ title: "Scan Deleted", description: "Scan history entry removed." });
    } else {
      toast({ title: "Error", description: "Could not delete scan history.", variant: "destructive" });
    }
  };

  return (
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
        <Tabs defaultValue="all" onValueChange={(value) => setHistoryFilter(value as any)} className="mb-4">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
            <TabsTrigger value="all">View All</TabsTrigger>
            <TabsTrigger value="highest">Highest Match</TabsTrigger>
            <TabsTrigger value="starred">Starred</TabsTrigger>
            <TabsTrigger value="archived">Archived (Mock)</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="space-y-4">
          {filteredScanHistory.length === 0 ? (
            <p className="text-center text-muted-foreground py-6">No scans found.</p>
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
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
