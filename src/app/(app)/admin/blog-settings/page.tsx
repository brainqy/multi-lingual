
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

const settingsSchema = z.object({
  generationIntervalHours: z.coerce.number().min(1, "Interval must be at least 1 hour").max(720, "Interval too long (max 30 days)"),
  topics: z.string().min(1, "At least one topic is required"),
  style: z.enum(['informative', 'casual', 'formal', 'technical', 'storytelling']).optional(),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

const generateSlug = (title: string) => title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');

export default function AdminBlogSettingsPage() {
  const [settings, setSettings] = useState<BlogGenerationSettings>(sampleBlogGenerationSettings);
  const [isLoading, setIsLoading] = useState(false);
  const [manualTopic, setManualTopic] = useState(settings.topics[0] || "");
  const { toast } = useToast();
  const currentUser = sampleUserProfile;

  const { control, handleSubmit, reset, formState: { errors } } = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
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
    toast({ title: "Settings Saved", description: "AI blog generation settings have been updated." });
  };

  const handleManualGenerate = async () => {
    if (!manualTopic.trim()) {
      toast({ title: "No Topic Selected", description: "Please select or enter a topic to generate a blog post.", variant: "destructive" });
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
        title: "AI Blog Post Generated!", 
        description: `Post titled "${blogOutput.title}" has been created. You can view it on the blog page.`,
        duration: 7000,
      });

    } catch (error) {
      console.error("AI Blog generation error:", error);
      toast({ title: "Generation Failed", description: "An error occurred while generating the blog post.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
        <Settings className="h-8 w-8" /> AI Blog Generation Settings
      </h1>
      <CardDescription>Configure automated blog post generation and manually trigger posts.</CardDescription>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Automation Settings</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit(onSettingsSubmit)}>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="generationIntervalHours">Generation Interval (Hours)</Label>
              <Controller 
                name="generationIntervalHours" 
                control={control} 
                render={({ field }) => <Input id="generationIntervalHours" type="number" {...field} />} 
              />
              {errors.generationIntervalHours && <p className="text-sm text-destructive mt-1">{errors.generationIntervalHours.message}</p>}
              <p className="text-xs text-muted-foreground mt-1">How often should a new blog post be generated? (e.g., 24 for daily)</p>
            </div>
            <div>
              <Label htmlFor="topics">Topics (Comma-separated)</Label>
              <Controller 
                name="topics" 
                control={control} 
                render={({ field }) => <Textarea id="topics" {...field} rows={3} placeholder="e.g., Resume Tips, Interview Skills, Career Growth" />} 
              />
              {errors.topics && <p className="text-sm text-destructive mt-1">{errors.topics.message}</p>}
               <p className="text-xs text-muted-foreground mt-1">AI will pick from these topics for scheduled posts.</p>
            </div>
            <div>
              <Label htmlFor="style">Writing Style (Optional)</Label>
              <Controller 
                name="style" 
                control={control} 
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger id="style"><SelectValue placeholder="Select style (default: Informative)" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="informative">Informative</SelectItem>
                      <SelectItem value="casual">Casual</SelectItem>
                      <SelectItem value="formal">Formal</SelectItem>
                      <SelectItem value="technical">Technical</SelectItem>
                      <SelectItem value="storytelling">Storytelling</SelectItem>
                    </SelectContent>
                  </Select>
                )} 
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground">
              Save Automation Settings
            </Button>
          </CardFooter>
        </form>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Manual Blog Post Generation</CardTitle>
          <CardDescription>
            Last AI post generated: {settings.lastGenerated ? formatDistanceToNow(new Date(settings.lastGenerated), { addSuffix: true }) : 'Never'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
           <div>
            <Label htmlFor="manual-topic">Select Topic for Manual Generation</Label>
             <Select value={manualTopic} onValueChange={setManualTopic}>
                <SelectTrigger id="manual-topic">
                  <SelectValue placeholder="Select a topic or enter custom" />
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
                placeholder="Or type a custom topic here"
                className="mt-2"
              />
           </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleManualGenerate} disabled={isLoading} className="w-full md:w-auto">
            {isLoading ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</>
            ) : (
              <><Sparkles className="mr-2 h-4 w-4" /> Generate Blog Post Now</>
            )}
          </Button>
        </CardFooter>
      </Card>

      <Card className="shadow-md bg-secondary/50 border-primary/20">
        <CardHeader className="flex flex-row items-center gap-3">
           <Info className="h-6 w-6 text-primary" />
          <CardTitle className="text-lg">Important Note on Automation</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Actual automated scheduling of blog posts (e.g., every X hours) requires a background task runner or cron job on a server.
            This UI configures the parameters for such a system. The "Generate Now" button allows manual triggering for testing and content creation.
          </p>
        </CardContent>
      </Card>

    </div>
  );
}
