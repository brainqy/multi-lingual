
// src/contexts/i18n-provider.tsx
"use client";

import type { ReactNode } from 'react';
import React, { createContext, useState, useEffect, useCallback } from 'react';
import type { Translations, NestedTranslations } from '@/types';
import { defaultLocale, locales as availableLocales, Locale } from '@/locales';

import enAuth from '@/locales/en/auth.json';
import enCommon from '@/locales/en/common.json';
import enLayout from '@/locales/en/layout.json';

import hiAuth from '@/locales/hi/auth.json';
import hiCommon from '@/locales/hi/common.json';
import hiLayout from '@/locales/hi/layout.json';

import mrAuth from '@/locales/mr/auth.json';
import mrCommon from '@/locales/mr/common.json';
import mrLayout from '@/locales/mr/layout.json';

// Import all the new split page files
import enAdminDashboard from '@/locales/en/pages/admin-dashboard.json';
import enAffiliates from '@/locales/en/pages/affiliates.json';
import enGamification from '@/locales/en/pages/gamification.json';
import enMain from '@/locales/en/pages/main.json';
import enPlatformSettings from '@/locales/en/pages/platform-settings.json';
import enTenantManagement from '@/locales/en/pages/tenant-management.json';
import enAnnouncementsAdmin from '@/locales/en/pages/announcements-admin.json';
import enContentModeration from '@/locales/en/pages/content-moderation.json';
import enBlogSettingsAdmin from '@/locales/en/pages/blog-settings-admin.json';
import enGamificationRules from '@/locales/en/pages/gamification-rules.json';
import enFeatureRequests from '@/locales/en/pages/feature-requests.json';
import enReferrals from '@/locales/en/pages/referrals.json';
import enUserSettings from '@/locales/en/pages/user-settings.json';
import enDailyChallenge from '@/locales/en/pages/daily-challenge.json';
import enTranslateTool from '@/locales/en/pages/translate-tool.json';
import enAlumniConnect from '@/locales/en/pages/alumni-connect.json';
import enNumberMatchGame from '@/locales/en/pages/number-match-game.json';
import enKbcGame from '@/locales/en/pages/kbc-game.json';
import enPromoCodes from '@/locales/en/pages/promo-codes.json';
import enJobTracker from '@/locales/en/pages/job-tracker.json';
import enManagerDashboard from '@/locales/en/pages/manager-dashboard.json';

import hiAdminDashboard from '@/locales/hi/pages/admin-dashboard.json';
import hiAffiliates from '@/locales/hi/pages/affiliates.json';
import hiGamification from '@/locales/hi/pages/gamification.json';
import hiMain from '@/locales/hi/pages/main.json';
import hiPlatformSettings from '@/locales/hi/pages/platform-settings.json';
import hiTenantManagement from '@/locales/hi/pages/tenant-management.json';
import hiAnnouncementsAdmin from '@/locales/hi/pages/announcements-admin.json';
import hiContentModeration from '@/locales/hi/pages/content-moderation.json';
import hiBlogSettingsAdmin from '@/locales/hi/pages/blog-settings-admin.json';
import hiGamificationRules from '@/locales/hi/pages/gamification-rules.json';
import hiFeatureRequests from '@/locales/hi/pages/feature-requests.json';
import hiReferrals from '@/locales/hi/pages/referrals.json';
import hiUserSettings from '@/locales/hi/pages/user-settings.json';
import hiDailyChallenge from '@/locales/hi/pages/daily-challenge.json';
import hiTranslateTool from '@/locales/hi/pages/translate-tool.json';
import hiAlumniConnect from '@/locales/hi/pages/alumni-connect.json';
import hiNumberMatchGame from '@/locales/hi/pages/number-match-game.json';
import hiKbcGame from '@/locales/hi/pages/kbc-game.json';
import hiPromoCodes from '@/locales/hi/pages/promo-codes.json';
import hiJobTracker from '@/locales/hi/pages/job-tracker.json';
import hiManagerDashboard from '@/locales/hi/pages/manager-dashboard.json';

import mrAdminDashboard from '@/locales/mr/pages/admin-dashboard.json';
import mrAffiliates from '@/locales/mr/pages/affiliates.json';
import mrGamification from '@/locales/mr/pages/gamification.json';
import mrMain from '@/locales/mr/pages/main.json';
import mrPlatformSettings from '@/locales/mr/pages/platform-settings.json';
import mrTenantManagement from '@/locales/mr/pages/tenant-management.json';
import mrAnnouncementsAdmin from '@/locales/mr/pages/announcements-admin.json';
import mrContentModeration from '@/locales/mr/pages/content-moderation.json';
import mrBlogSettingsAdmin from '@/locales/mr/pages/blog-settings-admin.json';
import mrGamificationRules from '@/locales/mr/pages/gamification-rules.json';
import mrFeatureRequests from '@/locales/mr/pages/feature-requests.json';
import mrReferrals from '@/locales/mr/pages/referrals.json';
import mrUserSettings from '@/locales/mr/pages/user-settings.json';
import mrDailyChallenge from '@/locales/mr/pages/daily-challenge.json';
import mrTranslateTool from '@/locales/mr/pages/translate-tool.json';
import mrAlumniConnect from '@/locales/mr/pages/alumni-connect.json';
import mrNumberMatchGame from '@/locales/mr/pages/number-match-game.json';
import mrKbcGame from '@/locales/mr/pages/kbc-game.json';
import mrPromoCodes from '@/locales/mr/pages/promo-codes.json';
import mrJobTracker from '@/locales/mr/pages/job-tracker.json';
import mrManagerDashboard from '@/locales/mr/pages/manager-dashboard.json';

