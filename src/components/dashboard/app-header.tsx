
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
    if (pathname === "/dashboard") return t("dashboard.navigation.overview");
    if (pathname === "/translate") return t("dashboard.navigation.translate");
    if (pathname === "/settings") return t("dashboard.navigation.settings");

    // For new feature pages, derive title from path
    // Example: /activity-log -> Activity Log
    const pathSegments = pathname.split('/').filter(Boolean);
    if (pathSegments.length > 0 && 
        !["dashboard", "translate", "settings"].includes(pathSegments[0])) {
      // Assuming top-level feature pages like /activity-log, /blog, etc.
      // For nested pages like /interview-prep/quiz, it will take the parent.
      const baseFeaturePath = pathSegments[0];
      const titleFromPath = kebabToTitleCase(baseFeaturePath);
      // You might want to add specific translations for these in your i18n files
      // e.g., t(`appFeatures.${baseFeaturePath}.title`) or similar
      return titleFromPath; 
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
