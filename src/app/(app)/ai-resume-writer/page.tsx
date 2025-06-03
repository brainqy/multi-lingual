"use client";

import { useState, useEffect, type FormEvent } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Sparkles, Save, FileText, Edit } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { generateResumeVariant, type GenerateResumeVariantInput, type GenerateResumeVariantOutput } from '@/ai/flows/generate-resume-variant';
import { sampleResumeProfiles, sampleUserProfile } from '@/lib/sample-data';
import type { ResumeProfile } from '@/types';

export default function AiResumeWriterPage() {
  const [baseResumeText, setBaseResumeText] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [targetIndustry, setTargetIndustry] = useState('');
  const [skillsToHighlight, setSkillsToHighlight] = useState('');
  const [tone, setTone] = useState<GenerateResumeVariantInput['tone']>('professional');
  const [additionalInstructions, setAdditionalInstructions] = useState('');
  
  const [generatedResumeText, setGeneratedResumeText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const [userResumes, setUserResumes] = useState<ResumeProfile[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string>('');

  useEffect(() => {
    // Filter resumes for the current user
    const currentUserResumes = sampleResumeProfiles.filter(r => r.userId === sampleUserProfile.id);
    setUserResumes(currentUserResumes);
    if (currentUserResumes.length > 0) {
      // setSelectedResumeId(currentUserResumes[0].id);
      // setBaseResumeText(currentUserResumes[0].resumeText);
    }
  }, []);

  useEffect(() => {
    if (selectedResumeId) {
      const selected = userResumes.find(r => r.id === selectedResumeId);
      setBaseResumeText(selected?.resumeText || '');
    } else {
      // If no resume is selected (e.g. user wants to paste), don't clear if they've already typed.
      // User can explicitly clear it.
    }
  }, [selectedResumeId, userResumes]);

  const handleGenerateVariant = async (event: FormEvent) => {
    event.preventDefault();
    if (!baseResumeText.trim()) {
      toast({ title: "Error", description: "Please provide base resume text.", variant: "destructive" });
      return;
    }
    if (!targetRole.trim()) {
      toast({ title: "Error", description: "Please specify the target role.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    setGeneratedResumeText('');

    try {
      const input: GenerateResumeVariantInput = {
        baseResumeText,
        targetRole,
        targetIndustry: targetIndustry || undefined,
        skillsToHighlight: skillsToHighlight.split(',').map(s => s.trim()).filter(s => s),
        tone,
        additionalInstructions: additionalInstructions || undefined,
      };
      const result = await generateResumeVariant(input);
      setGeneratedResumeText(result.generatedResumeText);
      toast({ title: "Resume Variant Generated", description: "The new resume version is ready below." });
    } catch (error) {
      console.error("Resume generation error:", error);
      toast({ title: "Generation Failed", description: "An error occurred while generating the resume variant.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveGeneratedResume = () => {
    if (!generatedResumeText.trim()) {
      toast({ title: "Error", description: "No generated resume to save.", variant: "destructive" });
      return;
    }
    // Mock saving - In a real app, this would save to backend and update userResumes state
    const newResumeName = `Variant for ${targetRole || 'New Role'} (${new Date().toLocaleDateString()})`;
    const newResume: ResumeProfile = {
      id: `resume-${Date.now()}`,
      tenantId: sampleUserProfile.tenantId,
      userId: sampleUserProfile.id,
      name: newResumeName,
      resumeText: generatedResumeText,
      lastAnalyzed: new Date().toISOString().split('T')[0],
    };
    setUserResumes(prev => [newResume, ...prev]); // Add to local state for demo
    sampleResumeProfiles.push(newResume); // Add to global sample data for demo
    
    toast({ title: "Resume Saved (Mock)", description: `"${newResumeName}" has been added to 'My Resumes'.` });
  };

  return (
    <div className="space-y-8">
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Edit className="h-8 w-8 text-primary" /> AI Resume Writer
          </CardTitle>
          <CardDescription>
            Adapt your resume for different roles and industries with AI assistance.
            Select an existing resume or paste your content, then specify your target.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleGenerateVariant}>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column: Base Resume Input */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="select-resume" className="font-medium">Select Existing Resume</Label>
                  <Select onValueChange={(value) => setSelectedResumeId(value)} value={selectedResumeId}>
                    <SelectTrigger id="select-resume">
                      <SelectValue placeholder="-- Or type/paste below --" />
                    </SelectTrigger>
                    <SelectContent>
                      {userResumes.map(resume => (
                        <SelectItem key={resume.id} value={resume.id}>{resume.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="base-resume-text" className="font-medium">Base Resume Text</Label>
                  <Textarea
                    id="base-resume-text"
                    placeholder="Paste your current resume text here..."
                    value={baseResumeText}
                    onChange={(e) => { setBaseResumeText(e.target.value); setSelectedResumeId(''); }}
                    rows={15}
                    className="border-input focus:ring-primary"
                  />
                </div>
              </div>

              {/* Right Column: Generation Preferences */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="target-role" className="font-medium">Target Role / Job Title *</Label>
                  <Input 
                    id="target-role" 
                    placeholder="e.g., Senior Software Engineer, Product Manager" 
                    value={targetRole} 
                    onChange={(e) => setTargetRole(e.target.value)} 
                    required 
                  />
                </div>
                <div>
                  <Label htmlFor="target-industry" className="font-medium">Target Industry (Optional)</Label>
                  <Input 
                    id="target-industry" 
                    placeholder="e.g., Fintech, Healthcare Technology" 
                    value={targetIndustry} 
                    onChange={(e) => setTargetIndustry(e.target.value)} 
                  />
                </div>
                <div>
                  <Label htmlFor="skills-to-highlight" className="font-medium">Skills to Highlight (comma-separated, Optional)</Label>
                  <Textarea 
                    id="skills-to-highlight" 
                    placeholder="e.g., Project Management, Python, Data Visualization" 
                    value={skillsToHighlight} 
                    onChange={(e) => setSkillsToHighlight(e.target.value)}
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="tone" className="font-medium">Desired Tone</Label>
                  <Select onValueChange={(value: GenerateResumeVariantInput['tone']) => setTone(value)} defaultValue={tone}>
                    <SelectTrigger id="tone">
                      <SelectValue placeholder="Select tone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="creative">Creative</SelectItem>
                      <SelectItem value="concise">Concise</SelectItem>
                      <SelectItem value="technical">Technical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="additional-instructions" className="font-medium">Additional Instructions (Optional)</Label>
                  <Textarea 
                    id="additional-instructions" 
                    placeholder="e.g., Emphasize leadership experience, make it suitable for a startup environment." 
                    value={additionalInstructions} 
                    onChange={(e) => setAdditionalInstructions(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading} className="w-full md:w-auto bg-primary hover:bg-primary/90 text-primary-foreground">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" /> Generate Resume Variant
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>

      {isLoading && (
        <div className="text-center py-8">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="mt-2 text-muted-foreground">AI is crafting your resume variant...</p>
        </div>
      )}

      {generatedResumeText && !isLoading && (
        <Card className="shadow-xl mt-8">
          <CardHeader>
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <FileText className="h-7 w-7 text-primary" /> Generated Resume Variant
            </CardTitle>
            <CardDescription>Review the AI-generated resume text below. You can edit it further or save it.</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={generatedResumeText}
              onChange={(e) => setGeneratedResumeText(e.target.value)} // Allow editing
              rows={20}
              className="border-input focus:ring-primary font-mono text-sm"
            />
          </CardContent>
          <CardFooter>
            <Button onClick={handleSaveGeneratedResume} className="bg-green-600 hover:bg-green-700 text-primary-foreground">
              <Save className="mr-2 h-4 w-4" /> Save Generated Resume
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}