
'use client';

import type React from 'react';
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FileText } from "lucide-react";
import { useAuth } from '@/hooks/use-auth';
import { useSettings } from '@/contexts/settings-provider';
import { SettingsProvider } from '@/contexts/settings-provider';
import type { PlatformSettings } from '@/types';
import { getPlatformSettings } from '@/lib/actions/platform-settings';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

function BlogLayoutContent({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const { settings } = useSettings();
  const platformName = settings.platformName;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="bg-card text-card-foreground shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-2xl font-bold">
            <FileText className="h-7 w-7 text-primary" />
            <span className="hidden sm:inline">{platformName}</span>
          </Link>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            {isAuthenticated ? (
              <Link href="/dashboard">
                <Button variant="outline">Go to Dashboard</Button>
              </Link>
            ) : (
              <div className="flex gap-2">
                <Button asChild variant="ghost">
                  <Link href="/auth/login">Login</Link>
                </Button>
                <Button asChild>
                  <Link href="/auth/signup">Sign Up</Button>
                </Button>
              </div>
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

export default function PublicBlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [settings, setSettings] = useState<PlatformSettings | null>(null);

  useEffect(() => {
    async function loadSettings() {
      const platformSettings = await getPlatformSettings();
      setSettings(platformSettings);
    }
    loadSettings();
  }, []);

  if (!settings) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <SettingsProvider settings={settings}>
      <BlogLayoutContent>{children}</BlogLayoutContent>
    </SettingsProvider>
  );
}
