
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
import { useI18n } from "@/hooks/use-i18n";
import { Mail, ArrowLeft } from "lucide-react";
import React from "react";
import { useToast } from "@/hooks/use-toast";

export function ForgotPasswordForm() {
  const { t } = useI18n();
  const { toast } = useToast();
  const [isSubmitted, setIsSubmitted] = React.useState(false);
  const platformName = t("appName", { default: "Bhasha Setu" });

  const formSchema = z.object({
    email: z.string().email({ message: t("validation.email", { default: "Please enter a valid email address."}) }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log("Password reset requested for:", values.email);
    // In a real app, you would call an API here.
    toast({
      title: t("forgotPassword.toastSuccessTitle"),
      description: t("forgotPassword.toastSuccessDescription", { email: values.email }),
    });
    setIsSubmitted(true);
  }

  if (isSubmitted) {
    return (
      <Card className="w-full max-w-md shadow-xl text-center">
        <CardHeader>
          <CardTitle className="text-3xl font-headline text-center text-primary">{t("forgotPassword.submittedTitle")}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            {t("forgotPassword.submittedDescription", { email: form.getValues("email") })}
          </p>
          <Button asChild variant="link" className="mt-4">
            <Link href="/auth/login">
              <ArrowLeft className="mr-2 h-4 w-4" /> {t("forgotPassword.backToLogin")}
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md shadow-xl">
      <CardHeader>
        <CardTitle className="text-3xl font-headline text-center text-primary">{t("forgotPassword.title")}</CardTitle>
        <CardDescription className="text-center">{t("forgotPassword.description")}</CardDescription>
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
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
              {t("forgotPassword.submitButton")}
            </Button>
          </form>
        </Form>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          <Link href="/auth/login" className="font-medium text-primary hover:underline flex items-center justify-center">
            <ArrowLeft className="mr-2 h-4 w-4" /> {t("forgotPassword.backToLogin")}
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
