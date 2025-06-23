
'use client';

import type React from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { AppHeader } from '@/components/layout/AppHeader';
import FloatingMessenger from '@/components/features/FloatingMessenger';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { addRecentPage, getLabelForPath } from '@/lib/recent-pages';
import AnnouncementBanner from '@/components/features/AnnouncementBanner';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname) {
      // For recent pages, the path from usePathname() will not have locale if i18n is removed
      const label = getLabelForPath(pathname);
      addRecentPage(pathname, label);
    }
  }, [pathname]);

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
