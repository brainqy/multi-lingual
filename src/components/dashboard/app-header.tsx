
"use client";

import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { UserNav } from "@/components/layout/user-nav";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useI18n } from "@/hooks/use-i18n";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

// Helper function to convert kebab-case to Title Case
function kebabToTitleCase(kebabStr: string): string {
  return kebabStr
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function AppHeader() {
  const { t } = useI18n();
  const pathname = usePathname();

  const getPageTitle = () => {
    // Handle base (app) routes
    if (pathname === "/dashboard") return t("dashboard.navigation.overview");
    if (pathname === "/translate") return t("dashboard.navigation.translate");
    if (pathname === "/settings") return t("dashboard.navigation.settings");

    // Handle admin routes
    if (pathname.startsWith("/admin/")) {
      const adminSubPath = pathname.substring("/admin/".length);
      if (adminSubPath === "dashboard") return "Admin Dashboard";
      if (adminSubPath === "user-management") return "User Management";
      if (adminSubPath === "tenants") return "Tenant Management";
      if (adminSubPath === "tenant-onboarding") return "Tenant Onboarding";
      if (adminSubPath === "platform-settings") return "Platform Settings";
      if (adminSubPath === "content-moderation") return "Content Moderation";
      if (adminSubPath === "announcements") return "Announcements Management";
      if (adminSubPath === "blog-settings") return "Blog Settings";
      if (adminSubPath === "gallery-management") return "Gallery Management";
      if (adminSubPath === "gamification-rules") return "Gamification Rules";
      if (adminSubPath === "affiliate-management") return "Affiliate Management";
      if (adminSubPath === "messenger-management") return "Messenger Settings";
      return kebabToTitleCase(adminSubPath); // Fallback for other admin pages
    }
    
    // For other feature pages under (app)
    const pathSegments = pathname.split('/').filter(Boolean);
    if (pathSegments.length > 0 && 
        !["dashboard", "translate", "settings", "admin"].includes(pathSegments[0])) {
      const baseFeaturePath = pathSegments[0];
      // For nested feature pages like /interview-prep/quiz
      if (pathSegments.length > 1 && baseFeaturePath === "interview-prep" && pathSegments[1] === "quiz") {
        return "Interview Quiz";
      }
      return kebabToTitleCase(baseFeaturePath);
    }
    
    return t("appName");
  }

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-card px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
       <SidebarTrigger className="md:hidden" />
      <h1 className={cn("text-xl font-headline font-semibold", "md:text-2xl")}>
        {getPageTitle()}
      </h1>
      <div className="ml-auto flex items-center gap-2">
        <LanguageSwitcher />
        <UserNav />
      </div>
    </header>
  );
}
