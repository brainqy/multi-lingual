
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
  tenantName: z.string().min(3, "Tenant name must be at least 3 characters"),
  tenantDomain: z.string().optional(),
  customLogoUrl: z.string().url("Invalid URL format").optional().or(z.literal('')),
  primaryColor: z.string().regex(/^hsl\(\d{1,3}\s\d{1,3}%\s\d{1,3}%\)$|^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid color format (HSL or HEX)").optional().or(z.literal('')),
  accentColor: z.string().regex(/^hsl\(\d{1,3}\s\d{1,3}%\s\d{1,3}%\)$|^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid color format (HSL or HEX)").optional().or(z.literal('')),
  allowPublicSignup: z.boolean().default(true),
  communityFeedEnabled: z.boolean().default(true),
  jobBoardEnabled: z.boolean().default(true),
  gamificationEnabled: z.boolean().default(true),
  walletEnabled: z.boolean().default(true),
  eventRegistrationEnabled: z.boolean().default(true),
  adminEmail: z.string().email("Invalid email for admin"),
  adminName: z.string().min(1, "Admin name is required"),
  adminPassword: z.string().min(8, "Password must be at least 8 characters"),
});

type TenantOnboardingFormData = z.infer<typeof tenantOnboardingSchema>;

const STEPS = [
  { id: "basicInfo", title: "Basic Information", icon: Building2 },
  { id: "branding", title: "Branding", icon: Palette },
  { id: "features", title: "Feature Configuration", icon: Settings },
  { id: "adminUser", title: "Initial Admin User", icon: UserPlus },
  { id: "review", title: "Review & Create", icon: Eye },
];

