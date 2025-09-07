
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Linkedin, Share2, Twitter, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { UserProfile } from "@/types";
import { useI18n } from "@/hooks/use-i18n";

interface SpreadTheWordCardProps {
  user: UserProfile;
}

export default function SpreadTheWordCard({ user }: SpreadTheWordCardProps) {
  const { toast } = useToast();
  const { t } = useI18n();
  const siteUrl = "https://JobMatch.ai"; // Ideally, this would come from an environment variable
  const referralLink = `${siteUrl}/signup?ref=${user.referralCode || 'DEFAULT123'}`;
  const shareText = t("referrals.share.text", { appName: t("appName", { default: "JobMatch AI" }), referralLink });

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(referralLink).then(() => {
      toast({ title: t("spreadTheWord.toast.copied.title"), description: t("spreadTheWord.toast.copied.description") });
    }).catch(() => {
      toast({ title: "Copy Failed", variant: "destructive" });
    });
  };

  const handleSocialShare = (platform: 'twitter' | 'linkedin' | 'whatsapp') => {
    let url = '';
    const encodedText = encodeURIComponent(shareText);
    const encodedUrl = encodeURIComponent(referralLink);

    if (platform === 'twitter') {
      url = `https://twitter.com/intent/tweet?text=${encodedText}`;
    } else if (platform === 'linkedin') {
      url = `https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodeURIComponent(t("referrals.share.title"))}&summary=${encodedText}`;
    } else if (platform === 'whatsapp') {
      url = `https://wa.me/?text=${encodedText}`;
    }

    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <Card className="shadow-lg flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Share2 className="h-4 w-4 text-primary" />
          {t("spreadTheWord.title", { default: "Spread the Word!" })}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground">{t("spreadTheWord.description", { default: "Love using our platform? Share it with your friends and network, and help our community grow." })}</p>
      </CardContent>
      <CardFooter className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={() => handleSocialShare('twitter')} className="flex-1 min-w-[100px]">
          <Twitter className="mr-2 h-4 w-4 text-sky-500" /> Twitter
        </Button>
        <Button variant="outline" size="sm" onClick={() => handleSocialShare('linkedin')} className="flex-1 min-w-[100px]">
          <Linkedin className="mr-2 h-4 w-4 text-blue-600" /> LinkedIn
        </Button>
        <Button variant="outline" size="sm" onClick={() => handleSocialShare('whatsapp')} className="flex-1 min-w-[100px]">
          <img src="/images/whatsapp.png" alt="WhatsApp" className="mr-2 h-4 w-4" />
          WhatsApp
        </Button>
        <Button variant="outline" size="sm" onClick={handleCopyToClipboard} className="flex-1 min-w-[100px]">
          <Copy className="mr-2 h-4 w-4" /> Copy Link
        </Button>
      </CardFooter>
    </Card>
  );
}
