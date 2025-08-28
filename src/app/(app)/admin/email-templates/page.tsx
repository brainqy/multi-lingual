"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Mail, Save, Loader2, Info, Pilcrow } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { EmailTemplate } from "@/types";
import { useForm, Controller, useFormState } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/hooks/use-auth";
import AccessDeniedMessage from "@/components/ui/AccessDeniedMessage";
import { getTenantEmailTemplates, updateEmailTemplate } from "@/lib/actions/email-templates";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";

const templateSchema = z.object({
  id: z.string(),
  subject: z.string().min(5, "Subject must be at least 5 characters long."),
  body: z.string().min(20, "Body must be at least 20 characters long."),
});

type TemplateFormData = z.infer<typeof templateSchema>;

export default function EmailTemplatesPage() {
  const { user: currentUser } = useAuth();
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTemplateId, setActiveTemplateId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  
  const { control, handleSubmit, reset, getValues, formState: { isDirty } } = useForm<TemplateFormData>({
    resolver: zodResolver(templateSchema),
  });

  const fetchData = useCallback(async () => {
    if (!currentUser || !currentUser.tenantId) return;
    setIsLoading(true);
    const fetchedTemplates = await getTenantEmailTemplates(currentUser.tenantId);
    setTemplates(fetchedTemplates);
    if (fetchedTemplates.length > 0 && !activeTemplateId) {
      setActiveTemplateId(fetchedTemplates[0].id);
      reset(fetchedTemplates[0]);
    }
    setIsLoading(false);
  }, [currentUser, activeTemplateId, reset]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleTabChange = (templateId: string) => {
    if (isDirty) {
      if (!confirm("You have unsaved changes. Are you sure you want to switch templates? Your changes will be lost.")) {
        return;
      }
    }
    setActiveTemplateId(templateId);
    const template = templates.find(t => t.id === templateId);
    if (template) {
      reset(template);
    }
  };

  const onSubmit = async (data: TemplateFormData) => {
    setIsSaving(true);
    const updatedTemplate = await updateEmailTemplate(data.id, { subject: data.subject, body: data.body });
    if (updatedTemplate) {
      setTemplates(prev => prev.map(t => t.id === data.id ? updatedTemplate : t));
      reset(updatedTemplate); // Reset form to new state to clear isDirty flag
      toast({ title: "Template Saved", description: `The "${updatedTemplate.type}" template has been updated.` });
    } else {
      toast({ title: "Error", description: "Failed to save the template.", variant: "destructive" });
    }
    setIsSaving(false);
  };
  
  const placeholders = [
    { value: "{{userName}}", description: "The recipient's full name." },
    { value: "{{tenantName}}", description: "The name of your organization/tenant." },
    { value: "{{resetLink}}", description: "URL for password reset (Password Reset only)." },
    { value: "{{appointmentTitle}}", description: "Title of the appointment (Appointment only)." },
    { value: "{{partnerName}}", description: "Name of the other person in the appointment." },
    { value: "{{appointmentDateTime}}", description: "Formatted date and time of the appointment." },
    { value: "{{appointmentLink}}", description: "Link to view the appointment details." },
  ];

  if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'manager')) {
    return <AccessDeniedMessage />;
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
        <Mail className="h-8 w-8" /> Email Template Management
      </h1>
      <CardDescription>
        Customize the automated emails sent to users in your tenant. Use placeholders to include dynamic content.
      </CardDescription>
      
      {isLoading ? (
        <Card className="shadow-lg">
          <CardHeader><Skeleton className="h-8 w-1/3"/></CardHeader>
          <CardContent><Skeleton className="h-64 w-full"/></CardContent>
        </Card>
      ) : (
      <Tabs value={activeTemplateId || ""} onValueChange={handleTabChange} orientation="vertical" className="h-full">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="col-span-1">
            <TabsList className="flex flex-col h-auto w-full p-2 bg-card border rounded-lg">
              {templates.map(template => (
                <TabsTrigger
                  key={template.id}
                  value={template.id}
                  className="w-full justify-start data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-sm"
                >
                  {template.type.replace(/_/g, ' ')}
                </TabsTrigger>
              ))}
            </TabsList>
            <Card className="mt-4">
                <CardHeader className="p-3"><CardTitle className="text-sm flex items-center gap-1"><Pilcrow className="h-4 w-4"/>Placeholders</CardTitle></CardHeader>
                <CardContent className="p-3 pt-0">
                    <ScrollArea className="h-48">
                      <ul className="text-xs space-y-1">
                        {placeholders.map(p => <li key={p.value}><code className="font-mono bg-muted p-0.5 rounded">{p.value}</code> - <span className="text-muted-foreground">{p.description}</span></li>)}
                      </ul>
                    </ScrollArea>
                </CardContent>
            </Card>
          </div>
          <div className="col-span-3">
            {templates.map(template => (
              <TabsContent key={template.id} value={template.id} className="mt-0">
                <Card className="shadow-lg">
                  <form onSubmit={handleSubmit(onSubmit)}>
                  <CardHeader>
                    <CardTitle>Editing: {template.type.replace(/_/g, ' ')}</CardTitle>
                    <CardDescription>Modify the subject and body of this email.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Controller name="id" control={control} render={({ field }) => <input type="hidden" {...field} />} />
                    <div>
                      <Label htmlFor="subject">Email Subject</Label>
                      <Controller
                        name="subject"
                        control={control}
                        render={({ field }) => <Input id="subject" {...field} />}
                      />
                      {errors.subject && <p className="text-sm text-destructive mt-1">{errors.subject.message}</p>}
                    </div>
                    <div>
                      <Label htmlFor="body">Email Body</Label>
                      <Controller
                        name="body"
                        control={control}
                        render={({ field }) => <Textarea id="body" {...field} rows={15} />}
                      />
                      {errors.body && <p className="text-sm text-destructive mt-1">{errors.body.message}</p>}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button type="submit" disabled={isSaving || !isDirty}>
                      {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </Button>
                  </CardFooter>
                  </form>
                </Card>
              </TabsContent>
            ))}
          </div>
        </div>
      </Tabs>
      )}
    </div>
  );
}