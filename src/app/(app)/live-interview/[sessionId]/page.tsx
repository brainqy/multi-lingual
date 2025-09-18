
"use client";
import LiveInterviewClientView from '@/components/features/live-interview/LiveInterviewClientView';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

// This page now uses Suspense to handle the dynamic nature of the client component
export default function LiveInterviewPageWrapper() {
  return (
    <Suspense fallback={<div className="flex h-screen w-full items-center justify-center bg-background"><Loader2 className="h-16 w-16 animate-spin text-primary" /></div>}>
      <LiveInterviewClientView />
    </Suspense>
  );
}
