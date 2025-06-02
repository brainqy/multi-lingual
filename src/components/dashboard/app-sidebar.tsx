
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, MessageSquareText, Settings, Users, Activity, ShieldCheck, 
  Mic, FileText, Users2, CalendarDays, Rss, Mail, BookOpen, Calendar, 
  Lightbulb, Image as ImageIcon, Gamepad2, ClipboardList, ListOrdered, 
  Briefcase, Target, Trophy, Video, Files, UserCircle, Gift, 
  FileSearch, FilePlus2, History, LayoutGrid, Wallet, Handshake, Megaphone,
  Settings2, ShieldAlert, GalleryVerticalEnd, ListChecks as GamificationIcon, Bot, Server, UserPlus, Building2, UsersCog
} from "lucide-react"; 
import { useI18n } from "@/hooks/use-i18n";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarSeparator,
  SidebarGroup,
  SidebarGroupLabel,
} from "@/components/ui/sidebar"; 
import { ScrollArea } from "@/components/ui/scroll-area";

export function AppSidebar() {
  const pathname = usePathname();
  const { t } = useI18n();
  const { isAdmin } = useAuth();

  const mainMenuItems = [
    {
      href: "/dashboard",
      label: t("dashboard.navigation.overview"),
      icon: LayoutDashboard,
    },
    {
      href: "/translate", 
      label: t("dashboard.navigation.translate"),
      icon: MessageSquareText,
    },
  ];

  const featureMenuItems = [
    { href: "/activity-log", label: "Activity Log", icon: Activity },
    { href: "/affiliates", label: "Affiliates", icon: Handshake }, // Changed from Users
    { href: "/ai-mock-interview", label: "AI Mock Interview", icon: Mic },
    { href: "/ai-resume-writer", label: "AI Resume Writer", icon: FileText },
    { href: "/alumni-connect", label: "Alumni Connect", icon: Users2 },
    { href: "/appointments", label: "Appointments", icon: CalendarDays },
    { href: "/blog", label: "Blog", icon: Rss },
    { href: "/community-feed", label: "Community Feed", icon: MessageSquareText }, // Corrected icon
    { href: "/cover-letter-generator", label: "Cover Letter Generator", icon: Mail },
    { href: "/documentation", label: "Documentation", icon: BookOpen },
    { href: "/events", label: "Events", icon: Calendar },
    { href: "/feature-requests", label: "Feature Requests", icon: Lightbulb },
    { href: "/gallery", label: "Gallery", icon: ImageIcon },
    { href: "/gamification", label: "Gamification", icon: Gamepad2 },
    { href: "/interview-prep", label: "Interview Prep", icon: ClipboardList },
    { href: "/interview-queue", label: "Interview Queue", icon: ListOrdered },
    { href: "/job-board", label: "Job Board", icon: Briefcase },
    { href: "/job-tracker", label: "Job Tracker", icon: Target },
    { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
    { href: "/live-interview", label: "Live Interview", icon: Video },
    { href: "/my-resumes", label: "My Resumes", icon: Files },
    { href: "/profile", label: "Profile", icon: UserCircle },
    { href: "/referrals", label: "Referrals", icon: Gift },
    { href: "/resume-analyzer", label: "Resume Analyzer", icon: FileSearch },
    { href: "/resume-builder", label: "Resume Builder", icon: FilePlus2 },
    { href: "/resume-history", label: "Resume History", icon: History },
    { href: "/resume-templates", label: "Resume Templates", icon: LayoutGrid },
    { href: "/wallet", label: "Wallet", icon: Wallet },
  ];

  const adminMenuItems = [
    { href: "/admin/dashboard", label: "Admin Dashboard", icon: ShieldCheck },
    { href: "/admin/user-management", label: "User Management", icon: UsersCog },
    { href: "/admin/tenants", label: "Tenant Management", icon: Building2 },
    { href: "/admin/tenant-onboarding", label: "Tenant Onboarding", icon: UserPlus },
    { href: "/admin/platform-settings", label: "Platform Settings", icon: Server },
    { href: "/admin/content-moderation", label: "Content Moderation", icon: ShieldAlert },
    { href: "/admin/announcements", label: "Announcements", icon: Megaphone },
    { href: "/admin/blog-settings", label: "Blog Settings", icon: Settings2 },
    { href: "/admin/gallery-management", label: "Gallery Management", icon: GalleryVerticalEnd },
    { href: "/admin/gamification-rules", label: "Gamification Rules", icon: GamificationIcon },
    { href: "/admin/affiliate-management", label: "Affiliate Management", icon: Handshake },
    { href: "/admin/messenger-management", label: "Messenger Settings", icon: Bot },
  ];
  
  const utilityMenuItems = [
     {
      href: "/settings", 
      label: t("dashboard.navigation.settings"),
      icon: Settings,
    },
  ];


  const renderMenuItem = (item: { href: string, label: string, icon: React.ElementType }) => (
    <SidebarMenuItem key={item.href}>
      <SidebarMenuButton
        asChild
        isActive={pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))}
        tooltip={{ children: item.label, side: "right", className: "ml-2" }}
        className="justify-start"
      >
        <Link href={item.href}>
          <item.icon className="h-5 w-5" />
          <span>{item.label}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );

  return (
    <Sidebar collapsible="icon" variant="sidebar" side="left">
      <SidebarHeader className="p-4">
        <Link href="/dashboard" className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-primary">
            <path d="M6 2L3 6v14c0 1.1.9 2 2 2h14a2 2 0 002-2V6l-3-4H6zM3.8 6h16.4M16 10a4 4 0 11-8 0"/>
          </svg>
          <h1 className="text-xl font-headline font-semibold text-primary group-data-[collapsible=icon]:hidden">
            {t("appName")}
          </h1>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <ScrollArea className="h-full">
          <SidebarMenu>
            {mainMenuItems.map(renderMenuItem)}
          </SidebarMenu>
          
          <SidebarSeparator className="my-2" />
          
          <SidebarGroup>
            <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden text-xs px-2 text-muted-foreground">Features</SidebarGroupLabel>
            <SidebarMenu>
              {featureMenuItems.sort((a, b) => a.label.localeCompare(b.label)).map(renderMenuItem)}
            </SidebarMenu>
          </SidebarGroup>

          {isAdmin && (
            <>
              <SidebarSeparator className="my-2" />
              <SidebarGroup>
                <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden text-xs px-2 text-muted-foreground">Admin Panel</SidebarGroupLabel>
                <SidebarMenu>
                  {adminMenuItems.sort((a, b) => a.label.localeCompare(b.label)).map(renderMenuItem)}
                </SidebarMenu>
              </SidebarGroup>
            </>
          )}
          
          <SidebarSeparator className="my-2" />

          <SidebarMenu>
             {utilityMenuItems.map(renderMenuItem)}
          </SidebarMenu>

        </ScrollArea>
      </SidebarContent>
      <SidebarFooter className="p-4 group-data-[collapsible=icon]:hidden">
        <p className="text-xs text-muted-foreground">&copy; {new Date().getFullYear()} Bhasha Setu</p>
      </SidebarFooter>
    </Sidebar>
  );
}
