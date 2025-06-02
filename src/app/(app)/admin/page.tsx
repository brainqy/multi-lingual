
"use client";
// This page is intentionally left blank or can be used for a redirect.
// The main admin content is now in /admin/dashboard.
// The /admin path itself will be handled by src/app/(app)/admin/layout.tsx
// and potentially src/app/(app)/admin/dashboard/page.tsx if configured as an index.

// For now, this page can redirect to the admin dashboard or show a simple message.
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function AdminRootPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/dashboard');
  }, [router]);

  return (
    <div className="flex h-full flex-1 items-center justify-center bg-background p-6">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
      <p className="ml-4 text-muted-foreground">Redirecting to Admin Dashboard...</p>
    </div>
  );
}
