
"use client";

import React, { useState, useEffect, type FormEvent } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Search, UploadCloud, ArrowRight, Loader2, HelpCircle } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import type { ResumeProfile } from '@/types';

interface ResumeInputFormProps {
  resumes: ResumeProfile[];
  isLoading: boolean;
  onSubmit: (formData: {
    resumeText: string;
    jobDescription: string;
    jobTitle: string;
    companyName: string;
    selectedResumeId: string | null;
    resumeFile: File | null;
  }) => void;
  initialResumeText?: string;
}

export default function ResumeInputForm({ resumes, isLoading, onSubmit, initialResumeText }: ResumeInputFormProps) {
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState(initialResumeText || '');
  const [jobDescription, setJobDescription] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null);

  const [isEditingJobTitle, setIsEditingJobTitle] = useState(false);
  const [isEditingCompanyName, setIsEditingCompanyName] = useState(false);
  
  const { toast } = useToast();

  useEffect(() => {
    const selectedResume = resumes.find(r => r.id === selectedResumeId);
    if (selectedResume) {
      setResumeText(selectedResume.resumeText ?? '');
      toast({ title: "Resume Loaded", description: `Loaded content for ${selectedResume.name}.` });
    }
  }, [selectedResumeId, resumes, toast]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      setResumeFile(file);
      setSelectedResumeId(null);
      setResumeText('');

      if (file.type === "application/pdf" || file.type.includes("wordprocessingml")) {
        toast({
          title: "File Format Notice",
          description: "PDF/DOCX parsing is not supported. Please copy and paste the resume text for accurate analysis.",
          variant: "default",
          duration: 7000
        });
        setResumeText(`Mock content for ${file.name}. Please paste the actual text for analysis.`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => setResumeText(e.target?.result as string);
      reader.onerror = () => toast({ title: "File Read Error", variant: "destructive" });
      reader.readAsText(file);
    }
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    onSubmit({ resumeText, jobDescription, jobTitle, companyName, selectedResumeId, resumeFile });
  };

  return (
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
                    <TooltipTrigger asChild><Button variant="ghost" size="icon" type="button" className="h-5 w-5 p-0"><HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" /></Button></TooltipTrigger>
                    <TooltipContent><p>Choose a resume you've previously saved or analyzed.</p></TooltipContent>
                  </Tooltip>
                </div>
                <select
                  id="resume-select"
                  value={selectedResumeId || ''}
                  onChange={(e) => { setSelectedResumeId(e.target.value || null); if(e.target.value) {setResumeFile(null);} }}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">-- Select or Paste/Upload Below --</option>
                  {resumes.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>

                <div className="relative flex items-center my-2"><div className="flex-grow border-t border-muted"></div><span className="flex-shrink mx-4 text-muted-foreground text-xs uppercase">OR</span><div className="flex-grow border-t border-muted"></div></div>

                <Label htmlFor="resume-file-upload" className="text-lg font-medium">Upload New Resume</Label>
                <div className="flex items-center justify-center w-full">
                  <label htmlFor="resume-file-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-secondary/50 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <UploadCloud className="w-8 h-8 mb-2 text-muted-foreground" /><p className="mb-1 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag & drop</p><p className="text-xs text-muted-foreground">PDF, DOCX, TXT, MD</p>
                    </div>
                    <Input id="resume-file-upload" type="file" className="hidden" onChange={handleFileChange} accept=".pdf,.docx,.doc,.txt,.md" />
                  </label>
                </div>
                {resumeFile && <p className="text-sm text-muted-foreground">Uploaded: {resumeFile.name}</p>}

                <div className="relative flex items-center my-2"><div className="flex-grow border-t border-muted"></div><span className="flex-shrink mx-4 text-muted-foreground text-xs uppercase">OR</span><div className="flex-grow border-t border-muted"></div></div>

                <Label htmlFor="resume-text-area" className="text-lg font-medium">Paste Resume Text</Label>
                <Textarea id="resume-text-area" placeholder="Paste your resume content here..." value={resumeText} onChange={(e) => { setResumeText(e.target.value); setSelectedResumeId(null); setResumeFile(null); }} rows={8} className="border-input focus:ring-primary" />
              </div>
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="job-title-input">Target Job Title</Label>
                    <Input id="job-title-input" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} placeholder="Enter job title" />
                  </div>
                  <div>
                    <Label htmlFor="company-name-input">Target Company Name</Label>
                    <Input id="company-name-input" value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Enter company name" />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="job-description-area" className="text-lg font-medium">Job Description</Label>
                  <Tooltip>
                    <TooltipTrigger asChild><Button variant="ghost" size="icon" type="button" className="h-5 w-5 p-0"><HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" /></Button></TooltipTrigger>
                    <TooltipContent><p className="max-w-xs">Paste the full job description for the most accurate analysis.</p></TooltipContent>
                  </Tooltip>
                </div>
                <Textarea id="job-description-area" placeholder="Paste the job description here..." value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} rows={resumes.length > 0 || resumeFile || resumeText.length > 0 ? 10 + 14 + 4 : 10} className="border-input focus:ring-primary" />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading} className="w-full md:w-auto bg-primary hover:bg-primary/90 text-primary-foreground">
              {isLoading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing...</>) : (<>Analyze Resume <ArrowRight className="ml-2 h-4 w-4" /></>)}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </TooltipProvider>
  );
}
