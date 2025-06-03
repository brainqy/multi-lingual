
"use client";

import type React from 'react';
import { ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useI18n } from '@/hooks/use-i18n';

interface AccessDeniedMessageProps {
  title?: string;
  message?: string;
  dashboardPath?: string;
}

export default function AccessDeniedMessage({
  title,
  message,
  dashboardPath = "/dashboard"
}: AccessDeniedMessageProps) {
  const { t } = useI18n();

  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] text-center p-6">
      <ShieldAlert className="w-16 h-16 text-destructive mb-4" />
      <h1 className="text-2xl font-bold text-foreground mb-2">{title || t("accessDenied.title")}</h1>
      <p className="text-muted-foreground">{message || t("accessDenied.message")}</p>
      <Button asChild className="mt-6 bg-primary hover:bg-primary/90 text-primary-foreground">
        <Link href={dashboardPath}>{t("accessDenied.dashboardButton")}</Link>
      </Button>
    </div>
  );
}

    