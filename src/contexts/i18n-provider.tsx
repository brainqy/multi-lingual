// src/contexts/i18n-provider.tsx
"use client";

import type { ReactNode } from 'react';
import React, { createContext, useState, useEffect, useCallback } from 'react';
import type { Locale, Translations, NestedTranslations } from '@/types';
import { defaultLocale, locales as availableLocales } from '@/locales';

import enTranslations from '@/locales/en.json';
import mrTranslations from '@/locales/mr.json';
import hiTranslations from '@/locales/hi.json';

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, replacements?: Record<string, string | number>) => string;
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
    if (availableLocales[newLocale]) {
      setLocaleState(newLocale);
    }
  }, []);

  const t = useCallback((key: string, replacements?: Record<string, string | number>): string => {
    const keys = key.split('.');
    let current: string | Translations | NestedTranslations = translationsData[locale] || translationsData[defaultLocale];

    for (const k of keys) {
      if (typeof current === 'object' && current !== null && k in current) {
        current = (current as NestedTranslations)[k];
      } else {
        return key; // Key not found
      }
    }
    
    if (typeof current === 'string') {
      if (replacements) {
        return Object.entries(replacements).reduce((acc, [placeholder, value]) => {
          return acc.replace(`{${placeholder}}`, String(value));
        }, current);
      }
      return current;
    }
    return key; // Should be a string if found
  }, [locale]);

  return (
    <I18nContext.Provider value={{ locale, setLocale, t, availableLocales }}>
      {children}
    </I18nContext.Provider>
  );
}
