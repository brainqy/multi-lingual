
"use client";

import { Sidebar, SidebarHeader, SidebarContent, SidebarFooter, SidebarMenuItem, SidebarMenuButton, SidebarSeparator, SidebarGroup, SidebarGroupLabel, SidebarMenu } from "@/components/ui/sidebar";
import { Aperture, Award, BarChart2, BookOpen, Briefcase, Building2, CalendarDays, FileText, GalleryVerticalEnd, GitFork, Gift, Handshake, History, Home, Layers3, ListChecks, MessageSquare, Settings, ShieldAlert, ShieldQuestion, User, Users, WalletCards, Zap, UserCog, BotMessageSquare, Target, Users2, BookText as BookTextIcon, Activity, Edit, FileType, Brain, FilePlus2, Trophy, Settings2 as Settings2Icon, Puzzle as PuzzleIcon, Mic, ServerIcon, Megaphone, PlusCircle, Dices, Award as AwardIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { samplePlatformSettings } from "@/lib/sample-data";
import { useI18n } from "@/hooks/use-i18n"; // <-- Add this import
import { useAuth } from "@/hooks/use-auth";
import { useSidebar } from "@/components/ui/sidebar";

const navItems = [
  { href: "/dashboard", labelKey: "sideMenu.dashboard", icon: Home },
  { href: "/community-feed", labelKey: "sideMenu.communityFeed", icon: MessageSquare },
  { href: "/alumni-connect", labelKey: "sideMenu.alumniNetwork", icon: Handshake },
  { href: "/job-board", labelKey: "sideMenu.jobBoard", icon: Aperture },
  { href: "/job-tracker", labelKey: "sideMenu.jobTracker", icon: Briefcase },
  { href: "/interview-prep", labelKey: "sideMenu.practiceHub", icon: Brain },
  {
    labelKey: "sideMenu.aiTools",
    icon: Zap,
    subItems: [
      { href: "/resume-analyzer", labelKey: "sideMenu.resumeAnalyzer", icon: Zap },
      { href: "/ai-resume-writer", labelKey: "sideMenu.aiResumeWriter", icon: Edit },
      { href: "/cover-letter-generator", labelKey: "sideMenu.coverLetterGenerator", icon: FileType },
    ]
  },
  {
    labelKey: "sideMenu.resumeTools",
    icon: FileText,
    subItems: [
      { href: "/my-resumes", labelKey: "sideMenu.myResumes", icon: Layers3 },
      { href: "/resume-builder", labelKey: "sideMenu.resumeBuilder", icon: FilePlus2 },
      { href: "/resume-templates", labelKey: "sideMenu.resumeTemplates", icon: Layers3 },
    ]
  },
  { href: "/gallery", labelKey: "sideMenu.eventGallery", icon: GalleryVerticalEnd },
  { href: "/activity-log", labelKey: "sideMenu.activityLog", icon: BarChart2 },
  { href: "/profile", labelKey: "sideMenu.myProfile", icon: User },
];

const databaseItems = [
  { href: "/company-database", labelKey: "sideMenu.companyDatabase", icon: Building2 },
];

const utilityItems = [
  { href: "/appointments", labelKey: "sideMenu.appointments", icon: CalendarDays },
  { href: "/wallet", labelKey: "sideMenu.digitalWallet", icon: WalletCards },
  { href: "/feature-requests", labelKey: "sideMenu.featureRequests", icon: ShieldQuestion },
  { href: "/settings", labelKey: "sideMenu.settings", icon: Settings },
  { href: "/documentation", labelKey: "sideMenu.documentation", icon: BookTextIcon, adminOnly: true },
];

const gamificationItems = [
  { href: "/awards", labelKey: "sideMenu.awards", icon: Trophy },
  { href: "/daily-interview-challenge", labelKey: "sideMenu.dailyChallenge", icon: PuzzleIcon },
  { href: "/kbc-game", labelKey: "sideMenu.kbcGame", icon: Trophy },
  { href: "/number-match-game", labelKey: "sideMenu.numberMatchGame", icon: Dices },
  { href: "/gamification", labelKey: "sideMenu.rewardsBadges", icon: Award },
  { href: "/referrals", labelKey: "sideMenu.referrals", icon: Gift },
  { href: "/affiliates", labelKey: "sideMenu.affiliatesProgram", icon: Target },
];

const blogItems = [
  { href: "/blog", labelKey: "sideMenu.blog", icon: BookOpen },
];

const adminItems = [
   { href: "/admin/dashboard", labelKey: "sideMenu.adminDashboard", icon: Activity },
   { href: "/admin/tenants", labelKey: "sideMenu.tenantManagement", icon: Building2 },
   { href: "/admin/tenant-onboarding", labelKey: "sideMenu.tenantOnboarding", icon: Layers3 },
   { href: "/admin/user-management", labelKey: "sideMenu.userManagement", icon: UserCog },
   { href: "/admin/gamification-rules", labelKey: "sideMenu.gamificationRules", icon: ListChecks },
   { href: "/admin/promo-codes", labelKey: "sideMenu.promoCodeMgt", icon: Gift },
   { href: "/admin/awards", labelKey: "sideMenu.awardsMgt", icon: AwardIcon },
   { href: "/admin/content-moderation", labelKey: "sideMenu.contentModeration", icon: ShieldAlert },
   { href: "/admin/announcements", labelKey: "sideMenu.announcementsMgt", icon: Megaphone },
   { href: "/admin/messenger-management", labelKey: "sideMenu.messengerMgt", icon: BotMessageSquare },
   { href: "/admin/affiliate-management", labelKey: "sideMenu.affiliateMgt", icon: Users2 },
   { href: "/admin/gallery-management", labelKey: "sideMenu.galleryMgt", icon: GalleryVerticalEnd },
   { href: "/admin/template-designer", labelKey: "sideMenu.templateDesigner", icon: Layers3 },
   { href: "/admin/blog-settings", labelKey: "sideMenu.blogSettings", icon: Settings2Icon },
   { href: "/admin/promotional-content", labelKey: "sideMenu.promotionalContentMgt", icon: Megaphone },
   { href: "/admin/platform-settings", labelKey: "sideMenu.platformSettings", icon: ServerIcon },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { user: currentUser } = useAuth();
  const platformName = samplePlatformSettings.platformName;
  const { t } = useI18n();
  const { isMobile, setOpenMobile } = useSidebar();

  const handleMenuItemClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  const renderMenuItem = (item: any, isSubItem = false) => {
    if (!currentUser) return null;
    let isActive = item.href ? pathname.startsWith(item.href) : false;

    if (item.href === "/dashboard") { // Exact match for dashboard
      isActive = pathname === item.href;
    }
    
    const userRole = currentUser.role.toLowerCase();

    if (item.adminOnly && userRole !== 'admin') {
      return null;
    }
    if (item.managerOnly && userRole !== 'manager' && userRole !== 'admin') {
        return null;
    }

    const effectiveHref = item.href === "/dashboard" && userRole === 'admin'
      ? "/admin/dashboard"
      : item.href;

    return (
      <SidebarMenuItem key={item.href || item.labelKey}>
         {effectiveHref ? (
           <Link href={effectiveHref} passHref legacyBehavior>
            <SidebarMenuButton 
              as="a"
              isActive={isActive} 
              size={isSubItem ? "sm" : "default"} 
              className="w-full justify-start"
              onClick={handleMenuItemClick}
            >
              <item.icon className={`h-5 w-5 ${isActive ? "text-sidebar-primary-foreground" : "text-sidebar-foreground/80"}`} />
              <span className={`${isActive ? "text-sidebar-primary-foreground" : ""} group-data-[collapsible=icon]:hidden`}>{t(item.labelKey)}</span>
            </SidebarMenuButton>
           </Link>
         ) : (
           <SidebarMenuButton size={isSubItem ? "sm" : "default"} className="w-full justify-start cursor-default hover:bg-transparent group-data-[collapsible=icon]:justify-center">
              <item.icon className="h-5 w-5 text-sidebar-foreground/80" />
              <span className="group-data-[collapsible=icon]:hidden">{t(item.labelKey)}</span>
           </SidebarMenuButton>
         )}
      </SidebarMenuItem>
    );
  };
  
  if (!currentUser) {
    return null; // Or a loading skeleton for the sidebar
  }

  const userRole = currentUser.role.toLowerCase();

  return (
    <Sidebar collapsible="icon" variant="sidebar" side="left">
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <Link href={"/dashboard"} className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center">
          <FileText className="h-7 w-7 text-primary" />
          <span className="font-semibold text-lg text-sidebar-foreground group-data-[collapsible=icon]:hidden">{platformName}</span>
        </Link>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarMenu>
          {navItems.map((item) =>
            item.subItems && item.subItems.length > 0 ? (
              <SidebarGroup key={item.labelKey} className="p-0">
                 {renderMenuItem(item, false)}
                <div className="pl-4 group-data-[collapsible=icon]:hidden">
                  <SidebarMenu>
                    {item.subItems.map(subItem => renderMenuItem(subItem, true))}
                  </SidebarMenu>
                </div>
              </SidebarGroup>
            ) : (
              renderMenuItem(item)
            )
          )}
        </SidebarMenu>

        <SidebarSeparator className="my-4" />
         <SidebarGroup className="p-0">
          <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden text-xs text-sidebar-foreground/60 px-2">{t("sideMenu.databases")}</SidebarGroupLabel>
          <SidebarMenu>
            {databaseItems.map(item => renderMenuItem(item))}
          </SidebarMenu>
        </SidebarGroup>

        <SidebarSeparator className="my-4" />
         <SidebarGroup className="p-0">
          <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden text-xs text-sidebar-foreground/60 px-2">{t("sideMenu.engagement")}</SidebarGroupLabel>
          <SidebarMenu>
            {gamificationItems.map(item => renderMenuItem(item))}
            {blogItems.map(item => renderMenuItem(item))}
          </SidebarMenu>
        </SidebarGroup>

        <SidebarSeparator className="my-4" />
         <SidebarGroup className="p-0">
          <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden text-xs text-sidebar-foreground/60 px-2">{t("sideMenu.utilities")}</SidebarGroupLabel>
          <SidebarMenu>
            {utilityItems.map(item => renderMenuItem(item))}
          </SidebarMenu>
        </SidebarGroup>

        {(userRole === 'admin' || userRole === 'manager') && (
          <>
            <SidebarSeparator className="my-4" />
            <SidebarGroup className="p-0">
              <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden text-xs text-sidebar-foreground/60 px-2">
                {userRole === 'admin' ? t("sideMenu.adminPanel") : t("sideMenu.managerPanel")}
              </SidebarGroupLabel>
              <SidebarMenu>
                {adminItems.filter(item => {
                    if(userRole === 'manager') {
                        const managerAccessible = [
                            "/admin/user-management", 
                            "/admin/content-moderation",
                            "/admin/gallery-management",
                            "/admin/announcements",
                            "/admin/promo-codes",
                        ];
                        return managerAccessible.includes(item.href);
                    }
                    return true; 
                }).map(item => renderMenuItem(item))}
              </SidebarMenu>
            </SidebarGroup>
          </>
        )}
      </SidebarContent>
      <SidebarFooter className="p-4 border-t border-sidebar-border group-data-[collapsible=icon]:justify-center">
        <div className="flex items-center gap-2 group-data-[collapsible=icon]:hidden">
          <img src={currentUser.profilePictureUrl || `https://avatar.vercel.sh/${currentUser.email}.png`} alt={currentUser.name} className="w-8 h-8 rounded-full" data-ai-hint="person face" />
          <div>
            <p className="text-sm font-medium text-sidebar-foreground">{currentUser.name}</p>
            <p className="text-xs text-sidebar-foreground/70 flex items-center gap-1">
              <Building2 className="h-3 w-3"/> {t("sideMenu.tenant")}: {currentUser.tenantId}
            </p>
          </div>
        </div>
         <div className="hidden items-center gap-2 group-data-[collapsible=icon]:flex">
           <img src={currentUser.profilePictureUrl || `https://avatar.vercel.sh/${currentUser.email}.png`} alt={currentUser.name} className="w-8 h-8 rounded-full" data-ai-hint="person face" />
         </div>
      </SidebarFooter>
    </Sidebar>
  );
}
