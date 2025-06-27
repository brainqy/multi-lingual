
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Target, Copy, Share2, Users, CheckCircle, LinkIcon, DollarSign, BarChart3, CalendarDays, Gift, ThumbsUp, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { sampleUserProfile, sampleAffiliates, sampleAffiliateClicks, sampleAffiliateSignups } from "@/lib/sample-data";
import type { Affiliate, AffiliateClick, AffiliateSignup, AffiliateStatus } from "@/types";
import { format } from "date-fns";
import Link from "next/link";
import { useI18n } from "@/hooks/use-i18n";

export default function AffiliatesPage() {
  const { toast } = useToast();
  const { t } = useI18n();
  const user = sampleUserProfile;
  const [userAffiliateProfile, setUserAffiliateProfile] = useState<Affiliate | null>(null);
  const [userSignups, setUserSignups] = useState<AffiliateSignup[]>([]);
  const [userClicks, setUserClicks] = useState<AffiliateClick[]>([]);

  useEffect(() => {
    // Find if the current user is an affiliate
    const affiliateData = sampleAffiliates.find(aff => aff.userId === user.id);
    setUserAffiliateProfile(affiliateData || null);

    if (affiliateData) {
      setUserSignups(sampleAffiliateSignups.filter(s => s.affiliateId === affiliateData.id));
      setUserClicks(sampleAffiliateClicks.filter(c => c.affiliateId === affiliateData.id));
    }
  }, [user.id]);

  const affiliateLink = userAffiliateProfile ? `https://resumematch.ai/join?aff=${userAffiliateProfile.affiliateCode}` : '';

  const totalClicks = userClicks.length;
  const totalSignups = userSignups.length;
  const totalEarned = userSignups.reduce((sum, signup) => sum + (signup.commissionEarned || 0), 0);


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
        title: 'Supercharge Your Career with ResumeMatch AI!',
        text: `Check out ResumeMatch AI and use my affiliate link: ${affiliateLink}`,
        url: affiliateLink,
      })
      .then(() => console.log('Successful share'))
      .catch((error) => console.log('Error sharing', error));
    } else {
      copyToClipboard(affiliateLink);
      toast({ title: "Link Copied", description: "Share API not supported. Affiliate link copied to clipboard instead." });
    }
  };

  const handleBecomeAffiliate = () => {
    // Mock application / joining process
    const existingAffiliate = sampleAffiliates.find(a => a.userId === user.id);
    if (existingAffiliate) {
        toast({title: "Already an Affiliate", description: `Your status is: ${existingAffiliate.status}`});
        return;
    }
    
    const newAffiliateApplication: Affiliate = {
        id: user.id,
        userId: user.id,
        name: user.name,
        email: user.email,
        status: 'pending' as AffiliateStatus,
        affiliateCode: `TEMP${Date.now().toString().slice(-5)}`, // Temp code
        commissionRate: 0.10, // Default rate
        totalEarned: 0,
        createdAt: new Date().toISOString(),
    };
    sampleAffiliates.push(newAffiliateApplication); // Add to global sample list for admin to see
    setUserAffiliateProfile(newAffiliateApplication); // Update local state for immediate UI change
    toast({ title: "Affiliate Application Submitted", description: "Your application is pending approval. You will be notified once reviewed."});
  };


  if (!userAffiliateProfile) {
    return (
        <div className="space-y-8 max-w-2xl mx-auto text-center py-10">
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="text-3xl font-bold tracking-tight text-foreground flex items-center justify-center gap-2">
                       <Gift className="h-8 w-8" /> Join Our Affiliate Program!
                    </CardTitle>
                    <CardDescription className="mt-2">Partner with ResumeMatch AI, share with your network, and earn commissions.</CardDescription>
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
        <Target className="h-8 w-8" /> {t("affiliates.title", "Affiliates Program")}
      </h1>
      <CardDescription>{t("affiliates.pageDescription", "Partner with ResumeMatch AI, share with your network, and earn commissions!")}</CardDescription>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>{t("affiliates.yourDetails", "Your Affiliate Details")}</CardTitle>
          <CardDescription>{t("affiliates.detailsDesc", "Use this code or link to promote ResumeMatch AI.")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="affiliate-code">{t("affiliates.codeLabel", "Your Unique Affiliate Code")}</Label>
            <div className="flex items-center space-x-2">
              <Input id="affiliate-code" value={userAffiliateProfile.affiliateCode} readOnly className="font-mono"/>
              <Button variant="outline" size="icon" onClick={() => copyToClipboard(userAffiliateProfile.affiliateCode)}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div>
            <Label htmlFor="affiliate-link">{t("affiliates.linkLabel", "Your Affiliate Link")}</Label>
            <div className="flex items-center space-x-2">
              <Input id="affiliate-link" value={affiliateLink} readOnly />
              <Button variant="outline" size="icon" onClick={() => copyToClipboard(affiliateLink)}>
                <LinkIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
           <p className="text-sm text-muted-foreground">
            {t("affiliates.commissionRate", "Commission Rate")}: <span className="font-semibold text-primary">{(userAffiliateProfile.commissionRate * 100).toFixed(0)}%</span>
          </p>
        </CardContent>
         <CardFooter className="flex justify-end">
             <Button onClick={handleShare} className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Share2 className="mr-2 h-4 w-4" /> {t("affiliates.shareLink", "Share Affiliate Link")}
            </Button>
        </CardFooter>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>{t("affiliates.performance", "Affiliate Performance")}</CardTitle>
          <CardDescription>{t("affiliates.performanceDesc", "Track your clicks, signups, and earnings.")}</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="p-4 border rounded-lg">
                <BarChart3 className="h-8 w-8 text-primary mx-auto mb-2"/>
                <p className="text-2xl font-bold">{totalClicks}</p>
                <p className="text-sm text-muted-foreground">{t("affiliates.totalClicks", "Total Clicks")}</p>
            </div>
             <div className="p-4 border rounded-lg">
                <Users className="h-8 w-8 text-green-600 mx-auto mb-2"/>
                <p className="text-2xl font-bold">{totalSignups}</p>
                <p className="text-sm text-muted-foreground">{t("affiliates.successfulSignups", "Successful Signups")}</p>
            </div>
            <div className="p-4 border rounded-lg">
                <DollarSign className="h-8 w-8 text-yellow-500 mx-auto mb-2"/>
                <p className="text-2xl font-bold">${totalEarned.toFixed(2)}</p>
                <p className="text-sm text-muted-foreground">{t("affiliates.totalEarned", "Total Earned")}</p>
            </div>
        </CardContent>
      </Card>

       <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>{t("affiliates.recentSignups", "Recent Signups via Your Link")}</CardTitle>
        </CardHeader>
        <CardContent>
          {userSignups.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">{t("affiliates.noSignups", "No signups through your affiliate link yet.")}</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("affiliates.userIdMasked", "User ID (Masked)")}</TableHead>
                  <TableHead>{t("affiliates.signupDate", "Signup Date")}</TableHead>
                  <TableHead className="text-right">{t("affiliates.commissionEarned", "Commission Earned")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {userSignups.map((signup) => (
                  <TableRow key={signup.id}>
                    <TableCell className="font-medium">{t("affiliates.userMasked", "User...{last4}", { last4: signup.newUserId.slice(-4) })}</TableCell>
                    <TableCell>{format(new Date(signup.signupDate), 'PP')}</TableCell>
                    <TableCell className="text-right text-green-600 font-semibold">
                      {signup.commissionEarned ? `$${signup.commissionEarned.toFixed(2)}` : t("affiliates.pending", "Pending")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
         <CardFooter>
            <p className="text-xs text-muted-foreground">{t("affiliates.commissionProcessNote", "Commissions are typically processed at the end of each month.")}</p>
         </CardFooter>
      </Card>

       <Card className="shadow-lg bg-primary/10 border-primary/30">
            <CardHeader>
                <CardTitle>{t("affiliates.howItWorks", "How the Affiliate Program Works")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-foreground/80">
                <p>{t("affiliates.step1", "1. Share your unique affiliate code or link.")}</p>
                <p>{t("affiliates.step2", "2. When someone signs up using your link and subscribes to a paid plan (if applicable), you earn a commission.")}</p>
                <p>{t("affiliates.step3", "3. Track your performance and earnings in this dashboard.")}</p>
                <p>{t("affiliates.step4", "4. Payouts are typically made monthly via [Payment Method - e.g., PayPal].")}</p>
            </CardContent>
        </Card>
    </div>
  );
}
