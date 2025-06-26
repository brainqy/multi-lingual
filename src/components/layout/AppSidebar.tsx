
"use client";

import { Sidebar, SidebarHeader, SidebarContent, SidebarFooter, SidebarMenuItem, SidebarMenuButton, SidebarSeparator, SidebarGroup, SidebarGroupLabel, SidebarMenu } from "@/components/ui/sidebar";
import { Aperture, Award, BarChart2, BookOpen, Briefcase, Building2, CalendarDays, FileText, GalleryVerticalEnd, GitFork, Gift, Handshake, History, Home, Layers3, ListChecks, MessageSquare, Settings, ShieldAlert, ShieldQuestion, User, Users, Wallet, Zap, UserCog, BotMessageSquare, Target, Users2, BookText as BookTextIcon, Activity, Edit, FileType, Brain, FilePlus2, Trophy, Settings2 as Settings2Icon, Puzzle as PuzzleIcon, Mic, Server, Megaphone, PlusCircle } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { sampleUserProfile, samplePlatformSettings } from "@/lib/sample-data";
import { useI18n } from "@/hooks/use-i18n"; // <-- Add this import

const navItems = [
  { href: "/community-feed", labelKey: "sideMenu.communityFeed", icon: MessageSquare },
  { href: "/dashboard", labelKey: "sideMenu.dashboard", icon: Home },
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

const utilityItems = [
  { href: "/appointments", labelKey: "sideMenu.appointments", icon: CalendarDays },
  { href: "/wallet", labelKey: "sideMenu.digitalWallet", icon: Wallet },
  { href: "/feature-requests", labelKey: "sideMenu.featureRequests", icon: ShieldQuestion, adminOnly: true },
  { href: "/settings", labelKey: "sideMenu.settings", icon: Settings },
  { href: "/documentation", labelKey: "sideMenu.documentation", icon: BookTextIcon, adminOnly: true },
  { href: "/db-test", labelKey: "sideMenu.dbTest", icon: GitFork, adminOnly: true}
];

const gamificationItems = [
  { href: "/daily-interview-challenge", labelKey: "sideMenu.dailyChallenge", icon: PuzzleIcon },
  { href: "/gamification", labelKey: "sideMenu.rewardsBadges", icon: Award },
  { href: "/referrals", labelKey: "sideMenu.referrals", icon: Gift },
  { href: "/affiliates", labelKey: "sideMenu.affiliatesProgram", icon: Target, adminOnly: true },
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
   { href: "/admin/content-moderation", labelKey: "sideMenu.contentModeration", icon: ShieldAlert },
   { href: "/admin/announcements", labelKey: "sideMenu.announcementsMgt", icon: Megaphone },
   { href: "/admin/messenger-management", labelKey: "sideMenu.messengerMgt", icon: BotMessageSquare },
   { href: "/admin/affiliate-management", labelKey: "sideMenu.affiliateMgt", icon: Users2 },
   { href: "/admin/gallery-management", labelKey: "sideMenu.galleryMgt", icon: GalleryVerticalEnd },
   { href: "/admin/blog-settings", labelKey: "sideMenu.blogSettings", icon: Settings2Icon },
   { href: "/admin/promotional-content", labelKey: "sideMenu.promotionalContentMgt", icon: Megaphone },
   { href: "/admin/platform-settings", labelKey: "sideMenu.platformSettings", icon: Server },
];

export function AppSidebar() {
  const pathname = usePathname();
  const currentUser = sampleUserProfile;
  const platformName = samplePlatformSettings.platformName || "ResumeMatch";
  const { t } = useI18n(); // <-- Use the translation hook

  const renderMenuItem = (item: any, isSubItem = false) => {
    let isActive;
    if (item.href === "/dashboard" && currentUser.role !== 'admin' && currentUser.role !== 'manager') {
        isActive = pathname === item.href;
    } else if (item.href === "/admin/dashboard" && (currentUser.role === 'admin' || currentUser.role === 'manager')) {
        isActive = pathname === item.href;
    } else {
        isActive = item.href ? pathname.startsWith(item.href) : false;
    }
    if (item.adminOnly && currentUser.role !== 'admin') {
      return null;
    }
    if (item.managerOnly && currentUser.role !== 'manager' && currentUser.role !== 'admin') {
        return null;
    }
    return (
      <SidebarMenuItem key={item.href || item.labelKey}>
         {item.href ? (
           <Link href={item.href} passHref legacyBehavior>
            <SidebarMenuButton isActive={isActive} size={isSubItem ? "sm" : "default"} className="w-full justify-start">
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

        {(currentUser.role === 'admin' || currentUser.role === 'manager') && (
          <>
            <SidebarSeparator className="my-4" />
            <SidebarGroup className="p-0">
              <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden text-xs text-sidebar-foreground/60 px-2">
                {currentUser.role === 'admin' ? t("sideMenu.adminPanel") : t("sideMenu.managerPanel")}
              </SidebarGroupLabel>
              <SidebarMenu>
                {adminItems.filter(item => {
                    if(currentUser.role === 'manager') {
                        const managerAccessible = [
                            "/admin/user-management", 
                            "/admin/content-moderation",
                            "/admin/gallery-management",
                            "/admin/announcements",
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
