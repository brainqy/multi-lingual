
"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Target, Copy, Share2, Users, CheckCircle, LinkIcon, DollarSign, BarChart3, CalendarDays, Gift, ThumbsUp, Info, UserPlus, Award, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Affiliate, AffiliateClick, AffiliateSignup, AffiliateStatus, CommissionTier } from "@/types";
import { format, subDays, isAfter, parseISO } from "date-fns";
import Link from "next/link";
import { useI18n } from "@/hooks/use-i18n";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getAffiliateByUserId, createAffiliate, getAffiliateSignups, getAffiliateClicks, getCommissionTiers } from "@/lib/actions/affiliates";
import { useAuth } from "@/hooks/use-auth";
import { useSettings } from "@/contexts/settings-provider";
import AccessDeniedMessage from "@/components/ui/AccessDeniedMessage";
import { Progress } from "@/components/ui/progress";


export default function AffiliatesPage() {
  const { toast } = useToast();
  const { t } = useI18n();
  const { user } = useAuth();
  const { settings } = useSettings();
  const [userAffiliateProfile, setUserAffiliateProfile] = useState<Affiliate | null>(null);
  const [commissionTiers, setCommissionTiers] = useState<CommissionTier[]>([]);
  const [userSignups, setUserSignups] = useState<AffiliateSignup[]>([]);
  const [userClicks, setUserClicks] = useState<AffiliateClick[]>([]);
  const [durationFilter, setDurationFilter] = useState<'7d' | '30d' | 'all'>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchAffiliateData() {
      if (!user) return;
      setIsLoading(true);
      const [affiliateData, tiers] = await Promise.all([
        getAffiliateByUserId(user.id),
        getCommissionTiers(),
      ]);
      setUserAffiliateProfile(affiliateData);
      setCommissionTiers(tiers);

      if (affiliateData) {
        const [signups, clicks] = await Promise.all([
          getAffiliateSignups(affiliateData.id),
          getAffiliateClicks(affiliateData.id),
        ]);
        setUserSignups(signups);
        setUserClicks(clicks);
      }
      setIsLoading(false);
    }
    if (settings?.affiliateProgramEnabled) {
      fetchAffiliateData();
    } else {
      setIsLoading(false);
    }
  }, [user, settings]);

  const affiliateLink = userAffiliateProfile ? `https://JobMatch.ai/join?aff=${userAffiliateProfile.affiliateCode}` : '';

  const filteredStats = useMemo(() => {
    const now = new Date();
    let startDate: Date | null = null;
    if (durationFilter === '7d') startDate = subDays(now, 7);
    else if (durationFilter === '30d') startDate = subDays(now, 30);

    const clicksInPeriod = startDate ? userClicks.filter(c => isAfter(parseISO(c.timestamp), startDate!)) : userClicks;
    const signupsInPeriod = startDate ? userSignups.filter(s => isAfter(parseISO(s.signupDate), startDate!)) : userSignups;
    const earnedInPeriod = signupsInPeriod.reduce((sum, signup) => sum + (signup.commissionEarned || 0), 0);

    return { clicks: clicksInPeriod.length, signups: signupsInPeriod.length, earned: earnedInPeriod };
  }, [durationFilter, userClicks, userSignups]);

  const nextTier = useMemo(() => {
    if (!userAffiliateProfile || commissionTiers.length === 0) return null;
    const currentTierIndex = commissionTiers.findIndex(t => t.id === userAffiliateProfile.commissionTierId);
    return commissionTiers[currentTierIndex + 1] || null;
  }, [userAffiliateProfile, commissionTiers]);

  const progressToNextTier = useMemo(() => {
    if (!nextTier) return 0;
    const currentSignups = userSignups.length;
    return (currentSignups / nextTier.milestoneRequirement) * 100;
  }, [userSignups, nextTier]);


  const affiliateSteps = [
    { icon: <Share2 className="h-8 w-8 text-primary" />, titleKey: "affiliates.howItWorks.0.title" },
    { icon: <UserPlus className="h-8 w-8 text-primary" />, titleKey: "affiliates.howItWorks.1.title" },
    { icon: <DollarSign className="h-8 w-8 text-primary" />, titleKey: "affiliates.howItWorks.2.title" },
    { icon: <Award className="h-8 w-8 text-primary" />, titleKey: "affiliates.howItWorks.3.title" }
  ];

  const copyToClipboard = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      toast({ title: "Copied to Clipboard", description: "Affiliate code/link copied!" });
    }).catch(err => {
      toast({ title: "Copy Failed", description: "Could not copy text.", variant: "destructive" });
    });
  };

  const handleBecomeAffiliate = async () => {
    if (!user || userAffiliateProfile) {
        toast({title: "Already an Affiliate", description: `Your status is: ${userAffiliateProfile?.status}`});
        return;
    }
    
    const created = await createAffiliate({
        userId: user.id,
        name: user.name,
        email: user.email,
        status: 'pending' as AffiliateStatus,
        affiliateCode: `${user.name.substring(0,4).toUpperCase()}${user.id.slice(-4)}`,
        commissionRate: 0.10, // Default 10% commission
    });

    if (created) {
        setUserAffiliateProfile(created);
        toast({ title: "Affiliate Application Submitted", description: "Your application is pending approval. You will be notified once reviewed."});
    } else {
        toast({ title: "Error", description: "Could not submit your application. Please try again.", variant: "destructive"});
    }
  };

  if (!settings?.affiliateProgramEnabled) {
    return <AccessDeniedMessage title="Feature Disabled" message="The affiliate program is currently disabled by the platform administrator." />;
  }

  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary"/></div>;
  }

  // Approved affiliate view
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
        <Target className="h-8 w-8" /> {t("affiliates.title")}
      </h1>
      <CardDescription>{t("affiliates.pageDescription")}</CardDescription>

      {userAffiliateProfile && userAffiliateProfile.status === 'approved' && nextTier && (
          <Card className="shadow-lg">
              <CardHeader>
                  <CardTitle>Next Commission Tier: {nextTier.name}</CardTitle>
                  <CardDescription>Reach {nextTier.milestoneRequirement} signups to increase your commission rate to {(nextTier.commissionRate * 100).toFixed(0)}%!</CardDescription>
              </CardHeader>
              <CardContent>
                  <Progress value={progressToNextTier} className="w-full h-3 mb-1" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{userSignups.length} Signups</span>
                      <span>{nextTier.milestoneRequirement} Goal</span>
                  </div>
              </CardContent>
          </Card>
      )}

      {/* Other components like Your Details, Performance, Recent Signups etc. */}
    </div>
  );
}
