
"use client";
import { useI18n } from "@/hooks/use-i18n";
import { useState, type FormEvent } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Sparkles, Save, FileText, Edit, Copy } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { generateCoverLetter, type GenerateCoverLetterInput } from '@/ai/flows/generate-cover-letter';
import { useAuth } from "@/hooks/use-auth";
import { useSettings } from "@/contexts/settings-provider";

export default function CoverLetterGeneratorPage() {
  const { t } = useI18n();
  const [jobDescriptionText, setJobDescriptionText] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  
  const [generatedCoverLetterText, setGeneratedCoverLetterText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user: currentUser, isLoading: isUserLoading } = useAuth();
  const { settings } = useSettings();

  const handleGenerateCoverLetter = async (event: FormEvent) => {
    event.preventDefault();
    if (!currentUser || !settings) {
        toast({ title: t("common.error"), description: t("coverLetterGenerator.toast.mustBeLoggedIn"), variant: "destructive" });
        return;
    }
    if (!jobDescriptionText.trim()) {
      toast({ title: t("common.error"), description: t("coverLetterGenerator.toast.jobDescriptionRequired"), variant: "destructive" });
      return;
    }
    if (!companyName.trim()) {
      toast({ title: t("common.error"), description: t("coverLetterGenerator.toast.companyNameRequired"), variant: "destructive" });
      return;
    }
    if (!jobTitle.trim()) {
      toast({ title: t("common.error"), description: t("coverLetterGenerator.toast.jobTitleRequired"), variant: "destructive" });
      return;
    }

    setIsLoading(true);
    setGeneratedCoverLetterText('');

    const userProfileText = `
Name: ${currentUser.name}
Email: ${currentUser.email}
Current Role: ${currentUser.currentJobTitle || 'N/A'} at ${currentUser.currentOrganization || 'N/A'}
Years of Experience: ${currentUser.yearsOfExperience || 'N/A'}
Skills: ${(currentUser.skills || []).join(', ') || 'N/A'}
Bio: ${currentUser.bio || 'N/A'}
Career Interests: ${currentUser.careerInterests || 'N/A'}
Key highlights from resume: 
${currentUser.resumeText ? currentUser.resumeText.substring(0, 1000) + '...' : 'N/A'}
`.trim();

    try {
      const input: GenerateCoverLetterInput = {
        userProfileText,
        jobDescriptionText,
        companyName,
        jobTitle,
        userName: currentUser.name,
        additionalNotes: additionalNotes || undefined,
        apiKey: settings.allowUserApiKey ? currentUser.userApiKey : undefined,
      };
      const result = await generateCoverLetter(input);
      setGeneratedCoverLetterText(result.generatedCoverLetterText);
      toast({ title: t("coverLetterGenerator.toast.generationSuccess.title"), description: t("coverLetterGenerator.toast.generationSuccess.description") });
    } catch (error) {
      console.error("Cover letter generation error:", error);
      const errorMessage = (error as any).message || String(error);
      if (errorMessage.toLowerCase().includes('quota') || errorMessage.toLowerCase().includes('billing')) {
          toast({
              title: t("aiMockInterview.toast.apiQuotaError.title"),
              description: t("aiMockInterview.toast.apiQuotaError.description"),
              variant: "destructive",
              duration: 9000,
          });
      } else {
        toast({ title: t("coverLetterGenerator.toast.generationFailed.title"), description: t("coverLetterGenerator.toast.generationFailed.description"), variant: "destructive" });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyToClipboard = () => {
    if (!generatedCoverLetterText) return;
    navigator.clipboard.writeText(generatedCoverLetterText).then(() => {
      toast({ title: t("common.copied"), description: t("coverLetterGenerator.toast.copied") });
    }).catch(err => {
      toast({ title: t("common.copyFailed"), variant: "destructive" });
    });
  };

  if (isUserLoading || !currentUser) {
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
            <Edit className="h-8 w-8 text-primary" /> {t("coverLetterGenerator.title")}
          </CardTitle>
          <CardDescription>
            {t("coverLetterGenerator.description")}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleGenerateCoverLetter}>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column: Job Details Input */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="job-title" className="font-medium">{t("coverLetterGenerator.jobTitleLabel")} *</Label>
                  <Input 
                    id="job-title" 
                    placeholder={t("coverLetterGenerator.jobTitlePlaceholder")}
                    value={jobTitle} 
                    onChange={(e) => setJobTitle(e.target.value)} 
                    required 
                  />
                </div>
                <div>
                  <Label htmlFor="company-name" className="font-medium">{t("coverLetterGenerator.companyNameLabel")} *</Label>
                  <Input 
                    id="company-name" 
                    placeholder={t("coverLetterGenerator.companyNamePlaceholder")}
                    value={companyName} 
                    onChange={(e) => setCompanyName(e.target.value)} 
                    required 
                  />
                </div>
                <div>
                  <Label htmlFor="job-description" className="font-medium">{t("coverLetterGenerator.jobDescriptionLabel")} *</Label>
                  <Textarea
                    id="job-description"
                    placeholder={t("coverLetterGenerator.jobDescriptionPlaceholder")}
                    value={jobDescriptionText}
                    onChange={(e) => setJobDescriptionText(e.target.value)}
                    rows={15}
                    className="border-input focus:ring-primary"
                    required
                  />
                </div>
              </div>

              {/* Right Column: User Info & Additional Notes */}
              <div className="space-y-4">
                 <div>
                    <Label className="font-medium">{t("coverLetterGenerator.userProfileInfoLabel")}</Label>
                    <Card className="mt-1 bg-secondary/50 p-3">
                        <p className="text-sm text-muted-foreground line-clamp-4">
                            <strong>{t("common.name")}:</strong> {currentUser.name}<br/>
                            <strong>{t("common.role")}:</strong> {currentUser.currentJobTitle || 'N/A'}<br/>
                            <strong>{t("common.skills")}:</strong> {(currentUser.skills || []).slice(0,3).join(', ') || 'N/A'}...<br/>
                            ({t("coverLetterGenerator.profileInfoNote")})
                        </p>
                        <Button variant="link" size="sm" className="p-0 h-auto mt-1" asChild>
                            <a href="/profile" target="_blank">{t("coverLetterGenerator.viewProfileLink")}</a>
                        </Button>
                    </Card>
                 </div>
                 <div>
                  <Label htmlFor="additional-notes" className="font-medium">{t("coverLetterGenerator.additionalNotesLabel")}</Label>
                  <Textarea 
                    id="additional-notes" 
                    placeholder={t("coverLetterGenerator.additionalNotesPlaceholder")}
                    value={additionalNotes} 
                    onChange={(e) => setAdditionalNotes(e.target.value)}
                    rows={5}
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
                  <Sparkles className="mr-2 h-4 w-4" /> {t("coverLetterGenerator.generateButton")}
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>

      {isLoading && (
        <div className="text-center py-8">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="mt-2 text-muted-foreground">{t("coverLetterGenerator.generatingMessage")}</p>
        </div>
      )}

      {generatedCoverLetterText && !isLoading && (
        <Card className="shadow-xl mt-8">
          <CardHeader>
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <FileText className="h-7 w-7 text-primary" /> {t("coverLetterGenerator.generatedCoverLetterTitle")}
            </CardTitle>
            <CardDescription>{t("coverLetterGenerator.generatedCoverLetterDescription")}</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={generatedCoverLetterText}
              onChange={(e) => setGeneratedCoverLetterText(e.target.value)} // Allow editing
              rows={20}
              className="border-input focus:ring-primary font-serif text-sm leading-relaxed" // Using serif for a letter feel
            />
          </CardContent>
          <CardFooter className="flex justify-between">
             <Button onClick={handleCopyToClipboard} variant="outline">
              <Copy className="mr-2 h-4 w-4" /> {t("common.copyToClipboard")}
            </Button>
            {/* Optionally, a "Save Letter" button could be added here */}
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
