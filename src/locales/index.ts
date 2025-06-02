import type { Locale } from '@/types';

export const locales: Record<Locale, string> = {
  en: 'English',
  mr: 'मराठी', // Marathi
  hi: 'हिन्दी', // Hindi
};

export const defaultLocale: Locale = 'en';
