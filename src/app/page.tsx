
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useI18n } from "@/hooks/use-i18n";
import { ArrowRight, LogIn } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function RootPage() {
  const { t } = useI18n();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-gradient-to-br from-primary/10 via-background to-background">
      <Card className="w-full max-w-lg text-center shadow-xl animate-fadeIn">
        <CardHeader>
          <div className="mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--primary))" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-20 w-20">
              <path d="M6 2L3 6v14c0 1.1.9 2 2 2h14a2 2 0 002-2V6l-3-4H6zM3.8 6h16.4M16 10a4 4 0 11-8 0"/>
            </svg>
          </div>
          <CardTitle className="text-4xl font-headline text-primary">
            {t("appName")}
          </CardTitle>
          <CardDescription className="text-lg text-muted-foreground pt-2">
            {t("landingPage.subtitle", {defaultValue: "Your Gateway to Multilingual Communication"})}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-foreground/90">
            {t("landingPage.description", {defaultValue: "Experience seamless translation and content management across multiple languages. Join our community and bridge language barriers."})}
          </p>
          <Image 
            src="https://placehold.co/600x400.png" 
            alt="Multilingual collaboration" 
            width={600} 
            height={400} 
            className="rounded-lg shadow-md mx-auto"
            data-ai-hint="translation globe"
          />
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
          <Button asChild size="lg" className="w-full sm:w-auto">
            <Link href="/auth/login">
              <LogIn className="mr-2" /> {t("login.title")}
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
            <Link href="/dashboard">
              {t("landingPage.exploreDashboard", {defaultValue: "Explore Dashboard"})} <ArrowRight className="ml-2" />
            </Link>
          </Button>
        </CardFooter>
      </Card>
      <footer className="mt-8 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} {t("appName")}. All rights reserved.</p>
        <div className="mt-2 space-x-4">
          <Link href="/privacy" className="hover:text-primary hover:underline">
            {t("landingPage.privacy", {defaultValue: "Privacy Policy"})}
          </Link>
          <Link href="/terms" className="hover:text-primary hover:underline">
            {t("landingPage.terms", {defaultValue: "Terms of Service"})}
          </Link>
        </div>
      </footer>
    </div>
  );
}
