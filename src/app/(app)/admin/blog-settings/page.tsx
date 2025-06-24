
"use client";
import { useI18n } from "@/hooks/use-i18n";
import { Settings2 } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings, Loader2, Sparkles, Send, CalendarClock, Tag, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { BlogGenerationSettings, BlogPost } from "@/types";
import { sampleBlogGenerationSettings, sampleBlogPosts, sampleUserProfile } from "@/lib/sample-data";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { generateAiBlogPost, type GenerateAiBlogPostInput, type GenerateAiBlogPostOutput } from "@/ai/flows/generate-ai-blog-post";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import AccessDeniedMessage from "@/components/ui/AccessDeniedMessage";

const settingsSchemaBase = z.object({
  generationIntervalHours: z.coerce.number().min(1, "validation.intervalMin").max(720, "validation.intervalMax"),
  topics: z.string().min(1, "validation.topicsRequired"),
  style: z.enum(['informative', 'casual', 'formal', 'technical', 'storytelling']).optional(),
});

type SettingsFormData = z.infer<typeof settingsSchemaBase>;

const generateSlug = (title: string) => title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');

export default function AdminBlogSettingsPage() {
  const { t } = useI18n();
  const [settings, setSettings] = useState<BlogGenerationSettings>(sampleBlogGenerationSettings);
  const [isLoading, setIsLoading] = useState(false);
  const [manualTopic, setManualTopic] = useState(settings.topics[0] || "");
  const { toast } = useToast();
  const currentUser = sampleUserProfile;

  const translatedSettingsSchema = settingsSchemaBase.extend({
    generationIntervalHours: z.coerce.number().min(1, t("blogSettingsAdmin.validation.intervalMin")).max(720, t("blogSettingsAdmin.validation.intervalMax")),
    topics: z.string().min(1, t("blogSettingsAdmin.validation.topicsRequired")),
  });

  const { control, handleSubmit, reset, formState: { errors } } = useForm<SettingsFormData>({
    resolver: zodResolver(translatedSettingsSchema),
    defaultValues: {
      generationIntervalHours: settings.generationIntervalHours,
      topics: settings.topics.join(", "),
      style: settings.style,
    }
  });
  
  useEffect(() => {
    reset({
      generationIntervalHours: settings.generationIntervalHours,
      topics: settings.topics.join(", "),
      style: settings.style,
    });
  }, [settings, reset]);

  if (currentUser.role !== 'admin') {
    return <AccessDeniedMessage />;
  }

  const onSettingsSubmit = (data: SettingsFormData) => {
    const updatedSettings: BlogGenerationSettings = {
      ...settings,
      generationIntervalHours: data.generationIntervalHours,
      topics: data.topics.split(',').map(t => t.trim()).filter(t => t),
      style: data.style,
    };
    setSettings(updatedSettings);
    Object.assign(sampleBlogGenerationSettings, updatedSettings); 
    toast({ title: t("blogSettingsAdmin.toast.settingsSaved.title"), description: t("blogSettingsAdmin.toast.settingsSaved.description") });
  };

  const handleManualGenerate = async () => {
    if (!manualTopic.trim()) {
      toast({ title: t("blogSettingsAdmin.toast.noTopicSelected.title"), description: t("blogSettingsAdmin.toast.noTopicSelected.description"), variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      const input: GenerateAiBlogPostInput = {
        topic: manualTopic,
        style: settings.style,
      };
      const blogOutput = await generateAiBlogPost(input);
      
      const newPost: BlogPost = {
        id: `blog-ai-${Date.now()}`,
        tenantId: 'platform', 
        userId: 'system-ai',
        userName: 'ResumeMatch AI Writer',
        userAvatar: 'https://picsum.photos/seed/aiwriter/50/50',
        title: blogOutput.title,
        slug: generateSlug(blogOutput.title),
        author: 'ResumeMatch AI Writer',
        date: new Date().toISOString(),
        content: blogOutput.content,
        excerpt: blogOutput.excerpt,
        tags: blogOutput.suggestedTags,
        comments: [],
      };
      
      sampleBlogPosts.unshift(newPost); 
      
      const updatedSettings = { ...settings, lastGenerated: new Date().toISOString() };
      setSettings(updatedSettings);
      Object.assign(sampleBlogGenerationSettings, updatedSettings);

      toast({ 
        title: t("blogSettingsAdmin.toast.postGenerated.title"), 
        description: t("blogSettingsAdmin.toast.postGenerated.description", { title: blogOutput.title }),
        duration: 7000,
      });

    } catch (error) {
      console.error("AI Blog generation error:", error);
      const errorMessage = (error as any).message || String(error);
      if (errorMessage.toLowerCase().includes('quota') || errorMessage.toLowerCase().includes('billing')) {
          toast({
              title: "API Usage Limit Exceeded",
              description: "You have exceeded your Gemini API usage limit. Please check your Google Cloud billing account.",
              variant: "destructive",
              duration: 9000,
          });
      } else {
        toast({ title: t("blogSettingsAdmin.toast.generationFailed.title"), description: t("blogSettingsAdmin.toast.generationFailed.description"), variant: "destructive" });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
        <Settings className="h-8 w-8" /> {t("blogSettingsAdmin.title")}
      </h1>
      <CardDescription>{t("blogSettingsAdmin.description")}</CardDescription>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>{t("blogSettingsAdmin.automationSettingsTitle")}</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit(onSettingsSubmit)}>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="generationIntervalHours">{t("blogSettingsAdmin.generationIntervalLabel")}</Label>
              <Controller 
                name="generationIntervalHours" 
                control={control} 
                render={({ field }) => <Input id="generationIntervalHours" type="number" {...field} />} 
              />
              {errors.generationIntervalHours && <p className="text-sm text-destructive mt-1">{errors.generationIntervalHours.message}</p>}
              <p className="text-xs text-muted-foreground mt-1">{t("blogSettingsAdmin.generationIntervalHelp")}</p>
            </div>
            <div>
              <Label htmlFor="topics">{t("blogSettingsAdmin.topicsLabel")}</Label>
              <Controller 
                name="topics" 
                control={control} 
                render={({ field }) => <Textarea id="topics" {...field} rows={3} placeholder={t("blogSettingsAdmin.topicsPlaceholder")} />} 
              />
              {errors.topics && <p className="text-sm text-destructive mt-1">{errors.topics.message}</p>}
               <p className="text-xs text-muted-foreground mt-1">{t("blogSettingsAdmin.topicsHelp")}</p>
            </div>
            <div>
              <Label htmlFor="style">{t("blogSettingsAdmin.styleLabel")}</Label>
              <Controller 
                name="style" 
                control={control} 
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger id="style"><SelectValue placeholder={t("blogSettingsAdmin.stylePlaceholder")} /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="informative">{t("blogSettingsAdmin.styleInformative")}</SelectItem>
                      <SelectItem value="casual">{t("blogSettingsAdmin.styleCasual")}</SelectItem>
                      <SelectItem value="formal">{t("blogSettingsAdmin.styleFormal")}</SelectItem>
                      <SelectItem value="technical">{t("blogSettingsAdmin.styleTechnical")}</SelectItem>
                      <SelectItem value="storytelling">{t("blogSettingsAdmin.styleStorytelling")}</SelectItem>
                    </SelectContent>
                  </Select>
                )} 
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground">
              {t("blogSettingsAdmin.saveAutomationButton")}
            </Button>
          </CardFooter>
        </form>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>{t("blogSettingsAdmin.manualGenerationTitle")}</CardTitle>
          <CardDescription>
            {t("blogSettingsAdmin.lastGeneratedPrefix")} {settings.lastGenerated ? formatDistanceToNow(new Date(settings.lastGenerated), { addSuffix: true }) : t("blogSettingsAdmin.lastGeneratedNever")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
           <div>
            <Label htmlFor="manual-topic">{t("blogSettingsAdmin.selectTopicManualLabel")}</Label>
             <Select value={manualTopic} onValueChange={setManualTopic}>
                <SelectTrigger id="manual-topic">
                  <SelectValue placeholder={t("blogSettingsAdmin.selectTopicManualPlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  {settings.topics.map(topic => (
                    <SelectItem key={topic} value={topic}>{topic}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input 
                value={manualTopic}
                onChange={(e) => setManualTopic(e.target.value)}
                placeholder={t("blogSettingsAdmin.customTopicPlaceholder")}
                className="mt-2"
              />
           </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleManualGenerate} disabled={isLoading} className="w-full md:w-auto">
            {isLoading ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t("blogSettingsAdmin.generatingButton")}</>
            ) : (
              <><Sparkles className="mr-2 h-4 w-4" /> {t("blogSettingsAdmin.generateNowButton")}</>
            )}
          </Button>
        </CardFooter>
      </Card>

      <Card className="shadow-md bg-secondary/50 border-primary/20">
        <CardHeader className="flex flex-row items-center gap-3">
           <Info className="h-6 w-6 text-primary" />
          <CardTitle className="text-lg">{t("blogSettingsAdmin.importantNoteTitle")}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {t("blogSettingsAdmin.importantNoteContent")}
          </p>
        </CardContent>
      </Card>

    </div>
  );
}
