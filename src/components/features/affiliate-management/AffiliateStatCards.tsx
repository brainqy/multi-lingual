
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, BarChart3, UserCheck, DollarSign } from "lucide-react";
import { useI18n } from "@/hooks/use-i18n";

interface AffiliateStats {
  totalAffiliates: number;
  totalClicks: number;
  totalSignups: number;
  totalCommissionsPaid: number;
}

interface AffiliateStatCardsProps {
  stats: AffiliateStats;
}

export default function AffiliateStatCards({ stats }: AffiliateStatCardsProps) {
  const { t } = useI18n();
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t("affiliateManagement.stats.totalAffiliates")}</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalAffiliates}</div>
        </CardContent>
      </Card>
      <Card className="shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t("affiliateManagement.stats.totalClicks")}</CardTitle>
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalClicks}</div>
        </CardContent>
      </Card>
      <Card className="shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t("affiliateManagement.stats.totalSignups")}</CardTitle>
          <UserCheck className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalSignups}</div>
        </CardContent>
      </Card>
      <Card className="shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t("affiliateManagement.stats.totalCommissionsPaid")}</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${stats.totalCommissionsPaid.toFixed(2)}</div>
        </CardContent>
      </Card>
    </div>
  );
}
