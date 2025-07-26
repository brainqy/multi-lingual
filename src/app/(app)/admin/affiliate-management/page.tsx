
"use client";

import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Target, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Affiliate, AffiliateStatus } from "@/types";
import AccessDeniedMessage from "@/components/ui/AccessDeniedMessage";
import AffiliateStatCards from "@/components/features/affiliate-management/AffiliateStatCards";
import AffiliateTable from "@/components/features/affiliate-management/AffiliateTable";
import { useI18n } from "@/hooks/use-i18n";
import { getAffiliates, updateAffiliateStatus, getAffiliateSignups, getAffiliateClicks } from "@/lib/actions/affiliates";
import { useAuth } from "@/hooks/use-auth";

export default function AffiliateManagementPage() {
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const { t } = useI18n();
  const { user: currentUser } = useAuth();
  const [stats, setStats] = useState({ totalAffiliates: 0, totalClicks: 0, totalSignups: 0, totalCommissionsPaid: 0 });
  const [affiliateDetails, setAffiliateDetails] = useState<Record<string, { signups: number; earned: number }>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      const allAffiliates = await getAffiliates();
      setAffiliates(allAffiliates);
      
      let totalClicks = 0;
      let totalSignups = 0;
      let totalCommissionsPaid = 0;
      const details: Record<string, { signups: number; earned: number }> = {};

      for (const aff of allAffiliates) {
        const [clicks, signups] = await Promise.all([
          getAffiliateClicks(aff.id),
          getAffiliateSignups(aff.id)
        ]);
        
        totalClicks += clicks.length;
        totalSignups += signups.length;
        const earned = signups.reduce((sum, s) => sum + (s.commissionEarned || 0), 0);
        totalCommissionsPaid += earned;
        details[aff.id] = { signups: signups.length, earned };
      }
      
      setStats({ totalAffiliates: allAffiliates.length, totalClicks, totalSignups, totalCommissionsPaid });
      setAffiliateDetails(details);
      setIsLoading(false);
    }
    
    if (currentUser?.role === 'admin') {
      loadData();
    } else {
      setIsLoading(false);
    }
  }, [currentUser?.role]);

  if (!currentUser || currentUser.role !== 'admin') {
    return <AccessDeniedMessage />;
  }

  const handleAffiliateStatusChange = async (affiliateId: string, newStatus: AffiliateStatus) => {
    const updatedAffiliate = await updateAffiliateStatus(affiliateId, newStatus);
    if (updatedAffiliate) {
      setAffiliates(prev => prev.map(aff => aff.id === affiliateId ? updatedAffiliate : aff));
      toast({
        title: t("affiliateManagement.toast.statusUpdate.title", { status: newStatus.charAt(0).toUpperCase() + newStatus.slice(1) }),
        description: t("affiliateManagement.toast.statusUpdate.description", { name: updatedAffiliate.name || affiliateId, status: newStatus }),
      });
    } else {
      toast({ title: "Error", description: "Failed to update affiliate status.", variant: "destructive" });
    }
  };

  const filteredAffiliates = useMemo(() => {
    return affiliates.filter(affiliate =>
      affiliate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      affiliate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      affiliate.affiliateCode.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [affiliates, searchTerm]);

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
        <Target className="h-8 w-8" /> {t("affiliateManagement.title")}
      </h1>
      <CardDescription>{t("affiliateManagement.description")}</CardDescription>

      <AffiliateStatCards stats={stats} />

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>{t("affiliateManagement.affiliateList")}</CardTitle>
          <div className="mt-2">
            <Input
              placeholder={t("affiliateManagement.searchPlaceholder")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-48"><Loader2 className="h-8 w-8 animate-spin text-primary"/></div>
          ) : (
            <AffiliateTable 
              affiliates={filteredAffiliates} 
              handleAffiliateStatusChange={handleAffiliateStatusChange}
              getAffiliateSignupsCount={(id) => affiliateDetails[id]?.signups || 0}
              getAffiliateEarnedAmount={(id) => affiliateDetails[id]?.earned || 0}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
