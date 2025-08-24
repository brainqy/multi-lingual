

"use client";
import { useI18n } from "@/hooks/use-i18n";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings, Server, Users, Briefcase, Zap, Handshake, Gift, Target, MessageSquare, ListChecks, Palette, Columns, HelpCircle, Coins, Settings2, UploadCloud, SunMoon, UserCheck, Clock as ClockIcon, Code2, Loader2, Mic } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { PlatformSettings, ProfileVisibility } from "@/types";
import Link from "next/link";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Textarea } from "@/components/ui/textarea"; 
import AccessDeniedMessage from "@/components/ui/AccessDeniedMessage";
import { useAuth } from "@/hooks/use-auth";
import { getPlatformSettings, updatePlatformSettings } from "@/lib/actions/platform-settings";
import { Skeleton } from "@/components/ui/skeleton";

const settingsSchema = z.object({
  platformName: z.string().min(3, "platformSettings.validation.platformNameMin"),
  maintenanceMode: z.boolean(),
  communityFeedEnabled: z.boolean(),
  autoModeratePosts: z.boolean(),
  jobBoardEnabled: z.boolean(),
  maxJobPostingDays: z.coerce.number().min(1, "platformSettings.validation.maxJobPostingDaysMin").max(365, "platformSettings.validation.maxJobPostingDaysMax"),
  gamificationEnabled: z.boolean(),
  xpForLogin: z.coerce.number().min(0, "platformSettings.validation.xpMin"),
  xpForNewPost: z.coerce.number().min(0, "platformSettings.validation.xpMin"),
  resumeAnalyzerEnabled: z.boolean(),
  aiResumeWriterEnabled: z.boolean(),
  coverLetterGeneratorEnabled: z.boolean(),
  mockInterviewEnabled: z.boolean(),
  aiMockInterviewCost: z.coerce.number().min(0, "platformSettings.validation.aiMockInterviewCostMin"),
  referralsEnabled: z.boolean(),
  affiliateProgramEnabled: z.boolean(),
  alumniConnectEnabled: z.boolean(),
  defaultAppointmentCost: z.coerce.number().min(0, "platformSettings.validation.appointmentCostMin"),
  featureRequestsEnabled: z.boolean(),
  allowTenantCustomBranding: z.boolean(),
  allowTenantEmailCustomization: z.boolean(),
  allowUserApiKey: z.boolean().optional(),
  defaultProfileVisibility: z.enum(['public', 'alumni_only', 'private']),
  maxResumeUploadsPerUser: z.coerce.number().min(1, "platformSettings.validation.maxResumesMin").max(50, "platformSettings.validation.maxResumesMax").default(5),
  defaultTheme: z.enum(['light', 'dark']).default('light'),
  enablePublicProfilePages: z.boolean().default(false),
  sessionTimeoutMinutes: z.coerce.number().min(5, "platformSettings.validation.sessionTimeoutMin").max(1440, "platformSettings.validation.sessionTimeoutMax").default(60), 
  maxEventRegistrationsPerUser: z.coerce.number().min(1, "platformSettings.validation.maxEventRegistrationsMin").max(100, "platformSettings.validation.maxEventRegistrationsMax").optional(),
  globalAnnouncement: z.string().max(500, "platformSettings.validation.globalAnnouncementMax").optional(),
  pointsForAffiliateSignup: z.coerce.number().min(0, "platformSettings.validation.pointsForAffiliateMin").optional(),
  walletEnabled: z.boolean().optional().default(true),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

export default function PlatformSettingsPage() {
  const [currentSettings, setCurrentSettings] = useState<PlatformSettings | null>(null);
  const { toast } = useToast();
  const { user: currentUser, isLoading: isUserLoading } = useAuth();
  const { t } = useI18n();

  const translatedSchema = z.object({
    platformName: z.string().min(3, t("platformSettings.validation.platformNameMin")),
    maintenanceMode: z.boolean(),
    communityFeedEnabled: z.boolean(),
    autoModeratePosts: z.boolean(),
    jobBoardEnabled: z.boolean(),
    maxJobPostingDays: z.coerce.number().min(1, t("platformSettings.validation.maxJobPostingDaysMin")).max(365, t("platformSettings.validation.maxJobPostingDaysMax")),
    gamificationEnabled: z.boolean(),
    xpForLogin: z.coerce.number().min(0, t("platformSettings.validation.xpMin")),
    xpForNewPost: z.coerce.number().min(0, t("platformSettings.validation.xpMin")),
    resumeAnalyzerEnabled: z.boolean(),
    aiResumeWriterEnabled: z.boolean(),
    coverLetterGeneratorEnabled: z.boolean(),
    mockInterviewEnabled: z.boolean(),
    aiMockInterviewCost: z.coerce.number().min(0, t("platformSettings.validation.aiMockInterviewCostMin")),
    referralsEnabled: z.boolean(),
    affiliateProgramEnabled: z.boolean(),
    alumniConnectEnabled: z.boolean(),
    defaultAppointmentCost: z.coerce.number().min(0, t("platformSettings.validation.appointmentCostMin")),
    featureRequestsEnabled: z.boolean(),
    allowTenantCustomBranding: z.boolean(),
    allowTenantEmailCustomization: z.boolean(),
    allowUserApiKey: z.boolean().optional(),
    defaultProfileVisibility: z.enum(['public', 'alumni_only', 'private']),
    maxResumeUploadsPerUser: z.coerce.number().min(1, t("platformSettings.validation.maxResumesMin")).max(50, t("platformSettings.validation.maxResumesMax")).default(5),
    defaultTheme: z.enum(['light', 'dark']).default('light'),
    enablePublicProfilePages: z.boolean().default(false),
    sessionTimeoutMinutes: z.coerce.number().min(5, t("platformSettings.validation.sessionTimeoutMin")).max(1440, t("platformSettings.validation.sessionTimeoutMax")).default(60), 
    maxEventRegistrationsPerUser: z.coerce.number().min(1, t("platformSettings.validation.maxEventRegistrationsMin")).max(100, t("platformSettings.validation.maxEventRegistrationsMax")).optional(),
    globalAnnouncement: z.string().max(500, t("platformSettings.validation.globalAnnouncementMax")).optional(),
    pointsForAffiliateSignup: z.coerce.number().min(0, t("platformSettings.validation.pointsForAffiliateMin")).optional(),
    walletEnabled: z.boolean().optional().default(true),
  });
  
  const { control, handleSubmit, reset, formState: { errors, isDirty } } = useForm<SettingsFormData>({
    resolver: zodResolver(translatedSchema),
  });

  useEffect(() => {
    async function loadSettings() {
        const settings = await getPlatformSettings();
        setCurrentSettings(settings);
        reset(settings);
    }
    loadSettings();
  }, [reset]);


  if (isUserLoading || !currentUser) {
    return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin"/></div>;
  }

  if (currentUser.role !== 'admin') {
    return <AccessDeniedMessage />;
  }
  
  if (!currentSettings) {
      return (
        <div className="space-y-4">
          <Skeleton className="h-10 w-1/4" />
          <Skeleton className="h-96 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      );
  }

  const onSubmit = async (data: SettingsFormData) => {
    const updatedSettings = await updatePlatformSettings(data);
    if (updatedSettings) {
      setCurrentSettings(updatedSettings);
      reset(updatedSettings); 
      toast({ title: t("platformSettings.toast.settingsSaved.title"), description: t("platformSettings.toast.settingsSaved.description") });
    } else {
        toast({ title: "Error", description: "Failed to save platform settings.", variant: "destructive"});
    }
  };

  const renderSettingRow = (id: keyof SettingsFormData, labelKey: string, controlElement: React.ReactNode, descriptionKey?: string, error?: string) => (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border rounded-md hover:bg-secondary/20 transition-colors">
      <div className="mb-2 sm:mb-0">
        <Label htmlFor={id} className="text-sm font-medium">{t(labelKey)}</Label>
        {descriptionKey && <p className="text-xs text-muted-foreground mt-0.5">{t(descriptionKey)}</p>}
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
        <Server className="h-8 w-8" /> {t("platformSettings.title")}
      </h1>
      <CardDescription>{t("platformSettings.description")}</CardDescription>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Settings2 className="h-5 w-5 text-primary"/>{t("platformSettings.general.sectionTitle")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {renderSettingRow("platformName", "platformSettings.general.platformName.label", <Controller name="platformName" control={control} render={({ field }) => <Input {...field} />} />, "platformSettings.general.platformName.description", errors.platformName?.message)}
            {renderSettingRow("maintenanceMode", "platformSettings.general.maintenanceMode.label", <Controller name="maintenanceMode" control={control} render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange} />} />, "platformSettings.general.maintenanceMode.description")}
            {renderSettingRow("defaultProfileVisibility", "platformSettings.general.defaultProfileVisibility.label", 
              <Controller name="defaultProfileVisibility" control={control} render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">{t("platformSettings.general.defaultProfileVisibility.options.public")}</SelectItem>
                    <SelectItem value="alumni_only">{t("platformSettings.general.defaultProfileVisibility.options.alumni_only")}</SelectItem>
                    <SelectItem value="private">{t("platformSettings.general.defaultProfileVisibility.options.private")}</SelectItem>
                  </SelectContent>
                </Select>
              )} />, "platformSettings.general.defaultProfileVisibility.description"
            )}
            {renderSettingRow("maxResumeUploadsPerUser", "platformSettings.general.maxResumesPerUser.label", <Controller name="maxResumeUploadsPerUser" control={control} render={({ field }) => <Input type="number" {...field} />} />, "platformSettings.general.maxResumesPerUser.description", errors.maxResumeUploadsPerUser?.message)}
            {renderSettingRow("defaultTheme", "platformSettings.general.defaultTheme.label", <Controller name="defaultTheme" control={control} render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="light">{t("platformSettings.general.defaultTheme.options.light")}</SelectItem>
                        <SelectItem value="dark">{t("platformSettings.general.defaultTheme.options.dark")}</SelectItem>
                    </SelectContent>
                </Select>
            )} />, "platformSettings.general.defaultTheme.description")}
            {renderSettingRow("enablePublicProfilePages", "platformSettings.general.enablePublicProfilePages.label", <Controller name="enablePublicProfilePages" control={control} render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange} />} />, "platformSettings.general.enablePublicProfilePages.description")}
            {renderSettingRow("sessionTimeoutMinutes", "platformSettings.general.sessionTimeoutMinutes.label", <Controller name="sessionTimeoutMinutes" control={control} render={({ field }) => <Input type="number" {...field} />} />, "platformSettings.general.sessionTimeoutMinutes.description", errors.sessionTimeoutMinutes?.message)}
             {renderSettingRow("globalAnnouncement", "platformSettings.general.globalAnnouncement.label", <Controller name="globalAnnouncement" control={control} render={({ field }) => <Textarea {...field} placeholder={t("platformSettings.general.globalAnnouncement.placeholder")} />} />, "platformSettings.general.globalAnnouncement.description", errors.globalAnnouncement?.message)}
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><MessageSquare className="h-5 w-5 text-primary"/>{t("platformSettings.community.sectionTitle")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {renderSettingRow("communityFeedEnabled", "platformSettings.community.communityFeedEnabled.label", <Controller name="communityFeedEnabled" control={control} render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange} />} />)}
            {renderSettingRow("autoModeratePosts", "platformSettings.community.autoModeratePosts.label", <Controller name="autoModeratePosts" control={control} render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange} />} />, "platformSettings.community.autoModeratePosts.description")}
          </CardContent>
        </Card>
        
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Briefcase className="h-5 w-5 text-primary"/>{t("platformSettings.career.sectionTitle")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {renderSettingRow("jobBoardEnabled", "platformSettings.career.jobBoardEnabled.label", <Controller name="jobBoardEnabled" control={control} render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange} />} />)}
            {renderSettingRow("maxJobPostingDays", "platformSettings.career.maxJobPostingDays.label", <Controller name="maxJobPostingDays" control={control} render={({ field }) => <Input type="number" {...field} />} />, "platformSettings.career.maxJobPostingDays.description", errors.maxJobPostingDays?.message)}
            {renderSettingRow("resumeAnalyzerEnabled", "platformSettings.career.resumeAnalyzerEnabled.label", <Controller name="resumeAnalyzerEnabled" control={control} render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange} />} />)}
            {renderSettingRow("aiResumeWriterEnabled", "platformSettings.career.aiResumeWriterEnabled.label", <Controller name="aiResumeWriterEnabled" control={control} render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange} />} />)}
            {renderSettingRow("coverLetterGeneratorEnabled", "platformSettings.career.coverLetterGeneratorEnabled.label", <Controller name="coverLetterGeneratorEnabled" control={control} render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange} />} />)}
            {renderSettingRow("mockInterviewEnabled", "platformSettings.career.mockInterviewEnabled.label", <Controller name="mockInterviewEnabled" control={control} render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange} />} />)}
            {renderSettingRow("aiMockInterviewCost", "platformSettings.career.aiMockInterviewCost.label", <Controller name="aiMockInterviewCost" control={control} render={({ field }) => <Input type="number" min="0" {...field} />} />, "platformSettings.career.aiMockInterviewCost.description", errors.aiMockInterviewCost?.message)}
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><ListChecks className="h-5 w-5 text-primary"/>{t("platformSettings.engagement.sectionTitle")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {renderSettingRow("gamificationEnabled", "platformSettings.engagement.gamificationEnabled.label", <Controller name="gamificationEnabled" control={control} render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange} />} />)}
            {renderSettingRow("xpForLogin", "platformSettings.engagement.xpForLogin.label", <Controller name="xpForLogin" control={control} render={({ field }) => <Input type="number" {...field} />} />, "platformSettings.engagement.xpForLogin.description", errors.xpForLogin?.message)}
            {renderSettingRow("xpForNewPost", "platformSettings.engagement.xpForNewPost.label", <Controller name="xpForNewPost" control={control} render={({ field }) => <Input type="number" {...field} />} />, "platformSettings.engagement.xpForNewPost.description", errors.xpForNewPost?.message)}
            {renderSettingRow("referralsEnabled", "platformSettings.engagement.referralsEnabled.label", <Controller name="referralsEnabled" control={control} render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange} />} />)}
            {renderSettingRow("affiliateProgramEnabled", "platformSettings.engagement.affiliateProgramEnabled.label", <Controller name="affiliateProgramEnabled" control={control} render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange} />} />)}
            {renderSettingRow("pointsForAffiliateSignup", "platformSettings.engagement.pointsForAffiliateSignup.label", <Controller name="pointsForAffiliateSignup" control={control} render={({ field }) => <Input type="number" min="0" {...field} />} />, "platformSettings.engagement.pointsForAffiliateSignup.description", errors.pointsForAffiliateSignup?.message)}
            {renderSettingRow("featureRequestsEnabled", "platformSettings.engagement.featureRequestsEnabled.label", <Controller name="featureRequestsEnabled" control={control} render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange} />} />)}
          </CardContent>
        </Card>
        
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Handshake className="h-5 w-5 text-primary"/>{t("platformSettings.alumniConnect.sectionTitle")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
             {renderSettingRow("alumniConnectEnabled", "platformSettings.alumniConnect.alumniConnectEnabled.label", <Controller name="alumniConnectEnabled" control={control} render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange} />} />)}
             {renderSettingRow("defaultAppointmentCost", "platformSettings.alumniConnect.defaultAppointmentCost.label", 
                <Controller name="defaultAppointmentCost" control={control} render={({ field }) => <Input type="number" min="0" {...field} />} />, 
                "platformSettings.alumniConnect.defaultAppointmentCost.description", errors.defaultAppointmentCost?.message)}
             {renderSettingRow("maxEventRegistrationsPerUser", "platformSettings.alumniConnect.maxEventRegistrationsPerUser.label", <Controller name="maxEventRegistrationsPerUser" control={control} render={({ field }) => <Input type="number" min="1" {...field} />} />, "platformSettings.alumniConnect.maxEventRegistrationsPerUser.description", errors.maxEventRegistrationsPerUser?.message)}
             {renderSettingRow("walletEnabled", "Digital Wallet System", <Controller name="walletEnabled" control={control} render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange} />} />, "Enable or disable the digital wallet (coins) feature for the platform.")}
          </CardContent>
        </Card>

        <Card className="shadow-lg">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Palette className="h-5 w-5 text-primary"/>{t("platformSettings.tenantCustomization.sectionTitle")}</CardTitle>
                <CardDescription>{t("platformSettings.tenantCustomization.description")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
                {renderSettingRow("allowTenantCustomBranding", "platformSettings.tenantCustomization.allowTenantCustomBranding.label", 
                    <Controller name="allowTenantCustomBranding" control={control} render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange} />} />, 
                    "platformSettings.tenantCustomization.allowTenantCustomBranding.description"
                )}
                {renderSettingRow("allowTenantEmailCustomization", "platformSettings.tenantCustomization.allowTenantEmailCustomization.label", 
                    <Controller name="allowTenantEmailCustomization" control={control} render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange} />} />, 
                    "platformSettings.tenantCustomization.allowTenantEmailCustomization.description"
                )}
            </CardContent>
        </Card>
        
        <Card className="shadow-lg">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Code2 className="h-5 w-5 text-primary"/>Advanced Settings</CardTitle>
                 <CardDescription>Control advanced developer and user options.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
                {renderSettingRow("allowUserApiKey", "Allow Users to Provide Their Own API Key", 
                    <Controller name="allowUserApiKey" control={control} render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange} />} />, 
                    "If enabled, users can enter their own Gemini API key in their settings to use for AI features."
                )}
            </CardContent>
        </Card>


        <div className="pt-6 text-right">
          <Button type="submit" size="lg" disabled={!isDirty} className="bg-primary hover:bg-primary/90 text-primary-foreground">
            {t("platformSettings.saveButton")}
          </Button>
        </div>
      </form>
    </div>
    </TooltipProvider>
  );
}

