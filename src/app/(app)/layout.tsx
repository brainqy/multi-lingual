
'use client';

import type React from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { AppHeader } from '@/components/layout/AppHeader';
import FloatingMessenger from '@/components/features/FloatingMessenger';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { addRecentPage, getLabelForPath } from '@/lib/recent-pages';
import AnnouncementBanner from '@/components/features/AnnouncementBanner';
import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';
import { headers } from 'next/headers';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();

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

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  return (
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
  );
}
