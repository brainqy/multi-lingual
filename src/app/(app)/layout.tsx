
'use client';

import type React from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { AppHeader } from '@/components/layout/AppHeader';
import FloatingMessenger from '@/components/features/FloatingMessenger';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { addRecentPage, getLabelForPath } from '@/lib/recent-pages';
import AnnouncementBanner from '@/components/features/AnnouncementBanner';
import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';
import { getPlatformSettings } from '@/lib/actions/platform-settings';
import type { PlatformSettings } from '@/types';
import { SettingsProvider } from '@/contexts/settings-provider';
import DailyStreakPopup from "@/components/features/DailyStreakPopup";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading, logout, isStreakPopupOpen, setStreakPopupOpen } = useAuth();
  const router = useRouter();
  const [settings, setSettings] = useState<PlatformSettings | null>(null);
  const [isSettingsLoading, setIsSettingsLoading] = useState(true);

  useEffect(() => {
    async function loadSettings() {
      const platformSettings = await getPlatformSettings();
      setSettings(platformSettings);
      setIsSettingsLoading(false);
    }
    loadSettings();
  }, []);

  useEffect(() => {
    if (pathname) {
      const label = getLabelForPath(pathname);
      addRecentPage(pathname, label);
    }
  }, [pathname]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/auth/login');
      return;
    }

    if (user && typeof window !== 'undefined') {
        const hostname = window.location.hostname;
        const parts = hostname.split('.');
        let currentTenantId: string | null = 'platform'; 
        if (parts.length > 2 && parts[0] !== 'www') {
            currentTenantId = parts[0];
        } else if (hostname.includes('localhost') && parts.length > 1 && parts[0] !== 'localhost') {
            currentTenantId = parts[0];
        } else {
            currentTenantId = 'platform';
        }
        
        if (user.tenantId !== currentTenantId && user.role !== 'admin') {
            console.warn(`Tenant mismatch: User tenant is '${user.tenantId}', but subdomain is '${currentTenantId}'. Logging out.`);
            logout();
        }
    }

  }, [isLoading, isAuthenticated, router, user, logout]);
  
  useEffect(() => {
    if (settings?.maintenanceMode && user?.role !== 'admin' && pathname !== '/maintenance') {
      router.replace('/maintenance');
    }
  }, [settings, user, pathname, router]);

  if (isLoading || isSettingsLoading || !isAuthenticated || !settings) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }
  
  if (settings?.maintenanceMode && user?.role !== 'admin') {
    // This will show a blank screen during the redirect to /maintenance, which is fine
    return null;
  }


  return (
    <SettingsProvider settings={settings}>
      <SidebarProvider defaultOpen>
        <AppSidebar />
        <SidebarInset className="flex flex-col min-h-screen">
          <div className="sticky top-0 z-10 bg-card">
            <AnnouncementBanner />
            <AppHeader />
          </div>
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-background">
            {children}
          </main>
          <FloatingMessenger />
        </SidebarInset>
      </SidebarProvider>
       <DailyStreakPopup
        isOpen={isStreakPopupOpen}
        onClose={() => setStreakPopupOpen(false)}
        userProfile={user}
      />
    </SettingsProvider>
  );
}
