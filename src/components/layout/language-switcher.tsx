"use client";

import { Languages } from "lucide-react";
import { useI18n } from "@/hooks/use-i18n";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Locale } from "@/locales";

export function LanguageSwitcher() {
  const { locale, setLocale, availableLocales, t } = useI18n();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Languages className="h-5 w-5" />
          <span className="sr-only">Change language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {Object.entries(availableLocales).map(([key, name]) => (
          <DropdownMenuItem
            key={key}
            onClick={() => setLocale(key as Locale)}
            className={locale === key ? "bg-accent text-accent-foreground" : ""}
          >
            {name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
