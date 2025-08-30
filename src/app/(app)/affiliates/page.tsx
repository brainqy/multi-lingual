
"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Target, Copy, Share2, Users, CheckCircle, LinkIcon, DollarSign, BarChart3, CalendarDays, Gift, ThumbsUp, Info, UserPlus, Award, Loader2, Clock, Hourglass, XCircle } from "lucide-react";
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
    if (!user) return;
    const firstTier = commissionTiers.sort((a,b) => a.milestoneRequirement - b.milestoneRequirement)[0];
    if (!firstTier) {
        toast({title: "Error", description: "Affiliate program not configured correctly.", variant: "destructive"});
        return;
    }
    
    const created = await createAffiliate({
        userId: user.id,
        name: user.name,
        email: user.email,
        status: 'pending' as AffiliateStatus,
        affiliateCode: `${user.name.substring(0,4).toUpperCase()}${user.id.slice(-4)}`,
        commissionRate: firstTier.commissionRate,
        commissionTierId: firstTier.id
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

  const renderContent = () => {
    if (!userAffiliateProfile) {
      return (
        <Card className="shadow-lg text-center">
          <CardHeader>
            <CardTitle>Become an Affiliate Partner</CardTitle>
            <CardDescription>Join our affiliate program to earn rewards by sharing JobMatch AI.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Click the button below to submit your application. It will be reviewed by our team.</p>
            <Button onClick={handleBecomeAffiliate}>Apply to Become an Affiliate</Button>
          </CardContent>
        </Card>
      );
    }

    if (userAffiliateProfile.status === 'pending') {
      return (
        <Card className="shadow-lg text-center">
          <CardHeader>
            <Hourglass className="h-12 w-12 text-yellow-500 mx-auto mb-3" />
            <CardTitle>Application Pending</CardTitle>
            <CardDescription>Your affiliate application is currently under review. We'll notify you once a decision is made.</CardDescription>
          </CardHeader>
        </Card>
      );
    }
    
    if (userAffiliateProfile.status === 'rejected') {
      return (
        <Card className="shadow-lg text-center">
          <CardHeader>
            <XCircle className="h-12 w-12 text-destructive mx-auto mb-3" />
            <CardTitle>Application Status</CardTitle>
            <CardDescription>We regret to inform you that your affiliate application was not approved at this time. For more details, please contact support.</CardDescription>
          </CardHeader>
        </Card>
      );
    }

    // Approved affiliate view
    return (
      <>
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>{t("affiliates.yourDetails")}</CardTitle>
            <CardDescription>{t("affiliates.detailsDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <div>
              <Label htmlFor="affiliate-code">{t("affiliates.codeLabel")}</Label>
              <div className="flex gap-2">
                <Input id="affiliate-code" value={userAffiliateProfile.affiliateCode} readOnly />
                <Button variant="outline" onClick={() => copyToClipboard(userAffiliateProfile.affiliateCode)}><Copy className="h-4 w-4"/></Button>
              </div>
            </div>
            <div>
              <Label htmlFor="affiliate-link">{t("affiliates.linkLabel")}</Label>
              <div className="flex gap-2">
                <Input id="affiliate-link" value={affiliateLink} readOnly />
                <Button variant="outline" onClick={() => copyToClipboard(affiliateLink)}><LinkIcon className="h-4 w-4"/></Button>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">Your current commission rate: <strong className="text-primary">{(userAffiliateProfile.commissionRate * 100).toFixed(0)}%</strong> ({userAffiliateProfile.commissionTier?.name || 'Standard'})</p>
          </CardContent>
        </Card>
        
        {nextTier && (
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

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>{t("affiliates.performance")}</CardTitle>
            <div className="flex justify-between items-center">
              <CardDescription>{t("affiliates.performanceDesc")}</CardDescription>
              <Tabs defaultValue="all" onValueChange={(v) => setDurationFilter(v as any)}>
                <TabsList>
                  <TabsTrigger value="7d">7d</TabsTrigger>
                  <TabsTrigger value="30d">30d</TabsTrigger>
                  <TabsTrigger value="all">All Time</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg text-center"><BarChart3 className="h-6 w-6 text-primary mx-auto mb-2"/><p className="text-2xl font-bold">{filteredStats.clicks}</p><p className="text-sm text-muted-foreground">{t("affiliates.totalClicks")}</p></div>
            <div className="p-4 border rounded-lg text-center"><Users className="h-6 w-6 text-primary mx-auto mb-2"/><p className="text-2xl font-bold">{filteredStats.signups}</p><p className="text-sm text-muted-foreground">{t("affiliates.successfulSignups")}</p></div>
            <div className="p-4 border rounded-lg text-center"><DollarSign className="h-6 w-6 text-primary mx-auto mb-2"/><p className="text-2xl font-bold">${filteredStats.earned.toFixed(2)}</p><p className="text-sm text-muted-foreground">{t("affiliates.totalEarned")}</p></div>
          </CardContent>
        </Card>
        
        <Card className="shadow-lg">
          <CardHeader><CardTitle>{t("affiliates.recentSignups")}</CardTitle></CardHeader>
          <CardContent>
            {userSignups.length === 0 ? <p className="text-muted-foreground text-center">{t("affiliates.noSignups")}</p> : (
              <Table>
                <TableHeader>
                  <TableRow><TableHead>{t("affiliates.userIdMasked")}</TableHead><TableHead>{t("affiliates.signupDate")}</TableHead><TableHead className="text-right">{t("affiliates.commissionEarned")}</TableHead></TableRow>
                </TableHeader>
                <TableBody>
                  {userSignups.slice(0, 5).map(signup => (
                    <TableRow key={signup.id}><TableCell>{t("affiliates.userMasked", { last4: signup.newUserId.slice(-4) })}</TableCell><TableCell>{format(parseISO(signup.signupDate), "PPP")}</TableCell><TableCell className="text-right">${(signup.commissionEarned || 0).toFixed(2)}</TableCell></TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </>
    );
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
        <Target className="h-8 w-8" /> {t("affiliates.title")}
      </h1>
      <CardDescription>{t("affiliates.pageDescription")}</CardDescription>
      
      {renderContent()}

      <Card className="shadow-lg bg-primary/10 border-primary/30">
        <CardHeader>
            <CardTitle>{t("affiliates.howItWorksCardTitle")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            {affiliateSteps.map((step, index) => (
                <div key={index} className="flex flex-col items-center p-4">
                    <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary/20 mb-3">{step.icon}</div>
                    <h3 className="font-semibold text-md text-foreground">{t(step.titleKey as any)}</h3>
                </div>
            ))}
          </div>
        </CardContent>
    </Card>

    </div>
  );
}
