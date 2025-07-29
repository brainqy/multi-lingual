
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

// This page now redirects to the correct location to resolve the Next.js routing conflict.
export default function RedirectCreateBlogPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/blog/create');
  }, [router]);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="ml-2 text-muted-foreground">Redirecting...</p>
    </div>
  );
}
