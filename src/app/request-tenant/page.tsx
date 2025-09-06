
"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Layers3, Building2, User, Mail, Send, Loader2, CheckCircle } from "lucide-react";
import { createTenantWithAdmin } from "@/lib/actions/tenants";
import Link from "next/link";
import type { TenantSettings } from "@/types";

const requestSchema = z.object({
  tenantName: z.string().min(3, "Organization name must be at least 3 characters."),
  tenantDomain: z.string().min(3, "Subdomain must be at least 3 characters.").regex(/^[a-z0-9-]+$/, "Subdomain can only contain lowercase letters, numbers, and hyphens."),
  adminName: z.string().min(2, "Your name is required."),
  adminEmail: z.string().email("Please enter a valid email address."),
});

type RequestFormData = z.infer<typeof requestSchema>;

export default function RequestTenantPage() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedData, setSubmittedData] = useState<RequestFormData | null>(null);

  const { control, handleSubmit, formState: { errors } } = useForm<RequestFormData>({
    resolver: zodResolver(requestSchema),
    defaultValues: {
      tenantName: "",
      tenantDomain: "",
      adminName: "",
      adminEmail: "",
    }
  });

  const onSubmit = async (data: RequestFormData) => {
    setIsSubmitting(true);
    
    const tenantSettings: Omit<TenantSettings, 'id'> = {
      allowPublicSignup: true, // Default to true for new tenants
      // Other settings can have defaults in the backend
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

    const result = await createTenantWithAdmin(tenantData, adminUserData);
    
    if (result.success && result.tenant) {
      toast({
        title: "Request Submitted!",
        description: `Tenant "${data.tenantName}" has been created. A welcome email has been sent to the administrator.`,
        duration: 7000,
      });
      setSubmittedData(data);
      setIsSubmitted(true);
    } else {
      toast({
        title: "Submission Failed",
        description: result.error || "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }
    
    setIsSubmitting(false);
  };

  if (isSubmitted && submittedData) {
    const loginUrl = `http://${submittedData.tenantDomain}.localhost:9002/auth/login`;
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6">
        <Card className="w-full max-w-lg shadow-xl text-center">
          <CardHeader>
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <CardTitle className="text-2xl">Request Successful!</CardTitle>
            <CardDescription>
              Your new tenant, <strong>{submittedData.tenantName}</strong>, is ready.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              A welcome email with setup instructions has been sent to <strong>{submittedData.adminEmail}</strong>. Please check your inbox to set your password and get started.
            </p>
            <Button asChild size="lg" className="w-full">
              <a href={loginUrl}>Go to Your Login Page</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6">
      <Card className="w-full max-w-lg shadow-xl">
        <CardHeader className="text-center">
          <Layers3 className="h-12 w-12 text-primary mx-auto mb-3" />
          <CardTitle className="text-3xl font-headline">Request a New Tenant</CardTitle>
          <CardDescription>
            Create a dedicated space for your organization or university on our platform.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <h3 className="text-lg font-semibold border-b pb-2 flex items-center gap-2"><Building2 className="h-5 w-5 text-primary"/> Organization Details</h3>
            <div className="space-y-1">
              <Label htmlFor="tenantName">Organization / University Name</Label>
              <Controller name="tenantName" control={control} render={({ field }) => <Input id="tenantName" {...field} />} />
              {errors.tenantName && <p className="text-sm text-destructive mt-1">{errors.tenantName.message}</p>}
            </div>
            <div className="space-y-1">
              <Label htmlFor="tenantDomain">Requested Subdomain</Label>
              <div className="flex items-center">
                <Controller name="tenantDomain" control={control} render={({ field }) => <Input id="tenantDomain" placeholder="e.g., your-university" {...field} className="rounded-r-none" />} />
                <span className="inline-flex h-10 items-center rounded-r-md border border-l-0 border-input bg-muted px-3 text-sm text-muted-foreground">.localhost:9002</span>
              </div>
              {errors.tenantDomain && <p className="text-sm text-destructive mt-1">{errors.tenantDomain.message}</p>}
            </div>

            <h3 className="text-lg font-semibold border-b pb-2 pt-4 flex items-center gap-2"><User className="h-5 w-5 text-primary"/> Your Details (Initial Administrator)</h3>
            <div className="space-y-1">
              <Label htmlFor="adminName">Your Full Name</Label>
              <Controller name="adminName" control={control} render={({ field }) => <Input id="adminName" {...field} />} />
              {errors.adminName && <p className="text-sm text-destructive mt-1">{errors.adminName.message}</p>}
            </div>
            <div className="space-y-1">
              <Label htmlFor="adminEmail">Your Email Address</Label>
              <Controller name="adminEmail" control={control} render={({ field }) => <Input id="adminEmail" type="email" {...field} />} />
              {errors.adminEmail && <p className="text-sm text-destructive mt-1">{errors.adminEmail.message}</p>}
              <p className="text-xs text-muted-foreground mt-1">A welcome email will be sent here to set up your password.</p>
            </div>
            
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
              {isSubmitting ? "Submitting..." : "Submit Request"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
