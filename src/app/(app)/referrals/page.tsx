
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
  const { toast } = useToast();
  const user = sampleUserProfile;
  const referralLink = `https://resumematch.ai/signup?ref=${user.referralCode || 'DEFAULT123'}`;
  const referralHistory = sampleReferralHistory.filter(r => r.referrerUserId === user.id); // Filter for current user

  // Mock referral stats derived from history
  const referralsCount = referralHistory.length;
  const successfulReferrals = referralHistory.filter(r => r.status === 'Reward Earned' || r.status === 'Signed Up').length;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({ title: "Copied to Clipboard", description: "Referral code/link copied!" });
    }).catch(err => {
      toast({ title: "Copy Failed", description: "Could not copy text.", variant: "destructive" });
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
      // Fallback for browsers that don't support navigator.share
      copyToClipboard(referralLink);
      toast({ title: "Link Copied", description: "Share API not supported. Referral link copied to clipboard instead." });
    }
  };

  const getStatusIcon = (status: ReferralStatus) => {
    switch (status) {
      case 'Signed Up': return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case 'Reward Earned': return <Star className="h-4 w-4 text-yellow-500 fill-yellow-400" />;
      case 'Pending': return <Clock className="h-4 w-4 text-gray-500" />;
      case 'Expired': return <AlertCircle className="h-4 w-4 text-red-500" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto"> {/* Increased max-width */}
      <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
        <Gift className="h-8 w-8" /> Referrals
      </h1>
      <CardDescription>Share ResumeMatch AI with your network and earn rewards!</CardDescription>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Your Referral Code & Link</CardTitle>
          <CardDescription>Share this code or link with friends and colleagues.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="referral-code">Referral Code</Label>
            <div className="flex items-center space-x-2">
              <Input id="referral-code" value={user.referralCode || 'DEFAULT123'} readOnly className="font-mono"/>
              <Button variant="outline" size="icon" onClick={() => copyToClipboard(user.referralCode || 'DEFAULT123')}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div>
            <Label htmlFor="referral-link">Referral Link</Label>
            <div className="flex items-center space-x-2">
              <Input id="referral-link" value={referralLink} readOnly />
              <Button variant="outline" size="icon" onClick={() => copyToClipboard(referralLink)}>
                <LinkIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
         <CardFooter className="flex justify-end">
             <Button onClick={handleShare} className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Share2 className="mr-2 h-4 w-4" /> Share Now
            </Button>
        </CardFooter>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Referral Statistics</CardTitle>
          <CardDescription>Track the success of your referrals.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center">
            <div className="p-4 border rounded-lg">
                <Users className="h-8 w-8 text-primary mx-auto mb-2"/>
                <p className="text-2xl font-bold">{referralsCount}</p>
                <p className="text-sm text-muted-foreground">Total Referrals Sent</p>
            </div>
             <div className="p-4 border rounded-lg">
                <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2"/>
                <p className="text-2xl font-bold">{successfulReferrals}</p>
                <p className="text-sm text-muted-foreground">Successful Signups</p>
            </div>
        </CardContent>
         <CardFooter>
             <p className="text-xs text-muted-foreground">Rewards are typically credited once a referred user completes their profile setup.</p>
         </CardFooter>
      </Card>

       {/* Referral History Table */}
       <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Referral History</CardTitle>
          <CardDescription>Details of users you have referred.</CardDescription>
        </CardHeader>
        <CardContent>
          {referralHistory.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">You haven't referred anyone yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Referred User</TableHead>
                  <TableHead>Date Referred</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Reward</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {referralHistory.map((referral) => (
                  <TableRow key={referral.id}>
                    <TableCell className="font-medium">{referral.referredEmailOrName}</TableCell>
                    <TableCell>{format(new Date(referral.referralDate), 'PP')}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-1">
                        {getStatusIcon(referral.status)}
                        {referral.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      {referral.rewardAmount ? `${referral.rewardAmount} Coins/XP` : '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>


       <Card className="shadow-lg bg-primary/10 border-primary/30">
            <CardHeader>
                <CardTitle>How Referrals Work</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-foreground/80">
                <p>1. Share your unique referral code or link.</p>
                <p>2. Your friend signs up using your code/link.</p>
                <p>3. Once they complete key actions (like profile setup or first analysis), you both might receive rewards (e.g., bonus XP or coins)!</p>
                <p>4. Track your referral success here.</p>
            </CardContent>
        </Card>

    </div>
  );
}
