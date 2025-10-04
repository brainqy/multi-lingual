
"use client";

import { useEffect, useState, type ReactNode } from 'react';
import { SettingsProvider } from '@/contexts/settings-provider';
import type { PlatformSettings } from '@/types';
import { getPlatformSettings } from '@/lib/actions/platform-settings';
import { Loader2 } from 'lucide-react';

function FullscreenLayoutContent({ children }: { children: ReactNode }) {
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
      {children}
    </SettingsProvider>
  );
}

export default function FullscreenLayout({ children }: { children: ReactNode }) {
  return <FullscreenLayoutContent>{children}</FullscreenLayoutContent>;
}
