
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
import { useI18n } from '@/hooks/use-i18n';

export default function AiResumeWriterPage() {
  const { t } = useI18n();
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
        toast({ title: t("common.error"), description: t("aiResumeWriter.toast.mustBeLoggedIn"), variant: "destructive" });
        return;
    }
    if (!baseResumeText.trim()) {
      toast({ title: t("common.error"), description: t("aiResumeWriter.toast.baseResumeRequired"), variant: "destructive" });
      return;
    }
    if (!targetRole.trim()) {
      toast({ title: t("common.error"), description: t("aiResumeWriter.toast.targetRoleRequired"), variant: "destructive" });
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
      toast({ title: t("aiResumeWriter.toast.generationSuccess.title"), description: t("aiResumeWriter.toast.generationSuccess.description") });
    } catch (error) {
      console.error("Resume generation error:", error);
      const errorMessage = (error as any).message || String(error);
      if (errorMessage.toLowerCase().includes('quota') || errorMessage.toLowerCase().includes('billing')) {
          toast({
              title: t("aiMockInterview.toast.apiQuotaError.title"),
              description: t("aiMockInterview.toast.apiQuotaError.description"),
              variant: "destructive",
              duration: 9000,
          });
      } else {
        toast({ title: t("aiResumeWriter.toast.generationFailed.title"), description: t("aiResumeWriter.toast.generationFailed.description"), variant: "destructive" });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const openSaveDialog = () => {
    if (!generatedResumeText.trim()) {
      toast({ title: t("common.error"), description: t("aiResumeWriter.toast.noResumeToSave"), variant: "destructive" });
      return;
    }
    const defaultName = t("aiResumeWriter.defaultSaveName", { role: targetRole || 'New Role', date: new Date().toLocaleDateString() });
    setNewResumeName(defaultName);
    setIsSaveDialogOpen(true);
  };


  const handleSaveGeneratedResume = async () => {
    if (!currentUser) return;
    if (!newResumeName.trim()) {
      toast({ title: t("aiResumeWriter.toast.nameRequired.title"), description: t("aiResumeWriter.toast.nameRequired.description"), variant: "destructive" });
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
        toast({ title: t("aiResumeWriter.toast.saveSuccess.title"), description: t("aiResumeWriter.toast.saveSuccess.description", { name: newResumeName }) });
        setIsSaveDialogOpen(false);
        setNewResumeName('');
    } else {
        toast({ title: t("aiResumeWriter.toast.saveFailed.title"), description: t("aiResumeWriter.toast.saveFailed.description"), variant: "destructive" });
    }
  };
  
  const handleCopyToClipboard = () => {
    if (!generatedResumeText) return;
    navigator.clipboard.writeText(generatedResumeText).then(() => {
      toast({ title: t("common.copied"), description: t("aiResumeWriter.toast.copied") });
    }).catch(err => {
      toast({ title: t("common.copyFailed"), variant: "destructive" });
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
            <Edit className="h-8 w-8 text-primary" /> {t("aiResumeWriter.title")}
          </CardTitle>
          <CardDescription>
            {t("aiResumeWriter.description")}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleGenerateVariant}>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column: Base Resume Input */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="select-resume" className="font-medium">{t("aiResumeWriter.selectResumeLabel")}</Label>
                  <Select onValueChange={(value) => setSelectedResumeId(value)} value={selectedResumeId}>
                    <SelectTrigger id="select-resume">
                      <SelectValue placeholder={t("aiResumeWriter.selectResumePlaceholder")} />
                    </SelectTrigger>
                    <SelectContent>
                      {userResumes.map(resume => (
                        <SelectItem key={resume.id} value={resume.id}>{resume.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="base-resume-text" className="font-medium">{t("aiResumeWriter.baseResumeLabel")}</Label>
                  <Textarea
                    id="base-resume-text"
                    placeholder={t("aiResumeWriter.baseResumePlaceholder")}
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
                  <Label htmlFor="target-role" className="font-medium">{t("aiResumeWriter.targetRoleLabel")} *</Label>
                  <Input 
                    id="target-role" 
                    placeholder={t("aiResumeWriter.targetRolePlaceholder")} 
                    value={targetRole} 
                    onChange={(e) => setTargetRole(e.target.value)} 
                    required 
                  />
                </div>
                <div>
                  <Label htmlFor="target-industry" className="font-medium">{t("aiResumeWriter.targetIndustryLabel")}</Label>
                  <Input 
                    id="target-industry" 
                    placeholder={t("aiResumeWriter.targetIndustryPlaceholder")}
                    value={targetIndustry} 
                    onChange={(e) => setTargetIndustry(e.target.value)} 
                  />
                </div>
                <div>
                  <Label htmlFor="skills-to-highlight" className="font-medium">{t("aiResumeWriter.skillsToHighlightLabel")}</Label>
                  <Textarea 
                    id="skills-to-highlight" 
                    placeholder={t("aiResumeWriter.skillsToHighlightPlaceholder")} 
                    value={skillsToHighlight} 
                    onChange={(e) => setSkillsToHighlight(e.target.value)}
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="tone" className="font-medium">{t("aiResumeWriter.toneLabel")}</Label>
                  <Select onValueChange={(value: GenerateResumeVariantInput['tone']) => setTone(value)} defaultValue={tone}>
                    <SelectTrigger id="tone">
                      <SelectValue placeholder={t("aiResumeWriter.tonePlaceholder")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="professional">{t("aiResumeWriter.tones.professional")}</SelectItem>
                      <SelectItem value="creative">{t("aiResumeWriter.tones.creative")}</SelectItem>
                      <SelectItem value="concise">{t("aiResumeWriter.tones.concise")}</SelectItem>
                      <SelectItem value="technical">{t("aiResumeWriter.tones.technical")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="additional-instructions" className="font-medium">{t("aiResumeWriter.additionalInstructionsLabel")}</Label>
                  <Textarea 
                    id="additional-instructions" 
                    placeholder={t("aiResumeWriter.additionalInstructionsPlaceholder")}
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
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t("common.generating")}
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" /> {t("aiResumeWriter.generateButton")}
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>

      {isLoading && (
        <div className="text-center py-8">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="mt-2 text-muted-foreground">{t("aiResumeWriter.generatingMessage")}</p>
        </div>
      )}

      {generatedResumeText && !isLoading && (
        <Card className="shadow-xl mt-8">
          <CardHeader>
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <FileText className="h-7 w-7 text-primary" /> {t("aiResumeWriter.generatedResumeTitle")}
            </CardTitle>
            <CardDescription>{t("aiResumeWriter.generatedResumeDescription")}</CardDescription>
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
              <Copy className="mr-2 h-4 w-4" /> {t("common.copyToClipboard")}
            </Button>
            <Button onClick={openSaveDialog} className="bg-green-600 hover:bg-green-700 text-primary-foreground">
              <Save className="mr-2 h-4 w-4" /> {t("aiResumeWriter.saveButton")}
            </Button>
          </CardFooter>
        </Card>
      )}

      <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("aiResumeWriter.saveDialog.title")}</DialogTitle>
            <DialogDescription>
              {t("aiResumeWriter.saveDialog.description")}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="resume-name" className="text-right">
                {t("aiResumeWriter.saveDialog.nameLabel")}
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
            <DialogClose asChild><Button type="button" variant="outline">{t("common.cancel")}</Button></DialogClose>
            <Button onClick={handleSaveGeneratedResume} type="button">{t("aiResumeWriter.saveDialog.saveButton")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
