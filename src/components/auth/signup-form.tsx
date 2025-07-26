
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { useI18n } from "@/hooks/use-i18n";
import { User, KeyRound, Mail, Gift, Eye, EyeOff } from "lucide-react";
import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { samplePlatformSettings } from "@/lib/sample-data";

export function SignupForm() {
  const { signup } = useAuth();
  const { t } = useI18n();
  const [showPassword, setShowPassword] = React.useState(false);
  const platformName = t("appName", { default: "Bhasha Setu" });

  const formSchema = z.object({
    name: z.string().min(1, { message: t("validation.required", { default: "This field is required."}) }),
    email: z.string().email({ message: t("validation.email", { default: "Please enter a valid email address."}) }),
    password: z.string().min(8, { message: t("validation.adminPasswordMin", { default: "Password must be at least 8 characters."}) }),
    referralCode: z.string().optional(),
    agreeToTerms: z.boolean().refine(val => val === true, {
      message: t("validation.termsRequired", { default: "You must accept the terms and conditions." }),
    }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      referralCode: "",
      agreeToTerms: false,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    signup(values.name, values.email, 'user', values.password);
  }

  return (
    <Card className="w-full max-w-md shadow-xl">
      <CardHeader>
        <CardTitle className="text-3xl font-headline text-center text-primary">{t("signup.title")}</CardTitle>
        <CardDescription className="text-center">{platformName}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground/80">{t("signup.nameLabel")}</FormLabel>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                    <FormControl>
                      <Input placeholder="Your Name" {...field} className="pl-10"/>
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground/80">{t("signup.emailLabel")}</FormLabel>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                    <FormControl>
                      <Input placeholder="your@email.com" {...field} className="pl-10" />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground/80">{t("signup.passwordLabel")}</FormLabel>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                    <FormControl>
                      <Input type={showPassword ? "text" : "password"} placeholder="••••••••" {...field} className="pl-10 pr-10" />
                    </FormControl>
                     <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      <span className="sr-only">{showPassword ? "Hide password" : "Show password"}</span>
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="referralCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground/80">{t("signup.referralCodeLabel", { default: "Referral Code (Optional)" })}</FormLabel>
                  <div className="relative">
                    <Gift className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                    <FormControl>
                      <Input placeholder={t("signup.referralCodePlaceholder", { default: "Enter referral code" })} {...field} className="pl-10"/>
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="agreeToTerms"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
                   <FormControl>
                     <Checkbox
                       checked={field.value}
                       onCheckedChange={field.onChange}
                     />
                   </FormControl>
                   <div className="space-y-1 leading-none">
                     <FormLabel>
                       {t("signup.agreeToTermsLabel", { default: "Agree to our terms and conditions" })}
                     </FormLabel>
                     <FormDescription>
                        {t("signup.agreeToTermsDescription", { default: "By signing up, you agree to our" })}{" "}
                        <Link href="/terms" className="text-primary hover:underline">{t("signup.termsLink", { default: "Terms of Service" })}</Link> & <Link href="/privacy" className="text-primary hover:underline">{t("signup.privacyLink", { default: "Privacy Policy" })}</Link>.
                     </FormDescription>
                     <FormMessage />
                   </div>
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
              {t("signup.submitButton")}
            </Button>
          </form>
        </Form>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          {t("signup.loginPrompt")}{" "}
          <Link href="/auth/login" className="font-medium text-primary hover:underline">
            {t("signup.loginLink")}
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
