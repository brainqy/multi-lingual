
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import Link from "next/link";
import { useSearchParams } from 'next/navigation'

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
import { useI18n } from "@/hooks/use-i18n";
import { Eye, EyeOff, KeyRound } from "lucide-react";
import React, { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { resetPassword } from "@/lib/actions/auth";

export function ResetPasswordForm() {
  const { t } = useI18n();
  const { toast } = useToast();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const formSchema = z.object({
    newPassword: z.string().min(8, { message: t("validation.adminPasswordMin", { default: "Password must be at least 8 characters."}) }),
    confirmPassword: z.string(),
  }).refine(data => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!token) {
        toast({ title: "Error", description: "Invalid or missing reset token.", variant: "destructive"});
        return;
    }

    const result = await resetPassword({ token, newPassword: values.newPassword });

    if (result.success) {
      toast({
        title: "Password Reset Successful",
        description: "Your password has been changed. Please log in with your new password.",
      });
      setIsSubmitted(true);
    } else {
        toast({ title: "Password Reset Failed", description: result.error, variant: "destructive"});
    }
  }

  if (!token) {
     return (
       <Card className="w-full max-w-md shadow-xl text-center">
        <CardHeader>
          <CardTitle className="text-3xl font-headline text-center text-destructive">Invalid Link</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            The password reset link is invalid or has expired. Please request a new one.
          </p>
          <Button asChild variant="link" className="mt-4">
            <Link href="/auth/forgot-password">
              Request a new link
            </Link>
          </Button>
        </CardContent>
      </Card>
     )
  }
  
  if (isSubmitted) {
    return (
      <Card className="w-full max-w-md shadow-xl text-center">
        <CardHeader>
          <CardTitle className="text-3xl font-headline text-center text-primary">Password Changed!</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            You can now log in with your new password.
          </p>
          <Button asChild className="mt-4">
            <Link href="/auth/login">
              Return to Login
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md shadow-xl">
      <CardHeader>
        <CardTitle className="text-3xl font-headline text-center text-primary">Set New Password</CardTitle>
        <CardDescription className="text-center">Please enter and confirm your new password below.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground/80">New Password</FormLabel>
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
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground/80">Confirm New Password</FormLabel>
                   <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                    <FormControl>
                      <Input type={showConfirmPassword ? "text" : "password"} placeholder="••••••••" {...field} className="pl-10 pr-10" />
                    </FormControl>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
              Reset Password
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
