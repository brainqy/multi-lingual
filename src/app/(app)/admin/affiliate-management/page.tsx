
"use client";

import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Target } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Affiliate, AffiliateStatus } from "@/types";
import { sampleAffiliates, sampleAffiliateClicks, sampleAffiliateSignups, sampleUserProfile } from "@/lib/sample-data";
import AccessDeniedMessage from "@/components/ui/AccessDeniedMessage";
import AffiliateStatCards from "@/components/features/affiliate-management/AffiliateStatCards";
import AffiliateTable from "@/components/features/affiliate-management/AffiliateTable";

export default function AffiliateManagementPage() {
  const [affiliates, setAffiliates] = useState<Affiliate[]>(sampleAffiliates);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const currentUser = sampleUserProfile;

  useEffect(() => {
    setAffiliates(sampleAffiliates);
  }, []);

  if (currentUser.role !== 'admin') {
    return <AccessDeniedMessage />;
  }

  const handleAffiliateStatusChange = (affiliateId: string, newStatus: AffiliateStatus) => {
    setAffiliates(prev =>
      prev.map(aff =>
        aff.id === affiliateId ? { ...aff, status: newStatus } : aff
      )
    );
    const globalIndex = sampleAffiliates.findIndex(a => a.id === affiliateId);
    if(globalIndex !== -1) sampleAffiliates[globalIndex].status = newStatus;
    
    const affiliate = affiliates.find(a => a.id === affiliateId);
    toast({
      title: `Affiliate ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}`,
      description: `Affiliate ${affiliate?.name || affiliateId} has been ${newStatus}.`,
    });
  };

  const filteredAffiliates = useMemo(() => {
    return affiliates.filter(affiliate =>
      affiliate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      affiliate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      affiliate.affiliateCode.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [affiliates, searchTerm]);

  const affiliateStats = useMemo(() => {
    const totalAffiliates = affiliates.length;
    const totalClicks = sampleAffiliateClicks.length;
    const totalSignups = sampleAffiliateSignups.length;
    const totalCommissionsPaid = sampleAffiliateSignups.reduce((sum, signup) => sum + (signup.commissionEarned || 0), 0);
    return { totalAffiliates, totalClicks, totalSignups, totalCommissionsPaid };
  }, [affiliates]);

  const getAffiliateSignupsCount = (affiliateId: string) => {
    return sampleAffiliateSignups.filter(s => s.affiliateId === affiliateId).length;
  };

  const getAffiliateEarnedAmount = (affiliateId: string) => {
    return sampleAffiliateSignups
      .filter(s => s.affiliateId === affiliateId)
      .reduce((sum, signup) => sum + (signup.commissionEarned || 0), 0);
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
        <Target className="h-8 w-8" /> Affiliate Management
      </h1>
      <CardDescription>Oversee and manage affiliate partners, their performance, and applications.</CardDescription>

      <AffiliateStatCards stats={affiliateStats} />

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Affiliate List</CardTitle>
          <div className="mt-2">
            <Input
              placeholder="Search affiliates (name, email, code)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          <AffiliateTable 
            affiliates={filteredAffiliates} 
            handleAffiliateStatusChange={handleAffiliateStatusChange}
            getAffiliateSignupsCount={getAffiliateSignupsCount}
            getAffiliateEarnedAmount={getAffiliateEarnedAmount}
          />
        </CardContent>
      </Card>
    </div>
  );
}
