
"use client";
import { useI18n } from "@/hooks/use-i18n";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Gift, Copy, Share2, Users, CheckCircle, LinkIcon, Clock, AlertCircle, Star } from "lucide-react"; // Added Clock, AlertCircle, Star
import { useToast } from "@/hooks/use-toast";
import { sampleUserProfile, sampleReferralHistory } from "@/lib/sample-data"; // Added sampleReferralHistory
import type { ReferralHistoryItem, ReferralStatus } from "@/types"; // Added ReferralHistoryItem, ReferralStatus
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"; // Added Table components
import { format } from "date-fns"; // Added format

export default function ReferralsPage() {
  const { t } = useI18n();
  const { toast } = useToast();
  const user = sampleUserProfile;
  const referralLink = `https://resumematch.ai/signup?ref=${user.referralCode || 'DEFAULT123'}`;
  const referralHistory = sampleReferralHistory.filter(r => r.referrerUserId === user.id); // Filter for current user

  const referralsCount = referralHistory.length;
  const successfulReferrals = referralHistory.filter(r => r.status === 'Reward Earned' || r.status === 'Signed Up').length;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({ title: t("referrals.toastCopied.title"), description: t("referrals.toastCopied.description") });
    }).catch(err => {
      toast({ title: t("referrals.toastCopyFailed.title"), description: t("referrals.toastCopyFailed.description"), variant: "destructive" });
      console.error('Failed to copy: ', err);
    });
  };

  const handleShare = () => {
     if (navigator.share) {
      navigator.share({
        title: 'Join me on ResumeMatch AI!',
        text: `Use my referral code ${user.referralCode || 'DEFAULT123'} to sign up for ResumeMatch AI!`,
        url: referralLink,
      })
      .then(() => console.log('Successful share'))
      .catch((error) => console.log('Error sharing', error));
    } else {
      copyToClipboard(referralLink);
      toast({ title: t("referrals.toastShareAPINotSupported.title"), description: t("referrals.toastShareAPINotSupported.description") });
    }
  };

  const getStatusIconAndLabel = (status: ReferralStatus) => {
    switch (status) {
      case 'Signed Up': return { icon: <CheckCircle className="h-4 w-4 text-blue-500" />, label: t("referrals.statusSignedUp") };
      case 'Reward Earned': return { icon: <Star className="h-4 w-4 text-yellow-500 fill-yellow-400" />, label: t("referrals.statusRewardEarned") };
      case 'Pending': return { icon: <Clock className="h-4 w-4 text-gray-500" />, label: t("referrals.statusPending") };
      case 'Expired': return { icon: <AlertCircle className="h-4 w-4 text-red-500" />, label: t("referrals.statusExpired") };
      default: return { icon: null, label: status };
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
        <Gift className="h-8 w-8" /> {t("referrals.pageTitle")}
      </h1>
      <CardDescription>{t("referrals.pageDescription")}</CardDescription>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>{t("referrals.yourReferralCardTitle")}</CardTitle>
          <CardDescription>{t("referrals.yourReferralCardDescription")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="referral-code">{t("referrals.referralCodeLabel")}</Label>
            <div className="flex items-center space-x-2">
              <Input id="referral-code" value={user.referralCode || 'DEFAULT123'} readOnly className="font-mono"/>
              <Button variant="outline" size="icon" title={t("referrals.copyButton")} onClick={() => copyToClipboard(user.referralCode || 'DEFAULT123')}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div>
            <Label htmlFor="referral-link">{t("referrals.referralLinkLabel")}</Label>
            <div className="flex items-center space-x-2">
              <Input id="referral-link" value={referralLink} readOnly />
              <Button variant="outline" size="icon" title={t("referrals.copyButton")} onClick={() => copyToClipboard(referralLink)}>
                <LinkIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
         <CardFooter className="flex justify-end">
             <Button onClick={handleShare} className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Share2 className="mr-2 h-4 w-4" /> {t("referrals.shareButton")}
            </Button>
        </CardFooter>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>{t("referrals.statsCardTitle")}</CardTitle>
          <CardDescription>{t("referrals.statsCardDescription")}</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center">
            <div className="p-4 border rounded-lg">
                <Users className="h-8 w-8 text-primary mx-auto mb-2"/>
                <p className="text-2xl font-bold">{referralsCount}</p>
                <p className="text-sm text-muted-foreground">{t("referrals.totalReferralsLabel")}</p>
            </div>
             <div className="p-4 border rounded-lg">
                <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2"/>
                <p className="text-2xl font-bold">{successfulReferrals}</p>
                <p className="text-sm text-muted-foreground">{t("referrals.successfulSignupsLabel")}</p>
            </div>
        </CardContent>
         <CardFooter>
             <p className="text-xs text-muted-foreground">{t("referrals.rewardsInfo")}</p>
         </CardFooter>
      </Card>

       <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>{t("referrals.historyCardTitle")}</CardTitle>
          <CardDescription>{t("referrals.historyCardDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          {referralHistory.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">{t("referrals.noHistory")}</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("referrals.tableReferredUser")}</TableHead>
                  <TableHead>{t("referrals.tableDateReferred")}</TableHead>
                  <TableHead>{t("referrals.tableStatus")}</TableHead>
                  <TableHead className="text-right">{t("referrals.tableReward")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {referralHistory.map((referral) => {
                  const statusInfo = getStatusIconAndLabel(referral.status);
                  return (
                    <TableRow key={referral.id}>
                      <TableCell className="font-medium">{referral.referredEmailOrName}</TableCell>
                      <TableCell>{format(new Date(referral.referralDate), 'PP')}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1">
                          {statusInfo.icon}
                          {statusInfo.label}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        {referral.rewardAmount ? `${referral.rewardAmount} Coins/XP` : '-'}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

       <Card className="shadow-lg bg-primary/10 border-primary/30">
            <CardHeader>
                <CardTitle>{t("referrals.howItWorksCardTitle")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-foreground/80">
                <p>{t("referrals.howItWorksStep1")}</p>
                <p>{t("referrals.howItWorksStep2")}</p>
                <p>{t("referrals.howItWorksStep3")}</p>
                <p>{t("referrals.howItWorksStep4")}</p>
            </CardContent>
        </Card>
    </div>
  );
}
