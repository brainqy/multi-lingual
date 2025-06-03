
"use client";

import { Sidebar, SidebarHeader, SidebarContent, SidebarFooter, SidebarMenuItem, SidebarMenuButton, SidebarSeparator, SidebarGroup, SidebarGroupLabel, SidebarMenu } from "@/components/ui/sidebar";
import { Aperture, Award, BarChart2, BookOpen, Briefcase, Building2, CalendarDays, FileText, GalleryVerticalEnd, GitFork, Gift, Handshake, History, Home, Layers3, ListChecks, MessageSquare, Settings, ShieldAlert, ShieldQuestion, User, Users, Wallet, Zap, UserCog, BotMessageSquare, Target, Users2, BookText as BookTextIcon, Activity, Edit, FileType, Brain, FilePlus2, Trophy, Settings2Icon, Puzzle as PuzzleIcon, Mic, Server, Megaphone, PlusCircle } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { sampleUserProfile, samplePlatformSettings } from "@/lib/sample-data"; // Added samplePlatformSettings

const navItems = [
  { href: "/community-feed", label: "Community Feed", icon: MessageSquare },
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/alumni-connect", label: "Alumni Network", icon: Handshake },
  { href: "/job-board", label: "Job Board", icon: Aperture },
  { href: "/job-tracker", label: "Job Tracker", icon: Briefcase },
  { href: "/interview-prep", label: "Practice Hub", icon: Brain },
  {
    label: "AI Tools",
    icon: Zap,
    subItems: [
      { href: "/resume-analyzer", label: "Resume Analyzer", icon: Zap },
      { href: "/ai-resume-writer", label: "AI Resume Writer", icon: Edit },
      { href: "/cover-letter-generator", label: "Cover Letter Generator", icon: FileType },
    ]
  },
  {
    label: "Resume Tools",
    icon: FileText,
    subItems: [
      { href: "/my-resumes", label: "My Resumes", icon: Layers3 },
      { href: "/resume-builder", label: "Resume Builder", icon: FilePlus2 },
      { href: "/resume-templates", label: "Resume Templates", icon: Layers3 },
    ]
  },
  { href: "/gallery", label: "Event Gallery", icon: GalleryVerticalEnd },
  { href: "/activity-log", label: "Activity Log", icon: BarChart2 },
  { href: "/profile", label: "My Profile", icon: User },
];

const utilityItems = [
  { href: "/appointments", label: "Appointments", icon: CalendarDays },
  { href: "/wallet", label: "Digital Wallet", icon: Wallet },
  { href: "/feature-requests", label: "Feature Requests", icon: ShieldQuestion, adminOnly: true },
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/documentation", label: "Documentation", icon: BookTextIcon, adminOnly: true },
  { href: "/db-test", label: "DB Test", icon: GitFork, adminOnly: true}
];

const gamificationItems = [
  { href: "/gamification", label: "Rewards & Badges", icon: Award },
  { href: "/referrals", label: "Referrals", icon: Gift },
  { href: "/affiliates", label: "Affiliates Program", icon: Target, adminOnly: true },
];

const blogItems = [
  { href: "/blog", label: "Blog", icon: BookOpen },
];

const adminItems = [
   { href: "/admin/dashboard", label: "Admin Dashboard", icon: Activity },
   { href: "/admin/tenants", label: "Tenant Management", icon: Building2 },
   { href: "/admin/tenant-onboarding", label: "Tenant Onboarding", icon: Layers3 },
   { href: "/admin/user-management", label: "User Management", icon: UserCog },
   { href: "/admin/gamification-rules", label: "Gamification Rules", icon: ListChecks },
   { href: "/admin/content-moderation", label: "Content Moderation", icon: ShieldAlert },
   { href: "/admin/announcements", label: "Announcements Mgt.", icon: Megaphone },
   { href: "/admin/messenger-management", label: "Messenger Mgt.", icon: BotMessageSquare },
   { href: "/admin/affiliate-management", label: "Affiliate Mgt.", icon: Users2 },
   { href: "/admin/gallery-management", label: "Gallery Mgt.", icon: GalleryVerticalEnd },
   { href: "/admin/blog-settings", label: "Blog Settings", icon: Settings2Icon },
   { href: "/admin/platform-settings", label: "Platform Settings", icon: Server },
];

export function AppSidebar() {
  const pathname = usePathname();
  const currentUser = sampleUserProfile;
  const platformName = samplePlatformSettings.platformName || "ResumeMatch"; // Fallback if not set

  const renderMenuItem = (item: any, isSubItem = false) => {
    let isActive;
    // Handle specific dashboard routes for active state
    if (item.href === "/dashboard" && currentUser.role !== 'admin' && currentUser.role !== 'manager') {
        isActive = pathname === item.href;
    } else if (item.href === "/admin/dashboard" && (currentUser.role === 'admin' || currentUser.role === 'manager')) { // Managers might see admin dashboard too
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
      <SidebarMenuItem key={item.href || item.label}>
         {item.href ? (
           <Link href={item.href} passHref legacyBehavior>
            <SidebarMenuButton isActive={isActive} size={isSubItem ? "sm" : "default"} className="w-full justify-start">
              <item.icon className={`h-5 w-5 ${isActive ? "text-sidebar-primary-foreground" : "text-sidebar-foreground/80"}`} />
              <span className={`${isActive ? "text-sidebar-primary-foreground" : ""} group-data-[collapsible=icon]:hidden`}>{item.label}</span>
            </SidebarMenuButton>
           </Link>
         ) : (
           <SidebarMenuButton size={isSubItem ? "sm" : "default"} className="w-full justify-start cursor-default hover:bg-transparent group-data-[collapsible=icon]:justify-center">
              <item.icon className="h-5 w-5 text-sidebar-foreground/80" />
              <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
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
              <SidebarGroup key={item.label} className="p-0">
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
          <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden text-xs text-sidebar-foreground/60 px-2">Engagement</SidebarGroupLabel>
          <SidebarMenu>
            {gamificationItems.map(item => renderMenuItem(item))}
            {blogItems.map(item => renderMenuItem(item))}
          </SidebarMenu>
        </SidebarGroup>

        <SidebarSeparator className="my-4" />
         <SidebarGroup className="p-0">
          <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden text-xs text-sidebar-foreground/60 px-2">Utilities</SidebarGroupLabel>
          <SidebarMenu>
            {utilityItems.map(item => renderMenuItem(item))}
          </SidebarMenu>
        </SidebarGroup>

        {(currentUser.role === 'admin' || currentUser.role === 'manager') && (
          <>
            <SidebarSeparator className="my-4" />
            <SidebarGroup className="p-0">
              <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden text-xs text-sidebar-foreground/60 px-2">
                {currentUser.role === 'admin' ? "Admin Panel" : "Manager Panel"}
              </SidebarGroupLabel>
              <SidebarMenu>
                {adminItems.filter(item => {
                    if(currentUser.role === 'manager') {
                        // For managers, ensure the admin dashboard link is also adjusted or handled
                         // Assuming manager can see a version of admin dashboard
                        const managerAccessible = [
                            "/admin/dashboard", // Managers should see their specific dashboard view via this link
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
              <Building2 className="h-3 w-3"/> Tenant: {currentUser.tenantId}
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
