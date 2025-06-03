
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
import { Building2, Palette, Settings, UserPlus, Eye, Layers3, ChevronLeft, ChevronRight } from "lucide-react";
import type { Tenant, TenantSettings } from "@/types";
import { sampleTenants, sampleUserProfile } from "@/lib/sample-data"; 
import Link from "next/link";
import AccessDeniedMessage from "@/components/ui/AccessDeniedMessage";

const tenantOnboardingSchema = z.object({
  tenantName: z.string().min(3, "validation.tenantNameMin"),
  tenantDomain: z.string().optional(),
  customLogoUrl: z.string().url("validation.invalidUrl").optional().or(z.literal('')),
  primaryColor: z.string().regex(/^hsl\(\d{1,3}\s\d{1,3}%\s\d{1,3}%\)$|^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "validation.invalidColor").optional().or(z.literal('')),
  accentColor: z.string().regex(/^hsl\(\d{1,3}\s\d{1,3}%\s\d{1,3}%\)$|^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "validation.invalidColor").optional().or(z.literal('')),
  allowPublicSignup: z.boolean().default(true),
  communityFeedEnabled: z.boolean().default(true),
  jobBoardEnabled: z.boolean().default(true),
  gamificationEnabled: z.boolean().default(true),
  walletEnabled: z.boolean().default(true),
  eventRegistrationEnabled: z.boolean().default(true),
  adminEmail: z.string().email("validation.adminEmailInvalid"),
  adminName: z.string().min(1, "validation.adminNameRequired"),
  adminPassword: z.string().min(8, "validation.adminPasswordMin"),
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
  const { toast } = useToast();

  const translatedSchema = z.object({
    tenantName: z.string().min(3, t("tenantOnboarding.validation.tenantNameMin")),
    tenantDomain: z.string().optional(),
    customLogoUrl: z.string().url(t("tenantOnboarding.validation.invalidUrl")).optional().or(z.literal('')),
    primaryColor: z.string().regex(/^hsl\(\d{1,3}\s\d{1,3}%\s\d{1,3}%\)$|^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, t("tenantOnboarding.validation.invalidColor")).optional().or(z.literal('')),
    accentColor: z.string().regex(/^hsl\(\d{1,3}\s\d{1,3}%\s\d{1,3}%\)$|^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, t("tenantOnboarding.validation.invalidColor")).optional().or(z.literal('')),
    allowPublicSignup: z.boolean().default(true),
    communityFeedEnabled: z.boolean().default(true),
    jobBoardEnabled: z.boolean().default(true),
    gamificationEnabled: z.boolean().default(true),
    walletEnabled: z.boolean().default(true),
    eventRegistrationEnabled: z.boolean().default(true),
    adminEmail: z.string().email(t("tenantOnboarding.validation.adminEmailInvalid")),
    adminName: z.string().min(1, t("tenantOnboarding.validation.adminNameRequired")),
    adminPassword: z.string().min(8, t("tenantOnboarding.validation.adminPasswordMin")),
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
      case 3: fieldsToValidate = ['adminEmail', 'adminName', 'adminPassword']; break;
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

  const onSubmit = (data: TenantOnboardingFormData) => {
    const newTenantSettings: TenantSettings = {
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

    const newTenant: Tenant = {
      id: `tenant-${Date.now()}`,
      name: data.tenantName,
      domain: data.tenantDomain,
      settings: newTenantSettings,
      createdAt: new Date().toISOString(),
    };

    sampleTenants.push(newTenant); 
    console.log("New Tenant Created (Mock):", newTenant);
    console.log("Initial Admin User (Mock):", { email: data.adminEmail, name: data.adminName });

    toast({ title: t("tenantOnboarding.toast.tenantCreated.title"), description: t("tenantOnboarding.toast.tenantCreated.description", {tenantName: data.tenantName}) });
    setCurrentStep(0); 
  };

  const renderStepContent = () => {
    const formData = getValues();
    switch (currentStep) {
      case 0: 
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="tenantName">{t("tenantOnboarding.formLabels.tenantName")}</Label>
              <Controller name="tenantName" control={control} render={({ field }) => <Input id="tenantName" {...field} />} />
              {errors.tenantName && <p className="text-sm text-destructive mt-1">{errors.tenantName.message}</p>}
            </div>
            <div>
              <Label htmlFor="tenantDomain">{t("tenantOnboarding.formLabels.tenantDomain")}</Label>
              <Controller name="tenantDomain" control={control} render={({ field }) => <Input id="tenantDomain" placeholder={t("tenantOnboarding.formLabels.tenantDomainPlaceholder")} {...field} />} />
              {errors.tenantDomain && <p className="text-sm text-destructive mt-1">{errors.tenantDomain.message}</p>}
            </div>
          </div>
        );
      case 1: 
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="customLogoUrl">{t("tenantOnboarding.formLabels.customLogoUrl")}</Label>
              <Controller name="customLogoUrl" control={control} render={({ field }) => <Input id="customLogoUrl" placeholder={t("tenantOnboarding.formLabels.customLogoUrlPlaceholder")} {...field} />} />
              {errors.customLogoUrl && <p className="text-sm text-destructive mt-1">{errors.customLogoUrl.message}</p>}
            </div>
            <div>
              <Label htmlFor="primaryColor">{t("tenantOnboarding.formLabels.primaryColor")}</Label>
              <Controller name="primaryColor" control={control} render={({ field }) => <Input id="primaryColor" placeholder={t("tenantOnboarding.formLabels.primaryColorPlaceholder")} {...field} />} />
              {errors.primaryColor && <p className="text-sm text-destructive mt-1">{errors.primaryColor.message}</p>}
            </div>
            <div>
              <Label htmlFor="accentColor">{t("tenantOnboarding.formLabels.accentColor")}</Label>
              <Controller name="accentColor" control={control} render={({ field }) => <Input id="accentColor" placeholder={t("tenantOnboarding.formLabels.accentColorPlaceholder")} {...field} />} />
              {errors.accentColor && <p className="text-sm text-destructive mt-1">{errors.accentColor.message}</p>}
            </div>
          </div>
        );
      case 2: 
        return (
          <div className="space-y-3">
            <h3 className="text-md font-medium mb-2">{t("tenantOnboarding.formLabels.coreFeaturesTitle")}</h3>
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
                    <Label htmlFor={feature.id} className="font-normal">{t(feature.labelKey)}</Label>
                </div>
             ))}
             <h3 className="text-md font-medium mb-2 mt-4">{t("tenantOnboarding.formLabels.signupTitle")}</h3>
             <div className="flex items-center space-x-2">
                <Controller name="allowPublicSignup" control={control} render={({ field }) => <Checkbox id="allowPublicSignup" checked={field.value} onCheckedChange={field.onChange} />} />
                <Label htmlFor="allowPublicSignup" className="font-normal">{t("tenantOnboarding.formLabels.allowPublicSignup")}</Label>
             </div>
          </div>
        );
      case 3: 
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="adminName">{t("tenantOnboarding.formLabels.adminFullName")}</Label>
              <Controller name="adminName" control={control} render={({ field }) => <Input id="adminName" {...field} />} />
              {errors.adminName && <p className="text-sm text-destructive mt-1">{errors.adminName.message}</p>}
            </div>
            <div>
              <Label htmlFor="adminEmail">{t("tenantOnboarding.formLabels.adminEmail")}</Label>
              <Controller name="adminEmail" control={control} render={({ field }) => <Input id="adminEmail" type="email" {...field} />} />
              {errors.adminEmail && <p className="text-sm text-destructive mt-1">{errors.adminEmail.message}</p>}
            </div>
            <div>
              <Label htmlFor="adminPassword">{t("tenantOnboarding.formLabels.adminPassword")}</Label>
              <Controller name="adminPassword" control={control} render={({ field }) => <Input id="adminPassword" type="password" {...field} />} />
              {errors.adminPassword && <p className="text-sm text-destructive mt-1">{errors.adminPassword.message}</p>}
            </div>
          </div>
        );
      case 4: 
        return (
          <div className="space-y-3 text-sm">
            <h3 className="text-md font-semibold text-primary">{t("tenantOnboarding.reviewSection.title")}</h3>
            <p><strong>{t("tenantOnboarding.reviewSection.nameLabel")}</strong> {formData.tenantName}</p>
            <p><strong>{t("tenantOnboarding.reviewSection.domainLabel")}</strong> {formData.tenantDomain || 'N/A'}</p>
            <p><strong>{t("tenantOnboarding.reviewSection.logoUrlLabel")}</strong> {formData.customLogoUrl || 'Default'}</p>
            <p><strong>{t("tenantOnboarding.reviewSection.primaryColorLabel")}</strong> {formData.primaryColor}</p>
            <p><strong>{t("tenantOnboarding.reviewSection.accentColorLabel")}</strong> {formData.accentColor}</p>
            <p><strong>{t("tenantOnboarding.reviewSection.publicSignupLabel")}</strong> {formData.allowPublicSignup ? 'Enabled' : 'Disabled'}</p>
            <p><strong>{t("tenantOnboarding.reviewSection.featuresLabel")}</strong></p>
            <ul className="list-disc list-inside ml-4">
                {formData.communityFeedEnabled && <li>{t("tenantOnboarding.formLabels.featureCommunityFeed")}</li>}
                {formData.jobBoardEnabled && <li>{t("tenantOnboarding.formLabels.featureJobBoard")}</li>}
                {formData.gamificationEnabled && <li>{t("tenantOnboarding.formLabels.featureGamification")}</li>}
                {formData.walletEnabled && <li>{t("tenantOnboarding.formLabels.featureWallet")}</li>}
                {formData.eventRegistrationEnabled && <li>{t("tenantOnboarding.formLabels.featureEventRegistration")}</li>}
            </ul>
            <h3 className="text-md font-semibold text-primary mt-2">{t("tenantOnboarding.reviewSection.initialAdminUserTitle")}</h3>
            <p><strong>{t("tenantOnboarding.reviewSection.nameLabel")}</strong> {formData.adminName}</p>
            <p><strong>{t("tenantOnboarding.reviewSection.emailLabel")}</strong> {formData.adminEmail}</p>
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
        <Layers3 className="h-8 w-8" /> {t("tenantOnboarding.title")}
      </h1>
      
      <Card className="shadow-xl">
        <CardHeader>
          <div className="flex items-center justify-between mb-2">
            <CardTitle className="text-xl flex items-center gap-2"><CurrentIcon className="h-6 w-6 text-primary"/>{t(STEPS_CONFIG[currentStep].titleKey)}</CardTitle>
            <span className="text-sm text-muted-foreground">{t("tenantOnboarding.currentStep", {current: currentStep + 1, total: STEPS_CONFIG.length})}</span>
          </div>
          <Progress value={((currentStep + 1) / STEPS_CONFIG.length) * 100} className="w-full h-2 [&>div]:bg-primary" />
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="min-h-[300px]">
            {renderStepContent()}
          </CardContent>
          <CardFooter className="flex justify-between border-t pt-6">
            <Button type="button" variant="outline" onClick={handlePrevStep} disabled={currentStep === 0}>
              <ChevronLeft className="mr-2 h-4 w-4" /> {t("tenantOnboarding.buttons.previous")}
            </Button>
            {currentStep < STEPS_CONFIG.length - 1 ? (
              <Button type="button" onClick={handleNextStep} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                {t("tenantOnboarding.buttons.next")} <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button type="submit" className="bg-green-600 hover:bg-green-700 text-primary-foreground">
                {t("tenantOnboarding.buttons.createTenant")}
              </Button>
            )}
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

    