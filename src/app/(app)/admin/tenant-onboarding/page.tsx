
"use client";
import { useI18n } from "@/hooks/use-i18n";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Building2, Palette, Settings, UserPlus, Eye, Layers3, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import type { Tenant, TenantSettings } from "@/types";
import { sampleUserProfile } from "@/lib/sample-data"; 
import { useRouter } from "next/navigation";
import AccessDeniedMessage from "@/components/ui/AccessDeniedMessage";
import { createTenantWithAdmin } from "@/lib/actions/tenants";

const tenantOnboardingSchema = z.object({
  tenantName: z.string().min(3),
  tenantDomain: z.string().optional(),
  customLogoUrl: z.string().url().optional().or(z.literal('')),
  primaryColor: z.string().regex(/^hsl\(\d{1,3}\s\d{1,3}%\s\d{1,3}%\)$|^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/).optional().or(z.literal('')),
  accentColor: z.string().regex(/^hsl\(\d{1,3}\s\d{1,3}%\s\d{1,3}%\)$|^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/).optional().or(z.literal('')),
  allowPublicSignup: z.boolean().default(true),
  communityFeedEnabled: z.boolean().default(true),
  jobBoardEnabled: z.boolean().default(true),
  gamificationEnabled: z.boolean().default(true),
  walletEnabled: z.boolean().default(true),
  eventRegistrationEnabled: z.boolean().default(true),
  adminEmail: z.string().email(),
  adminName: z.string().min(1),
});

type TenantOnboardingFormData = z.infer<typeof tenantOnboardingSchema>;

const STEPS_CONFIG = [
  { id: "basicInfo", titleKey: "tenantOnboarding.steps.basicInfo", icon: Building2 },
  { id: "branding", titleKey: "tenantOnboarding.steps.branding", icon: Palette },
  { id: "features", titleKey: "tenantOnboarding.steps.features", icon: Settings },
  { id: "adminUser", titleKey: "tenantOnboarding.steps.adminUser", icon: UserPlus },
  { id: "review", titleKey: "tenantOnboarding.steps.review", icon: Eye },
];

