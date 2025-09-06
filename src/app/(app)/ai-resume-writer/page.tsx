
"use client";

import { useState, type FormEvent } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Sparkles, Save, FileText, Edit, Copy } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { generateResumeVariant, type GenerateResumeVariantInput } from '@/ai/flows/generate-resume-variant';
import type { ResumeProfile } from '@/types';
import { useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { useAuth } from '@/hooks/use-auth';
import { useSettings } from '@/contexts/settings-provider';
import { getResumeProfiles, createResumeProfile } from '@/lib/actions/resumes';

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
  const { user: currentUser, isLoading: isUserLoading } = useAuth();
  const { settings } = useSettings();

  const [userResumes, setUserResumes] = useState<ResumeProfile[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string>('');
  
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [newResumeName, setNewResumeName] = useState('');


  useEffect(() => {
    async function loadResumes() {
        if (currentUser) {
            const currentUserResumes = await getResumeProfiles(currentUser.id);
            setUserResumes(currentUserResumes);
        }
    }
    loadResumes();
  }, [currentUser]);

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
    if (!currentUser || !settings) {
        toast({ title: "Error", description: "You must be logged in to use this feature.", variant: "destructive" });
        return;
    }
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
        apiKey: settings.allowUserApiKey ? currentUser.userApiKey : undefined,
      };
      const result = await generateResumeVariant(input);
      setGeneratedResumeText(result.generatedResumeText);
      toast({ title: "Resume Variant Generated", description: "The new resume version is ready below." });
    } catch (error) {
      console.error("Resume generation error:", error);
      const errorMessage = (error as any).message || String(error);
      if (errorMessage.toLowerCase().includes('quota') || errorMessage.toLowerCase().includes('billing')) {
          toast({
              title: "API Usage Limit Exceeded",
              description: "You have exceeded your Gemini API usage limit. Please check your Google Cloud billing account.",
              variant: "destructive",
              duration: 9000,
          });
      } else {
        toast({ title: "Generation Failed", description: "An error occurred while generating the resume variant.", variant: "destructive" });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const openSaveDialog = () => {
    if (!generatedResumeText.trim()) {
      toast({ title: "Error", description: "No generated resume to save.", variant: "destructive" });
      return;
    }
    const defaultName = `Variant for ${targetRole || 'New Role'} (${new Date().toLocaleDateString()})`;
    setNewResumeName(defaultName);
    setIsSaveDialogOpen(true);
  };


  const handleSaveGeneratedResume = async () => {
    if (!currentUser) return;
    if (!newResumeName.trim()) {
      toast({ title: "Name Required", description: "Please provide a name for the resume profile.", variant: "destructive" });
      return;
    }
    const newResumeData: Omit<ResumeProfile, 'id' | 'createdAt' | 'updatedAt' | 'lastAnalyzed'> = {
      userId: currentUser.id,
      tenantId: currentUser.tenantId,
      name: newResumeName,
      resumeText: generatedResumeText,
    };
    
    const newResume = await createResumeProfile(newResumeData);
    
    if(newResume) {
        setUserResumes(prev => [newResume, ...prev]); 
        toast({ title: "Resume Saved", description: `"${newResumeName}" has been saved to 'My Resumes'.` });
        setIsSaveDialogOpen(false);
        setNewResumeName('');
    } else {
        toast({ title: "Save Failed", description: "Could not save the resume.", variant: "destructive" });
    }
  };
  
  const handleCopyToClipboard = () => {
    if (!generatedResumeText) return;
    navigator.clipboard.writeText(generatedResumeText).then(() => {
      toast({ title: "Copied to Clipboard", description: "Cover letter copied!" });
    }).catch(err => {
      toast({ title: "Copy Failed", description: "Could not copy text.", variant: "destructive" });
    });
  };

  if (isUserLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

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
            <CardDescription>Review the AI-generated resume text below. You can edit it or copy it.</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={generatedResumeText}
              onChange={(e) => setGeneratedResumeText(e.target.value)} // Allow editing
              rows={20}
              className="border-input focus:ring-primary font-serif text-sm leading-relaxed" // Using serif for a letter feel
            />
          </CardContent>
          <CardFooter className="flex justify-between">
             <Button onClick={handleCopyToClipboard} variant="outline">
              <Copy className="mr-2 h-4 w-4" /> Copy to Clipboard
            </Button>
            <Button onClick={openSaveDialog} className="bg-green-600 hover:bg-green-700 text-primary-foreground">
              <Save className="mr-2 h-4 w-4" /> Save Generated Resume
            </Button>
          </CardFooter>
        </Card>
      )}

      <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Resume Version</DialogTitle>
            <DialogDescription>
              Give this new resume version a name to save it to your "My Resumes" list.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="resume-name" className="text-right">
                Name
              </Label>
              <Input
                id="resume-name"
                value={newResumeName}
                onChange={(e) => setNewResumeName(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
            <Button onClick={handleSaveGeneratedResume} type="button">Save Resume</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
