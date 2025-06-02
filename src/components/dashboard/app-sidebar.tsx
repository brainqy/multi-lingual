
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, MessageSquareText, Settings, Users, Activity, ShieldCheck, Mic, FileText, Users2, CalendarDays, Rss, Mail, BookOpen, Calendar, Lightbulb, Image, Gamepad2, ClipboardList, ListOrdered, Briefcase, Target, Trophy, Video, Files, UserCircle, MessageSquare } from "lucide-react";
import { useI18n } from "@/hooks/use-i18n";
import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  ScrollArea, // Assuming ScrollArea is available or part of Sidebar
} from "@/components/ui/sidebar"; 

export function AppSidebar() {
  const pathname = usePathname();
  const { t } = useI18n();

  // Existing main navigation items
  const mainMenuItems = [
    {
      href: "/dashboard",
      label: t("dashboard.navigation.overview"),
      icon: LayoutDashboard,
    },
    {
      href: "/translate", // Updated path
      label: t("dashboard.navigation.translate"),
      icon: MessageSquareText,
    },
    {
      href: "/settings", // Updated path
      label: t("dashboard.navigation.settings"),
      icon: Settings,
    },
  ];

  // New feature navigation items
  const featureMenuItems = [
    { href: "/activity-log", label: "Activity Log", icon: Activity },
    { href: "/admin", label: "Admin", icon: ShieldCheck },
    { href: "/affiliates", label: "Affiliates", icon: Users },
    { href: "/ai-mock-interview", label: "AI Mock Interview", icon: Mic },
    { href: "/ai-resume-writer", label: "AI Resume Writer", icon: FileText },
    { href: "/alumni-connect", label: "Alumni Connect", icon: Users2 },
    { href: "/appointments", label: "Appointments", icon: CalendarDays },
    { href: "/blog", label: "Blog", icon: Rss },
    { href: "/community-feed", label: "Community Feed", icon: MessageSquare },
    { href: "/cover-letter-generator", label: "Cover Letter Generator", icon: Mail }, // Using Mail icon as in component
    { href: "/documentation", label: "Documentation", icon: BookOpen },
    { href: "/events", label: "Events", icon: Calendar },
    { href: "/feature-requests", label: "Feature Requests", icon: Lightbulb },
    { href: "/gallery", label: "Gallery", icon: Image },
    { href: "/gamification", label: "Gamification", icon: Gamepad2 },
    { href: "/interview-prep", label: "Interview Prep", icon: ClipboardList },
    // Quiz is a sub-page of interview-prep, so not in main sidebar here
    { href: "/interview-queue", label: "Interview Queue", icon: ListOrdered },
    { href: "/job-board", label: "Job Board", icon: Briefcase },
    { href: "/job-tracker", label: "Job Tracker", icon: Target },
    { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
    { href: "/live-interview", label: "Live Interview", icon: Video },
    { href: "/my-resumes", label: "My Resumes", icon: Files },
    { href: "/profile", label: "Profile", icon: UserCircle },
  ];


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
      <SidebarContent> {/* Ensure SidebarContent can handle overflow if using ScrollArea inside */}
        {/* <ScrollArea className="h-full">  You might wrap SidebarMenu in ScrollArea if content exceeds height */}
          <SidebarMenu>
            {mainMenuItems.map((item) => (
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
            ))}
            <SidebarSeparator className="my-4" />
            {featureMenuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href || pathname.startsWith(item.href + '/')}
                tooltip={{ children: item.label, side: "right", className: "ml-2" }}
                className="justify-start"
              >
                <Link href={item.href}>
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
          </SidebarMenu>
        {/* </ScrollArea> */}
      </SidebarContent>
      <SidebarFooter className="p-4 group-data-[collapsible=icon]:hidden">
        <p className="text-xs text-muted-foreground">&copy; {new Date().getFullYear()} Bhasha Setu</p>
      </SidebarFooter>
    </Sidebar>
  );
}

// Ensure SidebarSeparator and other necessary components are correctly imported or defined within ui/sidebar
const SidebarSeparator = ({className}: {className?: string}) => <hr className={cn("border-border my-2", className)} />;

