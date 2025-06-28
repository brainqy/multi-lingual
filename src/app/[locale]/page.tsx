// This page is simplified to resolve an i18n routing conflict.
// The app uses a context-based provider for internationalization.
import { locales } from '@/types';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default function LocalizedRootPage() {
  return null;
}
