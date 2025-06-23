
"use client";

import { LanguageSwitcher } from "@/components/layout/language-switcher";

import { useI18n } from "@/hooks/use-i18n";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell, LogOut, UserCircle, Settings as SettingsIcon, Briefcase, Award, WalletCards, Layers3, BookOpen, Activity as ActivityIcon, Flame, Star, Coins, PanelLeft, History as HistoryIcon, Globe, Bookmark } from "lucide-react"; 
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub, 
  DropdownMenuSubTrigger, 
  DropdownMenuSubContent, 
  DropdownMenuPortal, 
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { sampleUserProfile, sampleWalletBalance } from "@/lib/sample-data";
import { useState, useEffect } from 'react'; 
import { getRecentPages } from '@/lib/recent-pages'; 
import type { RecentPageItem } from '@/types'; 
import { usePathname, useRouter } from "next/navigation"; 

export function AppHeader() {
  const { toast } = useToast();
  const { t } = useI18n();
  const user = sampleUserProfile;
  const wallet = sampleWalletBalance;
  const [recentPages, setRecentPages] = useState<RecentPageItem[]>([]);
  const pathname = usePathname(); 
  const router = useRouter();

  const handleLogout = () => {
    toast({ title: "Logged Out", description: "You have been logged out." });
    // In a real app, clear session/token and redirect:
    localStorage.removeItem('currentUserInfo');
    localStorage.removeItem('authToken'); // Or clear cookie
    router.push('/auth/login');
  };

  useEffect(() => {
    setRecentPages(getRecentPages());
  }, [pathname]);

  const handleLanguageChange = (lang: string) => {
    toast({ title: "Language Switch (Mock)", description: `Language would switch to ${lang}. This app is currently single-language.` });
    // To re-enable next-intl, you'd use: router.push(`/${lang}${pathnameWithoutLocale}`);
  };

  return (
    <TooltipProvider>
      <header className="border-b bg-card shadow-sm">
        <div className="flex h-16 items-center gap-4 px-4 md:px-6">
          <SidebarTrigger />
          <div className="flex-1">
            {/* Optional search bar or breadcrumbs */}
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <LanguageSwitcher />

            <Button variant="ghost" size="icon" className="rounded-full">
              <Bell className="h-5 w-5 text-muted-foreground" />
              <span className="sr-only">{t("appHeader.notifications", "Notifications")}</span>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.profilePictureUrl || "https://avatar.vercel.sh/placeholder.png"} alt={user.name} data-ai-hint="person portrait" />
                    <AvatarFallback>{user.name?.substring(0,1).toUpperCase() || 'U'}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64"> 
                <DropdownMenuLabel>{user.name}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <Link href="/profile" passHref>
                  <DropdownMenuItem>
                    <UserCircle className="mr-2 h-4 w-4" />
                    {t("appHeader.profile", "Profile")}
                  </DropdownMenuItem>
                </Link>
                <Link href="/bookmarks" passHref>
                  <DropdownMenuItem>
                    <Bookmark className="mr-2 h-4 w-4" />
                    {t("appHeader.myBookmarks", "My Bookmarks")}
                  </DropdownMenuItem>
                </Link>
                {recentPages.length > 0 && (
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                      <HistoryIcon className="mr-2 h-4 w-4" />
                      {t("appHeader.recentPages", "Recent Pages")}
                    </DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                      <DropdownMenuSubContent>
                        {recentPages.map(page => (
                          <Link href={page.path} key={page.path} passHref>
                            <DropdownMenuItem className="text-xs">
                              {page.label}
                            </DropdownMenuItem>
                          </Link>
                        ))}
                      </DropdownMenuSubContent>
                    </DropdownMenuPortal>
                  </DropdownMenuSub>
                )}
                <DropdownMenuSeparator /> 
                <Link href="/job-tracker" passHref><DropdownMenuItem><Briefcase className="mr-2 h-4 w-4" />{t("appHeader.jobTracker", "Job Tracker")}</DropdownMenuItem></Link>
                <Link href="/gamification" passHref><DropdownMenuItem><Award className="mr-2 h-4 w-4" />{t("appHeader.rewardsBadges", "Rewards & Badges")}</DropdownMenuItem></Link>
                <Link href="/wallet" passHref><DropdownMenuItem><WalletCards className="mr-2 h-4 w-4" />{t("appHeader.wallet", "Wallet")}</DropdownMenuItem></Link>
                <Link href="/my-resumes" passHref><DropdownMenuItem><Layers3 className="mr-2 h-4 w-4" />{t("appHeader.resumeManager", "Resume Manager")}</DropdownMenuItem></Link>
                <Link href="/settings" passHref><DropdownMenuItem><SettingsIcon className="mr-2 h-4 w-4" />{t("appHeader.settings", "Settings")}</DropdownMenuItem></Link>
                <Link href="/blog" passHref><DropdownMenuItem><BookOpen className="mr-2 h-4 w-4" />{t("appHeader.blog", "Blog")}</DropdownMenuItem></Link>
                <Link href="/activity-log" passHref><DropdownMenuItem><ActivityIcon className="mr-2 h-4 w-4" />{t("appHeader.activity", "Activity")}</DropdownMenuItem></Link>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  {t("appHeader.logout", "Logout")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="hidden sm:flex h-10 items-center justify-end gap-4 border-t bg-secondary/30 px-4 md:px-6">
           <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1 text-sm font-medium text-muted-foreground cursor-default">
                <Flame className="h-5 w-5 text-orange-500" />
                <span>{user.dailyStreak || 0}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent><p>{t("appHeader.dailyStreak", "Daily Login Streak")}</p></TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1 text-sm font-medium text-muted-foreground cursor-default">
                <Star className="h-5 w-5 text-yellow-500" />
                <span>{user.xpPoints || 0} XP</span>
              </div>
            </TooltipTrigger>
            <TooltipContent><p>{t("appHeader.totalXP", "Total Experience Points")}</p></TooltipContent>
          </Tooltip>
          <Tooltip>
             <TooltipTrigger asChild>
                <Link href="/wallet" passHref>
                  <div className="flex items-center gap-1 text-sm font-medium text-muted-foreground cursor-pointer hover:text-primary transition-colors">
                    <Coins className="h-5 w-5 text-green-500" />
                    <span>{wallet.coins || 0}</span>
                  </div>
                 </Link>
            </TooltipTrigger>
             <TooltipContent><p>{t("appHeader.coinBalance", "Coin Balance")}</p></TooltipContent>
          </Tooltip>
        </div>
      </header>
    </TooltipProvider>
  );
}
