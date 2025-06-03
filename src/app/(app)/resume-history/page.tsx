// src/app/(app)/resume-history/page.tsx
'use client';
import { useI18n } from "@/hooks/use-i18n";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { History, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function ResumeHistoryPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
        <History className="h-8 w-8" /> Resume Scan History
      </h1>
      <CardDescription>
        View a detailed log of all your past resume scans and analyses on the Resume Analyzer page.
      </CardDescription>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Scan Log Access</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-12">
          <p className="text-muted-foreground mb-6">
            Your resume scan history, including match scores and bookmarked items, is now available directly within the Resume Analyzer page.
          </p>
          <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <Link href="/resume-analyzer">
              Go to Resume Analyzer <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}