
"use client";
import { useI18n } from "@/hooks/use-i18n";
import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Gift, Copy, Share2, Users, CheckCircle, LinkIcon, Clock, AlertCircle, Star, UserPlus, Award, DollarSign, Loader2 } from "lucide-react"; 
import { useToast } from "@/hooks/use-toast";
import type { ReferralHistoryItem, ReferralStatus } from "@/types"; 
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"; 
import { format } from "date-fns"; 
import { useAuth } from "@/hooks/use-auth";
import { getReferralHistory } from "@/lib/actions/referrals";
import { useSettings } from "@/contexts/settings-provider";
import AccessDeniedMessage from "@/components/ui/AccessDeniedMessage";

export default function ReferralsPage() {
  const { t } = useI18n();
  const { toast } = useToast();
  const { user, isLoading } = useAuth();
  const { settings } = useSettings();
  const [referralHistory, setReferralHistory] = useState<ReferralHistoryItem[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [baseUrl, setBaseUrl] = useState('');

  useEffect(() => {
    // Ensure this runs only on the client-side where window is available
    if (typeof window !== 'undefined') {
      setBaseUrl(window.location.origin);
    }

    async function loadHistory() {
      if (!user) return;
      setIsDataLoading(true);
      const history = await getReferralHistory(user.id);
      setReferralHistory(history);
      setIsDataLoading(false);
    }
    if (settings?.referralsEnabled) {
      loadHistory();
    } else {
      setIsDataLoading(false);
    }
  }, [user, settings]);
  
  const referralsCount = referralHistory.length;
  const successfulReferrals = referralHistory.filter(r => r.status === 'Reward Earned' || r.status === 'Signed Up').length;

  if (!settings?.referralsEnabled) {
    return <AccessDeniedMessage title={t("referrals.featureDisabled.title")} message={t("referrals.featureDisabled.message")} />;
  }

  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  const referralLink = `${baseUrl}/auth/signup?ref=${user.referralCode || 'DEFAULT123'}`;

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
        title: t("referrals.share.title"),
        text: t("referrals.share.text", { code: user.referralCode || 'DEFAULT123', referralLink }),
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

  const referralSteps = [
    {
      icon: <Share2 className="h-8 w-8 text-primary" />,
      title: t("referrals.howItWorks.0.title"),
      description: t("referrals.howItWorks.0.description")
    },
    {
      icon: <UserPlus className="h-8 w-8 text-primary" />,
      title: t("referrals.howItWorks.1.title"),
      description: t("referrals.howItWorks.1.description")
    },
    {
      icon: <Award className="h-8 w-8 text-primary" />,
      title: t("referrals.howItWorks.2.title"),
      description: t("referrals.howItWorks.2.description")
    },
    {
      icon: <DollarSign className="h-8 w-8 text-primary" />,
      title: t("referrals.howItWorks.3.title"),
      description: t("referrals.howItWorks.3.description")
    }
  ];

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
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <Input id="referral-code" value={user.referralCode || 'DEFAULT123'} readOnly className="font-mono flex-grow"/>
              <Button variant="outline" title={t("referrals.copyButton")} onClick={() => copyToClipboard(user.referralCode || 'DEFAULT123')} className="shrink-0">
                <Copy className="h-4 w-4" />
                <span className="ml-2 sm:hidden">{t("referrals.copyCodeButton")}</span>
              </Button>
            </div>
          </div>
          <div>
            <Label htmlFor="referral-link">{t("referrals.referralLinkLabel")}</Label>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <Input id="referral-link" value={referralLink} readOnly className="flex-grow"/>
              <Button variant="outline" title={t("referrals.copyButton")} onClick={() => copyToClipboard(referralLink)} className="shrink-0">
                <LinkIcon className="h-4 w-4" />
                <span className="ml-2 sm:hidden">{t("referrals.copyLinkButton")}</span>
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
          {isDataLoading ? (
            <div className="flex justify-center items-center h-24">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : referralHistory.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">{t("referrals.noHistory")}</p>
          ) : (
            <>
              {/* Mobile View: List of Cards */}
              <div className="md:hidden space-y-3">
                {referralHistory.map((referral) => {
                  const statusInfo = getStatusIconAndLabel(referral.status);
                  return (
                    <Card key={referral.id} className="p-4 bg-secondary/50">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-medium text-foreground">{referral.referredEmailOrName}</p>
                          <p className="text-xs text-muted-foreground">{format(new Date(referral.referralDate), 'PP')}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{referral.rewardAmount ? `${referral.rewardAmount} Coins/XP` : '-'}</p>
                          <p className="text-xs text-muted-foreground">{t("referrals.tableReward")}</p>
                        </div>
                      </div>
                      <div className="mt-2 pt-2 border-t text-sm">
                        <span className="inline-flex items-center gap-1.5 font-medium">
                          {statusInfo.icon}
                          {statusInfo.label}
                        </span>
                      </div>
                    </Card>
                  );
                })}
              </div>
              
              {/* Desktop View: Table */}
              <div className="hidden md:block">
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
              </div>
            </>
          )}
        </CardContent>
      </Card>

       <Card className="shadow-lg bg-primary/10 border-primary/30">
            <CardHeader>
                <CardTitle>{t("referrals.howItWorksCardTitle")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
                {referralSteps.map((step, index) => (
                    <div key={index} className="flex flex-col items-center p-4">
                        <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary/20 mb-3">
                            {step.icon}
                        </div>
                        <h3 className="font-semibold text-md text-foreground">{step.title}</h3>
                        <p className="text-xs text-muted-foreground mt-1">{step.description}</p>
                    </div>
                ))}
              </div>
            </CardContent>
        </Card>
    </div>
  );
}
