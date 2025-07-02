
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
  const siteUrl = "https://resumematch.ai"; // Ideally, this would come from an environment variable
  const referralLink = `${siteUrl}/signup?ref=${user.referralCode || 'DEFAULT123'}`;
  const shareText = `Check out ${t("appName", { default: "ResumeMatch AI" })}! It's a great platform for career development. Join me here: ${referralLink}`;

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(referralLink).then(() => {
      toast({ title: t("spreadTheWord.toast.copied.title", { default: "Link Copied!" }), description: t("spreadTheWord.toast.copied.description", { default: "Your unique referral link is ready to share." }) });
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
      url = `https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodeURIComponent(`Join me on ${t("appName", { default: "ResumeMatch AI" })}`)}&summary=${encodedText}`;
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
          <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="mr-2 h-4 w-4 text-green-500" fill="currentColor">
            <title>WhatsApp</title>
            <path d="M17.472 14.382c-.297-.149-.88-.436-1.017-.487-.137-.05-.274-.074-.412.074-.138.149-.524.638-.642.766-.118.128-.236.149-.412.05-.176-.1-1.057-.39-2.012-1.23-.742-.656-1.227-1.46-1.383-1.712-.156-.252-.023-.39.1-.518.11-.118.236-.306.354-.455.118-.149.168-.252.246-.42.078-.168.038-.315-.023-.42-.06-.105-.412-1-1.6-2.207-.524-1.2-.838-1.033-.964-1.053-.126-.02-.274-.02-.412-.02-.138 0-.362.05-.55.274-.188.225-.712.695-.712 1.705 0 1.01.73 1.97 1.414 2.642.684.672 1.397 1.227 2.292 1.693.896.466 1.733.722 2.604.964.87.242 1.63.187 2.25.113.62-.075 1.785-.73 2.04-1.442.252-.712.252-1.31.188-1.442-.063-.13-.202-.202-.412-.322z"/>
          </svg>
          WhatsApp
        </Button>
        <Button variant="outline" size="sm" onClick={handleCopyToClipboard} className="flex-1 min-w-[100px]">
          <Copy className="mr-2 h-4 w-4" /> Copy Link
        </Button>
      </CardFooter>
    </Card>
  );
}
