
"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Target, Copy, Share2, Users, CheckCircle, LinkIcon, DollarSign, BarChart3, CalendarDays, Gift, ThumbsUp, Info, UserPlus, Award, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Affiliate, AffiliateClick, AffiliateSignup, AffiliateStatus } from "@/types";
import { format, subDays, isAfter, parseISO } from "date-fns";
import Link from "next/link";
import { useI18n } from "@/hooks/use-i18n";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getAffiliateByUserId, createAffiliate, getAffiliateSignups, getAffiliateClicks } from "@/lib/actions/affiliates";
import { useAuth } from "@/hooks/use-auth";
import { useSettings } from "@/contexts/settings-provider";
import AccessDeniedMessage from "@/components/ui/AccessDeniedMessage";


export default function AffiliatesPage() {
  const { toast } = useToast();
  const { t } = useI18n();
  const { user } = useAuth();
  const { settings } = useSettings();
  const [userAffiliateProfile, setUserAffiliateProfile] = useState<Affiliate | null>(null);
  const [userSignups, setUserSignups] = useState<AffiliateSignup[]>([]);
  const [userClicks, setUserClicks] = useState<AffiliateClick[]>([]);
  const [durationFilter, setDurationFilter] = useState<'7d' | '30d' | 'all'>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchAffiliateData() {
      if (!user) return;
      setIsLoading(true);
      const affiliateData = await getAffiliateByUserId(user.id);
      setUserAffiliateProfile(affiliateData);

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
    if (durationFilter === '7d') {
      startDate = subDays(now, 7);
    } else if (durationFilter === '30d') {
      startDate = subDays(now, 30);
    }

    const clicksInPeriod = startDate 
      ? userClicks.filter(c => isAfter(parseISO(c.timestamp), startDate!))
      : userClicks;

    const signupsInPeriod = startDate
      ? userSignups.filter(s => isAfter(parseISO(s.signupDate), startDate!))
      : userSignups;

    const earnedInPeriod = signupsInPeriod.reduce((sum, signup) => sum + (signup.commissionEarned || 0), 0);

    return {
      clicks: clicksInPeriod.length,
      signups: signupsInPeriod.length,
      earned: earnedInPeriod,
    };
  }, [durationFilter, userClicks, userSignups]);


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
      console.error('Failed to copy: ', err);
    });
  };

  const handleShare = () => {
    if (!affiliateLink) return;
     if (navigator.share) {
      navigator.share({
        title: 'Supercharge Your Career with JobMatch AI!',
        text: `Check out JobMatch AI and use my affiliate link: ${affiliateLink}`,
        url: affiliateLink,
      })
      .then(() => console.log('Successful share'))
      .catch((error) => console.log('Error sharing', error));
    } else {
      copyToClipboard(affiliateLink);
      toast({ title: "Link Copied", description: "Share API not supported. Affiliate link copied to clipboard instead." });
    }
  };

  const handleBecomeAffiliate = async () => {
    if (!user || userAffiliateProfile) {
        toast({title: "Already an Affiliate", description: `Your status is: ${userAffiliateProfile?.status}`});
        return;
    }
    
    const newAffiliateApplication = {
        userId: user.id,
        name: user.name,
        email: user.email,
        status: 'pending' as AffiliateStatus,
        affiliateCode: `${user.name.substring(0,4).toUpperCase()}${user.id.slice(-4)}`,
        commissionRate: 0.10, // Default rate
    };
    
    const created = await createAffiliate(newAffiliateApplication as Omit<Affiliate, 'id' | 'totalEarned' | 'createdAt' | 'updatedAt'>);

    if (created) {
        setUserAffiliateProfile(created);
        toast({ title: "Affiliate Application Submitted", description: "Your application is pending approval. You will be notified once reviewed."});
    } else {
        toast({ title: "Error", description: "Could not submit your application. Please try again.", variant: "destructive"});
    }
  };
  
  const HowItWorksCard = () => (
    <Card className="shadow-lg bg-primary/10 border-primary/30">
      <CardHeader>
        <CardTitle>{t("affiliates.howItWorksCardTitle")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
          {affiliateSteps.map((step, index) => (
            <div key={index} className="flex flex-col items-center p-4">
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary/20 mb-3">
                {step.icon}
              </div>
              <h3 className="font-semibold text-md text-foreground">{t(step.titleKey as any)}</h3>
              <p className="text-xs text-muted-foreground mt-1">{t(`affiliates.howItWorks.${index}.description` as any)}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
  
  if (!settings?.affiliateProgramEnabled) {
    return <AccessDeniedMessage title="Feature Disabled" message="The affiliate program is currently disabled by the platform administrator." />;
  }

  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary"/></div>;
  }

  if (!userAffiliateProfile) {
    return (
        <div className="space-y-8 max-w-4xl mx-auto text-center py-10">
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="text-3xl font-bold tracking-tight text-foreground flex items-center justify-center gap-2">
                       <Gift className="h-8 w-8" /> Join Our Affiliate Program!
                    </CardTitle>
                    <CardDescription className="mt-2">Partner with JobMatch AI, share with your network, and earn commissions.</CardDescription>
                </CardHeader>
                <CardContent>
                     <p className="text-muted-foreground mb-6">
                        Ready to earn by promoting a tool you love? Click below to apply to our affiliate program.
                     </p>
                     <Button onClick={handleBecomeAffiliate} size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                        <ThumbsUp className="mr-2 h-5 w-5" /> Become an Affiliate
                     </Button>
                </CardContent>
            </Card>
            <HowItWorksCard />
        </div>
    );
  }

  if (userAffiliateProfile.status === 'pending') {
    return (
        <div className="space-y-8 max-w-2xl mx-auto text-center py-10">
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="text-3xl font-bold tracking-tight text-foreground flex items-center justify-center gap-2">
                       <Info className="h-8 w-8 text-yellow-500" /> Affiliate Application Pending
                    </CardTitle>
                </CardHeader>
                <CardContent>
                     <p className="text-muted-foreground">
                        Thank you for applying! Your affiliate application is currently under review. We'll notify you once it's processed.
                     </p>
                </CardContent>
            </Card>
        </div>
    );
  }

  if (userAffiliateProfile.status === 'rejected') {
     return (
        <div className="space-y-8 max-w-2xl mx-auto text-center py-10">
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="text-3xl font-bold tracking-tight text-foreground flex items-center justify-center gap-2">
                       <Info className="h-8 w-8 text-red-500" /> Affiliate Application Status
                    </CardTitle>
                </CardHeader>
                <CardContent>
                     <p className="text-muted-foreground">
                        We appreciate your interest, but unfortunately, your affiliate application was not approved at this time.
                     </p>
                     <p className="text-xs text-muted-foreground mt-2">If you have questions, please contact support.</p>
                </CardContent>
            </Card>
        </div>
    );
  }


  // User is an approved affiliate
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
        <Target className="h-8 w-8" /> {t("affiliates.title")}
      </h1>
      <CardDescription>{t("affiliates.pageDescription")}</CardDescription>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>{t("affiliates.yourDetails")}</CardTitle>
          <CardDescription>{t("affiliates.detailsDesc")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="affiliate-code">{t("affiliates.codeLabel")}</Label>
            <div className="flex items-center space-x-2">
              <Input id="affiliate-code" value={userAffiliateProfile.affiliateCode} readOnly className="font-mono"/>
              <Button variant="outline" size="icon" onClick={() => copyToClipboard(userAffiliateProfile.affiliateCode)}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div>
            <Label htmlFor="affiliate-link">{t("affiliates.linkLabel")}</Label>
            <div className="flex items-center space-x-2">
              <Input id="affiliate-link" value={affiliateLink} readOnly />
              <Button variant="outline" size="icon" onClick={() => copyToClipboard(affiliateLink)}>
                <LinkIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
           <p className="text-sm text-muted-foreground">
            {t("affiliates.commissionRate")}: <span className="font-semibold text-primary">{(userAffiliateProfile.commissionRate * 100).toFixed(0)}%</span>
          </p>
        </CardContent>
         <CardFooter className="flex justify-end">
             <Button onClick={handleShare} className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Share2 className="mr-2 h-4 w-4" /> {t("affiliates.shareLink")}
            </Button>
        </CardFooter>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
           <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                    <CardTitle>{t("affiliates.performance")}</CardTitle>
                    <CardDescription>{t("affiliates.performanceDesc")}</CardDescription>
                </div>
                <Tabs value={durationFilter} onValueChange={(value) => setDurationFilter(value as any)} className="w-full sm:w-auto">
                    <TabsList className="grid w-full grid-cols-3 sm:w-auto">
                        <TabsTrigger value="7d">Last 7d</TabsTrigger>
                        <TabsTrigger value="30d">Last 30d</TabsTrigger>
                        <TabsTrigger value="all">All Time</TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="p-4 border rounded-lg">
                <BarChart3 className="h-8 w-8 text-primary mx-auto mb-2"/>
                <p className="text-2xl font-bold">{filteredStats.clicks}</p>
                <p className="text-sm text-muted-foreground">{t("affiliates.totalClicks")}</p>
            </div>
             <div className="p-4 border rounded-lg">
                <Users className="h-8 w-8 text-green-600 mx-auto mb-2"/>
                <p className="text-2xl font-bold">{filteredStats.signups}</p>
                <p className="text-sm text-muted-foreground">{t("affiliates.successfulSignups")}</p>
            </div>
            <div className="p-4 border rounded-lg">
                <DollarSign className="h-8 w-8 text-yellow-500 mx-auto mb-2"/>
                <p className="text-2xl font-bold">${filteredStats.earned.toFixed(2)}</p>
                <p className="text-sm text-muted-foreground">{t("affiliates.totalEarned")}</p>
            </div>
        </CardContent>
      </Card>

       <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>{t("affiliates.recentSignups")}</CardTitle>
        </CardHeader>
        <CardContent>
          {userSignups.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">{t("affiliates.noSignups")}</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("affiliates.userIdMasked")}</TableHead>
                  <TableHead>{t("affiliates.signupDate")}</TableHead>
                  <TableHead className="text-right">{t("affiliates.commissionEarned")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {userSignups.map((signup) => (
                  <TableRow key={signup.id}>
                    <TableCell className="font-medium">{t("affiliates.userMasked", { last4: signup.newUserId.slice(-4) })}</TableCell>
                    <TableCell>{format(new Date(signup.signupDate), 'PP')}</TableCell>
                    <TableCell className="text-right text-green-600 font-semibold">
                      {signup.commissionEarned ? `$${signup.commissionEarned.toFixed(2)}` : t("affiliates.pending")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
         <CardFooter>
            <p className="text-xs text-muted-foreground">{t("affiliates.commissionProcessNote")}</p>
         </CardFooter>
      </Card>

      <HowItWorksCard />
    </div>
  );
}