export default function TenantOnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const { toast } = useToast();
  const { control, handleSubmit, trigger, getValues, formState: { errors } } = useForm<TenantOnboardingFormData>({
    resolver: zodResolver(tenantOnboardingSchema),
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

    if (isValid && currentStep < STEPS.length - 1) {
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

    toast({ title: "Tenant Created Successfully!", description: `Tenant "${data.tenantName}" has been onboarded.` });
    setCurrentStep(0); 
  };

  const renderStepContent = () => {
    const formData = getValues();
    switch (currentStep) {
      case 0: 
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="tenantName">Tenant Name</Label>
              <Controller name="tenantName" control={control} render={({ field }) => <Input id="tenantName" {...field} />} />
              {errors.tenantName && <p className="text-sm text-destructive mt-1">{errors.tenantName.message}</p>}
            </div>
            <div>
              <Label htmlFor="tenantDomain">Tenant Domain (Optional)</Label>
              <Controller name="tenantDomain" control={control} render={({ field }) => <Input id="tenantDomain" placeholder="e.g., myuniversity.resumematch.ai" {...field} />} />
              {errors.tenantDomain && <p className="text-sm text-destructive mt-1">{errors.tenantDomain.message}</p>}
            </div>
          </div>
        );
      case 1: 
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="customLogoUrl">Custom Logo URL (Optional)</Label>
              <Controller name="customLogoUrl" control={control} render={({ field }) => <Input id="customLogoUrl" placeholder="https://example.com/logo.png" {...field} />} />
              {errors.customLogoUrl && <p className="text-sm text-destructive mt-1">{errors.customLogoUrl.message}</p>}
            </div>
            <div>
              <Label htmlFor="primaryColor">Primary Color (HSL or HEX)</Label>
              <Controller name="primaryColor" control={control} render={({ field }) => <Input id="primaryColor" placeholder="e.g., hsl(180 100% 25%) or #008080" {...field} />} />
              {errors.primaryColor && <p className="text-sm text-destructive mt-1">{errors.primaryColor.message}</p>}
            </div>
            <div>
              <Label htmlFor="accentColor">Accent Color (HSL or HEX)</Label>
              <Controller name="accentColor" control={control} render={({ field }) => <Input id="accentColor" placeholder="e.g., hsl(180 100% 30%) or #009688" {...field} />} />
              {errors.accentColor && <p className="text-sm text-destructive mt-1">{errors.accentColor.message}</p>}
            </div>
          </div>
        );
      case 2: 
        return (
          <div className="space-y-3">
            <h3 className="text-md font-medium mb-2">Core Features:</h3>
             {[
                { id: "communityFeedEnabled", label: "Community Feed" },
                { id: "jobBoardEnabled", label: "Job Board" },
                { id: "gamificationEnabled", label: "Gamification (XP, Badges)" },
                { id: "walletEnabled", label: "Digital Wallet (Coins)" },
                { id: "eventRegistrationEnabled", label: "Event Registration" },
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
                    <Label htmlFor={feature.id} className="font-normal">{feature.label}</Label>
                </div>
             ))}
             <h3 className="text-md font-medium mb-2 mt-4">Signup:</h3>
             <div className="flex items-center space-x-2">
                <Controller name="allowPublicSignup" control={control} render={({ field }) => <Checkbox id="allowPublicSignup" checked={field.value} onCheckedChange={field.onChange} />} />
                <Label htmlFor="allowPublicSignup" className="font-normal">Allow Public Signup for this Tenant</Label>
             </div>
          </div>
        );
      case 3: 
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="adminName">Admin Full Name</Label>
              <Controller name="adminName" control={control} render={({ field }) => <Input id="adminName" {...field} />} />
              {errors.adminName && <p className="text-sm text-destructive mt-1">{errors.adminName.message}</p>}
            </div>
            <div>
              <Label htmlFor="adminEmail">Admin Email Address</Label>
              <Controller name="adminEmail" control={control} render={({ field }) => <Input id="adminEmail" type="email" {...field} />} />
              {errors.adminEmail && <p className="text-sm text-destructive mt-1">{errors.adminEmail.message}</p>}
            </div>
            <div>
              <Label htmlFor="adminPassword">Admin Password</Label>
              <Controller name="adminPassword" control={control} render={({ field }) => <Input id="adminPassword" type="password" {...field} />} />
              {errors.adminPassword && <p className="text-sm text-destructive mt-1">{errors.adminPassword.message}</p>}
            </div>
          </div>
        );
      case 4: 
        return (
          <div className="space-y-3 text-sm">
            <h3 className="text-md font-semibold text-primary">Review Tenant Configuration:</h3>
            <p><strong>Name:</strong> {formData.tenantName}</p>
            <p><strong>Domain:</strong> {formData.tenantDomain || 'N/A'}</p>
            <p><strong>Logo URL:</strong> {formData.customLogoUrl || 'Default'}</p>
            <p><strong>Primary Color:</strong> {formData.primaryColor}</p>
            <p><strong>Accent Color:</strong> {formData.accentColor}</p>
            <p><strong>Public Signup:</strong> {formData.allowPublicSignup ? 'Enabled' : 'Disabled'}</p>
            <p><strong>Features:</strong></p>
            <ul className="list-disc list-inside ml-4">
                {formData.communityFeedEnabled && <li>Community Feed</li>}
                {formData.jobBoardEnabled && <li>Job Board</li>}
                {formData.gamificationEnabled && <li>Gamification</li>}
                {formData.walletEnabled && <li>Wallet</li>}
                {formData.eventRegistrationEnabled && <li>Event Registration</li>}
            </ul>
            <h3 className="text-md font-semibold text-primary mt-2">Initial Admin User:</h3>
            <p><strong>Name:</strong> {formData.adminName}</p>
            <p><strong>Email:</strong> {formData.adminEmail}</p>
          </div>
        );
      default:
        return null;
    }
  };

  const CurrentIcon = STEPS[currentStep].icon;

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
        <Layers3 className="h-8 w-8" /> Tenant Onboarding
      </h1>
      
      <Card className="shadow-xl">
        <CardHeader>
          <div className="flex items-center justify-between mb-2">
            <CardTitle className="text-xl flex items-center gap-2"><CurrentIcon className="h-6 w-6 text-primary"/>{STEPS[currentStep].title}</CardTitle>
            <span className="text-sm text-muted-foreground">Step {currentStep + 1} of {STEPS.length}</span>
          </div>
          <Progress value={((currentStep + 1) / STEPS.length) * 100} className="w-full h-2 [&>div]:bg-primary" />
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="min-h-[300px]">
            {renderStepContent()}
          </CardContent>
          <CardFooter className="flex justify-between border-t pt-6">
            <Button type="button" variant="outline" onClick={handlePrevStep} disabled={currentStep === 0}>
              <ChevronLeft className="mr-2 h-4 w-4" /> Previous
            </Button>
            {currentStep < STEPS.length - 1 ? (
              <Button type="button" onClick={handleNextStep} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                Next <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button type="submit" className="bg-green-600 hover:bg-green-700 text-primary-foreground">
                Create Tenant
              </Button>
            )}
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
