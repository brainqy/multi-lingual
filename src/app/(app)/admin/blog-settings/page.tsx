
"use client";
import { useI18n } from "@/hooks/use-i18n";
import { Settings2 } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings, Loader2, Sparkles, Send, CalendarClock, Tag, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { BlogGenerationSettings, BlogPost } from "@/types";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { generateAiBlogPost, type GenerateAiBlogPostInput } from "@/ai/flows/generate-ai-blog-post";
import { formatDistanceToNow, parseISO } from "date-fns";
import AccessDeniedMessage from "@/components/ui/AccessDeniedMessage";
import { useAuth } from "@/hooks/use-auth";
import { getBlogGenerationSettings, updateBlogGenerationSettings, createBlogPost } from "@/lib/actions/blog";
import { Skeleton } from "@/components/ui/skeleton";

const settingsSchemaBase = z.object({
  generationIntervalHours: z.coerce.number().min(1).max(720),
  topics: z.string().min(1),
  style: z.enum(['informative', 'casual', 'formal', 'technical', 'storytelling']).optional(),
});

type SettingsFormData = z.infer<typeof settingsSchemaBase>;

const generateSlug = (title: string) => title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');

export default function AdminBlogSettingsPage() {
  const { t } = useI18n();
  const { user: currentUser } = useAuth();
  const [settings, setSettings] = useState<BlogGenerationSettings | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [manualTopic, setManualTopic] = useState("");
  const { toast } = useToast();
  
  const translatedSettingsSchema = settingsSchemaBase.extend({
    generationIntervalHours: z.coerce.number().min(1, t("blogSettingsAdmin.validation.intervalMin", { default: "Interval must be at least 1 hour." })).max(720, t("blogSettingsAdmin.validation.intervalMax", { default: "Interval cannot exceed 720 hours (30 days)." })),
    topics: z.string().min(1, t("blogSettingsAdmin.validation.topicsRequired", { default: "At least one topic is required." })),
  });

  const { control, handleSubmit, reset, formState: { errors } } = useForm<SettingsFormData>({
    resolver: zodResolver(translatedSettingsSchema),
  });
  
  const fetchSettings = useCallback(async () => {
    setIsPageLoading(true);
    const fetchedSettings = await getBlogGenerationSettings();
    setSettings(fetchedSettings);
    setManualTopic(fetchedSettings.topics[0] || "");
    reset({
      generationIntervalHours: fetchedSettings.generationIntervalHours,
      topics: fetchedSettings.topics.join(", "),
      style: fetchedSettings.style,
    });
    setIsPageLoading(false);
  }, [reset]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  if (!currentUser || currentUser.role !== 'admin') {
    return <AccessDeniedMessage />;
  }
  
  if (isPageLoading || !settings) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const onSettingsSubmit = async (data: SettingsFormData) => {
    const updatedSettingsData: Partial<Omit<BlogGenerationSettings, 'id'>> = {
      generationIntervalHours: data.generationIntervalHours,
      topics: data.topics.split(',').map(t => t.trim()).filter(t => t),
      style: data.style,
    };
    
    const updatedSettings = await updateBlogGenerationSettings(updatedSettingsData);
    if (updatedSettings) {
      setSettings(updatedSettings);
      toast({ title: t("blogSettingsAdmin.toast.settingsSaved.title", { default: "Settings Saved" }), description: t("blogSettingsAdmin.toast.settingsSaved.description", { default: "Blog automation settings have been updated." }) });
    } else {
      toast({ title: "Error", description: "Failed to save settings.", variant: "destructive" });
    }
  };

  const handleManualGenerate = async () => {
    if (!manualTopic.trim()) {
      toast({ title: t("blogSettingsAdmin.toast.noTopicSelected.title", { default: "No Topic Selected" }), description: t("blogSettingsAdmin.toast.noTopicSelected.description", { default: "Please select or enter a topic to generate a blog post." }), variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      const input: GenerateAiBlogPostInput = {
        topic: manualTopic,
        style: settings.style || 'informative',
      };
      const blogOutput = await generateAiBlogPost(input);
      
      const newPostData: Omit<BlogPost, 'id' | 'comments' | 'bookmarkedBy'> = {
        tenantId: 'platform',
        userId: currentUser.id,
        userName: 'JobMatch AI Writer',
        userAvatar: currentUser.profilePictureUrl ?? '',
        title: blogOutput.title,
        slug: generateSlug(blogOutput.title),
        author: 'JobMatch AI Writer',
        date: new Date().toISOString(),
        content: blogOutput.content,
        excerpt: blogOutput.excerpt,
        tags: blogOutput.suggestedTags,
        imageUrl: "https://placehold.co/800x400.png",
      };
      
      const createdPost = await createBlogPost(newPostData);

      if (createdPost) {
        const updatedSettings = await updateBlogGenerationSettings({ lastGenerated: new Date().toISOString() });
        if(updatedSettings) setSettings(updatedSettings);

        toast({ 
          title: t("blogSettingsAdmin.toast.postGenerated.title", { default: "Post Generated!" }), 
          description: t("blogSettingsAdmin.toast.postGenerated.description", { default: "New blog post '{title}' created successfully.", title: blogOutput.title }),
          duration: 7000,
        });
      } else {
        throw new Error("Failed to save the generated post to the database.");
      }

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
        toast({ title: t("blogSettingsAdmin.toast.generationFailed.title", { default: "Generation Failed" }), description: t("blogSettingsAdmin.toast.generationFailed.description", { default: "Could not generate the blog post. Please try again." }), variant: "destructive" });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
        <Settings className="h-8 w-8" /> {t("blogSettingsAdmin.title", { default: "AI Blog Settings" })}
      </h1>
      <CardDescription>{t("blogSettingsAdmin.description", { default: "Configure automated blog post generation and manually create posts with AI." })}</CardDescription>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>{t("blogSettingsAdmin.automationSettingsTitle", { default: "Automation Settings" })}</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit(onSettingsSubmit)}>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="generationIntervalHours">{t("blogSettingsAdmin.generationIntervalLabel", { default: "Generation Interval (Hours)" })}</Label>
              <Controller 
                name="generationIntervalHours" 
                control={control} 
                render={({ field }) => <Input id="generationIntervalHours" type="number" {...field} />} 
              />
              {errors.generationIntervalHours && <p className="text-sm text-destructive mt-1">{errors.generationIntervalHours.message}</p>}
              <p className="text-xs text-muted-foreground mt-1">{t("blogSettingsAdmin.generationIntervalHelp", { default: "The time in hours between automatically generated blog posts (e.g., 24 for daily)." })}</p>
            </div>
            <div>
              <Label htmlFor="topics">{t("blogSettingsAdmin.topicsLabel", { default: "Topics for Automation" })}</Label>
              <Controller 
                name="topics" 
                control={control} 
                render={({ field }) => <Textarea id="topics" {...field} rows={3} placeholder={t("blogSettingsAdmin.topicsPlaceholder", { default: "Career Advice, Interview Tips, Networking..." })} />} 
              />
              {errors.topics && <p className="text-sm text-destructive mt-1">{errors.topics.message}</p>}
               <p className="text-xs text-muted-foreground mt-1">{t("blogSettingsAdmin.topicsHelp", { default: "Comma-separated list of topics the AI will choose from for automated posts." })}</p>
            </div>
            <div>
              <Label htmlFor="style">{t("blogSettingsAdmin.styleLabel", { default: "Writing Style" })}</Label>
              <Controller 
                name="style" 
                control={control} 
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger id="style"><SelectValue placeholder={t("blogSettingsAdmin.stylePlaceholder", { default: "Choose a writing style..." })} /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="informative">{t("blogSettingsAdmin.styleInformative", { default: "Informative" })}</SelectItem>
                      <SelectItem value="casual">{t("blogSettingsAdmin.styleCasual", { default: "Casual" })}</SelectItem>
                      <SelectItem value="formal">{t("blogSettingsAdmin.styleFormal", { default: "Formal" })}</SelectItem>
                      <SelectItem value="technical">{t("blogSettingsAdmin.styleTechnical", { default: "Technical" })}</SelectItem>
                      <SelectItem value="storytelling">{t("blogSettingsAdmin.styleStorytelling", { default: "Storytelling" })}</SelectItem>
                    </SelectContent>
                  </Select>
                )} 
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground">
              {t("blogSettingsAdmin.saveAutomationButton", { default: "Save Automation Settings" })}
            </Button>
          </CardFooter>
        </form>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>{t("blogSettingsAdmin.manualGenerationTitle", { default: "Manual Generation" })}</CardTitle>
          <CardDescription>
            {t("blogSettingsAdmin.lastGeneratedPrefix", { default: "Last generated:" })} {settings.lastGenerated ? formatDistanceToNow(new Date(settings.lastGenerated), { addSuffix: true }) : t("blogSettingsAdmin.lastGeneratedNever", { default: "Never" })}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
           <div>
            <Label htmlFor="manual-topic">{t("blogSettingsAdmin.selectTopicManualLabel", { default: "Select Topic or Enter Custom" })}</Label>
             <Select value={manualTopic} onValueChange={setManualTopic}>
                <SelectTrigger id="manual-topic">
                  <SelectValue placeholder={t("blogSettingsAdmin.selectTopicManualPlaceholder", { default: "Select a pre-defined topic" })} />
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
                placeholder={t("blogSettingsAdmin.customTopicPlaceholder", { default: "Or enter a custom topic..." })}
                className="mt-2"
              />
           </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleManualGenerate} disabled={isLoading} className="w-full md:w-auto">
            {isLoading ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t("blogSettingsAdmin.generatingButton", { default: "Generating..." })}</>
            ) : (
              <><Sparkles className="mr-2 h-4 w-4" /> {t("blogSettingsAdmin.generateNowButton", { default: "Generate Now" })}</>
            )}
          </Button>
        </CardFooter>
      </Card>

      <Card className="shadow-md bg-secondary/50 border-primary/20">
        <CardHeader className="flex flex-row items-center gap-3">
           <Info className="h-6 w-6 text-primary" />
          <CardTitle className="text-lg">{t("blogSettingsAdmin.importantNoteTitle", { default: "Important Note on AI Usage" })}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {t("blogSettingsAdmin.importantNoteContent", { default: "Manual and automated blog post generation both consume AI API credits. Ensure your API key has sufficient quota. Automated generation will pause if it encounters an API error." })}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
