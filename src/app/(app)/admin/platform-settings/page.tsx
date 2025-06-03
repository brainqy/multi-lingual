
"use client";
import { useI18n } from "@/hooks/use-i18n";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings, Server, Users, Briefcase, Zap, Handshake, Gift, Target, MessageSquare, ListChecks, Palette, Columns, HelpCircle, Coins, Settings2, UploadCloud, SunMoon, UserCheck, Clock as ClockIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { PlatformSettings, ProfileVisibility } from "@/types";
import { samplePlatformSettings, sampleUserProfile } from "@/lib/sample-data";
import Link from "next/link";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Textarea } from "@/components/ui/textarea"; 
import AccessDeniedMessage from "@/components/ui/AccessDeniedMessage";

const settingsSchema = z.object({
  platformName: z.string().min(3, "Platform name must be at least 3 characters"),
  maintenanceMode: z.boolean(),
  communityFeedEnabled: z.boolean(),
  autoModeratePosts: z.boolean(),
  jobBoardEnabled: z.boolean(),
  maxJobPostingDays: z.coerce.number().min(1).max(365),
  gamificationEnabled: z.boolean(),
  xpForLogin: z.coerce.number().min(0),
  xpForNewPost: z.coerce.number().min(0),
  resumeAnalyzerEnabled: z.boolean(),
  aiResumeWriterEnabled: z.boolean(),
  coverLetterGeneratorEnabled: z.boolean(),
  mockInterviewEnabled: z.boolean(),
  referralsEnabled: z.boolean(),
  affiliateProgramEnabled: z.boolean(),
  alumniConnectEnabled: z.boolean(),
  defaultAppointmentCost: z.coerce.number().min(0),
  featureRequestsEnabled: z.boolean(),
  allowTenantCustomBranding: z.boolean(),
  allowTenantEmailCustomization: z.boolean(),
  defaultProfileVisibility: z.enum(['public', 'alumni_only', 'private']),
  maxResumeUploadsPerUser: z.coerce.number().min(1).max(50).default(5),
  defaultTheme: z.enum(['light', 'dark']).default('light'),
  enablePublicProfilePages: z.boolean().default(false),
  sessionTimeoutMinutes: z.coerce.number().min(5).max(1440).default(60), 
  maxEventRegistrationsPerUser: z.coerce.number().min(1).max(100).optional(),
  globalAnnouncement: z.string().max(500).optional(),
  pointsForAffiliateSignup: z.coerce.number().min(0).optional(),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

export default function PlatformSettingsPage() {
  const [currentSettings, setCurrentSettings] = useState<PlatformSettings>(samplePlatformSettings);
  const { toast } = useToast();
  const currentUser = sampleUserProfile;

  const { control, handleSubmit, reset, formState: { errors, isDirty } } = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: currentSettings,
  });

  useEffect(() => {
    reset(currentSettings);
  }, [currentSettings, reset]);

  if (currentUser.role !== 'admin') {
    return <AccessDeniedMessage />;
  }

  const onSubmit = (data: SettingsFormData) => {
    const updatedSettings: PlatformSettings = { ...currentSettings, ...data };
    Object.assign(samplePlatformSettings, updatedSettings); 
    setCurrentSettings(updatedSettings);
    toast({ title: "Settings Saved", description: "Platform settings have been updated successfully." });
    reset(updatedSettings); 
  };

  const renderSettingRow = (id: keyof SettingsFormData, label: string, controlElement: React.ReactNode, description?: string, error?: string) => (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border rounded-md hover:bg-secondary/20 transition-colors">
      <div className="mb-2 sm:mb-0">
        <Label htmlFor={id} className="text-sm font-medium">{label}</Label>
        {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
      </div>
      <div className="sm:w-1/2 md:w-1/3">
       {controlElement}
       {error && <p className="text-xs text-destructive mt-1">{error}</p>}
      </div>
    </div>
  );

  return (
    <TooltipProvider>
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
        <Server className="h-8 w-8" /> Platform Settings
      </h1>
      <CardDescription>Configure global settings and default behaviors for the ResumeMatch AI platform.</CardDescription>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Settings2 className="h-5 w-5 text-primary"/>General Platform</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {renderSettingRow("platformName", "Platform Name", <Controller name="platformName" control={control} render={({ field }) => <Input {...field} />} />, "The public name of your platform.", errors.platformName?.message)}
            {renderSettingRow("maintenanceMode", "Maintenance Mode", <Controller name="maintenanceMode" control={control} render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange} />} />, "Temporarily disable access for users while performing updates.")}
            {renderSettingRow("defaultProfileVisibility", "Default New User Profile Visibility", 
              <Controller name="defaultProfileVisibility" control={control} render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="alumni_only">Alumni Only</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                  </SelectContent>
                </Select>
              )} />, "Set the default visibility for new user profiles."
            )}
            {renderSettingRow("maxResumeUploadsPerUser", "Max Resumes per User", <Controller name="maxResumeUploadsPerUser" control={control} render={({ field }) => <Input type="number" {...field} />} />, "Max number of resume profiles a user can create.", errors.maxResumeUploadsPerUser?.message)}
            {renderSettingRow("defaultTheme", "Default Theme", <Controller name="defaultTheme" control={control} render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="light">Light</SelectItem><SelectItem value="dark">Dark</SelectItem></SelectContent>
                </Select>
            )} />, "Set the default theme for new users.")}
            {renderSettingRow("enablePublicProfilePages", "Enable Public Profile Pages", <Controller name="enablePublicProfilePages" control={control} render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange} />} />, "Allow users to have publicly accessible profile URLs.")}
            {renderSettingRow("sessionTimeoutMinutes", "Session Timeout (Minutes)", <Controller name="sessionTimeoutMinutes" control={control} render={({ field }) => <Input type="number" {...field} />} />, "Duration of inactivity before users are logged out.", errors.sessionTimeoutMinutes?.message)}
             {renderSettingRow("globalAnnouncement", "Global Announcement", <Controller name="globalAnnouncement" control={control} render={({ field }) => <Textarea {...field} placeholder="Enter a brief announcement for all users" />} />, "Display a banner or message across the platform.", errors.globalAnnouncement?.message)}
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><MessageSquare className="h-5 w-5 text-primary"/>Community Features</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {renderSettingRow("communityFeedEnabled", "Enable Community Feed", <Controller name="communityFeedEnabled" control={control} render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange} />} />)}
            {renderSettingRow("autoModeratePosts", "Auto-Moderate New Posts (Mock)", <Controller name="autoModeratePosts" control={control} render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange} />} />, "If enabled, new posts might be hidden pending review based on content filters.")}
          </CardContent>
        </Card>
        
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Briefcase className="h-5 w-5 text-primary"/>Job & Career Tools</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {renderSettingRow("jobBoardEnabled", "Enable Job Board", <Controller name="jobBoardEnabled" control={control} render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange} />} />)}
            {renderSettingRow("maxJobPostingDays", "Max Job Posting Duration (Days)", <Controller name="maxJobPostingDays" control={control} render={({ field }) => <Input type="number" {...field} />} />, "Default number of days a job posting stays active.", errors.maxJobPostingDays?.message)}
            {renderSettingRow("resumeAnalyzerEnabled", "Enable Resume Analyzer", <Controller name="resumeAnalyzerEnabled" control={control} render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange} />} />)}
            {renderSettingRow("aiResumeWriterEnabled", "Enable AI Resume Writer", <Controller name="aiResumeWriterEnabled" control={control} render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange} />} />)}
            {renderSettingRow("coverLetterGeneratorEnabled", "Enable Cover Letter Generator", <Controller name="coverLetterGeneratorEnabled" control={control} render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange} />} />)}
            {renderSettingRow("mockInterviewEnabled", "Enable AI Mock Interviews", <Controller name="mockInterviewEnabled" control={control} render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange} />} />)}
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><ListChecks className="h-5 w-5 text-primary"/>Engagement Features</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {renderSettingRow("gamificationEnabled", "Enable Gamification (XP, Badges)", <Controller name="gamificationEnabled" control={control} render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange} />} />)}
            {renderSettingRow("xpForLogin", "XP Awarded for Daily Login", <Controller name="xpForLogin" control={control} render={({ field }) => <Input type="number" {...field} />} />, "Points for daily platform login.", errors.xpForLogin?.message)}
            {renderSettingRow("xpForNewPost", "XP Awarded for New Community Post", <Controller name="xpForNewPost" control={control} render={({ field }) => <Input type="number" {...field} />} />, "Points for creating a new post in community feed.", errors.xpForNewPost?.message)}
            {renderSettingRow("referralsEnabled", "Enable Referral Program", <Controller name="referralsEnabled" control={control} render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange} />} />)}
            {renderSettingRow("affiliateProgramEnabled", "Enable Affiliate Program", <Controller name="affiliateProgramEnabled" control={control} render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange} />} />)}
            {renderSettingRow("pointsForAffiliateSignup", "Points for Affiliate Signup", <Controller name="pointsForAffiliateSignup" control={control} render={({ field }) => <Input type="number" min="0" {...field} />} />, "XP or Coins awarded to referrer on successful signup.", errors.pointsForAffiliateSignup?.message)}
            {renderSettingRow("featureRequestsEnabled", "Enable Feature Request Submissions", <Controller name="featureRequestsEnabled" control={control} render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange} />} />)}
          </CardContent>
        </Card>
        
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Handshake className="h-5 w-5 text-primary"/>Alumni Connect</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
             {renderSettingRow("alumniConnectEnabled", "Enable Alumni Connect Directory", <Controller name="alumniConnectEnabled" control={control} render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange} />} />)}
             {renderSettingRow("defaultAppointmentCost", "Default Appointment Cost (Coins)", 
                <Controller name="defaultAppointmentCost" control={control} render={({ field }) => <Input type="number" min="0" {...field} />} />, 
                "Default coin cost for booking an appointment with alumni.", errors.defaultAppointmentCost?.message)}
             {renderSettingRow("maxEventRegistrationsPerUser", "Max Event Registrations per User", <Controller name="maxEventRegistrationsPerUser" control={control} render={({ field }) => <Input type="number" min="1" {...field} />} />, "Limit how many events a user can register for (optional).", errors.maxEventRegistrationsPerUser?.message)}
          </CardContent>
        </Card>

        <Card className="shadow-lg">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Palette className="h-5 w-5 text-primary"/>Tenant Customization Allowances</CardTitle>
                <CardDescription>Control whether individual tenants can customize certain aspects.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
                {renderSettingRow("allowTenantCustomBranding", "Allow Tenant Custom Branding", 
                    <Controller name="allowTenantCustomBranding" control={control} render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange} />} />, 
                    "Permit tenant admins to set custom logos and theme colors."
                )}
                {renderSettingRow("allowTenantEmailCustomization", "Allow Tenant Email Customization (Mock)", 
                    <Controller name="allowTenantEmailCustomization" control={control} render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange} />} />, 
                    "Permit tenant admins to customize automated email templates."
                )}
            </CardContent>
        </Card>


        <div className="pt-6 text-right">
          <Button type="submit" size="lg" disabled={!isDirty} className="bg-primary hover:bg-primary/90 text-primary-foreground">
            Save All Platform Settings
          </Button>
        </div>
      </form>
    </div>
    </TooltipProvider>
  );
}
