
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { useI18n } from "@/hooks/use-i18n";
import { Eye, EyeOff, KeyRound, Mail } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";

const GoogleIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24">
    <path
      fill="currentColor"
      d="M21.35,11.1H12.18V13.83H18.69C18.36,17.64 15.19,19.27 12.19,19.27C8.36,19.27 5,16.25 5,12.27C5,8.29 8.36,5.27 12.19,5.27C14.03,5.27 15.39,5.82 16.32,6.72L18.25,4.92C16.48,3.24 14.24,2.27 12.19,2.27C6.92,2.27 2.73,6.66 2.73,12.27C2.73,17.88 6.92,22.27 12.19,22.27C17.6,22.27 21.5,18.33 21.5,12.42C21.5,11.83 21.43,11.45 21.35,11.1Z"
    />
  </svg>
);

export function LoginForm() {
  const { login, loginWithGoogle } = useAuth();
  const { t } = useI18n();
  const [showPassword, setShowPassword] = React.useState(false);
  const platformName = t("appName", { default: "Bhasha Setu" });
  const [tenantId, setTenantId] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      const parts = hostname.split('.');
      if (parts.length > 1 && parts[0] !== 'www' && parts[0] !== 'localhost') {
          setTenantId(parts[0]);
      }
    }
  }, []);

  const formSchema = z.object({
    email: z.string().email({ message: t("validation.email", { default: "Please enter a valid email address." }) }),
    password: z.string().min(1, { message: t("validation.required", { default: "This field is required."}) }),
    rememberMe: z.boolean().default(false).optional(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    login(values.email, values.password, tenantId); 
  }

  return (
    <Card className="w-full max-w-md shadow-xl">
      <CardHeader>
        <CardTitle asChild className="text-3xl font-headline text-center text-primary">
          <h1>{t("login.title")}</h1>
        </CardTitle>
        <CardDescription className="text-center">{tenantId ? `Signing in to: ${tenantId}` : platformName}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground/80">{t("login.emailLabel")}</FormLabel>
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
                  <FormLabel className="text-foreground/80">{t("login.passwordLabel")}</FormLabel>
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
            <div className="flex items-center justify-between">
              <FormField
                control={form.control}
                name="rememberMe"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-sm font-normal">
                        Remember me
                      </FormLabel>
                    </div>
                  </FormItem>
                )}
              />
              <Link href="/auth/forgot-password" className="text-sm font-medium text-primary hover:underline">
                {t("forgotPassword.title")}
              </Link>
            </div>
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
              {t("login.submitButton")}
            </Button>
          </form>
        </Form>
        <div className="relative my-6">
          <Separator />
          <span className="absolute left-1/2 -translate-x-1/2 -top-3 bg-card px-2 text-sm text-muted-foreground">OR</span>
        </div>
        <Button variant="outline" className="w-full" onClick={() => loginWithGoogle(tenantId)}>
          <GoogleIcon />
          <span className="ml-2">Sign in with Google</span>
        </Button>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          {t("signup.loginPrompt")}{" "}
          <Link href="/auth/signup" className="font-medium text-primary hover:underline">
            {t("signup.loginLink")}
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
