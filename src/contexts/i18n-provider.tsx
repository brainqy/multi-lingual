// src/contexts/i18n-provider.tsx
"use client";

import type { ReactNode } from 'react';
import React, { createContext, useState, useEffect, useCallback } from 'react';
import type { Translations, NestedTranslations } from '@/types';
import { defaultLocale, locales as availableLocales, Locale } from '@/locales';

import enTranslations from '@/locales/en.json';
import mrTranslations from '@/locales/mr.json';
import hiTranslations from '@/locales/hi.json';

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, options?: { default?: string } & Record<string, string | number>) => string;
  availableLocales: Record<Locale, string>;
}

export const I18nContext = createContext<I18nContextType | undefined>(undefined);

const translationsData: Record<Locale, Translations> = {
  en: enTranslations,
  mr: mrTranslations,
  hi: hiTranslations,
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
      let current: string | Translations | NestedTranslations = data;
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