// Merge all page translations
const enPages = {
  ...enAdminDashboard, ...enAffiliates, ...enGamification, ...enMain,
  ...enPlatformSettings, ...enTenantManagement, ...enAnnouncementsAdmin,
  ...enContentModeration, ...enBlogSettingsAdmin, ...enGamificationRules,
  ...enFeatureRequests, ...enReferrals, ...enUserSettings, ...enDailyChallenge,
  ...enTranslateTool, ...enAlumniConnect, ...enNumberMatchGame, ...enKbcGame,
  ...enPromoCodes, ...enJobTracker, ...enManagerDashboard
};
const hiPages = {
  ...hiAdminDashboard, ...hiAffiliates, ...hiGamification, ...hiMain,
  ...hiPlatformSettings, ...hiTenantManagement, ...hiAnnouncementsAdmin,
  ...hiContentModeration, ...hiBlogSettingsAdmin, ...hiGamificationRules,
  ...hiFeatureRequests, ...hiReferrals, ...hiUserSettings, ...hiDailyChallenge,
  ...hiTranslateTool, ...hiAlumniConnect, ...hiNumberMatchGame, ...hiKbcGame,
  ...hiPromoCodes, ...hiJobTracker, ...hiManagerDashboard
};
const mrPages = {
  ...mrAdminDashboard, ...mrAffiliates, ...mrGamification, ...mrMain,
  ...mrPlatformSettings, ...mrTenantManagement, ...mrAnnouncementsAdmin,
  ...mrContentModeration, ...mrBlogSettingsAdmin, ...mrGamificationRules,
  ...mrFeatureRequests, ...mrReferrals, ...mrUserSettings, ...mrDailyChallenge,
  ...mrTranslateTool, ...mrAlumniConnect, ...mrNumberMatchGame, ...mrKbcGame,
  ...mrPromoCodes, ...mrJobTracker, ...mrManagerDashboard
};

const enMergedTranslations: Translations = {
  ...enAuth,
  ...enCommon,
  ...enLayout,
  ...enPages,
};

const hiMergedTranslations: Translations = {
  ...hiAuth,
  ...hiCommon,
  ...hiLayout,
  ...hiPages,
};

const mrMergedTranslations: Translations = {
  ...mrAuth,
  ...mrCommon,
  ...mrLayout,
  ...mrPages,
};


interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, options?: { default?: string } & Record<string, string | number>) => string;
  availableLocales: Record<Locale, string>;
}

export const I18nContext = createContext<I18nContextType | undefined>(undefined);

const translationsData: Record<Locale, Translations> = {
  en: enMergedTranslations,
  mr: mrMergedTranslations,
  hi: hiMergedTranslations,
};

interface I18nProviderProps {
  children: ReactNode;
}

export function I18nProvider({ children }: I18nProviderProps) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    if (typeof window !== 'undefined') {
      const storedLocale = localStorage.getItem('locale') as Locale | null;
      if (storedLocale && availableLocales[storedLocale]) {
        return storedLocale;
      }
    }
    return defaultLocale;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('locale', locale);
      document.documentElement.lang = locale;
    }
  }, [locale]);

  const setLocale = useCallback((newLocale: Locale) => {
    if (availableLocales[newLocale as keyof typeof availableLocales]) {
      setLocaleState(newLocale);
    }
  }, []);

  const t = useCallback((key: string, options?: ({ default?: string } & Record<string, string | number>)): string => {
    const findTranslation = (data: Translations) => {
      const keys = key.split('.');
      let current: string | Translations | NestedTranslations | Array<string | NestedTranslations> = data;
      for (const k of keys) {
        if (typeof current === 'object' && current !== null && k in current) {
          current = (current as NestedTranslations)[k];
        } else {
          return undefined;
        }
      }
      return typeof current === 'string' ? current : undefined;
    };
    
    let result = findTranslation(translationsData[locale]);
    
    if (result === undefined) {
      result = findTranslation(translationsData[defaultLocale]);
    }

    if (result === undefined) {
      result = options?.default ?? key;
    }

    // Handle replacements
    if (options) {
      result = Object.entries(options).reduce((acc, [placeholder, value]) => {
        if (placeholder === 'default') return acc;
        return acc.replace(`{${placeholder}}`, String(value));
      }, result);
    }
    
    return result;
  }, [locale]);


  return (
    <I18nContext.Provider value={{ locale, setLocale, t, availableLocales }}>
      {children}
    </I18nContext.Provider>
  );
}
