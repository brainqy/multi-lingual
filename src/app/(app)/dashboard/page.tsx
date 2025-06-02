
"use client";

import { MetricCard } from "@/components/dashboard/metric-card";
import { useAuth } from "@/hooks/use-auth";
import { useI18n } from "@/hooks/use-i18n";
import { BookText, Languages, Globe } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardPage() {
  const { user } = useAuth();
  const { t } = useI18n();

  // Mock data for metrics
  const metrics = {
    totalWords: 12530,
    englishWords: 5800,
    marathiWords: 3520,
    hindiWords: 3210,
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-headline font-semibold text-foreground">
        {t("dashboard.welcome", { name: user?.name || "User" })}
      </h2>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title={t("dashboard.metrics.totalWords")}
          value={metrics.totalWords.toLocaleString()}
          icon={BookText}
          description="Across all languages"
        />
        <MetricCard
          title={t("dashboard.metrics.englishWords")}
          value={metrics.englishWords.toLocaleString()}
          icon={Languages}
          description={t("languages.en")}
        />
        <MetricCard
          title={t("dashboard.metrics.marathiWords")}
          value={metrics.marathiWords.toLocaleString()}
          icon={Languages}
          description={t("languages.mr")}
        />
        <MetricCard
          title={t("dashboard.metrics.hindiWords")}
          value={metrics.hindiWords.toLocaleString()}
          icon={Languages}
          description={t("languages.hi")}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline text-xl">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">No recent activity to display.</p>
            {/* Placeholder for recent activity feed */}
          </CardContent>
        </Card>
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline text-xl">Language Overview</CardTitle>
          </CardHeader>
          <CardContent>
             <p className="text-muted-foreground">Chart placeholder for language distribution.</p>
            {/* Placeholder for a chart, e.g., pie chart of word distribution */}
            <div className="h-60 w-full bg-muted rounded-md flex items-center justify-center" data-ai-hint="chart graph">
              <Globe className="h-16 w-16 text-muted-foreground/50" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