export default function TenantOnboardingPage() {
  const { t } = useI18n();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const translatedSchema = z.object({
    tenantName: z.string().min(3, t("validation.tenantNameMin", { default: "Tenant name must be at least 3 characters." })),
    tenantDomain: z.string().optional(),
    customLogoUrl: z.string().url(t("validation.invalidUrl", { default: "Please enter a valid URL." })).optional().or(z.literal('')),
    primaryColor: z.string().regex(/^hsl\(\d{1,3}\s\d{1,3}%\s\d{1,3}%\)$|^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, t("validation.invalidColor", { default: "Please enter a valid HSL or hex color code." })).optional().or(z.literal('')),
    accentColor: z.string().regex(/^hsl\(\d{1,3}\s\d{1,3}%\s\d{1,3}%\)$|^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, t("validation.invalidColor", { default: "Please enter a valid HSL or hex color code." })).optional().or(z.literal('')),
    allowPublicSignup: z.boolean().default(true),
    communityFeedEnabled: z.boolean().default(true),
    jobBoardEnabled: z.boolean().default(true),
    gamificationEnabled: z.boolean().default(true),
    walletEnabled: z.boolean().default(true),
    eventRegistrationEnabled: z.boolean().default(true),
    adminEmail: z.string().email(t("validation.adminEmailInvalid", { default: "Please enter a valid admin email address." })),
    adminName: z.string().min(1, t("validation.adminNameRequired", { default: "Admin name is required." })),
  });


  const { control, handleSubmit, trigger, getValues, formState: { errors } } = useForm<TenantOnboardingFormData>({
    resolver: zodResolver(translatedSchema),
    defaultValues: {
      allowPublicSignup: true,
      communityFeedEnabled: true,
      jobBoardEnabled: true,
      gamificationEnabled: true,
      walletEnabled: true,
      eventRegistrationEnabled: true,
      primaryColor: 'hsl(180 100% 25%)', 
      accentColor: 'hsl(180 100% 30%)',
    }
  });

  const currentUser = sampleUserProfile; 
  if (currentUser.role !== 'admin') {
    return <AccessDeniedMessage />;
  }


  const handleNextStep = async () => {
    let fieldsToValidate: (keyof TenantOnboardingFormData)[] = [];
    switch (currentStep) {
      case 0: fieldsToValidate = ['tenantName', 'tenantDomain']; break;
      case 1: fieldsToValidate = ['customLogoUrl', 'primaryColor', 'accentColor']; break;
      case 3: fieldsToValidate = ['adminEmail', 'adminName']; break;
    }
    
    const isValid = fieldsToValidate.length > 0 ? await trigger(fieldsToValidate) : true;

    if (isValid && currentStep < STEPS_CONFIG.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const onSubmit = async (data: TenantOnboardingFormData) => {
    setIsSubmitting(true);
    const tenantSettings: Omit<TenantSettings, 'id'> = {
      allowPublicSignup: data.allowPublicSignup,
      customLogoUrl: data.customLogoUrl,
      primaryColor: data.primaryColor,
      accentColor: data.accentColor,
      features: {
        communityFeedEnabled: data.communityFeedEnabled,
        jobBoardEnabled: data.jobBoardEnabled,
        gamificationEnabled: data.gamificationEnabled,
        walletEnabled: data.walletEnabled,
        eventRegistrationEnabled: data.eventRegistrationEnabled,
      }
    };

    const tenantData = {
      name: data.tenantName,
      domain: data.tenantDomain,
      settings: tenantSettings,
    };
    
    const adminUserData = {
        name: data.adminName,
        email: data.adminEmail,
    };

    const newTenant = await createTenantWithAdmin(tenantData, adminUserData);

    if (newTenant) {
        toast({ title: t("tenantOnboarding.toast.tenantCreated.title", { default: "Tenant Created!" }), description: t("tenantOnboarding.toast.tenantCreated.description", { default: "{tenantName} has been successfully onboarded.", tenantName: data.tenantName}) });
        router.push('/admin/tenants');
    } else {
        toast({ title: "Error", description: "Failed to create the new tenant.", variant: "destructive"});
        setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    const formData = getValues();
    switch (currentStep) {
      case 0: 
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="tenantName">{t("tenantOnboarding.formLabels.tenantName", { default: "Tenant Name (e.g., University Name, Company)" })}</Label>
              <Controller name="tenantName" control={control} render={({ field }) => <Input id="tenantName" {...field} />} />
              {errors.tenantName && <p className="text-sm text-destructive mt-1">{errors.tenantName.message}</p>}
            </div>
            <div>
              <Label htmlFor="tenantDomain">{t("tenantOnboarding.formLabels.tenantDomain", { default: "Tenant Domain (Optional)" })}</Label>
              <Controller name="tenantDomain" control={control} render={({ field }) => <Input id="tenantDomain" placeholder={t("tenantOnboarding.formLabels.tenantDomainPlaceholder", { default: "e.g., myuni.JobMatch.ai" })} {...field} />} />
              {errors.tenantDomain && <p className="text-sm text-destructive mt-1">{errors.tenantDomain.message}</p>}
            </div>
          </div>
        );
      case 1: 
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="customLogoUrl">{t("tenantOnboarding.formLabels.customLogoUrl", { default: "Custom Logo URL (Optional)" })}</Label>
              <Controller name="customLogoUrl" control={control} render={({ field }) => <Input id="customLogoUrl" placeholder={t("tenantOnboarding.formLabels.customLogoUrlPlaceholder", { default: "https://example.com/logo.png" })} {...field} />} />
              {errors.customLogoUrl && <p className="text-sm text-destructive mt-1">{errors.customLogoUrl.message}</p>}
            </div>
            <div>
              <Label htmlFor="primaryColor">{t("tenantOnboarding.formLabels.primaryColor", { default: "Primary Color (HSL or Hex)" })}</Label>
              <Controller name="primaryColor" control={control} render={({ field }) => <Input id="primaryColor" placeholder={t("tenantOnboarding.formLabels.primaryColorPlaceholder", { default: "e.g., hsl(180 100% 25%) or #008080" })} {...field} />} />
              {errors.primaryColor && <p className="text-sm text-destructive mt-1">{errors.primaryColor.message}</p>}
            </div>
            <div>
              <Label htmlFor="accentColor">{t("tenantOnboarding.formLabels.accentColor", { default: "Accent Color (HSL or Hex)" })}</Label>
              <Controller name="accentColor" control={control} render={({ field }) => <Input id="accentColor" placeholder={t("tenantOnboarding.formLabels.accentColorPlaceholder", { default: "e.g., hsl(180 100% 30%) or #009999" })} {...field} />} />
              {errors.accentColor && <p className="text-sm text-destructive mt-1">{errors.accentColor.message}</p>}
            </div>
          </div>
        );
      case 2: 
        return (
          <div className="space-y-3">
            <h3 className="text-md font-medium mb-2">{t("tenantOnboarding.formLabels.coreFeaturesTitle", { default: "Core Features" })}</h3>
             {[
                { id: "communityFeedEnabled", labelKey: "tenantOnboarding.formLabels.featureCommunityFeed" },
                { id: "jobBoardEnabled", labelKey: "tenantOnboarding.formLabels.featureJobBoard" },
                { id: "gamificationEnabled", labelKey: "tenantOnboarding.formLabels.featureGamification" },
                { id: "walletEnabled", labelKey: "tenantOnboarding.formLabels.featureWallet" },
                { id: "eventRegistrationEnabled", labelKey: "tenantOnboarding.formLabels.featureEventRegistration" },
             ].map(feature => (
                <div key={feature.id} className="flex items-center space-x-2">
                    <Controller
                        name={feature.id as keyof TenantOnboardingFormData}
                        control={control}
                        render={({ field }) => (
                        <Checkbox
                            id={feature.id}
                            checked={field.value as boolean}
                            onCheckedChange={field.onChange}
                        />
                        )}
                    />
                    <Label htmlFor={feature.id} className="font-normal">{t(feature.labelKey, { default: feature.labelKey })}</Label>
                </div>
             ))}
             <h3 className="text-md font-medium mb-2 mt-4">{t("tenantOnboarding.formLabels.signupTitle", { default: "Signup Settings" })}</h3>
             <div className="flex items-center space-x-2">
                <Controller name="allowPublicSignup" control={control} render={({ field }) => <Checkbox id="allowPublicSignup" checked={field.value} onCheckedChange={field.onChange} />} />
                <Label htmlFor="allowPublicSignup" className="font-normal">{t("tenantOnboarding.formLabels.allowPublicSignup", { default: "Allow Public Signup" })}</Label>
             </div>
          </div>
        );
      case 3: 
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="adminName">{t("tenantOnboarding.formLabels.adminFullName", { default: "Initial Admin Full Name" })}</Label>
              <Controller name="adminName" control={control} render={({ field }) => <Input id="adminName" {...field} />} />
              {errors.adminName && <p className="text-sm text-destructive mt-1">{errors.adminName.message}</p>}
            </div>
            <div>
              <Label htmlFor="adminEmail">{t("tenantOnboarding.formLabels.adminEmail", { default: "Admin Email" })}</Label>
              <Controller name="adminEmail" control={control} render={({ field }) => <Input id="adminEmail" type="email" {...field} />} />
              {errors.adminEmail && <p className="text-sm text-destructive mt-1">{errors.adminEmail.message}</p>}
            </div>
          </div>
        );
      case 4: 
        return (
          <div className="space-y-3 text-sm">
            <h3 className="text-md font-semibold text-primary">{t("tenantOnboarding.reviewSection.title", { default: "Review Details" })}</h3>
            <p><strong>{t("tenantOnboarding.reviewSection.nameLabel", { default: "Name:" })}</strong> {formData.tenantName}</p>
            <p><strong>{t("tenantOnboarding.reviewSection.domainLabel", { default: "Domain:" })}</strong> {formData.tenantDomain || 'N/A'}</p>
            <p><strong>{t("tenantOnboarding.reviewSection.logoUrlLabel", { default: "Logo URL:" })}</strong> {formData.customLogoUrl || 'Default'}</p>
            <p><strong>{t("tenantOnboarding.reviewSection.primaryColorLabel", { default: "Primary Color:" })}</strong> {formData.primaryColor}</p>
            <p><strong>{t("tenantOnboarding.reviewSection.accentColorLabel", { default: "Accent Color:" })}</strong> {formData.accentColor}</p>
            <p><strong>{t("tenantOnboarding.reviewSection.publicSignupLabel", { default: "Public Signup:" })}</strong> {formData.allowPublicSignup ? 'Enabled' : 'Disabled'}</p>
            <p><strong>{t("tenantOnboarding.reviewSection.featuresLabel", { default: "Enabled Features:" })}</strong></p>
            <ul className="list-disc list-inside ml-4">
                {formData.communityFeedEnabled && <li>{t("tenantOnboarding.formLabels.featureCommunityFeed", { default: "Community Feed" })}</li>}
                {formData.jobBoardEnabled && <li>{t("tenantOnboarding.formLabels.featureJobBoard", { default: "Job Board" })}</li>}
                {formData.gamificationEnabled && <li>{t("tenantOnboarding.formLabels.featureGamification", { default: "Gamification (XP & Badges)" })}</li>}
                {formData.walletEnabled && <li>{t("tenantOnboarding.formLabels.featureWallet", { default: "Digital Wallet (Coins)" })}</li>}
                {formData.eventRegistrationEnabled && <li>{t("tenantOnboarding.formLabels.featureEventRegistration", { default: "Event Registration" })}</li>}
            </ul>
            <h3 className="text-md font-semibold text-primary mt-2">{t("tenantOnboarding.reviewSection.initialAdminUserTitle", { default: "Initial Admin User" })}</h3>
            <p><strong>{t("tenantOnboarding.reviewSection.nameLabel", { default: "Name:" })}</strong> {formData.adminName}</p>
            <p><strong>{t("tenantOnboarding.reviewSection.emailLabel", { default: "Email:" })}</strong> {formData.adminEmail}</p>
          </div>
        );
      default:
        return null;
    }
  };

  const CurrentIcon = STEPS_CONFIG[currentStep].icon;

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
        <Layers3 className="h-8 w-8" /> {t("tenantOnboarding.title", { default: "Tenant Onboarding Wizard" })}
      </h1>
      
      <Card className="shadow-xl">
        <CardHeader>
          <div className="flex items-center justify-between mb-2">
            <CardTitle className="text-xl flex items-center gap-2"><CurrentIcon className="h-6 w-6 text-primary"/>{t(STEPS_CONFIG[currentStep].titleKey as any, { default: STEPS_CONFIG[currentStep].titleKey })}</CardTitle>
            <span className="text-sm text-muted-foreground">{t("tenantOnboarding.currentStep", { default: "Step {current} of {total}", current: currentStep + 1, total: STEPS_CONFIG.length })}</span>
          </div>
          <Progress value={((currentStep + 1) / STEPS_CONFIG.length) * 100} className="w-full h-2 [&>div]:bg-primary" />
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="min-h-[300px]">
            {renderStepContent()}
          </CardContent>
          <CardFooter className="flex justify-between border-t pt-6">
            <Button type="button" variant="outline" onClick={handlePrevStep} disabled={currentStep === 0 || isSubmitting}>
              <ChevronLeft className="mr-2 h-4 w-4" /> {t("tenantOnboarding.buttons.previous", { default: "Previous" })}
            </Button>
            {currentStep < STEPS_CONFIG.length - 1 ? (
              <Button type="button" onClick={handleNextStep} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                {t("tenantOnboarding.buttons.next", { default: "Next" })} <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button type="submit" disabled={isSubmitting} className="bg-green-600 hover:bg-green-700 text-primary-foreground">
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {isSubmitting ? "Creating..." : t("tenantOnboarding.buttons.createTenant", { default: "Create Tenant" })}
              </Button>
            )}
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
