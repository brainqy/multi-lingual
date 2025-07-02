// src/locales/index.ts

// Define the record of locales and their display names
export const locales = {
  en: 'English',
  mr: 'मराठी', // Marathi
  hi: 'हिन्दी', // Hindi
} as const;

// Infer the Locale type from the keys of the locales object
export type Locale = keyof typeof locales;

// Create an array of locale keys for use in places like generateStaticParams
export const localeKeys = Object.keys(locales) as Locale[];

// Define the default locale
export const defaultLocale: Locale = 'en';
