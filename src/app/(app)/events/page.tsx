
"use client";
import { useI18n } from "@/hooks/use-i18n";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarCheck2, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function EventsPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
        <CalendarCheck2 className="h-8 w-8" /> Events
      </h1>
      <CardDescription>
        Event registration and listings are now integrated into the Community Feed.
      </CardDescription>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Event Information</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-12">
          <p className="text-muted-foreground mb-6">
            To discover and register for events, please visit the Community Feed.
          </p>
          <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <Link href="/community-feed">
              Go to Community Feed <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
