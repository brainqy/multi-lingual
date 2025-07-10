
'use client';

import type React from 'react';
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FileText } from "lucide-react";
import { samplePlatformSettings } from "@/lib/sample-data";
import { useAuth } from '@/hooks/use-auth';

export default function PublicBlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated } = useAuth();
  const platformName = samplePlatformSettings.platformName;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="bg-card text-card-foreground shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-2xl font-bold">
            <FileText className="h-7 w-7 text-primary" />
            {platformName}
          </Link>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            {isAuthenticated ? (
              <Link href="/dashboard">
                <Button variant="outline">Go to Dashboard</Button>
              </Link>
            ) : (
              <Link href="/auth/login">
                <Button>Login</Button>
              </Link>
            )}
          </div>
        </div>
      </header>
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      <footer className="py-8 bg-card text-center text-muted-foreground border-t">
        <p>&copy; {new Date().getFullYear()} {platformName}. All rights reserved.</p>
      </footer>
    </div>
  );
}
