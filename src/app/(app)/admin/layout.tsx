
'use client';

import type React from 'react';
import { useAuth } from '@/hooks/use-auth';
import AccessDeniedMessage from '@/components/ui/AccessDeniedMessage';
import { Loader2 } from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-200px)] items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (user?.role !== 'admin') {
    return <AccessDeniedMessage />;
  }

  return <>{children}</>;
}
