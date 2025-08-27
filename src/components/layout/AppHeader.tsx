
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from 'react'; 
import { getRecentPages } from '@/lib/recent-pages'; 
import { useAuth } from '@/hooks/use-auth';
import { getNotifications, markNotificationsAsRead } from '@/lib/actions/notifications';
import type { Notification, RecentPageItem } from "@/types";
import { formatDistanceToNow } from 'date-fns';
import { usePathname, useRouter } from "next/navigation"; 

export function AppHeader() {
  const { toast } = useToast();
  const { t } = useI18n();
  const { user, logout, wallet } = useAuth();
  const [recentPages, setRecentPages] = useState<RecentPageItem[]>([]);
  const pathname = usePathname(); 
  const router = useRouter();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isNotificationPopoverOpen, setIsNotificationPopoverOpen] = useState(false);

  useEffect(() => {
    setRecentPages(getRecentPages());
  }, [pathname]);
  
  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000); // Poll for new notifications every 30 seconds
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchNotifications = async () => {
    if (!user) return;
    const userNotifications = await getNotifications(user.id);
    setNotifications(userNotifications);
  };
  
  const handleNotificationOpenChange = async (open: boolean) => {
    setIsNotificationPopoverOpen(open);
    if (!open && unreadCount > 0) {
      // When popover closes, mark notifications as read
      await markNotificationsAsRead(user!.id);
      fetchNotifications(); // Refresh notifications to show them as read
    }
  };
  
  const handleShowStreakPopup = () => {
    const event = new CustomEvent('show-streak-popup');
    window.dispatchEvent(event);
  };

  const handleLogout = () => {
    logout();
    toast({ title: "Logged Out", description: "You have been logged out." });
  };
  
  if (!user) {
    return null; // or a loading skeleton
  }
  
  const unreadCount = notifications.filter(n => !n.isRead).length;

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

            <Popover open={isNotificationPopoverOpen} onOpenChange={handleNotificationOpenChange}>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full relative">
                  <Bell className="h-5 w-5 text-muted-foreground" />
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                    </span>
                  )}
                  <span className="sr-only">{t("appHeader.notifications")}</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-80 p-0">
                  <div className="p-3 font-medium border-b">{t("appHeader.notifications")}</div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center p-4">You have no notifications.</p>
                    ) : (
                      notifications.map(notification => (
                        <Link href={notification.link || '#'} key={notification.id} passHref>
                          <div
                            className={`block p-3 hover:bg-secondary ${!notification.isRead ? 'bg-primary/5' : ''} cursor-pointer`}
                            onClick={() => {
                              setIsNotificationPopoverOpen(false);
                              router.push(notification.link || '#');
                            }}
                          >
                            <p className="text-sm">{notification.content}</p>
                            <p className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}</p>
                          </div>
                        </Link>
                      ))
                    )}
                  </div>
              </PopoverContent>
            </Popover>

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
                    {t("appHeader.profile")}
                  </DropdownMenuItem>
                </Link>
                <Link href="/bookmarks" passHref>
                  <DropdownMenuItem>
                    <Bookmark className="mr-2 h-4 w-4" />
                    {t("appHeader.myBookmarks")}
                  </DropdownMenuItem>
                </Link>
                {recentPages.length > 0 && (
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                      <HistoryIcon className="mr-2 h-4 w-4" />
                      {t("appHeader.recentPages")}
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
                <Link href="/job-tracker" passHref><DropdownMenuItem><Briefcase className="mr-2 h-4 w-4" />{t("appHeader.jobTracker")}</DropdownMenuItem></Link>
                <Link href="/gamification" passHref><DropdownMenuItem><Award className="mr-2 h-4 w-4" />{t("appHeader.rewardsBadges")}</DropdownMenuItem></Link>
                <Link href="/wallet" passHref><DropdownMenuItem><WalletCards className="mr-2 h-4 w-4" />{t("appHeader.wallet")}</DropdownMenuItem></Link>
                <Link href="/my-resumes" passHref><DropdownMenuItem><Layers3 className="mr-2 h-4 w-4" />{t("appHeader.resumeManager")}</DropdownMenuItem></Link>
                <Link href="/settings" passHref><DropdownMenuItem><SettingsIcon className="mr-2 h-4 w-4" />{t("appHeader.settings")}</DropdownMenuItem></Link>
                <Link href="/blog" passHref><DropdownMenuItem><BookOpen className="mr-2 h-4 w-4" />{t("appHeader.blog")}</DropdownMenuItem></Link>
                <Link href="/activity-log" passHref><DropdownMenuItem><ActivityIcon className="mr-2 h-4 w-4" />{t("appHeader.activity")}</DropdownMenuItem></Link>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  {t("appHeader.logout")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="hidden sm:flex h-10 items-center justify-end gap-4 border-t bg-secondary/30 px-4 md:px-6">
           <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" className="h-auto px-2 py-1 text-sm font-medium text-muted-foreground" onClick={handleShowStreakPopup}>
                <Flame className="h-5 w-5 text-orange-500" />
                <span className="ml-1">{user.dailyStreak || 0}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent><p>{t("appHeader.dailyStreak")}</p></TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1 text-sm font-medium text-muted-foreground cursor-default">
                <Star className="h-5 w-5 text-yellow-500" />
                <span>{user.xpPoints || 0} XP</span>
              </div>
            </TooltipTrigger>
            <TooltipContent><p>{t("appHeader.totalXP")}</p></TooltipContent>
          </Tooltip>
          <Tooltip>
             <TooltipTrigger asChild>
                <Link href="/wallet" passHref>
                  <div className="flex items-center gap-1 text-sm font-medium text-muted-foreground cursor-pointer hover:text-primary transition-colors">
                    <Coins className="h-5 w-5 text-green-500" />
                    <span>{wallet?.coins ?? 0}</span>
                  </div>
                 </Link>
            </TooltipTrigger>
             <TooltipContent><p>{t("appHeader.coinBalance")}</p></TooltipContent>
          </Tooltip>
        </div>
      </header>
    </TooltipProvider>
  );
}
