
"use client";
import { useI18n } from "@/hooks/use-i18n";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ListChecks } from "lucide-react";
import Link from 'next/link';
import { Button } from "@/components/ui/button";

// This page serves as a root for /live-interview but is not meant to be visited directly.
// It can redirect or show a list of active interviews.
export default function LiveInterviewRootPage() {
  const { t } = useI18n();

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
        <ListChecks className="h-8 w-8" /> Live Interviews
      </h1>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Interview Sessions</CardTitle>
          <CardDescription>
            This is the root page for live interviews. Sessions are accessed via specific links.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            If you have an interview link, please use it directly. Otherwise, you can schedule a new interview from the Interview Prep Hub.
          </p>
          <Button asChild className="mt-4">
            <Link href="/interview-prep">Go to Interview Prep Hub</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
