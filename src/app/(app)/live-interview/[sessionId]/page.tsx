
"use client";
import { useI18n } from "@/hooks/use-i18n";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Medal, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function LeaderboardPageRedirect() {
  // This page is effectively removed and its content integrated into /gamification.
  // We can provide a redirect or just a message here.
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
        <Medal className="h-8 w-8" /> Leaderboard
      </h1>
      <CardDescription>
        The leaderboard is now part of the "Rewards & Badges" page.
      </CardDescription>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Leaderboard Information</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-12">
          <p className="text-muted-foreground mb-6">
            To view the leaderboard, please visit the "Rewards & Badges" page.
          </p>
          <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <Link href="/gamification">
              Go to Rewards & Badges <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
