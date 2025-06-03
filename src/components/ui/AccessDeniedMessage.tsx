
"use client";

import type React from 'react';
import { ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface AccessDeniedMessageProps {
  title?: string;
  message?: string;
  dashboardPath?: string;
}

export default function AccessDeniedMessage({
  title = "Access Denied",
  message = "You do not have permission to view this page.",
  dashboardPath = "/dashboard"
}: AccessDeniedMessageProps) {
  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] text-center p-6">
      <ShieldAlert className="w-16 h-16 text-destructive mb-4" />
      <h1 className="text-2xl font-bold text-foreground mb-2">{title}</h1>
      <p className="text-muted-foreground">{message}</p>
      <Button asChild className="mt-6 bg-primary hover:bg-primary/90 text-primary-foreground">
        <Link href={dashboardPath}>Go to Dashboard</Link>
      </Button>
    </div>
  );
}
