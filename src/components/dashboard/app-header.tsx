"use client";

import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { UserNav } from "@/components/layout/user-nav";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useI18n } from "@/hooks/use-i18n";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function AppHeader() {
  const { t } = useI18n();
  const pathname = usePathname();

  const getPageTitle = () => {
    if (pathname === "/dashboard") return t("dashboard.navigation.overview");
    if (pathname.startsWith("/dashboard/translate")) return t("dashboard.navigation.translate");
    if (pathname.startsWith("/dashboard/settings")) return t("dashboard.navigation.settings");
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
