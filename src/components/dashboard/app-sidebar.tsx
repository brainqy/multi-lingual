"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, MessageSquareText, Settings, Users } from "lucide-react";
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
} from "@/components/ui/sidebar"; // Assuming the new Sidebar component is here

export function AppSidebar() {
  const pathname = usePathname();
  const { t } = useI18n();

  const menuItems = [
    {
      href: "/dashboard",
      label: t("dashboard.navigation.overview"),
      icon: LayoutDashboard,
    },
    {
      href: "/dashboard/translate",
      label: t("dashboard.navigation.translate"),
      icon: MessageSquareText,
    },
    {
      href: "/dashboard/settings",
      label: t("dashboard.navigation.settings"),
      icon: Settings,
    },
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
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => (
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
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-4 group-data-[collapsible=icon]:hidden">
        <p className="text-xs text-muted-foreground">&copy; {new Date().getFullYear()} Bhasha Setu</p>
      </SidebarFooter>
    </Sidebar>
  );
}
