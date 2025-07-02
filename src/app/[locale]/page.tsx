// This page is simplified to resolve an i18n routing conflict.
// The app uses a context-based provider for internationalization.
import { localeKeys } from '@/locales';

export function generateStaticParams() {
  return localeKeys.map((locale) => ({ locale }));
}

export default function LocalizedRootPage() {
  return null;
}
